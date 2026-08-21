import React, { useState, useEffect } from 'react';
import { User, Phone, Award, Calendar, Package, Heart, RefreshCw, XCircle, Share2, LogOut, CheckCircle, Clock, X, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AccountView() {
  const { user, setUser, bookings, orders, cancelBooking, rescheduleBooking, services, products, toggleFavorite, addToast } = useApp();
  const [accountTab, setAccountTab] = useState('bookings');
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('2026-08-23');
  const [newTime, setNewTime] = useState('15:00');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setRescheduleModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleShareReferral = () => {
    navigator.clipboard.writeText(`Use my code ${user.referralCode} on UniHairShop to get K15 off your haircut or braids! https://unihairshop.co.zm`);
    addToast('Referral link copied to clipboard!', 'success');
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Profile Header */}
      <div className="card p-6 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400 text-slate-950 w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-2xl">
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-xs text-slate-400">Phone: {user.phone} | {user.hostel}</p>
          </div>
        </div>

        {/* Loyalty Points Badge */}
        <div className="bg-amber-400/15 border border-amber-400/30 p-3 rounded-xl flex items-center gap-3">
          <Award size={24} className="text-amber-400" />
          <div>
            <span className="text-[11px] text-slate-400 block">Student Loyalty Points</span>
            <span className="text-lg font-extrabold text-amber-400">{user.loyaltyPoints} Pts</span>
          </div>
        </div>
      </div>

      {/* Student Referral Card */}
      <div className="bg-emerald-500/10 border border-dashed border-emerald-500 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm font-bold text-white m-0">Invite Friends & Save Money!</p>
          <p className="text-xs text-slate-400 m-0">Give friends K15 off and get K15 credit when they book. Code: <strong>{user.referralCode}</strong></p>
        </div>
        <button className="btn-secondary text-xs px-3 py-2" onClick={handleShareReferral}>
          <Share2 size={14} />
          <span>Copy Referral Link</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-2">
        <button
          onClick={() => setAccountTab('bookings')}
          className={`pb-2 text-sm font-medium transition-colors bg-transparent border-0 ${
            accountTab === 'bookings' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          My Bookings ({bookings.length})
        </button>

        <button
          onClick={() => setAccountTab('orders')}
          className={`pb-2 text-sm font-medium transition-colors bg-transparent border-0 ${
            accountTab === 'orders' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          My Shop Orders ({orders.length})
        </button>

        <button
          onClick={() => setAccountTab('favorites')}
          className={`pb-2 text-sm font-medium transition-colors bg-transparent border-0 ${
            accountTab === 'favorites' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Favorites ({user.favorites.length})
        </button>
      </div>

      {/* 1. BOOKINGS TAB */}
      {accountTab === 'bookings' && (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <div key={b.id} className="card p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="badge badge-in-stock mb-1">{b.category}</span>
                  <h3 className="text-base font-bold text-white">{b.serviceName}</h3>
                </div>
                <span className={`badge ${b.status === 'Confirmed' ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
                  {b.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400 mb-3">
                <div>Stylist: <strong className="text-white">{b.staffName}</strong></div>
                <div>Date & Time: <strong className="text-amber-400">{b.date} at {b.time}</strong></div>
                <div>Price: <strong className="text-amber-400">K {b.price}</strong></div>
                <div>Payment: <strong className="text-emerald-400">{b.paymentMethod}</strong></div>
              </div>

              {b.status === 'Confirmed' && (
                <div className="flex gap-2 justify-end pt-2 border-t border-white/10">
                  <button
                    className="btn-secondary text-xs px-3 py-1.5"
                    onClick={() => setRescheduleModal(b)}
                  >
                    <RefreshCw size={14} />
                    <span>Reschedule</span>
                  </button>
                  <button
                    className="bg-pink-500/15 text-pink-400 border-0 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-pink-500/25"
                    onClick={() => cancelBooking(b.id)}
                  >
                    <XCircle size={14} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. ORDERS TAB WITH ORDER STATUS TRACKER */}
      {accountTab === 'orders' && (
        <div className="flex flex-col gap-4">
          {orders.map((ord) => (
            <div key={ord.id} className="card p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Order #{ord.id}</h4>
                  <p className="text-[11px] text-slate-400">Date: {ord.createdAt}</p>
                </div>
                <span className="price-tag text-base">K {ord.totalAmount}</span>
              </div>

              {/* Status Timeline */}
              <div className="bg-slate-900/80 p-3 rounded-xl mb-3">
                <p className="text-[11px] text-slate-400 mb-2">Order Status Progress:</p>
                <div className="flex justify-between relative">
                  {['Pending', 'Processing', 'Ready for Pickup', 'Delivered'].map((stepName, idx) => {
                    const steps = ['Pending', 'Processing', 'Ready for Pickup', 'Delivered'];
                    const currentIdx = steps.indexOf(ord.status);
                    const isPassed = idx <= currentIdx;
                    return (
                      <div key={stepName} className="text-center flex-1 z-10">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 text-[11px] font-extrabold ${isPassed ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-400'}`}>
                          {idx + 1}
                        </div>
                        <span className={`text-[10px] block ${isPassed ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Items ({ord.items.length}): {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. FAVORITES TAB */}
      {accountTab === 'favorites' && (
        <div className="grid-2">
          {services
            .filter((s) => user.favorites.includes(s.id))
            .map((srv) => (
              <div key={srv.id} className="card p-3 flex gap-3">
                <img src={srv.image} alt={srv.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white mb-1">{srv.name}</h4>
                  <span className="price-tag text-sm">K {srv.price}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setRescheduleModal(null); }}>
          <div className="modal-card max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setRescheduleModal(null)} title="Close (Esc)"><X size={18} /></button>
            <h3 className="text-lg font-bold text-white mb-2">Reschedule Appointment</h3>
            <p className="text-xs text-slate-400 mb-4">{rescheduleModal.serviceName}</p>

            <div className="form-group">
              <label className="form-label">New Date:</label>
              <input type="date" className="form-input" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">New Time Slot:</label>
              <input type="time" className="form-input" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <button className="btn-secondary text-xs" onClick={() => setRescheduleModal(null)}>Cancel</button>
              <button
                className="btn-primary text-xs"
                onClick={() => {
                  rescheduleBooking(rescheduleModal.id, newDate, newTime);
                  setRescheduleModal(null);
                }}
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
