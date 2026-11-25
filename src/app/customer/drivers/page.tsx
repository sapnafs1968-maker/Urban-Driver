'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Driver } from '@/types';
import { getTranslation } from '@/lib/i18n';
import {
  ShieldCheck,
  Star,
  Car,
  Zap,
  Globe,
  Heart,
  PhoneCall,
  CheckCircle2,
  SlidersHorizontal,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerDriversPage() {
  const { drivers, trustedDriverIds, toggleTrustedDriver, language } = useApp();
  const t = getTranslation(language);

  const [transmissionFilter, setTransmissionFilter] = useState<'all' | 'manual' | 'automatic'>('all');
  const [evOnly, setEvOnly] = useState(false);
  const [trustedOnly, setTrustedOnly] = useState(false);
  const [directoryTab, setDirectoryTab] = useState<'verified' | 'all'>('verified');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrivers = drivers.filter((d) => {
    if (directoryTab === 'verified' && d.verificationStatus !== 'verified') return false;
    if (trustedOnly && !trustedDriverIds.includes(d.id)) return false;
    if (evOnly && !d.capabilities.evCertified) return false;
    if (transmissionFilter === 'manual' && !d.capabilities.manualTransmission) return false;
    if (transmissionFilter === 'automatic' && !d.capabilities.automaticTransmission) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.serviceArea.toLowerCase().includes(q) ||
        d.capabilities.languagesSpoken.some((l) => l.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.driversTitle}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.driversSub}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={t.address}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          />

          <select
            value={transmissionFilter}
            onChange={(e) => setTransmissionFilter(e.target.value as any)}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          >
            <option value="all">{t.filterAllTrans}</option>
            <option value="automatic">{t.filterAutomatic}</option>
            <option value="manual">{t.filterManual}</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setDirectoryTab('verified')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                directoryTab === 'verified'
                  ? 'bg-white dark:bg-slate-900 text-brand-teal shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Verified & Eligible ({drivers.filter((d) => d.verificationStatus === 'verified').length})
            </button>
            <button
              type="button"
              onClick={() => setDirectoryTab('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                directoryTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Registered ({drivers.length})
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              checked={evOnly}
              onChange={(e) => setEvOnly(e.target.checked)}
              className="w-4 h-4 rounded text-brand-teal"
            />
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              {t.filterEvOnly}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              checked={trustedOnly}
              onChange={(e) => setTrustedOnly(e.target.checked)}
              className="w-4 h-4 rounded text-brand-teal"
            />
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {t.trustedCircleTitle}
            </span>
          </label>
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => {
          const isTrusted = trustedDriverIds.includes(driver.id);
          const isVerified = driver.verificationStatus === 'verified';

          return (
            <div
              key={driver.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 relative flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={driver.photoUrl}
                      alt={driver.name}
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{driver.name}</span>
                        {isVerified && (
                          <span title={t.verifiedDriver}><ShieldCheck className="w-4 h-4 text-emerald-500" /></span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="text-amber-500 font-bold flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          {driver.rating}
                        </span>
                        <span>•</span>
                        <span>{driver.totalTrips} {t.driverCompleted}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleTrustedDriver(driver.id)}
                    className={`p-2 rounded-xl transition-colors ${isTrusted
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
                      : 'text-slate-300 hover:text-amber-500'
                      }`}
                    title={isTrusted ? t.removeFromTrustedCircle : t.addToTrustedCircle}
                  >
                    <Star className={`w-5 h-5 ${isTrusted ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-4">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.driverExp}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {driver.experienceYears} Years
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.transmissionLabel}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {driver.capabilities.automaticTransmission && driver.capabilities.manualTransmission
                        ? `${t.transAutomatic} / ${t.transManual}`
                        : driver.capabilities.automaticTransmission
                          ? t.transAutomatic
                          : t.transManual}
                    </span>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap gap-1 text-[11px]">
                  {driver.capabilities.evCertified && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold rounded">
                      ✓ {t.evCertifiedBadge}
                    </span>
                  )}
                  {driver.capabilities.languagesSpoken.slice(0, 3).map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href={`/customer/drivers/${driver.id}`}
                  className="text-xs font-bold text-brand-teal hover:underline"
                >
                  {t.details} →
                </Link>

                {!isVerified ? (
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-xl">
                    Verification Pending
                  </span>
                ) : driver.currentActiveBookingId ? (
                  <span className="px-3 py-1.5 bg-rose-100 text-rose-800 text-[11px] font-bold rounded-xl">
                    Currently on a trip
                  </span>
                ) : !driver.isAvailable ? (
                  <span className="px-3 py-1.5 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl">
                    Unavailable
                  </span>
                ) : (
                  <Link
                    href={`/customer/book?preferredDriverId=${driver.id}`}
                    className="px-4 py-2 bg-brand-navy hover:bg-slate-800 dark:bg-brand-teal dark:hover:bg-brand-tealDark text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    {t.bookDriverBtn}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
