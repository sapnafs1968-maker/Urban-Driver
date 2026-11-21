'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { getTranslation, formatVerificationStatus } from '@/lib/i18n';
import { AuthGuard } from '@/components/auth/AuthGuard';
import {
  FileText,
  ShieldCheck,
  Clock,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Lock,
} from 'lucide-react';

function DriverDocumentsContent() {
  const { currentUser, drivers, language } = useApp();
  const t = getTranslation(language);

  const currentDriver = (currentUser && drivers.find((d) => d.userId === currentUser.id)) || drivers[0];

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docType, setDocType] = useState<'driving_license' | 'aadhaar' | 'police_clearance'>('driving_license');
  const [docNumber, setDocNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2032-12-31');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.safetyTag}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.officialDocsTitle}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t.officialDocsSub}
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-5 py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-xl text-sm shadow flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{t.uploadDocBtn}</span>
        </button>
      </div>

      {/* Verification Rule Alert */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-300">
        <Lock className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 dark:text-white block font-bold">
            Audit-Grade Manual Review Standard
          </strong>
          Documents are never marked verified automatically upon upload. An Urban Driver operations safety officer manually validates credentials against national databases (Sarathi Parivahan & Police clearance) before clearance.
        </div>
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentDriver.documents.map((doc) => {
          const isVerified = doc.verificationStatus === 'verified';
          const isPending = doc.verificationStatus === 'pending_review';

          return (
            <div
              key={doc.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm space-y-4 ${isVerified
                ? 'border-slate-200 dark:border-slate-800'
                : 'border-amber-300 dark:border-amber-800'
                }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-brand-teal" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                    {doc.documentType.replace('_', ' ')}
                  </span>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${isVerified
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                >
                  {doc.verificationStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Document Number</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {doc.documentNumber || 'PENDING SUBMISSION'}
                  </span>
                </div>

                {doc.expiryDate && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Validity / Expiry</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">
                      Valid through {doc.expiryDate}
                    </span>
                  </div>
                )}

                {doc.reviewerNotes && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-[11px]">
                    <strong className="block text-slate-900 dark:text-white">Admin Review Note:</strong>
                    {doc.reviewerNotes}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <a
                  href={doc.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-teal hover:underline font-bold"
                >
                  View Uploaded Scan →
                </a>

                <span className="text-slate-400 text-[11px]">
                  Uploaded to Encrypted Vault
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Upload Document for Verification
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Document uploaded! Status set to "Pending Review". Awaiting Admin clearance.');
                setUploadModalOpen(false);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="driving_license">Driving License (DL)</option>
                  <option value="aadhaar">Aadhaar Card (Identity)</option>
                  <option value="police_clearance">Police Verification Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document / Certificate Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA-03-2016-0098711"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono uppercase text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-slate-600 dark:text-slate-300 font-semibold block">
                  Select PDF or Photo Scan
                </span>
                <span className="text-[10px] text-slate-400">Max size: 5MB</span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-teal text-white font-bold rounded-xl text-xs shadow"
                >
                  Submit for Operations Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DriverDocumentsPage() {
  return (
    <AuthGuard allowedRoles={['driver', 'admin']}>
      <DriverDocumentsContent />
    </AuthGuard>
  );
}
