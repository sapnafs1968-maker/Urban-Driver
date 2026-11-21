'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { SupportTicket } from '@/types';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getTranslation } from '@/lib/i18n';
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  PhoneCall,
  Send,
} from 'lucide-react';

function CustomerSupportContent() {
  const { supportTickets, createSupportTicket, addTicketMessage, currentUser, language } = useApp();
  const t = getTranslation(language);

  const [activeTicketId, setActiveTicketId] = useState<string | null>(
    supportTickets[0]?.id || null
  );
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Ticket Form state
  const [category, setCategory] = useState<SupportTicket['category']>('Delay');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<SupportTicket['priority']>('normal');

  // Reply message state
  const [replyMessage, setReplyMessage] = useState('');

  const activeTicket = supportTickets.find((t) => t.id === activeTicketId);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createSupportTicket(
      {
        raisedBy: currentUser?.id || 'usr_guest',
        raisedByName: currentUser?.name || 'Customer',
        raisedByRole: currentUser?.role || 'customer',
        category,
        subject,
        description,
        priority,
        status: 'open',
      },
      description
    );
    setIsNewModalOpen(false);
    setActiveTicketId(created.id);
    setSubject('');
    setDescription('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicketId) return;
    addTicketMessage(activeTicketId, replyMessage, false);
    setReplyMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.supportTitle}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t.supportSub}
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-5 py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-xl text-sm shadow flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.raiseTicketBtn}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            {t.openTickets} ({supportTickets.length})
          </div>

          {supportTickets.map((ticket) => {
            const isSelected = activeTicketId === ticket.id;
            return (
              <div
                key={ticket.id}
                onClick={() => setActiveTicketId(ticket.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected
                  ? 'border-brand-teal bg-brand-teal/5 shadow-md ring-2 ring-brand-teal/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {ticket.ticketNumber}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${ticket.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : ticket.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                  >
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 truncate">
                  {ticket.subject}
                </div>
                <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {ticket.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ticket Detail / Conversation Pane */}
        <div className="lg:col-span-7">
          {activeTicket ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-teal">
                    {activeTicket.ticketNumber}
                  </span>
                  <span className="text-xs text-slate-400">
                    {t.ticketCategory}: <strong>{activeTicket.category}</strong>
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {activeTicket.subject}
                </h2>
              </div>

              {/* Message thread */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {activeTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl text-xs space-y-1 ${msg.isAdminReply
                      ? 'bg-brand-softBlue/60 dark:bg-slate-800 border border-brand-teal/20 text-slate-800 dark:text-slate-200 ml-4'
                      : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 mr-4'
                      }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px] text-slate-500">
                      <span>{msg.senderName} ({msg.senderRole})</span>
                      <span>{msg.createdAt.split('T')[1].slice(0, 5)}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder={t.ticketMessage}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-teal hover:bg-brand-tealDark text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.sendTicket}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-xs text-slate-400">
              {t.noBookingsInTab}
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.raiseTicketBtn}
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {t.ticketCategory}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Delay">Delay / Punctuality</option>
                  <option value="Billing">Billing & Fare Query</option>
                  <option value="Driver Conduct">Driver Conduct & Courtesy</option>
                  <option value="Vehicle Care">Vehicle Handling & Smoothness</option>
                  <option value="Senior Assistance">Senior Care Support</option>
                  <option value="Other">Other / General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {t.ticketSubject}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {t.ticketMessage}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe the journey or question..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl text-xs"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-teal text-white font-bold rounded-xl text-xs shadow"
                >
                  {t.sendTicket}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerSupportPage() {
  return (
    <AuthGuard allowedRoles={['customer', 'family_guardian']}>
      <CustomerSupportContent />
    </AuthGuard>
  );
}
