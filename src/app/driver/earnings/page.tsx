'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PayoutStatus } from '@/types';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  Car,
} from 'lucide-react';

function DriverEarningsContent() {
  const { currentUser, drivers, driverPayouts, language } = useApp();
  const t = getTranslation(language);

  const currentDriver =
    (currentUser &&
      (drivers.find((d) => d.userId === currentUser.id) ||
        drivers.find((d) => d.email.toLowerCase() === currentUser.email.toLowerCase()))) ||
    drivers[0];

  const myPayouts = driverPayouts.filter((p) => p.driverId === currentDriver?.id);

  // Compute real totals from completed trips
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let todayEarnings = 0;
  let weeklyEarnings = 0;
  let monthlyEarnings = 0;
  let pendingPayoutsTotal = 0;
  let totalPaidEarnings = 0;

  for (const p of myPayouts) {
    const ts = new Date(p.createdAt).getTime();
    if (ts >= startOfToday) todayEarnings += p.netPayout;
    if (ts >= startOfWeek) weeklyEarnings += p.netPayout;
    if (ts >= startOfMonth) monthlyEarnings += p.netPayout;
    if (p.payoutStatus === 'Pending' || p.payoutStatus === 'Processing') {
      pendingPayoutsTotal += p.netPayout;
    }
    if (p.payoutStatus === 'Paid') {
      totalPaidEarnings += p.netPayout;
    }
  }

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
            {t.earningsTitle || 'Driver Earnings & Per-Trip Payouts'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t.earningsSub || 'Transparent fare, platform commission, and net payout breakdown for every completed trip.'}
          </p>
        </div>

        <Link
          href="/driver/dashboard"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Live Earnings Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-1.5">
          <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-teal" /> Today&apos;s Earnings
          </span>
          <div className="text-3xl font-black text-brand-navy">₹{todayEarnings.toFixed(2)}</div>
          <div className="text-xs text-slate-500">Net earnings from today&apos;s completed trips</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-1.5">
          <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-brand-teal" /> Weekly Earnings
          </span>
          <div className="text-3xl font-black text-brand-navy">₹{weeklyEarnings.toFixed(2)}</div>
          <div className="text-xs text-slate-500">Last 7 days net driver earnings</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-1.5">
          <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-teal" /> Monthly Earnings
          </span>
          <div className="text-3xl font-black text-brand-navy">₹{monthlyEarnings.toFixed(2)}</div>
          <div className="text-xs text-slate-500">Current calendar month</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-1.5">
          <span className="text-xs text-slate-400 font-bold uppercase">Total Completed Trips</span>
          <div className="text-3xl font-black text-brand-navy">{myPayouts.length}</div>
          <div className="text-xs text-slate-500">Verified payout records linked to trips</div>
        </div>

        <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-sm space-y-1.5">
          <span className="text-xs text-amber-700 font-bold uppercase">Pending Payouts</span>
          <div className="text-3xl font-black text-amber-600">₹{pendingPayoutsTotal.toFixed(2)}</div>
          <div className="text-xs text-slate-500">Awaiting bank/UPI settlement</div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-1.5">
          <span className="text-xs text-emerald-700 font-bold uppercase">Total Paid Earnings</span>
          <div className="text-3xl font-black text-emerald-600">₹{totalPaidEarnings.toFixed(2)}</div>
          <div className="text-xs text-slate-500">Settled to driver account</div>
        </div>
      </div>

      {/* Per-Trip Payout Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-brand-navy">Per-Trip Fare & Payout Breakdown</h2>
            <p className="text-xs text-slate-500">
              Formula: Driver Net Payout = Total Trip Fare − Platform Commission − Applicable Deductions
            </p>
          </div>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
            {myPayouts.length} Trip Records
          </span>
        </div>

        {myPayouts.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <DollarSign className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No completed trip payouts yet</p>
            <p className="text-xs text-slate-500">
              Complete an assigned ride on your Driver Dashboard to generate your per-trip payout record.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myPayouts.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-brand-navy">
                        Trip: {p.tripId}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="font-mono text-xs text-brand-teal font-bold">
                        Booking: {p.bookingCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Customer: <strong className="text-slate-800">{p.customerName}</strong> • {p.tripDate} at {p.tripTime}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full border ${getStatusBadge(
                      p.payoutStatus
                    )}`}
                  >
                    {p.payoutStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pickup Location</span>
                    <span className="font-semibold text-slate-800">{p.pickupAddress}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Drop-off Location</span>
                    <span className="font-semibold text-slate-800">{p.destinationAddress}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/70 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Total Customer Fare</span>
                    <strong className="text-sm text-slate-900">₹{p.totalFare.toFixed(2)}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Platform Commission</span>
                    <strong className="text-sm text-rose-600">- ₹{p.platformCommission.toFixed(2)}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Applicable Deductions</span>
                    <strong className="text-sm text-rose-600">- ₹{p.deductions.toFixed(2)}</strong>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 font-bold block">Driver Net Earnings</span>
                    <strong className="text-base font-black text-emerald-700">₹{p.netPayout.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
