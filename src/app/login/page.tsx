'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { DEMO_ACCOUNTS } from '@/lib/demo-data';
import { getTranslation } from '@/lib/i18n';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { RoleSelectionCard } from '@/components/auth/RoleSelectionCard';
import {
  Car,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') as 'customer' | 'driver' | null;

  const { login, setSeniorMode, language, checkDriverRedirect } = useApp();
  const t = getTranslation(language);

  const [selectedRole, setSelectedRole] = useState<'customer' | 'driver' | null>(roleParam);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roleMismatchError, setRoleMismatchError] = useState<{
    actualRole: string;
    message: string;
  } | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  useEffect(() => {
    if (roleParam === 'customer' || roleParam === 'driver') {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const handleSelectRole = (role: 'customer' | 'driver') => {
    setSelectedRole(role);
    setErrorMessage(null);
    setRoleMismatchError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRoleMismatchError(null);

    const cleanInput = emailOrPhone.trim().toLowerCase();

    // Check if account exists in demo accounts or active database
    const matchedAccount = DEMO_ACCOUNTS.find(
      (acc) =>
        acc.profile.email.toLowerCase() === cleanInput ||
        acc.profile.phone.replace(/\s+/g, '') === cleanInput.replace(/\s+/g, '')
    );

    if (matchedAccount) {
      const userRole = matchedAccount.profile.role;

      // STRICT ROLE VERIFICATION CHECK:
      // Never allow a driver to log in via Customer login or customer via Driver login
      if (selectedRole === 'customer' && userRole === 'driver') {
        setRoleMismatchError({
          actualRole: 'driver',
          message: 'This account is registered as a Professional Driver. Please switch to Driver Login to access your assignments and onboarding.',
        });
        return;
      }

      if (selectedRole === 'driver' && (userRole === 'customer' || userRole === 'family_guardian')) {
        setRoleMismatchError({
          actualRole: 'customer',
          message: 'This account is registered as a Customer / Vehicle Owner. Please switch to Customer Login to book drivers and manage family access.',
        });
        return;
      }

      executeLogin(matchedAccount.profile);
    } else {
      // If user typed custom credentials for demonstration
      if (selectedRole === 'driver') {
        const fallbackDriver = DEMO_ACCOUNTS.find((a) => a.role === 'driver_verified')!;
        executeLogin({
          ...fallbackDriver.profile,
          email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@urbandriver.in`,
          name: cleanInput.split('@')[0],
        });
      } else {
        const fallbackCustomer = DEMO_ACCOUNTS.find((a) => a.role === 'customer_senior')!;
        executeLogin({
          ...fallbackCustomer.profile,
          email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@example.com`,
          name: cleanInput.split('@')[0],
        });
      }
    }
  };

  const executeLogin = (userProfile: typeof DEMO_ACCOUNTS[0]['profile']) => {
    login(userProfile);

    if (userProfile.role === 'driver') {
      setSeniorMode(false);
      // ESSENTIAL REQUIREMENT: Check driver redirection status
      const destination = checkDriverRedirect(userProfile);
      router.push(destination);
    } else if (userProfile.role === 'admin') {
      setSeniorMode(false);
      router.push('/admin/dashboard');
    } else if (userProfile.role === 'family_guardian') {
      setSeniorMode(false);
      router.push('/family/dashboard');
    } else {
      // Customer
      if (userProfile.seniorModeEnabled) {
        setSeniorMode(true);
      }
      router.push('/customer/dashboard');
    }
  };

  const handlePersonaLogin = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setSelectedRole(acc.profile.role === 'driver' ? 'driver' : 'customer');
    setErrorMessage(null);
    setRoleMismatchError(null);
    executeLogin(acc.profile);
  };

  // If no role is selected yet, render the initial Entry Selection Screen
  if (!selectedRole) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
        <RoleSelectionCard
          mode="login"
          onSelectRole={handleSelectRole}
          onToggleMode={() => router.push('/register')}
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
              setRoleMismatchError(null);
              setErrorMessage(null);
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
              {selectedRole === 'driver' ? t.proChauffeurBadge || 'Professional Driver Account' : t.vehicleOwnerBadge || 'Customer / Vehicle Owner'}
            </span>
          </div>

          <h1 className="text-2xl font-black text-brand-navy">
            {selectedRole === 'driver' ? t.driverSignIn || 'Driver Sign In' : t.customerSignIn || 'Customer Sign In'}
          </h1>
          <p className="text-xs text-slate-500">
            {selectedRole === 'driver'
              ? t.driverRoleDesc || 'Access your driving assignments, verification status, and daily schedules.'
              : t.customerRoleDesc || 'Hire verified drivers to safely operate your personal vehicle.'}
          </p>
        </div>

        {/* Role Mismatch Warning Banner */}
        {roleMismatchError && (
          <div className="p-4 bg-amber-50 border-2 border-amber-500/80 rounded-2xl space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <strong className="block font-bold mb-0.5">{t.details || 'Notice'}</strong>
                {roleMismatchError.actualRole === 'driver' ? t.switchRolePromptDriver : t.switchRolePromptCustomer}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedRole(roleMismatchError.actualRole as any);
                setRoleMismatchError(null);
              }}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              {roleMismatchError.actualRole === 'driver' ? t.switchRoleBtnDriver || 'Switch to Driver Login' : t.switchRoleBtnCustomer || 'Switch to Customer Login'}
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.emailOrPhoneLabel || 'Email Address or Registered Mobile Number'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={
                  selectedRole === 'driver'
                    ? 'suresh.driver@urbandriver.in / 9900122334'
                    : 'ramesh.sharma@example.com / 9845012345'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                {t.passwordLabel || 'Password'}
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="text-[11px] text-brand-teal hover:underline font-semibold"
              >
                {t.forgotPassword || 'Forgot Password?'}
              </button>
            </div>
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

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-brand-teal border-slate-300"
              />
              <span className="text-slate-600">{t.rememberMe || 'Remember this device'}</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-2xl shadow-md shadow-brand-teal/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>
              {selectedRole === 'driver' ? t.signInBtnDriver || 'Sign In as Driver' : t.signInBtnCustomer || 'Sign In as Customer'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link to Signup for the active role */}
        <div className="text-center text-xs text-slate-500 pt-1">
          {t.noAccountPrompt || 'Don’t have an Urban Driver account?'}{' '}
          <Link
            href={`/register?role=${selectedRole}`}
            className="font-bold text-brand-teal hover:underline ml-1"
          >
            {t.createNewAccount || 'Create a New Account'}
          </Link>
        </div>

        {/* 1-Click Role Demonstrator Personas */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            Instant Test Persona Logins ({selectedRole}):
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {DEMO_ACCOUNTS.filter((acc) => {
              if (selectedRole === 'driver') return acc.profile.role === 'driver';
              return acc.profile.role === 'customer' || acc.profile.role === 'family_guardian';
            }).map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handlePersonaLogin(acc)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left transition-all"
              >
                <div className="font-bold text-slate-900 truncate">
                  {acc.profile.name}
                </div>
                <div className="text-[10px] text-brand-teal truncate capitalize">
                  {acc.role.replace('_', ' ')}
                </div>
              </button>
            ))}
          </div>

          {/* Admin Backdoor Login link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                const adminAcc = DEMO_ACCOUNTS.find((a) => a.role === 'admin')!;
                executeLogin(adminAcc.profile);
              }}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline"
            >
              Log in as Platform Safety Administrator (Ananya Sen)
            </button>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              Password Recovery
            </h3>
            {forgotSubmitted ? (
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl">
                  Password reset link and OTP has been dispatched to your registered contact.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSubmitted(false);
                    setForgotPasswordOpen(false);
                  }}
                  className="w-full py-2.5 bg-brand-teal text-white font-bold rounded-xl"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500">
                  Enter your registered email address or mobile number to receive a secure login code.
                </p>
                <input
                  type="text"
                  placeholder="Enter email or mobile..."
                  defaultValue={emailOrPhone}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-teal"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 py-2 bg-slate-100 font-bold rounded-xl text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotSubmitted(true)}
                    className="flex-1 py-2 bg-brand-teal text-white font-bold rounded-xl"
                  >
                    Send OTP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs font-bold text-slate-500">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
