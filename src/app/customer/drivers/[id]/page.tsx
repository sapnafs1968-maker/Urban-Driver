'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import {
  ShieldCheck,
  Star,
  Car,
  Zap,
  Globe,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Lock,
  HeartHandshake,
  Heart,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

export default function DriverProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driverId = params?.id as string;

  const { drivers, trustedDriverIds, toggleTrustedDriver, language } = useApp();
  const t = getTranslation(language);

  const driver = drivers.find((d) => d.id === driverId) || drivers[0];
  const isTrusted = trustedDriverIds.includes(driver.id);
  const isVerified = driver.verificationStatus === 'verified';

  const getMaskedDL = (num?: string) => {
    if (!num) return 'KA-03****8711';
    const clean = num.trim();
    if (clean.length < 8) return clean;
    return `${clean.slice(0, 5)}****${clean.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Back button */}
      <div>
        <Link
          href="/customer/drivers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-teal transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.backToDirectory}</span>
        </Link>
      </div>

      {/* Top Hero Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-brand-teal shadow-lg shrink-0">
            <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {driver.name}
              </h1>
              {isVerified && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.verifiedPro}</span>
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {driver.serviceArea}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{driver.rating || 4.9} ★</span>
              </span>
              <span>•</span>
              <span>{driver.totalTrips || 120}+ {t.driverCompleted}</span>
            </div>

            {/* Masked Licence Pill */}
            <div className="pt-1 flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-[11px] font-bold text-brand-teal border flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>DL: {getMaskedDL(driver.drivingLicenceNumber)}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {t.driverVerifiedBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Favorite & Book CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => toggleTrustedDriver(driver.id)}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
              isTrusted
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Star className={`w-4 h-4 ${isTrusted ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isTrusted ? t.removeFromTrustedCircle : t.addToTrustedCircle}</span>
          </button>

          <Link
            href={`/customer/book?preferredDriverId=${driver.id}`}
            className="px-6 py-3 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-teal/25 transition-all hover:scale-[1.02]"
          >
            <Car className="w-4 h-4" />
            <span>{t.bookDriverBtn}</span>
          </Link>
        </div>
      </div>

      {/* CAPABILITY TAGS BANNER (SECTION 8 MANDATORY SPEC) */}
      <div className="p-4 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">
          Vehicle Compatibility Tags:
        </span>
        <div className="flex flex-wrap items-center gap-2 font-mono font-bold text-[11px]">
          <span className="px-3 py-1 bg-brand-teal/20 text-brand-tealLight border border-brand-teal/40 rounded-full">
            MANUAL
          </span>
          <span className="px-3 py-1 bg-brand-teal/20 text-brand-tealLight border border-brand-teal/40 rounded-full">
            AUTOMATIC
          </span>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
            PETROL
          </span>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
            DIESEL
          </span>
          <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            EV CERTIFIED
          </span>
        </div>
      </div>

      {/* Detailed Dossier Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Driving Experience & Background */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-teal" />
            <span>Driving Experience & History</span>
          </h2>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
              <span>Total Driving Experience:</span>
              <strong className="text-slate-900 dark:text-white text-sm">
                {driver.experienceYears}+ Years
              </strong>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
              <span>Professional Chauffeur Experience:</span>
              <strong className="text-slate-900 dark:text-white text-sm">
                {driver.professionalExperienceYears || driver.experienceYears - 1} Years
              </strong>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-500">Vehicle Types Handled:</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {(driver.vehiclesDrivenTypes || ['Sedans', 'SUVs', 'Hatchbacks', 'Electric Cars']).map((v) => (
                  <span
                    key={v}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {driver.previousExperienceDescription && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[11px] italic">
                “{driver.previousExperienceDescription}”
              </div>
            )}
          </div>
        </div>

        {/* Senior Care & Customer Assistance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-500" />
            <span>Senior Citizen & Family Assistance</span>
          </h2>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-1 text-emerald-950 dark:text-emerald-200">
              <strong className="block font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Senior Citizen Assistance Specialist
              </strong>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Trained in patient, gentle acceleration and braking over road humps. Experienced helping elderly passengers walk from parking bay into hospital OPDs and clinics.
              </p>
            </div>

            <div className="space-y-1 pt-1 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                <span>Comfortable with remote family guardian oversight</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                <span>Available for regular recurring medical appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                <span>Luggage & mobility walker assistance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spoken Languages */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-teal" />
            <span>Languages & Communication</span>
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {(driver.capabilities?.languagesSpoken || ['Kannada', 'English', 'Hindi']).map((lang) => (
              <div
                key={lang}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold"
              >
                <span>{lang}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Fluent
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Hubs & Availability */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-teal" />
            <span>Base Hubs & Working Hours</span>
          </h2>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="font-semibold block text-slate-400 mb-1">Serving Neighbourhoods:</span>
              <div className="flex flex-wrap gap-1.5">
                {(driver.preferredServiceAreas || ['Indiranagar', 'Defence Colony', 'Koramangala', 'Domlur']).map((area) => (
                  <span
                    key={area}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <span>Operating Schedule: </span>
              <strong>{driver.workingHours || '08:00 AM - 08:00 PM'} (Mon-Sat)</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Sticky Booking Action */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-base text-white">
            Ready to book {driver.name} for your personal car?
          </h3>
          <p className="text-xs text-slate-400">
            Background verified, insured vehicle matching, and safe arrival confirmation included.
          </p>
        </div>

        <Link
          href={`/customer/book?preferredDriverId=${driver.id}`}
          className="w-full sm:w-auto px-8 py-3.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-teal/25 transition-transform hover:scale-105"
        >
          <Car className="w-4 h-4" />
          <span>Book {driver.name.split(' ')[0]} Now</span>
        </Link>
      </div>

    </div>
  );
}
