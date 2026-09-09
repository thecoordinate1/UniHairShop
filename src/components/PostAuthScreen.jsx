import React, { useState } from 'react';
import { CheckCircle2, KeyRound, Lock, Eye, EyeOff, AlertCircle, ArrowRight, RefreshCw, Scissors } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Full-screen takeover shown when the user lands back on the site from an email
// link: 'verified' after confirming a new signup, 'reset' after a password
// recovery link (where they set a brand new password before continuing).
export default function PostAuthScreen({ mode }) {
  const { setPostAuthScreen, setAuthWallDefaultMode, setShowAuthModal, addToast } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const handleContinueToSignIn = () => {
    setAuthWallDefaultMode('login');
    setShowAuthModal(true);
    setPostAuthScreen(null);
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setResetDone(true);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setResetDone(true);
      addToast('Password updated successfully!', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'This reset link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 my-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 shadow-apple-gold mb-3">
            <Scissors size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0">
            Uni<span className="text-amber-400">Hair</span>Shop
          </h1>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 text-center">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-4 text-left">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'verified' && (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/25">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Your UniHairShop campus account is now active. Sign in to start booking verified stylists and claim your welcome loyalty points.
              </p>
              <button
                type="button"
                onClick={handleContinueToSignIn}
                className="apple-btn-primary w-full text-xs py-3 rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-apple-gold"
              >
                <span>Sign In Now</span>
                <ArrowRight size={14} />
              </button>
            </>
          )}

          {mode === 'reset' && (
            resetDone ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/25">
                  <CheckCircle2 size={28} />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Password Updated!</h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Your password has been changed. You're securely signed in — continue to your account.
                </p>
                <button
                  type="button"
                  onClick={() => setPostAuthScreen(null)}
                  className="apple-btn-primary w-full text-xs py-3 rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-apple-gold"
                >
                  <span>Continue to My Account</span>
                  <ArrowRight size={14} />
                </button>
              </>
            ) : (
              <form onSubmit={handleSetNewPassword} className="text-left space-y-3.5">
                <div className="text-center mb-2">
                  <div className="w-14 h-14 rounded-full bg-amber-400/15 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-400/25">
                    <KeyRound size={26} />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">Set a New Password</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Choose a new password for your UniHairShop account.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">New Password (6+ chars)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="form-input pl-8 pr-8 text-xs py-2.5 bg-black/40 border-white/10 text-white rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer p-0"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="form-input pl-8 text-xs py-2.5 bg-black/40 border-white/10 text-white rounded-xl"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Lock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="apple-btn-primary w-full text-xs py-3 rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-apple-gold mt-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleContinueToSignIn}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-white pt-1 bg-transparent border-0 cursor-pointer"
                >
                  Link expired? Back to Sign In
                </button>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
}
