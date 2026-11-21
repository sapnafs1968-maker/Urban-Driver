'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { getTranslation, formatBookingStatus, formatVerificationStatus } from '@/lib/i18n';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LiveTripMap } from '@/components/maps/LiveTripMap';
import {
  ShieldCheck,
  Star,
  Car,
  Navigation,
  PhoneCall,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function DriverDashboardContent() {
  const {
    currentUser,
    drivers,
    bookings,
    updateBookingStatus,
    toggleDriverAvailability,
    language,
  } = useApp();

  const t = getTranslation(language);

  if (!currentUser) return null;

  // Active driver record
  const currentDriver =
    drivers.find((d) => d.userId === currentUser.id) ||
    drivers.find((d) => d.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    drivers[0];

  // Assigned active booking
  const assignedBooking = bookings.find(
    (b) =>
      b.driverId === currentDriver.id &&
      (b.status === 'confirmed' ||
        b.status === 'driver_assigned' ||
        b.status === 'driver_en_route' ||
        b.status === 'driver_arrived' ||
        b.status === 'trip_started' ||
        b.status === 'trip_completed' ||
        b.status === 'arrival_confirmation_pending')
  );

  const completedTrips = bookings.filter(
    (b) => b.driverId === currentDriver.id && b.status === 'closed'
  );

  const isVerified = currentDriver.verificationStatus === 'verified';

  const getMaskedDL = (num?: string) => {
    if (!num) return 'KA-03****8711';
    const clean = num.trim();
    if (clean.length < 8) return clean;
    return `${clean.slice(0, 5)}****${clean.slice(-4)}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Profile & Availability Banner (Light Theme) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-teal shadow-sm shrink-0">
            <img
              src={currentDriver.photoUrl}
              alt={currentDriver.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-brand-navy">
                {currentDriver.name}
              </h1>
              {isVerified ? (
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {t.verifiedDriver || 'Verified Driver'}
                </span>
              ) : (
                <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                  {formatVerificationStatus(currentDriver.verificationStatus, language)}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3 font-medium">
              <span>{currentDriver.serviceArea}</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">★ {currentDriver.rating}</span>
              <span>•</span>
              <span>{currentDriver.totalTrips} {t.myBookings || 'Completed Trips'}</span>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          <span className="text-xs font-semibold text-slate-600">
            {t.status || 'Duty Status'}: {currentDriver.isAvailable && isVerified ? (t.statusStarted || 'ONLINE') : (t.statusClosed || 'OFFLINE')}
          </span>
          <button
            disabled={!isVerified}
            onClick={() => toggleDriverAvailability(currentDriver.id)}
            title={!isVerified ? (t.verifUnderReview || 'Verification required to accept bookings') : undefined}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${currentDriver.isAvailable && isVerified
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
          >
            {!isVerified
              ? (t.verifPending || 'Verification Required')
              : currentDriver.isAvailable
                ? (t.close || 'Go Offline')
                : (t.confirm || 'Go Online')}
          </button>
        </div>
      </div>

      {/* UNVERIFIED RESTRICTION BANNER */}
      {!isVerified && (
        <div className="bg-amber-50 border-2 border-amber-500/70 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950">
              <strong className="block font-bold text-sm mb-0.5">
                {t.appStatusTitle}: {formatVerificationStatus(currentDriver.verificationStatus, language)}
              </strong>
              <span>
                {t.appUnderReview}
              </span>
            </div>
          </div>
          <Link
            href="/driver/verification-status"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 transition-colors shadow-xs"
          >
            {t.previewTripBtn} →
          </Link>
        </div>
      )}

      {/* DRIVER PROFILE SUMMARY SECTION */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200">
              <img src={currentDriver.photoUrl} alt="Photo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-base font-black text-brand-navy flex items-center gap-2">
                <span>{currentDriver.name}</span>
                {isVerified ? (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                    ✓ {t.verifiedDriver}
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                    {formatVerificationStatus(currentDriver.verificationStatus, language)}
                  </span>
                )}
              </h2>
              <div className="text-xs text-slate-500">
                {t.dlNumberLabel}: <span className="font-mono font-bold text-brand-teal">{getMaskedDL(currentDriver.drivingLicenceNumber)}</span> • {currentDriver.experienceYears} {t.experienceYearsLabel || 'Years Driving Exp'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/driver/capabilities"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 rounded-xl transition-colors border border-slate-200"
            >
              {t.navCapabilities} →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.transmissionsLabel}</span>
            <div className="font-bold text-slate-900 uppercase">
              {currentDriver.supportedTransmissions?.join(', ') || 'Manual, Automatic'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.fuelTypesLabel}</span>
            <div className="font-bold text-slate-900 uppercase">
              {currentDriver.supportedFuelTypes?.join(', ') || 'Petrol, Diesel, EV'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.specialCapabilitiesHeading}</span>
            <div className="font-bold text-brand-teal truncate">
              {currentDriver.capabilities?.evCertified ? 'EV Certified ★' : (t.seniorCitizenSpecialist || 'Senior Specialist')}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.languagesFluentLabel}</span>
            <div className="font-bold text-slate-900 truncate">
              {currentDriver.capabilities?.languagesSpoken?.join(', ') || 'Kannada, English'}
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE ASSIGNED TRIP CONTROLLER */}
      {assignedBooking ? (
        <div className="bg-white border-2 border-brand-teal rounded-3xl p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs text-slate-400 font-mono">
                {t.bookingConfirmed}: {assignedBooking.bookingCode}
              </span>
              <h2 className="text-lg font-black text-brand-navy">
                {t.assignedDriver}: {assignedBooking.customerName}
              </h2>
            </div>
            <span className="text-xs font-black uppercase px-3 py-1 bg-brand-teal text-white rounded-full">
              {t.status}: {formatBookingStatus(assignedBooking.status, language)}
            </span>
          </div>

          {/* Vehicle specifications to drive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">{t.myVehicles}</span>
              <div className="text-sm font-black text-slate-900">
                {assignedBooking.vehicleDetails.make} {assignedBooking.vehicleDetails.model}
              </div>
              <div className="font-mono text-slate-500">
                {assignedBooking.vehicleDetails.registrationNumber}
              </div>
              <div className="text-brand-teal font-bold pt-1 uppercase">
                {assignedBooking.vehicleDetails.transmission} • {assignedBooking.vehicleDetails.fuelType}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">{t.pickupAddressLabel}</span>
              <div className="font-bold text-slate-800">
                {assignedBooking.pickupAddress}
              </div>
              <div className="text-slate-500 pt-1 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-brand-teal" />
                <a href={`tel:${assignedBooking.customerPhone}`} className="underline font-bold text-brand-navy">
                  {t.phoneLabel}: {assignedBooking.customerPhone}
                </a>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">{t.dropoffAddressLabel}</span>
              <div className="font-bold text-slate-800">
                {assignedBooking.destinationAddress}
              </div>
              <div className="text-slate-500 pt-1">
                {t.expectedDurationLabel}: {assignedBooking.expectedDurationHours} Hours
              </div>
            </div>
          </div>

          {assignedBooking.specialInstructions && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
              <strong className="block text-[10px] uppercase font-bold">{t.specialNotesLabel}:</strong>
              {assignedBooking.specialInstructions}
            </div>
          )}

          {/* Map Preview */}
          <LiveTripMap
            pickupAddress={assignedBooking.pickupAddress}
            destAddress={assignedBooking.destinationAddress}
            status={assignedBooking.status}
          />

          {/* DRIVER TRIP LIFECYCLE ACTION BUTTONS */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.advanceTrip}:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Step 1: En Route */}
              <button
                disabled={assignedBooking.status !== 'confirmed' && assignedBooking.status !== 'driver_assigned'}
                onClick={() =>
                  updateBookingStatus(
                    assignedBooking.id,
                    'driver_en_route',
                    'Driver marked en route to pickup address.'
                  )
                }
                className="p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-brand-softBlue hover:bg-brand-softBlue/80 text-brand-navy border-brand-teal/20"
              >
                <Navigation className="w-4 h-4 text-brand-teal" />
                <span>1. {t.statusEnRoute}</span>
              </button>

              {/* Step 2: Arrived at Pickup */}
              <button
                disabled={assignedBooking.status !== 'driver_en_route'}
                onClick={() =>
                  updateBookingStatus(
                    assignedBooking.id,
                    'driver_arrived',
                    'Driver reached customer residence.'
                  )
                }
                className="p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>2. {t.statusArrived}</span>
              </button>

              {/* Step 3: Start Trip */}
              <button
                disabled={assignedBooking.status !== 'driver_arrived'}
                onClick={() =>
                  updateBookingStatus(
                    assignedBooking.id,
                    'trip_started',
                    'Trip commenced with customer vehicle.'
                  )
                }
                className="p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <Car className="w-4 h-4" />
                <span>3. {t.statusStarted}</span>
              </button>

              {/* Step 4: Complete Trip */}
              <button
                disabled={assignedBooking.status !== 'trip_started'}
                onClick={() =>
                  updateBookingStatus(
                    assignedBooking.id,
                    'arrival_confirmation_pending',
                    'Driver completed trip. Arrival confirmation requested from customer.'
                  )
                }
                className="p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-rose-600 hover:bg-rose-700 text-white border-rose-500 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>4. {t.confirmArrivalBtn}</span>
              </button>
            </div>

            {assignedBooking.status === 'arrival_confirmation_pending' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between">
                <span>
                  ✓ {t.tripCompletedMsg}
                </span>
                <span className="font-bold">{t.grossEarnings}: ₹{assignedBooking.baseFare + assignedBooking.durationFare}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-xl">
            🚗
          </div>
          <h3 className="font-bold text-base text-brand-navy">
            {t.safeArrivalSub || 'No active trip assignment right now'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t.wizardSub}
          </p>
        </div>
      )}

      {/* QUICK SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Earnings */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">{t.weeklyEarnings || 'This Week’s Payout'}</span>
          <div className="text-3xl font-black text-brand-navy">
            ₹6,450.00
          </div>
          <div className="text-xs text-emerald-600 font-semibold">
            {t.netPayout}
          </div>
        </div>

        {/* Total Trips */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">{t.completedTripsLabel || 'Completed Journeys'}</span>
          <div className="text-3xl font-black text-brand-navy">
            {currentDriver.totalTrips}
          </div>
          <div className="text-xs text-slate-500">
            {t.trustedDriversSub || 'Trusted Driver Circle in 18 Families'}
          </div>
        </div>

        {/* Documents & Compliance */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">{t.navDocuments || 'Document Compliance'}</span>
          <div className="text-sm font-black text-brand-navy">
            {t.dlNumberLabel} & {t.policeDocLabel}
          </div>
          <Link
            href="/driver/documents"
            className="text-xs text-brand-teal hover:underline font-bold block pt-1"
          >
            {t.navDocuments} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DriverDashboardPage() {
  return (
    <AuthGuard allowedRoles={['driver', 'admin']}>
      <DriverDashboardContent />
    </AuthGuard>
  );
}
