import fs from 'fs';
import path from 'path';
import {
  Booking,
  BookingStatus,
  Driver,
  DriverPayout,
  DriverVehicle,
  PayoutStatus,
  SavedDestination,
  Trip,
  TrustedDriver,
  Vehicle,
} from '@/types';
import {
  INITIAL_BOOKINGS,
  INITIAL_DRIVER_PAYOUTS,
  INITIAL_DRIVERS,
  INITIAL_SAVED_DESTINATIONS,
  INITIAL_TRIPS,
  INITIAL_TRUSTED_DRIVERS,
  INITIAL_VEHICLES,
} from '@/lib/demo-data';

export const ACTIVE_DRIVER_BOOKING_STATUSES: BookingStatus[] = [
  'driver_assigned',
  'confirmed',
  'driver_en_route',
  'driver_arrived',
  'trip_started',
];

export interface PricingConfig {
  baseHourlyRate: number;
  minHours: number;
  platformServiceFeePct: number;
  nightSurchargePct: number;
  cancellationFee: number;
}

export interface ServerDbState {
  drivers: Driver[];
  vehicles: Vehicle[];
  bookings: Booking[];
  trips: Trip[];
  driverPayouts: DriverPayout[];
  trustedDrivers: TrustedDriver[];
  savedDestinations: SavedDestination[];
  pricingConfig: PricingConfig;
  processedClientRequestIds: string[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'urban-driver-db.json');

// Async mutex to serialize critical sections and prevent race conditions
let lockQueue: Promise<void> = Promise.resolve();

export async function withDbLock<T>(fn: () => Promise<T> | T): Promise<T> {
  let release!: () => void;
  const next = new Promise<void>((resolve) => {
    release = resolve;
  });
  const prev = lockQueue;
  lockQueue = prev.then(() => next);
  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}

function getInitialDbState(): ServerDbState {
  return {
    drivers: JSON.parse(JSON.stringify(INITIAL_DRIVERS)),
    vehicles: JSON.parse(JSON.stringify(INITIAL_VEHICLES)),
    bookings: JSON.parse(JSON.stringify(INITIAL_BOOKINGS)),
    trips: JSON.parse(JSON.stringify(INITIAL_TRIPS)),
    driverPayouts: JSON.parse(JSON.stringify(INITIAL_DRIVER_PAYOUTS)),
    trustedDrivers: JSON.parse(JSON.stringify(INITIAL_TRUSTED_DRIVERS)),
    savedDestinations: JSON.parse(JSON.stringify(INITIAL_SAVED_DESTINATIONS)),
    pricingConfig: {
      baseHourlyRate: 150,
      minHours: 3,
      platformServiceFeePct: 12,
      nightSurchargePct: 20,
      cancellationFee: 100,
    },
    processedClientRequestIds: [],
  };
}

export function readDb(): ServerDbState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDbState();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as ServerDbState;
    return parsed;
  } catch (err) {
    console.error('Error reading DB file, falling back to initial state:', err);
    return getInitialDbState();
  }
}

export function writeDb(state: ServerDbState): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

export function hasDriverActiveBooking(db: ServerDbState, driverId: string): boolean {
  const driver = db.drivers.find((d) => d.id === driverId);
  if (driver?.currentActiveBookingId) return true;
  return db.bookings.some(
    (b) => b.driverId === driverId && ACTIVE_DRIVER_BOOKING_STATUSES.includes(b.status)
  );
}

export function getAvailableVerifiedDrivers(db: ServerDbState): Driver[] {
  return db.drivers.filter(
    (d) =>
      d.verificationStatus === 'verified' &&
      d.isAvailable &&
      !hasDriverActiveBooking(db, d.id)
  );
}

