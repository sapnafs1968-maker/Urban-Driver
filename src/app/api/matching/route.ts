import { NextResponse } from 'next/server';
import { matchDriversForVehicle } from '@/lib/matching';
import { INITIAL_DRIVERS } from '@/lib/demo-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicle, trustedDriverIds } = body;

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle details required' }, { status: 400 });
    }

    const matched = matchDriversForVehicle(INITIAL_DRIVERS, vehicle, {
      trustedDriverIds,
    });

    return NextResponse.json({
      success: true,
      data: matched,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
