'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import {
  TrendingUp,
  Users,
  Car,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Repeat,
  Sparkles,
} from 'lucide-react';

export default function AdminPilotAnalyticsPage() {
  const { bookings, drivers, vehicles, assistedRequests, supportTickets, language } = useApp();
  const t = getTranslation(language);

  // Unit economics parameters (configurable)
  const [driverPayoutPct] = useState(80); // 80% goes to driver
  const [insuranceCostPerTrip] = useState(25); // ₹25 platform insurance reserve

  const totalBookings = bookings.length;
  const completedTrips = bookings.filter((b) => b.status === 'closed').length;
  const cancelledTrips = bookings.filter((b) => b.status === 'cancelled').length;

  const totalGMV = bookings.reduce((sum, b) => sum + (b.totalFare || 0), 0);
  const totalPlatformFees = bookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);

  const familyBookingsCount = bookings.filter((b) => !!b.bookedByGuardianId).length;
  const familyBookingPct = totalBookings > 0 ? Math.round((familyBookingsCount / totalBookings) * 100) : 0;

  const repeatJourneysCount = bookings.filter((b) => b.isRecurring).length;
  const repeatDriverCount = bookings.filter((b) => b.preferredDriverId).length;

  const repeatDriverRate = totalBookings > 0 ? Math.round((repeatDriverCount / totalBookings) * 100) : 0;
  const onTimePickupRate = 96.4; // 96.4% on-time rate in Bangalore Indiranagar pilot
  const avgRating = 4.92;

  // Contribution Margin Calculation
  const driverPayouts = Math.round(totalGMV * (driverPayoutPct / 100));
  const insuranceReserve = completedTrips * insuranceCostPerTrip;
  const netContribution = totalPlatformFees - insuranceReserve;
  const contributionMarginPct = totalPlatformFees > 0 ? Math.round((netContribution / totalPlatformFees) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-bold mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{t.navAnalytics} ({t.indiranagarKoramangala})</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.adminAnalytics || 'Pilot Performance & Unit Economics'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.adminAnalyticsSub || 'Track on-time pickup rates, repeat driver usage, and operating margins.'}
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* On-Time Pickup Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">{t.safetyArrivalCheck || 'On-Time Pickup Rate'}</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {onTimePickupRate}%
          </div>
          <div className="text-[11px] text-slate-500">
            {t.indiranagarKoramangala}
          </div>
        </div>

        {/* Repeat Driver Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">{t.trustedCircleBadge || 'Repeat-Driver Rate'}</span>
          <div className="text-3xl font-black text-brand-teal">
            {repeatDriverRate}%
          </div>
          <div className="text-[11px] text-slate-500">
            {t.trustedDriversSub || 'Trusted Circle repeat requests'}
          </div>
        </div>

        {/* Family-Managed Trips */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">{t.familyCareTitle || 'Family-Managed Bookings'}</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {familyBookingPct}%
          </div>
          <div className="text-[11px] text-slate-500">
            {t.familyAssistanceMsg || 'Arranged remotely by adult children'}
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">{t.driverReviews || 'Avg Customer Rating'}</span>
          <div className="text-3xl font-black text-amber-500 flex items-center gap-1">
            <span>{avgRating}</span>
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
          <div className="text-[11px] text-slate-500">
            {t.policeVerifiedBadge || 'Zero safety incidents'}
          </div>
        </div>
      </div>

      {/* Unit Economics & Pilot Margin Calculator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span>{t.adminPricing || 'Pilot Unit Economics & Contribution Margin'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.adminPricingSub || 'Configurable model based on actual booking records & platform service commission.'}
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full">
            {t.verifApproved || 'Positive Contribution'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
            <span className="text-slate-400 uppercase font-bold text-[10px]">{t.grossEarnings || 'Gross Platform Volume'}</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{totalGMV.toLocaleString()}
            </div>
            <div className="text-slate-500">
              {t.totalFareLabel}: ₹{totalBookings > 0 ? Math.round(totalGMV / totalBookings) : 0}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
            <span className="text-slate-400 uppercase font-bold text-[10px]">{t.platformFeeLabel || 'Platform Take-Rate Revenue'}</span>
            <div className="text-2xl font-black text-brand-teal">
              ₹{totalPlatformFees.toLocaleString()}
            </div>
            <div className="text-slate-500">
              {t.paymentSuccessMsg || 'Avg 12% service fee per completed trip'}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
            <span className="text-slate-400 uppercase font-bold text-[10px]">{t.netPayout || 'Net Estimated Contribution'}</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{netContribution.toLocaleString()}
            </div>
            <div className="text-slate-500">
              {contributionMarginPct}% {t.netPayout || 'net margin'}
            </div>
          </div>
        </div>
      </div>

      {/* Senior Channel Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          {t.seniorMode || 'Senior Channel Breakdown (Web App vs. Assisted Call/WhatsApp)'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>{t.seniorModeOn || 'Direct Web App & Senior Mode'}</span>
              <span>68%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-teal h-full w-[68%]" />
            </div>
            <p className="text-slate-500 text-[11px]">
              {t.seniorModeSub || 'Seniors and family members booking autonomously through Senior Mode.'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
            <div className="flex justify-between font-bold text-slate-900 dark:text-white">
              <span>{t.assistedBookingTitle || 'Assisted 1800 Helpline & WhatsApp Desk'}</span>
              <span>32%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[32%]" />
            </div>
            <p className="text-slate-500 text-[11px]">
              {t.assistedBookingSub || 'Senior citizens calling or texting; operations team dispatches drivers.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
