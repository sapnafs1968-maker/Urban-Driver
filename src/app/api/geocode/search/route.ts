import { NextRequest, NextResponse } from 'next/server';

interface NominatimSearchItem {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    state?: string;
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') || '').trim();
  const category = (searchParams.get('category') || '').trim();
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  const searchTerm = [query, category].filter(Boolean).join(' ').trim();
  if (!searchTerm || searchTerm.length < 2) {
    return NextResponse.json(
      { success: false, error: 'Please enter at least 2 characters to search.' },
      { status: 400 }
    );
  }

  const lat = latParam ? Number(latParam) : NaN;
  const lng = lngParam ? Number(lngParam) : NaN;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  try {
    const params = new URLSearchParams({
      q: searchTerm,
      format: 'jsonv2',
      addressdetails: '1',
      limit: '8',
      countrycodes: 'in',
    });

    if (hasCoords) {
      // Bias results around a ~0.25 deg box (~25km) without hard-excluding wider city matches
      const delta = 0.25;
      params.set(
        'viewbox',
        `${(lng - delta).toFixed(4)},${(lat + delta).toFixed(4)},${(lng + delta).toFixed(4)},${(lat - delta).toFixed(4)}`
      );
    }

    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        'User-Agent': 'UrbanDriverApp/1.0 (https://github.com/sapnafs1968-maker/Urban-Driver)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        results: [],
        source: 'provider_unavailable',
        message: 'Location search provider is temporarily busy. You can enter the address manually.',
      });
    }

    const items = (await res.json()) as NominatimSearchItem[];
    const results = items.map((item) => {
      const a = item.address;
      const shortTitle =
        item.name ||
        item.display_name.split(',')[0]?.trim() ||
        'Selected Location';
      const subtitleParts = [
        a?.road,
        a?.neighbourhood || a?.suburb,
        a?.city || a?.town,
        a?.state,
      ].filter((p): p is string => Boolean(p && p.trim()));

      return {
        id: String(item.place_id),
        name: shortTitle,
        address: item.display_name,
        shortAddress: subtitleParts.length > 0 ? subtitleParts.join(', ') : item.display_name,
        latitude: Number(item.lat),
        longitude: Number(item.lon),
        category: item.type || item.class || category || 'place',
      };
    });

    return NextResponse.json({
      success: true,
      results,
      source: 'nominatim',
    });
  } catch (err) {
    console.warn('[geocode/search] Search failed:', err);
    return NextResponse.json({
      success: true,
      results: [],
      source: 'provider_unavailable',
      message: 'Location search is temporarily unavailable. You can enter the address manually.',
    });
  }
}
