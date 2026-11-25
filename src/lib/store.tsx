'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Vehicle,
  Driver,
  Booking,
  FamilyRelationship,
  SupportTicket,
  IncidentReport,
  AssistedBookingRequest,
  InstitutionalLead,
  AppNotification,
  RecurringSchedule,
  BookingStatus,
  VerificationStatus,
  SupportTicketStatus,
  DriverPayout,
  DriverVehicle,
  PayoutStatus,
  SavedDestination,
  TrustedDriver,
} from '@/types';
import {
  DEMO_ACCOUNTS,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_BOOKINGS,
  INITIAL_FAMILY_RELATIONSHIPS,
  INITIAL_TICKETS,
  INITIAL_INCIDENTS,
  INITIAL_ASSISTED_REQUESTS,
  INITIAL_INSTITUTIONAL_LEADS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECURRING_SCHEDULES,
  INITIAL_DRIVER_PAYOUTS,
  INITIAL_SAVED_DESTINATIONS,
  INITIAL_TRUSTED_DRIVERS,
} from './demo-data';
import { LanguageCode } from './i18n';

interface PricingConfig {
  baseHourlyRate: number;
  minHours: number;
  platformServiceFeePct: number;
  nightSurchargePct: number;
  cancellationFee: number;
}

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  switchDemoRole: (roleKey: string) => void;
  seniorMode: boolean;
  setSeniorMode: (enabled: boolean) => void;
  toggleSeniorMode: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Vehicle;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  drivers: Driver[];
  updateDriverVerification: (
    driverId: string,
    status: VerificationStatus,
    notes?: string
  ) => void;
  saveDriverOnboardingDraft: (
    driverId: string,
    updates: Partial<Driver>,
    step?: number
  ) => Driver;
  submitDriverOnboarding: (driverId: string) => void;
  updateDriverCapabilities: (
    driverId: string,
    updates: Partial<Driver>
  ) => void;
  adminReviewDriver: (
    driverId: string,
    decision: 'approve' | 'reject' | 'request_changes',
    notes?: string,
    reason?: string
  ) => void;
  adminApproveDemoDriver: (driverId: string, notes?: string) => void;
  recordDriverLicenceVerification: (driverId: string, result: any) => void;
  checkDriverRedirect: (user: UserProfile) => string;
  toggleDriverAvailability: (driverId: string) => void;
  trustedDriverIds: string[];
  trustedDrivers: TrustedDriver[];
  toggleTrustedDriver: (driverId: string) => void;
  setTrustedDriverRole: (driverId: string, role: 'primary' | 'backup') => Promise<void>;
  removeTrustedDriver: (driverId: string) => Promise<void>;
  driverPayouts: DriverPayout[];
  updatePayoutStatus: (
    payoutId: string,
    payoutStatus: PayoutStatus,
    paymentReference?: string
  ) => Promise<void>;
  registerDriverVehicle: (
    driverId: string,
    vehicle: Omit<DriverVehicle, 'id' | 'driverId' | 'verificationStatus'>
  ) => Promise<DriverVehicle | null>;
  savedDestinations: SavedDestination[];
  addSavedDestination: (
    dest: Omit<SavedDestination, 'id' | 'customerId'>
  ) => Promise<SavedDestination | null>;
  updateSavedDestination: (
    id: string,
    updates: Partial<SavedDestination>
  ) => Promise<SavedDestination | null>;
  deleteSavedDestination: (id: string) => Promise<boolean>;
  refreshBackendData: () => Promise<void>;
  bookings: Booking[];
  createBooking: (
    newBooking: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'updatedAt' | 'statusHistory'>
  ) => Booking;
  createBookingAsync: (payload: {
    clientRequestId?: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    bookedByGuardianId?: string;
    bookedByGuardianName?: string;
    requestedDriverId?: string;
    vehicleId: string;
    vehicleDetails: Booking['vehicleDetails'];
    pickupAddress: string;
    destinationAddress: string;
    pickupLat?: number;
    pickupLng?: number;
    destLat?: number;
    destLng?: number;
    pickupDate: string;
    pickupTime: string;
    expectedDurationHours: number;
    isRecurring?: boolean;
    recurringTitle?: string;
    paymentMethod: Booking['paymentMethod'];
    specialInstructions?: string;
  }) => Promise<{
    ok: boolean;
    booking?: Booking;
    driver?: Driver;
    error?: string;
    code?: string;
    alternativeDrivers?: Driver[];
  }>;
  updateBookingStatus: (bookingId: string, status: BookingStatus, note?: string) => void;
  confirmArrival: (bookingId: string) => void;
  triggerDelayException: (bookingId: string, reason?: string) => void;
  familyRelationships: FamilyRelationship[];
  updateFamilyPermissions: (
    relationshipId: string,
    permissions: FamilyRelationship['permissions']
  ) => void;
  revokeFamilyRelationship: (relationshipId: string) => void;
  supportTickets: SupportTicket[];
  createSupportTicket: (
    ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'messages' | 'createdAt' | 'updatedAt'>,
    initialMessage: string
  ) => SupportTicket;
  addTicketMessage: (ticketId: string, message: string, isAdmin?: boolean) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicketStatus) => void;
  incidentReports: IncidentReport[];
  assistedRequests: AssistedBookingRequest[];
  createAssistedRequest: (
    req: Omit<AssistedBookingRequest, 'id' | 'status' | 'createdAt'>
  ) => void;
  convertAssistedRequest: (requestId: string, bookingData: any) => void;
  institutionalLeads: InstitutionalLead[];
  createInstitutionalLead: (lead: Omit<InstitutionalLead, 'id' | 'createdAt'>) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  rateDriver: (
    bookingId: string,
    driverId: string,
    rating: number,
    feedback: string
  ) => void;
  pricingConfig: PricingConfig;
  updatePricingConfig: (config: Partial<PricingConfig>) => void;
  recurringSchedules: RecurringSchedule[];
  addRecurringSchedule: (schedule: Omit<RecurringSchedule, 'id'>) => RecurringSchedule;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'urban_driver_app_state_v1';
