// Web Speech API wrapper for Multilingual Voice Support and Senior Citizen Mode
import { LanguageCode } from './i18n';

const BROWSER_LANG_MAP: Record<LanguageCode, string> = {
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

export function speakText(text: string, lang: LanguageCode = 'en'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.info('[Voice TTS] Speech synthesis not supported on this browser.');
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // Calm, respectful, clear cadence for seniors
    utterance.pitch = 1.0;
    utterance.lang = BROWSER_LANG_MAP[lang] || 'en-IN';
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[Voice TTS Error]', err);
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function startListening(
  onResult: (text: string) => void,
  onError?: (error: string) => void,
  lang: LanguageCode = 'en'
): () => void {
  if (!isSpeechRecognitionSupported()) {
    onError?.('Speech recognition is not supported in this browser.');
    return () => {};
  }

  try {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = BROWSER_LANG_MAP[lang] || 'en-IN';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      console.warn('[Voice STT Error]', event.error);
      onError?.(event.error);
    };

    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  } catch (err: any) {
    onError?.(err?.message || 'Error initializing voice input');
    return () => {};
  }
}
