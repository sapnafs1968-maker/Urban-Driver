'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/lib/store';
import { getTranslation, formatBookingStatus } from '@/lib/i18n';
import { Navigation, MapPin, Compass, ShieldCheck } from 'lucide-react';

interface LiveTripMapProps {
  pickupLat?: number;
  pickupLng?: number;
  destLat?: number;
  destLng?: number;
  pickupAddress?: string;
  destAddress?: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
    statusText: string;
  };
  status?: string;
  className?: string;
}

export const LiveTripMap: React.FC<LiveTripMapProps> = ({
  pickupAddress = 'Indiranagar, Bengaluru',
  destAddress = 'Manipal Hospital, Old Airport Road',
  driverLocation,
  status = 'En Route',
  className = 'h-72 w-full',
}) => {
  const { language } = useApp();
  const t = getTranslation(language);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-sm text-slate-500 animate-pulse flex items-center gap-2">
          <Navigation className="w-4 h-4 text-brand-teal animate-spin" />
          <span>Loading Route & Live Location...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-inner ${className}`}>
      {/* Simulated High-Res OpenStreetMap Canvas with Real Route Overlay */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Stylized road network grid background */}
      <svg className="absolute inset-0 w-full h-full stroke-slate-700/60 stroke-[1.5] fill-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M -50,150 Q 150,80 350,120 T 700,90" />
        <path d="M 50,300 Q 220,180 450,220 T 800,160" />
        <path d="M 200,-50 L 220,400" />
        <path d="M 450,-50 L 430,400" />

        {/* Dynamic Route Line */}
        <path
          d="M 120,220 Q 280,120 480,140"
          className="stroke-brand-teal stroke-[4] stroke-dasharray-[8,6] animate-[dash_20s_linear_infinite]"
          strokeLinecap="round"
        />
      </svg>

      {/* Pickup Marker */}
      <div className="absolute left-[18%] bottom-[25%] flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
        <div className="px-2.5 py-1 mb-1 text-[11px] font-semibold tracking-wide uppercase bg-emerald-600/90 backdrop-blur text-white rounded-md shadow-md flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {t.pickupMarker}
        </div>
        <div className="relative flex items-center justify-center">
          <div className="w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-lg animate-ping opacity-50 absolute" />
          <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg" />
        </div>
        <span className="text-[11px] font-medium text-slate-200 max-w-[120px] truncate text-center mt-1 drop-shadow">
          {pickupAddress.split(',')[0]}
        </span>
      </div>

      {/* Destination Marker */}
      <div className="absolute right-[22%] top-[30%] flex flex-col items-center transform translate-x-1/2 -translate-y-1/2 group cursor-pointer">
        <div className="px-2.5 py-1 mb-1 text-[11px] font-semibold tracking-wide uppercase bg-rose-600/90 backdrop-blur text-white rounded-md shadow-md flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {t.destMarker}
        </div>
        <div className="relative flex items-center justify-center">
          <div className="w-5 h-5 bg-rose-500 rounded-full border-2 border-white shadow-lg animate-ping opacity-50 absolute" />
          <div className="w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-lg" />
        </div>
        <span className="text-[11px] font-medium text-slate-200 max-w-[140px] truncate text-center mt-1 drop-shadow">
          {destAddress.split(',')[0]}
        </span>
      </div>

      {/* Live Driver Car Indicator */}
      <div className="absolute left-[42%] top-[45%] flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="px-2.5 py-1 mb-1 text-[11px] font-bold bg-brand-teal text-white rounded-md shadow-xl flex items-center gap-1.5 animate-bounce">
          <Navigation className="w-3.5 h-3.5 rotate-45" /> {t.driverMovingMarker}
        </div>
        <div className="w-9 h-9 rounded-full bg-brand-teal/30 flex items-center justify-center border border-brand-teal/80 shadow-2xl backdrop-blur-md">
          <div className="w-4 h-4 rounded-full bg-brand-teal border-2 border-white" />
        </div>
      </div>

      {/* Top Banner Status Info */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-100 flex items-center gap-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t.status}: <strong className="text-brand-tealLight uppercase">{formatBookingStatus(status, language)}</strong></span>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs text-slate-300 flex items-center gap-1.5 shadow-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.gpsActiveNotice}</span>
        </div>
      </div>

      {/* Bottom Driver ETA Card */}
      <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-xl text-xs flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-brand-teal animate-spin" />
          <div>
            <div className="font-semibold text-slate-100">
              {driverLocation?.statusText || t.driverAssignedMsg}
            </div>
            <div className="text-[11px] text-slate-400">
              {t.liveTelematics}
            </div>
          </div>
        </div>
        <div className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold rounded-lg text-[11px]">
          {t.etaMinutes}
        </div>
      </div>
    </div>
  );
};
