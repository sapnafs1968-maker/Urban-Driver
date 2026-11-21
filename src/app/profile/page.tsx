'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getTranslation, LanguageCode, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { LogoutConfirmModal } from '@/components/auth/LogoutConfirmModal';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Car,
  FileCheck2,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Globe,
  Sliders,
} from 'lucide-react';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const {
    currentUser,
    setCurrentUser,
    seniorMode,
    toggleSeniorMode,
    language,
    setLanguage,
    drivers,
    vehicles,
    bookings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'notifications' | 'support'>(
    initialTab === 'settings' || initialTab === 'notifications' || initialTab === 'support'
      ? initialTab
      : 'overview'
  );

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Bengaluru');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Notification toggles
  const [notifSms, setNotifSms] = useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifArrivalAlerts, setNotifArrivalAlerts] = useState(true);

  if (!currentUser) return null;

  const t = getTranslation(language);

  // Driver-specific verification info if role is driver
  const currentDriver = currentUser.role === 'driver'
    ? drivers.find((d) => d.userId === currentUser.id || d.email.toLowerCase() === currentUser.email.toLowerCase())
    : null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        name: name.trim() || currentUser.name,
        phone: phone.trim() || currentUser.phone,
        city: city.trim() || currentUser.city,
      });
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const getVerificationBadge = () => {
    if (currentUser.role === 'driver') {
      const status = currentDriver?.verificationStatus || 'pending_review';
      if (status === 'verified') {
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Professional Driver
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <FileCheck2 className="w-4 h-4 text-amber-600" />
          Verification: {status.replace('_', ' ').toUpperCase()}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <ShieldCheck className="w-4 h-4 text-blue-600" />
        Verified Account
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Profile Identity Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar Photo */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-brand-softBlue border-2 border-brand-teal/30 overflow-hidden shadow-md flex items-center justify-center">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-brand-teal" />
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
                {currentUser.name}
              </h1>
              {getVerificationBadge()}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-1.5 text-xs sm:text-sm text-slate-600 font-medium pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                {currentUser.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                {currentUser.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {currentUser.city || 'Bengaluru'}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                Account Role: {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Logout Action Button */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="px-5 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-200 flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.navLogout || 'Log Out'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t.tabPersonalInfo || 'Profile Overview'}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t.tabPreferences || 'Account Settings'}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t.navNotifications || 'Notification Preferences'}
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'support'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t.support || 'Help & Support'}
          </button>
        </div>
      </div>

      {/* Tab 1: Profile Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
                <User className="w-5 h-5 text-brand-teal" />
                {t.tabPersonalInfo || 'Personal Details'}
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-brand-teal hover:underline"
              >
                {isEditing ? (t.cancel || 'Cancel Edit') : (t.edit || 'Edit Profile')}
              </button>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.saveChanges || 'Profile details saved successfully!'}</span>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.fullNameLabel || 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.phoneLabel || 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-teal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.cityLabel || 'City of Residence'}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-teal focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-full"
                  >
                    {t.cancel || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-brand-teal hover:bg-brand-tealDark rounded-full shadow-sm"
                  >
                    {t.saveChanges || 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">{t.fullNameLabel || 'Full Name'}</span>
                  <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                    {currentUser.name}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">{t.emailLabel || 'Email Address'}</span>
                  <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                    {currentUser.email}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">{t.phoneLabel || 'Registered Phone'}</span>
                  <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                    {currentUser.phone}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block font-medium">{t.cityLabel || 'City & Operating Hub'}</span>
                  <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                    {currentUser.city || 'Bengaluru'}
                  </span>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                {t.emergencyHelp || 'Emergency & Family Contact'}
              </h3>
              <div className="p-3.5 bg-brand-softBlue/60 rounded-2xl border border-brand-teal/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-navy">
                    {currentUser.emergencyContact?.name || 'Rohan Sharma (Son)'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {currentUser.emergencyContact?.relationship || 'Family Guardian'} •{' '}
                    {currentUser.emergencyContact?.phone || '+91 98450 12345'}
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-white text-brand-teal px-2.5 py-1 rounded-full border border-brand-teal/20">
                  {t.notifications || 'SMS Alerts Enabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Side Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-brand-navy flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-brand-teal" />
              {t.status || 'Account Status'}
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-600 font-medium">{t.selectAccountType || 'Account Type'}</span>
                <span className="font-bold text-brand-navy capitalize">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <span className="text-slate-600 font-medium">{t.selectLanguageLabel || 'Preferred Language'}</span>
                <span className="font-bold text-brand-teal uppercase">{language}</span>
              </div>
              {currentUser.role === 'customer' && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-600 font-medium">{t.seniorMode || 'Senior Citizen Mode'}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      seniorMode
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {seniorMode ? t.statusStarted || 'Active' : t.seniorModeOff || 'Disabled'}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Link
                href={
                  currentUser.role === 'driver'
                    ? '/driver/dashboard'
                    : currentUser.role === 'admin'
                    ? '/admin/dashboard'
                    : currentUser.role === 'family_guardian'
                    ? '/family/dashboard'
                    : '/customer/dashboard'
                }
                className="w-full py-3 bg-brand-navy hover:bg-brand-navyLight text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>{t.navDashboard || 'Go to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Account Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2 pb-3 border-b border-slate-100">
            <Settings className="w-5 h-5 text-brand-teal" />
            Account & Preference Settings
          </h2>

          <div className="divide-y divide-slate-100 space-y-4">
            {/* Senior Citizen Mode Toggle */}
            <div className="pt-4 flex items-center justify-between">
              <div className="max-w-md">
                <h3 className="text-sm font-bold text-slate-900">Senior Citizen Accessibility Mode</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enlarges buttons (54px+), boosts typography contrast, and prioritizes voice reading
                  and direct WhatsApp/phone booking assistance.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleSeniorMode}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  seniorMode ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    seniorMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Language Preference */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Default Interface Language</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Available in 11 Indian regional languages with native typography support.
                </p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.englishName})
                  </option>
                ))}
              </select>
            </div>

            {/* Session & Security */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Security & Active Session</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Terminate the current session across this browser. Your saved data remains safe.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLogoutModalOpen(true)}
                className="px-5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-brand-teal" />
            Communication & Notification Preferences
          </h2>

          <div className="divide-y divide-slate-100 space-y-4">
            <div className="pt-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">WhatsApp Trip Updates</h3>
                <p className="text-xs text-slate-500">
                  Receive driver arrival details, live trip links, and verification PIN via WhatsApp.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifWhatsapp}
                onChange={(e) => setNotifWhatsapp(e.target.checked)}
                className="w-5 h-5 text-brand-teal rounded-md border-slate-300 focus:ring-brand-teal"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">SMS Alerts</h3>
                <p className="text-xs text-slate-500">
                  Essential departure and arrival confirmation SMS for family members.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifSms}
                onChange={(e) => setNotifSms(e.target.checked)}
                className="w-5 h-5 text-brand-teal rounded-md border-slate-300 focus:ring-brand-teal"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Emergency & Delay Escalations</h3>
                <p className="text-xs text-slate-500">
                  Notify designated Family Guardians if an arrival confirmation is delayed past 20
                  minutes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifArrivalAlerts}
                onChange={(e) => setNotifArrivalAlerts(e.target.checked)}
                className="w-5 h-5 text-brand-teal rounded-md border-slate-300 focus:ring-brand-teal"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Trip Summary & Invoices</h3>
                <p className="text-xs text-slate-500">
                  Email statement with recurring hospital and office journey summaries.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="w-5 h-5 text-brand-teal rounded-md border-slate-300 focus:ring-brand-teal"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Help & Support */}
      {activeTab === 'support' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2 pb-3 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-brand-teal" />
            Urban Driver Help & Support
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Direct Support Ticket</h3>
              <p className="text-xs text-slate-600">
                Raise an issue or request assistance regarding vehicle matching, billing, or driver
                behaviour.
              </p>
              <Link
                href={
                  currentUser.role === 'driver'
                    ? '/driver/documents'
                    : currentUser.role === 'admin'
                    ? '/admin/support'
                    : '/customer/support'
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-teal hover:underline pt-1"
              >
                <span>Open Support Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h3 className="text-sm font-bold text-slate-900">24x7 Emergency Helpline</h3>
              <p className="text-xs text-slate-600">
                Live telephone support for active journeys, medical transport escalations, and
                emergency coordination.
              </p>
              <a
                href="tel:18005550199"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline pt-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 1800 555 0199 (Toll Free)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-teal" />
        </div>
      }
    >
      <AuthGuard>
        <ProfileContent />
      </AuthGuard>
    </Suspense>
  );
}
