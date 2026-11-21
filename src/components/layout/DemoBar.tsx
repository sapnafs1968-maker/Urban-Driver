'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import {
  Users,
  RotateCcw,
  FastForward,
  AlertTriangle,
  HeartHandshake,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { DEMO_ACCOUNTS } from '@/lib/demo-data';

export const DemoBar: React.FC = () => {
  const {
    currentUser,
    switchDemoRole,
    resetDemoData,
    bookings,
    updateBookingStatus,
    triggerDelayException,
    seniorMode,
    toggleSeniorMode,
    language,
  } = useApp();
  const t = getTranslation(language);

  const [isOpen, setIsOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSimulateNextStep = () => {
    const activeBooking = bookings.find(
      (b) =>
        b.status === 'driver_assigned' ||
        b.status === 'confirmed' ||
        b.status === 'driver_en_route' ||
        b.status === 'driver_arrived' ||
        b.status === 'trip_started' ||
        b.status === 'trip_completed' ||
        b.status === 'arrival_confirmation_pending'
    );

    if (!activeBooking) {
      showToast('No active booking to advance. Create a booking first!');
      return;
    }

    if (activeBooking.status === 'driver_en_route') {
      updateBookingStatus(activeBooking.id, 'driver_arrived', 'Driver reached pickup location');
      showToast(`Booking ${activeBooking.bookingCode}: Driver marked "Arrived at Pickup"`);
    } else if (activeBooking.status === 'driver_arrived') {
      updateBookingStatus(activeBooking.id, 'trip_started', 'Trip started. Driving to destination.');
      showToast(`Booking ${activeBooking.bookingCode}: Trip Started!`);
    } else if (activeBooking.status === 'trip_started') {
      updateBookingStatus(
        activeBooking.id,
        'arrival_confirmation_pending',
        'Reached destination. Awaiting senior arrival confirmation.'
      );
      showToast(`Booking ${activeBooking.bookingCode}: Trip Completed! "Arrival Confirmation Pending"`);
    } else if (activeBooking.status === 'arrival_confirmation_pending') {
      updateBookingStatus(activeBooking.id, 'closed', 'Customer confirmed safe arrival.');
      showToast(`Booking ${activeBooking.bookingCode}: Arrival Confirmed! Trip Closed safely.`);
    } else {
      updateBookingStatus(activeBooking.id, 'driver_en_route', 'Driver is on the way.');
      showToast(`Booking ${activeBooking.bookingCode}: Driver En Route!`);
    }
  };

  const handleSimulateDelayAlert = () => {
    const pendingBooking = bookings.find((b) => b.status === 'arrival_confirmation_pending') || bookings[0];
    if (pendingBooking) {
      triggerDelayException(
        pendingBooking.id,
        'SIMULATED ALERT: Arrival unconfirmed for 35 mins. Guardian & Operations escalated.'
      );
      showToast('⚠️ Exception Alert triggered! Family Guardian & Admin incident created.');
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-brand-navy text-white px-5 py-2.5 rounded-full shadow-2xl border border-brand-teal flex items-center gap-2 text-sm font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Floating Interactive Demo Controller (Light Theme) */}
      <div className="fixed bottom-3 right-3 z-40 max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal">
              {t.demoSandbox}
            </span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 font-semibold">
              {currentUser ? `${currentUser.name.split(' ')[0]} (${currentUser.role})` : t.visitorGuest}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''
              }`}
          />
        </div>

        {isOpen && (
          <div className="p-3.5 border-t border-slate-100 space-y-3 text-xs bg-white">
            {/* Quick Role Switcher */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-teal" />
                <span>{t.demoPersonaSwitch}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isCurrent = currentUser?.email === acc.profile.email;
                  return (
                    <button
                      key={acc.role}
                      onClick={() => {
                        switchDemoRole(acc.role);
                        showToast(`Switched to: ${acc.profile.name} (${acc.profile.role})`);
                      }}
                      className={`p-2 text-left rounded-xl transition-all border ${isCurrent
                        ? 'bg-brand-softBlue text-brand-navy border-brand-teal font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <div className="truncate font-semibold">{acc.profile.name}</div>
                      <div className="text-[10px] text-slate-500 truncate capitalize">
                        {acc.role.replace('_', ' ')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Workflow Action Triggers */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FastForward className="w-3.5 h-3.5 text-brand-teal" />
                <span>{t.workflowAccelerators}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={handleSimulateNextStep}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl flex items-center gap-1 transition-all font-semibold"
                  title="Advances active booking along lifecycle"
                >
                  <FastForward className="w-3.5 h-3.5 text-brand-teal" />
                  <span>{t.advanceTrip}</span>
                </button>

                <button
                  onClick={handleSimulateDelayAlert}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-1 transition-all font-semibold"
                  title="Simulates missing arrival exception"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.testDelay}</span>
                </button>

                <button
                  onClick={toggleSeniorMode}
                  className={`px-2.5 py-1.5 border rounded-xl flex items-center gap-1 transition-all font-semibold ${seniorMode
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.seniorMode}: {seniorMode ? t.seniorModeOn : t.seniorModeOff}</span>
                </button>

                <button
                  onClick={() => {
                    resetDemoData();
                    showToast('Demo data reset to factory guest state!');
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-xl flex items-center gap-1 transition-all ml-auto font-semibold"
                  title="Clear storage and restore initial sample records"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.resetDemo}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
