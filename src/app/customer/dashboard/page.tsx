'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { getTranslation, formatBookingStatus } from '@/lib/i18n';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SeniorModeContainer } from '@/components/senior/SeniorModeContainer';
import { LiveTripMap } from '@/components/maps/LiveTripMap';
import {
  Car,
  Star,
  Users,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

function CustomerDashboardContent() {
  const router = useRouter();
  const {
    currentUser,
    seniorMode,
    toggleSeniorMode,
    language,
    vehicles,
    drivers,
    trustedDrivers,
    trustedDriverIds,
    bookings,
    confirmArrival,
  } = useApp();

  const t = getTranslation(language);

  if (!currentUser) return null;

  // Active bookings for the current customer
  const myBookings = bookings.filter((b) => b.customerId === currentUser.id);
  const activeTrip = myBookings.find(
    (b) =>
      b.status === 'driver_assigned' ||
      b.status === 'confirmed' ||
      b.status === 'driver_en_route' ||
      b.status === 'driver_arrived' ||
      b.status === 'trip_started'
  );

  const pendingArrival = myBookings.find(
    (b) => b.status === 'arrival_confirmation_pending' || b.status === 'trip_completed'
  );

  const defaultVehicle = vehicles.find((v) => v.isDefault) || vehicles[0];

  const handleQuickBook = (destination: string, category: string) => {
    router.push(
      `/customer/book?destination=${encodeURIComponent(destination)}&category=${encodeURIComponent(
        category
      )}`
    );
  };

  return (
    <div data-read-aloud className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* If Senior Citizen Mode is ON, render dedicated high-contrast one-tap accessibility interface */}
      {seniorMode ? (
        <SeniorModeContainer />
      ) : (
        /* Standard Customer Dashboard (Light Theme) */
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="text-xs bg-brand-softBlue text-brand-teal border border-brand-teal/20 px-2.5 py-0.5 rounded-full font-bold">
                  {t.vehicleOwnerBadge || 'Vehicle Owner'}
                </span>
              </div>
              <p className="text-slate-600 text-sm">
                {t.tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/customer/book"
                className="px-6 py-3 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-2xl text-sm shadow-md shadow-brand-teal/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
              >
                <Car className="w-4 h-4" />
                <span>{t.bookDriver || 'Book a Driver Now'}</span>
              </Link>

              <button
                onClick={toggleSeniorMode}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-colors"
                title="Switch to larger fonts & simplified senior navigation"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>{seniorMode ? t.seniorModeOn : t.seniorMode}</span>
              </button>
            </div>
          </div>

          {/* SAFE ARRIVAL CONFIRMATION PENDING NOTICE */}
          {pendingArrival && (
            <div className="bg-rose-50 border-2 border-rose-500 rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                  📍
                </div>
                <div>
                  <h3 className="text-lg font-black text-rose-950">
                    {t.safeArrivalQuestion || 'Safe Arrival Confirmation Pending'}
                  </h3>
                  <p className="text-xs text-rose-800">
                    {pendingArrival.driverName} • {pendingArrival.destinationAddress.split(',')[0]}
                  </p>
                </div>
              </div>

              <button
                onClick={() => confirmArrival(pendingArrival.id)}
                className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t.confirmArrivalBtn || 'Yes, I Have Reached Safely'}</span>
              </button>
            </div>
          )}

          {/* ACTIVE TRIP & LIVE TELEMATICS MAP */}
          {activeTrip && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h2 className="text-lg font-bold text-brand-navy">
                    {t.liveTrackingTitle || 'Live Active Trip'} ({activeTrip.bookingCode})
                  </h2>
                </div>
                <div className="text-xs text-slate-500">
                  {t.status}:{' '}
                  <strong className="text-brand-teal uppercase font-bold">
                    {formatBookingStatus(activeTrip.status, language)}
                  </strong>
                </div>
              </div>

              {/* Map */}
              <LiveTripMap
                pickupAddress={activeTrip.pickupAddress}
                destAddress={activeTrip.destinationAddress}
                driverLocation={activeTrip.liveLocation}
                status={activeTrip.status}
              />

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold mb-0.5">{t.assignedDriver}</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {activeTrip.driverName} (4.9 ★)
                  </div>
                  <div className="text-slate-500 mt-1">{t.phoneLabel}: {activeTrip.driverPhone}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold mb-0.5">{t.myVehicles}</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {activeTrip.vehicleDetails.make} {activeTrip.vehicleDetails.model}
                  </div>
                  <div className="text-slate-500 mt-1">
                    {activeTrip.vehicleDetails.registrationNumber} ({activeTrip.vehicleDetails.transmission})
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block font-semibold mb-0.5">{t.familyGuardianTitle}</span>
                  <div className="font-bold text-emerald-600 text-sm">
                    {t.familyAssistanceMsg || 'Guardian Remote Tracking Active'}
                  </div>
                  <div className="text-slate-500 mt-1">{t.gpsActiveNotice}</div>
                </div>
              </div>
            </div>
          )}

          {/* QUICK OVERVIEW TILES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Registered Vehicle Tile */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-brand-navy flex items-center gap-2">
                  <Car className="w-4 h-4 text-brand-teal" />
                  <span>{t.defaultCarBadge}</span>
                </h3>
                <Link
                  href="/customer/vehicles"
                  className="text-xs text-brand-teal hover:underline font-semibold"
                >
                  {t.editVehicle} ({vehicles.length})
                </Link>
              </div>

              {defaultVehicle ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">
                      {defaultVehicle.make} {defaultVehicle.model}
                    </span>
                    <span className="text-[11px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                      {defaultVehicle.registrationNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="capitalize">{defaultVehicle.transmission}</span>
                    <span>•</span>
                    <span className="capitalize">{defaultVehicle.fuelType}</span>
                    <span>•</span>
                    <span>{defaultVehicle.year}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Link
                    href="/customer/vehicles"
                    className="text-xs text-brand-teal font-bold hover:underline"
                  >
                    + {t.registerVehicleBtn}
                  </Link>
                </div>
              )}

              <Link
                href="/customer/book"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t.bookDriverBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Trusted Driver Circle Tile */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-brand-navy flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>{t.trustedDrivers}</span>
                </h3>
                <Link
                  href="/customer/trusted-drivers"
                  className="text-xs text-brand-teal hover:underline font-semibold"
                >
                  {t.filterAll} ({trustedDriverIds.length})
                </Link>
              </div>

              <div className="space-y-2">
                {drivers
                  .filter((d) => trustedDriverIds.includes(d.id))
                  .slice(0, 3)
                  .map((drv) => (
                    <div
                      key={drv.id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={drv.photoUrl}
                          alt={drv.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {drv.name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {drv.rating} ★ • {drv.experienceYears} {t.experienceYearsLabel || 'yrs'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        {t.statusStarted || 'Available'}
                      </span>
                    </div>
                  ))}
              </div>

              <Link
                href="/customer/book"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t.preferTrustedDrivers || 'Request Preferred Driver'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Family Guardian Tile */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-brand-navy flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-teal" />
                  <span>{t.familyCircleTitle}</span>
                </h3>
                <Link
                  href="/customer/family"
                  className="text-xs text-brand-teal hover:underline font-semibold"
                >
                  {t.familyCircleTitle}
                </Link>
              </div>

              <div className="bg-brand-softBlue/60 p-3.5 rounded-2xl border border-brand-teal/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-brand-navy">
                    Rohan Sharma (Son)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {t.verifApproved || 'Active'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {t.familyCareSub || 'Authorized to book hospital trips, manage schedules, and receive live arrival alerts.'}
                </p>
              </div>

              <Link
                href="/customer/family"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{t.familyAssistanceMsg || 'Manage Family Permissions'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboard() {
  return (
    <AuthGuard allowedRoles={['customer', 'family_guardian']}>
      <CustomerDashboardContent />
    </AuthGuard>
  );
}
