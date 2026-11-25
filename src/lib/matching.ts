import { Driver, Vehicle } from '@/types';

export interface MatchingResult {
  driver: Driver;
  isEligible: boolean;
  score: number; // 0 to 100
  matchReasons: string[];
  incompatibilityReasons: string[];
  isTrustedCircle: boolean;
}

/**
 * Transparent rule-based driver-matching engine.
 * Matches customer vehicle specifications & preferences with driver capabilities.
 * Strictly rule-based, deterministic, and auditable.
 */
export function matchDriversForVehicle(
  drivers: Driver[],
  vehicle: Vehicle,
  options?: {
    trustedDriverIds?: string[];
    requestedTime?: string;
    preferredArea?: string;
  }
): MatchingResult[] {
  const trustedSet = new Set(options?.trustedDriverIds || []);

  const results: MatchingResult[] = drivers.map((driver) => {
    const matchReasons: string[] = [];
    const incompatibilityReasons: string[] = [];
    let score = 50; // base score

    // 1. Verification status gate
    if (driver.verificationStatus !== 'verified') {
      incompatibilityReasons.push(`Driver verification status is "${driver.verificationStatus.replace('_', ' ')}" (Admin review pending)`);
    } else {
      matchReasons.push('Verified & background-cleared by Operations');
      score += 15;
    }

    // 2. Availability & Active Ride Lock
    if (driver.currentActiveBookingId) {
      incompatibilityReasons.push('Driver is currently completing another ride');
    } else if (!driver.isAvailable) {
      incompatibilityReasons.push('Driver currently offline / unavailable');
    } else {
      score += 10;
    }

    // 3. Transmission compatibility
    if (vehicle.transmission === 'manual') {
      if (!driver.capabilities.manualTransmission) {
        incompatibilityReasons.push('Driver is not certified for Manual Transmission');
      } else {
        matchReasons.push('Manual Transmission Certified');
        score += 10;
      }
    } else if (vehicle.transmission === 'automatic') {
      if (!driver.capabilities.automaticTransmission) {
        incompatibilityReasons.push('Driver not experienced with Automatic Transmission');
      } else {
        matchReasons.push('Automatic Transmission Expert');
        score += 10;
      }
    }

    // 4. EV / Fuel Type compatibility
    if (vehicle.isEv || vehicle.fuelType === 'electric') {
      if (!driver.capabilities.evCertified) {
        incompatibilityReasons.push('Vehicle is an EV, but driver lacks Electric Vehicle certification');
      } else {
        matchReasons.push('Certified Electric Vehicle (EV) Operator');
        score += 15;
      }
    } else {
      matchReasons.push(`${vehicle.fuelType.toUpperCase()} Engine Familiar`);
      score += 5;
    }

    // 5. Vehicle size compatibility
    if (vehicle.vehicleSize === 'suv' && !driver.capabilities.suvs) {
      incompatibilityReasons.push('Driver has not operated large SUVs');
    } else if (vehicle.vehicleSize === 'luxury' && !driver.capabilities.luxuryCars) {
      incompatibilityReasons.push('Driver has not cleared luxury segment clearance');
    } else {
      matchReasons.push(`${vehicle.vehicleSize.toUpperCase()} Segment Cleared`);
      score += 5;
    }

    // 6. Trusted Driver Circle boost
    const isTrusted = trustedSet.has(driver.id);
    if (isTrusted) {
      matchReasons.push('In Your Trusted Driver Circle (Previous 5★ Journey)');
      score += 25;
    }

    // 7. Rating boost
    if (driver.rating >= 4.8) {
      matchReasons.push(`Top-Tier Rated (${driver.rating.toFixed(1)} ★)`);
      score += 5;
    }

    const isEligible = incompatibilityReasons.length === 0;

    return {
      driver,
      isEligible,
      score: isEligible ? Math.min(100, score) : 0,
      matchReasons,
      incompatibilityReasons,
      isTrustedCircle: isTrusted,
    };
  });

  // Sort: Eligible first, then highest score, then rating
  return results.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    if (b.score !== a.score) return b.score - a.score;
    return b.driver.rating - a.driver.rating;
  });
}
