'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { getTranslation, formatBookingStatus } from '@/lib/i18n';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LiveTripMap } from '@/components/maps/LiveTripMap';
import { Booking, Driver } from '@/types';
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Clock,
  CreditCard,
  AlertCircle,
  XCircle,
} from 'lucide-react';

const LIFECYCLE_STEPS = [
  { key: 'requested', label: 'Booking Requested' },
  { key: 'awaiting_assignment', label: 'Finding Driver' },
  { key: 'driver_assigned', label: 'Driver Assigned' },
  { key: 'confirmed', label: 'Driver Confirmed' },
  { key: 'driver_en_route', label: 'Driver En Route' },
  { key: 'driver_arrived', label: 'Driver Arrived' },
  { key: 'trip_started', label: 'Trip Started' },
  { key: 'trip_completed', label: 'Trip Completed' },
  { key: 'arrival_confirmation_pending', label: 'Arrival Confirmation Pending' },
  { key: 'closed', label: 'Trip Closed' },
];

function LiveBookingStatusContent() {
  const params = useParams<{ id: string }>();
  const bookingId = params?.id;
  const { bookings, drivers, language, confirmArrival, updateBookingStatus } = useApp();
  const t = getTranslation(language);

  const [liveBooking, setLiveBooking] = useState<Booking | null>(
    () => bookings.find((b) => b.id === bookingId || b.bookingCode === bookingId) || null
  );
  const [liveDriver, setLiveDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(!liveBooking);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    let active = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`);
        if (!res.ok) {
          if (res.status === 404 && active) setError('Booking not found.');
          return;
        }
        const data = await res.json();
        if (active && data.booking) {
          setLiveBooking(data.booking);
          setLiveDriver(data.driver || null);
          setError(null);
        }
      } catch {
        // Keep existing state on transient network hiccup
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchStatus();
    const timer = setInterval(fetchStatus, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [bookingId]);

  const booking =
    liveBooking || bookings.find((b) => b.id === bookingId || b.bookingCode === bookingId) || null;
  const driver =
    liveDriver || (booking?.driverId ? drivers.find((d) => d.id === booking.driverId) || null : null);

  if (loading && !booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-600 font-bold">
        Loading live ride status...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h1 className="text-2xl font-black text-brand-navy">{error || 'Booking not found'}</h1>
        <Link
          href="/customer/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-teal text-white font-bold rounded-2xl text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const currentIdx = LIFECYCLE_STEPS.findIndex((s) => s.key === booking.status);
  const canConfirmArrival =
    booking.status === 'arrival_confirmation_pending' || booking.status === 'trip_completed';
  const canCancel =
    booking.status === 'requested' ||
    booking.status === 'awaiting_assignment' ||
    booking.status === 'driver_assigned' ||
    booking.status === 'confirmed';

  return (
    <div data-read-aloud className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/customer/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-brand-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold">
          {t.demoSandboxLabel || 'DEMO SANDBOX — Simulated Data'}
        </span>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Booking Reference</span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy font-mono">
              {booking.bookingCode}
            </h1>
          </div>
          <span className="px-4 py-2 rounded-full bg-brand-softBlue text-brand-teal font-black text-sm self-start">
            {formatBookingStatus(booking.status, language)}
          </span>
        </div>

        {/* Lifecycle Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {LIFECYCLE_STEPS.map((st, idx) => {
            const done = currentIdx >= idx;
            const active = currentIdx === idx;
            return (
              <div
                key={st.key}
                className={`p-2.5 rounded-xl border text-xs font-bold ${
                  active
                    ? 'bg-brand-teal text-white border-brand-teal shadow'
                    : done
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                {idx + 1}. {st.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrival Confirmation Banner */}
      {canConfirmArrival && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-3xl p-6 text-center space-y-3">
          <h2 className="text-xl font-black text-rose-950">{t.safeArrivalQuestion}</h2>
          <button
            type="button"
            onClick={() => confirmArrival(booking.id)}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-full text-base inline-flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{t.confirmArrivalBtn}</span>
          </button>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Driver & Vehicle */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <h2 className="font-black text-lg text-brand-navy flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-teal" />
            <span>Assigned Chauffeur & Car</span>
          </h2>
          {driver ? (
            <div className="flex items-center gap-4">
              <img
                src={driver.photoUrl}
                alt={driver.name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
              />
              <div>
                <div className="font-black text-lg text-slate-900">{driver.name}</div>
                <div className="text-xs text-slate-500">
                  ★ {driver.rating.toFixed(1)} • {driver.experienceYears} yrs exp
                </div>
                {driver.phone && (
                  <a
                    href={`tel:${driver.phone}`}
                    className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-bold"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              {booking.driverName || 'Matching verified chauffeur...'}
            </p>
          )}

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <Car className="w-5 h-5 text-brand-teal shrink-0" />
            <div className="text-sm">
              <div className="font-bold text-slate-900">
                {booking.vehicleDetails.make} {booking.vehicleDetails.model}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {booking.vehicleDetails.registrationNumber} • {booking.vehicleDetails.transmission} •{' '}
                {booking.vehicleDetails.fuelType}
              </div>
            </div>
          </div>
        </div>

        {/* Route, Fare & Payment */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-black text-lg text-brand-navy flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-teal" />
            <span>Trip & Payment Summary</span>
          </h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block">Pickup</span>
              <strong className="text-slate-900">{booking.pickupAddress}</strong>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block">Destination</span>
              <strong className="text-slate-900">{booking.destinationAddress}</strong>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Clock className="w-4 h-4" /> {booking.pickupTime} ({booking.expectedDurationHours}h)
            </span>
            <span className="font-black text-xl text-emerald-700">₹{booking.totalFare}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" /> Method: {booking.paymentMethod}
            </span>
            <span className="font-bold uppercase">{booking.paymentStatus}</span>
          </div>

          {canCancel && (
            <button
              type="button"
              onClick={() => updateBookingStatus(booking.id, 'cancelled', 'Cancelled by customer')}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Booking</span>
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
        <h3 className="font-black text-base text-brand-navy">Route Overview</h3>
        <LiveTripMap
          pickupLat={booking.pickupLat}
          pickupLng={booking.pickupLng}
          destLat={booking.destLat}
          destLng={booking.destLng}
          pickupAddress={booking.pickupAddress.split(',')[0]}
          destAddress={booking.destinationAddress.split(',')[0]}
          status={booking.status}
        />
      </div>
    </div>
  );
}

export default function LiveBookingStatusPage() {
  return (
    <AuthGuard allowedRoles={['customer', 'family_guardian', 'admin']}>
      <LiveBookingStatusContent />
    </AuthGuard>
  );
}
