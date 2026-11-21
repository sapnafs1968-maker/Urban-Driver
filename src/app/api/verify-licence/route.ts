import { NextRequest, NextResponse } from 'next/server';
import {
  getVerificationMode,
  getVerificationProvider,
  DEMO_SCENARIOS,
  LicenceVerificationRequest,
} from '@/lib/verification';

export async function GET() {
  const mode = getVerificationMode();
  const hasLiveCredentials = Boolean(
    process.env.HYPERVERGE_APP_ID && process.env.HYPERVERGE_APP_KEY
  );

  return NextResponse.json({
    status: 'ok',
    mode,
    isDemo: mode === 'demo',
    hasLiveCredentials,
    badge: mode === 'demo' ? 'SIMULATED — NOT GOVERNMENT VERIFIED' : 'LIVE VERIFICATION ACTIVE',
    scenarios: DEMO_SCENARIOS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LicenceVerificationRequest;

    if (!body.dlNumber) {
      return NextResponse.json(
        {
          success: false,
          status: 'DEMO_RECORD_NOT_FOUND',
          message: 'Driving Licence Number is required.',
        },
        { status: 400 }
      );
    }

    if (!body.dob) {
      return NextResponse.json(
        {
          success: false,
          status: 'DEMO_DETAILS_MISMATCH',
          message: 'Date of Birth is required for verification.',
        },
        { status: 400 }
      );
    }

    if (!body.consent) {
      return NextResponse.json(
        {
          success: false,
          status: 'DEMO_DETAILS_MISMATCH',
          message: 'Applicant consent is required before performing driving licence verification.',
        },
        { status: 400 }
      );
    }

    const provider = getVerificationProvider();
    const result = await provider.verify(body);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error during licence verification:', err);
    return NextResponse.json(
      {
        success: false,
        status: 'DEMO_SERVICE_UNAVAILABLE',
        mode: getVerificationMode(),
        isDemo: true,
        badge: 'SIMULATED — NOT GOVERNMENT VERIFIED',
        summary: 'Internal Server Error',
        message: err?.message || 'Unexpected verification failure.',
        canRetry: true,
        timestamp: new Date().toISOString(),
        disclaimer: 'Simulated Demonstration Sandbox',
      },
      { status: 500 }
    );
  }
}
