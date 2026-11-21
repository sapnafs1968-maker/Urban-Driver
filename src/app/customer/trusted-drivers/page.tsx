'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import {
  Star,
  ShieldCheck,
  Car,
  Repeat,
  Trash2,
  PhoneCall,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function TrustedDriverCirclePage() {
  const { drivers, trustedDriverIds, toggleTrustedDriver, language } = useApp();
  const t = getTranslation(language);

  const trustedDrivers = drivers.filter((d) => trustedDriverIds.includes(d.id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          <span>{t.trustedCircleBadge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.trustedCircleTitle}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.trustedCircleSub}
        </p>
      </div>

      {trustedDrivers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto text-3xl">
            ⭐
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.emptyTrustedTitle}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t.emptyTrustedSub}
          </p>
          <Link
            href="/customer/drivers"
            className="inline-block px-5 py-2.5 bg-brand-teal text-white font-bold rounded-xl text-xs"
          >
            {t.exploreDriversBtn}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustedDrivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white dark:bg-slate-900 border-2 border-amber-400/40 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={driver.photoUrl}
                      alt={driver.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow"
                    />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{driver.name}</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </h3>
                      <div className="text-xs text-slate-500">
                        {driver.experienceYears} {t.driverExp} • {driver.serviceArea.split('&')[0]}
                      </div>
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                        {driver.rating} ★ ({driver.totalTrips} {t.driverCompleted})
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleTrustedDriver(driver.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title={t.removeFromTrustedCircle}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Compatibility Highlights */}
                <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/60 mt-4 text-xs space-y-1 text-amber-900 dark:text-amber-200">
                  <span className="font-bold block text-[10px] uppercase">
                    {t.trustedCircleBadge}:
                  </span>
                  <div>✓ {t.featSeniorCareTitle}</div>
                  <div>✓ {driver.capabilities.evCertified ? t.evCertifiedBadge : t.transAutomatic}</div>
                  <div>✓ {t.driverVerifiedBadge}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <Link
                  href={`/customer/book?preferredDriverId=${driver.id}`}
                  className="w-full py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>{t.bookDriverBtn} ({driver.name.split(' ')[0]})</span>
                </Link>

                <Link
                  href={`/customer/book?preferredDriverId=${driver.id}&recurring=true`}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Repeat className="w-3.5 h-3.5 text-brand-teal" />
                  <span>{t.recurringOption.split('(')[0].trim()} ({driver.name.split(' ')[0]})</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
