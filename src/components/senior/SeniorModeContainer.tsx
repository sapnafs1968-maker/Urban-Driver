'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { speakText, startListening } from '@/lib/voice';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { ReadAloudControls } from '@/components/accessibility/ReadAloudControls';
import { Booking, SavedDestination } from '@/types';
import {
  PhoneCall,
  Volume2,
  Mic,
  MapPin,
  CheckCircle2,
  Clock,
  Car,
  Star,
  Sparkles,
  AlertCircle,
  Loader2,
  XCircle,
  Navigation,
} from 'lucide-react';

interface SeniorModeContainerProps {
  onQuickBook?: (destination: string, category: string) => void;
}

export const SeniorModeContainer: React.FC<SeniorModeContainerProps> = () => {
  const {
    currentUser,
    language,
    vehicles,
    drivers,
    trustedDrivers,
    savedDestinations,
    bookings,
    confirmArrival,
    createBookingAsync,
    updateBookingStatus,
  } = useApp();

  const t = translations[language];

  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // One-tap booking state
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [pendingDestination, setPendingDestination] = useState<SavedDestination | null>(null);

  // Confirmed pickup location (defaults to saved Home destination or user city)
  const customerId = currentUser?.id || 'usr_cust_ramesh';
  const mySavedDestinations = savedDestinations.filter(
    (d) => d.customerId === customerId || d.customerId === 'usr_cust_ramesh'
  );
  const homeDestination = mySavedDestinations.find(
    (d) => d.isDefault || d.category.toLowerCase() === 'home'
  );

  const [confirmedPickup, setConfirmedPickup] = useState<string>(
    homeDestination?.address || ''
  );
  const [pickupLatLng, setPickupLatLng] = useState<{ lat: number; lng: number }>({
    lat: homeDestination?.latitude || 12.9784,
    lng: homeDestination?.longitude || 77.6408,
  });
  const [needsPickupConfirm, setNeedsPickupConfirm] = useState(false);

  // Active or pending arrival confirmation booking
  const pendingArrivalBooking = bookings.find(
    (b) =>
      b.customerId === customerId &&
      (b.status === 'arrival_confirmation_pending' || b.status === 'trip_completed')
  );

  const activeTripBooking = bookings.find(
    (b) =>
      b.customerId === customerId &&
      (b.status === 'driver_assigned' ||
        b.status === 'confirmed' ||
        b.status === 'driver_en_route' ||
        b.status === 'driver_arrived' ||
        b.status === 'trip_started')
  );

  // Preferred & backup trusted drivers
  const myTrustedEntries = trustedDrivers.filter(
    (td) => td.customerId === customerId && td.trustedStatus === 'active'
  );
  const primaryEntry = myTrustedEntries.find((td) => td.isPrimary) || myTrustedEntries[0];
  const primaryDriver = primaryEntry
    ? drivers.find((d) => d.id === primaryEntry.driverId)
    : drivers.find((d) => d.verificationStatus === 'verified' && d.isAvailable);

  const backupEntry = myTrustedEntries.find(
    (td) => td.driverId !== primaryDriver?.id
  );
  const backupDriver = backupEntry
    ? drivers.find((d) => d.id === backupEntry.driverId)
    : drivers.find(
        (d) =>
          d.id !== primaryDriver?.id &&
          d.verificationStatus === 'verified' &&
          d.isAvailable &&
          !d.currentActiveBookingId
      );

  const defaultVehicle = vehicles.find((v) => v.isDefault) || vehicles[0];

  const executeOneTapBooking = async (
    dest: SavedDestination,
    pickupAddr: string,
    preferredDriverId: string = 'auto_match'
  ) => {
    if (isBookingInProgress) return; // Prevent accidental double-taps

    if (!defaultVehicle) {
      setBookingError('No personal vehicle is saved on your profile. Please add your car or call support.');
      return;
    }

    setIsBookingInProgress(true);
    setBookingError(null);
    setNeedsPickupConfirm(false);
    setPendingDestination(null);

    const clientRequestId = `senior_${customerId}_${dest.id}_${Math.floor(Date.now() / 5000)}`;

    try {
      const now = new Date();
      const result = await createBookingAsync({
        clientRequestId,
        customerId,
        customerName: currentUser?.name || 'Senior Customer',
        customerPhone: currentUser?.phone || '+91 98450 12345',
        requestedDriverId: preferredDriverId,
        vehicleId: defaultVehicle.id,
        vehicleDetails: {
          make: defaultVehicle.make,
          model: defaultVehicle.model,
          registrationNumber: defaultVehicle.registrationNumber,
          transmission: defaultVehicle.transmission,
          fuelType: defaultVehicle.fuelType,
          isEv: defaultVehicle.isEv,
        },
        pickupAddress: pickupAddr,
        destinationAddress: dest.address,
        pickupLat: pickupLatLng.lat,
        pickupLng: pickupLatLng.lng,
        destLat: dest.latitude,
        destLng: dest.longitude,
        pickupDate: now.toISOString().split('T')[0],
        pickupTime: 'Now (Immediate)',
        expectedDurationHours: 3,
        paymentMethod: 'guardian_pay',
        specialInstructions: `Senior Citizen One-Tap Booking to ${dest.name}. Assist passenger gently.`,
      });

      if (!result.ok || !result.booking) {
        setBookingError(
          result.error || 'No driver is currently available. Please try again or call our Senior Helpline.'
        );
        speakText(result.error || 'No driver available right now.', language);
        return;
      }

      setConfirmedBooking(result.booking);
      speakText(
        `Your ride request has been successfully placed. ${result.booking.driverName} is assigned.`,
        language
      );
    } catch (err: any) {
      setBookingError(err?.message || 'Network error while placing your ride request.');
    } finally {
      setIsBookingInProgress(false);
    }
  };

  const handleTapSavedDestination = (dest: SavedDestination) => {
    if (isBookingInProgress) return;
    setBookingError(null);

    const activePickup = confirmedPickup.trim() || homeDestination?.address || '';
    if (!activePickup) {
      setPendingDestination(dest);
      setNeedsPickupConfirm(true);
      return;
    }

    executeOneTapBooking(dest, activePickup, 'auto_match');
  };

  const handleDetectGpsPickup = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setConfirmedPickup(t.locationDetecting || 'Detecting your current location...');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPickupLatLng({ lat: latitude, lng: longitude });
          let resolved = `Current GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          try {
            const res = await fetch(
              `/api/geocode/reverse?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`
            );
            if (res.ok) {
              const json = await res.json();
              if (json.address) resolved = json.address;
            }
          } catch {
            // Keep coordinate fallback
          }
          setConfirmedPickup(resolved);
        },
        () => {
          setConfirmedPickup(homeDestination?.address || '142, 6th Main, Defence Colony, Indiranagar, Bengaluru');
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setConfirmedPickup(homeDestination?.address || '142, 6th Main, Defence Colony, Indiranagar, Bengaluru');
    }
  };

  const handleCancelSeniorBooking = async (bookingId: string) => {
    updateBookingStatus(bookingId, 'cancelled', 'Cancelled from Senior Citizen Mode');
    setConfirmedBooking(null);
  };

  const handleVoiceListen = () => {
    setVoiceListening(true);
    setVoiceNotice(t.speakToBook);
    speakText(t.whereToGo, language);

    const stop = startListening(
      (transcript) => {
        setVoiceListening(false);
        setVoiceNotice(`"${transcript}"`);
        const lower = transcript.toLowerCase();
        const matchedDest =
          mySavedDestinations.find(
            (d) =>
              lower.includes(d.name.toLowerCase()) ||
              lower.includes(d.category.toLowerCase())
          ) || {
            id: `dest_voice_${Date.now()}`,
            customerId,
            name: transcript,
            category: 'Voice',
            address: transcript,
            latitude: 12.9716,
            longitude: 77.5946,
            icon: '📍',
          };
        handleTapSavedDestination(matchedDest);
      },
      () => {
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
    if (confirmedBooking) {
      msg = `Your ride request has been successfully placed. Booking ID ${confirmedBooking.bookingCode}. Driver ${confirmedBooking.driverName}.`;
    } else if (pendingArrivalBooking) {
      msg = `${t.safeArrivalQuestion} ${t.confirmArrivalBtn}`;
    } else if (activeTripBooking) {
      msg = `${t.driverAssignedMsg} ${activeTripBooking.driverName}.`;
    } else {
      msg = `${t.whereToGo} Tap any large destination card to book immediately.`;
    }
    speakText(msg, language);
  };

  return (
    <div
      data-read-aloud
      className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8"
    >
      {/* Top Senior Banner */}
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
              One-Tap Easy Booking • Large Buttons • 24/7 Helpline
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <LanguageSelector variant="prominent" />

          <ReadAloudControls variant="compact" />

          <a
            href="tel:18005550199"
            className="px-5 py-3 bg-brand-teal hover:bg-brand-tealDark text-white rounded-full text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t.callSupport}</span>
          </a>
        </div>
      </div>

      {/* ONE-TAP BOOKING SUCCESS SCREEN */}
      {confirmedBooking && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
                  Your ride request has been successfully placed!
                </h2>
                <p className="text-sm font-bold text-emerald-800 mt-1">
                  Booking ID: <span className="font-mono text-lg">{confirmedBooking.bookingCode}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setConfirmedBooking(null)}
              className="px-4 py-2 bg-white border border-emerald-300 text-emerald-900 font-bold rounded-xl text-sm self-start"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-base">
            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold uppercase text-slate-400 block">Pickup Location</span>
              <strong className="text-slate-900 text-sm block mt-1">{confirmedBooking.pickupAddress}</strong>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold uppercase text-slate-400 block">Destination</span>
              <strong className="text-slate-900 text-sm block mt-1">{confirmedBooking.destinationAddress}</strong>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold uppercase text-slate-400 block">Assigned Driver</span>
              <strong className="text-slate-900 text-lg block mt-0.5">{confirmedBooking.driverName}</strong>
              <span className="text-xs text-emerald-700 font-bold">
                ★ {confirmedBooking.driverRating} • ETA ~10 mins
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold uppercase text-slate-400 block">Estimated Fare</span>
              <strong className="text-2xl font-black text-emerald-700 block mt-0.5">
                ₹{confirmedBooking.totalFare}
              </strong>
              <span className="text-xs text-slate-500">
                Car: {confirmedBooking.vehicleDetails.make} {confirmedBooking.vehicleDetails.model}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {confirmedBooking.driverPhone && (
              <a
                href={`tel:${confirmedBooking.driverPhone}`}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-base flex items-center gap-2 shadow"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call {confirmedBooking.driverName}</span>
              </a>
            )}
            <a
              href="tel:18005550199"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-base flex items-center gap-2"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call Senior Helpline</span>
            </a>
            <button
              onClick={() => handleCancelSeniorBooking(confirmedBooking.id)}
              className="px-6 py-3.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-2xl text-base flex items-center gap-2 border border-rose-300"
            >
              <XCircle className="w-5 h-5" />
              <span>Cancel Ride</span>
            </button>
          </div>
        </div>
      )}

      {/* MISSING PICKUP LOCATION SIMPLE INLINE PROMPT */}
      {needsPickupConfirm && pendingDestination && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-6 space-y-4">
          <h3 className="text-xl font-black text-amber-950">
            Confirm Pickup Location for {pendingDestination.name}
          </h3>
          <p className="text-sm text-amber-900">
            Please confirm where the driver should pick you up:
          </p>
          <input
            type="text"
            value={confirmedPickup}
            onChange={(e) => setConfirmedPickup(e.target.value)}
            placeholder="Enter your house or apartment address..."
            className="w-full px-4 py-3.5 bg-white border-2 border-amber-300 rounded-2xl text-base font-semibold text-slate-900"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDetectGpsPickup}
              className="px-5 py-3 bg-white border border-amber-400 text-amber-900 font-bold rounded-2xl text-sm flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Use Current GPS / Home</span>
            </button>
            <button
              type="button"
              disabled={!confirmedPickup.trim() || isBookingInProgress}
              onClick={() => executeOneTapBooking(pendingDestination, confirmedPickup.trim())}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl text-base"
            >
              Confirm & Book Ride →
            </button>
          </div>
        </div>
      )}

      {/* ERROR / UNAVAILABLE DRIVER BANNER */}
      {bookingError && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-black text-rose-950">Could Not Complete Request</h3>
              <p className="text-sm text-rose-800 mt-0.5">{bookingError}</p>
            </div>
          </div>
          <a
            href="tel:18005550199"
            className="px-5 py-3 bg-rose-600 text-white font-black rounded-2xl text-sm shrink-0 text-center"
          >
            Call Helpline
          </a>
        </div>
      )}

      {/* PENDING ARRIVAL CONFIRMATION ALERT */}
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
                Active Ride
              </span>
            </div>
            <span className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-semibold">
              Booking: {activeTripBooking.bookingCode}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
              <span className="text-xs text-slate-400 block uppercase font-bold">
                Assigned Driver
              </span>
              <div className="text-xl font-black text-white mt-1">
                {activeTripBooking.driverName}
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
                Your Car
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
                Destination
              </span>
              <div className="text-base font-bold text-white mt-1 truncate">
                {activeTripBooking.destinationAddress.split(',')[0]}
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-2">
                ✓ Family Guardian tracking active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ONE-TAP SAVED DESTINATIONS */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t.whereToGo}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Tap any saved place below to book immediately using your saved car & pickup address.
            </p>
          </div>

          <button
            onClick={handleVoiceListen}
            className={`px-5 py-3 rounded-full text-base font-bold flex items-center gap-2 shadow-md transition-all self-start sm:self-auto ${
              voiceListening
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

        {isBookingInProgress && (
          <div className="mb-4 p-4 bg-brand-teal/10 border-2 border-brand-teal rounded-2xl flex items-center gap-3 text-base font-bold text-brand-navy">
            <Loader2 className="w-6 h-6 animate-spin text-brand-teal" />
            <span>Placing your one-tap ride request and assigning your driver...</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mySavedDestinations.map((dest) => (
            <button
              key={dest.id}
              disabled={isBookingInProgress}
              onClick={() => handleTapSavedDestination(dest)}
              className="bg-slate-50/80 dark:bg-slate-800/70 border-2 border-slate-200/90 dark:border-slate-700 hover:border-brand-teal hover:bg-white dark:hover:bg-slate-800 p-6 rounded-3xl text-left transition-all group active:scale-95 flex flex-col justify-between shadow-xs hover:shadow-lg disabled:opacity-50"
            >
              <div>
                <span className="text-5xl block mb-3">{dest.icon}</span>
                <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-brand-teal block leading-tight">
                  {dest.name}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2">
                  {dest.address}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-sm font-black text-brand-teal">
                <span>Book in 1 Tap →</span>
                <span className="bg-brand-teal/10 px-2.5 py-0.5 rounded-full text-xs">
                  Instant
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* PREFERRED & BACKUP TRUSTED DRIVERS */}
      {primaryDriver && (
        <div className="bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
                <img
                  src={primaryDriver.photoUrl}
                  alt={primaryDriver.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {primaryDriver.name}
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    Preferred Driver
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      primaryDriver.currentActiveBookingId
                        ? 'bg-rose-100 text-rose-800'
                        : primaryDriver.isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {primaryDriver.currentActiveBookingId
                      ? 'Currently on a trip'
                      : primaryDriver.isAvailable
                      ? 'Available'
                      : 'Unavailable'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ★ {primaryDriver.rating} ({primaryDriver.totalTrips} trips)
                  {backupDriver && ` • Backup Driver: ${backupDriver.name}`}
                </p>
              </div>
            </div>

            {homeDestination && (
              <button
                disabled={isBookingInProgress}
                onClick={() => {
                  const targetDriverId =
                    primaryDriver.isAvailable && !primaryDriver.currentActiveBookingId
                      ? primaryDriver.id
                      : backupDriver?.id || 'auto_match';
                  executeOneTapBooking(
                    mySavedDestinations[0] || homeDestination,
                    confirmedPickup || homeDestination.address,
                    targetDriverId
                  );
                }}
                className="px-6 py-3 bg-brand-navy hover:bg-slate-800 text-white text-sm font-bold rounded-full shadow-sm transition-all self-start sm:self-auto"
              >
                {primaryDriver.isAvailable && !primaryDriver.currentActiveBookingId
                  ? `Book ${primaryDriver.name.split(' ')[0]} Now`
                  : backupDriver
                  ? `Book Backup (${backupDriver.name.split(' ')[0]})`
                  : 'Book Next Available Driver'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
