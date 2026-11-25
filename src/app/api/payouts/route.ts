import { NextRequest, NextResponse } from 'next/server';
import { getSafeErrorMessage, readDb, updatePayoutStatusAtomic } from '@/lib/server/db';
import { PayoutStatus } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get('driverId');

  const db = readDb();
  const payouts = driverId
    ? db.driverPayouts.filter((p) => p.driverId === driverId)
    : db.driverPayouts;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfToday - 7 * 24 * 60 * 60 * 1000;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  let todayEarnings = 0;
  let weeklyEarnings = 0;
  let monthlyEarnings = 0;
  let pendingPayouts = 0;
  let totalPaidEarnings = 0;

  for (const p of payouts) {
    const ts = new Date(p.createdAt).getTime();
    if (ts >= startOfToday) todayEarnings += p.netPayout;
    if (ts >= startOfWeek) weeklyEarnings += p.netPayout;
    if (ts >= startOfMonth) monthlyEarnings += p.netPayout;
    if (p.payoutStatus === 'Pending' || p.payoutStatus === 'Processing') {
      pendingPayouts += p.netPayout;
    }
    if (p.payoutStatus === 'Paid') {
      totalPaidEarnings += p.netPayout;
    }
  }

  return NextResponse.json({
    success: true,
    data: payouts,
    summary: {
      todayEarnings,
      weeklyEarnings,
      monthlyEarnings,
      totalCompletedTrips: payouts.length,
      pendingPayouts,
      totalPaidEarnings,
    },
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { payoutId, payoutStatus, paymentReference } = body as {
      payoutId: string;
      payoutStatus: PayoutStatus;
      paymentReference?: string;
    };

    if (!payoutId || !payoutStatus) {
      return NextResponse.json(
        { success: false, error: 'payoutId and payoutStatus are required.' },
        { status: 400 }
      );
    }

    const updated = await updatePayoutStatusAtomic(payoutId, payoutStatus, paymentReference);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Payout not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, payout: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(err, 'Failed to update payout') },
      { status: 500 }
    );
  }
}
