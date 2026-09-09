import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Lock, Mail, Phone, MapPin, User, Building, Store, Scissors, ArrowRight, CheckCircle2, AlertCircle, KeyRound, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import TurnstileWidget from './TurnstileWidget';

// Deep-link into the webmail inbox for common providers; fall back to mailto:
// (opens the device's default mail app) for anything else.
function getEmailProviderLink(emailAddress) {
  const domain = (emailAddress.split('@')[1] || '').toLowerCase();
  if (domain.includes('gmail')) return 'https://mail.google.com/mail/u/0/#inbox';
  if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) return 'https://outlook.live.com/mail/0/inbox';
  if (domain.includes('yahoo')) return 'https://mail.yahoo.com/d/folders/1';
  return `mailto:${emailAddress}`;
}

export default function AuthModal() {
  const {
    showAuthModal,
    setShowAuthModal,
    user,
    setUser,
    signIn,
    signUp,
    currentCampus,
    lusakaUniversities,
    userMode,
    pendingAuthCallback,
    setPendingAuthCallback,
    pendingReferralCode,
    addToast
  } = useApp();

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [roleType, setRoleType] = useState('student'); // 'student' | 'stylist'

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [campus, setCampus] = useState(currentCampus);
  const [hostel, setHostel] = useState('');
  const [specialty, setSpecialty] = useState('Barbering');
  const [referralCode, setReferralCode] = useState(() => pendingReferralCode || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const turnstileRef = useRef(null);

  useEffect(() => {
    if (!showAuthModal) return;
    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAuthModal(false);
        setErrorMsg('');
        setResetSuccess(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAuthModal, setShowAuthModal]);

  if (!showAuthModal) return null;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both student email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password, captchaToken);
      setShowAuthModal(false);

      // Execute any pending action that was blocked by auth
      if (pendingAuthCallback) {
        pendingAuthCallback();
        setPendingAuthCallback(null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
      turnstileRef.current?.reset();
      setCaptchaToken('');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMsg('Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please provide your WhatsApp phone number for booking updates.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        campus,
        hostel: hostel.trim() || 'Campus Hostel',
        role: roleType === 'stylist' ? 'vendor' : 'customer',
        referralCode: referralCode.trim().toUpperCase(),
        captchaToken
      });

      // A live session means either local/no-Supabase mode (always instant) or
      // Supabase with email confirmation disabled — either way they're already
      // signed in, so continue straight into the app. Otherwise (real Supabase
      // with confirmation required) signUp() intentionally did NOT log them in,
      // so show the verify-your-email wizard instead.
      if (!isSupabaseConfigured || result?.data?.session) {
        setShowAuthModal(false);
        if (pendingAuthCallback) {
          pendingAuthCallback();
          setPendingAuthCallback(null);
        }
      } else {
        setVerificationEmail(email.trim());
        setAuthMode('verify');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account.');
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('Please enter your registered student email address.');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const redirectUrl = typeof window !== 'undefined' && window.location.origin
          ? `${window.location.origin}/`
          : 'https://www.unihair.shop/';
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectUrl,
          captchaToken: captchaToken || undefined
        });
        if (error) throw error;
      }
      setResetSuccess(true);
      addToast('Password reset link sent to your email!', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Could not send reset email. Please verify the address.');
    } finally {
      setLoading(false);
      turnstileRef.current?.reset();
      setCaptchaToken('');
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) { setShowAuthModal(false); setErrorMsg(''); setResetSuccess(false); } }}
      role="dialog"
      aria-modal="true"
      aria-label="Student and Stylist Account Authentication"
    >
      <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={() => { setShowAuthModal(false); setErrorMsg(''); setResetSuccess(false); }}
          title="Close (Esc)"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-2 font-extrabold shadow-md">
            <Sparkles size={22} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight m-0">
            {authMode === 'signin'
              ? 'Welcome Back to UniHair'
              : authMode === 'signup'
              ? 'Join UniHairShop Campus'
              : authMode === 'verify'
              ? 'Check Your Email'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">
            {authMode === 'signin'
              ? 'Sign in to access your appointments & student rewards'
              : authMode === 'signup'
              ? 'Create a profile to book styles and earn K15 student rewards'
              : authMode === 'verify'
              ? 'Verify your email to activate your UniHairShop account'
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {/* Segmented Control Tabs */}
        {authMode !== 'forgot' && authMode !== 'verify' && (
          <div className="flex bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-2xl border border-black/5 dark:border-white/10 mb-4" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'signin'}
              onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border-0 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'signup'}
              onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border-0 cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 mb-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORGOT PASSWORD RESET SUCCESS */}
        {authMode === 'verify' ? (
          <div className="text-center py-3" role="status" aria-live="polite">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto mb-3 border border-emerald-500/25">
              <Mail size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Verify your account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              We sent a verification link to <strong className="text-slate-700 dark:text-slate-200 break-all">{verificationEmail}</strong>. Open it, then return here to sign in.
            </p>
            <div className="rounded-2xl bg-amber-400/10 border border-amber-400/25 px-3 py-2.5 text-left text-[11px] text-slate-600 dark:text-slate-300 mb-4">
              <span className="font-bold text-amber-600 dark:text-amber-300">1.</span> Check your inbox and spam folder&nbsp; <span className="font-bold text-amber-600 dark:text-amber-300">2.</span> Tap “Verify email”&nbsp; <span className="font-bold text-amber-600 dark:text-amber-300">3.</span> Sign in
            </div>
            <a
              href={getEmailProviderLink(verificationEmail)}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-btn-primary w-full text-xs py-2.5 mb-2 flex items-center justify-center gap-1.5"
            >
              <Mail size={14} />
              <span>Open Email App</span>
            </a>
            <button type="button" onClick={handleResendVerification} disabled={resendingVerification || !isSupabaseConfigured} className="apple-btn-secondary w-full text-xs py-2.5 mb-2">
              {resendingVerification ? 'Sending verification email…' : 'Resend Verification Email'}
            </button>
            <button type="button" onClick={() => { setAuthMode('signin'); setErrorMsg(''); }} className="text-xs text-amber-600 dark:text-amber-300 hover:underline bg-transparent border-0 cursor-pointer py-2">
              I’ve verified my email — Sign In
            </button>
          </div>
        ) : resetSuccess ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Check Your Inbox</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              We sent a secure password reset link to <strong>{email}</strong>.
            </p>
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setResetSuccess(false); }}
              className="apple-btn-secondary text-xs px-4 py-2"
            >
              Back to Sign In
            </button>
          </div>
        ) : authMode === 'forgot' ? (
          /* FORGOT PASSWORD FORM */
          <form onSubmit={handleResetPassword} className="space-y-3">
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">Your Student Email:</label>
              <div className="relative">
                <input
                  id="reset-email"
                  type="email"
                  required
                  placeholder="student@unilus.ac.zm"
                  className="form-input pl-10 text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <TurnstileWidget ref={turnstileRef} onVerify={setCaptchaToken} />

            <button
              type="submit"
              disabled={loading}
              className="apple-btn-primary w-full text-xs py-2.5 mt-2"
            >
              <span>{loading ? 'Sending Link...' : 'Send Password Reset Link'}</span>
              <ArrowRight size={14} />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
                className="text-xs text-slate-500 hover:text-amber-500 transition-colors bg-transparent border-0 cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        ) : authMode === 'signin' ? (
          /* SIGN IN FORM */
          <form onSubmit={handleSignIn} className="space-y-3">
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Student Email:</label>
              <div className="relative">
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="student@unilus.ac.zm"
                  className="form-input pl-10 text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center mb-1">
                <label className="form-label mb-0" htmlFor="auth-password">Password:</label>
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot'); setErrorMsg(''); }}
                  className="text-[11px] text-amber-500 hover:underline bg-transparent border-0 cursor-pointer p-0"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="form-input pl-10 pr-10 text-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer p-0"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <TurnstileWidget ref={turnstileRef} onVerify={setCaptchaToken} />

            <button
              type="submit"
              disabled={loading}
              className="apple-btn-primary w-full text-xs py-2.5 mt-2"
            >
              <span>{loading ? 'Signing In...' : 'Sign In to Account'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        ) : (
          /* SIGN UP FORM */
          <form onSubmit={handleSignUp} className="space-y-2.5">
            {/* Role Selection Pill */}
            <div className="flex gap-2 mb-1">
              <button
                type="button"
                onClick={() => setRoleType('student')}
                className={`flex-1 p-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                  roleType === 'student'
                    ? 'bg-amber-400/20 border-amber-400 text-amber-600 dark:text-amber-300 font-bold'
                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-slate-500'
                }`}
              >
                <User size={13} />
                <span>Student Client</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleType('stylist')}
                className={`flex-1 p-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                  roleType === 'stylist'
                    ? 'bg-amber-400/20 border-amber-400 text-amber-600 dark:text-amber-300 font-bold'
                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-slate-500'
                }`}
              >
                <Scissors size={13} />
                <span>Campus Stylist</span>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full Name:</label>
              <input
                id="signup-name"
                type="text"
                required
                placeholder="e.g. Mwamba Phiri"
                className="form-input text-xs"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">Email:</label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  placeholder="student@campus.ac.zm"
                  className="form-input text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-phone">Mobile (WhatsApp):</label>
                <input
                  id="signup-phone"
                  type="tel"
                  required
                  placeholder="0971234567"
                  className="form-input text-xs"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="form-group">
                <label className="form-label" htmlFor="signup-campus">Campus:</label>
                <select
                  id="signup-campus"
                  className="form-select text-xs"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                >
                  {lusakaUniversities.map((u) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-hostel">Hostel / Dorm Room:</label>
                <input
                  id="signup-hostel"
                  type="text"
                  placeholder="Block C, Room 14"
                  className="form-input text-xs"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                />
              </div>
            </div>

            {roleType === 'stylist' && (
              <div className="form-group">
                <label className="form-label" htmlFor="signup-specialty">Specialty Skill:</label>
                <select
                  id="signup-specialty"
                  className="form-select text-xs"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option value="Barbering">Barbering & Fades</option>
                  <option value="Braids & Natural Hair">Braids & Natural Hair</option>
                  <option value="Wigs & Weaves">Wigs & Weaves</option>
                  <option value="Locs">Locs & Retwist</option>
                  <option value="Nails & Lashes">Nail Tech & Lashes</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Create Password:</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  className="form-input pr-10 text-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer p-0"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Referral Code with Bonus Tag */}
            <div className="form-group">
              <label className="form-label flex items-center justify-between" htmlFor="signup-referral">
                <span>Friend's Referral Code (Optional):</span>
                <span className="text-[10px] text-amber-500 font-bold">🎁 +25 bonus points</span>
              </label>
              <input
                id="signup-referral"
                type="text"
                maxLength={10}
                placeholder="e.g. 7482910"
                className="form-input text-xs uppercase font-mono tracking-wider"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.trim().toUpperCase())}
              />
            </div>

            <TurnstileWidget ref={turnstileRef} onVerify={setCaptchaToken} />

            <button
              type="submit"
              disabled={loading}
              className="apple-btn-primary w-full text-xs py-2.5 mt-2"
            >
              <span>{loading ? 'Creating Profile...' : referralCode.trim() ? 'Complete Registration (+75 Pts Total)' : 'Complete Registration (+50 Pts)'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
