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
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AccountView() {
  const {
    user,
    signOut,
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
    toggleUserMode
  } = useApp();

  const [accountTab, setAccountTab] = useState('bookings');
  const [rescheduleModal, setRescheduleModal] = useState(null);
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

  const handleShareReferral = async () => {
    const text = `Use my student code ${user.referralCode} on UniHairShop to get K15 off your haircut, braids, or salon appointment!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UniHairShop Student Discount',
          text,
          url: window.location.origin
        });
        addToast('Referral invitation opened!', 'success');
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      addToast('Referral link copied to clipboard!', 'success');
    } else {
      addToast(`Your referral code is: ${user.referralCode}`, 'info');
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

  const favoriteServices = services.filter((s) => user.favorites?.includes(s.id));

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
        <div className="flex items-center gap-2">
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
                title="Sign out of account"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
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
          <div className="bg-amber-400/15 border border-amber-400/30 p-2.5 rounded-2xl flex items-center gap-2.5 backdrop-blur-md shadow-sm">
            <Award size={20} className="text-amber-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[9px] text-slate-300 font-semibold uppercase tracking-wider block">Points</span>
              <span className="text-sm font-extrabold text-amber-400">{user.loyaltyPoints} Pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
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

              <button type="submit" className="apple-btn-primary w-full text-xs py-2.5 mt-2">
                <span>Save Profile Changes</span>
                <CheckCircle2 size={14} />
              </button>
            </form>
          </div>
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
        {/* Referral Card */}
        <div className="card p-4 flex items-center justify-between gap-3 border-emerald-500/30 bg-emerald-500/5">
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white m-0 truncate">Invite Friends & Get K15</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0 mt-0.5">Code: <strong className="text-amber-500">{user.referralCode}</strong></p>
          </div>
          <button className="apple-btn-secondary text-xs px-3 py-1.5 shrink-0" onClick={handleShareReferral}>
            <Share2 size={13} />
            <span>Share</span>
          </button>
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
          Favorites ({user.favorites.length})
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
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{b.serviceName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Location: {b.campus} ({b.hostel || 'Campus'})</p>
                  </div>
                  <span className={`badge ${b.status === 'Confirmed' ? 'badge-in-stock' : b.status === 'Completed' ? 'badge-verified' : 'badge-out-of-stock'}`}>
                    {b.status}
                  </span>
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
                    <strong className="text-emerald-500 font-medium">{b.paymentMethod}</strong>
                  </div>
                </div>

                {b.status === 'Confirmed' && (
                  <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-black/5 dark:border-white/10">
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
                  </div>
                )}
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
    </div>
  );
}
