'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';

export default function TermsPage() {
  const { language } = useApp();
  const t = getTranslation(language);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {t.termsOfServiceTitle || 'Terms of Service'}
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          {t.appName} • {t.bengaluruPilotBadge}
        </p>
      </div>

      <div className="prose dark:prose-invert text-xs space-y-5 text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            1. {t.termsHeading1 || 'Nature of Service'}
          </h3>
          <p>
            {t.termsBody1 || 'Urban Driver provides an introductory and mobility facilitation technology platform that enables vehicle owners (“Customers”) and their authorized family guardians to engage independent professional drivers for personal, non-commercial passenger vehicles owned by the customer.'}
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            2. {t.termsHeading2 || 'Vehicle Suitability & Roadworthiness'}
          </h3>
          <p>
            {t.termsBody2 || 'The Customer warrants that the registered vehicle is mechanically sound, lawfully registered with valid registration certificates, pollution clearance (PUC), and comprehensive motor vehicle insurance covering third-party liabilities as required under the Motor Vehicles Act.'}
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            3. {t.termsHeading3 || 'Family Guardian Consent & Authorization'}
          </h3>
          <p>
            {t.termsBody3 || 'Family members accessing the Family Guardian Portal must have the explicit authorization of the registered vehicle owner. All trip booking, fare payments, and telematics tracking performed by a guardian are conducted under the express consent of the customer.'}
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            4. {t.termsHeading4 || 'No Guaranteed Insurance or Absolute Safety'}
          </h3>
          <p>
            {t.termsBody4 || 'While Urban Driver exercises thorough document screening and criminal background checks through verified databases, the customer’s primary comprehensive motor insurance policy remains applicable.'}
          </p>
        </div>
      </div>
    </div>
  );
}
