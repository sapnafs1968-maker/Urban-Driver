'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { LocationPicker } from '@/components/location/LocationPicker';
import { AuthGuard } from '@/components/auth/AuthGuard';
import {
  Users,
  Car,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

function FamilyBookDriverContent() {
  const router = useRouter();
  const {
    currentUser,
    familyRelationships,
    vehicles,
    drivers,
    trustedDriverIds,
    createBooking,
    pricingConfig,
    language,
  } = useApp();
  const t = getTranslation(language);

  const relationship = familyRelationships.find(
    (r) => r.guardianUserId === currentUser?.id && r.status === 'active'
  );

  const parentId = relationship?.customerId || 'usr_cust_ramesh';
  const parentName = relationship?.customerName || 'Ramesh Sharma';

  // Parent's vehicles
  const parentVehicles = vehicles.filter((v) => v.customerId === parentId);
  const [selectedVehicleId, setSelectedVehicleId] = useState(parentVehicles[0]?.id || vehicles[0]?.id || '');

  const [pickupAddress, setPickupAddress] = useState('142, 6th Main, Defence Colony, Indiranagar, Bengaluru');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9784, lng: 77.6408 });
  const [destinationAddress, setDestinationAddress] = useState('Manipal Hospital, Old Airport Road, Kodihalli');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9592, lng: 77.6534 });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [pickupDate, setPickupDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState('10:30 AM');
  const [durationHours, setDurationHours] = useState(4.0);

  const [specialInstructions, setSpecialInstructions] = useState(
    'My father has a cardiology review. Please help him walk from the parking bay to the main OPD entrance.'
  );

  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const preferredDriver = drivers.find((d) => trustedDriverIds.includes(d.id)) || drivers[0];

  // Pricing
  const baseFare = pricingConfig.baseHourlyRate * Math.max(pricingConfig.minHours, Math.floor(durationHours));
  const durationFare = durationHours > pricingConfig.minHours ? (durationHours - pricingConfig.minHours) * 100 : 0;
  const platformFee = Math.round((baseFare + durationFare) * (pricingConfig.platformServiceFeePct / 100));
  const taxAmount = Math.round((baseFare + durationFare + platformFee) * 0.05);
  const totalFare = baseFare + durationFare + platformFee + taxAmount;

  const handleFamilyBooking = (e: React.FormEvent) => {
    e.preventDefault();

    const booking = createBooking({
      customerId: parentId,
      customerName: parentName,
      customerPhone: '+91 98450 12345',
      bookedByGuardianId: currentUser?.id || 'usr_guardian',
      bookedByGuardianName: `${currentUser?.name || 'Guardian'} (Son / Guardian)`,
      driverId: preferredDriver.id,
      driverName: preferredDriver.name,
      driverPhone: preferredDriver.phone,
      driverRating: preferredDriver.rating,
      driverPhotoUrl: preferredDriver.photoUrl,
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
      status: 'confirmed',
      preferredDriverId: preferredDriver.id,
      baseFare,
      durationFare,
      platformFee,
      taxAmount,
      totalFare,
      paymentStatus: 'successful',
      paymentMethod: 'guardian_pay',
      specialInstructions,
    });

    setPaymentSuccess(booking.bookingCode);
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-4xl shadow-xl">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          {t.bookingConfirmedTitle}
        </h1>
        <p className="text-base text-slate-600 max-w-md mx-auto">
          {t.bookingCodeIs} <strong className="text-brand-teal font-mono">{paymentSuccess}</strong>.
        </p>
        <button
          onClick={() => router.push('/family/dashboard')}
          className="px-6 py-3 bg-brand-teal text-white font-bold rounded-xl text-sm shadow hover:bg-brand-tealDark"
        >
          {t.goToDashboardTrack}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
          {t.bookForParent} ({parentName})
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.bookDriverSub}
        </p>
      </div>

      <form onSubmit={handleFamilyBooking} className="space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-brand-teal" />
            <span>{t.step1Vehicle}</span>
          </h2>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-900 flex items-center justify-between text-xs">
            <span>{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.registrationNumber})</span>
            <span className="text-brand-teal">{selectedVehicle.transmission === 'automatic' ? t.transAutomatic : t.transManual}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-teal" />
            <span>{t.step3Route}</span>
          </h2>
          <LocationPicker
            label={t.pickupLocation}
            value={pickupAddress}
            onChange={(addr, coords) => {
              setPickupAddress(addr);
              if (coords) setPickupCoords(coords);
            }}
          />
          <LocationPicker
            label={t.destinationLocation}
            value={destinationAddress}
            onChange={(addr, coords) => {
              setDestinationAddress(addr);
              if (coords) setDestCoords(coords);
            }}
          />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-teal" />
            <span>{t.step2Schedule}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t.pickupDate}</label>
              <input
                type="date"
                required
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t.pickupTime}</label>
              <input
                type="text"
                required
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t.durationHours}</label>
              <input
                type="number"
                min={3}
                max={12}
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between text-base font-black border-b border-slate-800 pb-3">
            <span>{t.totalFare}</span>
            <span className="text-brand-tealLight">₹{totalFare.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-brand-teal hover:bg-brand-tealDark text-white font-black rounded-2xl text-base shadow-xl flex items-center justify-center gap-2"
          >
            <span>{t.confirmBookBtn}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function FamilyBookDriverPage() {
  return (
    <AuthGuard allowedRoles={['family_guardian', 'customer', 'admin']}>
      <FamilyBookDriverContent />
    </AuthGuard>
  );
}
