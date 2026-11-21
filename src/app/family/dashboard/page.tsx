'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { getTranslation, formatBookingStatus } from '@/lib/i18n';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LiveTripMap } from '@/components/maps/LiveTripMap';
import {
  Users,
  ShieldCheck,
  Car,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  PhoneCall,
  Plus,
  AlertTriangle,
  ArrowRight,
  CreditCard,
} from 'lucide-react';

function FamilyGuardianDashboardContent() {
  const {
    currentUser,
    familyRelationships,
    bookings,
    vehicles,
    drivers,
    trustedDriverIds,
    language,
  } = useApp();

  const t = getTranslation(language);

  if (!currentUser) return null;

  // Find relationships where the current user is guardian
  const authorizedParents = familyRelationships.filter(
    (r) => r.guardianUserId === currentUser.id && r.status === 'active'
  );

  const parentRelationship = authorizedParents[0];
  const parentId = parentRelationship?.customerId;

  // Trips for this parent
  const parentTrips = bookings.filter((b) => b.customerId === parentId);
  const activeParentTrip = parentTrips.find(
    (b) =>
      b.status === 'driver_assigned' ||
      b.status === 'confirmed' ||
      b.status === 'driver_en_route' ||
      b.status === 'driver_arrived' ||
      b.status === 'trip_started' ||
      b.status === 'arrival_confirmation_pending'
  );

  const parentVehicle = vehicles.find((v) => v.customerId === parentId) || vehicles[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner (Light Theme) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-softBlue text-brand-teal rounded-full text-xs font-bold mb-2 border border-brand-teal/20">
            <Users className="w-3.5 h-3.5" />
            <span>{t.familyGuardian || 'Family Guardian Portal'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
            {t.familyCareTitle || 'Guardian Hub'}: {parentRelationship?.customerName || 'Ramesh Sharma'}
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            {t.familyCareSub || 'You are an authorized family guardian. You can book verified drivers, pay fares remotely, and receive live arrival confirmations for your parent’s vehicle.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/family/book"
            className="px-6 py-3 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-2xl text-sm shadow-md shadow-brand-teal/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
          >
            <Car className="w-4 h-4" />
            <span>{t.bookDriver || 'Book Trip for Parent'}</span>
          </Link>
        </div>
      </div>

      {/* ACTIVE PARENT TRIP CARD & LIVE TELEMATICS */}
      {activeParentTrip ? (
        <div className="bg-white border-2 border-brand-teal rounded-3xl p-6 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-lg font-black text-brand-navy">
                {t.liveTrackingTitle || 'Active Journey'}: {activeParentTrip.customerName} ({activeParentTrip.bookingCode})
              </h2>
            </div>
            <div className="text-xs font-bold bg-brand-softBlue text-brand-teal px-3 py-1 rounded-full uppercase border border-brand-teal/20">
              {t.status}: {formatBookingStatus(activeParentTrip.status, language)}
            </div>
          </div>

          {/* Live Telematics Map */}
          <LiveTripMap
            pickupAddress={activeParentTrip.pickupAddress}
            destAddress={activeParentTrip.destinationAddress}
            driverLocation={activeParentTrip.liveLocation}
            status={activeParentTrip.status}
          />

          {/* Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                {t.assignedDriver}
              </span>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>{activeParentTrip.driverName}</span>
                <span className="text-emerald-600 font-normal">★ {activeParentTrip.driverRating}</span>
              </div>
              <div className="text-slate-500 mt-1 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-brand-teal" />
                <span className="font-medium text-slate-700">{activeParentTrip.driverPhone}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                {t.myVehicles}
              </span>
              <div className="font-bold text-sm text-slate-900">
                {activeParentTrip.vehicleDetails.make} {activeParentTrip.vehicleDetails.model}
              </div>
              <div className="text-slate-500 font-mono mt-1">
                {activeParentTrip.vehicleDetails.registrationNumber} ({activeParentTrip.vehicleDetails.transmission})
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                {t.paymentSuccessMsg || 'Remote Payment Status'}
              </span>
              <div className="font-bold text-sm text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.prepaidByGuardianBadge || 'Pre-Paid by You (Guardian)'}</span>
              </div>
              <div className="text-slate-500 mt-1">{t.totalFareLabel}: ₹{activeParentTrip.totalFare}</div>
            </div>
          </div>

          {activeParentTrip.status === 'arrival_confirmation_pending' && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
              <div>
                <strong className="block font-bold">{t.safeArrivalQuestion}</strong>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {t.safeArrivalSub}
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-[11px]">
                {t.safetyArrivalCheck}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h3 className="font-bold text-base text-brand-navy">
            {t.safeArrivalSub || 'No active trips currently in transit'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t.familyCareSub}
          </p>
          <div className="pt-2">
            <Link
              href="/family/book"
              className="px-6 py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-2xl text-xs inline-block shadow-sm transition-all"
            >
              {t.bookDriverBtn || 'Book Upcoming Trip'}
            </Link>
          </div>
        </div>
      )}

      {/* PARENT CAR & DRIVER CIRCLE SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parent's Car */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-brand-navy flex items-center gap-2">
              <Car className="w-4 h-4 text-brand-teal" />
              <span>{t.defaultCarBadge}</span>
            </h3>
            <span className="text-[10px] bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600 font-semibold border border-slate-200">
              {t.verifApproved || 'Authorized'}
            </span>
          </div>

          {parentVehicle && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                <span>{parentVehicle.make} {parentVehicle.model}</span>
                <span className="font-mono text-xs text-slate-500">{parentVehicle.registrationNumber}</span>
              </div>
              <div className="text-slate-500 capitalize">
                {parentVehicle.transmission} • {parentVehicle.fuelType} • {parentVehicle.year}
              </div>
              {parentVehicle.specialHandlingNotes && (
                <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  {t.specialNotesLabel}: {parentVehicle.specialHandlingNotes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Favorite Family Driver */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-brand-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.preferTrustedDrivers || 'Preferred Family Driver'}</span>
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
              {t.trustedCircleBadge || 'Trusted Circle'}
            </span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80"
              alt="Driver"
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <div className="font-bold text-slate-900 text-sm">
                Suresh Kumar
              </div>
              <div className="text-slate-500">
                8 {t.experienceYearsLabel || 'yrs'} • 4.95 ★ ({t.indiranagarKoramangala})
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                {t.policeVerifiedBadge}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FamilyGuardianDashboard() {
  return (
    <AuthGuard allowedRoles={['family_guardian', 'customer', 'admin']}>
      <FamilyGuardianDashboardContent />
    </AuthGuard>
  );
}
