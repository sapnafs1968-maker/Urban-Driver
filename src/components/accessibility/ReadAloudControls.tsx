'use client';

import React from 'react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { getTranslation } from '@/lib/i18n';
import { Volume2, Pause, Play, Square, AlertCircle } from 'lucide-react';

interface ReadAloudControlsProps {
  variant?: 'compact' | 'bar' | 'senior';
  customText?: string;
}

export const ReadAloudControls: React.FC<ReadAloudControlsProps> = ({
  variant = 'bar',
  customText,
}) => {
  const {
    status,
    isSupported,
    hasMatchingVoice,
    currentChunkIndex,
    totalChunks,
    language,
    readPage,
    speak,
    pause,
    resume,
    stop,
  } = useTextToSpeech();

  const t = getTranslation(language);

  const isReading = status === 'reading' || status === 'voice_unavailable';
  const isPaused = status === 'paused';

  const handleStart = () => {
    if (customText) {
      speak(customText);
    } else {
      readPage();
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'reading':
        return `${t.ttsReading || 'Reading'}${totalChunks > 1 ? ` (${currentChunkIndex}/${totalChunks})` : ''}`;
      case 'paused':
        return t.ttsPaused || 'Paused';
      case 'finished':
        return t.ttsFinished || 'Finished';
      case 'voice_unavailable':
        return t.ttsVoiceUnavailable || 'Voice unavailable (using fallback)';
      case 'unsupported':
        return t.ttsUnsupported || 'Speech not supported on this browser';
      case 'error':
        return t.ttsError || 'Unable to read this content';
      default:
        return t.ttsReady || 'Ready to read';
    }
  };

  const statusColors =
    status === 'reading'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : status === 'paused'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : status === 'error' || status === 'unsupported'
      ? 'bg-rose-100 text-rose-800 border-rose-200'
      : status === 'voice_unavailable'
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-slate-100 text-slate-700 border-slate-200';

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1.5" data-no-read-aloud>
        <button
          type="button"
          onClick={isReading ? pause : isPaused ? resume : handleStart}
          disabled={!isSupported}
          className="min-h-[40px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-full border border-slate-200 text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          title={t.readAloud || 'Read Aloud'}
        >
          {isReading ? (
            <Pause className="w-3.5 h-3.5 text-brand-teal" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-brand-teal" />
          )}
          <span className="hidden lg:inline">
            {isReading ? t.ttsPause || 'Pause' : isPaused ? t.ttsResume || 'Resume' : t.readAloud || 'Read Aloud'}
          </span>
        </button>
        {(isReading || isPaused) && (
          <button
            type="button"
            onClick={stop}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full border border-rose-200 transition-all active:scale-95"
            title={t.ttsStop || 'Stop'}
            aria-label={t.ttsStop || 'Stop'}
          >
            <Square className="w-3.5 h-3.5 fill-rose-600" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      data-no-read-aloud
      className={`rounded-2xl border p-3.5 sm:p-4 space-y-2.5 ${
        variant === 'senior'
          ? 'bg-slate-900 text-white border-slate-700 shadow-lg'
          : 'bg-white text-slate-900 border-slate-200 shadow-xs'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Volume2
            className={`w-5 h-5 shrink-0 ${
              variant === 'senior' ? 'text-brand-tealLight' : 'text-brand-teal'
            }`}
          />
          <span className="font-bold text-sm sm:text-base">
            {t.readAloud || 'Read Aloud'}
          </span>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors}`}
          role="status"
          aria-live="polite"
        >
          {getStatusLabel()}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleStart}
          disabled={!isSupported || isReading}
          className="min-h-[44px] px-4 py-2 bg-brand-teal hover:bg-brand-tealDark disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Volume2 className="w-4 h-4" />
          <span>{t.ttsReadPage || t.readAloud || 'Read Aloud'}</span>
        </button>

        <button
          type="button"
          onClick={pause}
          disabled={!isReading}
          className="min-h-[44px] px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Pause className="w-4 h-4" />
          <span>{t.ttsPause || 'Pause'}</span>
        </button>

        <button
          type="button"
          onClick={resume}
          disabled={!isPaused}
          className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Play className="w-4 h-4" />
          <span>{t.ttsResume || 'Resume'}</span>
        </button>

        <button
          type="button"
          onClick={stop}
          disabled={!isReading && !isPaused}
          className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Square className="w-4 h-4" />
          <span>{t.ttsStop || 'Stop'}</span>
        </button>
      </div>

      {(!isSupported || status === 'error' || (!hasMatchingVoice && status === 'voice_unavailable')) && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{getStatusLabel()}</span>
        </div>
      )}
    </div>
  );
};
