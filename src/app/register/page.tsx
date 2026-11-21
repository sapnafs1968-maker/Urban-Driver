'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { RoleSelectionCard } from '@/components/auth/RoleSelectionCard';
import {
  Car,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') as 'customer' | 'driver' | null;

  const { login, language, saveDriverOnboardingDraft } = useApp();
  const t = getTranslation(language);

  const [selectedRole, setSelectedRole] = useState<'customer' | 'driver' | null>(roleParam);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (roleParam === 'customer' || roleParam === 'driver') {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const handleSelectRole = (role: 'customer' | 'driver') => {
    setSelectedRole(role);
    setValidationError(null);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match. Please verify and retype.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setValidationError('Please agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }

    const newUserId = `usr_${selectedRole}_${Date.now()}`;
    const newProfile = {
      id: newUserId,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: selectedRole as 'customer' | 'driver',
      city: 'Bengaluru',
      serviceArea: 'Indiranagar',
      preferredLanguage: language,
      avatarUrl:
        selectedRole === 'driver'
          ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    };

    login(newProfile);

    // Situation A: New Driver Registration redirects to Step 1 of onboarding
    if (selectedRole === 'driver') {
      const newDriverId = `drv_${Date.now()}`;
      saveDriverOnboardingDraft(
        newDriverId,
        {
          id: newDriverId,
          userId: newUserId,
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          photoUrl: newProfile.avatarUrl,
          onboardingStatus: 'not_started',
          onboardingStep: 1,
          verificationStatus: 'not_started',
        },
        1
      );

      router.push('/driver/onboarding?step=1');
    } else {
      // Customer registration: redirect to Customer Dashboard
      router.push('/customer/dashboard');
    }
  };

  // If no role is selected yet, render the initial Entry Selection Screen
  if (!selectedRole) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
        <RoleSelectionCard
          mode="register"
          onSelectRole={handleSelectRole}
          onToggleMode={() => router.push('/login')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative animate-in fade-in duration-200">

        {/* Top Controls: Change Role & Language Selector */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setSelectedRole(null);
              setValidationError(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-teal transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToSelection || 'Choose another account type'}</span>
          </button>

          <LanguageSelector variant="compact" />
        </div>

        {/* Brand & Active Account Type Pill */}
        <div className="text-center space-y-2">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-white shadow-md ${selectedRole === 'driver'
              ? 'bg-gradient-to-tr from-brand-navy to-brand-teal shadow-brand-navy/20'
              : 'bg-gradient-to-tr from-brand-teal to-emerald-400 shadow-brand-teal/20'
              }`}
          >
            {selectedRole === 'driver' ? (
              <ShieldCheck className="w-7 h-7 text-brand-tealLight" />
            ) : (
              <Car className="w-7 h-7" />
            )}
          </div>

          <div className="inline-block">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${selectedRole === 'driver'
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-brand-softBlue text-brand-teal border-brand-teal/20'
                }`}
            >
              {selectedRole === 'driver' ? t.proChauffeurBadge || 'Professional Chauffeur' : t.vehicleOwnerBadge || 'Vehicle Owner'}
            </span>
          </div>

          <h1 className="text-2xl font-black text-brand-navy">
            {selectedRole === 'driver' ? t.driverApplication || 'Driver Application' : t.customerRegistration || 'Customer Registration'}
          </h1>
          <p className="text-xs text-slate-500">
            {selectedRole === 'driver'
              ? t.driverRoleDesc || 'Complete your profile, driving licence, and vehicle capabilities to start accepting rides.'
              : t.customerRoleDesc || 'Add your car, hire trusted drivers, and arrange journeys for yourself and your family.'}
          </p>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">

          {/* Full Legal Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.fullNameLabel || 'Full Name'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullNamePlaceholder || 'e.g. Ramesh Sharma'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.emailLabel || 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder || 'name@example.com'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.phoneLabel || 'Mobile Number'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder || '10-digit mobile number'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.passwordLabel || 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.confirmPasswordLabel || 'Confirm Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.confirmPasswordPlaceholder || 'Re-enter your password'}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
            </div>
          </div>

          {/* Terms & Privacy Agreement */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded text-brand-teal border-slate-300 mt-0.5"
              />
              <span className="text-slate-600 leading-normal">
                {t.agreeTerms || 'I agree to the Terms of Service and Privacy Policy'}
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-2xl shadow-md shadow-brand-teal/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] pt-2"
          >
            <span>
              {selectedRole === 'driver'
                ? t.startApplicationBtn || 'Start Driver Application'
                : t.createAccountBtn || 'Create Customer Account'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center text-xs text-slate-500 pt-1">
          {t.haveAccountPrompt || 'Already have an Urban Driver account?'}{' '}
          <Link
            href={`/login?role=${selectedRole}`}
            className="font-bold text-brand-teal hover:underline ml-1"
          >
            {t.signInPrompt || 'Sign In to Your Account'}
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs font-bold text-slate-500">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
