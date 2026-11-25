import { NextRequest, NextResponse } from 'next/server';
import { getSafeErrorMessage, updateBookingStatusAtomic } from '@/lib/server/db';
import { BookingStatus } from '@/types';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const bookingId = context.params.id;
    const body = await req.json();
    const status = body.status as BookingStatus;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Booking status is required.' },
        { status: 400 }
      );
    }

    const result = await updateBookingStatusAtomic(
      bookingId,
      status,
      body.note,
      body.actor
    );

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      driver: result.driver,
      payout: result.payout,
      trustedDrivers: result.trustedDrivers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(err, 'Failed to update booking') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const bookingId = context.params.id;
    const result = await updateBookingStatusAtomic(
      bookingId,
      'cancelled',
      'Booking cancelled by user; driver released.',
      'Customer'
    );

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      driver: result.driver,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(err, 'Failed to cancel booking') },
      { status: 500 }
    );
  }
}
