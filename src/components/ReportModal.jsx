import React, { useState } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const REASONS = [
  'Harassment or inappropriate behavior',
  'Impersonation or fake identity',
  'Unsafe or unprofessional conduct',
  'Scam or asking to pay outside the app',
  'Other'
];

// Shared by MessagesView (chat header) and StylistProfileModal (profile) —
// the only in-app safety escalation besides messaging support directly.
export default function ReportModal({ reportedUserId, reportedUserName, contextType, contextId, onClose }) {
  const { submitReport } = useApp();
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await submitReport({ reportedUserId, contextType, contextId, reason, details: details.trim() });
    setSubmitting(false);
    if (result.success) setDone(true);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label="Report a safety concern">
      <div className="modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {done ? (
          <div className="text-center py-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <Flag size={22} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Report Submitted</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Our team will review this shortly. Thank you for helping keep campus safe.</p>
            <button type="button" onClick={onClose} className="apple-btn-secondary text-xs px-4 py-2">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 pb-3 border-b border-black/10 dark:border-white/10 mb-4">
              <div className="bg-rose-500/15 p-2.5 rounded-2xl text-rose-500 shrink-0">
                <Flag size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">Report {reportedUserName || 'this user'}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">Admins review every report — this is not shared with the reported user</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="form-group">
                <label className="form-label">What happened?</label>
                <select className="form-select text-xs" value={reason} onChange={(e) => setReason(e.target.value)}>
                  {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Additional details (optional):</label>
                <textarea
                  className="form-input text-xs"
                  rows={3}
                  placeholder="Anything else admins should know..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>

              <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-[11px] text-slate-700 dark:text-slate-300 flex gap-2 items-start">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <span>If you're in immediate danger, contact campus security first, then report here.</span>
              </div>

              <button type="submit" disabled={submitting} className="apple-btn-primary w-full text-xs py-2.5">
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
