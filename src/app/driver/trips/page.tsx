'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getTranslation, formatBookingStatus } from '@/lib/i18n';
import { Car, Calendar, Clock, MapPin, CheckCircle2, PhoneCall } from 'lucide-react';

function DriverTripsContent() {
  const { bookings, drivers, currentUser, language } = useApp();
  const t = getTranslation(language);

  const currentDriver = (currentUser && drivers.find((d) => d.userId === currentUser.id)) || drivers[0];
  const driverTrips = bookings.filter((b) => b.driverId === currentDriver.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
          {t.assignedTripsTitle}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.assignedTripsSub}
        </p>
      </div>

      <div className="space-y-4">
        {driverTrips.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-slate-400 text-xs">
            {t.noBookingsInTab}
          </div>
        ) : (
          driverTrips.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-500">{b.bookingCode}</span>
                  <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded font-semibold text-slate-700">
                    {b.pickupDate} at {b.pickupTime}
                  </span>
                </div>
                <span className="text-xs font-bold uppercase px-3 py-1 bg-brand-teal text-white rounded-full">
                  {t.status}: {formatBookingStatus(b.status, language)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.imCustomer}</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {b.customerName}
                  </div>
                  <div className="text-slate-500">{b.customerPhone}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.selectVehicle}</span>
                  <div className="font-bold text-slate-800">
                    {b.vehicleDetails.make} {b.vehicleDetails.model}
                  </div>
                  <div className="text-slate-500 font-mono">
                    {b.vehicleDetails.registrationNumber} ({b.vehicleDetails.transmission === 'automatic' ? t.transAutomatic : t.transManual})
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.price}</span>
                  <div className="text-base font-black text-emerald-600">
                    ₹{b.baseFare + b.durationFare}
                  </div>
                  <div className="text-[11px] text-slate-400">{t.settledThisMonth}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function DriverTripsPage() {
  return (
    <AuthGuard allowedRoles={['driver', 'admin']}>
      <DriverTripsContent />
    </AuthGuard>
  );
}
