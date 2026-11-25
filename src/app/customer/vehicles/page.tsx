'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Vehicle } from '@/types';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getTranslation } from '@/lib/i18n';
import {
  Car,
  Plus,
  Trash2,
  Check,
  Star,
  Zap,
  Fuel,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

function CustomerVehiclesContent() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, currentUser, language } = useApp();
  const t = getTranslation(language);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form state
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [make, setMake] = useState('Hyundai');
  const [model, setModel] = useState('Creta');
  const [year, setYear] = useState(2023);
  const [category, setCategory] = useState('Compact SUV');
  const [transmission, setTransmission] = useState<'manual' | 'automatic'>('automatic');
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng'>('petrol');
  const [isEv, setIsEv] = useState(false);
  const [vehicleSize, setVehicleSize] = useState<'small' | 'sedan' | 'suv' | 'luxury' | 'other'>('suv');
  const [specialHandlingNotes, setSpecialHandlingNotes] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = () => {
    setRegistrationNumber('');
    setMake('Hyundai');
    setModel('Creta');
    setYear(2023);
    setCategory('Compact SUV');
    setTransmission('automatic');
    setFuelType('petrol');
    setIsEv(false);
    setVehicleSize('suv');
    setSpecialHandlingNotes('');
    setIsDefault(false);
    setEditingVehicle(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setRegistrationNumber(v.registrationNumber);
    setMake(v.make);
    setModel(v.model);
    setYear(v.year);
    setCategory(v.category);
    setTransmission(v.transmission);
    setFuelType(v.fuelType);
    setIsEv(v.isEv);
    setVehicleSize(v.vehicleSize);
    setSpecialHandlingNotes(v.specialHandlingNotes || '');
    setIsDefault(!!v.isDefault);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, {
        registrationNumber,
        make,
        model,
        year,
        category,
        transmission,
        fuelType,
        isEv: fuelType === 'electric' || isEv,
        vehicleSize,
        specialHandlingNotes,
        isDefault,
      });
    } else {
      addVehicle({
        customerId: currentUser?.id || 'usr_guest',
        registrationNumber,
        make,
        model,
        year,
        category,
        transmission,
        fuelType,
        isEv: fuelType === 'electric' || isEv,
        vehicleSize,
        specialHandlingNotes,
        isDefault: isDefault || vehicles.length === 0,
      });
    }
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.myVehiclesTitle}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t.myVehiclesDesc}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-xl text-sm shadow flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.registerVehicleBtn}</span>
        </button>
      </div>

      {/* Vehicle Grid */}
      {vehicles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <Car className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t.noVehiclesTitle}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{t.noVehiclesSub}</p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-brand-teal text-white text-xs font-bold rounded-xl shadow"
          >
            {t.registerVehicleBtn}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm space-y-4 relative transition-all ${v.isDefault
                ? 'border-brand-teal ring-2 ring-brand-teal/20'
                : 'border-slate-200 dark:border-slate-800'
                }`}
            >
              {v.isDefault && (
                <div className="mb-1">
                  <span className="inline-block text-[10px] bg-brand-teal text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t.defaultCarBadge}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200">
                  <Car className="w-6 h-6 text-brand-teal" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {v.make} {v.model}
                  </h3>
                  <span className="text-xs font-mono text-slate-500">
                    {v.registrationNumber}
                  </span>
                </div>
              </div>

              {/* Vehicle Specs Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.transmissionLabel}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {v.transmission === 'automatic' ? t.transAutomatic : t.transManual}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.fuelTypeLabel}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize flex items-center gap-1">
                    {v.isEv && <Zap className="w-3.5 h-3.5 text-emerald-500" />}
                    {v.fuelType === 'electric' ? t.fuelEv : v.fuelType === 'diesel' ? t.fuelDiesel : v.fuelType === 'cng' ? t.fuelCng : v.fuelType === 'hybrid' ? t.fuelHybrid : t.fuelPetrol}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.categoryLabel}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {v.vehicleSize}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.yearLabel}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {v.year}
                  </span>
                </div>
              </div>

              {v.specialHandlingNotes && (
                <div className="text-xs bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-2.5 rounded-xl text-amber-900 dark:text-amber-200">
                  <span className="font-bold block text-[10px] uppercase">{t.handlingNotesLabel}:</span>
                  {v.specialHandlingNotes}
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEdit(v)}
                  className="text-xs font-semibold text-brand-teal hover:underline"
                >
                  {t.editVehicle}
                </button>

                <div className="flex items-center gap-2">
                  {!v.isDefault && (
                    <button
                      onClick={() => updateVehicle(v.id, { isDefault: true })}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    >
                      {t.setDefaultVehicleLabel}
                    </button>
                  )}
                  {vehicles.length > 1 && (
                    <button
                      onClick={() => deleteVehicle(v.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                      title={t.deleteVehicle}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingVehicle ? t.editVehicle : t.registerVehicleBtn}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t.regNumberLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="KA 03 MX 4821"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t.makeLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyundai, Honda, Tata"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t.modelLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Creta, City, Nexon"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t.yearLabel}
                  </label>
                  <input
                    type="number"
                    required
                    min={2005}
                    max={2026}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Technical Attributes (Crucial for Matching Engine) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t.transmissionLabel}
                  </label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="automatic">{t.transAutomatic}</option>
                    <option value="manual">{t.transManual}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t.fuelTypeLabel}
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setFuelType(val);
                      if (val === 'electric') setIsEv(true);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="petrol">{t.fuelPetrol}</option>
                    <option value="diesel">{t.fuelDiesel}</option>
                    <option value="electric">{t.fuelEv}</option>
                    <option value="hybrid">{t.fuelHybrid}</option>
                    <option value="cng">{t.fuelCng}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t.categoryLabel}
                  </label>
                  <select
                    value={vehicleSize}
                    onChange={(e) => setVehicleSize(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="small">Hatchback / Small</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">Compact / Full SUV</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {t.handlingNotesLabel}
                </label>
                <textarea
                  rows={2}
                  value={specialHandlingNotes}
                  onChange={(e) => setSpecialHandlingNotes(e.target.value)}
                  placeholder="e.g. Set AC to 24°C; slow speed on hospital speed breakers..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-brand-teal rounded"
                />
                <label htmlFor="defaultCheck" className="text-slate-700 dark:text-slate-300 font-medium">
                  {t.setDefaultVehicleLabel}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-xl shadow"
                >
                  {t.saveVehicleBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerVehiclesPage() {
  return (
    <AuthGuard allowedRoles={['customer', 'family_guardian']}>
      <CustomerVehiclesContent />
    </AuthGuard>
  );
}
