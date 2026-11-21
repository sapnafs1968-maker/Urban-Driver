'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import {
  DollarSign,
  SlidersHorizontal,
  Building2,
  CheckCircle2,
  Sparkles,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function AdminPricingPage() {
  const {
    pricingConfig,
    updatePricingConfig,
    institutionalLeads,
    createInstitutionalLead,
    language,
  } = useApp();
  const t = getTranslation(language);

  const [baseHourlyRate, setBaseHourlyRate] = useState(pricingConfig.baseHourlyRate);
  const [minHours, setMinHours] = useState(pricingConfig.minHours);
  const [platformServiceFeePct, setPlatformServiceFeePct] = useState(pricingConfig.platformServiceFeePct);
  const [nightSurchargePct, setNightSurchargePct] = useState(pricingConfig.nightSurchargePct);
  const [cancellationFee, setCancellationFee] = useState(pricingConfig.cancellationFee);

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState<'senior_living' | 'hospital' | 'rwa' | 'corporate'>('hospital');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [monthlyTrips, setMonthlyTrips] = useState(100);
  const [notes, setNotes] = useState('');

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingConfig({
      baseHourlyRate,
      minHours,
      platformServiceFeePct,
      nightSurchargePct,
      cancellationFee,
    });
    alert('Platform pricing rules updated successfully across all booking engines!');
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    createInstitutionalLead({
      institutionName,
      institutionType,
      contactPerson,
      email,
      phone,
      city,
      estimatedMonthlyTrips: monthlyTrips,
      notes,
      status: 'new',
    });
    setLeadModalOpen(false);
    alert('Institutional partnership lead recorded!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-bold mb-2">
          <DollarSign className="w-3.5 h-3.5" />
          <span>{t.navPricing}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.adminPricing || 'Pricing Configuration & Institutional Partnerships'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.adminPricingSub || 'Adjust base hourly fares, platform take-rates, cancellation charges, and manage B2B hospital & senior-living pipeline.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Dynamic Pricing Rules Form */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <SlidersHorizontal className="w-5 h-5 text-brand-teal" />
            <span>{t.navPricing} ({t.pricingSummary})</span>
          </h2>

          <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.pricingHourly} (₹/hr)
                </label>
                <input
                  type="number"
                  min={100}
                  step={10}
                  value={baseHourlyRate}
                  onChange={(e) => setBaseHourlyRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.pricingMinHours}
                </label>
                <select
                  value={minHours}
                  onChange={(e) => setMinHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours ({t.verifiedChauffeur})</option>
                  <option value={4}>4 Hours</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.platformFeeLabel} (%)
                </label>
                <input
                  type="number"
                  min={5}
                  max={25}
                  value={platformServiceFeePct}
                  onChange={(e) => setPlatformServiceFeePct(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {t.safetyArrivalCheck}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.pricingNightSurcharge} (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={nightSurchargePct}
                  onChange={(e) => setNightSurchargePct(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  10:00 PM - 06:00 AM
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.pricingCancellationFee} (₹)
              </label>
              <input
                type="number"
                min={0}
                step={25}
                value={cancellationFee}
                onChange={(e) => setCancellationFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-brand-teal hover:bg-brand-tealDark text-white font-black rounded-xl text-xs shadow transition-colors"
              >
                {t.saveChangesBtn || 'Apply Updated Pricing Rules'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Institutional Partnerships Pipeline */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                <span>{t.hospitalClinic || 'Institutional Partnerships'}</span>
              </h2>
              <span className="text-xs text-slate-400">
                {t.hospitalClinic}, {t.seniorMode} & {t.residentialCityLabel}
              </span>
            </div>

            <button
              onClick={() => setLeadModalOpen(true)}
              className="px-3.5 py-1.5 bg-brand-teal text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.registerVehicleBtn || 'Add Lead'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {institutionalLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>{lead.institutionName}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-teal/10 text-brand-teal">
                    {lead.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-slate-500">
                  {lead.contactPerson} • {lead.phone} • {lead.city}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  ~{lead.estimatedMonthlyTrips} journeys
                </div>
                {lead.notes && (
                  <p className="text-[10px] text-slate-400 italic">“{lead.notes}”</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {leadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.hospitalClinic || 'Record Institutional Partnership Lead'}
            </h3>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.fullNameLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manipal Hospital Mobility Desk"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.categoryLabel}
                  </label>
                  <select
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="hospital">{t.hospitalClinic}</option>
                    <option value="senior_living">{t.seniorCitizenSpecialist}</option>
                    <option value="rwa">{t.residentialCityLabel}</option>
                    <option value="corporate">{t.corporateTravel}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.myBookings}
                  </label>
                  <input
                    type="number"
                    value={monthlyTrips}
                    onChange={(e) => setMonthlyTrips(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.fullNameLabel} & {t.phoneLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder={t.fullNameLabel}
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="tel"
                    required
                    placeholder={t.phoneLabel}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setLeadModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-teal text-white font-bold rounded-xl shadow"
                >
                  {t.saveChangesBtn || 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
