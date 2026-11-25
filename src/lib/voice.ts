// Web Speech API wrapper for Multilingual Voice Support and Senior Citizen Mode
import { LanguageCode } from './i18n';
import { speechService, SPEECH_LANG_MAP } from './speechService';

export function speakText(text: string, lang: LanguageCode = 'en'): void {
  speechService.speak(text, lang);
}

export function stopSpeaking(): void {
  speechService.stop();
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

  // Ensure TTS is stopped before starting microphone recognition so they never conflict
  speechService.stop();

  try {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = SPEECH_LANG_MAP[lang] || 'en-IN';

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
