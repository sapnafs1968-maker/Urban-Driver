'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { getTranslation, formatVerificationStatus } from '@/lib/i18n';
import { Driver, VerificationStatus } from '@/types';
import { AuthGuard } from '@/components/auth/AuthGuard';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Lock,
  Eye,
  Camera,
  Car,
  Globe,
  MapPin,
  Calendar,
  User,
  Check,
  Save,
  MessageSquare,
} from 'lucide-react';

function AdminDriverVerificationContent() {
  const { drivers, adminReviewDriver, adminApproveDemoDriver, currentUser, language } = useApp();
  const t = getTranslation(language);

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'demo' | 'verified' | 'rejected'>('all');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    drivers.find((d) => d.verificationStatus === 'pending_review')?.id || drivers[0]?.id || ''
  );

  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  const [reviewNotes, setReviewNotes] = useState(
    selectedDriver?.verificationNotes ||
      'Sarathi Parivahan record checked. Clean driving record. Police clearance certificate verified.'
  );

  // Modals for Reject / Request Changes / Demo Approval
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const [changesModalOpen, setChangesModalOpen] = useState(false);
  const [changesNotesInput, setChangesNotesInput] = useState('');

  const [demoApproveModalOpen, setDemoApproveModalOpen] = useState(false);

  const [previewPhotoModal, setPreviewPhotoModal] = useState<string | null>(null);
  const [successActionNotice, setSuccessActionNotice] = useState<string | null>(null);

  const filteredDrivers = drivers.filter((d) => {
    if (statusFilter === 'pending') {
      return d.verificationStatus === 'pending_review' || d.verificationStatus === 'submitted' || d.verificationStatus === 'under_verification';
    }
    if (statusFilter === 'demo') {
      return d.isSimulatedVerification || d.verificationMode === 'demo';
    }
    if (statusFilter === 'verified') {
      return d.verificationStatus === 'verified';
    }
    if (statusFilter === 'rejected') {
      return d.verificationStatus === 'rejected' || d.verificationStatus === 'changes_requested';
    }
    return true;
  });

  const handleApproveLive = () => {
    adminReviewDriver(selectedDriver.id, 'approve', reviewNotes);
    setSuccessActionNotice(`${selectedDriver.name}: Approved via Live Registry Clearance.`);
    setTimeout(() => setSuccessActionNotice(null), 4000);
  };

  const handleApproveDemoConfirm = () => {
    adminApproveDemoDriver(selectedDriver.id, reviewNotes);
    setDemoApproveModalOpen(false);
    setSuccessActionNotice(`${selectedDriver.name}: Approved in Demo Sandbox (SIMULATED — NOT GOVERNMENT VERIFIED).`);
    setTimeout(() => setSuccessActionNotice(null), 4000);
  };

  const handleRejectConfirm = () => {
    if (!rejectionReasonInput.trim()) {
      alert(t.verifRejected);
      return;
    }
    adminReviewDriver(selectedDriver.id, 'reject', reviewNotes, rejectionReasonInput);
    setRejectModalOpen(false);
    setRejectionReasonInput('');
    setSuccessActionNotice(`${selectedDriver.name}: ${t.verifRejected}`);
    setTimeout(() => setSuccessActionNotice(null), 4000);
  };

  const handleChangesConfirm = () => {
    if (!changesNotesInput.trim()) {
      alert(t.requestChangesBtn);
      return;
    }
    adminReviewDriver(selectedDriver.id, 'request_changes', reviewNotes, changesNotesInput);
    setChangesModalOpen(false);
    setChangesNotesInput('');
    setSuccessActionNotice(`${selectedDriver.name}: ${t.requestChangesBtn}`);
    setTimeout(() => setSuccessActionNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold mb-2">
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>{t.adminVerif || 'Driver Document Verification & Compliance Review'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.navVerification || 'Driver Verification Desk'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.adminVerifSub || 'Admin terminal for Sarathi Parivahan validation and background clearances.'}
        </p>
      </div>

      {successActionNotice && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successActionNotice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
        {[
          { id: 'all', label: `${t.filterAll} (${drivers.length})` },
          {
            id: 'pending',
            label: `${t.verifUnderReview} (${
              drivers.filter((d) => d.verificationStatus === 'pending_review' || d.verificationStatus === 'submitted').length
            })`,
          },
          {
            id: 'demo',
            label: `Demo Sandbox (${
              drivers.filter((d) => d.isSimulatedVerification || d.verificationMode === 'demo').length
            })`,
          },
          {
            id: 'verified',
            label: `${t.verifApproved} (${drivers.filter((d) => d.verificationStatus === 'verified' && !d.isSimulatedVerification).length})`,
          },
          {
            id: 'rejected',
            label: `${t.verifRejected} (${
              drivers.filter((d) => d.verificationStatus === 'rejected' || d.verificationStatus === 'changes_requested').length
            })`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Driver Queue List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {t.driversDirectory} ({filteredDrivers.length})
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredDrivers.map((driver) => {
              const isSelected = selectedDriver.id === driver.id;
              const isPending =
                driver.verificationStatus === 'pending_review' || driver.verificationStatus === 'submitted';

              return (
                <div
                  key={driver.id}
                  onClick={() => {
                    setSelectedDriverId(driver.id);
                    setReviewNotes(driver.verificationNotes || '');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-teal bg-brand-teal/5 shadow-md ring-2 ring-brand-teal/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={driver.photoUrl}
                        alt={driver.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {driver.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {driver.experienceYears} yrs • {driver.serviceArea.split('&')[0]}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          driver.verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isPending
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {formatVerificationStatus(driver.verificationStatus, language)}
                      </span>
                      {driver.isSimulatedVerification || driver.verificationMode === 'demo' ? (
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-400/40">
                          Demo Mode
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-800 dark:text-teal-200 border border-teal-400/40">
                          Live API
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Full Driver Dossier & Verification Terminal */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Header with Photo & Masking Security Notice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-brand-teal shadow shrink-0">
                  <img
                    src={selectedDriver.photoUrl}
                    alt={selectedDriver.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedDriver.name}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        selectedDriver.verificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {formatVerificationStatus(selectedDriver.verificationStatus, language)}
                    </span>
                  </h2>
                  <div className="text-xs text-slate-500">
                    {t.phoneLabel}: {selectedDriver.phone} • {t.emailLabel}: {selectedDriver.email}
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 border">
                <Lock className="w-3.5 h-3.5 text-brand-teal" />
                <span>{t.policeVerifiedBadge}</span>
              </div>
            </div>

            {/* DEMO MODE WARNING BANNER */}
            {selectedDriver.isSimulatedVerification || selectedDriver.verificationMode === 'demo' ? (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-amber-900/30 border-2 border-amber-400 dark:border-amber-600 rounded-2xl flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 dark:text-amber-100 space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="font-black text-sm text-amber-900 dark:text-amber-200">
                      Simulated Demonstration Record
                    </strong>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      SIMULATED — NOT GOVERNMENT VERIFIED
                    </span>
                  </div>
                  <p className="leading-relaxed text-amber-900 dark:text-amber-200">
                    This driver was evaluated using Urban Driver's local demonstration simulation engine. No government registry was queried. An application passing demo verification must never be represented as genuinely government-verified or make a driver eligible for real customer trips in production.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0" />
                  <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                    Live Parivahan / Sarathi Registry Connector Record
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[9px] font-bold uppercase tracking-wider">
                  Live API
                </span>
              </div>
            )}

            {/* Rejection / Changes Notice if any */}
            {selectedDriver.rejectionReason && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-800 dark:text-rose-300 rounded-2xl text-xs space-y-1">
                <strong>{t.verifRejected}:</strong>
                <p>{selectedDriver.rejectionReason}</p>
              </div>
            )}

            {selectedDriver.changesRequestedNotes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-800 dark:text-amber-300 rounded-2xl text-xs space-y-1">
                <strong>{t.requestChangesBtn}:</strong>
                <p>{selectedDriver.changesRequestedNotes}</p>
              </div>
            )}

            {/* UNMASKED LICENCE DOSSIER */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-brand-teal" />
                  <span>1. {t.dlNumberLabel}</span>
                </span>
                <span className="text-[10px] font-mono bg-brand-teal/20 text-brand-teal px-2 py-0.5 rounded font-bold">
                  {t.policeVerifiedBadge}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">{t.dlNumberLabel}</span>
                  <strong className="text-slate-900 dark:text-white font-mono text-sm">
                    {selectedDriver.drivingLicenceNumber || 'KA-03-2016-0098711'}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">{t.issuingRtoLabel}</span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedDriver.licenceIssuingState || 'Karnataka'} ({selectedDriver.issuingRto || 'KA-03'})
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">{t.pickupDateLabel}</span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedDriver.licenceIssueDate || '2016-05-12'}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">{t.dlExpiryLabel}</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {selectedDriver.licenceExpiryDate || '2036-05-12'}
                  </strong>
                </div>
              </div>

              {/* Document Scans (Front & Back) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">{t.uploadDlFrontBtn}:</span>
                  <div
                    onClick={() =>
                      setPreviewPhotoModal(
                        selectedDriver.licenceFrontPhotoUrl ||
                          'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80'
                      )
                    }
                    className="h-28 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer group relative"
                  >
                    <img
                      src={
                        selectedDriver.licenceFrontPhotoUrl ||
                        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80'
                      }
                      alt="Front"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                      <Eye className="w-3.5 h-3.5" /> {t.previewTripBtn}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">{t.uploadDlBackBtn}:</span>
                  <div
                    onClick={() =>
                      setPreviewPhotoModal(
                        selectedDriver.licenceBackPhotoUrl ||
                          'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80'
                      )
                    }
                    className="h-28 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer group relative"
                  >
                    <img
                      src={
                        selectedDriver.licenceBackPhotoUrl ||
                        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80'
                      }
                      alt="Back"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                      <Eye className="w-3.5 h-3.5" /> {t.previewTripBtn}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AUTOMATED LICENCE VERIFICATION AUDIT & MATCHING REPORT */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-teal" />
                  <span>2. Automated Licence Verification Audit & Matching Report</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    Mode: {selectedDriver.verificationMode ? selectedDriver.verificationMode.toUpperCase() : 'DEMO'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                    {selectedDriver.licenceVerificationBadge || 'SIMULATED — NOT GOVERNMENT VERIFIED'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">Status Code</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm block mt-0.5">
                    {selectedDriver.licenceVerificationStatus || 'DEMO_PASSED'}
                  </strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">Name Matching Check</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-slate-800 dark:text-slate-200 font-bold truncate">
                      {selectedDriver.name}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded uppercase">
                      Matched
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">DOB Matching Check</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">
                      {selectedDriver.dob || '1992-03-21'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded uppercase">
                      Matched
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Authorised Vehicle Classes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedDriver.licenceVehicleClasses || ['LMV (Light Motor Vehicle)', 'MCWG']).map((cls) => (
                      <span key={cls} className="px-2 py-0.5 rounded bg-brand-teal/20 text-brand-teal font-bold text-[10px]">
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">Registry Validity Status:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    Active (Expiry: {selectedDriver.licenceExpiryDate || '2036-05-12'})
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Capabilities & Languages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  2. {t.transmissionsLabel}
                </span>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div><strong>{t.transmissionsLabel}:</strong> {selectedDriver.supportedTransmissions?.join(', ').toUpperCase() || 'MANUAL, AUTOMATIC'}</div>
                  <div><strong>{t.fuelTypesLabel}:</strong> {selectedDriver.supportedFuelTypes?.join(', ').toUpperCase() || 'PETROL, DIESEL, EV'}</div>
                  <div><strong>{t.vehiclesDrivenLabel}:</strong> {selectedDriver.vehicleCategories?.join(', ') || 'Sedan, SUV'}</div>
                  <div><strong>{t.evCertifiedLabel}:</strong> {selectedDriver.capabilities?.evCertified ? 'YES' : 'Standard'}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  3. {t.languagesFluentLabel}
                </span>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div><strong>{t.languagesFluentLabel}:</strong> {selectedDriver.capabilities?.languagesSpoken?.join(', ') || 'Kannada, English, Hindi'}</div>
                  <div><strong>{t.seniorAssistanceLabel}:</strong> {t.assistedBookingSub}</div>
                  <div><strong>{t.serviceAreasLabel}:</strong> {selectedDriver.serviceArea}</div>
                  <div><strong>{t.selfDeclarationLabel}:</strong> {t.verifApproved}</div>
                </div>
              </div>
            </div>

            {/* Safety Admin Verification Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {t.notesLabel}
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* ACTION BUTTONS (APPROVE / REJECT / REQUEST CORRECTIONS) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Reject Button */}
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(true)}
                  className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-300 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>{t.rejectDriverBtn || 'Reject Application'}</span>
                </button>

                {/* Request Corrections Button */}
                <button
                  type="button"
                  onClick={() => setChangesModalOpen(true)}
                  className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-300 text-amber-700 dark:text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>{t.requestChangesBtn || 'Request Corrections'}</span>
                </button>
              </div>

              {/* Separate Approval Actions for Demo vs Live */}
              {selectedDriver.isSimulatedVerification || selectedDriver.verificationMode === 'demo' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoApproveModalOpen(true)}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-600/25 transition-all hover:scale-[1.02]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve in Demo Sandbox</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApproveLive}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-all"
                    title="Manual administrative override to mark as Government Verified"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Promote to Live Verified</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApproveLive}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Verify Driver (Live Registry)</span>
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>{t.rejectDriverBtn || 'Reject Driver Application'}</span>
            </h3>
            <textarea
              rows={3}
              required
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder={t.rejectionReasonLabel || 'Enter reason...'}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl text-xs"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
              >
                {t.rejectDriverBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Changes Modal */}
      {changesModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              <span>{t.requestChangesBtn || 'Request Profile Corrections'}</span>
            </h3>
            <textarea
              rows={3}
              required
              value={changesNotesInput}
              onChange={(e) => setChangesNotesInput(e.target.value)}
              placeholder={t.changesRequestedNotice || 'Enter requested corrections...'}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setChangesModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-xl text-xs"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleChangesConfirm}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs"
              >
                {t.sendReplyBtn || 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Sandbox Approval Confirmation Modal */}
      {demoApproveModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Demo Sandbox Approval
                </h3>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-bold">
                  SIMULATED — NOT GOVERNMENT VERIFIED
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You are about to approve <strong>{selectedDriver.name}</strong> within the demonstration sandbox environment.
            </p>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <strong>Compliance Notice:</strong>
              <p>
                This profile will remain permanently tagged with the badge <code>SIMULATED — NOT GOVERNMENT VERIFIED</code>. Passing demo verification does not make a driver eligible for commercial trips with real customers.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDemoApproveModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveDemoConfirm}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Confirm Demo Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarge Scan Modal */}
      {previewPhotoModal && (
        <div
          onClick={() => setPreviewPhotoModal(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
            <img src={previewPhotoModal} alt="Document Scan" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminDriverVerificationPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <AdminDriverVerificationContent />
    </AuthGuard>
  );
}
