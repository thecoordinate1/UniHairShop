import React, { useEffect } from 'react';
import { ShieldCheck, Lock, UserCheck, PhoneCall, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SafetyModal() {
  const { showSafetyModal, setShowSafetyModal } = useApp();

  useEffect(() => {
    if (!showSafetyModal) return;
    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowSafetyModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSafetyModal, setShowSafetyModal]);

  if (!showSafetyModal) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) setShowSafetyModal(false); }}
      role="dialog"
      aria-modal="true"
      aria-label="Campus Safety Code of Conduct"
    >
      <div className="modal-card max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={() => setShowSafetyModal(false)}
          title="Close (Esc)"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-black/10 dark:border-white/10 mb-4">
          <div className="bg-emerald-500/15 p-2.5 rounded-2xl text-emerald-500 shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight m-0">Campus Safety Code of Conduct</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">Trust, peer safety & verified dorm visits</p>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
            <UserCheck size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">1. Verified Student Stylists</h4>
              <p className="m-0 text-slate-500 dark:text-slate-400">All campus barbers and braiders are authenticated university students with registered student IDs and verified dorm rooms.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
            <Lock size={20} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">2. In-Dorm Etiquette & Check-In</h4>
              <p className="m-0 text-slate-500 dark:text-slate-400">When receiving services in student flats or rooms, keep the dorm door slightly ajar or notify your roommate/hall assistant.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
            <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">3. 12-Hour Free Cancellation</h4>
              <p className="m-0 text-slate-500 dark:text-slate-400">Plans change around tests and lectures. Cancel or reschedule your appointment with zero penalties up to 12 hours before scheduled time.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/30">
            <PhoneCall size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-500 mb-0.5">Campus Security & Emergency Helpline</h4>
              <p className="m-0 text-slate-700 dark:text-slate-300">If you ever feel uncomfortable, notify campus safety immediately: <strong>+260 772 822579</strong> or campus security desk.</p>
            </div>
          </div>
        </div>

        <button
          className="apple-btn-primary w-full text-xs"
          onClick={() => setShowSafetyModal(false)}
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
}
