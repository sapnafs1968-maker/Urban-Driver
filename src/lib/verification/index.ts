import { LicenceVerificationProvider, VerificationMode } from './types';
import { DemoLicenceVerificationProvider } from './demoProvider';
import { HyperVergeLicenceVerificationProvider } from './hypervergeProvider';

export * from './types';
export * from './fixtures';
export * from './demoProvider';
export * from './hypervergeProvider';

/**
 * Returns the active verification mode based on DL_VERIFICATION_MODE env var.
 * Defaults safely to 'demo'.
 */
export function getVerificationMode(): VerificationMode {
  const envMode = (
    process.env.DL_VERIFICATION_MODE ||
    process.env.NEXT_PUBLIC_DL_VERIFICATION_MODE ||
    'demo'
  ).toLowerCase().trim();

  return envMode === 'live' ? 'live' : 'demo';
}

/**
 * Provider factory that instantiates either Demo or HyperVerge provider.
 */
export function getVerificationProvider(mode?: VerificationMode): LicenceVerificationProvider {
  const activeMode = mode || getVerificationMode();

  if (activeMode === 'live') {
    return new HyperVergeLicenceVerificationProvider();
  }

  return new DemoLicenceVerificationProvider();
}
