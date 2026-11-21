'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { PhoneCall, MessageCircle, ShieldCheck, Clock, LifeBuoy } from 'lucide-react';

export default function FamilySupportPage() {
  const { language } = useApp();
  const t = getTranslation(language);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.familyCareTag}: {t.supportTitle}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.supportSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.callSupport}
          </h3>
          <p className="text-xs text-slate-500">
            {t.assistedCallDesc}
          </p>
          <a
            href="tel:18005550199"
            className="inline-block px-6 py-3 bg-brand-teal text-white font-bold rounded-xl text-sm shadow hover:bg-brand-tealDark"
          >
            {t.callSupport}: {t.callHelplineNumber}
          </a>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.assistedBookWhatsApp}
          </h3>
          <p className="text-xs text-slate-500">
            {t.assistedSub}
          </p>
          <a
            href="https://wa.me/919876543210?text=Hello%20Urban%20Driver%20Support"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow hover:bg-emerald-700"
          >
            WhatsApp (+91 98765 43210)
          </a>
        </div>
      </div>
    </div>
  );
}
