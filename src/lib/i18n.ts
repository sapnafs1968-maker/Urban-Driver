import { Translations, en } from './translations/en';
import { hi } from './translations/hi';
import { bn } from './translations/bn';
import { ta } from './translations/ta';
import { te } from './translations/te';
import { mr } from './translations/mr';
import { gu } from './translations/gu';
import { kn } from './translations/kn';
import { ml } from './translations/ml';
import { pa } from './translations/pa';
import { ur } from './translations/ur';

export type { Translations };

export type LanguageCode =
  | 'en' // English
  | 'hi' // Hindi
  | 'bn' // Bengali
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'pa' // Punjabi
  | 'ur'; // Urdu (RTL)

export interface LanguageMeta {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  isRtl?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', isRtl: true },
];

export const translations: Record<LanguageCode, Translations> = {
  en,
  hi,
  bn,
  ta,
  te,
  mr,
  gu,
  kn,
  ml,
  pa,
  ur,
};

/**
 * Returns translation dictionary for given language code with safe fallback to English.
 */
export function getTranslation(code?: string): Translations {
  if (code && code in translations) {
    return { ...translations.en, ...translations[code as LanguageCode] };
  }
  return translations.en;
}

/**
 * Formats a dynamic message template by replacing {{key}} tokens.
 */
export function interpolate(template: string, params: Record<string, string | number>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
  });
}

/**
 * Maps internal booking status codes to translated user-facing text.
 */
export function formatBookingStatus(status: string | undefined, lang: LanguageCode): string {
  const t = getTranslation(lang);
  if (!status) return '';
  switch (status.toLowerCase()) {
    case 'requested':
    case 'pending':
      return t.statusScheduled || 'Requested';
    case 'confirmed':
      return t.statusConfirmed || 'Confirmed';
    case 'awaiting_driver':
      return t.statusAwaitingDriver || 'Awaiting Driver';
    case 'driver_assigned':
      return t.statusDriverAssigned || 'Driver Assigned';
    case 'driver_en_route':
      return t.statusEnRoute || 'Driver En Route';
    case 'driver_arrived':
      return t.statusArrived || 'Driver Arrived';
    case 'trip_started':
      return t.statusStarted || 'Trip Started';
    case 'trip_completed':
    case 'completed':
      return t.statusCompleted || 'Trip Completed';
    case 'arrival_confirmation_pending':
      return t.statusDelayed || 'Arrival Confirmation Pending';
    case 'closed':
      return t.statusClosed || 'Trip Closed';
    case 'cancelled':
      return t.statusCancelled || 'Cancelled';
    default:
      return status.replace(/_/g, ' ');
  }
}

/**
 * Maps internal driver verification status codes to translated user-facing text.
 */
export function formatVerificationStatus(status: string | undefined, lang: LanguageCode): string {
  const t = getTranslation(lang);
  if (!status) return '';
  switch (status.toLowerCase()) {
    case 'verified':
    case 'approved':
      return t.verifVerified || 'Verified';
    case 'pending_review':
    case 'pending':
      return t.verifPending || 'Pending Review';
    case 'under_review':
    case 'under_verification':
      return t.verifUnderVerification || 'Under Review';
    case 'changes_requested':
      return t.verifChangesRequested || 'Changes Requested';
    case 'rejected':
      return t.verifRejected || 'Verification Unsuccessful';
    case 'draft':
      return t.verifDraft || 'Draft';
    case 'suspended':
      return t.verifSuspended || 'Suspended';
    default:
      return status.replace(/_/g, ' ');
  }
}

/**
 * Maps internal payment status codes to translated user-facing text.
 */
export function formatPaymentStatus(status: string | undefined, lang: LanguageCode): string {
  const t = getTranslation(lang);
  if (!status) return '';
  switch (status.toLowerCase()) {
    case 'successful':
    case 'paid':
      return t.statusPaymentSuccessful || 'Payment Successful';
    case 'pending':
      return t.statusPaymentPending || 'Payment Pending';
    case 'failed':
      return t.statusPaymentFailed || 'Payment Failed';
    case 'refunded':
      return t.statusPaymentRefunded || 'Refunded';
    case 'partially_refunded':
      return t.statusPaymentPartiallyRefunded || 'Partially Refunded';
    default:
      return status.replace(/_/g, ' ');
  }
}
