import React, { useState } from 'react';
import { X, Calendar, Clock, User, CheckCircle, ArrowRight, Shield, MessageSquare, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LencoCheckoutWizard from '../components/LencoCheckoutWizard';

export default function BookingModal() {
  const { bookingService, setBookingService, staffList, createBooking, setActiveTab, user, currentCampus, lusakaUniversities } = useApp();

  const [selectedStaff, setSelectedStaff] = useState('Any Available Specialist');
  const [selectedDate, setSelectedDate] = useState('2026-08-22');
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [selectedCampus, setSelectedCampus] = useState(currentCampus);
  const [hostel, setHostel] = useState(user.hostel || 'UNILUS Silverest Hostel, Block C');
  const [phone, setPhone] = useState(user.phone || '0971234567');
  const [showLencoWizard, setShowLencoWizard] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!bookingService) return null;

  const availableTimeSlots = [
    '09:00 AM', '10:30 AM', '12:00 PM',
    '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'
  ];

  const handleLencoSuccess = (lencoResult) => {
    setShowLencoWizard(false);
    const newBooking = createBooking({
      serviceId: bookingService.id,
      serviceName: bookingService.name,
      category: bookingService.category,
      price: bookingService.price,
      staffName: selectedStaff,
      date: selectedDate,
      time: selectedTime,
      campus: selectedCampus,
      hostel,
      paymentMethod: lencoResult.paymentMethod,
      lencoRef: lencoResult.lencoReference
    });
    setConfirmedBooking(newBooking);
  };

  const handleClose = () => {
    setBookingService(null);
    setConfirmedBooking(null);
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-card">
          <button className="modal-close" onClick={handleClose}>
            <X size={18} />
          </button>

          {!confirmedBooking ? (
            <div>
              {/* Header */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                <span className="badge badge-in-stock" style={{ marginBottom: '6px' }}>
                  {bookingService.category}
                </span>
                <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{bookingService.name}</h3>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Duration: {bookingService.duration} mins</span>
                  <span className="price-tag" style={{ fontSize: '0.95rem' }}>K {bookingService.price}</span>
                </div>
              </div>

              {/* Campus Selector */}
              <div className="form-group">
                <label className="form-label">Lusaka Campus Location:</label>
                <select
                  className="form-select"
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                >
                  {lusakaUniversities.map((uni) => (
                    <option key={uni.id} value={uni.name}>
                      {uni.name} ({uni.area})
                    </option>
                  ))}
                </select>
              </div>

              {/* 1. Select Staff */}
              <div className="form-group">
                <label className="form-label">Choose Stylist / Technician:</label>
                <select
                  className="form-select"
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                >
                  <option value="Any Available Specialist">Any Available Specialist (Recommended)</option>
                  {staffList.map((stf) => (
                    <option key={stf.id} value={stf.name}>
                      {stf.name} ({stf.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Date & Time Slot */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="form-group">
                <div>
                  <label className="form-label">Appointment Date:</label>
                  <input
                    type="date"
                    className="form-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Time Slot:</label>
                  <select
                    className="form-select"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    {availableTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Customer Info */}
              <div className="form-group">
                <label className="form-label">Hostel Name & Room Number:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. UNILUS Silverest Hostel, Block C Room 14"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Contact (for SMS/WhatsApp Confirmation):</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 0971234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Action */}
              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
                onClick={() => setShowLencoWizard(true)}
              >
                <span>Proceed to Payment (K {bookingService.price})</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            /* Booking Confirmation Ticket */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ background: 'rgba(0, 200, 83, 0.2)', color: '#00E676', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={38} />
              </div>

              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '4px' }}>Appointment Confirmed!</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Booking Ref: <strong style={{ color: 'var(--primary)' }}>{confirmedBooking.id}</strong>
              </p>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.85rem', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Campus:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{confirmedBooking.campus}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Service:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{confirmedBooking.serviceName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Stylist:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{confirmedBooking.staffName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{confirmedBooking.date} at {confirmedBooking.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                  <span style={{ color: '#00E676', fontWeight: 600 }}>{confirmedBooking.paymentMethod}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href={`https://wa.me/260971234567?text=Hi%20UniHairShop,%20I%20just%20booked%20${confirmedBooking.serviceName}%20at%20${confirmedBooking.campus}%20ref:${confirmedBooking.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-success"
                  style={{ width: '100%' }}
                >
                  <MessageSquare size={16} />
                  <span>Send Confirmation to WhatsApp</span>
                </a>

                <button
                  className="btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    handleClose();
                    setActiveTab('account');
                  }}
                >
                  View Bookings in Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLencoWizard && (
        <LencoCheckoutWizard
          amount={bookingService.price}
          title={`Booking (${selectedCampus}): ${bookingService.name}`}
          onSuccess={handleLencoSuccess}
          onClose={() => setShowLencoWizard(false)}
          allowPayOnArrival={true}
        />
      )}
    </>
  );
}
