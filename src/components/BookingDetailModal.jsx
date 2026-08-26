import React, { useEffect } from 'react';
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
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BookingDetailModal({ booking, onClose, onReschedule, onCancel }) {
  const { exportToCalendar, staffList } = useApp();

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
              <span className="text-slate-400">Payment Method</span>
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <CreditCard size={12} className="text-emerald-500" />
                <span>{booking.paymentMethod || 'Lenco Mobile Money'}</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Base Service Fee</span>
              <span className="font-semibold text-slate-900 dark:text-white">K {basePrice}</span>
            </div>
            {booking.locationMode === 'dorm' && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Dorm Travel & Campus Safety Fee</span>
                <span className="font-semibold text-slate-900 dark:text-white">K 25</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/10">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Total Amount</span>
              <span className="price-tag text-base">K {totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2 justify-end mt-5 pt-3 border-t border-black/5 dark:border-white/10">
          <button
            onClick={() => exportToCalendar(booking)}
            className="apple-btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            title="Download .ics calendar sync invite"
          >
            <Download size={14} />
            <span>Sync to Calendar</span>
          </button>

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
