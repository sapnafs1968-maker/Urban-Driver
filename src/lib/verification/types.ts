export type VerificationMode = 'demo' | 'live';

export type DemoVerificationStatus =
  | 'DEMO_PENDING'
  | 'DEMO_PASSED'
  | 'DEMO_EXPIRED'
  | 'DEMO_DETAILS_MISMATCH'
  | 'DEMO_RECORD_NOT_FOUND'
  | 'DEMO_SERVICE_UNAVAILABLE';

export type LiveVerificationStatus =
  | 'LIVE_PENDING'
  | 'LIVE_VERIFIED'
  | 'LIVE_REJECTED'
  | 'LIVE_CONFIG_ERROR'
  | 'LIVE_SERVICE_ERROR';

export type VerificationStatus = DemoVerificationStatus | LiveVerificationStatus;

export type MatchResult = 'matched' | 'mismatch' | 'not_applicable';

export interface LicenceVerificationRequest {
  driverId?: string;
  dlNumber: string;
  dob: string; // YYYY-MM-DD
  fullName: string;
  issuingState?: string;
  issuingRto?: string;
  consent: boolean;
  scenarioOverride?: string; // Optional test trigger e.g. 'DEMO-VALID-001'
}

export interface LicenceMatchDetails {
  dlNumber: string;
  holderName: string;
  submittedName: string;
  nameMatch: MatchResult;
  holderDob: string;
  submittedDob: string;
  dobMatch: MatchResult;
  issueDate?: string;
  validFrom: string;
  validUntil: string;
  isExpired: boolean;
  vehicleClasses: string[];
  issuingRto: string;
  issuingState: string;
  fatherOrHusbandName?: string;
}

export interface LicenceVerificationResult {
  success: boolean;
  status: VerificationStatus;
  mode: VerificationMode;
  isDemo: boolean;
  badge: string; // e.g. "SIMULATED — NOT GOVERNMENT VERIFIED"
  summary: string;
  message: string;
  details?: LicenceMatchDetails;
  canRetry?: boolean;
  timestamp: string;
  disclaimer: string;
  rawResponse?: Record<string, any>;
}

export interface LicenceVerificationProvider {
  readonly mode: VerificationMode;
  verify(request: LicenceVerificationRequest): Promise<LicenceVerificationResult>;
}