export async function createBookingAtomic(payload: {
  clientRequestId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  bookedByGuardianId?: string;
  bookedByGuardianName?: string;
  requestedDriverId?: string; // specific driverId or 'auto_match'
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
}): Promise<{
  ok: boolean;
  status: number;
  booking?: Booking;
  driver?: Driver;
  error?: string;
  code?: string;
  alternativeDrivers?: Driver[];
}> {
  return withDbLock(() => {
    const db = readDb();

    // Idempotency check to prevent duplicate bookings on accidental double-taps
    if (
      payload.clientRequestId &&
      db.processedClientRequestIds.includes(payload.clientRequestId)
    ) {
      const existing = db.bookings.find((b) =>
        b.statusHistory.some((h) => h.note?.includes(payload.clientRequestId!))
      );
      if (existing) {
        const drv = db.drivers.find((d) => d.id === existing.driverId);
        return { ok: true, status: 200, booking: existing, driver: drv };
      }
    }

    const availableDrivers = getAvailableVerifiedDrivers(db);
    let assignedDriver: Driver | undefined;

    if (payload.requestedDriverId && payload.requestedDriverId !== 'auto_match') {
      const targetDriver = db.drivers.find((d) => d.id === payload.requestedDriverId);
      if (!targetDriver) {
        return {
          ok: false,
          status: 404,
          error: 'Requested driver not found.',
          code: 'DRIVER_NOT_FOUND',
          alternativeDrivers: availableDrivers,
        };
      }
      if (targetDriver.verificationStatus !== 'verified') {
        return {
          ok: false,
          status: 400,
          error: 'This driver has not completed verification and cannot accept bookings yet.',
          code: 'DRIVER_UNVERIFIED',
          alternativeDrivers: availableDrivers,
        };
      }
      if (hasDriverActiveBooking(db, targetDriver.id) || !targetDriver.isAvailable) {
        return {
          ok: false,
          status: 409,
          error: 'This driver is currently completing another ride.',
          code: 'DRIVER_BUSY',
          alternativeDrivers: availableDrivers,
        };
      }
      assignedDriver = targetDriver;
    } else {
      // Auto-match: prefer customer's active trusted drivers (primary first, then backup), then any available verified driver
      const customerTrusted = db.trustedDrivers.filter(
        (td) => td.customerId === payload.customerId && td.trustedStatus === 'active'
      );
      const primaryTd = customerTrusted.find((td) => td.isPrimary);
      const backupTds = customerTrusted.filter((td) => !td.isPrimary);

      if (primaryTd) {
        assignedDriver = availableDrivers.find((d) => d.id === primaryTd.driverId);
      }
      if (!assignedDriver && backupTds.length > 0) {
        for (const btd of backupTds) {
          const found = availableDrivers.find((d) => d.id === btd.driverId);
          if (found) {
            assignedDriver = found;
            break;
          }
        }
      }
      if (!assignedDriver) {
        assignedDriver = availableDrivers[0];
      }
    }

    if (!assignedDriver) {
      return {
        ok: false,
        status: 409,
        error: 'No verified drivers are currently available. Please try again shortly or request assistance.',
        code: 'NO_DRIVER_AVAILABLE',
        alternativeDrivers: [],
      };
    }

    // Calculate fare using configured pricing rules
    const hours = Math.max(db.pricingConfig.minHours, payload.expectedDurationHours || 3);
    const baseFare = db.pricingConfig.baseHourlyRate * Math.floor(hours);
    const durationFare =
      hours > db.pricingConfig.minHours
        ? Math.round((hours - db.pricingConfig.minHours) * 100)
        : 0;
    const platformFee = Math.round(
      (baseFare + durationFare) * (db.pricingConfig.platformServiceFeePct / 100)
    );
    const taxAmount = Math.round((baseFare + durationFare + platformFee) * 0.05);
    const totalFare = baseFare + durationFare + platformFee + taxAmount;

    const timestamp = new Date().toISOString();
    const code = `UBD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      bookingCode: code,
      customerId: payload.customerId,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      bookedByGuardianId: payload.bookedByGuardianId,
      bookedByGuardianName: payload.bookedByGuardianName,
      driverId: assignedDriver.id,
      driverName: assignedDriver.name,
      driverPhone: assignedDriver.phone,
      driverRating: assignedDriver.rating,
      driverPhotoUrl: assignedDriver.photoUrl,
      driverVehicle: assignedDriver.registeredVehicle,
      vehicleId: payload.vehicleId,
      vehicleDetails: payload.vehicleDetails,
      pickupAddress: payload.pickupAddress,
      destinationAddress: payload.destinationAddress,
      pickupLat: payload.pickupLat ?? 12.9784,
      pickupLng: payload.pickupLng ?? 77.6408,
      destLat: payload.destLat ?? 12.9592,
      destLng: payload.destLng ?? 77.6534,
      pickupDate: payload.pickupDate,
      pickupTime: payload.pickupTime,
      expectedDurationHours: hours,
      isRecurring: payload.isRecurring,
      recurringTitle: payload.recurringTitle,
      status: 'confirmed',
      preferredDriverId: assignedDriver.id,
      baseFare,
      durationFare,
      platformFee,
      taxAmount,
      totalFare,
      paymentStatus: payload.paymentMethod === 'cash' ? 'pending' : 'successful',
      paymentMethod: payload.paymentMethod || 'razorpay',
      specialInstructions: payload.specialInstructions,
      statusHistory: [
        {
          status: 'requested',
          timestamp,
          actor: payload.customerName,
          note: payload.clientRequestId
            ? `Booking requested (ref:${payload.clientRequestId})`
            : 'Booking requested',
        },
        {
          status: 'driver_assigned',
          timestamp,
          actor: 'Dispatch Engine',
          note: `Assigned to verified driver ${assignedDriver.name}`,
        },
        {
          status: 'confirmed',
          timestamp,
          actor: 'System',
          note: 'Driver locked for active ride',
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Lock the driver atomically
    db.drivers = db.drivers.map((d) =>
      d.id === assignedDriver!.id
        ? {
            ...d,
            isAvailable: false,
            currentActiveBookingId: newBooking.id,
          }
        : d
    );

    db.bookings = [newBooking, ...db.bookings];
    if (payload.clientRequestId) {
      db.processedClientRequestIds.push(payload.clientRequestId);
    }

    writeDb(db);

    const updatedDriver = db.drivers.find((d) => d.id === assignedDriver!.id);
    return { ok: true, status: 201, booking: newBooking, driver: updatedDriver };
  });
}

export async function updateBookingStatusAtomic(
  bookingId: string,
  newStatus: BookingStatus,
  note?: string,
  actor?: string
): Promise<{
  ok: boolean;
  status: number;
  booking?: Booking;
  driver?: Driver;
  payout?: DriverPayout;
  trustedDrivers?: TrustedDriver[];
  error?: string;
}> {
  return withDbLock(() => {
    const db = readDb();
    const bookingIndex = db.bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) {
      return { ok: false, status: 404, error: 'Booking not found.' };
    }

    const booking = db.bookings[bookingIndex];
    const timestamp = new Date().toISOString();

    const updatedHistory = [
      ...booking.statusHistory,
      {
        status: newStatus,
        timestamp,
        note: note || `Status updated to ${newStatus.replace(/_/g, ' ')}`,
        actor: actor || 'System',
      },
    ];

    let arrivalConfirmation = booking.arrivalConfirmation;
    if (newStatus === 'trip_completed' || newStatus === 'arrival_confirmation_pending') {
      arrivalConfirmation = arrivalConfirmation || {
        tripCompletedAt: timestamp,
        reminderCount: 0,
        status: 'pending',
      };
    } else if (newStatus === 'closed') {
      arrivalConfirmation = {
        tripCompletedAt: arrivalConfirmation?.tripCompletedAt || timestamp,
        customerConfirmedAt: arrivalConfirmation?.customerConfirmedAt || timestamp,
        reminderCount: arrivalConfirmation?.reminderCount || 0,
        status: 'confirmed_by_customer',
      };
    }

    let createdOrExistingPayout: DriverPayout | undefined;
    let tripId = booking.tripId;

    // 1. Create/update Trip when ride starts
    if (newStatus === 'trip_started' && booking.driverId) {
      let trip = db.trips.find((t) => t.bookingId === booking.id);
      if (!trip) {
        trip = {
          id: `trp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          driverId: booking.driverId,
          customerId: booking.customerId,
          startTime: timestamp,
          finalFare: booking.totalFare,
          tripStatus: 'in_progress',
        };
        db.trips = [trip, ...db.trips];
      }
      tripId = trip.id;
    }

    // 2. Release driver and generate idempotent payout + Trusted Driver update on completion
    const isCompletionStatus =
      newStatus === 'trip_completed' ||
      newStatus === 'arrival_confirmation_pending' ||
      newStatus === 'closed';

    const isCancellationStatus = newStatus === 'cancelled' || newStatus === 'rejected';

    if ((isCompletionStatus || isCancellationStatus) && booking.driverId) {
      db.drivers = db.drivers.map((d) => {
        if (d.id === booking.driverId) {
          const shouldRelease =
            d.currentActiveBookingId === booking.id || !d.currentActiveBookingId;
          return {
            ...d,
            isAvailable: shouldRelease ? true : d.isAvailable,
            currentActiveBookingId:
              d.currentActiveBookingId === booking.id ? null : d.currentActiveBookingId,
          };
        }
        return d;
      });
    }

    if (isCompletionStatus && booking.driverId) {
      // Ensure Trip exists and mark completed
      let trip = db.trips.find((t) => t.bookingId === booking.id);
      if (!trip) {
        trip = {
          id: `trp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          driverId: booking.driverId,
          customerId: booking.customerId,
          startTime: booking.createdAt,
          completionTime: timestamp,
          finalFare: booking.totalFare,
          tripStatus: 'completed',
        };
        db.trips = [trip, ...db.trips];
      } else {
        trip = {
          ...trip,
          completionTime: trip.completionTime || timestamp,
          tripStatus: 'completed',
        };
        db.trips = db.trips.map((t) => (t.id === trip!.id ? trip! : t));
      }
      tripId = trip.id;

      // Prevent duplicate DriverPayout for the same trip/booking
      const existingPayout = db.driverPayouts.find(
        (p) => p.bookingId === booking.id || p.tripId === trip!.id
      );
      if (existingPayout) {
        createdOrExistingPayout = existingPayout;
      } else {
        // Formula: Driver Net Payout = Total Trip Fare - Platform Commission - Applicable Deductions
        const platformCommission =
          booking.platformFee ??
          Math.round(
            (booking.baseFare + booking.durationFare) *
              (db.pricingConfig.platformServiceFeePct / 100)
          );
        const deductions = booking.taxAmount ?? 0;
        const netPayout = Math.max(0, booking.totalFare - platformCommission - deductions);

        const newPayout: DriverPayout = {
          id: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          driverId: booking.driverId,
          tripId: trip.id,
          bookingId: booking.id,
          bookingCode: booking.bookingCode,
          customerId: booking.customerId,
          customerName: booking.customerName,
          pickupAddress: booking.pickupAddress,
          destinationAddress: booking.destinationAddress,
          tripDate: booking.pickupDate,
          tripTime: booking.pickupTime,
          totalFare: booking.totalFare,
          platformCommission,
          deductions,
          netPayout,
          payoutStatus: 'Pending', // No live payout gateway configured -> Pending
          createdAt: timestamp,
        };
        db.driverPayouts = [newPayout, ...db.driverPayouts];
        createdOrExistingPayout = newPayout;

        // Increment driver totalTrips only once (when payout/completion first recorded)
        db.drivers = db.drivers.map((d) =>
          d.id === booking.driverId ? { ...d, totalTrips: d.totalTrips + 1 } : d
        );

        // Automatically update Customer's Trusted Driver Circle
        const existingTrusted = db.trustedDrivers.find(
          (td) =>
            td.customerId === booking.customerId && td.driverId === booking.driverId
        );
        if (existingTrusted) {
          db.trustedDrivers = db.trustedDrivers.map((td) =>
            td.id === existingTrusted.id
              ? {
                  ...td,
                  completedTripsCount: td.completedTripsCount + 1,
                  lastTripAt: timestamp,
                }
              : td
          );
        } else {
          const customerHasPrimary = db.trustedDrivers.some(
            (td) =>
              td.customerId === booking.customerId &&
              td.trustedStatus === 'active' &&
              td.isPrimary
          );
          const newTrusted: TrustedDriver = {
            id: `td_${booking.customerId}_${booking.driverId}`,
            customerId: booking.customerId,
            driverId: booking.driverId,
            completedTripsCount: 1,
            isPrimary: !customerHasPrimary,
            isBackup: customerHasPrimary,
            trustedStatus: 'active',
            addedAt: timestamp,
            lastTripAt: timestamp,
          };
          db.trustedDrivers = [newTrusted, ...db.trustedDrivers];
        }
      }
    }

    if (isCancellationStatus && booking.driverId) {
      db.trips = db.trips.map((t) =>
        t.bookingId === booking.id ? { ...t, tripStatus: 'cancelled' } : t
      );
    }

    const updatedBooking: Booking = {
      ...booking,
      status: newStatus,
      statusHistory: updatedHistory,
      arrivalConfirmation,
      tripId,
      payoutId: createdOrExistingPayout?.id || booking.payoutId,
      updatedAt: timestamp,
    };

    db.bookings[bookingIndex] = updatedBooking;
    writeDb(db);

    const updatedDriver = db.drivers.find((d) => d.id === booking.driverId);
    return {
      ok: true,
      status: 200,
      booking: updatedBooking,
      driver: updatedDriver,
      payout: createdOrExistingPayout,
      trustedDrivers: db.trustedDrivers.filter((td) => td.customerId === booking.customerId),
    };
  });
}

export async function updatePayoutStatusAtomic(
  payoutId: string,
  payoutStatus: PayoutStatus,
  paymentReference?: string
): Promise<DriverPayout | null> {
  return withDbLock(() => {
    const db = readDb();
    const idx = db.driverPayouts.findIndex((p) => p.id === payoutId);
    if (idx === -1) return null;
    const updated: DriverPayout = {
      ...db.driverPayouts[idx],
      payoutStatus,
      paymentReference: paymentReference || db.driverPayouts[idx].paymentReference,
      paidAt: payoutStatus === 'Paid' ? new Date().toISOString() : db.driverPayouts[idx].paidAt,
    };
    db.driverPayouts[idx] = updated;
    writeDb(db);
    return updated;
  });
}
