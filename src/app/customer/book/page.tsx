'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { matchDriversForVehicle } from '@/lib/matching';
import { translations } from '@/lib/i18n';
import { LocationPicker } from '@/components/location/LocationPicker';
import { AuthGuard } from '@/components/auth/AuthGuard';
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Star,
  ShieldCheck,
  AlertCircle,
  Repeat,
  CreditCard,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

function BookDriverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    currentUser,
    vehicles,
    drivers,
    trustedDriverIds,
    createBookingAsync,
    addRecurringSchedule,
    pricingConfig,
    language,
  } = useApp();

  const t = translations[language];

  // Selected Vehicle
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    vehicles[0]?.id || ''
  );

  // Address inputs
  const initialDest = searchParams.get('destination') || 'Manipal Hospital, Old Airport Road, Kodihalli';
  const isInstantMode = searchParams.get('instant') === '1';
  const [pickupAddress, setPickupAddress] = useState('142, 6th Main, Defence Colony, Indiranagar, Bengaluru');
  const [destinationAddress, setDestinationAddress] = useState(initialDest);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9784,
    lng: 77.6408,
  });
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({
    lat: Number(searchParams.get('destLat')) || 12.9592,
    lng: Number(searchParams.get('destLng')) || 77.6534,
  });

  // Date and Time
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState(isInstantMode ? todayStr : tomorrowStr);
  const [pickupTime, setPickupTime] = useState(isInstantMode ? 'Now (Instant Ride)' : '10:00 AM');
  const [durationHours, setDurationHours] = useState(3.5);

  // Booking type: one-time vs recurring
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
  const [recurringTitle, setRecurringTitle] = useState('Weekly Hospital Routine Checkup');

  // Selected Driver
  const initialPreferredDriver = searchParams.get('preferredDriverId') || 'auto_match';
  const [selectedDriverId, setSelectedDriverId] = useState<string>(initialPreferredDriver);
  const [specialInstructions, setSpecialInstructions] = useState(
    'Senior passenger. Please assist from parking bay to reception desk.'
  );
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'guardian_pay' | 'cash' | 'upi'>('razorpay');

  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [alternativeDrivers, setAlternativeDrivers] = useState<typeof drivers>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestNonce] = useState<number>(() => Date.now());

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Match drivers using rule-based engine
  const matchingResults = selectedVehicle
    ? matchDriversForVehicle(drivers, selectedVehicle, {
        trustedDriverIds,
      })
    : [];

  // Fare calculation
  const baseFare = pricingConfig.baseHourlyRate * Math.max(pricingConfig.minHours, Math.floor(durationHours));
  const durationFare = durationHours > pricingConfig.minHours ? (durationHours - pricingConfig.minHours) * 100 : 0;
  const platformFee = Math.round((baseFare + durationFare) * (pricingConfig.platformServiceFeePct / 100));
  const taxAmount = Math.round((baseFare + durationFare + platformFee) * 0.05); // 5% GST
  const totalFare = baseFare + durationFare + platformFee + taxAmount;

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setBookingError(null);
    setAlternativeDrivers([]);

    if (!selectedVehicle) {
      setBookingError('Please register or select a vehicle first.');
      return;
    }

    // Check if explicitly selected driver is currently on an active ride
    if (selectedDriverId !== 'auto_match') {
      const targetDrv = drivers.find((d) => d.id === selectedDriverId);
      if (targetDrv && (targetDrv.currentActiveBookingId || !targetDrv.isAvailable)) {
        const availableAlts = matchingResults
          .filter((m) => m.isEligible && m.driver.id !== targetDrv.id)
          .map((m) => m.driver);
        setBookingError('This driver is currently completing another ride.');
        setAlternativeDrivers(availableAlts);
        return;
      }
    }

    setIsSubmitting(true);
    const clientRequestId = `book_${currentUser?.id || 'guest'}_${requestNonce}`;
    try {
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
          setBookingError('Payment verification is temporarily unavailable. Please retry or choose Cash.');
          return;
        }
      }

      const result = await createBookingAsync({
        clientRequestId,
        customerId: currentUser?.id || 'usr_guest',
        customerName: currentUser?.name || 'Customer',
        customerPhone: currentUser?.phone || '',
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
        pickupAddress,
        destinationAddress,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        destLat: destCoords.lat,
        destLng: destCoords.lng,
        pickupDate,
        pickupTime,
        expectedDurationHours: durationHours,
        isRecurring,
        recurringTitle: isRecurring ? recurringTitle : undefined,
        paymentMethod,
        specialInstructions,
      });

      if (!result.ok || !result.booking) {
        setBookingError(result.error || 'Unable to complete booking.');
        setAlternativeDrivers(result.alternativeDrivers || []);
        return;
      }

      if (isRecurring) {
        addRecurringSchedule({
          customerId: currentUser?.id || 'usr_guest',
          title: recurringTitle,
          vehicleId: selectedVehicle.id,
          preferredDriverId: result.booking.driverId,
          daysOfWeek: recurringDays,
          startDate: pickupDate,
          pickupTime,
          pickupAddress,
          destinationAddress,
          status: 'active',
          totalOccurrences: 12,
        });
      }

      setBookingSuccess(result.booking.bookingCode);
      setCreatedBookingId(result.booking.id);
    } catch {
      setBookingError('Unable to connect to our booking service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-4xl shadow-xl">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {t.bookingConfirmedTitle}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          {t.bookingCodeIs} <strong className="text-brand-teal font-mono">{bookingSuccess}</strong>.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {createdBookingId && (
            <button
              onClick={() => router.push(`/customer/bookings/${createdBookingId}`)}
              className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow hover:bg-emerald-700 transition-all"
            >
              {t.liveRideStatusTitle || 'View Live Ride Status'} →
            </button>
          )}
          <button
            onClick={() => router.push('/customer/dashboard')}
            className="px-6 py-3 bg-brand-teal text-white font-bold rounded-xl text-sm shadow hover:bg-brand-tealDark transition-all"
          >
            {t.goToDashboardTrack}
          </button>
          <button
            onClick={() => setBookingSuccess(null)}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm hover:bg-slate-300 transition-all"
          >
            {t.bookAnotherTrip}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div data-read-aloud className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.bookDriverTitle}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.bookDriverSub}
        </p>
      </div>

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Booking Parameters */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Vehicle Selection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-brand-teal" />
              <span>{t.step1Vehicle}</span>
            </h2>

            {vehicles.length === 0 ? (
              <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-xl">
                {t.noVehiclesTitle}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicles.map((v) => {
                  const isSelected = selectedVehicleId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'border-brand-teal bg-brand-teal/5 shadow-md ring-2 ring-brand-teal/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-slate-50 dark:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {v.make} {v.model}
                        </span>
                        {v.isEv && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-600 font-bold px-2 py-0.5 rounded">
                            EV
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-1">
                        {v.registrationNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize mt-2 flex items-center gap-2">
                        <span>{v.transmission}</span>
                        <span>•</span>
                        <span>{v.fuelType}</span>
                        <span>•</span>
                        <span>{v.vehicleSize}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Pickup and Destination with Location Intelligence */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-teal" />
              <span>{t.step3Route}</span>
            </h2>

            <div className="space-y-4">
              <LocationPicker
                label={t.pickupLocation}
                value={pickupAddress}
                onChange={(addr) => setPickupAddress(addr)}
                placeholder="Enter pickup address, house or apartment..."
              />

              <LocationPicker
                label={t.destinationLocation}
                value={destinationAddress}
                onChange={(addr) => setDestinationAddress(addr)}
                placeholder="Enter hospital, clinic, temple or airport..."
              />
            </div>
          </div>

          {/* 3. Date, Time & Duration */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-teal" />
              <span>{t.step2Schedule}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.pickupDate}
                </label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.pickupTime}
                </label>
                <input
                  type="text"
                  required
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.durationHours}
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value={3}>3 {t.hours}</option>
                  <option value={4}>4 {t.hours}</option>
                  <option value={6}>6 {t.hours}</option>
                  <option value={8}>8 {t.hours}</option>
                </select>
              </div>
            </div>

            {/* Recurring Journey Toggle */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-teal focus:ring-brand-teal"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-brand-teal" />
                  {t.recurringOption}
                </span>
              </label>

              {isRecurring && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs">
                  <input
                    type="text"
                    value={recurringTitle}
                    onChange={(e) => setRecurringTitle(e.target.value)}
                    placeholder={t.recurringTitle}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span>Repeats on:</span>
                    {['Mon', 'Wed', 'Fri'].map((d) => (
                      <span key={d} className="px-2 py-0.5 bg-brand-teal/10 text-brand-teal font-bold rounded">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. Special Instructions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <label className="block text-sm font-bold text-slate-900 dark:text-white">
              {t.specialInstructions}
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Senior passenger with walking difficulty, slow down on speed breakers..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>

        {/* Right Sidebar: Vehicle-Fit Driver Matching & Fare Summary */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Driver Selection & Matching Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{t.step4Driver}</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">Rule-Engine v1</span>
            </div>

            <p className="text-xs text-slate-500">
              Filtered for vehicle specifications: <strong className="capitalize">{selectedVehicle?.transmission}</strong>, <strong className="capitalize">{selectedVehicle?.fuelType}</strong>.
            </p>

            {/* List of matched drivers */}
            <div className="space-y-3">
              {matchingResults.map((res) => {
                const isSelected = selectedDriverId === res.driver.id;
                const isOnTrip = Boolean(res.driver.currentActiveBookingId);
                return (
                  <div
                    key={res.driver.id}
                    onClick={() => {
                      if (res.isEligible && !isOnTrip) {
                        setSelectedDriverId(res.driver.id);
                        setBookingError(null);
                      } else if (isOnTrip) {
                        setBookingError('This driver is currently completing another ride.');
                        setAlternativeDrivers(
                          matchingResults
                            .filter((m) => m.isEligible && !m.driver.currentActiveBookingId)
                            .map((m) => m.driver)
                        );
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      !res.isEligible || isOnTrip
                        ? 'opacity-65 border-slate-200 bg-slate-50 dark:bg-slate-800 cursor-not-allowed'
                        : isSelected
                        ? 'border-brand-teal bg-brand-teal/5 shadow-md ring-2 ring-brand-teal/20 cursor-pointer'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-slate-50 dark:bg-slate-800/40 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={res.driver.photoUrl}
                          alt={res.driver.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{res.driver.name}</span>
                            {res.isTrustedCircle && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded">
                                Favorite ★
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {res.driver.experienceYears} yrs • {res.driver.rating} ★ ({res.driver.totalTrips} trips)
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {res.score}% Match
                        </span>
                      </div>
                    </div>

                    {/* Transparent compatibility reasons */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-1">
                      {res.matchReasons.map((m, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-medium"
                        >
                          ✓ {m}
                        </span>
                      ))}
                      {res.incompatibilityReasons.map((m, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded font-medium"
                        >
                          ✕ {m}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transparent Pricing Breakdown Card */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 border-b border-slate-800 pb-3">
              <CreditCard className="w-4 h-4 text-brand-teal" />
              <span>{t.step5Payment}</span>
            </h2>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>{t.baseFare} ({pricingConfig.minHours} hrs)</span>
                <span>₹{baseFare.toFixed(2)}</span>
              </div>
              {durationFare > 0 && (
                <div className="flex justify-between">
                  <span>{t.durationFare} ({durationHours - pricingConfig.minHours} hrs)</span>
                  <span>₹{durationFare.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.platformFee} ({pricingConfig.platformServiceFeePct}%)</span>
                <span>₹{platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.taxesGst}</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-black text-white">
                <span>{t.totalFare}</span>
                <span className="text-brand-tealLight">₹{totalFare.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {t.paymentMethod}
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-2.5 rounded-xl border text-left font-semibold ${
                    paymentMethod === 'razorpay'
                      ? 'border-brand-teal bg-brand-teal/20 text-white'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400'
                  }`}
                >
                  Razorpay / UPI
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('guardian_pay')}
                  className={`p-2.5 rounded-xl border text-left font-semibold ${
                    paymentMethod === 'guardian_pay'
                      ? 'border-brand-teal bg-brand-teal/20 text-white'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400'
                  }`}
                >
                  {t.familyGuardian} Pay
                </button>
              </div>
            </div>

            {/* Booking Conflict / Error Banner + Alternative Available Drivers */}
            {bookingError && (
              <div className="p-4 bg-rose-500/20 border border-rose-400 rounded-2xl text-xs text-rose-100 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-white">{bookingError}</strong>
                    {alternativeDrivers.length > 0 && (
                      <span className="text-rose-200">
                        Select an available verified driver below to continue:
                      </span>
                    )}
                  </div>
                </div>
                {alternativeDrivers.length > 0 && (
                  <div className="space-y-1.5">
                    {alternativeDrivers.map((alt) => (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => {
                          setSelectedDriverId(alt.id);
                          setBookingError(null);
                          setAlternativeDrivers([]);
                        }}
                        className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl flex items-center justify-between text-left transition-colors"
                      >
                        <span className="font-bold text-white">
                          {alt.name} ({alt.rating} ★)
                        </span>
                        <span className="text-[11px] font-bold text-brand-tealLight">
                          Select Available →
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-teal hover:bg-brand-tealDark disabled:opacity-60 text-white font-black rounded-2xl text-base shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <span>{isSubmitting ? 'Confirming...' : t.confirmBookBtn}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              No hidden cancellation charges before driver dispatch.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function BookDriverPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading booking configuration...</div>}>
      <AuthGuard allowedRoles={['customer', 'family_guardian']}>
        <BookDriverContent />
      </AuthGuard>
    </Suspense>
  );
}
