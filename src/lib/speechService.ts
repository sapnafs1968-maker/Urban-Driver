// Reusable client-side Web Speech API (Text-to-Speech) service
// Handles async voice loading, BCP-47 language mapping, DOM content extraction,
// sentence-safe chunking, Pause/Resume/Stop, and clean error reporting.

import { LanguageCode } from './i18n';

export const SPEECH_LANG_MAP: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  ur: 'ur-IN',
};

export type TtsStatus =
  | 'ready'
  | 'reading'
  | 'paused'
  | 'finished'
  | 'voice_unavailable'
  | 'unsupported'
  | 'error';

export interface TtsSnapshot {
  status: TtsStatus;
  isSupported: boolean;
  activeLang: LanguageCode;
  activeVoiceName: string | null;
  hasMatchingVoice: boolean;
  currentChunkIndex: number;
  totalChunks: number;
  errorCode: string | null;
}

type TtsListener = (snapshot: TtsSnapshot) => void;

class SpeechService {
  private voices: SpeechSynthesisVoice[] = [];
  private voicesInitialized = false;
  private listeners = new Set<TtsListener>();
  private chunks: string[] = [];
  private chunkIndex = 0;
  private isCancelled = false;
  private isPausedState = false;
  private activeSessionId = 0;
  private activeLang: LanguageCode = 'en';

