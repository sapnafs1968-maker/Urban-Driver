'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import {
  PhoneCall,
  MessageCircle,
  X,
  CheckCircle2,
} from 'lucide-react';

interface AssistedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssistedBookingModal: React.FC<AssistedBookingModalProps> = ({ isOpen, onClose }) => {
  const { createAssistedRequest, currentUser, vehicles, language } = useApp();
  const t = getTranslation(language);

  const [callerName, setCallerName] = useState(currentUser?.name || '');
  const [callerPhone, setCallerPhone] = useState(currentUser?.phone || '');
  const [pickupArea, setPickupArea] = useState('Indiranagar, Bengaluru');
  const [destinationArea, setDestinationArea] = useState('Manipal Hospital, Old Airport Road');
  const [preferredDate, setPreferredDate] = useState('2026-11-20');
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [vehicleType, setVehicleType] = useState(
    vehicles[0] ? `${vehicles[0].make} ${vehicles[0].model} (${vehicles[0].transmission})` : 'Sedan (Automatic)'
  );
  const [notes, setNotes] = useState('Need assistance from parking to hospital reception.');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAssistedRequest({
      callerName,
      callerPhone,
      pickupArea,
      destinationArea,
      preferredDate,
      preferredTime,
      vehicleType,
      channel: 'phone',
      operatorNotes: notes,
    });
    setSubmitted(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Urban Driver Concierge, I would like to book a verified driver for my car.\nName: ${callerName}\nPhone: ${callerPhone}\nPickup: ${pickupArea}\nDestination: ${destinationArea}\nTime: ${preferredDate} at ${preferredTime}\nVehicle: ${vehicleType}`
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90dvh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">

        {/* Header */}
        <div className="bg-brand-navy text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal flex items-center justify-center text-white">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t.assistedTitle || 'Assisted Driver Booking'}</h3>
              <p className="text-xs text-slate-300">
                {t.assistedSub || 'Phone helpline & WhatsApp booking desk'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            aria-label={t.close || 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                {t.assistedDispatchedTitle || 'Assisted Booking Request Dispatched!'}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                {t.assistedDispatchedDesc ||
                  `Our Urban Driver operations controller will call you at ${callerPhone} within 10 minutes to verify your car details and assign your driver.`}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="mt-4 px-6 py-2.5 bg-brand-teal text-white font-bold rounded-xl text-sm"
              >
                {t.close || 'Done'}
              </button>
            </div>
          ) : (
            <>
              {/* Quick Contact Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:18005550199"
                  className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm hover:scale-[1.02] transition-transform"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{t.callSupport}: 1800 555 0199</span>
                </a>

                <a
                  href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-700 rounded-xl flex items-center justify-center gap-2 text-green-800 dark:text-green-300 font-bold text-sm hover:scale-[1.02] transition-transform"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t.assistedBookWhatsApp || 'Book via WhatsApp'}</span>
                </a>
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 uppercase font-semibold absolute">
                  {t.or || 'or'} {t.assistedSubmitBtn || 'Request a Callback'}
                </span>
              </div>

              {/* Callback Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      {t.fullNameLabel || 'Your Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={callerName}
                      onChange={(e) => setCallerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      {t.phoneLabel || 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={callerPhone}
                      onChange={(e) => setCallerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      {t.pickupLocation || 'Pickup Area'}
                    </label>
                    <input
                      type="text"
                      required
                      value={pickupArea}
                      onChange={(e) => setPickupArea(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      {t.destinationLocation || 'Destination'}
                    </label>
                    <input
                      type="text"
                      required
                      value={destinationArea}
                      onChange={(e) => setDestinationArea(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t.myVehicles || 'Vehicle Type'} & {t.transmissionMatch || 'Transmission'}
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    {t.details || 'Special Instructions'}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-xl text-sm shadow-md transition-all"
                  >
                    {t.assistedSubmitBtn || 'Request Operator Callback'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
