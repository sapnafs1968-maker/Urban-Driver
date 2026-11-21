'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Users, ShieldCheck, Check, Lock, PhoneCall } from 'lucide-react';

function FamilyMembersContent() {
  const { familyRelationships, currentUser, language } = useApp();
  const t = getTranslation(language);

  const relationship = familyRelationships.find(
    (r) => r.guardianUserId === currentUser?.id && r.status === 'active'
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
          {t.familyHubTitle}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.familyHubSub}
        </p>
      </div>

      {relationship ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-softBlue text-brand-teal flex items-center justify-center text-xl">
                👴
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {relationship.customerName}
                </h3>
                <span className="text-xs text-slate-500">
                  {t.imCustomer}: {t.vehicleOwnerBadge} • {relationship.relationshipTitle}
                </span>
              </div>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold border border-emerald-200">
              {t.activeConsent}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              {t.familyCoordSub}:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                <span>{t.permBookForCustomer}</span>
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                <span>{t.permLiveTracking}</span>
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                <span>{t.permPayments}</span>
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                <span>{t.permArrivalSms}</span>
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
          {t.emptyTrustedTitle}
        </div>
      )}
    </div>
  );
}

export default function FamilyMembersPage() {
  return (
    <AuthGuard allowedRoles={['family_guardian', 'customer', 'admin']}>
      <FamilyMembersContent />
    </AuthGuard>
  );
}
