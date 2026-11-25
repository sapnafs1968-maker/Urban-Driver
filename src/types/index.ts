export type UserRole = 'customer' | 'family_guardian' | 'driver' | 'admin';

export type VerificationStatus =
  | 'not_started'
  | 'draft'
  | 'submitted'
  | 'not_submitted'
  | 'pending_review'
  | 'under_verification'
  | 'changes_requested'
  | 'verified'
  | 'rejected'
  | 'suspended'
  | 'expired';

export type DriverOnboardingStatus =
  | 'not_started'
  | 'draft'
  | 'submitted'
  | 'completed';

export type LanguageProficiency = 'fluent' | 'conversational' | 'basic';
export type SkillLevel = 'beginner' | 'intermediate' | 'expert';

export interface DriverAssistancePreferences {
  assistingSeniors: boolean;
  helpEnterExit: boolean;
  familyAssistedBookings: boolean;
  hospitalJourneys: boolean;
  airportJourneys: boolean;
  recurringBookings: boolean;
  luggageAssistance: boolean;
}

export type TransmissionType = 'manual' | 'automatic';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng';
export type VehicleSize = 'small' | 'sedan' | 'suv' | 'luxury' | 'other';

export type BookingStatus =
  | 'draft'
  | 'requested'
  | 'awaiting_assignment'
  | 'driver_assigned'
  | 'confirmed'
  | 'driver_en_route'
  | 'driver_arrived'
  | 'trip_started'
  | 'trip_completed'
  | 'arrival_confirmation_pending'
  | 'closed'
  | 'cancelled'
  | 'rejected';

export type PaymentStatus =
  | 'pending'
  | 'initiated'
  | 'successful'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type SupportTicketStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export type SupportedLanguage =
  | 'en'
  | 'hi'
  | 'bn'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'ur';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  city: string;
  serviceArea: string;
  preferredLanguage: SupportedLanguage;
  seniorModeEnabled?: boolean;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Vehicle {
  id: string;
  customerId: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  category: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  isEv: boolean;
  vehicleSize: VehicleSize;
  specialHandlingNotes?: string;
  isDefault?: boolean;
  photoUrl?: string;
}

export interface DriverCapabilities {
  manualTransmission: boolean;
  automaticTransmission: boolean;
  petrolDiesel: boolean;
  evCertified: boolean;
  smallCars: boolean;
  sedans: boolean;
  suvs: boolean;
  luxuryCars: boolean;
  languagesSpoken: string[];
}

export interface DriverDocument {
  id: string;
  driverId: string;
  documentType: 'driving_license' | 'aadhaar' | 'police_clearance';
  documentNumber: string;
  documentUrl: string;
  expiryDate?: string;
  verificationStatus: VerificationStatus;
  reviewerNotes?: string;
  reviewedAt?: string;
}

export interface DriverVehicle {
  id: string;
  driverId: string;
  registrationNumber: string;
  manufacturer: string;
  model: string;
  year?: number;
  category?: string;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
}

export interface Driver {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  photoUrl: string;
  experienceYears: number;
  serviceArea: string;
  rating: number;
  totalTrips: number;
  isAvailable: boolean;
  currentActiveBookingId?: string | null;
  registeredVehicle?: DriverVehicle;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  backgroundCheckConsented: boolean;
  capabilities: DriverCapabilities;
  documents: DriverDocument[];

  // Onboarding & Profile Details
  dob?: string;
  residentialAddress?: string;
  residentialCity?: string;
  state?: string;
  pincode?: string;
  preferredLanguage?: SupportedLanguage;

  // Driving Licence
  drivingLicenceNumber?: string;
  licenceIssuingState?: string;
  issuingRto?: string;
  licenceIssueDate?: string;
  licenceExpiryDate?: string;
  licenceVehicleClasses?: string[];
  licenceFrontPhotoUrl?: string;
  licenceBackPhotoUrl?: string;

  // Driving Experience
  professionalExperienceYears?: number;
  previousExperienceDescription?: string;
  vehiclesDrivenTypes?: string[];
  preferredAssignments?: string[];
  citiesWorked?: string[];

  // Vehicle Capabilities
  supportedTransmissions?: string[]; // 'manual' | 'automatic' | 'amt' | 'cvt' | 'dct'
  supportedFuelTypes?: string[]; // 'petrol' | 'diesel' | 'cng' | 'hybrid' | 'electric'
  vehicleCategories?: string[]; // 'hatchback' | 'sedan' | 'compact_suv' | 'suv' | 'muv_mpv' | 'luxury' | 'electric_cars'
  specialCapabilities?: Record<string, SkillLevel>;

  // Languages & Assistance
  languageProficiencies?: { language: string; proficiency: LanguageProficiency }[];
  customerAssistance?: DriverAssistancePreferences;

  // Service Area & Availability
  preferredWorkingCity?: string;
  preferredServiceAreas?: string[];
  serviceRadiusKm?: number;
  availabilityDays?: string[];
  workingHours?: string;
  preferredShifts?: string[];

  // Verification & Onboarding status
  governmentIdType?: 'aadhaar' | 'pan' | 'voter_id' | 'passport';
  governmentIdNumber?: string;
  governmentIdDocumentUrl?: string;
  onboardingStatus?: DriverOnboardingStatus;
  onboardingStep?: number; // 1 to 8
  submittedAt?: string;
  rejectionReason?: string;
  changesRequestedNotes?: string;
  consentTimestamp?: string;
  declarationAccepted?: boolean;

