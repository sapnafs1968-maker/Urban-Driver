'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';

export default function PrivacyPolicyPage() {
  const { language } = useApp();
  const t = getTranslation(language);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {t.privacyPolicyTitle || 'Privacy & Telematics Policy'}
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          {t.appName} • {t.bengaluruPilotBadge}
        </p>
      </div>

      <div className="prose dark:prose-invert text-xs space-y-5 text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            1. {t.privacyHeading1 || 'Data Minimization & Confidentiality'}
          </h3>
          <p>
            {t.privacyBody1 || 'Urban Driver collects only information necessary to ensure safe, vehicle-compatible journeys and authorized family coordination. We do not sell or monetize personal travel history or contact records.'}
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            2. {t.privacyHeading2 || 'Geolocation & Trip Telematics'}
          </h3>
          <p>
            {t.privacyBody2 || 'Driver and passenger geolocation data is captured strictly during active booked journeys between pickup confirmation and destination arrival. Telematics sharing is immediately terminated upon trip completion and safe arrival confirmation.'}
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            3. {t.privacyHeading3 || 'Family Privacy Controls'}
          </h3>
          <p>
            {t.privacyBody3 || 'Only family guardians who have received explicit, revocable permission from the vehicle owner may view live trip status, driver details, or receive automated arrival notifications.'}
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            4. {t.privacyHeading4 || 'Secure Document Vault'}
          </h3>
          <p>
            {t.privacyBody4 || 'Driver driving licenses, identity records, and police clearances are stored in encrypted private buckets accessible solely to authorized operations compliance officers for verification purposes.'}
          </p>
        </div>
      </div>
    </div>
  );
}
