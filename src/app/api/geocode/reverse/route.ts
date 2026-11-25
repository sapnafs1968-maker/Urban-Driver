import { NextRequest, NextResponse } from 'next/server';

interface NominatimAddress {
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  const lat = Number(latParam);
  const lng = Number(lngParam);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { success: false, error: 'Valid latitude and longitude are required.' },
      { status: 400 }
    );
  }

  const fallbackAddress = `Current GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat.toFixed(6)
    )}&lon=${encodeURIComponent(lng.toFixed(6))}&zoom=17&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'UrbanDriverApp/1.0 (https://github.com/sapnafs1968-maker/Urban-Driver)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(4500),
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        address: fallbackAddress,
        latitude: lat,
        longitude: lng,
        source: 'coordinates_fallback',
      });
    }

    const data = (await res.json()) as {
      display_name?: string;
      name?: string;
      address?: NominatimAddress;
    };

    const a = data.address;
    const parts = [
      data.name,
      a?.road,
      a?.neighbourhood || a?.suburb,
      a?.city || a?.town || a?.village || a?.state_district,
      a?.state,
    ]
      .filter((p): p is string => Boolean(p && p.trim()))
      .filter((p, idx, arr) => arr.indexOf(p) === idx);

    const formatted =
      parts.length >= 2
        ? parts.slice(0, 4).join(', ')
        : data.display_name || fallbackAddress;

    return NextResponse.json({
      success: true,
      address: formatted,
      latitude: lat,
      longitude: lng,
      source: 'nominatim',
    });
  } catch (err) {
    console.warn('[geocode/reverse] Reverse geocoding failed, returning coordinate fallback:', err);
    return NextResponse.json({
      success: true,
      address: fallbackAddress,
      latitude: lat,
      longitude: lng,
      source: 'coordinates_fallback',
    });
  }
}