  // Licence Verification Engine (Simulated Demo & Live API)
  verificationMode?: 'demo' | 'live';
  licenceVerificationStatus?: string;
  licenceVerificationBadge?: string;
  isSimulatedVerification?: boolean;
  licenceVerificationResult?: any;
  licenceVerifiedAt?: string;
  adminDemoApproved?: boolean;
  adminDemoApprovedAt?: string;
}

export type DriverOnboardingData = Partial<Omit<Driver, 'id' | 'userId'>> & {
  fullName?: string;
  email?: string;
  phone?: string;
};

export interface FamilyRelationship {
  id: string;
  customerId: string;
  customerName: string;
  guardianUserId: string;
  guardianName: string;
  relationshipTitle: string;
  status: 'pending' | 'active' | 'revoked';
  invitedAt: string;
  acceptedAt?: string;
  permissions: {
    canViewTrips: boolean;
    canBookTrips: boolean;
    canMakePayments: boolean;
    canReceiveAlerts: boolean;
    canContactSupport: boolean;
  };
}

export interface Booking {
  id: string;
  bookingCode: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  bookedByGuardianId?: string;
  bookedByGuardianName?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  driverPhotoUrl?: string;
  driverVehicle?: DriverVehicle;
  tripId?: string;
  payoutId?: string;
  vehicleId: string;
  vehicleDetails: {
    make: string;
    model: string;
    registrationNumber: string;
    transmission: TransmissionType;
    fuelType: FuelType;
    isEv: boolean;
  };
  pickupAddress: string;
  destinationAddress: string;
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  pickupDate: string;
  pickupTime: string;
  expectedDurationHours: number;
  isRecurring?: boolean;
  recurringTitle?: string;
  status: BookingStatus;
  statusHistory: {
    status: BookingStatus;
    timestamp: string;
    note?: string;
    actor?: string;
  }[];
  preferredDriverId?: string;
  baseFare: number;
  durationFare: number;
  platformFee: number;
  taxAmount: number;
  totalFare: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'razorpay' | 'cash' | 'upi' | 'guardian_pay';
  specialInstructions?: string;
  arrivalConfirmation?: {
    tripCompletedAt: string;
    customerConfirmedAt?: string;
    guardianNotifiedAt?: string;
    reminderCount: number;
    status: 'pending' | 'confirmed_by_customer' | 'guardian_escalated' | 'support_alert_raised';
  };
  liveLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
    statusText: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RecurringSchedule {
  id: string;
  customerId: string;
  title: string;
  vehicleId: string;
  preferredDriverId?: string;
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon ...
  startDate: string;
  endDate?: string;
  pickupTime: string;
  pickupAddress: string;
  destinationAddress: string;
  status: 'active' | 'paused' | 'cancelled';
  totalOccurrences: number;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  raisedBy: string;
  raisedByName: string;
  raisedByRole: UserRole;
  bookingId?: string;
  category: 'Driver Issue' | 'Booking' | 'Payment' | 'Delay' | 'Safety' | 'Vehicle Care' | 'Other';
  subject: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: SupportTicketStatus;
  assignedAdmin?: string;
  messages: {
    id: string;
    senderName: string;
    senderRole: string;
    message: string;
    createdAt: string;
    isAdminReply: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface IncidentReport {
  id: string;
  bookingId?: string;
  driverId?: string;
  driverName?: string;
  customerId?: string;
  customerName?: string;
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  actionTaken?: string;
  isResolved: boolean;
  reportedBy: string;
  reportedAt: string;
}

export interface DriverRatingReview {
  id: string;
  bookingId: string;
  driverId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  punctualityRating: number;
  vehicleCareRating: number;
  courtesyRating: number;
  feedbackText: string;
  createdAt: string;
}

export interface AssistedBookingRequest {
  id: string;
  callerName: string;
  callerPhone: string;
  preferredDate: string;
  preferredTime: string;
  pickupArea: string;
  destinationArea: string;
  vehicleType: string;
  channel: 'phone' | 'whatsapp';
  status: 'pending' | 'called_back' | 'converted' | 'closed';
  operatorNotes?: string;
  createdAt: string;
}

export interface InstitutionalLead {
  id: string;
  institutionName: string;
  institutionType: 'senior_living' | 'hospital' | 'rwa' | 'corporate';
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  estimatedMonthlyTrips: number;
  notes: string;
  status: 'new' | 'contacted' | 'pilot_in_progress' | 'signed';
  createdAt: string;
}

export type PayoutStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed';

export interface Trip {
  id: string;
  bookingId: string;
  bookingCode: string;
  driverId: string;
  customerId: string;
  startTime: string;
  completionTime?: string;
  finalFare: number;
  tripStatus: 'in_progress' | 'completed' | 'cancelled';
}

export interface DriverPayout {
  id: string;
  driverId: string;
  tripId: string;
  bookingId: string;
  bookingCode: string;
  customerId: string;
  customerName: string;
  pickupAddress: string;
  destinationAddress: string;
  tripDate: string;
  tripTime: string;
  totalFare: number;
  platformCommission: number;
  deductions: number;
  netPayout: number;
  payoutStatus: PayoutStatus;
  paymentReference?: string;
  createdAt: string;
  paidAt?: string;
}

export interface TrustedDriver {
  id: string;
  customerId: string;
  driverId: string;
  completedTripsCount: number;
  isPrimary: boolean;
  isBackup: boolean;
  trustedStatus: 'active' | 'removed';
  addedAt: string;
  lastTripAt?: string;
}

export interface SavedDestination {
  id: string;
  customerId: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  icon: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  bookingId?: string;
  title: string;
  message: string;
  type: 'trip_update' | 'arrival_pending' | 'arrival_confirmed' | 'delay_alert' | 'payment' | 'support' | 'guardian';
  isRead: boolean;
  createdAt: string;
}
