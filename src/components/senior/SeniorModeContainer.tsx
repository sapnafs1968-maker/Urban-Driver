'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { speakText, startListening } from '@/lib/voice';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import {
  PhoneCall,
  Volume2,
  Mic,
  MapPin,
  CheckCircle2,
  HeartHandshake,
  Calendar,
  Clock,
  Car,
  ShieldCheck,
  Star,
  Sparkles,
} from 'lucide-react';

interface SeniorModeContainerProps {
  onQuickBook?: (destination: string, category: string) => void;
}

export const SeniorModeContainer: React.FC<SeniorModeContainerProps> = ({ onQuickBook }) => {
  const {
    currentUser,
    language,
    vehicles,
    drivers,
    trustedDriverIds,
    bookings,
    confirmArrival,
  } = useApp();

  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const t = translations[language];

  // Quick destinations for seniors
  const quickDestinations = [
    {
      title: t.hospitalClinic,
      address: 'Manipal Hospital, Old Airport Road, Kodihalli',
      icon: '🏥',
      category: 'Hospital',
    },
    {
      title: t.doctorVisit,
      address: 'Apollo Clinic, 100 Feet Road, Indiranagar',
      icon: '🩺',
      category: 'Doctor',
    },
    {
      title: t.templeMarket,
      address: 'Ragigudda Anjaneya Temple, 9th Block, Jayanagar',
      icon: '🛕',
      category: 'Temple',
    },
    {
      title: t.homeReturn,
      address: '142, Defence Colony, Indiranagar, Bengaluru',
      icon: '🏡',
      category: 'Home',
    },
  ];

  // Active or pending arrival confirmation booking
  const pendingArrivalBooking = bookings.find(
    (b) =>
      b.customerId === currentUser?.id &&
      (b.status === 'arrival_confirmation_pending' || b.status === 'trip_completed')
  );

  const activeTripBooking = bookings.find(
    (b) =>
      b.customerId === currentUser?.id &&
      (b.status === 'driver_assigned' ||
        b.status === 'driver_en_route' ||
        b.status === 'driver_arrived' ||
        b.status === 'trip_started')
  );

  // Preferred driver
  const preferredDriver = drivers.find((d) => trustedDriverIds.includes(d.id)) || drivers[0];

  const handleVoiceListen = () => {
    setVoiceListening(true);
    setVoiceNotice(t.speakToBook);
    speakText(t.whereToGo, language);

    const stop = startListening(
      (transcript) => {
        setVoiceListening(false);
        setVoiceNotice(`"${transcript}"`);
        if (onQuickBook) {
          onQuickBook(transcript, 'Voice Request');
        }
      },
      (error) => {
        setVoiceListening(false);
        setVoiceNotice('Voice query cancelled or not heard.');
      },
      language
    );

    setTimeout(() => {
      setVoiceListening(false);
      stop();
    }, 7000);
  };

  const handleReadScreen = () => {
    let msg = '';
    if (pendingArrivalBooking) {
      msg = `${t.safeArrivalQuestion} ${t.confirmArrivalBtn}`;
    } else if (activeTripBooking) {
      msg = `${t.driverAssignedMsg} ${activeTripBooking.driverName}. ${activeTripBooking.vehicleDetails.make} ${activeTripBooking.vehicleDetails.model}.`;
    } else {
      msg = `${t.whereToGo} ${t.doctorVisit}, ${t.hospitalClinic}, ${t.templeMarket}.`;
    }
    speakText(msg, language);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">

      {/* Top Senior Banner - Apple inspired clean, high contrast */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-teal/20 text-brand-tealLight flex items-center justify-center font-black text-2xl shadow-inner border border-brand-teal/30">
            👴
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">
                {currentUser?.name || 'Senior Citizen'}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide border border-emerald-500/30">
                {t.seniorModeOn}
              </span>
            </div>
            <p className="text-slate-300 text-sm sm:text-base mt-1">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Language selector & Voice Call Assistance */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <LanguageSelector variant="prominent" />

          <button
            onClick={handleReadScreen}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 border border-slate-700 shadow-sm transition-all"
            title="Read instructions aloud"
          >
            <Volume2 className="w-4 h-4 text-brand-tealLight" />
            <span>{t.readAloud}</span>
          </button>

          <a
            href="tel:18005550199"
            className="px-5 py-3 bg-brand-teal hover:bg-brand-tealDark text-white rounded-full text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t.callSupport}</span>
          </a>
        </div>
      </div>

      {/* PENDING ARRIVAL CONFIRMATION ALERT (CORE DIFFERENTIATOR 4) */}
      {pendingArrivalBooking && (
        <div className="bg-rose-50/80 dark:bg-rose-950/40 border-2 border-rose-500 rounded-3xl p-6 sm:p-10 shadow-2xl animate-pulse text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center mx-auto text-3xl shadow-lg">
            📍
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-rose-950 dark:text-rose-100">
            {t.safeArrivalQuestion}
          </h2>
          <p className="text-base sm:text-lg text-rose-800 dark:text-rose-200 max-w-xl mx-auto">
            {t.tripCompletedMsg} ({pendingArrivalBooking.destinationAddress.split(',')[0]}).
          </p>

          <div className="pt-2">
            <button
              onClick={() => {
                confirmArrival(pendingArrivalBooking.id);
                speakText(t.arrivalConfirmedMsg, language);
              }}
              className="w-full sm:w-auto px-10 py-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xl sm:text-2xl font-black rounded-full shadow-2xl border-2 border-emerald-400 flex items-center justify-center gap-3 mx-auto transition-transform hover:scale-105"
            >
              <CheckCircle2 className="w-8 h-8 text-white" />
              <span>{t.confirmArrivalBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE JOURNEY CARD */}
      {activeTripBooking && !pendingArrivalBooking && (
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-lg font-bold uppercase text-brand-tealLight tracking-wider">
                {t.statusStarted}
              </span>
            </div>
            <span className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-semibold">
              Booking: {activeTripBooking.bookingCode}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block uppercase font-bold">
                {t.trustedDrivers}
              </span>
              <div className="text-xl font-black text-white mt-1 flex items-center gap-2">
                <span>{activeTripBooking.driverName}</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {t.verifiedDriver}
                </span>
              </div>
              <div className="text-sm text-slate-300 mt-2 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-brand-teal" />
                <a href={`tel:${activeTripBooking.driverPhone}`} className="underline font-bold">
                  {activeTripBooking.driverPhone}
                </a>
              </div>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block uppercase font-bold">
                {t.myVehicles}
              </span>
              <div className="text-lg font-black text-white mt-1">
                {activeTripBooking.vehicleDetails.make} {activeTripBooking.vehicleDetails.model}
              </div>
              <div className="text-sm text-slate-400 font-mono mt-1">
                {activeTripBooking.vehicleDetails.registrationNumber}
              </div>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block uppercase font-bold">
                {t.destinationLocation}
              </span>
              <div className="text-base font-bold text-white mt-1 truncate">
                {activeTripBooking.destinationAddress.split(',')[0]}
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-2">
                ✓ {t.familyGuardian} remote tracking active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ONE-TAP FAVOURITE DESTINATIONS */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.whereToGo}
          </h3>

          {/* Voice Prompt Action */}
          <button
            onClick={handleVoiceListen}
            className={`px-5 py-3 rounded-full text-base font-bold flex items-center gap-2 shadow-md transition-all self-start sm:self-auto ${voiceListening
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-brand-teal text-white hover:bg-brand-tealDark'
              }`}
          >
            <Mic className="w-5 h-5" />
            <span>{voiceListening ? '...' : t.speakToBook}</span>
          </button>
        </div>

        {voiceNotice && (
          <div className="mb-4 p-3 bg-brand-teal/10 border border-brand-teal/30 text-brand-tealDark dark:text-brand-tealLight rounded-2xl text-sm font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-teal" />
            <span>{voiceNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickDestinations.map((dest, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (onQuickBook) {
                  onQuickBook(dest.address, dest.category);
                }
                speakText(`${dest.title}. ${t.driverAssignedMsg}`, language);
              }}
              className="bg-slate-50/80 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700 hover:border-brand-teal hover:bg-white dark:hover:bg-slate-800 p-6 rounded-3xl text-left transition-all group active:scale-95 flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div>
                <span className="text-4xl block mb-3">{dest.icon}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white group-hover:text-brand-teal block leading-tight">
                  {dest.title}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                  {dest.address}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-brand-teal">
                <span>{t.bookDriver} →</span>
                <span className="bg-brand-teal/10 px-2 py-0.5 rounded-full text-[11px]">
                  1-Tap
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* TRUSTED DRIVER CIRCLE HIGHLIGHT */}
      <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
              <img
                src={preferredDriver.photoUrl}
                alt={preferredDriver.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {preferredDriver.name}
                </span>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  {preferredDriver.rating} ({preferredDriver.totalTrips} trips)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.trustedCircleBadge} • Creta Automatic & EV Certified
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onQuickBook) {
                onQuickBook('Indiranagar to Manipal Hospital', 'Routine');
              }
            }}
            className="px-6 py-3 bg-brand-navy hover:bg-slate-800 dark:bg-brand-teal dark:hover:bg-brand-tealDark text-white text-sm font-bold rounded-full shadow-sm transition-all self-start sm:self-auto"
          >
            {t.bookDriver} ({preferredDriver.name.split(' ')[0]})
          </button>
        </div>
      </div>
    </div>
  );
};
