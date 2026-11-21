'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';
import { SupportTicket, SupportTicketStatus } from '@/types';
import { AuthGuard } from '@/components/auth/AuthGuard';
import {
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  UserCheck,
} from 'lucide-react';

function AdminSupportManagementContent() {
  const { supportTickets, addTicketMessage, updateTicketStatus, currentUser, language } = useApp();
  const t = getTranslation(language);

  const [activeTicketId, setActiveTicketId] = useState<string>(supportTickets[0]?.id || '');
  const [replyText, setReplyText] = useState('');

  const activeTicket = supportTickets.find((t) => t.id === activeTicketId) || supportTickets[0];

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    addTicketMessage(activeTicket.id, replyText, true);
    setReplyText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-bold mb-2">
          <LifeBuoy className="w-3.5 h-3.5" />
          <span>{t.adminSupport || 'Operations Support & Incident Escalations'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {t.supportDeskTitle || 'Customer Support & Incident Desk'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t.adminSupportSub || 'Central control desk for handling incident reports, customer tickets, and watchdog alerts.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {t.supportDeskTitle} ({supportTickets.length})
          </div>

          {supportTickets.map((tk) => {
            const isSelected = activeTicket?.id === tk.id;
            return (
              <div
                key={tk.id}
                onClick={() => setActiveTicketId(tk.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-teal bg-brand-teal/5 shadow-md ring-2 ring-brand-teal/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">{tk.ticketNumber}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      tk.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {tk.status === 'resolved' ? (t.verifApproved || 'Resolved') : (t.verifUnderReview || 'Open')}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {tk.subject}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>{t.fullNameLabel}: {tk.raisedByName}</span>
                  <span className="uppercase">{tk.priority}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversation Thread & Resolution Console */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between min-h-[460px]">
          {activeTicket ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="font-mono text-xs text-brand-teal font-bold">{activeTicket.ticketNumber}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeTicket.subject}
                    </h3>
                    <div className="text-xs text-slate-400">
                      {t.categoryLabel}: {activeTicket.category} • {activeTicket.raisedByName} ({activeTicket.raisedByRole})
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={activeTicket.status}
                    onChange={(e) => updateTicketStatus(activeTicket.id, e.target.value as SupportTicketStatus)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="open">{t.verifPending || 'Open'}</option>
                    <option value="in_progress">{t.verifUnderReview || 'In Progress'}</option>
                    <option value="resolved">{t.verifApproved || 'Resolved'}</option>
                    <option value="closed">{t.statusClosed || 'Closed'}</option>
                  </select>
                </div>

                {/* Messages */}
                <div className="space-y-4 py-4 max-h-72 overflow-y-auto">
                  {activeTicket.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.isAdminReply ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                        <span className="font-semibold">{m.senderName}</span>
                        <span>•</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                          m.isAdminReply
                            ? 'bg-slate-900 text-white rounded-tr-sm border border-slate-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Reply Input */}
              <form onSubmit={handleSendAdminReply} className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder={t.sendReplyPlaceholder || 'Type official operations reply to customer...'}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-teal text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-brand-tealDark"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.sendReplyBtn || 'Reply'}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 text-xs">{t.filterAll}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSupportManagementPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <AdminSupportManagementContent />
    </AuthGuard>
  );
}
