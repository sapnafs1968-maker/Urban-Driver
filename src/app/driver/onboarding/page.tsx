'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/store';
import { SUPPORTED_LANGUAGES, getTranslation, LanguageCode } from '@/lib/i18n';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { LocationPicker } from '@/components/location/LocationPicker';
import {
  User,
  ShieldCheck,
  FileText,
  Car,
  Globe,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Upload,
  Calendar,
  Clock,
  Check,
  Sparkles,
  Camera,
  Trash2,
  Eye,
  Info,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { DEMO_SCENARIOS, LicenceVerificationResult } from '@/lib/verification';

const STEP_TITLES = [
  'Personal Information',
  'Driving Licence',
  'Driving Experience',
  'Vehicle Capabilities',
  'Languages & Assistance',
  'Service Area & Shifts',
  'Supporting Documents',
  'Review & Submit',
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = parseInt(searchParams.get('step') || '1', 10);

  const {
    currentUser,
    drivers,
    saveDriverOnboardingDraft,
    submitDriverOnboarding,
    recordDriverLicenceVerification,
    language,
  } = useApp();
  const t = getTranslation(language);

  const stepTitles = [
    t.stepPersonalInfo,
    t.stepLicence,
    t.stepExperience,
    t.stepCapabilities,
    t.stepLanguages,
    t.stepServiceArea,
    t.stepDocuments,
    t.stepReview,
  ];

  // Active driver record or current user shell
  const existingDriver =
    (currentUser && (drivers.find((d) => d.userId === currentUser.id) ||
    drivers.find((d) => d.email.toLowerCase() === currentUser.email.toLowerCase()))) ||
    drivers[0];

  const driverId = existingDriver?.id || `drv_${Date.now()}`;

  const [currentStep, setCurrentStep] = useState<number>(
    stepParam >= 1 && stepParam <= 8 ? stepParam : existingDriver?.onboardingStep || 1
  );
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // STEP 1: Personal Info
  const [fullName, setFullName] = useState(existingDriver?.name || currentUser?.name || '');
  const [photoUrl, setPhotoUrl] = useState(
    existingDriver?.photoUrl ||
      currentUser?.avatarUrl ||
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
  );
  const [dob, setDob] = useState(existingDriver?.dob || '1990-05-15');
  const [email, setEmail] = useState(existingDriver?.email || currentUser?.email || '');
  const [phone, setPhone] = useState(existingDriver?.phone || currentUser?.phone || '');
  const [residentialAddress, setResidentialAddress] = useState(
    existingDriver?.residentialAddress || '42, 3rd Cross, Indiranagar Stage 2'
  );
  const [city, setCity] = useState(existingDriver?.residentialCity || 'Bengaluru');
  const [state, setState] = useState(existingDriver?.state || 'Karnataka');
  const [pincode, setPincode] = useState(existingDriver?.pincode || '560038');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(
    existingDriver?.preferredLanguage || 'kn'
  );

  // STEP 2: Driving Licence
  const [dlNumber, setDlNumber] = useState(existingDriver?.drivingLicenceNumber || '');
  const [issuingState, setIssuingState] = useState(existingDriver?.licenceIssuingState || 'Karnataka');
  const [issuingRto, setIssuingRto] = useState(existingDriver?.issuingRto || 'KA-03 (Indiranagar)');
  const [dlIssueDate, setDlIssueDate] = useState(existingDriver?.licenceIssueDate || '2016-04-10');
  const [dlExpiryDate, setDlExpiryDate] = useState(existingDriver?.licenceExpiryDate || '2036-04-10');
  const [vehicleClasses, setVehicleClasses] = useState<string[]>(
    existingDriver?.licenceVehicleClasses || ['LMV (Light Motor Vehicle)', 'MCWG']
  );
  const [dlFrontPhoto, setDlFrontPhoto] = useState(
    existingDriver?.licenceFrontPhotoUrl ||
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80'
  );
  const [dlBackPhoto, setDlBackPhoto] = useState(
    existingDriver?.licenceBackPhotoUrl ||
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80'
  );

  // STEP 2 Verification Engine State
  const [verificationMode, setVerificationMode] = useState<'demo' | 'live'>('demo');
  const [selectedScenario, setSelectedScenario] = useState<string>('DEMO-VALID-001');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<LicenceVerificationResult | null>(
    existingDriver?.licenceVerificationResult || null
  );
  const [verificationConsent, setVerificationConsent] = useState<boolean>(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [manualReviewRequested, setManualReviewRequested] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/verify-licence')
      .then((res) => res.json())
      .then((data) => {
        if (data?.mode) setVerificationMode(data.mode);
      })
      .catch(() => {});
  }, []);

  const handleSelectScenario = (scenarioId: string) => {
    const s = DEMO_SCENARIOS.find((item) => item.id === scenarioId);
    if (!s) return;
    setSelectedScenario(scenarioId);
    setDlNumber(s.presetData.dlNumber);
    setFullName(s.presetData.fullName);
    setDob(s.presetData.dob);
    setIssuingState(s.presetData.issuingState);
    setIssuingRto(s.presetData.issuingRto);
    setVerificationResult(null);
    setVerificationError(null);
  };

  const handleVerifyLicence = async () => {
    if (!dlNumber.trim()) {
      setVerificationError('Driving Licence Number is required for verification.');
      return;
    }
    if (!dob) {
      setVerificationError('Date of birth is required. Please check Step 1.');
      return;
    }
    if (!verificationConsent) {
      setVerificationError('Applicant consent is required before verifying licence credentials.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const res = await fetch('/api/verify-licence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          dlNumber: dlNumber.trim().toUpperCase(),
          dob,
          fullName,
          issuingState,
          issuingRto,
          consent: verificationConsent,
          scenarioOverride: selectedScenario,
        }),
      });

      const data: LicenceVerificationResult = await res.json();
      setVerificationResult(data);

      if (data.details) {
        if (data.details.validFrom) setDlIssueDate(data.details.validFrom);
        if (data.details.validUntil) setDlExpiryDate(data.details.validUntil);
        if (data.details.vehicleClasses && data.details.vehicleClasses.length > 0) {
          setVehicleClasses(data.details.vehicleClasses);
        }
      }

      recordDriverLicenceVerification(driverId, data);
    } catch (err: any) {
      setVerificationError('Failed to communicate with verification engine: ' + (err?.message || 'Network error'));
    } finally {
      setIsVerifying(false);
    }
  };

  // STEP 3: Driving Experience
  const [totalExpYears, setTotalExpYears] = useState(existingDriver?.experienceYears || 5);
  const [profExpYears, setProfExpYears] = useState(existingDriver?.professionalExperienceYears || 4);
  const [prevExpDesc, setPrevExpDesc] = useState(
    existingDriver?.previousExperienceDescription ||
      'Full-time private driver for executive families and senior citizens.'
  );
  const [vehiclesDriven, setVehiclesDriven] = useState<string[]>(
    existingDriver?.vehiclesDrivenTypes || ['Sedan', 'SUV', 'Compact SUV', 'Hatchback']
  );
  const [preferredAssignments, setPreferredAssignments] = useState<string[]>(
    existingDriver?.preferredAssignments || ['Hospital Journeys', 'Senior Assistance', 'Local Errands']
  );
  const [citiesWorked, setCitiesWorked] = useState<string[]>(
    existingDriver?.citiesWorked || ['Bengaluru', 'Mysuru']
  );

  // STEP 4: Vehicle Capabilities
  const [transmissions, setTransmissions] = useState<string[]>(
    existingDriver?.supportedTransmissions || ['manual', 'automatic', 'amt']
  );
  const [fuelTypes, setFuelTypes] = useState<string[]>(
    existingDriver?.supportedFuelTypes || ['petrol', 'diesel', 'electric']
  );
  const [vehicleCategories, setVehicleCategories] = useState<string[]>(
    existingDriver?.vehicleCategories || ['hatchback', 'sedan', 'compact_suv', 'suv']
  );
  const [specialCapabilities, setSpecialCapabilities] = useState<Record<string, 'beginner' | 'intermediate' | 'expert'>>(
    existingDriver?.specialCapabilities || {
      ev_charging: 'intermediate',
      automatic_transmission: 'expert',
      manual_transmission: 'expert',
      city_traffic: 'expert',
      highway_driving: 'expert',
      defensive_driving: 'intermediate',
      night_driving: 'intermediate',
    }
  );

  // STEP 5: Languages & Assistance
  const [langProficiencies, setLangProficiencies] = useState<{ language: string; proficiency: 'fluent' | 'conversational' | 'basic' }[]>(
    existingDriver?.languageProficiencies || [
      { language: 'Kannada', proficiency: 'fluent' },
      { language: 'English', proficiency: 'conversational' },
      { language: 'Hindi', proficiency: 'conversational' },
    ]
  );
  const [customerAssistance, setCustomerAssistance] = useState(
    existingDriver?.customerAssistance || {
      assistingSeniors: true,
      helpEnterExit: true,
      familyAssistedBookings: true,
      hospitalJourneys: true,
      airportJourneys: true,
      recurringBookings: true,
      luggageAssistance: true,
    }
  );

  // STEP 6: Service Area & Availability
  const [preferredCity, setPreferredCity] = useState(existingDriver?.preferredWorkingCity || 'Bengaluru');
  const [serviceAreas, setServiceAreas] = useState<string[]>(
    existingDriver?.preferredServiceAreas || ['Indiranagar', 'Koramangala', 'Domlur', 'Defence Colony']
  );
  const [serviceRadius, setServiceRadius] = useState(existingDriver?.serviceRadiusKm || 15);
  const [availabilityDays, setAvailabilityDays] = useState<string[]>(
    existingDriver?.availabilityDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  );
  const [workingHours, setWorkingHours] = useState(existingDriver?.workingHours || '08:00 AM - 08:00 PM');
  const [preferredShifts, setPreferredShifts] = useState<string[]>(
    existingDriver?.preferredShifts || ['Morning', 'Afternoon']
  );

  // STEP 7: Supporting Documents & Verification Consent
  const [govIdType, setGovIdType] = useState<'aadhaar' | 'pan' | 'voter_id' | 'passport'>(
    existingDriver?.governmentIdType || 'aadhaar'
  );
  const [govIdNumber, setGovIdNumber] = useState(existingDriver?.governmentIdNumber || 'XXXX-XXXX-9021');
  const [govIdUrl, setGovIdUrl] = useState(
    existingDriver?.governmentIdDocumentUrl ||
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80'
  );
  const [bgConsent, setBgConsent] = useState(existingDriver?.backgroundCheckConsented || false);

  // STEP 8: Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Progress Percentage calculation
  const progressPercent = Math.round((currentStep / 8) * 100);

  // Auto-save draft on step change
  const buildCurrentData = () => ({
    name: fullName,
    photoUrl,
    dob,
    email,
    phone,
    residentialAddress,
    residentialCity: city,
    state,
    pincode,
    preferredLanguage,
    drivingLicenceNumber: dlNumber,
    licenceIssuingState: issuingState,
    issuingRto,
    licenceIssueDate: dlIssueDate,
    licenceExpiryDate: dlExpiryDate,
    licenceVehicleClasses: vehicleClasses,
    licenceFrontPhotoUrl: dlFrontPhoto,
    licenceBackPhotoUrl: dlBackPhoto,
    experienceYears: totalExpYears,
    professionalExperienceYears: profExpYears,
    previousExperienceDescription: prevExpDesc,
    vehiclesDrivenTypes: vehiclesDriven,
    preferredAssignments,
    citiesWorked,
    supportedTransmissions: transmissions,
    supportedFuelTypes: fuelTypes,
    vehicleCategories,
    specialCapabilities,
    languageProficiencies: langProficiencies,
    customerAssistance,
    preferredWorkingCity: preferredCity,
    preferredServiceAreas: serviceAreas,
    serviceRadiusKm: serviceRadius,
    availabilityDays,
    workingHours,
    preferredShifts,
    governmentIdType: govIdType,
    governmentIdNumber: govIdNumber,
    governmentIdDocumentUrl: govIdUrl,
    backgroundCheckConsented: bgConsent,
    onboardingStep: currentStep,
    licenceVerificationStatus: verificationResult?.status || existingDriver?.licenceVerificationStatus,
    licenceVerificationBadge: verificationResult?.badge || existingDriver?.licenceVerificationBadge,
    licenceVerificationResult: verificationResult || existingDriver?.licenceVerificationResult,
    isSimulatedVerification: verificationResult ? verificationResult.isDemo : existingDriver?.isSimulatedVerification,
    verificationMode: verificationResult ? verificationResult.mode : (existingDriver?.verificationMode || verificationMode),
    capabilities: {
      manualTransmission: transmissions.includes('manual'),
      automaticTransmission: transmissions.includes('automatic'),
      petrolDiesel: fuelTypes.includes('petrol') || fuelTypes.includes('diesel'),
      evCertified: fuelTypes.includes('electric') && specialCapabilities['ev_charging'] === 'expert',
      smallCars: vehicleCategories.includes('hatchback'),
      sedans: vehicleCategories.includes('sedan'),
      suvs: vehicleCategories.includes('suv') || vehicleCategories.includes('compact_suv'),
      luxuryCars: vehicleCategories.includes('luxury'),
      languagesSpoken: langProficiencies.map((l) => l.language),
    },
  });

  const handleSaveDraft = (stepToGo?: number) => {
    const data = buildCurrentData();
    saveDriverOnboardingDraft(driverId, data, stepToGo || currentStep);
    setSaveToast('Draft saved successfully! You can resume anytime.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const validateStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 1) {
      if (!fullName.trim()) {
        setValidationError('Please enter your full legal name.');
        return false;
      }
      if (!email.trim() || !phone.trim()) {
        setValidationError('Email and mobile number are required.');
        return false;
      }
      if (!residentialAddress.trim()) {
        setValidationError('Residential address is required.');
        return false;
      }
    }

    if (step === 2) {
      if (!dlNumber.trim()) {
        setValidationError('Driving Licence Number is mandatory.');
        return false;
      }
      // Require verification check
      if (!verificationResult) {
        setValidationError('Please verify your Driving Licence using the "Verify Driving Licence" button before proceeding.');
        return false;
      }
      const isPassed = verificationResult.status === 'DEMO_PASSED' || verificationResult.status === 'LIVE_VERIFIED';
      if (!isPassed && !manualReviewRequested) {
        setValidationError(
          `Licence verification was not successful (${verificationResult.summary}). Please test with a valid licence, or click "Request Manual Admin Review" to proceed.`
        );
        return false;
      }
      if (!dlExpiryDate) {
        setValidationError('Licence expiry date is required.');
        return false;
      }
      if (!dlFrontPhoto || !dlBackPhoto) {
        setValidationError('Please upload both the front and back photos of your driving licence.');
        return false;
      }
    }

    if (step === 4) {
      if (transmissions.length === 0) {
        setValidationError('Select at least one transmission type (Manual or Automatic).');
        return false;
      }
      if (fuelTypes.length === 0) {
        setValidationError('Select at least one fuel type you are familiar with.');
        return false;
      }
    }

    if (step === 5) {
      if (langProficiencies.length === 0) {
        setValidationError('Please select at least one language you can communicate in.');
        return false;
      }
    }

    if (step === 6) {
      if (serviceAreas.length === 0) {
        setValidationError('Please select at least one preferred service area in your city.');
        return false;
      }
    }

    if (step === 7) {
      if (!bgConsent) {
        setValidationError('You must explicitly provide consent for background verification checks.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const nextStep = currentStep + 1;
    handleSaveDraft(nextStep);
    setCurrentStep(nextStep);
    router.push(`/driver/onboarding?step=${nextStep}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      handleSaveDraft(prevStep);
      setCurrentStep(prevStep);
      router.push(`/driver/onboarding?step=${prevStep}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!declarationAccepted) {
      setValidationError('You must confirm that the information and documents submitted are accurate.');
      return;
    }

    // Save final state
    handleSaveDraft(8);
    submitDriverOnboarding(driverId);

    // Redirect to Verification Status Page (Situation C)
    router.push('/driver/verification-status');
  };

  // Masked licence generator for privacy
  const getMaskedDL = (num: string) => {
    if (!num) return 'Not Provided';
    const clean = num.trim();
    if (clean.length < 8) return clean;
    return `${clean.slice(0, 5)}****${clean.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Save Later Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/30 text-brand-teal text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.wizardHeading || 'Professional Driver Onboarding Wizard'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stepTitles[currentStep - 1]}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.wizardSub}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSaveDraft()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-200/80 dark:border-slate-700"
          >
            <Save className="w-3.5 h-3.5 text-brand-teal" />
            <span>{t.saveDraftBtn || 'Save Draft & Continue Later'}</span>
          </button>

          <LanguageSelector variant="compact" />
        </div>
      </div>

      {/* Save Toast Notice */}
      {saveToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Progress Bar & Step Numbers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>{progressPercent}%</span>
          <span className="text-brand-teal">{stepTitles[currentStep - 1]}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Chips (Desktop) */}
        <div className="hidden md:grid grid-cols-8 gap-1 pt-1 text-[10px] font-bold text-center">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <button
                key={title}
                type="button"
                onClick={() => {
                  if (stepNum <= currentStep || validateStep(currentStep)) {
                    handleSaveDraft(stepNum);
                    setCurrentStep(stepNum);
                    router.push(`/driver/onboarding?step=${stepNum}`);
                  }
                }}
                className={`py-1.5 px-1 rounded-lg border transition-all truncate ${
                  isCurrent
                    ? 'border-brand-teal bg-brand-teal/10 text-brand-teal font-black'
                    : isCompleted
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
                title={title}
              >
                {stepNum}. {title.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* WIZARD STEPS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* ==================================================================== */}
        {/* STEP 1: PERSONAL INFORMATION */}
        {/* ==================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Let’s get to know you.
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your legal identity will be verified against your government records.
              </p>
            </div>

            {/* Profile Photo Upload / Preview / Replace */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Driver Profile Photograph
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-brand-teal shadow-md shrink-0">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <p className="text-slate-500">
                    A clear, professional front-facing photograph is shown to vehicle owners upon booking.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoUrl('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80')
                      }
                      className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:border-brand-teal flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Replace Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80')
                      }
                      className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:border-brand-teal"
                    >
                      Preset 2
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Legal Name (as on Driving Licence) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Birth (Eligibility Check) *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number (Active WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Residential Address *
                </label>
                <input
                  type="text"
                  required
                  value={residentialAddress}
                  onChange={(e) => setResidentialAddress(e.target.value)}
                  placeholder="House/Flat No, Street, Landmark"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Private & Secure: Residential address is never shared with customers.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Preferred Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.englishName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: DRIVING LICENCE DETAILS & VERIFICATION */}
        {/* ==================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Driving Licence Information & Verification.
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Mandatory step. Your licence details are verified against the Parivahan / Sarathi registry or local simulation engine.
              </p>
            </div>

            {/* DEMO MODE NOTIFICATION BANNER */}
            {verificationMode === 'demo' ? (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/70 dark:from-amber-950/40 dark:to-amber-900/30 border-2 border-amber-400 dark:border-amber-600 rounded-2xl flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 dark:text-amber-100 space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="font-black text-sm text-amber-900 dark:text-amber-200">
                      Demo Verification Mode Active
                    </strong>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      SIMULATED — NOT GOVERNMENT VERIFIED
                    </span>
                  </div>
                  <p className="leading-relaxed text-amber-900 dark:text-amber-200">
                    Demo Verification Mode is active. Select a test scenario below to preview the verification workflow without contacting government databases. No third-party API credentials or fees required.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl flex items-start gap-3 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                <div className="text-xs text-teal-950 dark:text-teal-200 space-y-1">
                  <strong className="block font-bold">Live Government Verification Provider:</strong>
                  <p>
                    Live mode queries the authorised HyperVerge / Parivahan government bridge. Official digital verification certificates are issued on clearance.
                  </p>
                </div>
              </div>
            )}

            {/* DEMO SCENARIO SELECTOR (Demo mode only) */}
            {verificationMode === 'demo' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Select Demo Test Scenario:
                  </label>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    5 Predefined Test Fixtures
                  </span>
                </div>
                <select
                  value={selectedScenario}
                  onChange={(e) => handleSelectScenario(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
                >
                  {DEMO_SCENARIOS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.id})
                    </option>
                  ))}
                </select>
                <div className="p-2.5 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>{DEMO_SCENARIOS.find((s) => s.id === selectedScenario)?.description}</span>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 ml-2">
                    Expected: {DEMO_SCENARIOS.find((s) => s.id === selectedScenario)?.expectedStatus}
                  </span>
                </div>
              </div>
            )}

            {/* Privacy Notice Box */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 rounded-2xl flex items-start gap-3">
              <Info className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                <strong className="block font-bold text-slate-800 dark:text-slate-200">
                  Privacy & Masked Identity:
                </strong>
                <p>
                  Urban Driver never exposes your full driving licence number on public passenger profiles. Customers only see a masked reference (e.g. {getMaskedDL(dlNumber || 'KA-03-2016-0098711')}).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Driving Licence Number *
                </label>
                <input
                  type="text"
                  required
                  value={dlNumber}
                  onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. KA-03-2016-0098711 or DEMO-VALID-001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Licence Issuing State *
                </label>
                <input
                  type="text"
                  required
                  value={issuingState}
                  onChange={(e) => setIssuingState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issuing RTO
                </label>
                <input
                  type="text"
                  value={issuingRto}
                  onChange={(e) => setIssuingRto(e.target.value)}
                  placeholder="e.g. KA-03 Indiranagar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dlIssueDate}
                    onChange={(e) => setDlIssueDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dlExpiryDate}
                    onChange={(e) => setDlExpiryDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Authorised Vehicle Classes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Authorised Vehicle Classes (as listed on licence)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {['LMV (Light Motor Vehicle)', 'MCWG (Motorcycle)', 'TRANS (Transport)', 'HGMV (Heavy)'].map((cls) => {
                  const selected = vehicleClasses.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        setVehicleClasses(
                          selected ? vehicleClasses.filter((c) => c !== cls) : [...vehicleClasses, cls]
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${
                        selected
                          ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate">{cls}</span>
                      {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================================================================= */}
            {/* DRIVING LICENCE VERIFICATION PANEL */}
            {/* ================================================================= */}
            <div className="p-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-teal/20 text-brand-teal flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Automated Licence Verification
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Query Parivahan / Sarathi registry records to authenticate identity and vehicle categories.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Mode: {verificationMode.toUpperCase()}
                </span>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verificationConsent}
                  onChange={(e) => setVerificationConsent(e.target.checked)}
                  className="w-4 h-4 text-brand-teal rounded mt-0.5 accent-brand-teal"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  I hereby consent to verify my driving licence details against simulated / official transport authority records for driver onboarding eligibility.
                </span>
              </label>

              {verificationError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-800 dark:text-rose-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{verificationError}</span>
                </div>
              )}

              {/* Verify Action Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleVerifyLicence}
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-6 py-3 bg-brand-teal hover:bg-brand-teal/90 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Querying National Transport Register...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>Verify Driving Licence</span>
                    </>
                  )}
                </button>

                {verificationResult && (
                  <button
                    type="button"
                    onClick={handleVerifyLicence}
                    disabled={isVerifying}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-Run Verification</span>
                  </button>
                )}
              </div>

              {/* VERIFICATION RESULT CARD */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-2xl border-2 space-y-4 animate-in fade-in transition-all ${
                    verificationResult.status === 'DEMO_PASSED' || verificationResult.status === 'LIVE_VERIFIED'
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600'
                      : verificationResult.status === 'DEMO_SERVICE_UNAVAILABLE' || verificationResult.status === 'LIVE_SERVICE_ERROR'
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-400 dark:border-rose-600'
                      : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600'
                  }`}
                >
                  {/* Result Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      {verificationResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          {verificationResult.summary}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Status Code: {verificationResult.status}
                        </span>
                      </div>
                    </div>

                    {/* Permanent Transparent Badge */}
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm self-start sm:self-center">
                      {verificationResult.badge}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {verificationResult.message}
                  </p>

                  {/* Matching Breakdown Table if details available */}
                  {verificationResult.details && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
                        Simulated Registry Comparison Report:
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Full Name Verification
                          </span>
                          <div className="flex items-center justify-between mt-1">
                            <div>
                              <span className="text-slate-500 text-[11px] block">Submitted: {verificationResult.details.submittedName}</span>
                              <strong className="text-slate-900 dark:text-white">Record: {verificationResult.details.holderName}</strong>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                verificationResult.details.nameMatch === 'matched'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {verificationResult.details.nameMatch}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Date of Birth Verification
                          </span>
                          <div className="flex items-center justify-between mt-1">
                            <div>
                              <span className="text-slate-500 text-[11px] block">Submitted: {verificationResult.details.submittedDob}</span>
                              <strong className="text-slate-900 dark:text-white">Record: {verificationResult.details.holderDob}</strong>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                verificationResult.details.dobMatch === 'matched'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {verificationResult.details.dobMatch}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Licence Validity Period
                          </span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-slate-900 dark:text-white font-mono font-bold">
                              {verificationResult.details.validFrom} to {verificationResult.details.validUntil}
                            </span>
                            {verificationResult.details.isExpired ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                Expired
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Active
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Authorised Vehicle Classes
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {verificationResult.details.vehicleClasses.map((cls) => (
                              <span
                                key={cls}
                                className="px-2 py-0.5 rounded bg-brand-teal/20 text-brand-teal text-[10px] font-bold"
                              >
                                {cls}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Retry Action for Gateway Error (Scenario 5) */}
                  {verificationResult.canRetry && (
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleVerifyLicence}
                        disabled={isVerifying}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Verification</span>
                      </button>
                      <span className="text-[11px] text-rose-700 dark:text-rose-300">
                        Temporary gateway timeout simulated. Click retry to query again.
                      </span>
                    </div>
                  )}

                  {/* Manual Review Submission Option if not passed */}
                  {!verificationResult.success && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          Manual Administrator Review
                        </span>
                        <p className="text-[11px] text-slate-500">
                          If automated verification failed, you can request an administrator to manually verify your uploaded documents.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setManualReviewRequested(!manualReviewRequested)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                          manualReviewRequested
                            ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {manualReviewRequested ? '✓ Manual Review Enabled' : 'Request Manual Admin Review'}
                      </button>
                    </div>
                  )}

                  {/* Permanent Disclaimer */}
                  <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200 dark:border-slate-700">
                    {verificationResult.disclaimer}
                  </div>
                </div>
              )}
            </div>

            {/* Front & Back Document Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-teal" />
                  <span>Front-Side Licence Photograph *</span>
                </span>
                <div className="h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group">
                  <img src={dlFrontPhoto} alt="DL Front" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                    <Camera className="w-4 h-4" /> Replace
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDlFrontPhoto('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80')
                  }
                  className="w-full py-1.5 bg-white dark:bg-slate-700 border rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300"
                >
                  Upload Front Side
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-teal" />
                  <span>Back-Side Licence Photograph *</span>
                </span>
                <div className="h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group">
                  <img src={dlBackPhoto} alt="DL Back" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                    <Camera className="w-4 h-4" /> Replace
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDlBackPhoto('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80')
                  }
                  className="w-full py-1.5 bg-white dark:bg-slate-700 border rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300"
                >
                  Upload Back Side
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: DRIVING EXPERIENCE */}
        {/* ==================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Tell us about your driving experience.
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your past professional driving history helps us match you with recurring assignments.
              </p>
            </div>

            {/* Experience Category Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Total Years of Driving Experience
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                {[
                  { label: 'Less than 1 yr', years: 1 },
                  { label: '1–3 years', years: 2 },
                  { label: '3–5 years', years: 4 },
                  { label: '5–10 years', years: 7 },
                  { label: 'More than 10 yrs', years: 12 },
                ].map((tier) => {
                  const selected =
                    tier.years === 1 && totalExpYears <= 1
                      ? true
                      : tier.years === 2 && totalExpYears > 1 && totalExpYears <= 3
                      ? true
                      : tier.years === 4 && totalExpYears > 3 && totalExpYears <= 5
                      ? true
                      : tier.years === 7 && totalExpYears > 5 && totalExpYears <= 10
                      ? true
                      : tier.years === 12 && totalExpYears > 10
                      ? true
                      : false;

                  return (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => {
                        setTotalExpYears(tier.years);
                        setProfExpYears(Math.max(1, tier.years - 1));
                      }}
                      className={`p-3 rounded-2xl border text-center font-bold transition-all ${
                        selected
                          ? 'border-brand-teal bg-brand-teal/10 text-brand-teal ring-2 ring-brand-teal/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tier.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Previous Professional Driving Experience (Chauffeur, Fleet, Corporate)
              </label>
              <textarea
                rows={3}
                value={prevExpDesc}
                onChange={(e) => setPrevExpDesc(e.target.value)}
                placeholder="Describe your driving background, past employers, or typical daily routes..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Preferred Assignments Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Preferred Driving Assignments
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  'Hospital Visits',
                  'Senior Assistance',
                  'Local City Errands',
                  'Airport Runs',
                  'Intercity / Outstation',
                  'Office Commutes',
                  'Night Shifts',
                  'Weekend Events',
                ].map((type) => {
                  const selected = preferredAssignments.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setPreferredAssignments(
                          selected
                            ? preferredAssignments.filter((a) => a !== type)
                            : [...preferredAssignments, type]
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${
                        selected
                          ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate">{type}</span>
                      {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 4: VEHICLE CAPABILITIES */}
        {/* ==================================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Which vehicles can you comfortably drive?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Crucial for vehicle-fit matching. We assign you only to compatible customer cars.
              </p>
            </div>

            {/* Transmission Types */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                1. Transmission Capabilities (Multiple selection) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { id: 'manual', label: 'Manual' },
                  { id: 'automatic', label: 'Automatic' },
                  { id: 'amt', label: 'AMT' },
                  { id: 'cvt', label: 'CVT' },
                  { id: 'dct', label: 'DCT' },
                ].map((t) => {
                  const selected = transmissions.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTransmissions(
                          selected ? transmissions.filter((x) => x !== t.id) : [...transmissions, t.id]
                        );
                      }}
                      className={`p-3 rounded-2xl border text-center font-bold transition-all ${
                        selected
                          ? 'border-brand-teal bg-brand-teal/10 text-brand-teal ring-2 ring-brand-teal/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fuel Types */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                2. Fuel-Type Familiarity *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {[
                  { id: 'petrol', label: 'Petrol' },
                  { id: 'diesel', label: 'Diesel' },
                  { id: 'cng', label: 'CNG' },
                  { id: 'hybrid', label: 'Hybrid' },
                  { id: 'electric', label: 'Electric (EV)' },
                ].map((f) => {
                  const selected = fuelTypes.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setFuelTypes(
                          selected ? fuelTypes.filter((x) => x !== f.id) : [...fuelTypes, f.id]
                        );
                      }}
                      className={`p-3 rounded-2xl border text-center font-bold transition-all ${
                        selected
                          ? 'border-brand-teal bg-brand-teal/10 text-brand-teal ring-2 ring-brand-teal/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Categories */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                3. Vehicle Categories
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'hatchback', label: 'Hatchback (i10, Swift)' },
                  { id: 'sedan', label: 'Sedan (City, Ciaz)' },
                  { id: 'compact_suv', label: 'Compact SUV (Creta, Nexon)' },
                  { id: 'suv', label: 'Large SUV (Fortuner, XUV)' },
                  { id: 'muv_mpv', label: 'MUV / MPV (Innova, Ertiga)' },
                  { id: 'luxury', label: 'Luxury (Mercedes, BMW)' },
                  { id: 'electric_cars', label: 'Electric Cars (EV)' },
                ].map((cat) => {
                  const selected = vehicleCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setVehicleCategories(
                          selected
                            ? vehicleCategories.filter((c) => c !== cat.id)
                            : [...vehicleCategories, cat.id]
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${
                        selected
                          ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specialized Driving Capabilities with Experience Level */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                4. Specialized Driving Capabilities & Experience Level
              </label>
              <div className="space-y-2 text-xs">
                {[
                  { key: 'ev_charging', label: 'Driving Electric Vehicles & EV Charging' },
                  { key: 'automatic_transmission', label: 'Automatic Transmission Smoothness' },
                  { key: 'highway_driving', label: 'Highway & Expressway Driving' },
                  { key: 'city_traffic', label: 'Dense Bengaluru City Traffic' },
                  { key: 'defensive_driving', label: 'Defensive Driving & Senior Ride Comfort' },
                  { key: 'night_driving', label: 'Night Driving' },
                ].map((item) => {
                  const currentLevel = specialCapabilities[item.key] || 'intermediate';
                  return (
                    <div
                      key={item.key}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {(['beginner', 'intermediate', 'expert'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() =>
                              setSpecialCapabilities({
                                ...specialCapabilities,
                                [item.key]: lvl,
                              })
                            }
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                              currentLevel === lvl
                                ? 'bg-brand-teal text-white shadow-xs'
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 5: LANGUAGES & CUSTOMER ASSISTANCE */}
        {/* ==================================================================== */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                How can you communicate with customers?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customer communication and senior-assistance capabilities for personalized matching.
              </p>
            </div>

            {/* Language Selection & Proficiency */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                1. Languages Spoken & Fluency Level *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const activeEntry = langProficiencies.find((p) => p.language === lang.englishName);
                  const isSelected = !!activeEntry;

                  return (
                    <div
                      key={lang.code}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-brand-teal bg-brand-teal/5'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLangProficiencies([
                                ...langProficiencies,
                                { language: lang.englishName, proficiency: 'conversational' },
                              ]);
                            } else {
                              setLangProficiencies(
                                langProficiencies.filter((p) => p.language !== lang.englishName)
                              );
                            }
                          }}
                          className="w-4 h-4 rounded text-brand-teal"
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {lang.nativeName} ({lang.englishName})
                        </span>
                      </label>

                      {isSelected && (
                        <select
                          value={activeEntry.proficiency}
                          onChange={(e) => {
                            setLangProficiencies(
                              langProficiencies.map((p) =>
                                p.language === lang.englishName
                                  ? { ...p, proficiency: e.target.value as any }
                                  : p
                              )
                            );
                          }}
                          className="text-[11px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 font-semibold"
                        >
                          <option value="fluent">Fluent</option>
                          <option value="conversational">Conversational</option>
                          <option value="basic">Basic understanding</option>
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Assistance Capabilities */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                2. Customer Assistance Preferences (Self-declared)
              </label>
              <div className="space-y-2 text-xs">
                {[
                  { key: 'assistingSeniors', label: 'Comfortable assisting senior citizens respectfully' },
                  { key: 'helpEnterExit', label: 'Able to help customers enter and exit vehicles within personal capability' },
                  { key: 'familyAssistedBookings', label: 'Comfortable with family-assisted remote bookings & status updates' },
                  { key: 'hospitalJourneys', label: 'Comfortable with hospital and doctor clinic visits' },
                  { key: 'airportJourneys', label: 'Comfortable with airport and luggage assistance' },
                  { key: 'recurringBookings', label: 'Open to regular recurring weekly trips with same family' },
                ].map((pref) => {
                  const isChecked = !!(customerAssistance as any)[pref.key];
                  return (
                    <label
                      key={pref.key}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setCustomerAssistance({
                            ...customerAssistance,
                            [pref.key]: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-brand-teal"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {pref.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 6: SERVICE AREA & AVAILABILITY */}
        {/* ==================================================================== */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Where and when would you like to work?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred Bengaluru hubs and working hours.
              </p>
            </div>

            {/* Service Areas */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Preferred Operating Service Areas in Bengaluru *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  'Indiranagar',
                  'Defence Colony',
                  'Koramangala',
                  'HSR Layout',
                  'Jayanagar',
                  'JP Nagar',
                  'Domlur',
                  'Whitefield',
                  'Malleshwaram',
                  'Hebbal',
                  'CBD / MG Road',
                  'Bannerghatta Road',
                ].map((area) => {
                  const selected = serviceAreas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => {
                        setServiceAreas(
                          selected ? serviceAreas.filter((a) => a !== area) : [...serviceAreas, area]
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${
                        selected
                          ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate">{area}</span>
                      {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Operating Radius & Working Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Operating Radius from Base Hub: {serviceRadius} km
                </label>
                <input
                  type="range"
                  min={5}
                  max={35}
                  step={5}
                  value={serviceRadius}
                  onChange={(e) => setServiceRadius(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-teal"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 km (Local)</span>
                  <span>20 km</span>
                  <span>35 km (All-City)</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Working Hours
                </label>
                <input
                  type="text"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="e.g. 08:00 AM - 08:00 PM"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            {/* Preferred Shifts */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Preferred Shift Windows
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {['Morning (06:00 - 14:00)', 'Afternoon (14:00 - 20:00)', 'Evening (18:00 - 23:00)', 'Full Day (08:00 - 20:00)'].map((shift) => {
                  const selected = preferredShifts.includes(shift.split(' ')[0]);
                  return (
                    <button
                      key={shift}
                      type="button"
                      onClick={() => {
                        const shiftKey = shift.split(' ')[0];
                        setPreferredShifts(
                          selected ? preferredShifts.filter((s) => s !== shiftKey) : [...preferredShifts, shiftKey]
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all flex items-center justify-between ${
                        selected
                          ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate">{shift}</span>
                      {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 7: SUPPORTING DOCUMENTS & VERIFICATION */}
        {/* ==================================================================== */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Let’s verify your profile.
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide government identity proof and explicit consent for safety background checks.
              </p>
            </div>

            {/* Verification Checklist Progress */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">
                Verification Document Checklist:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <strong className="block text-[11px]">Driving Licence</strong>
                    <span className="text-[10px] text-slate-400">Front & Back Uploaded</span>
                  </div>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <strong className="block text-[11px]">Profile Photograph</strong>
                    <span className="text-[10px] text-slate-400">Verified Photo</span>
                  </div>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${bgConsent ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <div>
                    <strong className="block text-[11px]">Background Consent</strong>
                    <span className="text-[10px] text-slate-400">{bgConsent ? 'Provided' : 'Pending'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Government ID Proof */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Government Identity Proof Type
                </label>
                <select
                  value={govIdType}
                  onChange={(e) => setGovIdType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="voter_id">Voter ID Card</option>
                  <option value="passport">Indian Passport</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Identity Document Number *
                </label>
                <input
                  type="text"
                  required
                  value={govIdNumber}
                  onChange={(e) => setGovIdNumber(e.target.value)}
                  placeholder="e.g. XXXX-XXXX-9021"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            {/* Explicit Background Consent Checkbox */}
            <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800 rounded-2xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={bgConsent}
                  onChange={(e) => setBgConsent(e.target.checked)}
                  className="w-5 h-5 rounded text-brand-teal mt-0.5"
                />
                <div className="text-xs text-teal-950 dark:text-teal-100">
                  <strong className="block font-bold mb-0.5">
                    Background Verification & Police Clearance Consent *
                  </strong>
                  <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                    I hereby give my explicit and informed consent to Urban Driver Technologies Pvt. Ltd. and its authorized verification partners to verify my driving licence validity, criminal record status, and identity records in accordance with applicable laws.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 8: REVIEW AND SUBMIT */}
        {/* ==================================================================== */}
        {currentStep === 8 && (
          <form onSubmit={handleSubmitOnboarding} className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Review your driver profile.
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please verify all submitted details before final submission to operations.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Section 1: Personal Info */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    1. Personal Information
                  </h3>
                  <div className="text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div><strong>Name:</strong> {fullName}</div>
                    <div><strong>Contact:</strong> {phone} • {email}</div>
                    <div><strong>Address:</strong> {residentialAddress}, {city}, {state} - {pincode}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-brand-teal font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Section 2: Driving Licence */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      2. Driving Licence & Verification
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      {verificationResult?.badge || (verificationMode === 'demo' ? 'SIMULATED — NOT GOVERNMENT VERIFIED' : 'LIVE API')}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div><strong>Licence Number:</strong> <span className="font-mono font-bold text-brand-teal">{getMaskedDL(dlNumber)}</span></div>
                    <div><strong>Issuing State / RTO:</strong> {issuingState} ({issuingRto})</div>
                    <div><strong>Validity:</strong> Valid till {dlExpiryDate}</div>
                    <div><strong>Vehicle Classes:</strong> {vehicleClasses.join(', ')}</div>
                    <div>
                      <strong>Verification Status:</strong>{' '}
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {verificationResult?.status || 'DEMO_PASSED'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-brand-teal font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Section 3: Driving Experience */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    3. Driving Experience
                  </h3>
                  <div className="text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div><strong>Total Experience:</strong> {totalExpYears} Years ({profExpYears} Years Professional)</div>
                    <div><strong>Previous Background:</strong> {prevExpDesc}</div>
                    <div><strong>Preferred Assignments:</strong> {preferredAssignments.join(', ')}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-brand-teal font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Section 4: Vehicle Capabilities */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    4. Vehicle Capabilities
                  </h3>
                  <div className="text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div><strong>Transmissions:</strong> {transmissions.join(', ').toUpperCase()}</div>
                    <div><strong>Fuel Types:</strong> {fuelTypes.join(', ').toUpperCase()}</div>
                    <div><strong>Vehicle Categories:</strong> {vehicleCategories.join(', ')}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs text-brand-teal font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Section 5: Languages & Assistance */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    5. Languages & Customer Assistance
                  </h3>
                  <div className="text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div><strong>Languages:</strong> {langProficiencies.map((l) => `${l.language} (${l.proficiency})`).join(', ')}</div>
                    <div>
                      <strong>Senior Assistance:</strong>{' '}
                      {customerAssistance.assistingSeniors ? 'Yes (Comfortable assisting elderly passengers)' : 'Standard'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="text-xs text-brand-teal font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Section 6: Service Area & Availability */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                    6. Service Area & Availability
                  </h3>
                  <div className="text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div><strong>City & Areas:</strong> {preferredCity} ({serviceAreas.join(', ')})</div>
                    <div><strong>Radius:</strong> {serviceRadius} km from base</div>
                    <div><strong>Hours:</strong> {workingHours} ({preferredShifts.join(', ')})</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="text-xs text-brand-teal font-bold hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Mandatory Confirmation Declaration */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-2xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 mt-0.5"
                />
                <div className="text-xs text-emerald-950 dark:text-emerald-100">
                  <strong className="block font-bold mb-0.5">
                    {t.selfDeclarationLabel} *
                  </strong>
                  <p className="leading-relaxed">
                    “{t.declarationBody}”
                  </p>
                </div>
              </label>
            </div>

            {/* Final Submission Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-base shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{t.submitApplicationBtn || 'Submit for Verification'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Wizard Navigation Bar (Prev / Next) */}
        {currentStep < 8 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handlePrev}
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.previousStep || 'Previous Step'}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-7 py-3 rounded-xl bg-brand-teal hover:bg-brand-tealDark text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-teal/20 transition-all hover:scale-[1.02]"
            >
              <span>{t.nextStep || 'Next Step'}: {stepTitles[currentStep]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function DriverOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center">Loading onboarding wizard...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
