import { NextRequest, NextResponse } from 'next/server';
import { getSafeErrorMessage, readDb, withDbLock, writeDb } from '@/lib/server/db';
import { DriverVehicle } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get('driverId');
  const db = readDb();

  if (!driverId) {
    const all = db.drivers
      .filter((d) => Boolean(d.registeredVehicle))
      .map((d) => d.registeredVehicle);
    return NextResponse.json({ success: true, data: all });
  }

  const driver = db.drivers.find((d) => d.id === driverId || d.userId === driverId);
  if (!driver) {
    return NextResponse.json({ success: false, error: 'Driver not found.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    vehicle: driver.registeredVehicle || null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverId, registrationNumber, manufacturer, model, year, category, transmission, fuelType } = body;

    if (!driverId || !registrationNumber || !manufacturer || !model) {
      return NextResponse.json(
        { success: false, error: 'driverId, registrationNumber, manufacturer, and model are required.' },
        { status: 400 }
      );
    }

    const updatedVehicle = await withDbLock(() => {
      const db = readDb();
      const idx = db.drivers.findIndex((d) => d.id === driverId || d.userId === driverId);
      if (idx === -1) return null;

      const driver = db.drivers[idx];
      const vehicle: DriverVehicle = {
        id: driver.registeredVehicle?.id || `dveh_${driver.id}`,
        driverId: driver.id,
        registrationNumber: registrationNumber.trim().toUpperCase(),
        manufacturer: manufacturer.trim(),
        model: model.trim(),
        year: year ? Number(year) : undefined,
        category: category || 'Sedan',
        transmission: transmission || 'manual',
        fuelType: fuelType || 'petrol',
        verificationStatus: driver.registeredVehicle?.verificationStatus || 'pending',
        verifiedAt: driver.registeredVehicle?.verifiedAt,
      };

      db.drivers[idx] = { ...driver, registeredVehicle: vehicle };
      writeDb(db);
      return vehicle;
    });

    if (!updatedVehicle) {
      return NextResponse.json({ success: false, error: 'Driver not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, vehicle: updatedVehicle }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(err, 'Failed to save driver vehicle') },
      { status: 500 }
    );
  }
}
