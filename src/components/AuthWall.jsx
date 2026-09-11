import React, { useState, useEffect, useRef } from 'react';
import TurnstileWidget from './TurnstileWidget';
import {
  Scissors,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  Home,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkle,
  Check,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured, resetPasswordForEmailWithRetry } from '../lib/supabaseClient';

// Deep-link into the webmail inbox for common providers; fall back to mailto:
// (opens the device's default mail app) for anything else.
function getEmailProviderLink(emailAddress) {
  const domain = (emailAddress.split('@')[1] || '').toLowerCase();
  if (domain.includes('gmail')) return 'https://mail.google.com/mail/u/0/#inbox';
  if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) return 'https://outlook.live.com/mail/0/inbox';
  if (domain.includes('yahoo')) return 'https://mail.yahoo.com/d/folders/1';
  return `mailto:${emailAddress}`;
}

export default function AuthWall() {
  const {
    signIn,
    signUp,
    continueAsGuest,
    terminateAllSessions,
    lusakaUniversities,
    currentCampus,
    addToast,
    pendingReferralCode,
    authWallDefaultMode
  } = useApp();

  const [authMode, setAuthMode] = useState(() => authWallDefaultMode || 'signup'); // 'signup' | 'login' | 'forgot' | 'verify'
  const [roleType, setRoleType] = useState('customer'); // 'customer' | 'vendor'

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [campus, setCampus] = useState(currentCampus || 'UNILUS Silverest Campus');
  const [hostel, setHostel] = useState('');
  const [referralCode, setReferralCode] = useState(() => pendingReferralCode || '');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const turnstileRef = useRef(null);
  const errorRef = useRef(null);

  // The error banner renders above a long, scrollable form — without this, a
  // validation error (e.g. "passwords do not match") could fire while the
  // user is scrolled down near the submit button, off-screen, looking like
  // nothing happened at all.
  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorMsg]);

  // Submit Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await signIn(email.trim(), password, captchaToken);
    } catch (err) {
      console.error('Login Error:', err);
      setErrorMsg(err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
      turnstileRef.current?.reset();
      setCaptchaToken('');
    }
  };

  // Submit Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('Please accept the campus safety guidelines to proceed.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signUp({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        campus,
        hostel: hostel.trim() || 'Campus Hostel Residence',
        password,
        role: roleType,
        referralCode: referralCode.trim(),
        captchaToken
      });

      // A live session means either local/no-Supabase mode (always instant) or
      // Supabase with email confirmation disabled — either way they're already
      // signed in and the app will render past this gate on its own. Otherwise
      // (real Supabase with confirmation required) signUp() intentionally did NOT
      // log them in, so show the verify-your-email step instead of leaving them
      // stranded on the same form with just a toast.
      if (!isSupabaseConfigured || result?.data?.session) {
        return;
      }
      setVerificationEmail(email.trim());
      setAuthMode('verify');
    } catch (err) {
      console.error('Sign Up Error:', err);
      setErrorMsg(err.message || 'Registration failed. This email may already be in use.');
    } finally {
      setLoading(false);
      turnstileRef.current?.reset();
      setCaptchaToken('');
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail || !isSupabaseConfigured || !supabase) return;
    setResendingVerification(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: verificationEmail,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://www.unihair.shop/'
        }
      });
      if (error) throw error;
      addToast('A new verification email is on its way.', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Could not resend the verification email.');
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-white relative overflow-hidden">
      {/* Dynamic Background Glow Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10 my-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 shadow-apple-gold mb-3">
            <Scissors size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0">
            Uni<span className="text-amber-400">Hair</span>Shop
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Lusaka University Hair & Beauty Ecosystem • Dorm Visits & Hostel Studios
          </p>
        </div>

        {/* Main Glass Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/80">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-6 gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'signup'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-transparent'
              }`}
            >
              <Sparkles size={14} />
              <span>Create Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-transparent'
              }`}
            >
              <KeyRound size={14} />
              <span>Log In</span>
            </button>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div ref={errorRef} className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-4 animate-shake">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. SIGN UP FLOW */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setRoleType('customer')}
                    className={`p-3 rounded-2xl cursor-pointer border text-center transition-all ${
                      roleType === 'customer'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <GraduationCap size={18} className="mx-auto mb-1 text-amber-400" />
                    <span className="text-xs block">Student Client</span>
                    <span className="text-[10px] text-slate-400 block font-normal mt-0.5">Book styling & haircuts</span>
                  </div>

                  <div
                    onClick={() => setRoleType('vendor')}
                    className={`p-3 rounded-2xl cursor-pointer border text-center transition-all ${
                      roleType === 'vendor'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Scissors size={18} className="mx-auto mb-1 text-amber-400" />
                    <span className="text-xs block">Campus Stylist</span>
                    <span className="text-[10px] text-slate-400 block font-normal mt-0.5">Offer hair services & earn</span>
                  </div>
                </div>
              </div>

              {/* Full Name & WhatsApp Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Full Legal Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mapalo Lungu"
                      className="form-input pl-8 text-xs py-2 bg-black/40 border-white/10 text-white rounded-xl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">WhatsApp Phone Number *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="0971234567"
                      className="form-input pl-8 text-xs py-2 bg-black/40 border-white/10 text-white rounded-xl"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Campus Selection & Hostel Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Enrolled Campus *</label>
                  <select
                    className="form-select text-xs py-2 bg-black/40 border-white/10 text-white rounded-xl"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                  >
                    {lusakaUniversities.map((u) => (
                      <option key={u.id} value={u.name} className="bg-slate-900 text-white">
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Hostel Block & Room No. *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Block C, Room 14"
                      className="form-input pl-8 text-xs py-2 bg-black/40 border-white/10 text-white rounded-xl"
                      value={hostel}
                      onChange={(e) => setHostel(e.target.value)}
                    />
                    <Home size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="student@unilus.ac.zm"
                    className="form-input pl-8 text-xs py-2 bg-black/40 border-white/10 text-white rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Password (6+ chars) *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="form-input pl-8 pr-8 text-xs py-2 bg-black/40 border-white/10 text-white rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer p-0"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="form-input pl-8 text-xs py-2 bg-black/40 border-white/10 text-white rounded-xl"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Lock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Referral Code (Optional) with +25 Pts Tag */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Friend's 7-Digit Referral Code <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    🎁 +25 bonus points
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. 7482910"
                  className="form-input text-xs py-2 bg-black/40 border-white/10 text-white rounded-xl uppercase font-mono tracking-wider"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.trim().toUpperCase())}
                />
                {pendingReferralCode && referralCode === pendingReferralCode && (
                  <p className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <Check size={11} />
                    <span>Applied from your friend's referral link</span>
                  </p>
                )}
              </div>

              {/* Safety & Anti-Impersonation Agreement */}
              <label className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 text-amber-400 focus:ring-0"
                />
                <span>
                  I agree to the <strong>Campus Safety & Anti-Impersonation Guidelines</strong> for dorm visits.
                </span>
              </label>

              <TurnstileWidget ref={turnstileRef} onVerify={setCaptchaToken} />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="apple-btn-primary w-full text-xs py-3 rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-apple-gold mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Creating Campus Profile...</span>
                  </>
                ) : (
                  <>
                    <span>{referralCode.trim() ? 'Create Campus Account (+75 Pts Total)' : 'Create Campus Account (+50 Welcome Pts)'}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                  }}
                  className="text-xs text-amber-400 font-bold hover:underline bg-transparent border-0 cursor-pointer p-0"
                >
                  Log In Here
                </button>
              </div>
            </form>
          )}

          {/* 1.5 VERIFY EMAIL (shown right after signup, when confirmation is required) */}
          {authMode === 'verify' && (
            <div className="text-center py-2" role="status" aria-live="polite">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/25">
                <Mail size={26} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Check Your Email</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                We sent a verification link to <strong className="text-slate-200 break-all">{verificationEmail}</strong>. Open it, then return here to sign in.
              </p>
              <div className="rounded-2xl bg-amber-400/10 border border-amber-400/25 px-3 py-2.5 text-left text-[11px] text-slate-300 mb-4">
                <span className="font-bold text-amber-300">1.</span> Check your inbox and spam folder&nbsp; <span className="font-bold text-amber-300">2.</span> Tap "Verify email"&nbsp; <span className="font-bold text-amber-300">3.</span> Sign in
              </div>
              <a
                href={getEmailProviderLink(verificationEmail)}
                target="_blank"
                rel="noopener noreferrer"
                className="apple-btn-primary w-full text-xs py-2.5 mb-2 flex items-center justify-center gap-1.5 rounded-xl"
              >
                <Mail size={14} />
                <span>Open Email App</span>
              </a>
              <button type="button" onClick={handleResendVerification} disabled={resendingVerification || !isSupabaseConfigured} className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-bold transition-all cursor-pointer mb-2">
                {resendingVerification ? 'Sending verification email…' : 'Resend Verification Email'}
              </button>
              <button type="button" onClick={() => { setAuthMode('login'); setErrorMsg(''); }} className="text-xs text-amber-400 font-bold hover:underline bg-transparent border-0 cursor-pointer py-2">
                I've verified my email — Sign In
              </button>
            </div>
          )}

          {/* 2. LOG IN FLOW */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Email or Campus ID</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="student@unilus.ac.zm"
                    className="form-input pl-8 text-xs py-2.5 bg-black/40 border-white/10 text-white rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-[11px] text-amber-400 hover:underline bg-transparent border-0 cursor-pointer p-0"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="form-input pl-8 pr-8 text-xs py-2.5 bg-black/40 border-white/10 text-white rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer p-0"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <TurnstileWidget ref={turnstileRef} onVerify={setCaptchaToken} />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="apple-btn-primary w-full text-xs py-3 rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-apple-gold mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to UniHairShop</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">New to UniHairShop? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg('');
                  }}
                  className="text-xs text-amber-400 font-bold hover:underline bg-transparent border-0 cursor-pointer p-0"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FLOW */}
          {authMode === 'forgot' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <KeyRound size={24} />
                </div>
                <h3 className="text-sm font-bold text-white m-0">Reset Password</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your campus email address to receive password reset instructions or connect directly with campus support.
                </p>
              </div>

              {resetSent ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto" />
                  <h4 className="text-xs font-bold text-emerald-300 m-0">Password Reset Email Dispatched</h4>
                  <p className="text-[11px] text-slate-300 m-0">Check your inbox for the reset link.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Campus Email Address</label>
                    <input
                      type="email"
                      placeholder="student@unilus.ac.zm"
                      className="form-input text-xs py-2 bg-black/40 border-white/10 text-white rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <TurnstileWidget ref={turnstileRef} onVerify={setCaptchaToken} />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={async () => {
                      if (!email.trim()) {
                        setErrorMsg('Please enter your email address.');
                        return;
                      }
                      setLoading(true);
                      setErrorMsg('');
                      try {
                        if (isSupabaseConfigured && supabase) {
                          const redirectUrl = typeof window !== 'undefined' && window.location.origin
                            ? `${window.location.origin}/`
                            : 'https://www.unihair.shop/';
                          const { error } = await resetPasswordForEmailWithRetry(email.trim(), {
                            redirectTo: redirectUrl,
                            captchaToken: captchaToken || undefined
                          });
                          if (error) throw error;
                        }
                        setResetSent(true);
                        addToast('Password reset link sent to your email!', 'success');
                      } catch (err) {
                        setErrorMsg(err.message || 'Failed to send reset email. Please verify your address.');
                      } finally {
                        setLoading(false);
                        turnstileRef.current?.reset();
                        setCaptchaToken('');
                      }
                    }}
                    className="apple-btn-primary w-full text-xs py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <span>Send Reset Instructions</span>
                    )}
                  </button>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-slate-400 hover:text-white hover:underline bg-transparent border-0 cursor-pointer p-0"
                >
                  ← Back to Log In
                </button>
              </div>
            </div>
          )}

          {/* Guest Mode Exploration Gateway */}
          <div className="pt-4 mt-5 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-400 mb-2">Want to explore services & stylists before registering?</p>
            <button
              type="button"
              onClick={continueAsGuest}
              className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-sm hover:border-amber-400/40 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <GraduationCap size={15} className="text-amber-400 shrink-0" />
                <span>Continue Browsing as Guest</span>
              </div>
              <ArrowRight size={14} className="text-slate-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Global Session Termination Button */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={terminateAllSessions}
            className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center justify-center gap-1.5 mx-auto bg-transparent border-0 cursor-pointer"
            title="Terminate all saved sessions across devices"
          >
            <LogOut size={12} />
            <span>Terminate & Purge All Device Sessions</span>
          </button>
        </div>
      </div>
    </div>
  );
}
