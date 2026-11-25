import { NextRequest, NextResponse } from 'next/server';
import { getSafeErrorMessage, readDb, withDbLock, writeDb } from '@/lib/server/db';
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
      { success: false, error: getSafeErrorMessage(err, 'Failed to save destination') },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, customerId, name, category, address, latitude, longitude, icon, isDefault } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Destination id is required.' }, { status: 400 });
    }

    const updated = await withDbLock(() => {
      const db = readDb();
      const idx = db.savedDestinations.findIndex((d) => d.id === id);
      if (idx < 0) return null;

      if (isDefault && customerId) {
        db.savedDestinations = db.savedDestinations.map((d) =>
          d.customerId === customerId ? { ...d, isDefault: d.id === id } : d
        );
      }

      const existing = db.savedDestinations[idx];
      const next: SavedDestination = {
        ...existing,
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(category !== undefined ? { category: String(category) } : {}),
        ...(address !== undefined ? { address: String(address).trim() } : {}),
        ...(latitude !== undefined ? { latitude: Number(latitude) } : {}),
        ...(longitude !== undefined ? { longitude: Number(longitude) } : {}),
        ...(icon !== undefined ? { icon: String(icon) } : {}),
        ...(isDefault !== undefined ? { isDefault: Boolean(isDefault) } : {}),
      };
      db.savedDestinations[idx] = next;
      writeDb(db);
      return next;
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Saved destination not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(err, 'Failed to update destination') },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Destination id is required.' }, { status: 400 });
    }

    const removed = await withDbLock(() => {
      const db = readDb();
      const before = db.savedDestinations.length;
      db.savedDestinations = db.savedDestinations.filter((d) => d.id !== id);
      if (db.savedDestinations.length === before) return false;
      writeDb(db);
      return true;
    });

    if (!removed) {
      return NextResponse.json({ success: false, error: 'Saved destination not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(err, 'Failed to delete destination') },
      { status: 500 }
    );
  }
}
