'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getTranslation } from '@/lib/i18n';
import {
  Users,
  ShieldCheck,
  Check,
  X,
  Plus,
  AlertTriangle,
  Lock,
  Mail,
  UserPlus,
} from 'lucide-react';

function CustomerFamilyPermissionsContent() {
  const {
    familyRelationships,
    updateFamilyPermissions,
    revokeFamilyRelationship,
    currentUser,
    language,
  } = useApp();
  const t = getTranslation(language);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRelation, setInviteRelation] = useState('Son');

  const myRelationships = familyRelationships.filter(
    (r) => r.customerId === currentUser?.id
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 text-brand-teal rounded-full text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>{t.familyCoordTitle}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.familyCoordSub}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t.familyCareSub}
          </p>
        </div>

        <button
          onClick={() => setInviteModalOpen(true)}
          className="px-5 py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-xl text-sm shadow flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.inviteFamilyMember}</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-300">
        <Lock className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 dark:text-white block font-bold">
            {t.zeroAutoAccessNotice.split(':')[0]}
          </strong>
          {t.zeroAutoAccessNotice}
        </div>
      </div>

      {/* Family Relationships List */}
      <div className="space-y-6">
        {myRelationships.map((rel) => {
          const isRevoked = rel.status === 'revoked';

          return (
            <div
              key={rel.id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm space-y-6 transition-all ${isRevoked
                ? 'border-slate-200 dark:border-slate-800 opacity-60'
                : 'border-slate-200 dark:border-slate-800'
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-brand-teal flex items-center justify-center font-bold text-lg">
                    {rel.relationshipTitle === 'Son' ? '👦' : '👩'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {rel.guardianName}
                      </h3>
                      <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                        {rel.relationshipTitle}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Status: <strong className={isRevoked ? 'text-rose-500' : 'text-emerald-500'}>{rel.status.toUpperCase()}</strong> • Linked since Jan 2026
                    </div>
                  </div>
                </div>

                {!isRevoked && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to revoke access for ${rel.guardianName}?`)) {
                        revokeFamilyRelationship(rel.id);
                      }
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900 self-start sm:self-auto transition-colors"
                  >
                    {t.revokePermissions}
                  </button>
                )}
              </div>

              {/* Granular Permission Toggles */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Permissions Granted:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                  {/* Can View Trips */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {t.permLiveTracking}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      disabled={isRevoked}
                      checked={rel.permissions.canViewTrips}
                      onChange={(e) =>
                        updateFamilyPermissions(rel.id, {
                          ...rel.permissions,
                          canViewTrips: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-brand-teal"
                    />
                  </div>

                  {/* Can Book Trips */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {t.permBookForCustomer}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      disabled={isRevoked}
                      checked={rel.permissions.canBookTrips}
                      onChange={(e) =>
                        updateFamilyPermissions(rel.id, {
                          ...rel.permissions,
                          canBookTrips: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-brand-teal"
                    />
                  </div>

                  {/* Can Make Payments */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {t.permPayments}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      disabled={isRevoked}
                      checked={rel.permissions.canMakePayments}
                      onChange={(e) =>
                        updateFamilyPermissions(rel.id, {
                          ...rel.permissions,
                          canMakePayments: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-brand-teal"
                    />
                  </div>

                  {/* Receive Alerts */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        Receive Arrival Alerts
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Instant SMS on safe arrival & delay
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      disabled={isRevoked}
                      checked={rel.permissions.canReceiveAlerts}
                      onChange={(e) =>
                        updateFamilyPermissions(rel.id, {
                          ...rel.permissions,
                          canReceiveAlerts: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-brand-teal"
                    />
                  </div>

                  {/* Contact Support */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        Contact Support Concierge
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Raise queries regarding my journeys
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      disabled={isRevoked}
                      checked={rel.permissions.canContactSupport}
                      onChange={(e) =>
                        updateFamilyPermissions(rel.id, {
                          ...rel.permissions,
                          canContactSupport: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-brand-teal"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Invite Family Guardian
            </h3>
            <p className="text-xs text-slate-500">
              Enter the email address of your family member. They will receive an invitation link and only gain access after your approval.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Invitation link dispatched to ${inviteEmail}.`);
                setInviteModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. vikram@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Relationship
                </label>
                <select
                  value={inviteRelation}
                  onChange={(e) => setInviteRelation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Caregiver">Caregiver</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-teal text-white font-bold rounded-xl shadow"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerFamilyPermissionsPage() {
  return (
    <AuthGuard allowedRoles={['customer', 'family_guardian']}>
      <CustomerFamilyPermissionsContent />
    </AuthGuard>
  );
}
