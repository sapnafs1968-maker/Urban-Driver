import { NextRequest, NextResponse } from 'next/server';
import { createBookingAtomic, readDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');
  const driverId = searchParams.get('driverId');

  const db = readDb();
  let list = db.bookings;
  if (customerId) {
    list = list.filter((b) => b.customerId === customerId);
  }
  if (driverId) {
    list = list.filter((b) => b.driverId === driverId);
  }

  return NextResponse.json({ success: true, data: list });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customerId || !body.pickupAddress || !body.destinationAddress || !body.vehicleId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required booking fields (customerId, vehicleId, pickupAddress, destinationAddress).',
        },
        { status: 400 }
      );
    }

    const result = await createBookingAtomic({
      clientRequestId: body.clientRequestId,
      customerId: body.customerId,
      customerName: body.customerName || 'Customer',
      customerPhone: body.customerPhone || '',
      bookedByGuardianId: body.bookedByGuardianId,
      bookedByGuardianName: body.bookedByGuardianName,
      requestedDriverId: body.requestedDriverId || body.driverId || 'auto_match',
      vehicleId: body.vehicleId,
      vehicleDetails: body.vehicleDetails || {
        make: 'Personal',
        model: 'Vehicle',
        registrationNumber: 'N/A',
        transmission: 'automatic',
        fuelType: 'petrol',
        isEv: false,
      },
      pickupAddress: body.pickupAddress,
      destinationAddress: body.destinationAddress,
      pickupLat: body.pickupLat,
      pickupLng: body.pickupLng,
      destLat: body.destLat,
      destLng: body.destLng,
      pickupDate: body.pickupDate || new Date().toISOString().split('T')[0],
      pickupTime: body.pickupTime || 'Now',
      expectedDurationHours: Number(body.expectedDurationHours) || 3,
      isRecurring: Boolean(body.isRecurring),
      recurringTitle: body.recurringTitle,
      paymentMethod: body.paymentMethod || 'razorpay',
      specialInstructions: body.specialInstructions,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: result.code,
          alternativeDrivers: result.alternativeDrivers || [],
        },
        { status: result.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        booking: result.booking,
        driver: result.driver,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
