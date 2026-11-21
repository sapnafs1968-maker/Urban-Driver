'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getTranslation } from '@/lib/i18n';
import {
  Car,
  ShieldCheck,
  Check,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Zap,
  Info,
} from 'lucide-react';

function DriverCapabilitiesContent() {
  const router = useRouter();
  const { currentUser, drivers, updateDriverCapabilities, language } = useApp();
  const t = getTranslation(language);

  const driver =
    (currentUser && (drivers.find((d) => d.userId === currentUser.id) ||
      drivers.find((d) => d.email.toLowerCase() === currentUser.email.toLowerCase()))) ||
    drivers[0];

  const [transmissions, setTransmissions] = useState<string[]>(
    driver.supportedTransmissions || ['manual', 'automatic']
  );
  const [fuelTypes, setFuelTypes] = useState<string[]>(
    driver.supportedFuelTypes || ['petrol', 'diesel', 'electric']
  );
  const [vehicleCategories, setVehicleCategories] = useState<string[]>(
    driver.vehicleCategories || ['hatchback', 'sedan', 'compact_suv', 'suv']
  );
  const [specialCapabilities, setSpecialCapabilities] = useState<Record<string, 'beginner' | 'intermediate' | 'expert'>>(
    driver.specialCapabilities || {
      ev_charging: 'intermediate',
      automatic_transmission: 'expert',
      manual_transmission: 'expert',
      city_traffic: 'expert',
      highway_driving: 'expert',
    }
  );
  const [customerAssistance, setCustomerAssistance] = useState(
    driver.customerAssistance || {
      assistingSeniors: true,
      helpEnterExit: true,
      familyAssistedBookings: true,
      hospitalJourneys: true,
      airportJourneys: true,
      recurringBookings: true,
      luggageAssistance: true,
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateDriverCapabilities(driver.id, {
      supportedTransmissions: transmissions,
      supportedFuelTypes: fuelTypes,
      vehicleCategories,
      specialCapabilities,
      customerAssistance,
      capabilities: {
        manualTransmission: transmissions.includes('manual'),
        automaticTransmission: transmissions.includes('automatic'),
        petrolDiesel: fuelTypes.includes('petrol') || fuelTypes.includes('diesel'),
        evCertified: fuelTypes.includes('electric') && specialCapabilities['ev_charging'] === 'expert',
        smallCars: vehicleCategories.includes('hatchback'),
        sedans: vehicleCategories.includes('sedan'),
        suvs: vehicleCategories.includes('suv') || vehicleCategories.includes('compact_suv'),
        luxuryCars: vehicleCategories.includes('luxury'),
        languagesSpoken: driver.capabilities.languagesSpoken,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <Link
            href="/driver/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-teal transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.back}</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.capsTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.capsSub}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{t.saveCapsBtn}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Capabilities saved successfully! Your matching criteria has been updated.</span>
        </div>
      )}

      {/* Re-verification Notice */}
      <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl flex items-start gap-3 text-xs text-teal-950 dark:text-teal-200">
        <Info className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">Matching Engine Note:</strong>
          <span>
            Changes to vehicle classes or fuel familiarity affect which customer booking assignments you are eligible to receive. Major additions may be subject to review by Safety Admin.
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Transmission Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            1. Transmissions You Drive
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {[
              { id: 'manual', label: 'Manual' },
              { id: 'automatic', label: 'Automatic' },
              { id: 'amt', label: 'AMT' },
              { id: 'cvt', label: 'CVT' },
              { id: 'dct', label: 'DCT' },
            ].map((t) => {
              const selected = transmissions.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setTransmissions(
                      selected ? transmissions.filter((x) => x !== t.id) : [...transmissions, t.id]
                    )
                  }
                  className={`p-3 rounded-2xl border text-center font-bold transition-all ${selected
                    ? 'border-brand-teal bg-brand-teal/10 text-brand-teal ring-2 ring-brand-teal/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fuel Types Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            2. Fuel Types Familiarity
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {[
              { id: 'petrol', label: 'Petrol' },
              { id: 'diesel', label: 'Diesel' },
              { id: 'cng', label: 'CNG' },
              { id: 'hybrid', label: 'Hybrid' },
              { id: 'electric', label: 'Electric (EV)' },
            ].map((f) => {
              const selected = fuelTypes.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    setFuelTypes(
                      selected ? fuelTypes.filter((x) => x !== f.id) : [...fuelTypes, f.id]
                    )
                  }
                  className={`p-3 rounded-2xl border text-center font-bold transition-all ${selected
                    ? 'border-brand-teal bg-brand-teal/10 text-brand-teal ring-2 ring-brand-teal/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vehicle Categories */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            3. Vehicle Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { id: 'hatchback', label: 'Hatchback (Swift, i10)' },
              { id: 'sedan', label: 'Sedan (City, Ciaz)' },
              { id: 'compact_suv', label: 'Compact SUV (Creta, Nexon)' },
              { id: 'suv', label: 'Large SUV (Fortuner, XUV)' },
              { id: 'muv_mpv', label: 'MUV / MPV (Innova, Ertiga)' },
              { id: 'luxury', label: 'Luxury (Mercedes, BMW)' },
              { id: 'electric_cars', label: 'Electric Cars (EV)' },
            ].map((cat) => {
              const selected = vehicleCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setVehicleCategories(
                      selected ? vehicleCategories.filter((x) => x !== cat.id) : [...vehicleCategories, cat.id]
                    )
                  }
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${selected
                    ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  <span className="truncate">{cat.label}</span>
                  {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer Assistance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            4. Customer Assistance Declarations
          </h2>
          <div className="space-y-2 text-xs">
            {[
              { key: 'assistingSeniors', label: 'Comfortable assisting senior citizens respectfully' },
              { key: 'helpEnterExit', label: 'Able to help customers enter and exit vehicles within personal capability' },
              { key: 'familyAssistedBookings', label: 'Comfortable with family-assisted remote bookings & status updates' },
              { key: 'hospitalJourneys', label: 'Comfortable with hospital and doctor clinic visits' },
              { key: 'airportJourneys', label: 'Comfortable with airport and luggage assistance' },
              { key: 'recurringBookings', label: 'Open to regular recurring weekly trips with same family' },
            ].map((pref) => {
              const isChecked = !!(customerAssistance as any)[pref.key];
              return (
                <label
                  key={pref.key}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      setCustomerAssistance({
                        ...customerAssistance,
                        [pref.key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-brand-teal"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {pref.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-2xl shadow-lg shadow-brand-teal/25 text-sm flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update My Driving Capabilities</span>
          </button>
        </div>

      </form>
    </div>
  );
}

export default function DriverCapabilitiesPage() {
  return (
    <AuthGuard allowedRoles={['driver', 'admin']}>
      <DriverCapabilitiesContent />
    </AuthGuard>
  );
}
