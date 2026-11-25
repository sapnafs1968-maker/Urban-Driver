import { NextRequest, NextResponse } from 'next/server';
import { hasDriverActiveBooking, readDb, withDbLock, writeDb } from '@/lib/server/db';
import { TrustedDriver } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');

  const db = readDb();
  const entries = db.trustedDrivers.filter(
    (td) => td.trustedStatus === 'active' && (!customerId || td.customerId === customerId)
  );

  const enriched = entries
    .map((td) => {
      const driver = db.drivers.find((d) => d.id === td.driverId);
      if (!driver) return null;
      return {
        ...td,
        driver: {
          ...driver,
          hasActiveBooking: hasDriverActiveBooking(db, driver.id),
        },
      };
    })
    .filter(Boolean);

  return NextResponse.json({ success: true, data: enriched });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, driverId, isPrimary, isBackup } = body;

    if (!customerId || !driverId) {
      return NextResponse.json(
        { success: false, error: 'customerId and driverId are required.' },
        { status: 400 }
      );
    }

    const entry = await withDbLock(() => {
      const db = readDb();
      const existing = db.trustedDrivers.find(
        (td) => td.customerId === customerId && td.driverId === driverId
      );
      const now = new Date().toISOString();

      if (existing) {
        const updated: TrustedDriver = {
          ...existing,
          trustedStatus: 'active',
          isPrimary: isPrimary ?? existing.isPrimary,
          isBackup: isBackup ?? existing.isBackup,
        };
        db.trustedDrivers = db.trustedDrivers.map((td) =>
          td.id === existing.id ? updated : td
        );
        writeDb(db);
        return updated;
      }

      const hasPrimary = db.trustedDrivers.some(
        (td) => td.customerId === customerId && td.trustedStatus === 'active' && td.isPrimary
      );
      const newEntry: TrustedDriver = {
        id: `td_${customerId}_${driverId}`,
        customerId,
        driverId,
        completedTripsCount: 0,
        isPrimary: isPrimary ?? !hasPrimary,
        isBackup: isBackup ?? hasPrimary,
        trustedStatus: 'active',
        addedAt: now,
      };
      db.trustedDrivers = [newEntry, ...db.trustedDrivers];
      writeDb(db);
      return newEntry;
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to add trusted driver' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, driverId, role } = body as {
      customerId: string;
      driverId: string;
      role: 'primary' | 'backup';
    };

    if (!customerId || !driverId || !role) {
      return NextResponse.json(
        { success: false, error: 'customerId, driverId, and role are required.' },
        { status: 400 }
      );
    }

    const updatedList = await withDbLock(() => {
      const db = readDb();
      db.trustedDrivers = db.trustedDrivers.map((td) => {
        if (td.customerId !== customerId || td.trustedStatus !== 'active') return td;
        if (role === 'primary') {
          if (td.driverId === driverId) {
            return { ...td, isPrimary: true, isBackup: false };
          }
          // Demote previous primary to backup
          return td.isPrimary ? { ...td, isPrimary: false, isBackup: true } : td;
        } else {
          if (td.driverId === driverId) {
            return { ...td, isPrimary: false, isBackup: true };
          }
          return td;
        }
      });
      writeDb(db);
      return db.trustedDrivers.filter((td) => td.customerId === customerId);
    });

    return NextResponse.json({ success: true, data: updatedList });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update trusted driver role' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const driverId = searchParams.get('driverId');

    if (!customerId || !driverId) {
      return NextResponse.json(
        { success: false, error: 'customerId and driverId are required.' },
        { status: 400 }
      );
    }

    await withDbLock(() => {
      const db = readDb();
      db.trustedDrivers = db.trustedDrivers.map((td) =>
        td.customerId === customerId && td.driverId === driverId
          ? { ...td, trustedStatus: 'removed', isPrimary: false, isBackup: false }
          : td
      );
      writeDb(db);
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to remove trusted driver' },
      { status: 500 }
    );
  }
}
