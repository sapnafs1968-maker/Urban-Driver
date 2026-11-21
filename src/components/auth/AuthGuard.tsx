'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { UserRole } from '@/types';
import { ShieldCheck, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const router = useRouter();
  const { currentUser, isAuthLoaded, checkDriverRedirect, language } = useApp();
  const t = getTranslation(language);

  useEffect(() => {
    if (!isAuthLoaded) return;

    // 1. If not authenticated, redirect to login
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    // 2. If role is not allowed, redirect to correct portal
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      if (currentUser.role === 'driver') {
        const dest = checkDriverRedirect(currentUser);
        router.replace(dest);
      } else if (currentUser.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (currentUser.role === 'family_guardian') {
        router.replace('/family/dashboard');
      } else {
        router.replace('/customer/dashboard');
      }
    }
  }, [currentUser, isAuthLoaded, allowedRoles, router, checkDriverRedirect]);

  // Loading state while checking authentication
  if (!isAuthLoaded || !currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-brand-softBlue border border-brand-teal/20 flex items-center justify-center text-brand-teal animate-pulse mb-4 shadow-sm">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">
          {t.verifPending || 'Verifying Session Authorization...'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          {t.securingData || 'Securing your mobility data and validating credentials.'}
        </p>
      </div>
    );
  }

  // If role is mismatched, wait for redirection
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">
          {t.verifPending || 'Redirecting to Authorized Portal...'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          {t.securingData || 'Your account role is restricted to your designated portal.'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
