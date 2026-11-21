'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { AssistedBookingModal } from '@/components/support/AssistedBookingModal';
import {
  Car,
  ShieldCheck,
  HeartHandshake,
  Users,
  Clock,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  MapPin,
  Star,
  FileCheck2,
  Lock,
  Compass,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  Award,
  Smartphone,
  Eye,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const { currentUser, seniorMode, toggleSeniorMode, language } = useApp();
  const t = getTranslation(language);
  const [assistedModalOpen, setAssistedModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const faqs = [
    {
      q: t.faq1Q,
      a: t.faq1A,
    },
    {
      q: t.faq2Q,
      a: t.faq2A,
    },
    {
      q: t.faq3Q,
      a: t.faq3A,
    },
    {
      q: t.faq4Q,
      a: t.faq4A,
    },
    {
      q: t.faq5Q,
      a: t.faq5A,
    },
    {
      q: t.faq6Q,
      a: t.faq6A,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-800">

      {/* 1. HERO SECTION (Light Theme, Apple-Inspired Clean Layout) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/70">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#142b45_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pilot Location Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-softBlue border border-brand-teal/20 text-brand-teal text-xs font-bold uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                <span>{t.pilotBadgeText}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-brand-navy tracking-tight leading-[1.12]">
                {t.heroHeadline}
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                {t.heroSubheadline}
              </p>

              {/* Prominent CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href={currentUser ? '/customer/book' : '/register?role=customer'}
                  className="w-full sm:w-auto px-8 py-4 bg-brand-teal hover:bg-brand-tealDark text-white text-base font-bold rounded-2xl shadow-lg shadow-brand-teal/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
                >
                  <Car className="w-5 h-5" />
                  <span>{t.heroCtaBook}</span>
                </Link>

                <Link
                  href={currentUser ? '/driver/dashboard' : '/register?role=driver'}
                  className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-brand-navy border border-slate-300 text-base font-bold rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all hover:border-slate-400"
                >
                  <ShieldCheck className="w-5 h-5 text-brand-teal" />
                  <span>{t.heroCtaDriver}</span>
                </Link>

                <button
                  onClick={() => setAssistedModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-4 text-slate-600 hover:text-brand-navy text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span>{t.heroCtaAssisted}</span>
                </button>
              </div>

              {/* Trust & Proof Highlights */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-brand-navy">45+</div>
                  <div className="text-xs text-slate-500 font-medium">{t.statVerifiedDrivers}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-brand-navy">1,280+</div>
                  <div className="text-xs text-slate-500 font-medium">{t.statSeniorTrips}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600">99.8%</div>
                  <div className="text-xs text-slate-500 font-medium">{t.statArrivalRate}</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-brand-teal">4.9 ★</div>
                  <div className="text-xs text-slate-500 font-medium">{t.statRating}</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card — Apple-style Mobility Graphic */}
            <div className="lg:col-span-5">
              <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl space-y-5">
                {/* Live Pill */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {t.statusStarted}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-brand-teal bg-brand-softBlue px-2.5 py-0.5 rounded-full">
                    {t.familyGuardian}
                  </span>
                </div>

                {/* Driver Identity Snippet */}
                <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80"
                    alt="Driver Suresh Kumar"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-teal shadow-xs"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">Suresh Kumar</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      12 yrs exp • {t.transManual} & {t.transAutomatic} • 4.92 ★
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                        Toyota Innova Crysta
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                        {t.trustedCircleBadge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Trip Route */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-teal mt-1 shrink-0" />
                    <div>
                      <span className="text-slate-400 block font-medium">{t.pickupLocation}</span>
                      <span className="text-slate-800 font-bold">14th Main, Indiranagar, Bengaluru</span>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-slate-200 ml-1 pl-4 py-1 text-slate-400 text-[11px]">
                    {t.transmissionMatch} • ETA: 18 mins
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-slate-400 block font-medium">{t.destinationLocation}</span>
                      <span className="text-slate-800 font-bold">Manipal Hospital, Old Airport Road</span>
                    </div>
                  </div>
                </div>

                {/* Family Peace-of-Mind Notice */}
                <div className="p-3.5 bg-brand-softBlue/70 border border-brand-teal/20 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-brand-navy font-semibold">
                    <HeartHandshake className="w-4 h-4 text-brand-teal shrink-0" />
                    <span>{t.safeArrivalQuestion}</span>
                  </div>
                  <span className="font-bold text-brand-teal">PIN: 4892</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW URBAN DRIVER WORKS */}
      <section id="how-it-works" className="py-20 bg-slate-50/60 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal bg-brand-softBlue px-3.5 py-1 rounded-full border border-brand-teal/20">
              {t.howItWorksTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
              {t.howItWorksTitle}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {t.howItWorksSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-brand-softBlue border border-brand-teal/20 flex items-center justify-center text-brand-navy font-black text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-brand-navy">{t.howStep1Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.howStep1Desc}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-brand-softBlue border border-brand-teal/20 flex items-center justify-center text-brand-navy font-black text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-brand-navy">{t.howStep2Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.howStep2Desc}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-brand-softBlue border border-brand-teal/20 flex items-center justify-center text-brand-navy font-black text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-brand-navy">{t.howStep3Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.howStep3Desc}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-brand-softBlue border border-brand-teal/20 flex items-center justify-center text-brand-navy font-black text-lg">
                4
              </div>
              <h3 className="text-lg font-bold text-brand-navy">{t.howStep4Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.howStep4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUE DIFFERENTIATORS / FEATURES */}
      <section id="for-customers" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal bg-brand-softBlue px-3.5 py-1 rounded-full border border-brand-teal/20">
              {t.featuresTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
              {t.featuresTitle}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {t.featuresSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-slate-50/70 rounded-3xl border border-slate-200 hover:border-brand-teal/40 hover:bg-white hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-colors shadow-xs">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-brand-navy">{t.featSeniorCareTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.featSeniorCareDesc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-50/70 rounded-3xl border border-slate-200 hover:border-brand-teal/40 hover:bg-white hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-colors shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-brand-navy">{t.featFamilyTrackingTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.featFamilyTrackingDesc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-50/70 rounded-3xl border border-slate-200 hover:border-brand-teal/40 hover:bg-white hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-colors shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-brand-navy">{t.featVerifiedOnlyTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.featVerifiedOnlyDesc}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-slate-50/70 rounded-3xl border border-slate-200 hover:border-brand-teal/40 hover:bg-white hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-colors shadow-xs">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-brand-navy">{t.featMultiTransmissionTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.featMultiTransmissionDesc}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-slate-50/70 rounded-3xl border border-slate-200 hover:border-brand-teal/40 hover:bg-white hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-colors shadow-xs">
                <AlertCircle className="w-6 h-6 text-brand-teal" />
              </div>
              <h3 className="text-base font-bold text-brand-navy">{t.featEmergencyHelpTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.featEmergencyHelpDesc}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-slate-50/70 rounded-3xl border border-slate-200 hover:border-brand-teal/40 hover:bg-white hover:shadow-md transition-all space-y-3 group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-colors shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-brand-navy">{t.featTransparentPricingTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.featTransparentPricingDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEDICATED SENIOR CITIZEN MODE SECTION */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  {t.seniorCareTag}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight leading-tight">
                  {t.seniorCareTitle}
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  {t.seniorCareSub}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                      {t.seniorCareItem1}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                      {t.seniorCareItem2}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                      {t.seniorCareItem3}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                      {t.seniorCareItem4}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={toggleSeniorMode}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-sm flex items-center gap-2 transition-all"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>{t.seniorCareTryMode}</span>
                  </button>
                  <button
                    onClick={() => setAssistedModalOpen(true)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-full transition-all"
                  >
                    {t.heroCtaAssisted}
                  </button>
                </div>
              </div>

              {/* Senior Mode Visual Preview */}
              <div className="lg:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="font-bold text-sm text-slate-800">{t.seniorMode}</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {t.statusStarted}
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">{t.hospitalClinic}</span>
                      <p className="text-sm font-bold text-slate-900">Manipal Hospital Dialysis</p>
                    </div>
                    <span className="px-3 py-1 bg-brand-teal text-white font-bold text-xs rounded-xl">
                      {t.bookDriver}
                    </span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium">{t.trustedDrivers}</span>
                      <p className="text-sm font-bold text-slate-900">Suresh Kumar (Toyota Innova)</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                      {t.details}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAMILY GUARDIAN SECTION */}
      <section className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Card */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-teal" />
                    <span className="font-bold text-sm text-slate-900">{t.familyGuardian}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    {t.verifiedDriver}
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Mrs. Sarla Devi</span>
                    <span className="text-brand-teal font-semibold">{t.statusStarted}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Route: Jayanagar 4th Block ➔ Apollo Hospital Bannerghatta
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-slate-600 border-t border-slate-100">
                    <span>Driver: Anand Verma</span>
                    <span className="text-emerald-600 font-bold">{t.statusArrived}</span>
                  </div>
                </div>

                <div className="p-3 bg-brand-softBlue/60 rounded-2xl border border-brand-teal/20 text-xs text-brand-navy flex items-center gap-2 font-medium">
                  <Sparkles className="w-4 h-4 text-brand-teal shrink-0" />
                  <span>{t.arrivalConfirmedMsg}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-brand-softBlue text-brand-teal border border-brand-teal/20">
                <Users className="w-4 h-4" />
                {t.familyCareTag}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight leading-tight">
                {t.familyCareTitle}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {t.familyCareSub}
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>{t.familyCareItem1}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>{t.familyCareItem2}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>{t.familyCareItem3}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>{t.familyCareItem4}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={currentUser ? '/family/dashboard' : '/login?role=customer'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy hover:bg-brand-navyLight text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-all"
                >
                  <span>{t.familyCareOpenHub}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DRIVER RECRUITMENT SECTION */}
      <section id="for-drivers" className="py-20 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-navy rounded-3xl text-white p-8 sm:p-14 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              <div className="lg:col-span-8 space-y-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 text-brand-tealLight border border-white/20">
                  <Car className="w-4 h-4" />
                  {t.driverJoinTag}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  {t.driverJoinTitle}
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {t.driverJoinSub}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="font-bold text-brand-tealLight text-sm block mb-1">
                      {t.driverJoinItem1}
                    </span>
                    <span>{t.driverJoinItem2}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="font-bold text-emerald-400 text-sm block mb-1">
                      {t.driverJoinItem3}
                    </span>
                    <span>{t.driverJoinItem4}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href="/register?role=driver"
                    className="px-8 py-3.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold text-sm rounded-full shadow-lg shadow-brand-teal/25 flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <span>{t.driverJoinApplyBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/driver/onboarding"
                    className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-full border border-white/20 transition-colors"
                  >
                    {t.onboardingTitle}
                  </Link>
                </div>
              </div>

              {/* Driver Badge Preview */}
              <div className="lg:col-span-4 bg-white/10 p-6 rounded-3xl border border-white/15 backdrop-blur-sm space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                    alt="Driver verification preview"
                    className="w-12 h-12 rounded-2xl object-cover border border-white/20"
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{t.verifiedDriver}</p>
                    <p className="text-xs text-slate-300">{t.verifVerified}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-200">
                  <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl">
                    <span>{t.stepLicence}</span>
                    <span className="text-emerald-400 font-bold">{t.verifVerified}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl">
                    <span>{t.stepCapabilities}</span>
                    <span className="text-brand-tealLight font-bold">{t.transManual} & {t.transAutomatic}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl">
                    <span>{t.myBookings}</span>
                    <span className="text-white font-bold">{t.statusStarted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRUST AND VERIFICATION SECTION */}
      <section id="safety" className="py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal bg-brand-softBlue px-3.5 py-1 rounded-full border border-brand-teal/20">
              {t.safetyTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
              {t.safetyTitle}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {t.safetySub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
              <span className="w-8 h-8 rounded-full bg-brand-softBlue text-brand-teal font-black text-xs flex items-center justify-center">
                01
              </span>
              <h3 className="text-base font-bold text-brand-navy">{t.safety1Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.safety1Desc}
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
              <span className="w-8 h-8 rounded-full bg-brand-softBlue text-brand-teal font-black text-xs flex items-center justify-center">
                02
              </span>
              <h3 className="text-base font-bold text-brand-navy">{t.safety2Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.safety2Desc}
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
              <span className="w-8 h-8 rounded-full bg-brand-softBlue text-brand-teal font-black text-xs flex items-center justify-center">
                03
              </span>
              <h3 className="text-base font-bold text-brand-navy">{t.safety3Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.safety3Desc}
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
              <span className="w-8 h-8 rounded-full bg-brand-softBlue text-brand-teal font-black text-xs flex items-center justify-center">
                04
              </span>
              <h3 className="text-base font-bold text-brand-navy">{t.safety4Title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.safety4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-teal bg-brand-softBlue px-3.5 py-1 rounded-full border border-brand-teal/20">
              {t.faqTag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
              {t.faqTitle}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {t.faqSub}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180 text-brand-teal' : ''
                      }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. LIGHT THEME STRUCTURED FOOTER */}
      <footer id="about" className="bg-white pt-16 pb-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-teal flex items-center justify-center text-white shadow-sm">
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-brand-navy tracking-tight">
                  URBAN DRIVER
                </span>
              </Link>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                {t.tagline}
              </p>
              <div className="pt-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{t.support}:</span>{' '}
                <a href="tel:18005550199" className="text-brand-teal hover:underline font-bold">
                  {t.callHelplineNumber} ({t.callSupport})
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">{t.footerQuickLinks}</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/customer/book" className="hover:text-brand-teal">
                    {t.bookDriver}
                  </Link>
                </li>
                <li>
                  <Link href="/customer/drivers" className="hover:text-brand-teal">
                    {t.findDrivers}
                  </Link>
                </li>
                <li>
                  <Link href="/family/dashboard" className="hover:text-brand-teal">
                    {t.familyGuardian}
                  </Link>
                </li>
                <li>
                  <Link href="/customer/trusted-drivers" className="hover:text-brand-teal">
                    {t.trustedDrivers}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Drivers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">{t.navForDrivers}</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/register?role=driver" className="hover:text-brand-teal">
                    {t.heroCtaDriver}
                  </Link>
                </li>
                <li>
                  <Link href="/driver/onboarding" className="hover:text-brand-teal">
                    {t.onboardingTitle}
                  </Link>
                </li>
                <li>
                  <Link href="/driver/capabilities" className="hover:text-brand-teal">
                    {t.navCapabilities}
                  </Link>
                </li>
                <li>
                  <Link href="/driver/verification-status" className="hover:text-brand-teal">
                    {t.navVerification}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Policy */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">{t.footerPilotTitle}</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                {t.footerPilotDesc}
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/privacy" className="hover:text-brand-teal">
                    {t.privacyPolicy}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-brand-teal">
                    {t.termsOfService}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>{t.footerCopyright}</p>
            <p>{t.footerEmergencyNotice}</p>
          </div>
        </div>
      </footer>

      {/* Assisted Booking Modal */}
      <AssistedBookingModal
        isOpen={assistedModalOpen}
        onClose={() => setAssistedModalOpen(false)}
      />
    </div>
  );
}
