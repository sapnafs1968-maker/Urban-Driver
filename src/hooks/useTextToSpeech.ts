'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { speechService, TtsSnapshot } from '@/lib/speechService';

export function useTextToSpeech() {
  const { language } = useApp();
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState<TtsSnapshot>(() => speechService.getSnapshot());

  useEffect(() => {
    const unsubscribe = speechService.subscribe(setSnapshot);
    return () => {
      unsubscribe();
    };
  }, []);

  // Stop speech when navigating to another page
  useEffect(() => {
    speechService.stop();
  }, [pathname]);

  // Stop active speech if user switches website language during playback
  useEffect(() => {
    speechService.stop();
  }, [language]);

  const readPage = useCallback(() => {
    speechService.readPage(language);
  }, [language]);

  const speak = useCallback(
    (text: string) => {
      speechService.speak(text, language);
    },
    [language]
  );

  const pause = useCallback(() => {
    speechService.pause();
  }, []);

  const resume = useCallback(() => {
    speechService.resume();
  }, []);

  const stop = useCallback(() => {
    speechService.stop();
  }, []);

  return {
    ...snapshot,
    language,
    readPage,
    speak,
    pause,
    resume,
    stop,
  };
}
