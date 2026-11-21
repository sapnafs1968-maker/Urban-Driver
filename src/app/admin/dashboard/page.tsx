'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { getTranslation, formatBookingStatus, formatVerificationStatus } from '@/lib/i18n';
import { AuthGuard } from '@/components/auth/AuthGuard';
import {
  Users,
  ShieldCheck,
  Car,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  PhoneCall,
  DollarSign,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function AdminDashboardContent() {
  const {
    drivers,
    bookings,
    supportTickets,
    incidentReports,
    assistedRequests,
    institutionalLeads,
    vehicles,
    language,
  } = useApp();

  const t = getTranslation(language);

  const totalDrivers = drivers.length;
  const verifiedDrivers = drivers.filter((d) => d.verificationStatus === 'verified').length;
  const pendingDrivers = drivers.filter((d) => d.verificationStatus === 'pending_review').length;

  const totalBookings = bookings.length;
  const activeTrips = bookings.filter(
    (b) =>
      b.status === 'driver_assigned' ||
      b.status === 'confirmed' ||
      b.status === 'driver_en_route' ||
      b.status === 'driver_arrived' ||
      b.status === 'trip_started'
  ).length;

  const pendingArrivalTrips = bookings.filter(
    (b) => b.status === 'arrival_confirmation_pending' || b.status === 'trip_completed'
  ).length;

  const completedTrips = bookings.filter((b) => b.status === 'closed').length;

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalFare || 0), 0);
  const totalPlatformFees = bookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);

  const openTickets = supportTickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const pendingAssisted = assistedRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Operations Header (Light Theme) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-softBlue text-brand-teal rounded-full text-xs font-bold mb-2 border border-brand-teal/20">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
            <span>{t.navOverview || 'Operations Central Control Desk'} ({t.indiranagarKoramangala})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
            {t.navDashboard || 'Platform Operations & Dispatch Hub'}
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            {t.tagline}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/verification"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{t.navVerification || 'Driver Verification'} ({pendingDrivers})</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="px-5 py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-2xl text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t.navAnalytics || 'Pilot Analytics'}</span>
          </Link>
        </div>
      </div>

      {/* METRIC KPI TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Bookings */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">{t.myBookings}</span>
          <div className="text-3xl font-black text-brand-navy">
            {totalBookings}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            {activeTrips} active • {completedTrips} {t.statusClosed}
          </div>
        </div>

        {/* Drivers */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">{t.verifiedDriver}</span>
          <div className="text-3xl font-black text-brand-navy">
            {verifiedDrivers} <span className="text-sm font-normal text-slate-400">/ {totalDrivers}</span>
          </div>
          <div className="text-[11px] text-amber-600 font-semibold">
            {pendingDrivers} {t.verifUnderReview}
          </div>
        </div>

        {/* Revenue & Platform Fees */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">{t.grossEarnings}</span>
          <div className="text-3xl font-black text-brand-navy">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-brand-teal font-semibold">
            {t.platformFeeLabel}: ₹{totalPlatformFees.toLocaleString()}
          </div>
        </div>

        {/* Open Complaints / Alerts */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">{t.supportDeskTitle}</span>
          <div className="text-3xl font-black text-brand-navy">
            {openTickets}
          </div>
          <div className="text-[11px] text-rose-500 font-semibold">
            {incidentReports.length} {t.testDelay}
          </div>
        </div>
      </div>

      {/* QUICK OPERATIONAL WORKFLOW PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Verification & Assisted Booking Desk */}
        <div className="lg:col-span-6 space-y-6">
          {/* Driver Document Verification Queue */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-brand-navy flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-500" />
                <span>{t.navVerification} ({pendingDrivers})</span>
              </h3>
              <Link
                href="/admin/verification"
                className="text-xs text-brand-teal hover:underline font-bold"
              >
                {t.previewTripBtn} →
              </Link>
            </div>

            <div className="space-y-3">
              {drivers
                .filter((d) => d.verificationStatus === 'pending_review')
                .map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={d.photoUrl}
                        alt={d.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {d.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {d.experienceYears} yrs • {d.serviceArea}
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/admin/verification"
                      className="px-3.5 py-1.5 bg-brand-teal text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      {t.previewTripBtn}
                    </Link>
                  </div>
                ))}
            </div>
          </div>

          {/* Assisted Phone & WhatsApp Booking Desk */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-brand-navy flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-500" />
                <span>{t.assistedBookingTitle} ({pendingAssisted})</span>
              </h3>
              <span className="text-xs text-slate-400">1800 Helpline & WhatsApp</span>
            </div>

            <div className="space-y-3">
              {assistedRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{req.callerName} ({req.channel.toUpperCase()})</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        req.status === 'converted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    {t.phoneLabel}: <a href={`tel:${req.callerPhone}`} className="underline font-bold text-slate-700">{req.callerPhone}</a> • {t.vehicleCategoryLabel}: {req.vehicleType}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {req.pickupArea} → {req.destinationArea}
                  </div>
                  {req.operatorNotes && (
                    <div className="text-[10px] text-slate-500 italic bg-white p-2 rounded-xl border border-slate-200">
                      {req.operatorNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Delayed Journeys & Safe Arrival Monitor */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-brand-navy flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>{t.safeArrivalTitle || 'Delayed Journeys & Arrival Exception Watch'}</span>
              </h3>
              <span className="text-xs text-slate-400">Auto-Escalation Engine</span>
            </div>

            <div className="space-y-3 text-xs">
              {bookings
                .filter((b) => b.status === 'arrival_confirmation_pending')
                .map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-950">
                        {b.customerName} ({b.bookingCode})
                      </span>
                      <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">
                        {formatBookingStatus('arrival_confirmation_pending', language)}
                      </span>
                    </div>
                    <p className="text-rose-800 text-[11px]">
                      {t.dropoffAddressLabel}: {b.destinationAddress}. Completed {b.updatedAt ? new Date(b.updatedAt).toLocaleTimeString() : 'recently'}. Guardian notification queued.
                    </p>
                  </div>
                ))}

              {bookings.filter((b) => b.status === 'arrival_confirmation_pending').length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {t.safeArrivalSub || 'No active exceptions or arrival delays detected across the network.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <AdminDashboardContent />
    </AuthGuard>
  );
}
