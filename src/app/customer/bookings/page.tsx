'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getTranslation, formatBookingStatus } from '@/lib/i18n';
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Star,
  ShieldCheck,
  AlertCircle,
  Repeat,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

function CustomerBookingsContent() {
  const { bookings, currentUser, confirmArrival, rateDriver, language } = useApp();
  const t = getTranslation(language);

  const [ratingModalBookingId, setRatingModalBookingId] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('Very polite and careful on hospital speed-breakers.');

  const myBookings = bookings.filter((b) => b.customerId === currentUser?.id);

  const handleRateSubmit = (bId: string, dId: string) => {
    rateDriver(bId, dId, selectedRating, feedbackText);
    setRatingModalBookingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.bookingsTitle}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t.bookingsSub}
          </p>
        </div>

        <Link
          href="/customer/book"
          className="px-5 py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-xl text-sm shadow flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Car className="w-4 h-4" />
          <span>{t.bookDriver}</span>
        </Link>
      </div>

      <div className="space-y-6">
        {myBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t.noBookingsInTab}</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">{t.bookDriverSub}</p>
            <Link
              href="/customer/book"
              className="inline-block px-5 py-2.5 bg-brand-teal text-white text-xs font-bold rounded-xl shadow"
            >
              {t.bookDriver}
            </Link>
          </div>
        ) : (
          myBookings.map((b) => {
            const isPendingArrival =
              b.status === 'arrival_confirmation_pending' || b.status === 'trip_completed';
            const isClosed = b.status === 'closed';

            return (
              <div
                key={b.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm space-y-5 transition-all ${isPendingArrival
                    ? 'border-rose-500 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                  }`}
              >
                {/* Top Row: Code, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {b.bookingCode}
                    </span>
                    {b.isRecurring && (
                      <span className="text-[10px] bg-brand-teal/10 text-brand-teal font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Repeat className="w-3 h-3" /> {t.recurringOption.split('(')[0].trim()}
                      </span>
                    )}
                    {b.bookedByGuardianName && (
                      <span className="text-[10px] bg-teal-50 dark:bg-teal-950 text-brand-teal font-bold px-2 py-0.5 rounded">
                        {t.familyGuardian}: {b.bookedByGuardianName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${isPendingArrival
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                          : isClosed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-brand-teal/20 text-brand-teal font-bold'
                        }`}
                    >
                      {formatBookingStatus(b.status, language)}
                    </span>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">

                  {/* Route */}
                  <div className="space-y-2">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                      {t.details}
                    </span>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {b.pickupAddress.split(',')[0]}
                        </div>
                        <div className="text-[11px] text-slate-400">{b.pickupAddress}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {b.destinationAddress.split(',')[0]}
                        </div>
                        <div className="text-[11px] text-slate-400">{b.destinationAddress}</div>
                      </div>
                    </div>
                  </div>

                  {/* Driver & Car */}
                  <div className="space-y-2">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                      {t.myVehicles} & {t.verifiedDriver}
                    </span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {b.vehicleDetails.make} {b.vehicleDetails.model} ({b.vehicleDetails.transmission})
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {t.regNumberLabel}: {b.vehicleDetails.registrationNumber}
                      </div>
                      <div className="pt-1 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                        <span>{t.navForDrivers}: {b.driverName}</span>
                        <span className="text-amber-500 font-bold">★ {b.driverRating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timing & Fare */}
                  <div className="space-y-2">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                      {t.step2Schedule} & {t.price}
                    </span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                        <span>{b.pickupDate} at {b.pickupTime}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {t.durationHours}: {b.expectedDurationHours} {t.hours}
                      </div>
                      <div className="pt-1 text-sm font-black text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{t.totalFare}:</span>
                        <span className="text-brand-teal">₹{b.totalFare}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrival Confirmation Action Bar (Workflow 7, 8, 11) */}
                {isPendingArrival && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-rose-900 dark:text-rose-200">
                      <strong className="block font-bold">{t.safeArrivalQuestion}</strong>
                      {t.tripCompletedMsg}
                    </div>

                    <button
                      onClick={() => confirmArrival(b.id)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow flex items-center justify-center gap-1.5 transition-transform hover:scale-105"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.confirmArrivalBtn}</span>
                    </button>
                  </div>
                )}

                {/* Closed Trip Rating CTA */}
                {isClosed && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.arrivalConfirmed}</span>
                    </div>

                    <button
                      onClick={() => setRatingModalBookingId(b.id)}
                      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{t.rateDriver}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Driver Rating Modal */}
      {ratingModalBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.rateDriver}
            </h3>
            <p className="text-xs text-slate-500">
              {t.rateDriverSub}
            </p>

            <div className="flex justify-center gap-2 py-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className="p-1 transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-8 h-8 ${star <= selectedRating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-300 dark:text-slate-700'
                      }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.ticketMessage}
              </label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRatingModalBookingId(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl text-xs"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  const b = bookings.find((x) => x.id === ratingModalBookingId);
                  if (b && b.driverId) {
                    handleRateSubmit(b.id, b.driverId);
                  }
                }}
                className="px-5 py-2 bg-brand-teal text-white font-bold rounded-xl text-xs shadow"
              >
                {t.submitRatingBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerBookingsPage() {
  return (
    <AuthGuard allowedRoles={['customer', 'family_guardian']}>
      <CustomerBookingsContent />
    </AuthGuard>
  );
}
