import React, { useState } from 'react';
import { User, Phone, Award, Calendar, Package, Heart, RefreshCw, XCircle, Share2, LogOut, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AccountView() {
  const { user, setUser, bookings, orders, cancelBooking, rescheduleBooking, services, products, toggleFavorite, addToast } = useApp();
  const [accountTab, setAccountTab] = useState('bookings'); // 'bookings', 'orders', 'favorites'
  const [rescheduleModal, setRescheduleModal] = useState(null); // booking to reschedule
  const [newDate, setNewDate] = useState('2026-08-23');
  const [newTime, setNewTime] = useState('15:00');
  const [showLoginModal, setShowLoginModal] = useState(!user.isLoggedIn);
  const [loginPhone, setLoginPhone] = useState(user.phone || '');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(1);

  const handleLoginSubmit = () => {
    if (otpStep === 1) {
      if (!loginPhone || loginPhone.length < 10) {
        addToast('Please enter a valid phone number (e.g. 0971234567)', 'info');
        return;
      }
      setOtpStep(2);
      addToast(`OTP sent via SMS to ${loginPhone}! Enter 1234 to log in.`, 'success');
    } else {
      setUser((prev) => ({
        ...prev,
        isLoggedIn: true,
        phone: loginPhone
      }));
      setShowLoginModal(false);
      addToast('Logged in successfully!', 'success');
    }
  };

  const handleShareReferral = () => {
    navigator.clipboard.writeText(`Use my code ${user.referralCode} on UniHairShop to get K15 off your haircut or braids! https://unihairshop.co.zm`);
    addToast('Referral link copied to clipboard!', 'success');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile Header */}
      <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, var(--card-bg) 0%, rgba(15, 23, 42, 0.9) 100%)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary)', color: 'var(--text-dark)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem' }}>
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#fff' }}>{user.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone: {user.phone} | {user.hostel}</p>
          </div>
        </div>

        {/* Loyalty Points Badge */}
        <div style={{ background: 'rgba(255, 184, 0, 0.15)', border: '1px solid rgba(255, 184, 0, 0.3)', padding: '10px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Award size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Student Loyalty Points</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>{user.loyaltyPoints} Pts</span>
          </div>
        </div>
      </div>

      {/* Student Referral Card */}
      <div style={{ background: 'rgba(0, 200, 83, 0.1)', border: '1px dashed #00E676', padding: '14px 20px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', margin: 0 }}>Invite Friends & Save Money!</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Give friends K15 off and get K15 credit when they book. Code: <strong>{user.referralCode}</strong></p>
        </div>
        <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} onClick={handleShareReferral}>
          <Share2 size={14} />
          <span>Copy Referral Link</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <button
          onClick={() => setAccountTab('bookings')}
          style={{
            background: 'none',
            color: accountTab === 'bookings' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: accountTab === 'bookings' ? 700 : 500,
            fontSize: '0.95rem',
            paddingBottom: '6px',
            borderBottom: accountTab === 'bookings' ? '2px solid var(--primary)' : 'none'
          }}
        >
          My Bookings ({bookings.length})
        </button>

        <button
          onClick={() => setAccountTab('orders')}
          style={{
            background: 'none',
            color: accountTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: accountTab === 'orders' ? 700 : 500,
            fontSize: '0.95rem',
            paddingBottom: '6px',
            borderBottom: accountTab === 'orders' ? '2px solid var(--primary)' : 'none'
          }}
        >
          My Shop Orders ({orders.length})
        </button>

        <button
          onClick={() => setAccountTab('favorites')}
          style={{
            background: 'none',
            color: accountTab === 'favorites' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: accountTab === 'favorites' ? 700 : 500,
            fontSize: '0.95rem',
            paddingBottom: '6px',
            borderBottom: accountTab === 'favorites' ? '2px solid var(--primary)' : 'none'
          }}
        >
          Favorites ({user.favorites.length})
        </button>
      </div>

      {/* 1. BOOKINGS TAB */}
      {accountTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookings.map((b) => (
            <div key={b.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <span className="badge badge-in-stock" style={{ marginBottom: '4px' }}>{b.category}</span>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{b.serviceName}</h3>
                </div>
                <span className={`badge ${b.status === 'Confirmed' ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
                  {b.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                <div>Stylist: <strong style={{ color: '#fff' }}>{b.staffName}</strong></div>
                <div>Date & Time: <strong style={{ color: 'var(--primary)' }}>{b.date} at {b.time}</strong></div>
                <div>Price: <strong style={{ color: 'var(--primary)' }}>K {b.price}</strong></div>
                <div>Payment: <strong style={{ color: '#00E676' }}>{b.paymentMethod}</strong></div>
              </div>

              {b.status === 'Confirmed' && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => setRescheduleModal(b)}
                  >
                    <RefreshCw size={14} />
                    <span>Reschedule</span>
                  </button>
                  <button
                    style={{ background: 'rgba(255, 62, 108, 0.15)', color: 'var(--accent)', border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((ord) => (
            <div key={ord.id} className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#fff' }}>Order #{ord.id}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Date: {ord.createdAt}</p>
                </div>
                <span className="price-tag">K {ord.totalAmount}</span>
              </div>

              {/* Status Timeline */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Order Status Progress:</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {['Pending', 'Processing', 'Ready for Pickup', 'Delivered'].map((stepName, idx) => {
                    const steps = ['Pending', 'Processing', 'Ready for Pickup', 'Delivered'];
                    const currentIdx = steps.indexOf(ord.status);
                    const isPassed = idx <= currentIdx;
                    return (
                      <div key={stepName} style={{ textAlign: 'center', flex: 1, zIndex: 2 }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isPassed ? '#00E676' : '#334155', color: isPassed ? '#000' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: '0.75rem', fontWeight: 800 }}>
                          {idx + 1}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: isPassed ? '#00E676' : 'var(--text-muted)', fontWeight: isPassed ? 700 : 400, display: 'block' }}>
                          {stepName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
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
              <div key={srv.id} className="card" style={{ padding: '12px', display: 'flex', gap: '12px' }}>
                <img src={srv.image} alt={srv.name} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>{srv.name}</h4>
                  <span className="price-tag" style={{ fontSize: '0.9rem' }}>K {srv.price}</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '12px' }}>Reschedule Appointment</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{rescheduleModal.serviceName}</p>

            <div className="form-group">
              <label className="form-label">New Date:</label>
              <input type="date" className="form-input" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">New Time Slot:</label>
              <input type="time" className="form-input" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setRescheduleModal(null)}>Cancel</button>
              <button
                className="btn-primary"
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
