'use client';

import React from 'react';
import { Car, ShieldCheck, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { LanguageSelector } from '@/components/layout/LanguageSelector';

interface RoleSelectionProps {
  onSelectRole: (role: 'customer' | 'driver') => void;
  mode: 'login' | 'register';
  onToggleMode: (mode: 'login' | 'register') => void;
}

export const RoleSelectionCard: React.FC<RoleSelectionProps> = ({
  onSelectRole,
  mode,
  onToggleMode,
}) => {
  const { language } = useApp();
  const t = getTranslation(language);

  return (
    <div className="max-w-3xl w-full mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">

      {/* Top Header */}
      <div className="text-center space-y-3 relative">
        <div className="flex justify-center mb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-softBlue border border-brand-teal/20 text-brand-teal text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span>{t.welcomeBadge || 'Welcome to Urban Driver'}</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-brand-navy tracking-tight">
          {t.selectAccountType || 'Select Your Account Type'}
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {t.selectAccountTypeDesc ||
            `Please choose how you want to use Urban Driver to continue with ${mode === 'login' ? 'login' : 'registration'}.`}
        </p>

        <div className="absolute right-0 top-0 hidden sm:block">
          <LanguageSelector variant="compact" />
        </div>
      </div>

      {/* Two Large Role Cards (Apple-Inspired Clean Light Aesthetics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* OPTION 1: CUSTOMER */}
        <div
          onClick={() => onSelectRole('customer')}
          className="group relative bg-white border-2 border-slate-200/90 hover:border-brand-teal rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
        >
          <div className="space-y-5">
            {/* Icon Banner */}
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-teal to-emerald-400 text-white flex items-center justify-center shadow-md shadow-brand-teal/20 group-hover:scale-105 transition-transform">
                <Car className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-softBlue text-brand-teal border border-brand-teal/20">
                {t.vehicleOwnerBadge || 'Vehicle Owner'}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-brand-navy group-hover:text-brand-teal transition-colors">
                {t.imCustomer || 'I’m a Customer'}
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {t.customerRoleDesc || 'I own a vehicle and want to book a trusted driver to drive my car.'}
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t.customerCheck1 || 'Book verified drivers for your personal car'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t.customerCheck2 || 'Senior citizen mode & 1-tap hospital destinations'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t.customerCheck3 || 'Remote family tracking & safe arrival alerts'}</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-navy hover:bg-brand-teal text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-md"
            >
              <span>{t.continueAsCustomer || 'Continue as Customer'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* OPTION 2: DRIVER */}
        <div
          onClick={() => onSelectRole('driver')}
          className="group relative bg-white border-2 border-slate-200/90 hover:border-brand-navy rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
        >
          <div className="space-y-5">
            {/* Icon Banner */}
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-navy to-brand-teal text-white flex items-center justify-center shadow-md shadow-brand-navy/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-8 h-8 text-brand-tealLight" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {t.proChauffeurBadge || 'Professional Chauffeur'}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-brand-navy group-hover:text-brand-teal transition-colors">
                {t.imDriver || 'I’m a Driver'}
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {t.driverRoleDesc || 'I want to register as a professional driver and receive driving assignments.'}
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t.driverCheck1 || 'Drive customers’ personal vehicles (no car loans)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t.driverCheck2 || 'Reliable hourly rates with weekly direct bank payout'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t.driverCheck3 || 'Simple 8-step digital licence & background onboarding'}</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="button"
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-navy hover:bg-brand-teal text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-md"
            >
              <span>{t.continueAsDriver || 'Continue as Driver'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Footer Toggle between Login & Signup */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          {mode === 'login' ? (
            <>
              {t.noAccountPrompt || 'Don’t have an Urban Driver account?'}{' '}
              <button
                type="button"
                onClick={() => onToggleMode('register')}
                className="font-bold text-brand-teal hover:underline ml-1"
              >
                {t.createNewAccount || 'Create a New Account'}
              </button>
            </>
          ) : (
            <>
              {t.haveAccountPrompt || 'Already have an Urban Driver account?'}{' '}
              <button
                type="button"
                onClick={() => onToggleMode('login')}
                className="font-bold text-brand-teal hover:underline ml-1"
              >
                {t.signInPrompt || 'Sign In to Your Account'}
              </button>
            </>
          )}
        </p>
      </div>

    </div>
  );
};
