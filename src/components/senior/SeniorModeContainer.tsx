'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { matchDriversForVehicle } from '@/lib/matching';
import { speakText, startListening, isSpeechRecognitionSupported } from '@/lib/voice';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { ReadAloudControls } from '@/components/accessibility/ReadAloudControls';
import {
  InstantCategoryGrid,
  SelectedDestinationResult,
} from '@/components/booking/InstantCategoryGrid';
import { Booking, SavedDestination } from '@/types';
import {
  PhoneCall,
  Mic,
  MapPin,
  CheckCircle2,
  Car,
  Sparkles,
  AlertCircle,
  Loader2,
  XCircle,
  Navigation,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Star,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

interface SeniorModeContainerProps {
  onQuickBook?: (destination: string, category: string) => void;
}

function maskRegNumber(reg: string): string {
  const clean = reg.trim();
  if (clean.length <= 4) return clean;
  return `${clean.slice(0, 4)} •• ${clean.slice(-4)}`;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'detected' | 'not_understood' | 'denied';

export const SeniorModeContainer: React.FC<SeniorModeContainerProps> = () => {
  const {
    currentUser,
    language,
    vehicles,
    drivers,
    trustedDrivers,
    trustedDriverIds,
    savedDestinations,
    bookings,
    pricingConfig,
    confirmArrival,
    createBookingAsync,
    updateBookingStatus,
  } = useApp();

  const t = getTranslation(language) as unknown as Record<string, string>;

  const customerId = currentUser?.id || 'usr_cust_ramesh';
  const mySavedDestinations = savedDestinations.filter(
    (d) => d.customerId === customerId || d.customerId === 'usr_cust_ramesh'
  );
  const homeDestination = mySavedDestinations.find(
    (d) => d.isDefault || d.category.toLowerCase() === 'home'
  );

  // Wizard step: 1=Destination, 2=Pickup, 3=Vehicle, 4=Driver, 5=Review & Confirm
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedDest, setSelectedDest] = useState<SelectedDestinationResult | null>(null);
  const [pickupAddress, setPickupAddress] = useState<string>(homeDestination?.address || '');
  const [pickupLatLng, setPickupLatLng] = useState<{ lat: number; lng: number }>({
    lat: homeDestination?.latitude || 12.9784,
    lng: homeDestination?.longitude || 77.6408,
  });
  const [pickupStatus, setPickupStatus] = useState<string | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    (vehicles.find((v) => v.isDefault) || vehicles[0])?.id || ''
  );
  const [selectedDriverId, setSelectedDriverId] = useState<string>('auto_match');
  const [paymentMethod, setPaymentMethod] = useState<'guardian_pay' | 'cash' | 'upi' | 'razorpay'>('guardian_pay');
  const [assistSenior, setAssistSenior] = useState(true);
  const [assistLuggage, setAssistLuggage] = useState(false);
  const [assistWheelchair, setAssistWheelchair] = useState(false);
  const [extraNotes, setExtraNotes] = useState('');

  // Voice recognition state
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceResults, setVoiceResults] = useState<SelectedDestinationResult[]>([]);

  // Submission & error state
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [requestNonce, setRequestNonce] = useState<number>(() => Date.now());

  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) ||
    vehicles.find((v) => v.isDefault) ||
    vehicles[0];

  const matchingResults = useMemo(() => {
    if (!selectedVehicle) return [];
    return matchDriversForVehicle(drivers, selectedVehicle, { trustedDriverIds });
  }, [drivers, selectedVehicle, trustedDriverIds]);

  const eligibleDrivers = matchingResults.filter((m) => m.isEligible);

  // Fare breakdown using admin pricingConfig
  const expectedHours = 3;
  const baseFare = pricingConfig.baseHourlyRate * Math.max(pricingConfig.minHours, expectedHours);
  const platformFee = Math.round(baseFare * (pricingConfig.platformServiceFeePct / 100));
  const taxAmount = Math.round((baseFare + platformFee) * 0.05);
  const totalFare = baseFare + platformFee + taxAmount;

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

  const myTrustedEntries = trustedDrivers.filter(
    (td) => td.customerId === customerId && td.trustedStatus === 'active'
  );
  const primaryEntry = myTrustedEntries.find((td) => td.isPrimary) || myTrustedEntries[0];
  const primaryDriver = primaryEntry
    ? drivers.find((d) => d.id === primaryEntry.driverId)
    : undefined;

  const handleSelectDestination = (dest: SelectedDestinationResult) => {
    setBookingError(null);
    setSelectedDest(dest);
    setRequestNonce(Date.now());
    setStep(2);
    speakText(`${dest.name}. ${t.stepPickupLabel || 'Please confirm your pickup location.'}`, language);
  };

  const handleSelectSavedPlace = (dest: SavedDestination) => {
    handleSelectDestination({
      name: dest.name,
      address: dest.address,
      latitude: dest.latitude,
      longitude: dest.longitude,
      category: dest.category,
    });
  };

  const handleDetectGpsPickup = () => {
    setBookingError(null);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPickupStatus('Geolocation is not supported on this device. Please enter your address below.');
      return;
    }
    setIsDetectingGps(true);
    setPickupStatus(t.locationDetecting || 'Detecting your current location...');
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
        setPickupAddress(resolved);
        setPickupStatus(t.locationDetected || 'Location detected. Please confirm or edit.');
        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        if (err?.code === 1) {
          setPickupStatus(
            'Location permission was denied. Please choose Home or enter your pickup address manually.'
          );
        } else {
          setPickupStatus(
            'Could not detect GPS location. Please choose Home or enter your pickup address manually.'
          );
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleVoiceListen = () => {
    setBookingError(null);
    if (!isSpeechRecognitionSupported()) {
      setVoiceState('not_understood');
      return;
    }
    setVoiceState('listening');
    setVoiceTranscript('');
    setVoiceResults([]);

    const stop = startListening(
      async (transcript) => {
        setVoiceState('processing');
        setVoiceTranscript(transcript);
        const lower = transcript.toLowerCase();

        // Check saved destinations first
        const savedMatches: SelectedDestinationResult[] = mySavedDestinations
          .filter(
            (d) =>
              lower.includes(d.name.toLowerCase()) ||
              lower.includes(d.category.toLowerCase())
          )
          .map((d) => ({
            name: d.name,
            address: d.address,
            latitude: d.latitude,
            longitude: d.longitude,
            category: d.category,
          }));

        try {
          const res = await fetch(
            `/api/geocode/search?q=${encodeURIComponent(transcript)}&lat=${pickupLatLng.lat}&lng=${pickupLatLng.lng}`
          );
          const data = res.ok ? await res.json() : { results: [] };
          const apiMatches: SelectedDestinationResult[] = Array.isArray(data.results)
            ? data.results.slice(0, 4).map((r: any) => ({
                name: r.name,
                address: r.address,
                latitude: r.latitude,
                longitude: r.longitude,
                category: r.category || 'Voice',
              }))
            : [];
          const combined = [...savedMatches, ...apiMatches];
          if (combined.length === 0) {
            combined.push({
              name: transcript,
              address: transcript,
              latitude: pickupLatLng.lat,
              longitude: pickupLatLng.lng,
              category: 'Voice',
            });
          }
          setVoiceResults(combined);
          setVoiceState('detected');
        } catch {
          setVoiceResults(
            savedMatches.length > 0
              ? savedMatches
              : [
                  {
                    name: transcript,
                    address: transcript,
                    latitude: pickupLatLng.lat,
                    longitude: pickupLatLng.lng,
                    category: 'Voice',
                  },
                ]
          );
          setVoiceState('detected');
        }
      },
      (errCode) => {
        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          setVoiceState('denied');
        } else {
          setVoiceState('not_understood');
        }
      },
      language
    );

    setTimeout(() => {
      stop();
    }, 8000);
  };

  const handleConfirmBooking = async () => {
    if (isBookingInProgress || !selectedDest || !selectedVehicle || !pickupAddress.trim()) return;
    setIsBookingInProgress(true);
    setBookingError(null);

    const clientRequestId = `senior_${customerId}_${requestNonce}`;
    const assistanceTags = [
      assistSenior ? 'Senior citizen assistance' : null,
      assistLuggage ? 'Luggage assistance' : null,
      assistWheelchair ? 'Entry/wheelchair assistance' : null,
      extraNotes.trim() || null,
    ]
      .filter(Boolean)
      .join('. ');

    try {
      // Verify payment on backend for online/UPI/guardian methods
      if (paymentMethod !== 'cash') {
        const payRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: clientRequestId,
            amount: totalFare,
            method: paymentMethod,
          }),
        });
        if (!payRes.ok) {
          setBookingError(
            'Payment verification is temporarily unavailable. You can switch to Cash or retry.'
          );
          return;
        }
      }

      const now = new Date();
      const result = await createBookingAsync({
        clientRequestId,
        customerId,
        customerName: currentUser?.name || 'Senior Customer',
        customerPhone: currentUser?.phone || '+91 98450 12345',
        bookedByGuardianId: currentUser?.role === 'family_guardian' ? currentUser?.id : undefined,
        bookedByGuardianName: currentUser?.role === 'family_guardian' ? currentUser?.name : undefined,
        requestedDriverId: selectedDriverId,
        vehicleId: selectedVehicle.id,
        vehicleDetails: {
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          registrationNumber: selectedVehicle.registrationNumber,
          transmission: selectedVehicle.transmission,
          fuelType: selectedVehicle.fuelType,
          isEv: selectedVehicle.isEv,
        },
        pickupAddress: pickupAddress.trim(),
        destinationAddress: selectedDest.address,
        pickupLat: pickupLatLng.lat,
        pickupLng: pickupLatLng.lng,
        destLat: selectedDest.latitude,
        destLng: selectedDest.longitude,
        pickupDate: now.toISOString().split('T')[0],
        pickupTime: 'Now (Instant Ride)',
        expectedDurationHours: expectedHours,
        paymentMethod,
        specialInstructions: assistanceTags || `Senior Citizen Instant Ride to ${selectedDest.name}.`,
      });

      if (!result.ok || !result.booking) {
        setBookingError(
          result.error ||
            'Driver availability is temporarily unavailable. Please try again or call our Senior Helpline.'
        );
        return;
      }

      setConfirmedBooking(result.booking);
      setStep(1);
      setSelectedDest(null);
      speakText(
        `Your ride request has been successfully placed. ${result.booking.driverName} is assigned.`,
        language
      );
    } catch {
      setBookingError(
        t.bookingServiceUnavailable ||
          'Unable to connect to our booking service. Please try again.'
      );
    } finally {
      setIsBookingInProgress(false);
    }
  };

  return (
    <div
      data-read-aloud
      className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl space-y-8"
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
                {t.seniorModeOn || 'Senior Mode ON'}
              </span>
              <span className="bg-amber-500/20 text-amber-200 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30">
                {t.demoSandboxLabel || 'DEMO SANDBOX'}
              </span>
            </div>
            <p className="text-slate-300 text-sm sm:text-base mt-1">
              Step-by-Step Easy Booking • Large Buttons • 24/7 Helpline
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
            <span>{t.callSupport || 'Call Support'}</span>
          </a>
        </div>
      </div>

      {/* FRIENDLY ERROR BANNER WITH RETRY & MANUAL FALLBACK */}
      {bookingError && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-black text-rose-950">
                {t.bookingServiceUnavailable || 'Unable to complete your request'}
              </h3>
              <p className="text-sm text-rose-800 mt-0.5">{bookingError}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {step === 5 && (
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isBookingInProgress}
                className="px-4 py-2.5 bg-brand-teal text-white font-bold rounded-2xl text-sm flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t.retryBtn || 'Retry'}</span>
              </button>
            )}
            <a
              href="tel:18005550199"
              className="px-4 py-2.5 bg-rose-600 text-white font-black rounded-2xl text-sm text-center"
            >
              {t.callSupport || 'Call Helpline'}
            </a>
          </div>
        </div>
      )}

      {/* BOOKING CONFIRMED SCREEN */}
      {confirmedBooking && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
                  Your ride request has been placed!
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
              Book Another Ride
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-base">
            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold uppercase text-slate-400 block">Pickup</span>
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
                ★ {confirmedBooking.driverRating} • Verified Chauffeur
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold uppercase text-slate-400 block">Estimated Fare</span>
              <strong className="text-2xl font-black text-emerald-700 block mt-0.5">
                ₹{confirmedBooking.totalFare}
              </strong>
              <span className="text-xs text-slate-500">
                {confirmedBooking.vehicleDetails.make} {confirmedBooking.vehicleDetails.model}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/customer/bookings/${confirmedBooking.id}`}
              className="px-6 py-3.5 bg-brand-teal hover:bg-brand-tealDark text-white font-black rounded-2xl text-base flex items-center gap-2 shadow"
            >
              <ExternalLink className="w-5 h-5" />
              <span>{t.liveRideStatusTitle || 'View Live Ride Status'}</span>
            </Link>
            {confirmedBooking.driverPhone && (
              <a
                href={`tel:${confirmedBooking.driverPhone}`}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-base flex items-center gap-2 shadow"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call {confirmedBooking.driverName}</span>
              </a>
            )}
            <button
              onClick={() => {
                updateBookingStatus(confirmedBooking.id, 'cancelled', 'Cancelled from Senior Citizen Mode');
                setConfirmedBooking(null);
              }}
              className="px-6 py-3.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-2xl text-base flex items-center gap-2 border border-rose-300"
            >
              <XCircle className="w-5 h-5" />
              <span>Cancel Ride</span>
            </button>
          </div>
        </div>
      )}

      {/* PENDING ARRIVAL CONFIRMATION ALERT */}
      {pendingArrivalBooking && (
        <div className="bg-rose-50/80 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-rose-950">{t.safeArrivalQuestion}</h2>
          <p className="text-base text-rose-800 max-w-xl mx-auto">
            {t.tripCompletedMsg} ({pendingArrivalBooking.destinationAddress.split(',')[0]}).
          </p>
          <button
            onClick={() => {
              confirmArrival(pendingArrivalBooking.id);
              speakText(t.arrivalConfirmedMsg, language);
            }}
            className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-black rounded-full shadow-2xl border-2 border-emerald-400 inline-flex items-center gap-3"
          >
            <CheckCircle2 className="w-7 h-7" />
            <span>{t.confirmArrivalBtn}</span>
          </button>
        </div>
      )}

      {/* ACTIVE JOURNEY CARD */}
      {activeTripBooking && !pendingArrivalBooking && (
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-lg font-bold uppercase text-brand-tealLight tracking-wider">
                Active Ride • {activeTripBooking.bookingCode}
              </span>
            </div>
            <Link
              href={`/customer/bookings/${activeTripBooking.id}`}
              className="text-sm bg-brand-teal text-white px-4 py-1.5 rounded-full font-bold inline-flex items-center gap-1.5 self-start"
            >
              <span>{t.liveRideStatusTitle || 'Live Ride Status'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
            <div className="bg-slate-800/80 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 block uppercase font-bold">Driver</span>
              <div className="text-xl font-black mt-1">{activeTripBooking.driverName}</div>
              {activeTripBooking.driverPhone && (
                <a href={`tel:${activeTripBooking.driverPhone}`} className="text-sm text-brand-tealLight underline mt-1 inline-block">
                  {activeTripBooking.driverPhone}
                </a>
              )}
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 block uppercase font-bold">Your Car</span>
              <div className="text-lg font-black mt-1">
                {activeTripBooking.vehicleDetails.make} {activeTripBooking.vehicleDetails.model}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1">
                {maskRegNumber(activeTripBooking.vehicleDetails.registrationNumber)}
              </div>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 block uppercase font-bold">Destination</span>
              <div className="text-base font-bold mt-1 truncate">
                {activeTripBooking.destinationAddress.split(',')[0]}
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-1">
                ✓ Family Guardian tracking active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROGRESS INDICATOR */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
        {[
          { num: 1, label: t.stepDestinationLabel || '1. Destination' },
          { num: 2, label: t.stepPickupLabel || '2. Pickup' },
          { num: 3, label: t.stepVehicleLabel || '3. Car' },
          { num: 4, label: t.stepDriverLabel || '4. Driver' },
          { num: 5, label: t.stepFarePaymentLabel || '5. Confirm' },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            disabled={s.num > step && !(s.num === 2 && selectedDest)}
            onClick={() => {
              if (s.num <= step) setStep(s.num as 1 | 2 | 3 | 4 | 5);
            }}
            className={`px-3.5 py-2 rounded-full border transition-all ${
              step === s.num
                ? 'bg-brand-teal text-white border-brand-teal shadow'
                : step > s.num
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* STEP 1: DESTINATION SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {t.whereToGo || 'Where would you like to travel today?'}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Tap a saved place, choose a category below, or speak your destination.
              </p>
            </div>
            <button
              type="button"
              onClick={handleVoiceListen}
              className={`px-6 py-3.5 rounded-full text-base font-black flex items-center gap-2 shadow-md transition-all self-start ${
                voiceState === 'listening'
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-brand-teal hover:bg-brand-tealDark text-white'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>{voiceState === 'listening' ? t.voiceListeningStatus || 'Listening...' : t.speakToBook}</span>
            </button>
          </div>

          {/* Voice Status & Confirmation Panel (Never auto-books) */}
          {voiceState !== 'idle' && (
            <div className="p-4 rounded-2xl border-2 border-brand-teal/40 bg-brand-softBlue/50 space-y-3">
              <div className="flex items-center gap-2 font-bold text-brand-navy text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-brand-teal" />
                <span>
                  {voiceState === 'listening' && (t.voiceListeningStatus || 'Listening... Speak your destination clearly')}
                  {voiceState === 'processing' && (t.voiceProcessingStatus || 'Processing your voice...')}
                  {voiceState === 'detected' && `${t.voiceDetectedStatus || 'Destination detected'}: "${voiceTranscript}"`}
                  {voiceState === 'not_understood' && (t.voiceNotUnderstood || 'Could not understand clearly. Please try again or choose below.')}
                  {voiceState === 'denied' && (t.voicePermissionDenied || 'Microphone permission denied. Please choose a category or type below.')}
                </span>
              </div>
              {voiceState === 'detected' && voiceResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {voiceResults.map((vr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectDestination(vr)}
                      className="text-left p-3.5 bg-white border-2 border-brand-teal rounded-2xl hover:bg-emerald-50 transition-all"
                    >
                      <div className="font-black text-slate-900 text-base">{vr.name}</div>
                      <div className="text-xs text-slate-600 line-clamp-2 mt-0.5">{vr.address}</div>
                      <div className="text-xs font-bold text-brand-teal mt-1.5">Confirm & Continue →</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Places */}
          {mySavedDestinations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-500">
                {t.savedPlacesTitle || 'Your Saved Places'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {mySavedDestinations.map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => handleSelectSavedPlace(dest)}
                    className="bg-slate-50 border-2 border-slate-200 hover:border-brand-teal hover:bg-white p-5 rounded-3xl text-left transition-all active:scale-95 flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <span className="text-4xl block mb-2">{dest.icon}</span>
                      <span className="text-lg font-black text-slate-900 block">{dest.name}</span>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{dest.address}</p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-200 text-xs font-black text-brand-teal">
                      Select Place →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 12 Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Quick Destination Categories
            </h4>
            <InstantCategoryGrid
              language={language}
              pickupLatLng={pickupLatLng}
              seniorLayout
              onSelectDestination={handleSelectDestination}
            />
          </div>
        </div>
      )}

      {/* STEP 2: PICKUP CONFIRMATION */}
      {step === 2 && selectedDest && (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">
              {t.stepPickupLabel || '2. Confirm Pickup Location'}
            </h3>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm font-bold text-slate-600 hover:text-brand-navy flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Change Destination</span>
            </button>
          </div>

          <div className="bg-white border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-sm">
              <span className="text-xs font-bold uppercase text-slate-400 block">Going To</span>
              <strong className="text-slate-900">{selectedDest.name}</strong> — {selectedDest.address}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">Pickup Address</label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Enter your house, flat, or street address..."
              className="w-full px-4 py-4 bg-white border-2 border-slate-300 rounded-2xl text-base font-semibold text-slate-900 focus:border-brand-teal focus:outline-none"
            />
            {pickupStatus && <p className="text-xs font-bold text-brand-teal">{pickupStatus}</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isDetectingGps}
              onClick={handleDetectGpsPickup}
              className="px-5 py-3 bg-white border-2 border-brand-teal text-brand-teal font-bold rounded-2xl text-sm flex items-center gap-2"
            >
              {isDetectingGps ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              <span>Use Current GPS Location</span>
            </button>
            {homeDestination && (
              <button
                type="button"
                onClick={() => {
                  setPickupAddress(homeDestination.address);
                  setPickupLatLng({ lat: homeDestination.latitude, lng: homeDestination.longitude });
                  setPickupStatus('Home address selected.');
                }}
                className="px-5 py-3 bg-white border-2 border-slate-300 text-slate-800 font-bold rounded-2xl text-sm"
              >
                🏠 Use Saved Home
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={!pickupAddress.trim()}
            onClick={() => setStep(3)}
            className="w-full sm:w-auto px-8 py-4 bg-brand-teal hover:bg-brand-tealDark disabled:opacity-50 text-white font-black rounded-2xl text-lg shadow"
          >
            Continue to Select Car →
          </button>
        </div>
      )}

      {/* STEP 3: VEHICLE SELECTION */}
      {step === 3 && (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">
              {t.stepVehicleLabel || '3. Select Your Car'}
            </h3>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm font-bold text-slate-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 text-center space-y-3">
              <Car className="w-10 h-10 text-amber-600 mx-auto" />
              <h4 className="font-black text-lg text-amber-950">No Registered Vehicle Found</h4>
              <p className="text-sm text-amber-800">
                Please add your car first so we can match a qualified chauffeur.
              </p>
              <Link
                href="/customer/vehicles"
                className="inline-block px-6 py-3 bg-brand-teal text-white font-black rounded-2xl text-sm"
              >
                + Add Your Car
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((v) => {
                  const chosen = selectedVehicle?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-5 rounded-3xl border-2 text-left transition-all flex items-start gap-4 ${
                        chosen
                          ? 'bg-white border-brand-teal ring-2 ring-brand-teal/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-brand-teal/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-brand-softBlue text-brand-teal flex items-center justify-center shrink-0">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-lg text-slate-900">
                          {v.make} {v.model}
                        </div>
                        <div className="text-sm font-mono text-slate-600 mt-0.5">
                          {maskRegNumber(v.registrationNumber)}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="text-xs px-2.5 py-0.5 bg-slate-100 rounded-full font-bold capitalize">
                            {v.transmission}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 bg-slate-100 rounded-full font-bold uppercase">
                            {v.fuelType}
                          </span>
                          <span className="text-xs px-2.5 py-0.5 bg-slate-100 rounded-full font-bold uppercase">
                            {v.vehicleSize}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/customer/vehicles"
                  className="text-sm font-bold text-brand-teal underline"
                >
                  + Add or Edit Vehicles
                </Link>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-8 py-4 bg-brand-teal hover:bg-brand-tealDark text-white font-black rounded-2xl text-lg shadow"
                >
                  Find Compatible Drivers →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 4: DRIVER MATCHING */}
      {step === 4 && (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">
              {t.stepDriverLabel || '4. Select Driver'}
            </h3>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-sm font-bold text-slate-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          {eligibleDrivers.length === 0 ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 space-y-3">
              <h4 className="font-black text-lg text-amber-950">
                No Verified Compatible Drivers Available Right Now
              </h4>
              <p className="text-sm text-amber-800">
                All compatible verified chauffeurs are currently on active rides. You can retry,
                schedule for later, or call our Senior Helpline.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:18005550199"
                  className="px-5 py-3 bg-brand-navy text-white font-bold rounded-2xl text-sm"
                >
                  Call Senior Helpline
                </a>
                <Link
                  href="/customer/book"
                  className="px-5 py-3 bg-white border border-amber-400 text-amber-900 font-bold rounded-2xl text-sm"
                >
                  Schedule for Later
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSelectedDriverId('auto_match')}
                className={`w-full p-5 rounded-3xl border-2 text-left transition-all ${
                  selectedDriverId === 'auto_match'
                    ? 'bg-white border-brand-teal ring-2 ring-brand-teal/20 shadow-md'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="font-black text-lg text-slate-900">
                  ⭐ Find Best Compatible Available Driver (Recommended)
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Automatically assigns the highest-rated verified driver (prioritizes your Trusted Driver Circle).
                </p>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {eligibleDrivers.map(({ driver, isTrustedCircle, matchReasons }) => {
                  const chosen = selectedDriverId === driver.id;
                  return (
                    <button
                      key={driver.id}
                      type="button"
                      onClick={() => setSelectedDriverId(driver.id)}
                      className={`p-5 rounded-3xl border-2 text-left transition-all flex items-start gap-4 ${
                        chosen
                          ? 'bg-white border-brand-teal ring-2 ring-brand-teal/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-brand-teal/50'
                      }`}
                    >
                      <img
                        src={driver.photoUrl}
                        alt={driver.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-lg text-slate-900">{driver.name}</span>
                          {isTrustedCircle && (
                            <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                              Trusted Circle
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
                          <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                          </span>
                          <span>★ {driver.rating.toFixed(1)}</span>
                          <span>{driver.experienceYears} yrs exp</span>
                          <span>{driver.capabilities.languagesSpoken.join(', ')}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">
                          {matchReasons.slice(0, 2).join(' • ')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full sm:w-auto px-8 py-4 bg-brand-teal hover:bg-brand-tealDark text-white font-black rounded-2xl text-lg shadow"
              >
                Review Fare & Confirm →
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: FARE, ASSISTANCE, PAYMENT & CONFIRM */}
      {step === 5 && selectedDest && selectedVehicle && (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">
              {t.stepFarePaymentLabel || '5. Review Fare & Confirm'}
            </h3>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="text-sm font-bold text-slate-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200 text-sm">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block">Pickup</span>
              <strong className="text-slate-900">{pickupAddress}</strong>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block">Destination</span>
              <strong className="text-slate-900">{selectedDest.address}</strong>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block">Your Car</span>
              <strong className="text-slate-900">
                {selectedVehicle.make} {selectedVehicle.model} ({maskRegNumber(selectedVehicle.registrationNumber)})
              </strong>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block">Driver</span>
              <strong className="text-slate-900">
                {selectedDriverId === 'auto_match'
                  ? 'Best Compatible Available Driver'
                  : drivers.find((d) => d.id === selectedDriverId)?.name || 'Auto Match'}
              </strong>
            </div>
          </div>

          {/* Transparent Fare Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Driver Service Charge ({expectedHours} hrs min)</span>
              <strong className="text-slate-900">₹{baseFare}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Platform Service Fee ({pricingConfig.platformServiceFeePct}%)</span>
              <strong className="text-slate-900">₹{platformFee}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Estimated GST (5%)</span>
              <strong className="text-slate-900">₹{taxAmount}</strong>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-lg font-black text-brand-navy">
              <span>Estimated Total</span>
              <span className="text-emerald-700">₹{totalFare}</span>
            </div>
          </div>

          {/* Assistance Preferences */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-sm font-black text-slate-800 block">Additional Assistance</span>
            <div className="flex flex-wrap gap-3 text-sm">
              <label className="flex items-center gap-2 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={assistSenior}
                  onChange={(e) => setAssistSenior(e.target.checked)}
                />
                <span>Senior Citizen Assistance</span>
              </label>
              <label className="flex items-center gap-2 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={assistLuggage}
                  onChange={(e) => setAssistLuggage(e.target.checked)}
                />
                <span>Luggage Assistance</span>
              </label>
              <label className="flex items-center gap-2 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={assistWheelchair}
                  onChange={(e) => setAssistWheelchair(e.target.checked)}
                />
                <span>Wheelchair / Entry Support</span>
              </label>
            </div>
            <input
              type="text"
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              placeholder="Optional instructions for the driver (e.g. ring bell at Gate 2)..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm"
            />
          </div>

          {/* Payment Method */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-teal" /> Payment Method
              </span>
              <span className="text-[11px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                Demo Sandbox Mode
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-sm">
              {[
                { id: 'guardian_pay', label: 'Family Guardian Pay' },
                { id: 'cash', label: 'Cash' },
                { id: 'upi', label: 'UPI' },
                { id: 'razorpay', label: 'Online Card / Netbanking' },
              ].map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id as typeof paymentMethod)}
                  className={`p-3 rounded-xl border-2 font-bold transition-all ${
                    paymentMethod === pm.id
                      ? 'border-brand-teal bg-brand-softBlue text-brand-navy'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={isBookingInProgress}
            onClick={handleConfirmBooking}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black rounded-3xl text-xl shadow-xl flex items-center justify-center gap-3 transition-all"
          >
            {isBookingInProgress ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Confirming your ride and assigning driver...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>{t.confirmBookingBtn || 'Confirm Booking'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* PREFERRED TRUSTED DRIVER QUICK VIEW */}
      {primaryDriver && step === 1 && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={primaryDriver.photoUrl}
              alt={primaryDriver.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-900">{primaryDriver.name}</span>
                <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Preferred Driver
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500" /> {primaryDriver.rating} ({primaryDriver.totalTrips} trips)
              </p>
            </div>
          </div>
          <Link
            href="/customer/trusted-drivers"
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-800 font-bold rounded-full text-sm self-start sm:self-auto"
          >
            Manage Trusted Circle
          </Link>
        </div>
      )}
    </div>
  );
};
