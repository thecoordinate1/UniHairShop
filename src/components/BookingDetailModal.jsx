import React, { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Scissors,
  Download,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  CreditCard,
  Building,
  RefreshCw,
  XCircle,
  Tag,
  ShieldAlert,
  Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BookingDetailModal({ booking, onClose, onReschedule, onCancel }) {
  const { exportToCalendar, staffList, claimNoShowRefund, claimClientNoShow, userMode, reviews, submitReview } = useApp();

  const [ratingValue, setRatingValue] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!booking) return;

    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [booking, onClose]);

  if (!booking) return null;

  // Find matching stylist profile
  const stylist = staffList.find(
    (s) => s.id === booking.staffId || s.name === booking.staffName || booking.staffName?.includes(s.name)
  ) || {
    name: booking.staffName || 'Campus Stylist',
    role: 'Hair & Beauty Specialist',
    phone: booking.staffPhone || '0971234567',
    avatar: '/images/barber_service.jpg',
    dormLocation: booking.hostel || 'Hostel Studio'
  };

  const isCompleted = booking.status === 'Completed';
  const isCancelled = booking.status === 'Cancelled';
  const isConfirmed = booking.status === 'Confirmed' || !isCancelled;

  const basePrice = Number(booking.price) || 80;
  const totalPrice = Number(booking.totalPrice) || basePrice;
  const addOns = booking.addOns || [];

  const existingReview = reviews.find((r) => (r.bookingId || r.booking_id) === booking.id);

  const handleSubmitReview = async () => {
    if (ratingValue < 1) return;
    setSubmittingReview(true);
    try {
      await submitReview(booking.id, ratingValue, reviewComment.trim());
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card max-w-lg" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close booking details">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-mono font-bold text-slate-400">Ref: #{booking.id}</span>
          <span className={`badge text-[10px] py-0.5 px-2 ${
            isCompleted ? 'badge-in-stock' : isConfirmed ? 'badge-verified' : 'badge-out-of-stock'
          }`}>
            {booking.status}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight m-0 mb-4">
          Appointment Details
        </h2>

        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Service Card */}
          <div className="card p-4 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-400/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm shrink-0">
                <Scissors size={22} />
              </div>
              <div>
                <span className="badge badge-in-stock text-[9px] mb-1">{booking.category || 'Beauty Service'}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">{booking.serviceName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">Est. Duration: {booking.duration || 45} mins</p>
              </div>
            </div>
            <span className="price-tag text-lg">K {totalPrice}</span>
          </div>

          {/* Stylist Profile Block */}
          <div className="card p-4 border border-black/10 dark:border-white/10">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Campus Stylist</h4>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={stylist.avatar || '/images/barber_service.jpg'}
                  alt={stylist.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-black/10 dark:border-white/10 shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">{stylist.name}</h4>
                  <p className="text-xs text-amber-500 font-semibold m-0">{stylist.role}</p>
                  <p className="text-[11px] text-slate-400 m-0 mt-0.5">{stylist.dormLocation || 'Hostel Studio'}</p>
                </div>
              </div>

              <a
                href={`https://wa.me/260${(stylist.phone || '0971234567').replace(/^0/, '')}?text=Hi%20${encodeURIComponent(stylist.name)},%20im%20contacting%20you%20about%20my%20UniHairShop%20booking%20%23${booking.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="apple-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold"
              >
                <MessageSquare size={13} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Timing & Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <Calendar size={13} className="text-amber-500" />
                <span>Appointment Schedule</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white m-0">
                {booking.date}
              </p>
              <p className="text-xs text-amber-500 font-semibold m-0">
                {booking.time}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <MapPin size={13} className="text-amber-500" />
                <span>Location Mode</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white m-0 truncate">
                {booking.locationMode === 'dorm' ? 'Dorm Room Visit' : 'Stylist Dorm Studio'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 m-0 truncate">
                {booking.campus} • {booking.hostel || 'Hostel Room'}
              </p>
            </div>
          </div>

          {/* Chosen Add-ons */}
          {addOns.length > 0 && (
            <div className="card p-3.5 border border-black/10 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white mb-2">
                <Sparkles size={13} className="text-amber-500" />
                <span>Included Add-On Treatments</span>
              </div>
              <div className="space-y-1.5">
                {addOns.map((add, i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>{add.name}</span>
                    <span className="font-semibold text-amber-500">+K {add.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment & Financial Ledger */}
          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Payment Status</span>
              <span className="font-bold text-emerald-500 flex items-center gap-1">
                <CreditCard size={12} className="text-emerald-500" />
                <span>{booking.paymentStatus || booking.paymentMethod || 'Paid'}</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Base Service Fee</span>
              <span className="font-semibold text-slate-900 dark:text-white">K {basePrice}</span>
            </div>
            {booking.depositAmount > 0 && (
              <div className="flex justify-between items-center text-xs text-emerald-600 font-semibold">
                <span>Commitment Deposit Paid</span>
                <span>-K {booking.depositAmount}</span>
              </div>
            )}
            {booking.balanceDue > 0 && (
              <div className="flex justify-between items-center text-xs text-amber-500 font-bold">
                <span>Balance Due on Arrival</span>
                <span>K {booking.balanceDue}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/10">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Total Booking Value</span>
              <span className="price-tag text-base">K {totalPrice}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/10 text-xs">
              <span className="text-slate-400">Hostel Safety Verification Code:</span>
              <span className="font-mono font-bold text-amber-500">SEC-{(booking.id || '4912').slice(-4)}</span>
            </div>
          </div>

          {/* Rate Your Stylist — real reviews, only after a completed booking */}
          {isCompleted && userMode === 'customer' && (
            <div className="card p-4 border border-amber-400/25 bg-amber-400/5">
              {existingReview ? (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Your Review</h4>
                  <div className="flex items-center gap-1 mb-1.5">
                    {[...Array(existingReview.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#F5A623" className="text-amber-400" />
                    ))}
                  </div>
                  {existingReview.comment && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 m-0 italic">"{existingReview.comment}"</p>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Rate Your Stylist</h4>
                  <div className="flex items-center gap-1 mb-2.5" role="radiogroup" aria-label="Star rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingValue(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="bg-transparent border-0 cursor-pointer p-0.5"
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star size={22} fill={(hoverRating || ratingValue) >= star ? '#F5A623' : 'none'} className={(hoverRating || ratingValue) >= star ? 'text-amber-400' : 'text-slate-400'} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    className="form-input text-xs mb-2.5"
                    placeholder="Optional: tell other students how it went"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={ratingValue < 1 || submittingReview}
                    className="apple-btn-primary text-xs px-4 py-2 w-full"
                  >
                    {submittingReview ? 'Submitting…' : 'Submit Review'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2 justify-end mt-5 pt-3 border-t border-black/5 dark:border-white/10">
          <button
            onClick={() => exportToCalendar(booking)}
            className="apple-btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            title="Download .ics calendar sync invite"
          >
            <Download size={14} />
            <span>Sync (.ics)</span>
          </button>

          {!isCancelled && !isCompleted && userMode === 'customer' && (
            <button
              onClick={() => {
                claimNoShowRefund(booking.id);
                onClose();
              }}
              className="bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-400/40 text-xs px-3.5 py-2 rounded-full font-bold flex items-center gap-1.5 hover:bg-amber-400/25 transition-all cursor-pointer"
              title="Stylist is late or did not arrive at your room"
            >
              <ShieldAlert size={14} />
              <span>Stylist No-Show (Claim Refund)</span>
            </button>
          )}

          {!isCancelled && !isCompleted && userMode === 'vendor' && (
            <button
              onClick={() => {
                claimClientNoShow(booking.id);
                onClose();
              }}
              className="bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-400/40 text-xs px-3.5 py-2 rounded-full font-bold flex items-center gap-1.5 hover:bg-purple-400/25 transition-all cursor-pointer"
              title="Student client was unreachable or not in room"
            >
              <ShieldAlert size={14} />
              <span>Client No-Show (Claim Fee)</span>
            </button>
          )}

          {!isCancelled && !isCompleted && onReschedule && (
            <button
              onClick={() => onReschedule(booking)}
              className="apple-btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Reschedule</span>
            </button>
          )}

          {!isCancelled && !isCompleted && onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="apple-btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 text-rose-500 hover:border-rose-500/30"
            >
              <XCircle size={13} />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
