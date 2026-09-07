import React, { useState } from 'react';
import { Lock, Scissors, Sparkles, ArrowRight, ShieldCheck, UserCheck, Store, MapPin, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthGuard({ children, requiredRole = 'authenticated', fallbackTitle, fallbackDesc }) {
  const {
    user,
    authLoading,
    setShowAuthModal,
    onboardAsStylist,
    currentCampus,
    lusakaUniversities
  } = useApp();

  const [onboardingSpecialty, setOnboardingSpecialty] = useState('Barbering');
  const [onboardingDorm, setOnboardingDorm] = useState(user.hostel || 'Hostel Block C');
  const [onboardingPhone, setOnboardingPhone] = useState(user.phone || '0971234567');
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 text-center animate-pulse flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10" />
        <div className="w-48 h-5 bg-black/5 dark:bg-white/10 rounded-xl" />
        <div className="w-64 h-3 bg-black/5 dark:bg-white/5 rounded-lg" />
      </div>
    );
  }

  // 1. Not Authenticated
  if (!user?.isLoggedIn) {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4">
        <div className="apple-card p-6 text-center">
          <div className="w-14 h-14 rounded-3xl bg-amber-400/20 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock size={26} />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
            {fallbackTitle || 'Student Authentication Required'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {fallbackDesc || 'Please sign in or create a student account to access this page and manage your appointments.'}
          </p>

          <button
            onClick={() => setShowAuthModal(true)}
            className="apple-btn-primary w-full text-xs py-3"
          >
            <span>Sign In / Create Account</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // 2. Requires Vendor/Stylist Role, but user is regular Customer
  if (requiredRole === 'vendor' && user.role !== 'vendor') {
    const handleQuickOnboard = async (e) => {
      e.preventDefault();
      setOnboardingLoading(true);
      try {
        await onboardAsStylist({
          name: user.name,
          specialty: onboardingSpecialty,
          campus: currentCampus,
          hostel: onboardingDorm,
          phone: onboardingPhone
        });
      } finally {
        setOnboardingLoading(false);
      }
    };

    return (
      <div className="w-full max-w-lg mx-auto py-8 px-4">
        <div className="apple-card p-6 border-amber-400/30">
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Scissors size={26} />
            </div>
            <span className="badge badge-verified mb-1">Stylist Partner Program</span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight m-0">
              Become a Verified Campus Stylist
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0 leading-relaxed">
              Earn Kwacha cutting hair, doing braids, locs, or nails in your campus dorm or student studio.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-5 text-xs">
            <div className="p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
              <span>Direct Mobile Money Payouts</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center gap-2">
              <UserCheck size={16} className="text-blue-500 shrink-0" />
              <span>Host in Room or Travel</span>
            </div>
          </div>

          <form onSubmit={handleQuickOnboard} className="space-y-3">
            <div className="form-group">
              <label className="form-label" htmlFor="onboard-skill">Your Specialty Service:</label>
              <select
                id="onboard-skill"
                className="form-select text-xs"
                value={onboardingSpecialty}
                onChange={(e) => setOnboardingSpecialty(e.target.value)}
              >
                <option value="Barbering">Barbering & Fades</option>
                <option value="Braids & Natural Hair">Braids & Natural Hair</option>
                <option value="Wigs & Weaves">Wigs & Weaves</option>
                <option value="Locs">Locs & Retwist</option>
                <option value="Nails & Lashes">Nails & Lashes</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="form-group">
                <label className="form-label" htmlFor="onboard-dorm">Hostel / Dorm Room:</label>
                <input
                  id="onboard-dorm"
                  type="text"
                  required
                  placeholder="Block C, Room 14"
                  className="form-input text-xs"
                  value={onboardingDorm}
                  onChange={(e) => setOnboardingDorm(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="onboard-phone">Airtel / MTN Mobile:</label>
                <input
                  id="onboard-phone"
                  type="tel"
                  required
                  placeholder="0971234567"
                  className="form-input text-xs"
                  value={onboardingPhone}
                  onChange={(e) => setOnboardingPhone(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={onboardingLoading}
              className="apple-btn-primary w-full text-xs py-2.5 mt-2"
            >
              <span>{onboardingLoading ? 'Activating Stylist Account...' : 'Activate My Vendor Studio'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Requires Admin Role, but user is not an Admin
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4">
        <div className="apple-card p-6 text-center border-red-400/30">
          <div className="w-14 h-14 rounded-3xl bg-red-400/15 text-red-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldCheck size={26} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">
            Access Denied
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This area is restricted to UniHairShop administrators. Your account does not have admin access.
          </p>
        </div>
      </div>
    );
  }

  // 4. User is authorized!
  return children;
}
