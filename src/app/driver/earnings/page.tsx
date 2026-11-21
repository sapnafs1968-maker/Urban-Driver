'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DollarSign, TrendingUp, Calendar, CheckCircle2, ArrowDownLeft } from 'lucide-react';

function DriverEarningsContent() {
  const { language } = useApp();
  const t = getTranslation(language);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
          {t.earningsTitle}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.earningsSub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">{t.settledThisMonth}</span>
          <div className="text-3xl font-black text-brand-navy">₹24,800</div>
          <div className="text-xs text-emerald-600 font-semibold">100% {t.confirmArrivalBtn}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">{t.pendingFridayPayout}</span>
          <div className="text-3xl font-black text-brand-teal">₹6,450</div>
          <div className="text-xs text-slate-500">{t.hospitalClinic}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">{t.seniorBonus}</span>
          <div className="text-3xl font-black text-amber-500">₹1,200</div>
          <div className="text-xs text-slate-500">5 ★ {t.rateDriver}</div>
        </div>
      </div>
    </div>
  );
}

export default function DriverEarningsPage() {
  return (
    <AuthGuard allowedRoles={['driver', 'admin']}>
      <DriverEarningsContent />
    </AuthGuard>
  );
}
