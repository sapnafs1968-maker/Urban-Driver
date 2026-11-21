'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getTranslation, formatBookingStatus } from '@/lib/i18n';
import {
  Users,
  Car,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';

function FamilyTripsContent() {
  const { bookings, familyRelationships, currentUser, language } = useApp();
  const t = getTranslation(language);

  const relationship = familyRelationships.find(
    (r) => r.guardianUserId === currentUser?.id && r.status === 'active'
  );
  const parentId = relationship?.customerId || 'usr_cust_ramesh';
  const parentName = relationship?.customerName || 'Ramesh Sharma';

  const trips = bookings.filter((b) => b.customerId === parentId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-softBlue text-brand-teal rounded-full text-xs font-bold mb-2 border border-brand-teal/20">
            <Users className="w-3.5 h-3.5" />
            <span>{t.remoteFamilyMonitoring}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
            {t.bookingsTitle} ({parentName})
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t.bookingsSub}
          </p>
        </div>

        <Link
          href="/family/book"
          className="px-5 py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-2xl text-sm shadow-sm self-start sm:self-auto transition-all"
        >
          {t.bookForParent}
        </Link>
      </div>

      <div className="space-y-4">
        {trips.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-slate-400 text-xs">
            {t.noBookingsInTab}
          </div>
        ) : (
          trips.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-slate-500">{b.bookingCode}</span>
                  <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded font-semibold text-slate-700">
                    {b.pickupDate} at {b.pickupTime}
                  </span>
                </div>
                <span className="text-xs font-bold uppercase px-3 py-1 bg-brand-teal text-white rounded-full">
                  {formatBookingStatus(b.status, language)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.navForDrivers}</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {b.driverName}
                  </div>
                  <div className="text-slate-500">{t.phone}: {b.driverPhone}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.step3Route}</span>
                  <div className="font-bold text-slate-800">
                    {b.pickupAddress.split(',')[0]} ➔ {b.destinationAddress.split(',')[0]}
                  </div>
                  <div className="text-slate-500 font-mono">
                    {b.vehicleDetails.make} {b.vehicleDetails.model} ({b.vehicleDetails.registrationNumber})
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.safeArrivalQuestion}</span>
                  {b.arrivalConfirmation?.customerConfirmedAt ? (
                    <div className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.arrivalConfirmed}</span>
                    </div>
                  ) : (
                    <div className="text-amber-500 font-bold">
                      {formatBookingStatus(b.status, language)}
                    </div>
                  )}
                  <div className="text-slate-500">{t.totalFare}: ₹{b.totalFare}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function FamilyTripsPage() {
  return (
    <AuthGuard allowedRoles={['family_guardian', 'customer', 'admin']}>
      <FamilyTripsContent />
    </AuthGuard>
  );
}
