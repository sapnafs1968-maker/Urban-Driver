'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { MapPin, Navigation, Compass, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface LocationPickerProps {
  label: string;
  value: string;
  onChange: (value: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

// Popular pilot hubs with coordinates
const POPULAR_HUBS = [
  { name: 'Defence Colony, Indiranagar', lat: 12.9784, lng: 77.6408 },
  { name: 'Manipal Hospital, Old Airport Road', lat: 12.9592, lng: 77.6534 },
  { name: 'Apollo Clinic, 100 Feet Road', lat: 12.9719, lng: 77.6412 },
  { name: '4th Block, Koramangala', lat: 12.9344, lng: 77.6256 },
  { name: 'Ragigudda Temple, Jayanagar 9th Block', lat: 12.9198, lng: 77.5922 },
  { name: 'Fortis Hospital, Bannerghatta Road', lat: 12.8938, lng: 77.5976 },
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter address or landmark...',
  className = '',
  required = false,
}) => {
  const { language } = useApp();
  const t = getTranslation(language);

  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedStatus, setDetectedStatus] = useState<string | null>(null);

  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setDetectedStatus('Geolocation is not supported by your browser.');
      setTimeout(() => setDetectedStatus(null), 4000);
      return;
    }

    setIsDetecting(true);
    setDetectedStatus(t.locationDetecting);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let resolvedAddress = `Current GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        try {
          const res = await fetch(
            `/api/geocode/reverse?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`
          );
          if (res.ok) {
            const json = await res.json();
            if (json.address) resolvedAddress = json.address;
          }
        } catch {
          // Keep coordinate fallback
        }
        setIsDetecting(false);
        onChange(resolvedAddress, { lat: latitude, lng: longitude });
        setDetectedStatus(t.locationDetected);
        setTimeout(() => setDetectedStatus(null), 3000);
      },
      (err) => {
        setIsDetecting(false);
        console.warn('Geolocation error:', err);
        const fallback = '6th Main, Defence Colony, Indiranagar, Bengaluru';
        onChange(fallback, { lat: 12.9784, lng: 77.6408 });
        setDetectedStatus(
          err?.code === 1
            ? 'Location permission denied — using default hub'
            : t.locationDetected
        );
        setTimeout(() => setDetectedStatus(null), 4000);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isDetecting}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-teal hover:text-brand-tealDark dark:text-brand-tealLight transition-colors"
        >
          {isDetecting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span>{isDetecting ? t.locationDetecting : t.useCurrentLocation}</span>
        </button>
      </div>

      <div className="relative">
        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all shadow-sm"
        />
      </div>

      {detectedStatus && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{detectedStatus}</span>
        </div>
      )}

      {/* Suggested Location Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {POPULAR_HUBS.slice(0, 3).map((hub) => (
          <button
            key={hub.name}
            type="button"
            onClick={() => onChange(hub.name, { lat: hub.lat, lng: hub.lng })}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-brand-teal hover:text-brand-teal transition-colors shadow-2xs"
          >
            + {hub.name.split(',')[0]}
          </button>
        ))}
      </div>
    </div>
  );
};
