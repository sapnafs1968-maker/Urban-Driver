import { NextRequest, NextResponse } from 'next/server';
import { hasDriverActiveBooking, readDb, withDbLock, writeDb } from '@/lib/server/db';
import { Driver } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
  const availableOnly = searchParams.get('availableOnly') === 'true';

  const db = readDb();
  let drivers = db.drivers.map((d) => ({
    ...d,
    hasActiveBooking: hasDriverActiveBooking(db, d.id),
  }));

  if (verifiedOnly) {
    drivers = drivers.filter((d) => d.verificationStatus === 'verified');
  }
  if (availableOnly) {
    drivers = drivers.filter(
      (d) => d.verificationStatus === 'verified' && d.isAvailable && !d.hasActiveBooking
    );
  }

  return NextResponse.json({ success: true, data: drivers });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Driver>;
    if (!body.id && !body.userId) {
      return NextResponse.json(
        { success: false, error: 'Driver id or userId is required.' },
        { status: 400 }
      );
    }

    const saved = await withDbLock(() => {
      const db = readDb();
      const idx = db.drivers.findIndex(
        (d) => d.id === body.id || (body.userId && d.userId === body.userId)
      );

      if (idx >= 0) {
        const updated: Driver = {
          ...db.drivers[idx],
          ...body,
          capabilities: {
            ...db.drivers[idx].capabilities,
            ...(body.capabilities || {}),
          },
        };
        db.drivers[idx] = updated;
        writeDb(db);
        return updated;
      }

      const newDriver: Driver = {
        id: body.id || `drv_${Date.now()}`,
        userId: body.userId || `usr_drv_${Date.now()}`,
        name: body.name || 'New Driver',
        phone: body.phone || '',
        email: body.email || '',
        photoUrl:
          body.photoUrl ||
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        experienceYears: body.experienceYears ?? 0,
        serviceArea: body.serviceArea || 'Bengaluru',
        rating: body.rating ?? 0,
        totalTrips: body.totalTrips ?? 0,
        isAvailable: false, // Must be verified before becoming available for bookings
        currentActiveBookingId: null,
        verificationStatus: body.verificationStatus || 'not_started',
        backgroundCheckConsented: Boolean(body.backgroundCheckConsented),
        capabilities: body.capabilities || {
          manualTransmission: true,
          automaticTransmission: true,
          petrolDiesel: true,
          evCertified: false,
          smallCars: true,
          sedans: true,
          suvs: false,
          luxuryCars: false,
          languagesSpoken: ['English', 'Hindi'],
        },
        documents: body.documents || [],
        onboardingStatus: body.onboardingStatus || 'not_started',
        onboardingStep: body.onboardingStep || 1,
        registeredVehicle: body.registeredVehicle,
      };

      db.drivers = [newDriver, ...db.drivers];
      writeDb(db);
      return newDriver;
    });

    return NextResponse.json({ success: true, driver: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to register driver' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverId, ...updates } = body;
    if (!driverId) {
      return NextResponse.json(
        { success: false, error: 'driverId is required.' },
        { status: 400 }
      );
    }

    const result = await withDbLock(() => {
      const db = readDb();
      const idx = db.drivers.findIndex((d) => d.id === driverId || d.userId === driverId);
      if (idx === -1) return null;

      const driver = db.drivers[idx];
      const effectiveVerificationStatus = updates.verificationStatus || driver.verificationStatus;
      // Prevent driver from toggling themselves available while on an active ride
      if (updates.isAvailable === true && hasDriverActiveBooking(db, driver.id)) {
        return { error: 'Cannot mark driver available while an active ride is in progress.' };
      }
      if (updates.isAvailable === true && effectiveVerificationStatus !== 'verified') {
        return { error: 'Driver must complete verification before going online.' };
      }

      const updated: Driver = {
        ...driver,
        ...updates,
        capabilities: {
          ...driver.capabilities,
          ...(updates.capabilities || {}),
        },
      };
      db.drivers[idx] = updated;
      writeDb(db);
      return { driver: updated };
    });

    if (!result) {
      return NextResponse.json({ success: false, error: 'Driver not found.' }, { status: 404 });
    }
    if ('error' in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true, driver: result.driver });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update driver' },
      { status: 500 }
    );
  }
}
