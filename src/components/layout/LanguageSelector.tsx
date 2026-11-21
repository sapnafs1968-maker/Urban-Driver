'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/store';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/i18n';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'prominent' | 'compact';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-brand-teal/40 ${
          variant === 'prominent'
            ? 'px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700 text-sm hover:border-brand-teal'
            : variant === 'compact'
            ? 'px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs border border-slate-700/80'
            : 'px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 text-xs backdrop-blur-md'
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-brand-teal shrink-0" />
        <span className="font-semibold tracking-wide">
          {activeLang.nativeName}
        </span>
        <span className="text-[11px] opacity-60 hidden sm:inline">
          ({activeLang.englishName})
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-60 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl z-50 py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto">
          <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
            Select Language (భాష / भाषा)
          </div>

          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-brand-teal/10 text-brand-teal font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.nativeName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.englishName}
                    </span>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-brand-teal shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
