'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { ReadAloudControls } from '@/components/accessibility/ReadAloudControls';
import {
  Car,
  PhoneCall,
  Star,
  MapPin,
  CheckCircle2,
  Compass,
  ShieldCheck,
} from 'lucide-react';

export const SeniorAccessibilityBar: React.FC = () => {
  const { currentUser, seniorMode, bookings, language } = useApp();
  const t = getTranslation(language);

  // Apply/remove global senior-mode-active CSS class on <html>
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('senior-mode-active', seniorMode);
  }, [seniorMode]);

  if (!seniorMode) return null;

  const customerId = currentUser?.id || 'usr_cust_ramesh';
  const pendingArrival = bookings.find(
    (b) =>
      b.customerId === customerId &&
      (b.status === 'arrival_confirmation_pending' || b.status === 'trip_completed')
  );

  return (
    <div
      data-no-read-aloud
      className="bg-slate-900 text-white border-b-2 border-emerald-500/60 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 space-y-3">
        {/* Read Aloud Bar */}
        <ReadAloudControls variant="senior" />

        {/* Essential Senior Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs sm:text-sm font-bold">
          <Link
            href="/customer/dashboard"
            className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 text-center"
          >
            <MapPin className="w-4 h-4 text-brand-tealLight shrink-0" />
            <span className="truncate">Saved Places</span>
          </Link>

          <Link
            href="/customer/book"
            className="min-h-[44px] px-3 py-2 bg-brand-teal hover:bg-brand-tealDark rounded-xl flex items-center justify-center gap-1.5 text-white text-center"
          >
            <Car className="w-4 h-4 shrink-0" />
            <span className="truncate">{t.bookDriver || 'Book a Driver'}</span>
          </Link>

          <Link
            href="/customer/bookings"
            className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 text-center"
          >
            <Compass className="w-4 h-4 text-brand-tealLight shrink-0" />
            <span className="truncate">My Trip</span>
          </Link>

          <Link
            href="/customer/drivers"
            className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 text-center"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">My Driver</span>
          </Link>

          <Link
            href="/customer/trusted-drivers"
            className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 text-center"
          >
            <Star className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{t.trustedDrivers || 'Trusted Drivers'}</span>
          </Link>

          {pendingArrival ? (
            <Link
              href="/customer/dashboard"
              className="min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-1.5 text-white text-center animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">Confirm Arrival</span>
            </Link>
          ) : (
            <Link
              href="/customer/bookings"
              className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 text-center"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Arrival Status</span>
            </Link>
          )}

          <a
            href="tel:18005550199"
            className="min-h-[44px] px-3 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center justify-center gap-1.5 text-white text-center col-span-2 sm:col-span-1"
          >
            <PhoneCall className="w-4 h-4 shrink-0" />
            <span className="truncate">Call for Help</span>
          </a>
        </div>
      </div>
    </div>
  );
};
