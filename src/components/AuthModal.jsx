import React, { useState, useEffect } from 'react';
import { X, Sparkles, Lock, Mail, Phone, MapPin, User, Building, Store, Scissors, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function AuthModal() {
  const {
    showAuthModal,
    setShowAuthModal,
    user,
    setUser,
    currentCampus,
    lusakaUniversities,
    userMode,
    setUserMode,
    addToast
  } = useApp();

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [roleType, setRoleType] = useState('student'); // 'student' | 'stylist'

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [campus, setCampus] = useState(currentCampus);
  const [hostel, setHostel] = useState('');
  const [specialty, setSpecialty] = useState('Barbering');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!showAuthModal) return;
    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowAuthModal(false);
        setErrorMsg('');
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
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        if (data?.user) {
          // Fetch user profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              isLoggedIn: true,
              name: profile.name || user.name,
              phone: profile.phone || user.phone,
              hostel: profile.hostel || user.hostel,
              loyaltyPoints: profile.loyalty_points || 100,
              referralCode: profile.referral_code || user.referralCode,
              favorites: user.favorites || []
            });
            if (profile.role === 'vendor') {
              setUserMode('vendor');
            }
          } else {
            setUser((prev) => ({ ...prev, isLoggedIn: true, email: data.user.email }));
          }
        }
      } else {
        // Fallback local sign in
        setUser((prev) => ({ ...prev, isLoggedIn: true, name: name.trim() || prev.name }));
      }

      addToast(`Welcome back, ${user.name}!`, 'success');
      setShowAuthModal(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
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
      setErrorMsg('Email and password (min 6 characters) are required.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please provide a mobile number for appointment SMS / WhatsApp notifications.');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim(),
              phone: phone.trim(),
              campus,
              hostel: hostel.trim() || 'Hostel Room',
              role: roleType
            }
          }
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        const userId = data?.user?.id;
        const refCode = `${campus.split(' ')[0].toUpperCase()}-${name.split(' ')[0].toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

        if (userId) {
          // Save to public.profiles table
          await supabase.from('profiles').insert([{
            id: userId,
            name: name.trim(),
            phone: phone.trim(),
            campus,
            hostel: hostel.trim() || 'Campus Hostel',
            role: roleType,
            loyalty_points: 50,
            referral_code: refCode
          }]).catch(() => {});

          if (roleType === 'stylist') {
            await supabase.from('vendor_profiles').insert([{
              id: `stf-${Date.now().toString(36)}`,
              name: name.trim(),
              role: specialty,
              campus,
              dorm_location: hostel.trim() || 'Campus Hostel Studio',
              avatar: '/images/barber_service.jpg',
              is_verified: true,
              badge: 'Verified Campus Stylist',
              travels_to_dorm: true,
              travel_fee: 20,
              has_studio: true,
              phone: phone.trim(),
              bio: `Verified student ${specialty} at ${campus}. Ready for in-dorm visits or hosting!`,
              payout_provider: 'Airtel Money',
              payout_number: phone.trim()
            }]).catch(() => {});
          }
        }
      }

      // Update local state
      setUser({
        isLoggedIn: true,
        name: name.trim(),
        phone: phone.trim(),
        hostel: hostel.trim() || `${campus} Hostel`,
        loyaltyPoints: 50,
        referralCode: `${campus.split(' ')[0].toUpperCase()}-${name.split(' ')[0].toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
        favorites: []
      });

      if (roleType === 'stylist') {
        setUserMode('vendor');
      }

      addToast(`Account created! You received +50 Welcome Student Points.`, 'success');
      setShowAuthModal(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) { setShowAuthModal(false); setErrorMsg(''); } }}
      role="dialog"
      aria-modal="true"
      aria-label="Student and Stylist Account Authentication"
    >
      <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={() => { setShowAuthModal(false); setErrorMsg(''); }}
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
            {authMode === 'signin' ? 'Welcome Back to UniHair' : 'Join UniHairShop Campus'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">
            {authMode === 'signin'
              ? 'Sign in to access your appointments & rewards'
              : 'Create a student profile to book hairstyles and earn K15 rewards'}
          </p>
        </div>

        {/* Sign In / Sign Up Segmented Control */}
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

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 mb-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {authMode === 'signin' ? (
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
              <label className="form-label" htmlFor="auth-password">Password:</label>
              <div className="relative">
                <input
                  id="auth-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-input pl-10 text-xs"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

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
              <input
                id="signup-password"
                type="password"
                required
                placeholder="Min 6 characters"
                className="form-input text-xs"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="apple-btn-primary w-full text-xs py-2.5 mt-2"
            >
              <span>{loading ? 'Creating Profile...' : 'Complete Registration (+50 Pts)'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
