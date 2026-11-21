import {
  LicenceVerificationProvider,
  LicenceVerificationRequest,
  LicenceVerificationResult,
} from './types';

export class HyperVergeLicenceVerificationProvider implements LicenceVerificationProvider {
  readonly mode = 'live' as const;

  async verify(request: LicenceVerificationRequest): Promise<LicenceVerificationResult> {
    const timestamp = new Date().toISOString();
    const appId = process.env.HYPERVERGE_APP_ID;
    const appKey = process.env.HYPERVERGE_APP_KEY;

    // Strict validation: In LIVE mode, NEVER fall back to simulated success if credentials are missing
    if (!appId || !appKey) {
      return {
        success: false,
        status: 'LIVE_CONFIG_ERROR',
        mode: 'live',
        isDemo: false,
        badge: 'LIVE MODE CONFIGURATION REQUIRED',
        summary: 'Missing Live Verification Credentials',
        message:
          'Live verification mode is enabled (DL_VERIFICATION_MODE=live), but the required credentials (HYPERVERGE_APP_ID and HYPERVERGE_APP_KEY) are not set in the environment variables. Please configure these variables in your deployment settings or switch back to DL_VERIFICATION_MODE=demo.',
        canRetry: false,
        timestamp,
        disclaimer:
          'Security Safeguard: Live mode strictly prohibits fallback to simulated data when credentials are absent.',
      };
    }

    try {
      // Structure ready for production HyperVerge IDV/DL API integration
      // Endpoint: https://ind.idv.hyperverge.co/v1/verifyId
      const payload = {
        idType: 'dl',
        idNumber: request.dlNumber,
        dob: request.dob,
        name: request.fullName,
        state: request.issuingState,
      };

      // In real integration, fetch from HyperVerge API:
      const response = await fetch('https://ind.idv.hyperverge.co/v1/verifyId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          appId: appId,
          appKey: appKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return {
          success: false,
          status: 'LIVE_SERVICE_ERROR',
          mode: 'live',
          isDemo: false,
          badge: 'GOVERNMENT VERIFICATION FAILED',
          summary: 'Government Registry Service Error',
          message:
            errJson?.message || `HyperVerge gateway returned error code ${response.status}.`,
          canRetry: true,
          timestamp,
          disclaimer: 'Official Verification Provider: Real-time query to Parivahan / Sarathi network.',
          rawResponse: errJson,
        };
      }

      const data = await response.json();
      const isVerified = data?.status === 'success' && data?.result?.isValid === true;

      return {
        success: isVerified,
        status: isVerified ? 'LIVE_VERIFIED' : 'LIVE_REJECTED',
        mode: 'live',
        isDemo: false,
        badge: isVerified
          ? 'GOVERNMENT VERIFIED VIA AUTHORISED API'
          : 'VERIFICATION REJECTED BY REGISTRY',
        summary: isVerified
          ? 'Government Driving Licence Verified'
          : 'Record Mismatch / Invalid Licence',
        message: isVerified
          ? 'Driving licence authenticated successfully against Ministry of Road Transport records.'
          : (data?.result?.message || 'Licence credentials could not be authenticated.'),
        details: {
          dlNumber: request.dlNumber,
          holderName: data?.result?.name || request.fullName,
          submittedName: request.fullName,
          nameMatch: data?.result?.nameMatchScore > 0.8 ? 'matched' : 'mismatch',
          holderDob: data?.result?.dob || request.dob,
          submittedDob: request.dob,
          dobMatch: data?.result?.dobMatch ? 'matched' : 'mismatch',
          validFrom: data?.result?.issueDate || '',
          validUntil: data?.result?.expiryDate || '',
          isExpired: data?.result?.isExpired ?? false,
          vehicleClasses: data?.result?.vehicleClasses || ['LMV'],
          issuingRto: data?.result?.rto || request.issuingRto || '',
          issuingState: data?.result?.state || request.issuingState || '',
        },
        timestamp,
        disclaimer: 'Live verification conducted via official HyperVerge Parivahan connector.',
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'LIVE_SERVICE_ERROR',
        mode: 'live',
        isDemo: false,
        badge: 'LIVE CONNECTION ERROR',
        summary: 'Network Connection Failure',
        message: `Failed to connect to verification gateway: ${err?.message || 'Unknown network error'}.`,
        canRetry: true,
        timestamp,
        disclaimer: 'Official Verification Provider.',
      };
    }
  }
}
