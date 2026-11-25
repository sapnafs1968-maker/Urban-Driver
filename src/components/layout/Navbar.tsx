'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { speakText } from '@/lib/voice';
import { LanguageSelector } from './LanguageSelector';
import { LogoutConfirmModal } from '@/components/auth/LogoutConfirmModal';
import {
  Car,
  HeartHandshake,
  Bell,
  Volume2,
  Menu,
  X,
  User,
  ShieldCheck,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Home,
  CalendarCheck,
  Star,
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Sliders,
  BarChart3,
  Tag,
  Compass,
} from 'lucide-react';

interface NavLinkItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isPrimary?: boolean;
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    currentUser,
    seniorMode,
    toggleSeniorMode,
    language,
    notifications,
    markNotificationRead,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const t = getTranslation(language);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotifPopoverOpen(false);
  }, [pathname]);

  const handleReadAloud = () => {
    const text = `${t.appName || 'Urban Driver'}. Your car. Your trusted drive. ${
      currentUser ? currentUser.name : 'Welcome to Urban Driver'
    }. ${seniorMode ? t.seniorModeOn : t.seniorModeOff}.`;
    speakText(text, language);
  };

  const getAuthenticatedNavLinks = (): NavLinkItem[] => {
    if (!currentUser) return [];

    if (currentUser.role === 'admin') {
      return [
        { href: '/admin/dashboard', label: t.navOverview || 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/verification', label: t.navVerification || 'Verification', icon: ShieldCheck },
        { href: '/admin/bookings', label: t.myBookings || 'Bookings', icon: CalendarCheck },
        { href: '/admin/pricing', label: t.navPricing || 'Pricing', icon: Tag },
        { href: '/admin/analytics', label: t.navAnalytics || 'Analytics', icon: BarChart3 },
        { href: '/admin/support', label: t.support || 'Support', icon: HelpCircle },
      ];
    }
    if (currentUser.role === 'driver') {
      return [
        { href: '/driver/dashboard', label: t.navDriverHub || 'Dashboard', icon: LayoutDashboard },
        { href: '/driver/trips', label: t.navAssignedTrips || 'My Trips', icon: Compass },
        { href: '/driver/capabilities', label: t.navCapabilities || 'Capabilities', icon: Sliders },
        { href: '/driver/documents', label: t.navDocuments || 'Documents', icon: FileText },
        { href: '/driver/earnings', label: t.navEarnings || 'Earnings', icon: DollarSign },
      ];
    }
    if (currentUser.role === 'family_guardian') {
      return [
        { href: '/family/dashboard', label: t.familyGuardian || 'Dashboard', icon: LayoutDashboard },
        { href: '/family/book', label: t.bookDriver || 'Book a Ride', icon: Car, isPrimary: true },
        { href: '/family/trips', label: t.myBookings || 'Live Trips', icon: CalendarCheck },
        { href: '/family/members', label: t.details || 'Permissions', icon: Users },
        { href: '/family/support', label: t.support || 'Support', icon: HelpCircle },
      ];
    }
    // Customer / Senior Citizen
    return [
      { href: '/customer/dashboard', label: seniorMode ? t.navHome || 'Home' : t.navDashboard || 'Dashboard', icon: Home },
      { href: '/customer/book', label: t.bookDriver || 'Book a Ride', icon: Car, isPrimary: true },
      { href: '/customer/bookings', label: t.myBookings || 'My Bookings', icon: CalendarCheck },
      { href: '/customer/vehicles', label: t.myVehicles || 'My Vehicles', icon: Sliders },
      { href: '/customer/drivers', label: t.findDrivers || 'Find Drivers', icon: Users },
      { href: '/customer/trusted-drivers', label: t.trustedDrivers || 'Trusted Driver Circle', icon: Star },
      { href: '/customer/family', label: t.familyGuardian || 'Family Guardian', icon: ShieldCheck },
    ];
  };

  const publicNavLinks: NavLinkItem[] = [
    { href: '/', label: t.navHome || 'Home', icon: Home },
    { href: '/#how-it-works', label: t.navHowItWorks || 'How It Works', icon: Compass },
    { href: '/#for-customers', label: t.navForCustomers || 'For Customers', icon: Car },
    { href: '/#for-drivers', label: t.navForDrivers || 'For Drivers', icon: ShieldCheck },
    { href: '/#safety', label: t.navSafety || 'Safety & Trust', icon: Star },
  ];

  const navLinks = currentUser ? getAuthenticatedNavLinks() : publicNavLinks;

  const getHelpSupportLink = () => {
    if (!currentUser) return '/#support';
    if (currentUser.role === 'driver') return '/driver/support';
    if (currentUser.role === 'admin') return '/admin/support';
    if (currentUser.role === 'family_guardian') return '/family/support';
    return '/customer/support';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
        {/* TOP ROW: Brand (Left) + Dedicated Utility & Account Cluster (Right) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16 sm:h-[70px]">
            {/* Brand Logo & Motto */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-gradient-to-tr from-brand-tealDark to-brand-teal flex items-center justify-center text-white shadow-md shadow-brand-teal/20 group-hover:scale-[1.03] transition-transform">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-lg font-black tracking-tight text-brand-navy whitespace-nowrap leading-tight">
                  URBAN DRIVER
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:block whitespace-nowrap">
                  Your car. Your trusted drive
                </span>
              </div>
            </Link>

            {/* Right Dedicated Utility & Account Cluster */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Senior Citizen Mode — Dedicated Accessibility Pill (Tablet & Desktop) */}
              {currentUser && currentUser.role === 'customer' && (
                <button
                  type="button"
                  onClick={toggleSeniorMode}
                  aria-pressed={seniorMode}
                  aria-label="Toggle Senior Citizen Mode"
                  className={`hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 border ${
                    seniorMode
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-600/20 hover:bg-emerald-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                  title="Senior Citizen Mode: Enlarged text, high contrast, one-tap booking"
                >
                  <HeartHandshake className={`w-4 h-4 ${seniorMode ? 'text-white' : 'text-emerald-600'}`} />
                  <span className="whitespace-nowrap">{t.seniorMode || 'Senior Mode'}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      seniorMode
                        ? 'bg-white text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {seniorMode ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              {/* Language Selection — Dedicated Globe Control (Tablet & Desktop) */}
              <div className="hidden md:block">
                <LanguageSelector variant="navbar" />
              </div>

              {currentUser ? (
                <>
                  {/* Read Aloud (Tablet & Desktop) */}
                  <button
                    type="button"
                    onClick={handleReadAloud}
                    className="hidden md:inline-flex p-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-brand-navy rounded-full border border-slate-200 transition-all active:scale-95"
                    title={t.readAloud || 'Read Screen Aloud'}
                  >
                    <Volume2 className="w-4 h-4 text-brand-teal" />
                  </button>

                  {/* Notifications */}
                  <div className="relative" ref={notifRef}>
                    <button
                      type="button"
                      onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
                      className="p-2.5 sm:p-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-brand-navy rounded-full border border-slate-200 transition-all active:scale-95 relative min-w-[40px] min-h-[40px] flex items-center justify-center"
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {notifPopoverOpen && (
                      <div className="fixed inset-x-3 top-16 sm:inset-auto sm:absolute sm:right-0 sm:top-auto sm:mt-2 sm:w-96 max-h-[75dvh] overflow-y-auto bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <span className="font-bold text-sm text-slate-900">
                            {t.navNotifications || 'Notifications'} ({unreadCount})
                          </span>
                          <button
                            onClick={() => setNotifPopoverOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                          >
                            {t.close || 'Close'}
                          </button>
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                          {notifications.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center">
                              {t.noNotifications || 'No notifications'}
                            </p>
                          ) : (
                            notifications.slice(0, 5).map((n) => (
                              <div
                                key={n.id}
                                onClick={() => markNotificationRead(n.id)}
                                className={`py-2.5 px-1.5 text-xs cursor-pointer hover:bg-slate-50 rounded-xl transition-colors ${
                                  n.isRead ? 'opacity-60' : 'font-semibold text-slate-900'
                                }`}
                              >
                                <div className="flex items-center justify-between text-brand-teal">
                                  <span>{n.title}</span>
                                  <span className="text-[10px] text-slate-400">Recent</span>
                                </div>
                                <p className="text-slate-600 mt-0.5">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Avatar & Dropdown (Tablet & Desktop) */}
                  <div className="relative hidden md:block" ref={profileRef}>
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-slate-100 transition-all border border-slate-200/80 bg-white active:scale-95"
                      aria-haspopup="true"
                      aria-expanded={profileDropdownOpen}
                      title="User Menu & Settings"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-softBlue border border-brand-teal/20 overflow-hidden flex items-center justify-center text-xs font-bold text-brand-navy">
                        {currentUser.avatarUrl ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-brand-teal" />
                        )}
                      </div>
                      <div className="hidden lg:flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                          {currentUser.name}
                        </span>
                        <span className="text-[10px] text-brand-teal uppercase font-semibold">
                          {currentUser.role.replace('_', ' ')}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 max-h-[75dvh] overflow-y-auto bg-white border border-slate-200 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-4 py-3 bg-slate-50 rounded-2xl mb-1 border border-slate-100">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                          <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-brand-softBlue text-brand-teal px-2 py-0.5 rounded-full border border-brand-teal/20">
                            {currentUser.role.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="space-y-0.5 text-xs font-semibold text-slate-700">
                          <Link
                            href="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-500" />
                            <span>{t.navProfile || 'Profile'}</span>
                          </Link>
                          <Link
                            href="/profile?tab=settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-500" />
                            <span>{t.tabPreferences || 'Settings'}</span>
                          </Link>
                          <Link
                            href={getHelpSupportLink()}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <HelpCircle className="w-4 h-4 text-slate-500" />
                            <span>{t.support || 'Help & Support'}</span>
                          </Link>
                        </div>

                        <div className="my-1.5 border-t border-slate-100" />

                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setLogoutModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>{t.navLogout || 'Sign Out'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-brand-navy hover:bg-slate-100 rounded-full transition-all active:scale-95"
                  >
                    {t.navLogin || 'Sign In'}
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-xs font-bold text-white bg-brand-teal hover:bg-brand-tealDark active:scale-95 rounded-full shadow-sm shadow-brand-teal/25 transition-all flex items-center gap-1.5"
                  >
                    <span>{t.navRegister || 'Get Started'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-slate-700 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* DEDICATED SECONDARY NAVIGATION ROW (Tablet & Desktop: zero overlap with Utility/Accessibility cluster!) */}
        <div className="hidden md:block border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Primary Navigation"
              className="flex items-center gap-1.5 py-2 overflow-x-auto"
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                if (link.isPrimary) {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-sm ${
                        isActive
                          ? 'bg-brand-navy text-white ring-2 ring-brand-teal/40'
                          : 'bg-brand-teal hover:bg-brand-tealDark text-white shadow-brand-teal/20'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{link.label}</span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-white text-brand-teal font-bold shadow-xs border border-brand-teal/30'
                        : 'text-slate-600 hover:text-brand-navy hover:bg-white/90 hover:shadow-xs border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-teal' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* MOBILE NAVIGATION DRAWER (320px - 767px) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-4 max-h-[calc(100dvh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            {/* Dedicated Accessibility & Language Section */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Accessibility & Language
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <LanguageSelector variant="compact" />

                {currentUser && (
                  <button
                    type="button"
                    onClick={handleReadAloud}
                    className="min-h-[40px] px-3 py-1.5 bg-white text-slate-800 rounded-full border border-slate-200 text-xs font-bold flex items-center gap-1.5 active:scale-95"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-brand-teal" />
                    <span>{t.readAloud || 'Read Aloud'}</span>
                  </button>
                )}
              </div>

              {currentUser && currentUser.role === 'customer' && (
                <button
                  type="button"
                  onClick={() => {
                    toggleSeniorMode();
                    setMobileMenuOpen(false);
                  }}
                  aria-pressed={seniorMode}
                  className={`w-full min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                    seniorMode
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-white text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HeartHandshake className={`w-4 h-4 ${seniorMode ? 'text-white' : 'text-emerald-600'}`} />
                    <span>{t.seniorMode || 'Senior Citizen Mode'}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      seniorMode ? 'bg-white text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {seniorMode ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}
            </div>

            {/* Role-Based Navigation Links */}
            <div className="space-y-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 min-h-[44px] rounded-xl text-sm font-semibold transition-all active:scale-98 ${
                      link.isPrimary
                        ? 'bg-brand-teal text-white font-bold shadow-sm'
                        : isActive
                        ? 'bg-brand-softBlue text-brand-teal font-bold border border-brand-teal/20'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-brand-navy'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Account / Auth Block */}
            {currentUser ? (
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-brand-softBlue border border-brand-teal/20 overflow-hidden flex items-center justify-center font-bold text-brand-navy shrink-0">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-brand-teal" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-brand-teal font-semibold uppercase">
                      {currentUser.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-800"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{t.navProfile || 'Profile'}</span>
                  </Link>
                  <Link
                    href="/profile?tab=settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-center gap-1.5 p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-800"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{t.tabPreferences || 'Settings'}</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLogoutModalOpen(true);
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 p-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.navLogout || 'Sign Out'}</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-[44px] flex items-center justify-center text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  {t.navLogin || 'Sign In'}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-[44px] flex items-center justify-center text-sm font-bold text-white bg-brand-teal rounded-xl hover:bg-brand-tealDark shadow-sm transition-colors"
                >
                  {t.navRegister || 'Get Started'}
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </>
  );
};
