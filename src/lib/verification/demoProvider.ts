import {
  LicenceVerificationProvider,
  LicenceVerificationRequest,
  LicenceVerificationResult,
  MatchResult,
} from './types';
import { DEMO_REGISTRY_RECORDS } from './fixtures';

export class DemoLicenceVerificationProvider implements LicenceVerificationProvider {
  readonly mode = 'demo' as const;

  async verify(request: LicenceVerificationRequest): Promise<LicenceVerificationResult> {
    const timestamp = new Date().toISOString();
    const cleanDl = (request.dlNumber || '').trim().toUpperCase();

    // Check consent requirement
    if (!request.consent) {
      return {
        success: false,
        status: 'DEMO_DETAILS_MISMATCH',
        mode: 'demo',
        isDemo: true,
        badge: 'SIMULATED — NOT GOVERNMENT VERIFIED',
        summary: 'Consent Required',
        message: 'Applicant consent is legally required before querying driving licence records.',
        timestamp,
        disclaimer:
          'Simulated Demonstration Sandbox: No government database is contacted. Results are for test/demo purposes only.',
      };
    }

    // SCENARIO 5: Service Outage / Gateway Failure (503)
    if (cleanDl === 'DEMO-ERROR-001' || cleanDl.includes('ERROR') || cleanDl.includes('TIMEOUT')) {
      return {
        success: false,
        status: 'DEMO_SERVICE_UNAVAILABLE',
        mode: 'demo',
        isDemo: true,
        badge: 'SIMULATED — NOT GOVERNMENT VERIFIED',
        summary: 'Transport Gateway Unavailable (HTTP 503)',
        message:
          'Simulated National Transport Register gateway timed out after 5000ms. The RTO server is currently unreachable. Please retry.',
        canRetry: true,
        timestamp,
        disclaimer:
          'Simulated Demonstration Sandbox: Demonstrating resilient error handling and retry workflows.',
      };
    }

    // SCENARIO 4: Licence Not Found
    if (cleanDl === 'DEMO-NOTFOUND-001' || cleanDl.includes('NOTFOUND')) {
      return {
        success: false,
        status: 'DEMO_RECORD_NOT_FOUND',
        mode: 'demo',
        isDemo: true,
        badge: 'SIMULATED — NOT GOVERNMENT VERIFIED',
        summary: 'Licence Record Not Found',
        message: `No record matching '${cleanDl}' was found in the simulated Parivahan/Sarathi registry. Please verify the licence number with your physical card.`,
        canRetry: false,
        timestamp,
        disclaimer:
          'Simulated Demonstration Sandbox: Demonstrating failed lookup handling without external fees.',
      };
    }

    // Look up in synthetic fixtures
    const record = DEMO_REGISTRY_RECORDS[cleanDl];

    if (record) {
      const nameMatch = this.checkNameMatch(request.fullName, record.holderName);
      const dobMatch: MatchResult =
        (request.dob || '').trim() === record.dob.trim() ? 'matched' : 'mismatch';

      // SCENARIO 2: Expired Licence
      if (cleanDl === 'DEMO-EXPIRED-001' || record.isExpired) {
        return {
          success: false,
          status: 'DEMO_EXPIRED',
          mode: 'demo',
          isDemo: true,
          badge: 'SIMULATED — NOT GOVERNMENT VERIFIED',
          summary: 'Driving Licence Expired',
          message: `The licence record exists in the simulated registry but expired on ${record.validUntil}. An active, non-expired licence is required for driver onboarding.`,
          details: {
            dlNumber: cleanDl,
            holderName: record.holderName,
            submittedName: request.fullName,
            nameMatch,
            holderDob: record.dob,
            submittedDob: request.dob,
            dobMatch,
            validFrom: record.validFrom,
            validUntil: record.validUntil,
            isExpired: true,
            vehicleClasses: record.vehicleClasses,
            issuingRto: record.issuingRto,
            issuingState: record.issuingState,
            fatherOrHusbandName: record.fatherOrHusbandName,
          },
          canRetry: false,
          timestamp,
          disclaimer:
            'Simulated Demonstration Sandbox: In demo mode, drivers are marked as simulated and ineligible for real trips.',
        };
      }

      // SCENARIO 3: Details Mismatch
      if (cleanDl === 'DEMO-MISMATCH-001' || nameMatch === 'mismatch' || dobMatch === 'mismatch') {
        const mismatchReasons: string[] = [];
        if (nameMatch === 'mismatch') {
          mismatchReasons.push(`Name submitted ('${request.fullName}') does not match registry record ('${record.holderName}')`);
        }
        if (dobMatch === 'mismatch') {
          mismatchReasons.push(`Date of Birth submitted ('${request.dob}') does not match registry record ('${record.dob}')`);
        }

        return {
          success: false,
          status: 'DEMO_DETAILS_MISMATCH',
          mode: 'demo',
          isDemo: true,
          badge: 'SIMULATED — NOT GOVERNMENT VERIFIED',
          summary: 'Applicant Details Mismatch',
          message:
            mismatchReasons.length > 0
              ? mismatchReasons.join('. ') + '.'
              : 'Submitted details do not match the simulated transport authority record.',
          details: {
            dlNumber: cleanDl,
            holderName: record.holderName,
            submittedName: request.fullName,
            nameMatch,
            holderDob: record.dob,
            submittedDob: request.dob,
            dobMatch,
            validFrom: record.validFrom,
            validUntil: record.validUntil,
            isExpired: record.isExpired,
            vehicleClasses: record.vehicleClasses,
            issuingRto: record.issuingRto,
            issuingState: record.issuingState,
            fatherOrHusbandName: record.fatherOrHusbandName,
          },
          canRetry: true,
          timestamp,
          disclaimer:
            'Simulated Demonstration Sandbox: Safety policy flags discrepancy for administrator review.',
        };
      }

      // SCENARIO 1: Valid Active Licence (DEMO-VALID-001)
      return {
        success: true,
        status: 'DEMO_PASSED',
        mode: 'demo',
        isDemo: true,
        badge: 'SIMULATED — NOT GOVERNMENT VERIFIED',
        summary: 'Simulated Verification Passed',
        message: 'Licence is active in the simulated registry. Name, date of birth, and vehicle categories verified successfully.',
        details: {
          dlNumber: cleanDl,
          holderName: record.holderName,
          submittedName: request.fullName,
          nameMatch: 'matched',
          holderDob: record.dob,
          submittedDob: request.dob,
          dobMatch: 'matched',
          validFrom: record.validFrom,
          validUntil: record.validUntil,
          isExpired: false,
          vehicleClasses: record.vehicleClasses,
          issuingRto: record.issuingRto,
          issuingState: record.issuingState,
          fatherOrHusbandName: record.fatherOrHusbandName,
        },
        canRetry: false,
        timestamp,
        disclaimer:
          'Simulated Demonstration Sandbox: This driver is marked DEMO_PASSED. Passing demo verification does not constitute legal government verification.',
      };
    }

    // Default fallback for custom entered DL numbers in demo mode:
    // Generate a valid simulated pass so users can test custom inputs too, while keeping it strictly flagged as simulated
    return {
      success: true,
      status: 'DEMO_PASSED',
      mode: 'demo',
      isDemo: true,
      badge: 'SIMULATED — NOT GOVERNMENT VERIFIED',
      summary: 'Simulated Verification Passed (Custom Input)',
      message: `Simulated record created for test number ${cleanDl}. Name and DOB matched synthetic record.`,
      details: {
        dlNumber: cleanDl,
        holderName: request.fullName || 'Test Driver',
        submittedName: request.fullName,
        nameMatch: 'matched',
        holderDob: request.dob || '1990-01-01',
        submittedDob: request.dob,
        dobMatch: 'matched',
        validFrom: '2019-01-01',
        validUntil: '2039-01-01',
        isExpired: false,
        vehicleClasses: ['LMV (Light Motor Vehicle)', 'MCWG (Motorcycle with Gear)'],
        issuingRto: request.issuingRto || 'KA-03 (Indiranagar)',
        issuingState: request.issuingState || 'Karnataka',
      },
      timestamp,
      disclaimer:
        'Simulated Demonstration Sandbox: This driver is marked DEMO_PASSED. Not eligible for commercial trips.',
    };
  }

  private checkNameMatch(submitted: string, recorded: string): MatchResult {
    const s = (submitted || '').toLowerCase().trim();
    const r = (recorded || '').toLowerCase().trim();

    if (!s || !r) return 'mismatch';
    if (s === r) return 'matched';

    // Check token overlap
    const sTokens = s.split(/\s+/).filter(Boolean);
    const rTokens = r.split(/\s+/).filter(Boolean);

    // If first and last name match
    if (sTokens.length >= 2 && rTokens.length >= 2) {
      if (sTokens[0] === rTokens[0] && sTokens[sTokens.length - 1] === rTokens[rTokens.length - 1]) {
        return 'matched';
      }
    }

    // If at least 2 tokens match
    const common = sTokens.filter((t) => rTokens.includes(t));
    if (common.length >= 2) return 'matched';

    return 'mismatch';
  }
}
