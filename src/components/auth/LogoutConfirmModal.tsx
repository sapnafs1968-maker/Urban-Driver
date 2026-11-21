'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { LogOut, ShieldCheck, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { logout, currentUser, language } = useApp();
  const t = getTranslation(language);

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    // 1. Invalidate active session & clear user state
    logout();
    onClose();
    // 2. Redirect to public Urban Driver homepage
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
            <LogOut className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            aria-label={t.close || 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4 space-y-3">
          <h3 id="logout-dialog-title" className="text-xl font-bold text-slate-900 tracking-tight">
            {t.logoutDialogTitle || 'Sign out of Urban Driver?'}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t.logoutDialogDesc || 'You are currently signed in as'}{' '}
            <span className="font-semibold text-slate-900">{currentUser?.name || 'User'}</span> (
            <span className="capitalize">{currentUser?.role.replace('_', ' ')}</span>).
          </p>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              {t.logoutSafeNote ||
                'Your data is safe. Your registered vehicles, trip history, and driver credentials remain intact. You can sign in anytime with your credentials to resume.'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-full border border-slate-200 transition-all"
          >
            {t.logoutCancelBtn || t.cancel || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-full shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logoutConfirmBtn || 'Yes, Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