const AUTH_USER_KEY = 'urban_driver_auth_user_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);
  const [seniorMode, setSeniorMode] = useState<boolean>(false);
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [trustedDrivers, setTrustedDrivers] = useState<TrustedDriver[]>(INITIAL_TRUSTED_DRIVERS);
  const [trustedDriverIds, setTrustedDriverIds] = useState<string[]>(['drv_suresh', 'drv_rajesh']);
  const [driverPayouts, setDriverPayouts] = useState<DriverPayout[]>(INITIAL_DRIVER_PAYOUTS);
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>(INITIAL_SAVED_DESTINATIONS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [familyRelationships, setFamilyRelationships] = useState<FamilyRelationship[]>(
    INITIAL_FAMILY_RELATIONSHIPS
  );
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [assistedRequests, setAssistedRequests] = useState<AssistedBookingRequest[]>(
    INITIAL_ASSISTED_REQUESTS
  );
  const [institutionalLeads, setInstitutionalLeads] = useState<InstitutionalLead[]>(
    INITIAL_INSTITUTIONAL_LEADS
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [recurringSchedules, setRecurringSchedules] = useState<RecurringSchedule[]>(
    INITIAL_RECURRING_SCHEDULES
  );
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    baseHourlyRate: 150,
    minHours: 3,
    platformServiceFeePct: 12,
    nightSurchargePct: 20,
    cancellationFee: 100,
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    }
    saveToLocal({ language: lang });
  };

  // Load from LocalStorage if present
  useEffect(() => {
    try {
      // 1. Load active user auth session
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      if (savedUser) {
        const user = JSON.parse(savedUser) as UserProfile;
        setCurrentUser(user);
        if (user.seniorModeEnabled !== undefined) {
          setSeniorMode(user.seniorModeEnabled);
        }
      }

      // 2. Load persistent application data (vehicles, bookings, etc.)
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.seniorMode === 'boolean') {
          setSeniorMode(parsed.seniorMode);
        } else if (savedUser) {
          const u = JSON.parse(savedUser) as UserProfile;
          if (parsed.seniorModePrefs && typeof parsed.seniorModePrefs[u.id] === 'boolean') {
            setSeniorMode(parsed.seniorModePrefs[u.id]);
          }
        }
        if (parsed.vehicles) setVehicles(parsed.vehicles);
        if (parsed.drivers) setDrivers(parsed.drivers);
        if (parsed.bookings) setBookings(parsed.bookings);
        if (parsed.trustedDriverIds) setTrustedDriverIds(parsed.trustedDriverIds);
        if (parsed.familyRelationships) setFamilyRelationships(parsed.familyRelationships);
        if (parsed.supportTickets) setSupportTickets(parsed.supportTickets);
        if (parsed.incidentReports) setIncidentReports(parsed.incidentReports);
        if (parsed.assistedRequests) setAssistedRequests(parsed.assistedRequests);
        if (parsed.institutionalLeads) setInstitutionalLeads(parsed.institutionalLeads);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.pricingConfig) setPricingConfig(parsed.pricingConfig);
        if (parsed.recurringSchedules) setRecurringSchedules(parsed.recurringSchedules);
        if (parsed.language) {
          setLanguageState(parsed.language);
          if (typeof document !== 'undefined') {
            document.documentElement.lang = parsed.language;
            document.documentElement.dir = parsed.language === 'ur' ? 'rtl' : 'ltr';
          }
        }
      }
    } catch (e) {
      console.warn('Error loading local state:', e);
    } finally {
      setIsAuthLoaded(true);
    }
  }, []);

  // Sync live state from backend APIs
  const refreshBackendData = async () => {
    try {
      const [drvRes, bkRes, payRes, tdRes, destRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/bookings'),
        fetch('/api/payouts'),
        fetch('/api/trusted-drivers'),
        fetch('/api/saved-destinations'),
      ]);

      if (drvRes.ok) {
        const drvJson = await drvRes.json();
        if (Array.isArray(drvJson.data)) setDrivers(drvJson.data);
      }
      if (bkRes.ok) {
        const bkJson = await bkRes.json();
        if (Array.isArray(bkJson.data)) setBookings(bkJson.data);
      }
      if (payRes.ok) {
        const payJson = await payRes.json();
        if (Array.isArray(payJson.data)) setDriverPayouts(payJson.data);
      }
      if (tdRes.ok) {
        const tdJson = await tdRes.json();
        if (Array.isArray(tdJson.data)) {
          const list: TrustedDriver[] = tdJson.data.map((item: any) => ({
            id: item.id,
            customerId: item.customerId,
            driverId: item.driverId,
            completedTripsCount: item.completedTripsCount,
            isPrimary: item.isPrimary,
            isBackup: item.isBackup,
            trustedStatus: item.trustedStatus,
            addedAt: item.addedAt,
            lastTripAt: item.lastTripAt,
          }));
          setTrustedDrivers(list);
          const customerId = currentUser?.id;
          const ids = list
            .filter((td) => td.trustedStatus === 'active' && (!customerId || td.customerId === customerId))
            .map((td) => td.driverId);
          setTrustedDriverIds(ids);
        }
      }
      if (destRes.ok) {
        const destJson = await destRes.json();
        if (Array.isArray(destJson.data)) setSavedDestinations(destJson.data);
      }
    } catch (err) {
      console.warn('Backend sync skipped/offline:', err);
    }
  };

  useEffect(() => {
    refreshBackendData();
    const interval = setInterval(refreshBackendData, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Save changes to LocalStorage
  const saveToLocal = (updatedData: Record<string, any>) => {
    try {
      const current = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : {};
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...parsed, ...updatedData }));
    } catch (e) {
      console.warn('Error persisting to local storage:', e);
    }
  };

  const login = (user: UserProfile) => {
    // Check if user has a persisted seniorMode preference from prior sessions
    let resolvedSeniorMode = user.seniorModeEnabled ?? false;
    try {
      const current = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : {};
      if (parsed.seniorModePrefs && typeof parsed.seniorModePrefs[user.id] === 'boolean') {
        resolvedSeniorMode = parsed.seniorModePrefs[user.id];
      }
    } catch {}

    const syncedUser = { ...user, seniorModeEnabled: resolvedSeniorMode };
    setCurrentUser(syncedUser);
    setSeniorMode(resolvedSeniorMode);

    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(syncedUser));
      saveToLocal({ seniorMode: resolvedSeniorMode });
    } catch (e) {
      console.warn('Error saving user session:', e);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.warn('Error clearing user session:', e);
    }
  };

  const handleSetCurrentUser = (user: UserProfile | null) => {
    if (user) {
      login(user);
    } else {
      logout();
    }
  };

  const switchDemoRole = (roleKey: string) => {
    const found = DEMO_ACCOUNTS.find((acc) => acc.role === roleKey);
    if (found) {
      login(found.profile);
      if (found.role === 'customer_senior') {
        setSeniorMode(true);
        setLanguage('hi');
      } else {
        setSeniorMode(false);
        setLanguage('en');
      }
    }
  };

  const persistSeniorMode = (next: boolean) => {
    setSeniorMode(next);
    try {
      const current = localStorage.getItem(LOCAL_STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : {};
      const prefs = { ...(parsed.seniorModePrefs || {}) };
      if (currentUser?.id) {
        prefs[currentUser.id] = next;
        const updatedUser = { ...currentUser, seniorModeEnabled: next };
        setCurrentUser(updatedUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      }
      saveToLocal({ seniorMode: next, seniorModePrefs: prefs });
    } catch (e) {
      console.warn('Error persisting senior mode:', e);
    }
  };

  const toggleSeniorMode = () => {
    persistSeniorMode(!seniorMode);
  };

  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>): Vehicle => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh_${Date.now()}`,
    };
    const updated = [newVehicle, ...vehicles];
    setVehicles(updated);
    saveToLocal({ vehicles: updated });
    return newVehicle;
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    const updated = vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v));
    setVehicles(updated);
    saveToLocal({ vehicles: updated });
  };

  const deleteVehicle = (id: string) => {
    const updated = vehicles.filter((v) => v.id !== id);
    setVehicles(updated);
    saveToLocal({ vehicles: updated });
  };

  const updateDriverVerification = (
    driverId: string,
    status: VerificationStatus,
    notes?: string
  ) => {
    const updated = drivers.map((d) => {
      if (d.id === driverId) {
        return {
          ...d,
          verificationStatus: status,
          verificationNotes: notes || d.verificationNotes,
          verifiedAt: status === 'verified' ? new Date().toISOString() : d.verifiedAt,
        };
      }
      return d;
    });
    setDrivers(updated);
    saveToLocal({ drivers: updated });

    const target = updated.find((d) => d.id === driverId || d.userId === driverId);
    if (target) {
      fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: target.id,
          onboardingStatus: target.onboardingStatus,
          verificationStatus: target.verificationStatus,
          submittedAt: target.submittedAt,
          onboardingStep: target.onboardingStep,
          declarationAccepted: target.declarationAccepted,
        }),
      }).catch(() => {});
    }
  };

  const checkDriverRedirect = (user: UserProfile): string => {
    const drv =
      drivers.find((d) => d.userId === user.id) ||
      drivers.find((d) => d.email.toLowerCase() === user.email.toLowerCase());

    if (!drv) {
      return '/driver/onboarding?step=1';
    }

    if (!drv.onboardingStatus || drv.onboardingStatus === 'not_started') {
      return '/driver/onboarding?step=1';
    }

    if (drv.onboardingStatus === 'draft') {
      return `/driver/onboarding?step=${drv.onboardingStep || 1}`;
    }

    if (drv.onboardingStatus === 'completed' || drv.onboardingStatus === 'submitted') {
      if (drv.verificationStatus === 'verified') {
        return '/driver/dashboard';
      }
      return '/driver/verification-status';
    }

    return '/driver/dashboard';
  };

  const saveDriverOnboardingDraft = (
    driverId: string,
    updates: Partial<Driver>,
    step?: number
  ): Driver => {
    let target = drivers.find((d) => d.id === driverId || d.userId === driverId);
    let updatedList: Driver[];

    if (target) {
      const merged: Driver = {
        ...target,
        ...updates,
        onboardingStatus: 'draft',
        onboardingStep: step !== undefined ? step : (target.onboardingStep || 1),
      };
      updatedList = drivers.map((d) => (d.id === target!.id ? merged : d));
      target = merged;
    } else {
      const newDriver: Driver = {
        id: `drv_${Date.now()}`,
        userId: currentUser?.id || `usr_drv_${Date.now()}`,
        name: currentUser?.name || 'New Driver',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
        photoUrl: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        experienceYears: 1,
        serviceArea: 'Bengaluru',
        rating: 0,
        totalTrips: 0,
        isAvailable: false,
        verificationStatus: 'draft',
        backgroundCheckConsented: false,
        capabilities: {
          manualTransmission: true,
          automaticTransmission: false,
          petrolDiesel: true,
          evCertified: false,
          smallCars: true,
          sedans: true,
          suvs: false,
          luxuryCars: false,
          languagesSpoken: ['English'],
        },
        documents: [],
        ...updates,
        onboardingStatus: 'draft',
        onboardingStep: step || 1,
      };
      updatedList = [newDriver, ...drivers];
      target = newDriver;
    }

    setDrivers(updatedList);
    saveToLocal({ drivers: updatedList });

    // Persist driver registration/draft to backend directory
    fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(target),
    }).catch(() => {});

    return target;
  };

  const submitDriverOnboarding = (driverId: string) => {
    const updated = drivers.map((d) => {
      if (d.id === driverId || d.userId === driverId) {
        return {
          ...d,
          onboardingStatus: 'completed' as const,
          verificationStatus: 'pending_review' as const,
          submittedAt: new Date().toISOString(),
          onboardingStep: 8,
          declarationAccepted: true,
        };
      }
      return d;
    });
    setDrivers(updated);
    saveToLocal({ drivers: updated });

    const target = updated.find((d) => d.id === driverId || d.userId === driverId);
    if (target) {
      fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: target.id,
          onboardingStatus: target.onboardingStatus,
          verificationStatus: target.verificationStatus,
          submittedAt: target.submittedAt,
          onboardingStep: target.onboardingStep,
          declarationAccepted: target.declarationAccepted,
        }),
      }).catch(() => {});
    }
  };

  const updateDriverCapabilities = (
    driverId: string,
    updates: Partial<Driver>
  ) => {
    const updated = drivers.map((d) => {
      if (d.id === driverId || d.userId === driverId) {
        return {
          ...d,
          ...updates,
          capabilities: {
            ...d.capabilities,
            ...(updates.capabilities || {}),
          },
        };
      }
      return d;
    });
    setDrivers(updated);
    saveToLocal({ drivers: updated });

    const target = updated.find((d) => d.id === driverId || d.userId === driverId);
    if (target) {
      fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: target.id,
          onboardingStatus: target.onboardingStatus,
          verificationStatus: target.verificationStatus,
          submittedAt: target.submittedAt,
          onboardingStep: target.onboardingStep,
          declarationAccepted: target.declarationAccepted,
        }),
      }).catch(() => {});
    }
  };

  const adminReviewDriver = (
    driverId: string,
    decision: 'approve' | 'reject' | 'request_changes',
    notes?: string,
    reason?: string
  ) => {
    const updated = drivers.map((d) => {
      if (d.id === driverId) {
        if (decision === 'approve') {
          return {
            ...d,
            verificationStatus: 'verified' as const,
            isAvailable: true,
            verifiedAt: new Date().toISOString(),
            verificationNotes: notes || 'Verified and approved by Safety Admin.',
            rejectionReason: undefined,
            changesRequestedNotes: undefined,
          };
        } else if (decision === 'reject') {
          return {
            ...d,
            verificationStatus: 'rejected' as const,
            isAvailable: false,
            rejectionReason: reason || 'Application does not meet verification criteria.',
            verificationNotes: notes,
          };
        } else {
          return {
            ...d,
            verificationStatus: 'changes_requested' as const,
            changesRequestedNotes: reason || notes || 'Please correct requested fields and resubmit.',
            verificationNotes: notes,
          };
        }
      }
      return d;
    });
    setDrivers(updated);
    saveToLocal({ drivers: updated });

    const reviewed = updated.find((d) => d.id === driverId);
    if (reviewed) {
      fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: reviewed.id,
          verificationStatus: reviewed.verificationStatus,
          isAvailable: reviewed.isAvailable,
          verifiedAt: reviewed.verifiedAt,
          verificationNotes: reviewed.verificationNotes,
          rejectionReason: reviewed.rejectionReason,
          changesRequestedNotes: reviewed.changesRequestedNotes,
        }),
      }).catch(() => {});
    }
  };

  const adminApproveDemoDriver = (driverId: string, notes?: string) => {
    const updated = drivers.map((d) => {
      if (d.id === driverId) {
        return {
          ...d,
          verificationStatus: 'verified' as const,
          isAvailable: true,
          adminDemoApproved: true,
          adminDemoApprovedAt: new Date().toISOString(),
          verificationNotes: notes || 'Approved in Demo Mode Sandbox (SIMULATED — NOT GOVERNMENT VERIFIED).',
          isSimulatedVerification: true,
          rejectionReason: undefined,
          changesRequestedNotes: undefined,
        };
      }
      return d;
    });
    setDrivers(updated);
    saveToLocal({ drivers: updated });

    const reviewed = updated.find((d) => d.id === driverId);
    if (reviewed) {
      fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: reviewed.id,
          verificationStatus: 'verified',
          isAvailable: true,
          adminDemoApproved: true,
          adminDemoApprovedAt: reviewed.adminDemoApprovedAt,
          verificationNotes: reviewed.verificationNotes,
          isSimulatedVerification: true,
        }),
      }).catch(() => {});
    }
  };

  const recordDriverLicenceVerification = (driverId: string, result: any) => {
    const updated = drivers.map((d) => {
      if (d.id === driverId || d.userId === driverId) {
        return {
          ...d,
          verificationMode: result.mode,
          licenceVerificationStatus: result.status,
          licenceVerificationBadge: result.badge,
          isSimulatedVerification: result.isDemo,
          licenceVerificationResult: result,
          licenceVerifiedAt: result.timestamp,
          drivingLicenceNumber: result.details?.dlNumber || d.drivingLicenceNumber,
          licenceIssuingState: result.details?.issuingState || d.licenceIssuingState,
          issuingRto: result.details?.issuingRto || d.issuingRto,
          licenceIssueDate: result.details?.validFrom || d.licenceIssueDate,
          licenceExpiryDate: result.details?.validUntil || d.licenceExpiryDate,
          licenceVehicleClasses: result.details?.vehicleClasses || d.licenceVehicleClasses,
        };
      }
      return d;
    });
    setDrivers(updated);
    saveToLocal({ drivers: updated });

    const target = updated.find((d) => d.id === driverId || d.userId === driverId);
    if (target) {
      fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: target.id,
          verificationMode: target.verificationMode,
          licenceVerificationStatus: target.licenceVerificationStatus,
          licenceVerificationBadge: target.licenceVerificationBadge,
          isSimulatedVerification: target.isSimulatedVerification,
          licenceVerificationResult: target.licenceVerificationResult,
          licenceVerifiedAt: target.licenceVerifiedAt,
        }),
      }).catch(() => {});
    }
  };

  const toggleDriverAvailability = (driverId: string) => {
    const target = drivers.find((d) => d.id === driverId);
    if (!target) return;
    if (!target.isAvailable && target.currentActiveBookingId) return;

    const nextAvailable = !target.isAvailable;
    const updated = drivers.map((d) =>
      d.id === driverId ? { ...d, isAvailable: nextAvailable } : d
    );
    setDrivers(updated);
    saveToLocal({ drivers: updated });

    fetch('/api/drivers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId, isAvailable: nextAvailable }),
    })
      .then((res) => {
        if (!res.ok) refreshBackendData();
      })
      .catch(() => {});
  };

  const toggleTrustedDriver = (driverId: string) => {
    const customerId = currentUser?.id || 'usr_cust_ramesh';
    const isCurrentlyTrusted = trustedDriverIds.includes(driverId);

    setTrustedDriverIds((prev) => {
      const updated = isCurrentlyTrusted
        ? prev.filter((id) => id !== driverId)
        : [...prev, driverId];
      saveToLocal({ trustedDriverIds: updated });
      return updated;
    });

    if (isCurrentlyTrusted) {
      fetch(
        `/api/trusted-drivers?customerId=${encodeURIComponent(customerId)}&driverId=${encodeURIComponent(driverId)}`,
        { method: 'DELETE' }
      )
        .then(() => refreshBackendData())
        .catch(() => {});
    } else {
      fetch('/api/trusted-drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, driverId }),
      })
        .then(() => refreshBackendData())
        .catch(() => {});
    }
  };

  const setTrustedDriverRole = async (driverId: string, role: 'primary' | 'backup') => {
    const customerId = currentUser?.id || 'usr_cust_ramesh';
    const res = await fetch('/api/trusted-drivers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, driverId, role }),
    });
    if (res.ok) await refreshBackendData();
  };

  const removeTrustedDriver = async (driverId: string) => {
    const customerId = currentUser?.id || 'usr_cust_ramesh';
    const res = await fetch(
      `/api/trusted-drivers?customerId=${encodeURIComponent(customerId)}&driverId=${encodeURIComponent(driverId)}`,
      { method: 'DELETE' }
    );
    if (res.ok) await refreshBackendData();
  };

  const registerDriverVehicle = async (
    driverId: string,
    vehicle: Omit<DriverVehicle, 'id' | 'driverId' | 'verificationStatus'>
  ): Promise<DriverVehicle | null> => {
    const res = await fetch('/api/driver-vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId, ...vehicle }),
    });
    const data = await res.json();
    if (res.ok && data.vehicle) {
      await refreshBackendData();
      return data.vehicle;
    }
    return null;
  };

  const updatePayoutStatus = async (
    payoutId: string,
    payoutStatus: PayoutStatus,
    paymentReference?: string
  ) => {
    const res = await fetch('/api/payouts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payoutId, payoutStatus, paymentReference }),
    });
    if (res.ok) await refreshBackendData();
  };

  const addSavedDestination = async (
    dest: Omit<SavedDestination, 'id' | 'customerId'>
  ): Promise<SavedDestination | null> => {
    const customerId = currentUser?.id || 'usr_cust_ramesh';
    try {
      const res = await fetch('/api/saved-destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, ...dest }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        await refreshBackendData();
        return json.data;
      }
    } catch (err) {
      console.warn('Failed to add saved destination:', err);
    }
    return null;
  };

  const updateSavedDestination = async (
    id: string,
    updates: Partial<SavedDestination>
  ): Promise<SavedDestination | null> => {
    const customerId = currentUser?.id || 'usr_cust_ramesh';
    try {
      const res = await fetch('/api/saved-destinations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, customerId, ...updates }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        await refreshBackendData();
        return json.data;
      }
    } catch (err) {
      console.warn('Failed to update saved destination:', err);
    }
    return null;
  };

  const deleteSavedDestination = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/saved-destinations?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshBackendData();
        return true;
      }
    } catch (err) {
      console.warn('Failed to delete saved destination:', err);
    }
    return false;
  };

  const createBookingAsync = async (payload: {
    clientRequestId?: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    bookedByGuardianId?: string;
    bookedByGuardianName?: string;
    requestedDriverId?: string;
    vehicleId: string;
    vehicleDetails: Booking['vehicleDetails'];
    pickupAddress: string;
    destinationAddress: string;
    pickupLat?: number;
    pickupLng?: number;
    destLat?: number;
    destLng?: number;
    pickupDate: string;
    pickupTime: string;
    expectedDurationHours: number;
    isRecurring?: boolean;
    recurringTitle?: string;
    paymentMethod: Booking['paymentMethod'];
    specialInstructions?: string;
  }) => {
    let res: Response;
    try {
      res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('[createBookingAsync] Network error:', err);
      return {
        ok: false,
        code: 'NETWORK_ERROR',
        error: 'Unable to connect to our booking service. Please check your connection and try again.',
        alternativeDrivers: [],
      };
    }

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      return {
        ok: false,
        code: 'SERVER_ERROR',
        error: 'Our booking service is temporarily unavailable. Please try again in a moment.',
        alternativeDrivers: [],
      };
    }

    if (!res.ok) {
      try {
        await refreshBackendData();
      } catch {
        // Ignore background sync failure
      }
      return {
        ok: false,
        error: data?.error || 'Unable to create booking.',
        code: data?.code,
        alternativeDrivers: data?.alternativeDrivers || [],
      };
    }

    try {
      await refreshBackendData();
    } catch {
      // Booking already succeeded; avoid failing UI if background sync hiccups
    }
    const booking: Booking = data.booking;
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: booking.customerId,
      bookingId: booking.id,
      title: 'Booking Confirmed',
      message: `Your booking ${booking.bookingCode} with ${booking.driverName} is confirmed.`,
      type: 'trip_update',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    return { ok: true, booking, driver: data.driver };
  };

  const createBooking = (
    newBookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'updatedAt' | 'statusHistory'>
  ): Booking => {
    const timestamp = new Date().toISOString();
    const code = `UBD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const booking: Booking = {
      ...newBookingData,
      id: `bk_${Date.now()}`,
      bookingCode: code,
      createdAt: timestamp,
      updatedAt: timestamp,
      statusHistory: [
        {
          status: newBookingData.status,
          timestamp,
          actor: currentUser?.name || 'Customer',
          note: 'Booking requested by customer / guardian',
        },
      ],
    };

    const updated = [booking, ...bookings];
    setBookings(updated);
    saveToLocal({ bookings: updated });

    // In-app notification for the booking
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: booking.customerId,
      bookingId: booking.id,
      title: 'Booking Confirmed',
      message: `Your booking ${booking.bookingCode} for ${booking.pickupDate} at ${booking.pickupTime} is confirmed.`,
      type: 'trip_update',
      isRead: false,
      createdAt: timestamp,
    };
    setNotifications((prev) => [notif, ...prev]);

    return booking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus, note?: string) => {
    const timestamp = new Date().toISOString();
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        const history = [
          ...b.statusHistory,
          {
            status,
            timestamp,
            note: note || `Status updated to ${status.replace('_', ' ')}`,
            actor: currentUser?.name || 'Customer',
          },
        ];

        let arrivalConfirmation = b.arrivalConfirmation;
        if (status === 'trip_completed') {
          arrivalConfirmation = {
            tripCompletedAt: timestamp,
            reminderCount: 0,
            status: 'pending',
          };
        } else if (status === 'closed') {
          if (arrivalConfirmation) {
            arrivalConfirmation = {
              ...arrivalConfirmation,
              customerConfirmedAt: arrivalConfirmation.customerConfirmedAt || timestamp,
              status: 'confirmed_by_customer',
            };
          }
        }

        return {
          ...b,
          status,
          statusHistory: history,
          arrivalConfirmation,
          updatedAt: timestamp,
        };
      }
      return b;
    });

    setBookings(updated);
    saveToLocal({ bookings: updated });

    // Sync status transition atomically with backend (releases driver, creates payout & trusted circle entry)
    fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        note: note || `Status updated to ${status.replace('_', ' ')}`,
        actor: currentUser?.name || 'Customer',
      }),
    })
      .then(() => refreshBackendData())
      .catch(() => {});

    // Notify guardian if active
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (targetBooking?.bookedByGuardianId) {
      const guardianNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: targetBooking.bookedByGuardianId,
        bookingId: targetBooking.id,
        title: `Trip Update: ${status.replace(/_/g, ' ').toUpperCase()}`,
        message: `Trip ${targetBooking.bookingCode} for ${targetBooking.customerName} is now: ${status.replace(/_/g, ' ')}.`,
        type: 'guardian',
        isRead: false,
        createdAt: timestamp,
      };
      setNotifications((prev) => [guardianNotif, ...prev]);
    }
  };

  const confirmArrival = (bookingId: string) => {
    const timestamp = new Date().toISOString();
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'closed' as BookingStatus,
          arrivalConfirmation: {
            tripCompletedAt: b.arrivalConfirmation?.tripCompletedAt || timestamp,
            customerConfirmedAt: timestamp,
            guardianNotifiedAt: timestamp,
            reminderCount: b.arrivalConfirmation?.reminderCount || 0,
            status: 'confirmed_by_customer' as const,
          },
          statusHistory: [
            ...b.statusHistory,
            {
              status: 'closed' as BookingStatus,
              timestamp,
              note: 'Safe arrival verified by customer.',
              actor: currentUser?.name || 'Customer',
            },
          ],
          updatedAt: timestamp,
        };
      }
      return b;
    });

    setBookings(updated);
    saveToLocal({ bookings: updated });

    // Sync safe arrival confirmation with backend
    fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'closed',
        note: 'Safe arrival verified by customer.',
        actor: currentUser?.name || 'Customer',
      }),
    })
      .then(() => refreshBackendData())
      .catch(() => {});

    // Add safe arrival confirmation notification
    const b = bookings.find((x) => x.id === bookingId);
    if (b) {
      const notif: AppNotification = {
        id: `notif_arr_${Date.now()}`,
        userId: b.customerId,
        bookingId,
        title: 'Safe Arrival Recorded',
        message: 'Thank you for confirming your safe arrival. Have a wonderful day!',
        type: 'arrival_confirmed',
        isRead: false,
        createdAt: timestamp,
      };
      setNotifications((prev) => [notif, ...prev]);

      // Guardian notification
      if (b.bookedByGuardianId) {
        const guardNotif: AppNotification = {
          id: `notif_arr_g_${Date.now()}`,
          userId: b.bookedByGuardianId,
          bookingId,
          title: 'Family Safe Arrival Confirmed',
          message: `${b.customerName} has confirmed reaching their destination safely.`,
          type: 'arrival_confirmed',
          isRead: false,
          createdAt: timestamp,
        };
        setNotifications((prev) => [guardNotif, ...prev]);
      }
    }
  };

  const triggerDelayException = (bookingId: string, reason?: string) => {
    const timestamp = new Date().toISOString();
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    const newIncident: IncidentReport = {
      id: `inc_${Date.now()}`,
      bookingId: target.id,
      driverId: target.driverId,
      driverName: target.driverName,
      customerId: target.customerId,
      customerName: target.customerName,
      incidentType: 'Delayed Arrival / Missing Confirmation Alert',
      severity: 'medium',
      description:
        reason ||
        `Trip ${target.bookingCode} completed 30 minutes ago without customer confirmation. Guardian notified.`,
      actionTaken: 'Automated SMS sent. Support operations desk flagged.',
      isResolved: false,
      reportedBy: 'Safety Watchdog',
      reportedAt: timestamp,
    };

    const updatedIncidents = [newIncident, ...incidentReports];
    setIncidentReports(updatedIncidents);
    saveToLocal({ incidentReports: updatedIncidents });

    // Alert guardian
    if (target.bookedByGuardianId) {
      const guardAlert: AppNotification = {
        id: `notif_del_${Date.now()}`,
        userId: target.bookedByGuardianId,
        bookingId: target.id,
        title: '⚠️ Arrival Confirmation Alert',
        message: `We noticed ${target.customerName} hasn't confirmed arrival yet. Driver reached destination. Operations is standing by.`,
        type: 'delay_alert',
        isRead: false,
        createdAt: timestamp,
      };
      setNotifications((prev) => [guardAlert, ...prev]);
    }
  };

  const updateFamilyPermissions = (
    relationshipId: string,
    permissions: FamilyRelationship['permissions']
  ) => {
    const updated = familyRelationships.map((r) =>
      r.id === relationshipId ? { ...r, permissions } : r
    );
    setFamilyRelationships(updated);
    saveToLocal({ familyRelationships: updated });
  };

  const revokeFamilyRelationship = (relationshipId: string) => {
    const updated = familyRelationships.map((r) =>
      r.id === relationshipId ? { ...r, status: 'revoked' as const } : r
    );
    setFamilyRelationships(updated);
    saveToLocal({ familyRelationships: updated });
  };

  const createSupportTicket = (
    ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'messages' | 'createdAt' | 'updatedAt'>,
    initialMessage: string
  ): SupportTicket => {
    const timestamp = new Date().toISOString();
    const ticketNum = `TKT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newTicket: SupportTicket = {
      ...ticketData,
      id: `tkt_${Date.now()}`,
      ticketNumber: ticketNum,
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderName: ticketData.raisedByName,
          senderRole: ticketData.raisedByRole,
          message: initialMessage,
          createdAt: timestamp,
          isAdminReply: false,
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updated = [newTicket, ...supportTickets];
    setSupportTickets(updated);
    saveToLocal({ supportTickets: updated });
    return newTicket;
  };

  const addTicketMessage = (ticketId: string, message: string, isAdmin = false) => {
    const timestamp = new Date().toISOString();
    const updated = supportTickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          messages: [
            ...t.messages,
            {
              id: `msg_${Date.now()}`,
              senderName: isAdmin ? 'Urban Driver Support' : (currentUser?.name || 'User'),
              senderRole: isAdmin ? 'Admin' : (currentUser?.role || 'customer'),
              message,
              createdAt: timestamp,
              isAdminReply: isAdmin,
            },
          ],
          updatedAt: timestamp,
        };
      }
      return t;
    });

    setSupportTickets(updated);
    saveToLocal({ supportTickets: updated });
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicketStatus) => {
    const updated = supportTickets.map((t) => (t.id === ticketId ? { ...t, status } : t));
    setSupportTickets(updated);
    saveToLocal({ supportTickets: updated });
  };

  const createAssistedRequest = (
    req: Omit<AssistedBookingRequest, 'id' | 'status' | 'createdAt'>
  ) => {
    const newReq: AssistedBookingRequest = {
      ...req,
      id: `asst_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [newReq, ...assistedRequests];
    setAssistedRequests(updated);
    saveToLocal({ assistedRequests: updated });
  };

  const convertAssistedRequest = (requestId: string, bookingData: any) => {
    const updated = assistedRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'converted' as const } : r
    );
    setAssistedRequests(updated);
    saveToLocal({ assistedRequests: updated });

    if (bookingData) {
      createBooking(bookingData);
    }
  };

  const createInstitutionalLead = (lead: Omit<InstitutionalLead, 'id' | 'createdAt'>) => {
    const newLead: InstitutionalLead = {
      ...lead,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newLead, ...institutionalLeads];
    setInstitutionalLeads(updated);
    saveToLocal({ institutionalLeads: updated });
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    saveToLocal({ notifications: updated });
  };

  const rateDriver = (
    bookingId: string,
    driverId: string,
    rating: number,
    feedback: string
  ) => {
    // Update driver rating average
    const updatedDrivers = drivers.map((d) => {
      if (d.id === driverId) {
        const newTotal = d.totalTrips + 1;
        const newRating = Number(((d.rating * d.totalTrips + rating) / newTotal).toFixed(2));
        return { ...d, rating: newRating, totalTrips: newTotal };
      }
      return d;
    });
    setDrivers(updatedDrivers);
    saveToLocal({ drivers: updatedDrivers });

    // Mark booking status history with rating
    const updatedBookings = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          statusHistory: [
            ...b.statusHistory,
            {
              status: b.status,
              timestamp: new Date().toISOString(),
              note: `Rated ${rating} Stars: "${feedback}"`,
              actor: currentUser?.name || 'Customer',
            },
          ],
        };
      }
      return b;
    });
    setBookings(updatedBookings);
    saveToLocal({ bookings: updatedBookings });
  };

  const updatePricingConfig = (config: Partial<PricingConfig>) => {
    const updated = { ...pricingConfig, ...config };
    setPricingConfig(updated);
    saveToLocal({ pricingConfig: updated });
  };

  const addRecurringSchedule = (
    scheduleData: Omit<RecurringSchedule, 'id'>
  ): RecurringSchedule => {
    const newSchedule: RecurringSchedule = {
      ...scheduleData,
      id: `rec_${Date.now()}`,
    };
    const updated = [newSchedule, ...recurringSchedules];
    setRecurringSchedules(updated);
    saveToLocal({ recurringSchedules: updated });
    return newSchedule;
  };

  const resetDemoData = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }
    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setBookings(INITIAL_BOOKINGS);
    setTrustedDriverIds(['drv_suresh']);
    setFamilyRelationships(INITIAL_FAMILY_RELATIONSHIPS);
    setSupportTickets(INITIAL_TICKETS);
    setIncidentReports(INITIAL_INCIDENTS);
    setAssistedRequests(INITIAL_ASSISTED_REQUESTS);
    setInstitutionalLeads(INITIAL_INSTITUTIONAL_LEADS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setRecurringSchedules(INITIAL_RECURRING_SCHEDULES);
    setCurrentUser(null);
    setSeniorMode(false);
    setLanguage('en');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        isAuthenticated: !!currentUser,
        isAuthLoaded,
        login,
        logout,
        switchDemoRole,
        seniorMode,
        setSeniorMode,
        toggleSeniorMode,
        language,
        setLanguage,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        drivers,
        updateDriverVerification,
        saveDriverOnboardingDraft,
        submitDriverOnboarding,
        updateDriverCapabilities,
        adminReviewDriver,
        adminApproveDemoDriver,
        recordDriverLicenceVerification,
        checkDriverRedirect,
        toggleDriverAvailability,
        trustedDriverIds,
        trustedDrivers,
        toggleTrustedDriver,
        setTrustedDriverRole,
        removeTrustedDriver,
        driverPayouts,
        updatePayoutStatus,
        registerDriverVehicle,
        savedDestinations,
        addSavedDestination,
        updateSavedDestination,
        deleteSavedDestination,
        refreshBackendData,
        bookings,
        createBooking,
        createBookingAsync,
        updateBookingStatus,
        confirmArrival,
        triggerDelayException,
        familyRelationships,
        updateFamilyPermissions,
        revokeFamilyRelationship,
        supportTickets,
        createSupportTicket,
        addTicketMessage,
        updateTicketStatus,
        incidentReports,
        assistedRequests,
        createAssistedRequest,
        convertAssistedRequest,
        institutionalLeads,
        createInstitutionalLead,
        notifications,
        markNotificationRead,
        rateDriver,
        pricingConfig,
        updatePricingConfig,
        recurringSchedules,
        addRecurringSchedule,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
