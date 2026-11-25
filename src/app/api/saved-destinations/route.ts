import { NextRequest, NextResponse } from 'next/server';
import { readDb, withDbLock, writeDb } from '@/lib/server/db';
import { SavedDestination } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');

  const db = readDb();
  const list = customerId
    ? db.savedDestinations.filter((d) => d.customerId === customerId)
    : db.savedDestinations;

  return NextResponse.json({ success: true, data: list });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, name, category, address, latitude, longitude, icon } = body;

    if (!customerId || !name || !address) {
      return NextResponse.json(
        { success: false, error: 'customerId, name, and address are required.' },
        { status: 400 }
      );
    }

    const created = await withDbLock(() => {
      const db = readDb();
      const dest: SavedDestination = {
        id: `dest_${Date.now()}`,
        customerId,
        name: name.trim(),
        category: category || 'General',
        address: address.trim(),
        latitude: Number(latitude) || 12.9716,
        longitude: Number(longitude) || 77.5946,
        icon: icon || '📍',
        createdAt: new Date().toISOString(),
      };
      db.savedDestinations = [...db.savedDestinations, dest];
      writeDb(db);
      return dest;
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save destination' },
      { status: 500 }
    );
  }
}
