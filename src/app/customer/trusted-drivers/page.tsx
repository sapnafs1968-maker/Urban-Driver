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
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function TrustedDriverCirclePage() {
  const {
    currentUser,
    drivers,
    trustedDrivers,
    setTrustedDriverRole,
    removeTrustedDriver,
    language,
  } = useApp();
  const t = getTranslation(language);

  const customerId = currentUser?.id || 'usr_cust_ramesh';

  const activeTrustedEntries = trustedDrivers.filter(
    (td) => td.customerId === customerId && td.trustedStatus === 'active'
  );

  // Join with live driver records and sort Primary first, then Backup
  const enrichedTrusted = activeTrustedEntries
    .map((td) => {
      const driver = drivers.find((d) => d.id === td.driverId);
      if (!driver) return null;
      return { entry: td, driver };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => {
      if (a.entry.isPrimary && !b.entry.isPrimary) return -1;
      if (!a.entry.isPrimary && b.entry.isPrimary) return 1;
      return b.entry.completedTripsCount - a.entry.completedTripsCount;
    });

  const primaryItem = enrichedTrusted.find((item) => item.entry.isPrimary);
  const isPrimaryUnavailable =
    primaryItem &&
    (Boolean(primaryItem.driver.currentActiveBookingId) || !primaryItem.driver.isAvailable);

  const nextAvailableBackup = enrichedTrusted.find(
    (item) =>
      !item.entry.isPrimary &&
      item.driver.verificationStatus === 'verified' &&
      item.driver.isAvailable &&
      !item.driver.currentActiveBookingId
  );

  const fallbackAvailableDriver = drivers.find(
    (d) =>
      d.verificationStatus === 'verified' &&
      d.isAvailable &&
      !d.currentActiveBookingId &&
      !enrichedTrusted.some((item) => item.driver.id === d.id)
  );

  const getAvailabilityBadge = (driver: typeof drivers[0]) => {
    if (driver.currentActiveBookingId) {
      return {
        label: 'Currently on a trip',
        cls: 'bg-rose-100 text-rose-800 border-rose-200',
      };
    }
    if (!driver.isAvailable) {
      return {
        label: 'Unavailable',
        cls: 'bg-slate-200 text-slate-700 border-slate-300',
      };
    }
    return {
      label: 'Available',
      cls: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
  };

  return (
    <div data-read-aloud className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            <span>{t.trustedCircleBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.trustedCircleTitle} & Backup Drivers
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Drivers are automatically added after completed trips. Set your Preferred Driver and Backup Drivers below.
          </p>
        </div>

        <Link
          href="/customer/drivers"
          className="px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 self-start"
        >
          <span>Browse Verified Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Primary Driver Unavailable -> Backup Recommendation Banner */}
      {isPrimaryUnavailable && (
        <div className="p-5 bg-amber-50 border-2 border-amber-400 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 space-y-1">
              <strong className="text-sm font-black block">
                Your Preferred Driver ({primaryItem.driver.name}) is{' '}
                {primaryItem.driver.currentActiveBookingId ? 'currently on a trip' : 'unavailable'}
              </strong>
              <p>
                {nextAvailableBackup
                  ? `Your Backup Driver ${nextAvailableBackup.driver.name} (${nextAvailableBackup.driver.rating} ★) is available right now.`
                  : fallbackAvailableDriver
                  ? `Verified driver ${fallbackAvailableDriver.name} is available as an alternative.`
                  : 'All trusted drivers are currently occupied. You can still browse the verified directory.'}
              </p>
            </div>
          </div>

          {(nextAvailableBackup || fallbackAvailableDriver) && (
            <Link
              href={`/customer/book?preferredDriverId=${
                nextAvailableBackup ? nextAvailableBackup.driver.id : fallbackAvailableDriver!.id
              }`}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 text-center"
            >
              Book {nextAvailableBackup ? 'Backup Driver' : 'Alternative Driver'} →
            </Link>
          )}
        </div>
      )}

      {enrichedTrusted.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto text-3xl">
            ⭐
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.emptyTrustedTitle}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete a ride with any verified driver or add one from the Verified Drivers Directory to build your circle.
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
          {enrichedTrusted.map(({ entry, driver }) => {
            const avail = getAvailabilityBadge(driver);
            const canBook =
              driver.verificationStatus === 'verified' &&
              driver.isAvailable &&
              !driver.currentActiveBookingId;

            return (
              <div
                key={entry.id}
                className={`bg-white dark:bg-slate-900 border-2 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between ${
                  entry.isPrimary
                    ? 'border-amber-400'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  {/* Role & Availability Labels */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {entry.isPrimary ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase">
                        ★ Preferred Driver
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-black uppercase">
                        Backup Driver
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${avail.cls}`}
                    >
                      {avail.label}
                    </span>
                  </div>

                  {/* Driver Identity */}
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
                          {driver.verificationStatus === 'verified' && (
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          )}
                        </h3>
                        <div className="text-xs text-slate-500">
                          {driver.experienceYears} yrs exp • {driver.serviceArea.split('&')[0]}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                          {driver.rating} ★ • {entry.completedTripsCount} trips with you
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeTrustedDriver(driver.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove from Trusted Circle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Driver's Vehicle & Verification Details */}
                  <div className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Verification:</span>
                      <span className="font-bold text-emerald-700 uppercase">
                        {driver.verificationStatus}
                      </span>
                    </div>
                    {driver.registeredVehicle && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Driver Vehicle:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {driver.registeredVehicle.manufacturer} {driver.registeredVehicle.model} (
                          {driver.registeredVehicle.registrationNumber})
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Contact:</span>
                      <a
                        href={`tel:${driver.phone}`}
                        className="font-bold text-brand-teal flex items-center gap-1 hover:underline"
                      >
                        <PhoneCall className="w-3 h-3" /> {driver.phone}
                      </a>
                    </div>
                  </div>

                  {/* Role Switcher */}
                  <div className="flex items-center gap-2 text-[11px]">
                    {!entry.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setTrustedDriverRole(driver.id, 'primary')}
                        className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-200"
                      >
                        Set as Preferred
                      </button>
                    )}
                    {entry.isPrimary && enrichedTrusted.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setTrustedDriverRole(driver.id, 'backup')}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200"
                      >
                        Move to Backup
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {canBook ? (
                    <>
                      <Link
                        href={`/customer/book?preferredDriverId=${driver.id}`}
                        className="w-full py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Book {driver.name.split(' ')[0]}</span>
                      </Link>
                      <Link
                        href={`/customer/book?preferredDriverId=${driver.id}&recurring=true`}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Repeat className="w-3.5 h-3.5 text-brand-teal" />
                        <span>Schedule Recurring</span>
                      </Link>
                    </>
                  ) : (
                    <div className="w-full py-2.5 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs text-center border border-slate-200">
                      {driver.currentActiveBookingId
                        ? 'Currently completing another ride'
                        : 'Currently Offline / Unavailable'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
