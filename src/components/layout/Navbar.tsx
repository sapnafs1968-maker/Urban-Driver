'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
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

  // Close dropdowns when clicking outside
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotifPopoverOpen(false);
  }, [pathname]);

  const handleReadAloud = () => {
    const text = `${t.appName || 'Urban Driver'}. ${t.tagline || 'Your Car. Your Trusted Driver. Your Family’s Peace of Mind.'}. ${currentUser ? currentUser.name : 'Welcome to Urban Driver'
      }. ${seniorMode ? t.seniorModeOn : t.seniorModeOff}.`;
    speakText(text, language);
  };

  // Authenticated Role-Specific Nav Links
  const getAuthenticatedNavLinks = () => {
    if (!currentUser) return [];

    if (currentUser.role === 'admin') {
      return [
        { href: '/admin/dashboard', label: t.navOverview || 'Overview' },
        { href: '/admin/verification', label: t.navVerification || 'Driver Verification' },
        { href: '/admin/bookings', label: t.myBookings || 'Bookings & Trips' },
        { href: '/admin/pricing', label: t.navPricing || 'Pricing' },
        { href: '/admin/analytics', label: t.navAnalytics || 'Pilot Analytics' },
        { href: '/admin/support', label: t.support || 'Support' },
      ];
    }
    if (currentUser.role === 'driver') {
      return [
        { href: '/driver/dashboard', label: t.navDriverHub || 'Driver Hub' },
        { href: '/driver/trips', label: t.navAssignedTrips || 'Assigned Trips' },
        { href: '/driver/capabilities', label: t.navCapabilities || 'Capabilities' },
        { href: '/driver/documents', label: t.navDocuments || 'My Documents' },
        { href: '/driver/earnings', label: t.navEarnings || 'Earnings' },
      ];
    }
    if (currentUser.role === 'family_guardian') {
      return [
        { href: '/family/dashboard', label: t.familyGuardian || 'Guardian Hub' },
        { href: '/family/book', label: t.bookDriver || 'Book for Parent' },
        { href: '/family/trips', label: t.myBookings || 'Live Trips' },
        { href: '/family/members', label: t.details || 'Permissions' },
        { href: '/family/support', label: t.support || 'Support' },
      ];
    }
    // Default Customer Links
    return [
      { href: '/customer/dashboard', label: seniorMode ? t.navHome || 'Home' : t.navDashboard || 'Dashboard' },
      { href: '/customer/book', label: t.bookDriver || 'Book Driver' },
      { href: '/customer/vehicles', label: t.myVehicles || 'My Vehicles' },
      { href: '/customer/drivers', label: t.findDrivers || 'Find Drivers' },
      { href: '/customer/trusted-drivers', label: t.trustedDrivers || 'Trusted Circle' },
      { href: '/customer/family', label: t.familyGuardian || 'Family Guardian' },
    ];
  };

  // Public Visitor Nav Links (Logged Out)
  const publicNavLinks = [
    { href: '/', label: t.navHome || 'Home' },
    { href: '/#how-it-works', label: t.navHowItWorks || 'How It Works' },
    { href: '/#for-customers', label: t.navForCustomers || 'For Customers' },
    { href: '/#for-drivers', label: t.navForDrivers || 'For Drivers' },
    { href: '/#safety', label: t.navSafety || 'Safety & Trust' },
    { href: '/#about', label: t.navAbout || 'About Us' },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* Left: Brand Logo & Typography */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-tealDark to-brand-teal flex items-center justify-center text-white shadow-md shadow-brand-teal/20 group-hover:scale-[1.03] transition-transform">
                  <Car className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg font-black tracking-tight text-brand-navy flex items-center gap-1.5">
                    URBAN DRIVER
                    <span className="text-[10px] bg-brand-softBlue text-brand-teal font-bold px-2 py-0.5 rounded-full border border-brand-teal/20 tracking-wider">
                      {t.pilotTag || 'PILOT'}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block truncate max-w-[220px]">
                    {t.tagline ? t.tagline.split('.')[0] : 'Your Car. Your Trusted Driver'}.
                  </span>
                </div>
              </Link>
            </div>

            {/* Centre: Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-2 rounded-full transition-all duration-200 ${isActive
                      ? 'bg-slate-100 text-brand-teal font-bold shadow-xs'
                      : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions Center */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Senior Mode Toggle (Available for Customers/Seniors) */}
              {currentUser && currentUser.role === 'customer' && (
                <button
                  onClick={toggleSeniorMode}
                  aria-label="Toggle Senior Citizen Mode"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${seniorMode
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-400/40'
                    : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  title="Senior Citizen Mode: Enlarged text, high contrast, simplified booking"
                >
                  <HeartHandshake className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">
                    {seniorMode ? t.seniorModeOn || 'Senior Mode ON' : t.seniorMode || 'Senior Mode'}
                  </span>
                </button>
              )}

              {/* Multilingual Selector */}
              <LanguageSelector variant="navbar" />

              {/* Authenticated Controls */}
              {currentUser ? (
                <>
                  {/* Read Screen Aloud Button */}
                  <button
                    onClick={handleReadAloud}
                    className="p-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-brand-navy rounded-full border border-slate-200 transition-colors"
                    title={t.readAloud || 'Read Screen Aloud'}
                  >
                    <Volume2 className="w-4 h-4 text-brand-teal" />
                  </button>

                  {/* Notification Bell with Dropdown */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
                      className="p-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-brand-navy rounded-full border border-slate-200 transition-colors relative"
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-xs">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Popover Dropdown */}
                    {notifPopoverOpen && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <span className="font-bold text-sm text-slate-900">
                            {t.navNotifications || 'Notifications'} ({unreadCount})
                          </span>
                          <button
                            onClick={() => setNotifPopoverOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs"
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
                                className={`py-2.5 px-1.5 text-xs cursor-pointer hover:bg-slate-50 rounded-xl transition-colors ${n.isRead ? 'opacity-60' : 'font-semibold text-slate-900'
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

                  {/* Profile Avatar & Dropdown */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                      aria-haspopup="true"
                      aria-expanded={profileDropdownOpen}
                      title="User Menu & Settings"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-softBlue border border-brand-teal/20 overflow-hidden flex items-center justify-center text-xs font-bold text-brand-navy shadow-inner">
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
                      <div className="hidden sm:flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                          {currentUser.name}
                        </span>
                        <span className="text-[10px] text-brand-teal uppercase font-semibold">
                          {currentUser.role.replace('_', ' ')}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                        {/* User Identity Header */}
                        <div className="px-4 py-3 bg-slate-50 rounded-2xl mb-1 border border-slate-100">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                          <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-brand-softBlue text-brand-teal px-2 py-0.5 rounded-full border border-brand-teal/20">
                            {currentUser.role.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Navigation Items */}
                        <div className="space-y-0.5 text-xs font-semibold text-slate-700">
                          <Link
                            href="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-500" />
                            <span>{t.navProfile || 'Profile Settings'}</span>
                          </Link>
                          <Link
                            href="/profile?tab=settings"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <Settings className="w-4 h-4 text-slate-500" />
                            <span>{t.tabPreferences || 'Account Settings'}</span>
                          </Link>
                          <Link
                            href="/profile?tab=notifications"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <Bell className="w-4 h-4 text-slate-500" />
                            <span>{t.navNotifications || 'Notifications'}</span>
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

                        {/* Visual Divider */}
                        <div className="my-1.5 border-t border-slate-100" />

                        {/* Distinguishable Logout Button */}
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
                /* Unauthenticated / Visitor Actions */
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-brand-navy hover:bg-slate-100 rounded-full transition-all"
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
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* Nav Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand-navy transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Authenticated or Guest Block */}
            {currentUser ? (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-brand-softBlue border border-brand-teal/20 overflow-hidden flex items-center justify-center font-bold text-brand-navy">
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
                  <div>
                    <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-brand-teal font-semibold uppercase">
                      {currentUser.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-slate-100 rounded-xl text-slate-700 text-center"
                  >
                    {t.navProfile || 'My Profile'}
                  </Link>
                  <Link
                    href="/profile?tab=settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-slate-100 rounded-xl text-slate-700 text-center"
                  >
                    {t.tabPreferences || 'Settings'}
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLogoutModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.navLogout || 'Logout'}</span>
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  {t.navLogin || 'Login'}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-bold text-white bg-brand-teal rounded-xl hover:bg-brand-tealDark shadow-sm transition-colors"
                >
                  {t.navRegister || 'Get Started'}
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </>
  );
};
