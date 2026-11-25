'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { getTranslation, formatVerificationStatus } from '@/lib/i18n';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  User,
  ArrowRight,
  PhoneCall,
  Edit3,
  AlertTriangle,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function VerificationStatusPage() {
  const router = useRouter();
  const { currentUser, drivers, language } = useApp();
  const t = getTranslation(language);

  const driver =
    (currentUser && (drivers.find((d) => d.userId === currentUser.id) ||
      drivers.find((d) => d.email.toLowerCase() === currentUser.email.toLowerCase()))) ||
    drivers[0];

  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const verificationStatus = driver.verificationStatus || 'pending_review';

  // 5-step progress tracker calculation
  // 1: Account Created, 2: Profile Completed, 3: Documents Submitted, 4: Under Verification, 5: Verification Approved
  const getActiveStep = () => {
    if (verificationStatus === 'verified') return 5;
    if (verificationStatus === 'under_verification') return 4;
    if (verificationStatus === 'pending_review' || verificationStatus === 'submitted') return 4;
    if (driver.onboardingStatus === 'completed') return 3;
    if (driver.onboardingStatus === 'draft') return 2;
    return 1;
  };

  const activeStep = getActiveStep();

  const getMaskedDL = (num?: string) => {
    if (!num) return 'KA-03****8711';
    const clean = num.trim();
    if (clean.length < 8) return clean;
    return `${clean.slice(0, 5)}****${clean.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in">

      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center relative overflow-hidden">

        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-brand-teal/10 blur-3xl pointer-events-none" />

        {/* Simulated Demo Mode Banner */}
        {driver.isSimulatedVerification && (
          <div className="p-3 bg-amber-500/10 border border-amber-400/40 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-left">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                Verified via Local Simulation Sandbox (Status: {driver.licenceVerificationStatus || 'DEMO_PASSED'}).
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[9px] font-black uppercase tracking-wider">
              {driver.licenceVerificationBadge || 'SIMULATED — NOT GOVERNMENT VERIFIED'}
            </span>
          </div>
        )}

        {/* Status Icon */}
        <div className="flex justify-center">
          {verificationStatus === 'verified' ? (
            <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/25">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : verificationStatus === 'rejected' ? (
            <div className="w-20 h-20 rounded-3xl bg-rose-500 text-white flex items-center justify-center text-3xl shadow-xl shadow-rose-500/25">
              <AlertTriangle className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-brand-teal text-white flex items-center justify-center text-3xl shadow-xl shadow-brand-teal/25">
              <Clock className="w-10 h-10 animate-spin-slow" />
            </div>
          )}
        </div>

        {/* Headings */}
        <div className="space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
            <span>{t.status}: {formatVerificationStatus(verificationStatus, language)}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {verificationStatus === 'verified'
              ? t.appApproved
              : verificationStatus === 'rejected'
                ? t.appRejected
                : t.appUnderReview}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {verificationStatus === 'verified'
              ? t.appApproved
              : verificationStatus === 'rejected'
                ? driver.rejectionReason || t.appChangesRequested
                : t.appStatusSub}
          </p>
        </div>

        {/* 5-Step Progress Tracker */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-2 text-center text-xs">
            {[
              { num: 1, title: 'Account Created' },
              { num: 2, title: 'Profile Completed' },
              { num: 3, title: 'Documents Submitted' },
              { num: 4, title: 'Under Verification' },
              { num: 5, title: 'Approved' },
            ].map((step) => {
              const isPast = step.num < activeStep;
              const isCurr = step.num === activeStep;

              return (
                <div key={step.num} className="space-y-2">
                  <div
                    className={`w-10 h-10 rounded-2xl mx-auto flex items-center justify-center font-black text-sm transition-all ${isPast
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : isCurr
                        ? 'bg-brand-teal text-white ring-4 ring-brand-teal/20 shadow-md shadow-brand-teal/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : step.num}
                  </div>
                  <span
                    className={`text-[11px] font-bold block leading-tight ${isCurr
                      ? 'text-brand-teal'
                      : isPast
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400'
                      }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4 text-xs text-left">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Profile Completion</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">100%</strong>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Licence Info</span>
            <strong className="text-slate-800 dark:text-slate-200 font-bold text-sm">Submitted</strong>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Identity Proof</span>
            <strong className="text-slate-800 dark:text-slate-200 font-bold text-sm">Uploaded</strong>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Verification</span>
            <strong className="text-brand-teal font-bold text-sm capitalize">
              {verificationStatus === 'verified' ? 'Verified' : 'Pending Review'}
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/driver/dashboard"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow"
          >
            <span>Go to Driver Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/driver/onboarding?step=1"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <Edit3 className="w-3.5 h-3.5 text-brand-teal" />
            <span>Edit Allowed Information</span>
          </Link>

          <button
            type="button"
            onClick={() => setSupportModalOpen(true)}
            className="px-6 py-3 bg-white dark:bg-slate-800 text-brand-teal hover:bg-brand-teal/5 font-bold rounded-xl text-xs flex items-center gap-2 border border-brand-teal/40"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Contact Operations Desk</span>
          </button>
        </div>

      </div>

      {/* Profile Overview (Masked DL) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-brand-teal" />
          <span>Submitted Application Summary</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400 block font-semibold">Driver Name</span>
            <div className="font-bold text-slate-900 dark:text-white">{driver.name}</div>
            <div className="text-slate-500">{driver.phone}</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400 block font-semibold">Driving Licence</span>
            <div className="font-bold text-brand-teal font-mono">
              {getMaskedDL(driver.drivingLicenceNumber)}
            </div>
            <div className="text-slate-500">Karnataka RTO Verified</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
            <span className="text-slate-400 block font-semibold">Base Service Hub</span>
            <div className="font-bold text-slate-900 dark:text-white">{driver.serviceArea}</div>
            <div className="text-slate-500">{driver.experienceYears} Years Exp</div>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-brand-teal" />
              <span>Operations Support</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Need assistance with your background clearance or document status? Contact our driver onboarding desk.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Toll-Free Helpline</span>
                <strong className="text-slate-900 dark:text-white text-sm">1800 555 0199</strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">WhatsApp Onboarding Support</span>
                <strong className="text-slate-900 dark:text-white text-sm">+91 98765 43210</strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Email</span>
                <strong className="text-slate-900 dark:text-white text-sm">verification@urbandriver.in</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSupportModalOpen(false)}
              className="w-full py-2.5 bg-brand-teal text-white font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
