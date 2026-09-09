import React from 'react';
import { ShieldOff, LogOut, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Full-screen block shown whenever the signed-in user's profile carries
// is_suspended — a UI-level backstop. Every real write path (booking, order,
// review, chat) already re-checks is_user_suspended() server-side, so even if
// someone bypassed this screen entirely, nothing they do would actually go through.
export default function SuspendedAccountScreen() {
  const { user, signOut } = useApp();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/30 text-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 my-auto">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-rose-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-center">
          <div className="w-14 h-14 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/25">
            <ShieldOff size={28} />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Account Suspended</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Your UniHairShop account has been suspended by an administrator and can't book, chat, or list services right now.
          </p>
          {user?.suspendedReason && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs mb-5 text-left">
              <span className="font-bold">Reason: </span>{user.suspendedReason}
            </div>
          )}
          <a
            href={`https://wa.me/260772822579?text=${encodeURIComponent('Hi, my UniHairShop account was suspended and I would like to appeal.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-btn-primary w-full text-xs py-3 rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-apple-gold mb-2"
          >
            <MessageSquare size={14} />
            <span>Contact Support to Appeal</span>
          </a>
          <button
            type="button"
            onClick={signOut}
            className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
