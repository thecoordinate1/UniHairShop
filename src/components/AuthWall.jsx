import React, { useState } from 'react';
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
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthWall() {
  const {
    signIn,
    signUp,
    lusakaUniversities,
    currentCampus,
    addToast
  } = useApp();

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [roleType, setRoleType] = useState('student'); // 'student' | 'stylist'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [campus, setCampus] = useState(currentCampus || 'UNILUS Silverest Campus');
  const [hostel, setHostel] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      console.error('Sign In Error:', err);
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password || !name.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await signUp({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim(),
        campus,
        hostel: hostel.trim() || 'Campus Hostel',
        role: roleType === 'stylist' ? 'vendor' : 'customer'
      });
    } catch (err) {
      console.error('Sign Up Error:', err);
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail('mapalolungu65@gmail.com');
    setPassword('Th3coordin@t3');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 text-white relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md card p-6 sm:p-8 bg-slate-900/90 backdrop-blur-2xl border border-amber-400/20 shadow-2xl z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-apple-gold">
            <Scissors size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0">
            Uni<span className="text-amber-400">Hair</span>Shop
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Lusaka's Premier Campus Beauty, Barber & Salon Hub. Sign in to access your appointments & orders.
          </p>

          {/* Campus Badges */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {['UNILUS', 'UNZA', 'Apex', 'Evelyn Hone', 'Eden'].map((badge) => (
              <span key={badge} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium">
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black/30 p-1 rounded-2xl border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
              authMode === 'signin' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white bg-transparent'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
              authMode === 'signup' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white bg-transparent'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div className="form-group">
              <label className="form-label text-slate-300 text-xs">University Email or Username:</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="student@unilus.ac.zm"
                  className="form-input pl-10 text-xs bg-slate-950/60 border-white/15 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-slate-300 text-xs">Password:</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="form-input pl-10 pr-10 text-xs bg-slate-950/60 border-white/15 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer p-0"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="apple-btn-primary w-full text-xs py-3 mt-1 font-bold"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to UniHairShop'}</span>
              <ArrowRight size={15} />
            </button>

            {/* Master Admin Fill Pill */}
            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleFillAdmin}
                className="w-full py-2 px-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <KeyRound size={13} />
                <span>Fill Master Admin (Mapalo Lungu)</span>
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGN UP FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3">
            {/* Role Switcher */}
            <div className="flex gap-2 mb-1">
              <button
                type="button"
                onClick={() => setRoleType('student')}
                className={`flex-1 p-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                  roleType === 'student'
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-400'
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
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <Scissors size={13} />
                <span>Campus Stylist</span>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label text-slate-300 text-xs">Full Name:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Mapalo Mwansa"
                  className="form-input pl-10 text-xs bg-slate-950/60 border-white/15 text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="form-group">
                <label className="form-label text-slate-300 text-xs">WhatsApp Phone:</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="0971234567"
                    className="form-input pl-9 text-xs bg-slate-950/60 border-white/15 text-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label text-slate-300 text-xs">Campus:</label>
                <select
                  className="form-select text-xs bg-slate-950/60 border-white/15 text-white"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                >
                  {lusakaUniversities.map((u) => (
                    <option key={u.id} value={u.name} className="bg-slate-900 text-white">{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-slate-300 text-xs">Hostel & Room No:</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Silverest Block B, Room 12"
                  className="form-input pl-10 text-xs bg-slate-950/60 border-white/15 text-white"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                />
                <Home size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-slate-300 text-xs">Email Address:</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="student@unilus.ac.zm"
                  className="form-input pl-10 text-xs bg-slate-950/60 border-white/15 text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-slate-300 text-xs">Password:</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  className="form-input pl-10 text-xs bg-slate-950/60 border-white/15 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="apple-btn-primary w-full text-xs py-3 mt-1 font-bold"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <CheckCircle2 size={15} />
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-slate-500 text-[11px]">
          <span>Protected with Supabase Auth & JWT Sessions 🛡️</span>
        </div>
      </div>
    </div>
  );
}
