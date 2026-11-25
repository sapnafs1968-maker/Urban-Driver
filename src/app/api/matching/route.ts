import { NextResponse } from 'next/server';
import { matchDriversForVehicle } from '@/lib/matching';
import { readDb } from '@/lib/server/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicle, trustedDriverIds, customerId } = body;

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle details required' }, { status: 400 });
    }

    const db = readDb();
    const activeTrustedIds =
      trustedDriverIds ||
      (customerId
        ? db.trustedDrivers
            .filter((td) => td.customerId === customerId && td.trustedStatus === 'active')
            .map((td) => td.driverId)
        : []);

    const matched = matchDriversForVehicle(db.drivers, vehicle, {
      trustedDriverIds: activeTrustedIds,
    });

    return NextResponse.json({
      success: true,
      data: matched,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
