import React, { useState } from 'react';
import { X, Award, Users, DollarSign, Share2, Copy, Check, TrendingUp, Trophy, ArrowRight, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playSuccessChime } from '../lib/soundEffects';

export default function AmbassadorHubModal({ isOpen, onClose }) {
  const { user, addToast } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [momoNumber, setMomoNumber] = useState(user?.phone || '0971234567');
  const [provider, setProvider] = useState('Airtel Money');

  if (!isOpen) return null;

  const referralCode = user?.referralCode || 'STUDENT15';
  const ambassadorLink = `${window.location.origin}/?ref=${referralCode}`;

  // Mock ambassador stats
  const totalReferrals = 8;
  const earnedBounty = totalReferrals * 10; // K10 per booking
  const availableBounty = 60; // K60 ready for payout

  const leaderboard = [
    { rank: 1, name: 'Chileshe M.', campus: 'UNZA Great East', hostel: 'Soweto Hall', count: 48, earnings: 'K 480' },
    { rank: 2, name: 'Mwamba K.', campus: 'UNILUS Silverest', hostel: 'Hostel Block C', count: 35, earnings: 'K 350' },
    { rank: 3, name: 'Sepo N.', campus: 'CBU Riverside', hostel: 'Copperbelt Hall', count: 29, earnings: 'K 290' },
    { rank: 4, name: 'You (' + (user?.name || 'Student') + ')', campus: 'UNILUS Silverest', hostel: 'Block A', count: totalReferrals, earnings: `K ${earnedBounty}`, isMe: true }
  ];

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ambassadorLink);
      setCopiedLink(true);
      addToast(`Ambassador link copied: ${ambassadorLink}`, 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎓 Hey campus family! Book your next fresh haircut, knotless braids, or salon appointment on UniHairShop and get K15 off using my referral link:\n${ambassadorLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleRequestPayout = (e) => {
    e.preventDefault();
    if (!momoNumber || momoNumber.length < 10) {
      addToast('Enter a valid 10-digit mobile money number', 'error');
      return;
    }
    playSuccessChime();
    setPayoutRequested(true);
    addToast(`Payout request of K${availableBounty} sent to ${provider} (${momoNumber})!`, 'success');
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card max-w-lg p-6 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-amber-400/20 text-amber-500 p-1.5 rounded-xl border border-amber-400/30">
            <Trophy size={16} />
          </div>
          <span className="badge badge-verified text-[10px] py-0.5 px-2 font-bold">
            Campus Ambassador Program
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight m-0 mb-1">
          Earn K10 MoMo per Hostel Booking
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mb-5">
          Share your link with roommates and friends. Every time they book a haircut or braids, you earn K10 direct cash!
        </p>

        {/* Earnings Stats Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Referrals</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">{totalReferrals}</span>
          </div>

          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Earned</span>
            <span className="text-lg font-extrabold text-amber-500">K {earnedBounty}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block">Available</span>
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">K {availableBounty}</span>
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="card p-4 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-400/30 mb-5 space-y-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white block">
            Your Personal Ambassador Link:
          </span>
          <div className="flex items-center gap-2 bg-white dark:bg-black/50 p-2 rounded-xl border border-black/10 dark:border-white/10 font-mono text-xs text-amber-600 dark:text-amber-300">
            <span className="truncate flex-1">{ambassadorLink}</span>
            <button
              onClick={handleCopyLink}
              className="apple-btn-secondary text-[11px] py-1 px-2.5 shrink-0 flex items-center gap-1"
            >
              {copiedLink ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="apple-btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white border-0 font-bold"
          >
            <MessageSquare size={14} />
            <span>Share Link to WhatsApp Status</span>
          </button>
        </div>

        {/* 1-Tap Cash Payout Box */}
        <div className="card p-4 border border-black/10 dark:border-white/10 mb-5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
            Withdraw Earnings (Airtel / MTN MoMo)
          </h3>

          {!payoutRequested ? (
            <form onSubmit={handleRequestPayout} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {['Airtel Money', 'MTN MoMo'].map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setProvider(prov)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      provider === prov
                        ? 'bg-[#007AFF] text-white border-[#007AFF]'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  placeholder="0971234567"
                  className="form-input text-xs"
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={availableBounty <= 0}
                className="apple-btn-primary w-full text-xs py-2.5 font-bold"
              >
                <span>Withdraw K{availableBounty} to {provider}</span>
                <ArrowRight size={13} />
              </button>
            </form>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <Check size={16} className="mx-auto mb-1" />
              Payout request of K{availableBounty} processed! Disbursed to {momoNumber}.
            </div>
          )}
        </div>

        {/* Campus Hostel Leaderboard */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Campus Leaderboard (This Month)
            </span>
            <span className="text-[10px] text-amber-500 font-bold">Top Prize: K500 Cash</span>
          </div>

          <div className="space-y-1.5">
            {leaderboard.map((item) => (
              <div
                key={item.rank}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                  item.isMe
                    ? 'bg-amber-400/15 border-amber-400/40 text-slate-900 dark:text-white font-bold'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    item.rank === 1 ? 'bg-amber-400 text-slate-950' : item.rank === 2 ? 'bg-slate-300 text-slate-900' : 'bg-amber-700 text-white'
                  }`}>
                    {item.rank}
                  </span>
                  <div>
                    <span className="font-bold block">{item.name}</span>
                    <span className="text-[10px] text-slate-400">{item.campus} • {item.hostel}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-amber-500 block">{item.earnings}</span>
                  <span className="text-[10px] text-slate-400">{item.count} bookings</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