  private snapshot: TtsSnapshot = {
    status: 'ready',
    isSupported: false,
    activeLang: 'en',
    activeVoiceName: null,
    hasMatchingVoice: true,
    currentChunkIndex: 0,
    totalChunks: 0,
    errorCode: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    const supported = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
    this.snapshot.isSupported = supported;
    if (!supported) {
      this.snapshot.status = 'unsupported';
      return;
    }

    if (!this.voicesInitialized) {
      this.voicesInitialized = true;
      this.loadVoices();
      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', this.handleVoicesChanged);
      } else {
        window.speechSynthesis.onvoiceschanged = this.handleVoicesChanged;
      }
    }
  }

  private handleVoicesChanged = () => {
    this.loadVoices();
    this.emit();
  };

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const loaded = window.speechSynthesis.getVoices();
      if (loaded && loaded.length > 0) {
        this.voices = loaded;
      }
    } catch {
      // Ignore browser quirks during early init
    }
  }

  public getSnapshot(): TtsSnapshot {
    if (typeof window !== 'undefined' && !this.voicesInitialized) {
      this.init();
    }
    return { ...this.snapshot };
  }

  public subscribe(listener: TtsListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateSnapshot(partial: Partial<TtsSnapshot>) {
    this.snapshot = { ...this.snapshot, ...partial };
    this.emit();
  }

  private emit() {
    const copy = { ...this.snapshot };
    this.listeners.forEach((fn) => fn(copy));
  }

  /**
   * Selects best available voice for the given LanguageCode.
   * Prefers Indian regional voice (e.g. hi-IN, ta-IN, en-IN), then language prefix, then fallback.
   */
  public selectVoiceForLanguage(lang: LanguageCode): {
    voice: SpeechSynthesisVoice | null;
    hasExactOrLangMatch: boolean;
    bcp47: string;
  } {
    this.loadVoices();
    const bcp47 = SPEECH_LANG_MAP[lang] || 'en-IN';
    const langPrefix = bcp47.split('-')[0].toLowerCase();

    if (this.voices.length === 0) {
      return { voice: null, hasExactOrLangMatch: false, bcp47 };
    }

    // 1. Exact locale match (e.g. hi-IN, ta-IN, en-IN)
    const exactMatch = this.voices.find(
      (v) => v.lang.toLowerCase().replace('_', '-') === bcp47.toLowerCase()
    );
    if (exactMatch) {
      return { voice: exactMatch, hasExactOrLangMatch: true, bcp47 };
    }

    // 2. Language prefix match (e.g. hi, ta, en-US)
    const prefixMatch = this.voices.find((v) =>
      v.lang.toLowerCase().startsWith(langPrefix)
    );
    if (prefixMatch) {
      return { voice: prefixMatch, hasExactOrLangMatch: true, bcp47 };
    }

    // 3. Fallback to default browser voice
    const defaultVoice = this.voices.find((v) => v.default) || this.voices[0] || null;
    return {
      voice: defaultVoice,
      hasExactOrLangMatch: false,
      bcp47,
    };
  }

  /**
   * Extracts clean, logical, non-duplicate readable text from [data-read-aloud] containers
   * or falls back to <main>.
   */
  public extractReadablePageContent(): string {
    if (typeof document === 'undefined') return '';

    const designated = Array.from(document.querySelectorAll('[data-read-aloud]'));
    const roots: Element[] =
      designated.length > 0
        ? designated
        : Array.from(document.querySelectorAll('main')).slice(0, 1);

    if (roots.length === 0 && document.body) {
      roots.push(document.body);
    }

    const collected: string[] = [];
    const seen = new Set<string>();

    const isHidden = (el: Element): boolean => {
      if (el.getAttribute('aria-hidden') === 'true') return true;
      if (el.hasAttribute('data-no-read-aloud')) return true;
      if (typeof window !== 'undefined') {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return true;
      }
      return false;
    };

    const walk = (node: Element) => {
      if (isHidden(node)) return;
      const tag = node.tagName.toLowerCase();

      // Skip navigation chrome, inputs, buttons, scripts, SVGs
      if (
        ['nav', 'header', 'footer', 'script', 'style', 'noscript', 'svg', 'button', 'input', 'select', 'textarea'].includes(
          tag
        )
      ) {
        return;
      }

      // Leaf/semantic text blocks
      const isSemanticBlock =
        ['h1', 'h2', 'h3', 'h4', 'p', 'label', 'li'].includes(tag) ||
        node.hasAttribute('data-read-aloud-text');

      if (isSemanticBlock) {
        // Clone and strip buttons/hidden children before reading textContent
        const clone = node.cloneNode(true) as Element;
        clone
          .querySelectorAll('button, input, select, textarea, svg, [aria-hidden="true"], [data-no-read-aloud]')
          .forEach((child) => child.remove());

        const text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
        if (text.length > 1 && !seen.has(text)) {
          seen.add(text);
          collected.push(text);
        }
        return;
      }

      for (const child of Array.from(node.children)) {
        walk(child);
      }
    };

    roots.forEach(walk);
    return collected.join('. ');
  }

  /**
   * Splits long text into manageable sentence-safe chunks (max ~180 chars)
   * without splitting words.
   */
  public chunkText(text: string, maxLen = 180): string[] {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) return [];

    const sentences = clean.split(/(?<=[.!?।॥])\s+/);
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if (sentence.length <= maxLen) {
        if ((current + ' ' + sentence).trim().length <= maxLen) {
          current = (current + ' ' + sentence).trim();
        } else {
          if (current) chunks.push(current);
          current = sentence;
        }
      } else {
        // Long sentence: split on words cleanly
        if (current) {
          chunks.push(current);
          current = '';
        }
        const words = sentence.split(' ');
        for (const word of words) {
          if ((current + ' ' + word).trim().length <= maxLen) {
            current = (current + ' ' + word).trim();
          } else {
            if (current) chunks.push(current);
            current = word;
          }
        }
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  public readPage(lang: LanguageCode): void {
    const text = this.extractReadablePageContent();
    if (!text) {
      this.updateSnapshot({
        status: 'error',
        activeLang: lang,
        errorCode: 'empty_content',
      });
      return;
    }
    this.speak(text, lang);
  }

  public speak(text: string, lang: LanguageCode = 'en'): void {
    if (typeof window === 'undefined') return;
    this.init();

    if (!this.snapshot.isSupported) {
      this.updateSnapshot({
        status: 'unsupported',
        activeLang: lang,
        errorCode: 'unsupported',
      });
      return;
    }

    const cleanText = (text || '').trim();
    if (!cleanText) {
      this.updateSnapshot({
        status: 'error',
        activeLang: lang,
        errorCode: 'empty_content',
      });
      return;
    }

    // Cancel any existing speech cleanly
    this.stopInternal();

    this.activeSessionId += 1;
    const sessionId = this.activeSessionId;
    this.activeLang = lang;
    this.isCancelled = false;
    this.isPausedState = false;

    const { voice, hasExactOrLangMatch, bcp47 } = this.selectVoiceForLanguage(lang);

    // If non-English language selected and browser has voices loaded, check if matching voice exists
    if (!hasExactOrLangMatch && this.voices.length > 0 && lang !== 'en') {
      // Still allow fallback attempt or inform user if no regional voice installed
      this.updateSnapshot({
        hasMatchingVoice: false,
        activeVoiceName: voice?.name || null,
        activeLang: lang,
      });
    } else {
      this.updateSnapshot({
        hasMatchingVoice: true,
        activeVoiceName: voice?.name || null,
        activeLang: lang,
      });
    }

    this.chunks = this.chunkText(cleanText, 180);
    this.chunkIndex = 0;

    if (this.chunks.length === 0) {
      this.updateSnapshot({ status: 'error', errorCode: 'empty_content' });
      return;
    }

    this.updateSnapshot({
      status: !hasExactOrLangMatch && this.voices.length > 0 && lang !== 'en' ? 'voice_unavailable' : 'reading',
      currentChunkIndex: 1,
      totalChunks: this.chunks.length,
      errorCode: null,
    });

    this.speakNextChunk(sessionId, bcp47, voice);
  }

  private speakNextChunk(
    sessionId: number,
    bcp47: string,
    voice: SpeechSynthesisVoice | null
  ) {
    if (this.isCancelled || sessionId !== this.activeSessionId) return;
    if (this.chunkIndex >= this.chunks.length) {
      this.updateSnapshot({
        status: 'finished',
        currentChunkIndex: this.chunks.length,
      });
      return;
    }

    try {
      const textChunk = this.chunks[this.chunkIndex];
      const utterance = new SpeechSynthesisUtterance(textChunk);
      utterance.lang = bcp47;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        if (this.isCancelled || sessionId !== this.activeSessionId) return;
        if (!this.isPausedState) {
          this.updateSnapshot({
            status:
              !this.snapshot.hasMatchingVoice && this.activeLang !== 'en'
                ? 'voice_unavailable'
                : 'reading',
            currentChunkIndex: this.chunkIndex + 1,
            totalChunks: this.chunks.length,
            errorCode: null,
          });
        }
      };

      utterance.onend = () => {
        if (this.isCancelled || sessionId !== this.activeSessionId) return;
        this.chunkIndex += 1;
        if (this.chunkIndex < this.chunks.length) {
          this.speakNextChunk(sessionId, bcp47, voice);
        } else {
          this.updateSnapshot({
            status: 'finished',
            currentChunkIndex: this.chunks.length,
          });
        }
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        // Ignore intentional cancel/interrupted errors
        if (
          this.isCancelled ||
          sessionId !== this.activeSessionId ||
          event.error === 'canceled' ||
          event.error === 'interrupted'
        ) {
          return;
        }
        this.updateSnapshot({
          status: 'error',
          errorCode: event.error || 'synthesis_error',
        });
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.updateSnapshot({
        status: 'error',
        errorCode: 'synthesis_failed',
      });
    }
  }

  public pause(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.snapshot.status === 'reading' || this.snapshot.status === 'voice_unavailable') {
      this.isPausedState = true;
      try {
        window.speechSynthesis.pause();
      } catch {}
      this.updateSnapshot({ status: 'paused' });
    }
  }

  public resume(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.snapshot.status === 'paused') {
      this.isPausedState = false;
      try {
        window.speechSynthesis.resume();
      } catch {}
      this.updateSnapshot({ status: 'reading' });
    }
  }

  private stopInternal(): void {
    this.isCancelled = true;
    this.isPausedState = false;
    this.activeSessionId += 1;
    this.chunks = [];
    this.chunkIndex = 0;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  public stop(): void {
    this.stopInternal();
    this.updateSnapshot({
      status: this.snapshot.isSupported ? 'ready' : 'unsupported',
      currentChunkIndex: 0,
      totalChunks: 0,
      errorCode: null,
    });
  }
}

export const speechService = new SpeechService();
