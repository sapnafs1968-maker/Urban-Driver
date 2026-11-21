'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { getTranslation, formatBookingStatus } from '@/lib/i18n';
import { Booking, BookingStatus } from '@/types';
import {
  Car,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  PhoneCall,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminBookingsPage() {
  const { bookings, drivers, updateBookingStatus, triggerDelayException, language } = useApp();
  const t = getTranslation(language);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(bookings[0]?.id || null);

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        b.bookingCode.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        (b.driverName && b.driverName.toLowerCase().includes(q)) ||
        b.pickupAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-bold mb-2">
          <Car className="w-3.5 h-3.5" />
          <span>{t.adminDispatch || 'Operations Dispatch & Trip Monitor'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.myBookings || 'Bookings & Trips Console'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.adminDispatchSub || 'Monitor live customer bookings, driver assignments, and trip telematics.'}
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t.searchDriversPlaceholder || 'Search by code, customer, driver, or pickup address...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
        >
          <option value="all">{t.filterAll || 'All Booking Statuses'}</option>
          <option value="driver_assigned">{formatBookingStatus('driver_assigned', language)}</option>
          <option value="driver_en_route">{formatBookingStatus('driver_en_route', language)}</option>
          <option value="driver_arrived">{formatBookingStatus('driver_arrived', language)}</option>
          <option value="trip_started">{formatBookingStatus('trip_started', language)}</option>
          <option value="arrival_confirmation_pending">{formatBookingStatus('arrival_confirmation_pending', language)}</option>
          <option value="closed">{formatBookingStatus('closed', language)}</option>
        </select>
      </div>

      {/* Bookings Table & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Bookings List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {t.myBookings} ({filteredBookings.length})
          </div>

          {filteredBookings.map((b) => {
            const isSelected = selectedBooking?.id === b.id;
            const isPendingArrival =
              b.status === 'arrival_confirmation_pending' || b.status === 'trip_completed';

            return (
              <div
                key={b.id}
                onClick={() => setSelectedBookingId(b.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected
                  ? 'border-brand-teal bg-brand-teal/5 shadow-md ring-2 ring-brand-teal/20'
                  : isPendingArrival
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {b.bookingCode}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isPendingArrival
                      ? 'bg-rose-500 text-white animate-pulse'
                      : b.status === 'closed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-brand-teal/10 text-brand-teal'
                      }`}
                  >
                    {formatBookingStatus(b.status, language)}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {b.customerName}
                </div>

                <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                  <span>{t.assignedDriver}: {b.driverName || t.statusPending}</span>
                  <span>{b.pickupDate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Booking Audit Console */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {selectedBooking ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="font-mono text-xs text-brand-teal font-bold">
                    {selectedBooking.bookingCode}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {selectedBooking.customerName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {t.phoneLabel}: {selectedBooking.customerPhone} • {t.totalFareLabel}: ₹{selectedBooking.totalFare}
                  </div>
                </div>

                <span className="text-xs font-black uppercase px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full">
                  {formatBookingStatus(selectedBooking.status, language)}
                </span>
              </div>

              {/* Vehicle & Assigned Driver */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">{t.myVehicles}</span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedBooking.vehicleDetails.make} {selectedBooking.vehicleDetails.model}
                  </div>
                  <div className="font-mono text-slate-500">
                    {selectedBooking.vehicleDetails.registrationNumber} ({selectedBooking.vehicleDetails.transmission})
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">{t.assignedDriver}</span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedBooking.driverName}
                  </div>
                  <div className="text-slate-500">{t.phoneLabel}: {selectedBooking.driverPhone}</div>
                </div>
              </div>

              {/* Status History Audit Trail */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {t.appStatusTitle || 'Status History & Audit Trail'}
                </h4>

                <div className="space-y-2 border-l-2 border-brand-teal/40 pl-4 text-xs">
                  {selectedBooking.statusHistory.map((sh, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <div className="w-2 h-2 rounded-full bg-brand-teal absolute -left-[21px] top-1.5" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white uppercase text-[11px]">
                          {formatBookingStatus(sh.status, language)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(sh.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {sh.note || t.status} {sh.actor ? `(${sh.actor})` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operator Action Bar */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 text-xs">
                {selectedBooking.status === 'arrival_confirmation_pending' && (
                  <button
                    onClick={() =>
                      updateBookingStatus(
                        selectedBooking.id,
                        'closed',
                        'Customer safe arrival confirmed via phone check by Operations Admin.'
                      )
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
                  >
                    {t.confirmArrivalBtn}
                  </button>
                )}

                <button
                  onClick={() =>
                    triggerDelayException(
                      selectedBooking.id,
                      'Operations Flag: Route congestion reported near Old Airport Road.'
                    )
                  }
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold rounded-xl"
                >
                  {t.testDelay || 'Flag Delay Exception Alert'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">
              {t.filterAll}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
