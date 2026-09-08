import React, { useState, useEffect } from 'react';
import {
  User,
  Award,
  Calendar,
  Package,
  Heart,
  RefreshCw,
  XCircle,
  Share2,
  Clock,
  X,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Download,
  Sun,
  Moon,
  MessageSquare,
  Truck,
  Store,
  ArrowRight,
  Scissors,
  LogOut,
  Edit3,
  Lock,
  Info,
  Sparkles,
  Gift,
  Users,
  Copy,
  Check,
  TrendingUp,
  Zap,
  Phone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import BookingDetailModal from '../components/BookingDetailModal';

export default function AccountView() {
  const {
    user,
    signOut,
    terminateAllSessions,
    updateUserProfile,
    setShowAuthModal,
    bookings,
    orders,
    cancelBooking,
    rescheduleBooking,
    exportToCalendar,
    services,
    toggleFavorite,
    addToast,
    setActiveTab,
    theme,
    toggleTheme,
    setShowSafetyModal,
    userMode,
    toggleUserMode,
    switchViewMode
  } = useApp();

  const [accountTab, setAccountTab] = useState('bookings');
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('14:00');
  const [dateError, setDateError] = useState('');

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user.name || '');
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [editHostel, setEditHostel] = useState(user.hostel || '');

  const today = new Date().toISOString().split('T')[0];

  // Lock body scroll when modals are active
  useEffect(() => {
    if (!rescheduleModal && !showEditModal) return;

    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setRescheduleModal(null);
        setShowEditModal(false);
        setDateError('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [rescheduleModal, showEditModal]);

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyReferral = () => {
    const code = user.referralCode || '7482910';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      addToast(`7-Digit Referral Code ${code} copied to clipboard!`, 'success');
    } else {
      addToast(`Your referral code is: ${code}`, 'info');
    }
  };

  const handleShareReferral = async () => {
    const code = user.referralCode || '7482910';
    const text = `Join UniHair Shop with my 7-digit campus student code ${code} to get K15 off your hair appointment + 25 bonus loyalty points! 💈✨`;
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}` : 'https://www.unihair.shop';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UniHair Shop Student Referral Discount',
          text,
          url: shareUrl
        });
        addToast('Referral invitation shared!', 'success');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      addToast('Referral invite copied! Send it on WhatsApp to friends.', 'success');
    } else {
      addToast(`Your 7-digit referral code is: ${code}`, 'info');
    }
  };

  const handleConfirmReschedule = () => {
    if (newDate < today) {
      setDateError('Please select today or a future date.');
      return;
    }
    rescheduleBooking(rescheduleModal.id, newDate, newTime);
    setRescheduleModal(null);
    setDateError('');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }
    updateUserProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      hostel: editHostel.trim()
    });
    setShowEditModal(false);
  };

  const favoriteServices = services.filter((s) => user?.favorites?.includes(s.id));
  const pointsValue = (Number(user?.loyaltyPoints) || 0) * 0.15;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Profile Header */}
      <div className="card p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex flex-wrap items-center justify-between gap-4 border-amber-400/20">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400 text-slate-950 w-14 h-14 rounded-3xl flex items-center justify-center font-extrabold text-2xl shadow-apple-gold shrink-0">
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight m-0">{user.name}</h1>
              <span className={`badge text-[10px] py-0.2 px-2 ${user.role === 'vendor' ? 'badge-in-stock' : 'badge-verified'}`}>
                {user.role === 'vendor' ? 'Verified Stylist' : 'Student Account'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 mb-0">
              {user.isLoggedIn ? `Phone: ${user.phone || 'Not set'} • ${user.hostel || 'Campus'}` : 'Guest Visitor'}
            </p>
          </div>
        </div>

        {/* Action Controls: Edit Profile & Sign Out / In */}
        <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
          {user.isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  setEditName(user.name);
                  setEditPhone(user.phone);
                  setEditHostel(user.hostel);
                  setShowEditModal(true);
                }}
                className="apple-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-slate-200"
                title="Edit student profile"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>

              <button
                onClick={signOut}
                className="apple-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-rose-400 hover:text-rose-300 hover:border-rose-500/30"
                title="Sign out of current account"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>

              <button
                onClick={terminateAllSessions}
                className="apple-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/40"
                title="Terminate all saved sessions across all devices"
              >
                <ShieldCheck size={13} />
                <span>Reset All Sessions</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="apple-btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Lock size={13} />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Loyalty Points Badge */}
          <button
            type="button"
            onClick={() => setAccountTab('rewards')}
            className="bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 p-2.5 rounded-2xl flex items-center gap-2.5 backdrop-blur-md shadow-sm transition-all cursor-pointer text-left shrink-0"
            title="View Loyalty Rewards & Referral Earnings"
          >
            <Award size={20} className="text-amber-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[9px] text-slate-300 font-semibold uppercase tracking-wider block">Points Hub</span>
              <span className="text-sm font-extrabold text-amber-400">{user.loyaltyPoints || 0} Pts</span>
            </div>
          </button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-card max-w-sm pb-24 sm:pb-7" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEditModal(false)}>
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">Full Name:</label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  className="form-input text-xs"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-phone">WhatsApp Phone:</label>
                <input
                  id="edit-phone"
                  type="tel"
                  required
                  className="form-input text-xs"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-hostel">Hostel & Room No:</label>
                <input
                  id="edit-hostel"
                  type="text"
                  className="form-input text-xs"
                  value={editHostel}
                  onChange={(e) => setEditHostel(e.target.value)}
                />
              </div>

              <button type="submit" className="apple-btn-primary w-full text-xs py-2.5 mt-2 mb-3">
                <span>Save Profile Changes</span>
                <CheckCircle2 size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Guest Mode Onboarding Callout Banner */}
      {!user?.isLoggedIn && (
        <div className="card p-5 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-400/30 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="bg-amber-400/20 text-amber-500 w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold shadow-sm shrink-0 border border-amber-400/30">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white m-0">Browsing in Guest Mode 🎓</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">
                Sign in or register to save your hostel appointments, earn loyalty discounts, and activate your student perks!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="apple-btn-primary text-xs py-2 px-4 shrink-0 font-bold shadow-apple-gold cursor-pointer"
          >
            Sign In / Register
          </button>
        </div>
      )}

      {/* Missing Phone Nudge — bookings require one, in case an account somehow lacks it */}
      {user?.isLoggedIn && !user?.phone && (
        <div className="card p-5 bg-gradient-to-r from-rose-500/15 via-rose-400/10 to-transparent border border-rose-400/30 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="bg-rose-400/20 text-rose-500 w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold shadow-sm shrink-0 border border-rose-400/30">
              <Phone size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white m-0">Add Your Phone Number</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">
                Your stylist needs a way to reach you — add a phone number before booking your first appointment.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditName(user.name);
              setEditPhone(user.phone || '');
              setEditHostel(user.hostel);
              setShowEditModal(true);
            }}
            className="apple-btn-primary text-xs py-2 px-4 shrink-0 font-bold shadow-apple-gold cursor-pointer"
          >
            Add Phone Number
          </button>
        </div>
      )}

      {/* Master Admin Command Hub Banner */}
      {user?.role === 'admin' && (
        <div className="card p-5 bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-transparent border border-amber-400/40 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="bg-amber-400 text-slate-950 w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold shadow-md shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">Master Admin Command Portal</h3>
                <span className="badge badge-verified text-[9px] py-0.2 px-1.5 font-bold">Executive Access</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">
                Full platform visibility: View all campus stylists, live booking traffic, product orders, and mobile money revenue.
              </p>
            </div>
          </div>

          <button
            onClick={() => switchViewMode('admin')}
            className="apple-btn-primary text-xs px-4 py-2 shrink-0 flex items-center gap-1.5"
          >
            <ShieldCheck size={14} />
            <span>Launch Command Center</span>
          </button>
        </div>
      )}

      {/* Dual Architecture: Vendor Studio Banner */}
      <div className="card p-5 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-400/30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="bg-amber-400 text-slate-950 w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold shadow-md shrink-0">
            <Store size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">Campus Stylist & Vendor Studio</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">
              Cut hair, do braids, or sell hair products on campus? Manage appointments & instant mobile money payouts.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (userMode !== 'vendor') toggleUserMode();
            setActiveTab('vendor');
          }}
          className="apple-btn-primary text-xs px-4 py-2 shrink-0"
        >
          <span>Open Vendor Studio</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Student Referral & Safety Quick Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Referral Card with 7-Digit Code & Counter */}
        <div className="card p-4 flex flex-col justify-between gap-3 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Gift size={14} className="text-emerald-500 shrink-0" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white m-0 truncate">Invite Friends & Earn Points</h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                Your 7-Digit Code: <strong className="text-amber-500 font-mono tracking-wider font-extrabold">{user.referralCode || '7482910'}</strong>
              </p>
            </div>
            <span className="badge bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 shrink-0">
              {user.referralCount || 0} Joined
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={handleCopyReferral}
              className="apple-btn-secondary text-[11px] py-1.5 px-3 flex-1 flex items-center justify-center gap-1"
            >
              {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareReferral}
              className="apple-btn-primary text-[11px] py-1.5 px-3 flex-1 flex items-center justify-center gap-1 shadow-apple-gold"
            >
              <Share2 size={12} />
              <span>WhatsApp Invite</span>
            </button>
          </div>
        </div>

        {/* Safety & Cancellation Policy */}
        <div
          onClick={() => setShowSafetyModal(true)}
          className="card p-4 flex items-center justify-between gap-3 border-blue-500/30 bg-blue-500/5 cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white m-0 truncate">Campus Safety & 12h Policy</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0 mt-0.5">Free cancellation up to 12h before</p>
          </div>
          <div className="text-blue-500 text-xs font-bold shrink-0 flex items-center gap-1">
            <ShieldCheck size={16} />
            <span>Code</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 bg-black/[0.02] dark:bg-white/[0.04] p-1.5 rounded-full border border-black/5 dark:border-white/10" role="tablist" aria-label="Account sections">
        <button
          onClick={() => setAccountTab('bookings')}
          role="tab"
          aria-selected={accountTab === 'bookings'}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 ${
            accountTab === 'bookings'
              ? 'bg-[#007AFF] text-white font-bold shadow-apple-blue'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
          }`}
        >
          My Bookings ({bookings.length})
        </button>

        <button
          onClick={() => setAccountTab('orders')}
          role="tab"
          aria-selected={accountTab === 'orders'}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 ${
            accountTab === 'orders'
              ? 'bg-[#007AFF] text-white font-bold shadow-apple-blue'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
          }`}
        >
          Shop Orders ({orders.length})
        </button>

        <button
          onClick={() => setAccountTab('favorites')}
          role="tab"
          aria-selected={accountTab === 'favorites'}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 ${
            accountTab === 'favorites'
              ? 'bg-[#007AFF] text-white font-bold shadow-apple-blue'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'
          }`}
        >
          Favorites ({user?.favorites?.length || 0})
        </button>

        <button
          onClick={() => setAccountTab('rewards')}
          role="tab"
          aria-selected={accountTab === 'rewards'}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border-0 flex items-center gap-1.5 ${
            accountTab === 'rewards'
              ? 'bg-amber-400 text-slate-950 font-extrabold shadow-apple-gold'
              : 'text-amber-500 hover:text-amber-400 bg-amber-400/10'
          }`}
        >
          <Gift size={13} />
          <span>Rewards & Referrals ({user.loyaltyPoints || 0} Pts)</span>
        </button>
      </div>

      {/* 1. BOOKINGS TAB */}
      {accountTab === 'bookings' && (
        <div className="flex flex-col gap-3">
          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon bg-amber-400/15">
                <Calendar size={28} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Bookings Yet</h3>
              <p className="text-sm text-slate-400 mb-5">You haven't scheduled any campus salon appointments yet.</p>
              <button className="apple-btn-primary" onClick={() => setActiveTab('services')}>
                Explore Services
              </button>
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="card p-4 sm:p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-in-stock text-[10px]">{b.category}</span>
                      <span className="text-[11px] text-slate-400 font-mono">Ref: {b.id}</span>
                      {b.depositAmount > 0 && (
                        <span className="badge badge-verified text-[10px] bg-emerald-500/15 text-emerald-600">
                          K{b.depositAmount} Deposit Paid
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{b.serviceName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Location: {b.campus} — {b.hostel || 'Campus'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${b.status === 'Confirmed' ? 'badge-in-stock' : b.status === 'Completed' ? 'badge-verified' : 'badge-out-of-stock'}`}>
                      {b.status}
                    </span>
                    {b.balanceDue > 0 && (
                      <span className="text-[10px] text-amber-500 font-bold block mt-1">
                        Due on arrival: K{b.balanceDue}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-black/[0.02] dark:bg-slate-900/60 p-3 rounded-2xl border border-black/5 dark:border-white/5 mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Stylist</span>
                    <strong className="text-slate-900 dark:text-white font-medium">{b.staffName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Schedule</span>
                    <strong className="text-amber-500 font-medium">{b.date} • {b.time}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total</span>
                    <strong className="text-amber-500 font-medium">K {b.totalPrice || b.price}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Payment</span>
                    <strong className="text-emerald-500 font-medium">{b.paymentStatus || b.paymentMethod}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-black/5 dark:border-white/10">
                  <a
                    href={`https://wa.me/260772822579?text=${encodeURIComponent(
                      `Hi ${b.staffName}, I'm checking in regarding my UniHairShop booking ref: ${b.id} for ${b.serviceName} on ${b.date} at ${b.time}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="apple-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"
                    title="Send direct WhatsApp message to stylist"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    className="apple-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-amber-500 font-semibold"
                    onClick={() => {
                      const shareText = `Got my fresh ${b.serviceName} done with ${b.staffName} on UniHairShop! 💈✨ Use my student referral code ${user.referralCode} to get K15 off your appointment: ${window.location.origin}`;
                      if (navigator.share) {
                        navigator.share({ title: 'My UniHairShop Style', text: shareText, url: window.location.origin }).catch(() => {});
                      } else if (navigator.clipboard) {
                        navigator.clipboard.writeText(shareText);
                        addToast('WhatsApp story text copied to clipboard!', 'success');
                      }
                    }}
                    title="Share your style to WhatsApp Status"
                  >
                    <Share2 size={13} />
                    <span>Share Story</span>
                  </button>

                  <button
                    className="apple-btn-primary text-xs px-3 py-1.5 flex items-center gap-1 font-bold"
                    onClick={() => setSelectedBookingDetail(b)}
                    title="View full booking details, breakdown & stylist contact"
                  >
                    <Info size={13} />
                    <span>View Details</span>
                  </button>

                  {b.status === 'Confirmed' && (
                    <>
                      <button
                        className="apple-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                        onClick={() => exportToCalendar(b)}
                        title="Download .ics Calendar Sync Invite"
                      >
                        <Download size={13} />
                        <span>Sync (.ics)</span>
                      </button>

                      <button
                        className="apple-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                        onClick={() => {
                          setRescheduleModal(b);
                          setNewDate(b.date || today);
                          setNewTime(b.time || '14:00');
                          setDateError('');
                        }}
                        aria-label={`Reschedule appointment for ${b.serviceName}`}
                      >
                        <RefreshCw size={13} aria-hidden="true" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        className="bg-pink-500/15 text-pink-500 border border-pink-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 hover:bg-pink-500/25 active:scale-95 transition-all cursor-pointer"
                        onClick={() => cancelBooking(b.id)}
                        aria-label={`Cancel appointment for ${b.serviceName}`}
                      >
                        <XCircle size={13} aria-hidden="true" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. ORDERS TAB WITH ORDER STATUS TRACKER */}
      {accountTab === 'orders' && (
        <div className="flex flex-col gap-4">
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon bg-amber-400/15">
                <Package size={28} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Shop Orders</h3>
              <p className="text-sm text-slate-400 mb-5">You haven't ordered any retail hair or cosmetic products yet.</p>
              <button className="apple-btn-primary" onClick={() => setActiveTab('shop')}>
                Browse Shop
              </button>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="card p-4 sm:p-5">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight m-0">Order #{ord.id}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-0">Date: {ord.createdAt} • Delivery: {ord.deliveryType}</p>
                  </div>
                  <span className="price-tag text-base">K {ord.totalAmount}</span>
                </div>

                {/* Status Timeline */}
                <div className="bg-black/[0.02] dark:bg-slate-900/80 p-3.5 rounded-2xl mb-3 border border-black/5 dark:border-white/5">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mb-2.5">Live Delivery Status:</p>
                  <div className="flex justify-between relative">
                    {['Pending', 'Processing', 'Ready for Pickup', 'Delivered'].map((stepName, idx) => {
                      const steps = ['Pending', 'Processing', 'Ready for Pickup', 'Delivered'];
                      const currentIdx = steps.indexOf(ord.status);
                      const isPassed = idx <= currentIdx;
                      return (
                        <div key={stepName} className="text-center flex-1 z-10 px-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 text-[10px] font-extrabold transition-colors ${
                            isPassed ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30' : 'bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {isPassed ? <CheckCircle2 size={12} /> : idx + 1}
                          </div>
                          <span className={`text-[10px] block leading-tight ${isPassed ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                            {stepName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Items ({ord.items.length}): {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. FAVORITES TAB */}
      {accountTab === 'favorites' && (
        <div>
          {favoriteServices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon bg-pink-500/15">
                <Heart size={28} className="text-pink-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Saved Favorites</h3>
              <p className="text-sm text-slate-400 mb-5">Tap the heart icon on any service to save it here for fast re-booking.</p>
              <button className="apple-btn-primary" onClick={() => setActiveTab('services')}>
                Explore Services
              </button>
            </div>
          ) : (
            <div className="grid-2">
              {favoriteServices.map((srv) => (
                <div key={srv.id} className="card p-3.5 flex gap-3.5 items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={srv.image} alt={srv.name} className="w-14 h-14 rounded-xl object-cover shrink-0" loading="lazy" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 truncate">{srv.name}</h4>
                      <span className="price-tag text-sm">K {srv.price}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(srv.id)}
                    className="text-pink-500 hover:text-pink-400 p-2 bg-transparent border-0 shrink-0 cursor-pointer"
                    aria-label={`Remove ${srv.name} from favorites`}
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. REWARDS & REFERRALS TAB */}
      {accountTab === 'rewards' && (
        <div className="flex flex-col gap-4">
          {/* Main Referral & Points Card */}
          <div className="card p-6 bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-950 border border-amber-400/30 text-white relative overflow-hidden shadow-2xl">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-5 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                    🎓 Student Rewards Program
                  </span>
                  <span className="text-xs text-slate-400">Level: Campus Trendsetter</span>
                </div>
                <h3 className="text-xl font-extrabold text-white m-0">Your Loyalty & Referral Hub</h3>
              </div>

              <div className="bg-amber-400 text-slate-950 px-4 py-2.5 rounded-2xl shadow-apple-gold text-right shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider block text-slate-800">Available Points</span>
                <span className="text-xl font-extrabold">{user.loyaltyPoints || 0} Pts</span>
              </div>
            </div>

            {/* 7-Digit Referral Code Highlight Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-amber-400/25 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 backdrop-blur-md">
              <div className="text-center sm:text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Your Unique 7-Digit Referral Code
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-widest text-amber-400 select-all">
                  {user.referralCode || '7482910'}
                </div>
                <p className="text-[11px] text-slate-300 m-0 mt-1.5">
                  Give friends <strong>K15 off</strong> • You both get <strong>+25 Loyalty Points</strong> when they sign up!
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyReferral}
                  className="apple-btn-secondary flex-1 sm:flex-initial text-xs py-2.5 px-4 flex items-center justify-center gap-1.5"
                >
                  {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareReferral}
                  className="apple-btn-primary flex-1 sm:flex-initial text-xs py-2.5 px-4 flex items-center justify-center gap-1.5 shadow-apple-gold"
                >
                  <Share2 size={14} />
                  <span>WhatsApp Invite</span>
                </button>
              </div>
            </div>

            {/* Stats Counter Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 relative z-10">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-0.5">
                  <Users size={13} className="text-amber-400" />
                  <span>Friends Joined</span>
                </div>
                <div className="text-lg font-extrabold text-white">{user.referralCount || 0}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-0.5">
                  <Award size={13} className="text-amber-400" />
                  <span>Referral Earnings</span>
                </div>
                <div className="text-lg font-extrabold text-amber-400">{(user.referralCount || 0) * 25} Pts</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-0.5">
                  <Gift size={13} className="text-emerald-400" />
                  <span>Discount Value</span>
                </div>
                <div className="text-lg font-extrabold text-emerald-400">K{pointsValue.toFixed(2)} Off</div>
              </div>
            </div>

            {/* How It Works Row */}
            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">1</span>
                <span>Share your 7-digit code</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">2</span>
                <span>Friend signs up (+25 pts bonus)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">3</span>
                <span>You earn 25 pts instantly</span>
              </div>
            </div>
          </div>

          {/* Points Activity & Tracking History Card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">Points Activity & Tracking</h4>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {user.pointsHistory?.length || 1} transactions
              </span>
            </div>

            <div className="space-y-2.5">
              {Array.isArray(user.pointsHistory) && user.pointsHistory.length > 0 ? (
                user.pointsHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-500 flex items-center justify-center font-bold text-base shrink-0">
                        {item.type === 'welcome' ? '🎓' : item.type === 'referral_used' ? '🎁' : item.type === 'friend_joined' ? '🚀' : '💈'}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white m-0">{item.title}</h5>
                        <span className="text-[10px] text-slate-400">
                          {item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-extrabold text-emerald-500 shrink-0">
                      +{item.points} Pts
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-500 flex items-center justify-center font-bold text-base shrink-0">
                      🎓
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white m-0">Welcome to UniHair Shop Bonus</h5>
                      <span className="text-[10px] text-slate-400">Account registration</span>
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-emerald-500 shrink-0">
                    +{user.loyaltyPoints || 50} Pts
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) { setRescheduleModal(null); setDateError(''); } }}
          role="dialog"
          aria-modal="true"
          aria-label="Reschedule appointment"
        >
          <div className="modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => { setRescheduleModal(null); setDateError(''); }}
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Reschedule Appointment</h2>
            <p className="text-xs text-slate-400 mb-4">{rescheduleModal.serviceName}</p>

            <div className="form-group">
              <label className="form-label" htmlFor="reschedule-date">New Date:</label>
              <input
                id="reschedule-date"
                type="date"
                className={`form-input ${dateError ? 'error' : ''}`}
                value={newDate}
                min={today}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  if (dateError) setDateError('');
                }}
              />
              {dateError && <p className="form-error-text">{dateError}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reschedule-time">New Time Slot:</label>
              <select
                id="reschedule-time"
                className="form-select"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              >
                {['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'].map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <button
                className="apple-btn-secondary text-xs"
                onClick={() => { setRescheduleModal(null); setDateError(''); }}
              >
                Cancel
              </button>
              <button
                className="apple-btn-primary text-xs"
                onClick={handleConfirmReschedule}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Footer Links */}
      <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-2">
        <button onClick={() => setActiveTab('legal')} className="bg-transparent border-0 cursor-pointer p-0 hover:text-slate-600 dark:hover:text-slate-200 underline">
          Terms of Service
        </button>
        <span>·</span>
        <button onClick={() => setActiveTab('legal')} className="bg-transparent border-0 cursor-pointer p-0 hover:text-slate-600 dark:hover:text-slate-200 underline">
          Privacy Policy
        </button>
        <span>·</span>
        <button onClick={() => setActiveTab('legal')} className="bg-transparent border-0 cursor-pointer p-0 hover:text-slate-600 dark:hover:text-slate-200 underline">
          Refund Policy
        </button>
      </div>

      {/* BOOKING DETAILS MODAL */}
      {selectedBookingDetail && (
        <BookingDetailModal
          booking={selectedBookingDetail}
          onClose={() => setSelectedBookingDetail(null)}
          onReschedule={(b) => {
            setSelectedBookingDetail(null);
            setRescheduleModal(b);
            setNewDate(b.date || today);
            setNewTime(b.time || '14:00');
            setDateError('');
          }}
          onCancel={(id) => {
            setSelectedBookingDetail(null);
            cancelBooking(id);
          }}
        />
      )}
    </div>
  );
}
