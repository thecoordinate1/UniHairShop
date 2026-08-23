import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, CheckCircle, ArrowRight, Shield, MessageSquare, MapPin, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LencoCheckoutWizard from '../components/LencoCheckoutWizard';

export default function BookingModal() {
  const { bookingService, setBookingService, staffList, createBooking, setActiveTab, user, currentCampus, lusakaUniversities, addToast } = useApp();

  const [selectedStaff, setSelectedStaff] = useState('Any Available Specialist');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [selectedCampus, setSelectedCampus] = useState(currentCampus);
  const [hostel, setHostel] = useState(user.hostel || 'UNILUS Silverest Hostel, Block C');
  const [phone, setPhone] = useState(user.phone || '0971234567');
  const [showLencoWizard, setShowLencoWizard] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errors, setErrors] = useState({});

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!bookingService) return;

    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [bookingService]);

  if (!bookingService) return null;

  const availableTimeSlots = [
    '09:00 AM', '10:30 AM', '12:00 PM',
    '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'
  ];

  const today = new Date().toISOString().split('T')[0];

  const validate = () => {
    const newErrors = {};
    if (selectedDate < today) {
      newErrors.date = 'Cannot book in the past. Please select today or a future date.';
    }
    if (!phone || phone.replace(/\s/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid Zambian phone number (at least 10 digits).';
    }
    if (!hostel.trim()) {
      newErrors.hostel = 'Please enter your hostel name and room number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (!validate()) {
      addToast('Please fix the errors above before proceeding.', 'error');
      return;
    }
    setShowLencoWizard(true);
  };

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
    setErrors({});
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={`Book ${bookingService.name}`}>
        <div className="modal-card max-w-lg" onClick={(e) => e.stopPropagation()}>
          {/* iOS Sheet Drag Handle */}
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" aria-hidden="true"></div>

          {/* Prominent X Close Button */}
          <button className="modal-close" onClick={handleClose} title="Close booking (Esc)" aria-label="Close modal">
            <X size={18} />
          </button>

          {!confirmedBooking ? (
            <div>
              {/* Header */}
              <div className="border-b border-white/10 pb-3 mb-4">
                <span className="badge badge-in-stock mb-1.5">
                  {bookingService.category}
                </span>
                <h3 className="text-xl font-bold text-white">{bookingService.name}</h3>
                <div className="flex gap-4 mt-1.5 text-xs text-slate-400">
                  <span>Duration: {bookingService.duration} mins</span>
                  <span className="price-tag text-base">K {bookingService.price}</span>
                </div>
              </div>

              {/* Campus Selector */}
              <div className="form-group">
                <label className="form-label" htmlFor="booking-campus">Lusaka Campus Location:</label>
                <select
                  id="booking-campus"
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
                <label className="form-label" htmlFor="booking-staff">Choose Stylist / Technician:</label>
                <select
                  id="booking-staff"
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
              <div className="grid grid-cols-2 gap-3 form-group">
                <div>
                  <label className="form-label" htmlFor="booking-date">Appointment Date:</label>
                  <input
                    id="booking-date"
                    type="date"
                    className={`form-input ${errors.date ? 'error' : ''}`}
                    value={selectedDate}
                    min={today}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                    }}
                  />
                  {errors.date && <p className="form-error-text">{errors.date}</p>}
                </div>

                <div>
                  <label className="form-label" htmlFor="booking-time">Time Slot:</label>
                  <select
                    id="booking-time"
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
                <label className="form-label" htmlFor="booking-hostel">Hostel Name & Room Number:</label>
                <input
                  id="booking-hostel"
                  type="text"
                  className={`form-input ${errors.hostel ? 'error' : ''}`}
                  placeholder="e.g. UNILUS Silverest Hostel Block C Room 14"
                  value={hostel}
                  onChange={(e) => {
                    setHostel(e.target.value);
                    if (errors.hostel) setErrors((prev) => ({ ...prev, hostel: undefined }));
                  }}
                />
                {errors.hostel && <p className="form-error-text">{errors.hostel}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="booking-phone">Mobile Contact (for SMS/WhatsApp Confirmation):</label>
                <input
                  id="booking-phone"
                  type="tel"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="e.g. 0971234567"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                />
                {errors.phone && <p className="form-error-text">{errors.phone}</p>}
              </div>

              {/* Action Buttons */}
              <button
                className="btn-primary w-full mt-2"
                onClick={handleProceedToPayment}
              >
                <span>Proceed to Payment (K {bookingService.price})</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>

              <button
                onClick={handleClose}
                className="w-full text-center text-xs text-slate-400 hover:text-white mt-3 flex items-center justify-center gap-1 bg-transparent border-0"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                <span>Cancel & Return</span>
              </button>
            </div>
          ) : (
            /* Booking Confirmation Ticket */
            <div className="text-center py-2">
              <div className="bg-emerald-500/20 text-emerald-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={38} />
              </div>

              <h2 className="text-xl font-bold text-white mb-1">Appointment Confirmed!</h2>
              <p className="text-xs text-slate-400 mb-4">
                Booking Ref: <strong className="text-amber-400">{confirmedBooking.id}</strong>
              </p>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 text-left text-xs mb-5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Campus:</span>
                  <span className="text-amber-400 font-bold">{confirmedBooking.campus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="text-white font-semibold">{confirmedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stylist:</span>
                  <span className="text-white font-semibold">{confirmedBooking.staffName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time:</span>
                  <span className="text-amber-400 font-bold">{confirmedBooking.date} at {confirmedBooking.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="text-emerald-400 font-semibold">{confirmedBooking.paymentMethod}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/260772822579?text=Hi%20UniHairShop,%20I%20just%20booked%20${encodeURIComponent(confirmedBooking.serviceName)}%20at%20${encodeURIComponent(confirmedBooking.campus)}%20ref:${confirmedBooking.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-success w-full text-xs"
                >
                  <MessageSquare size={16} aria-hidden="true" />
                  <span>Send Confirmation to WhatsApp (+260 772 822579)</span>
                </a>

                <button
                  className="btn-secondary w-full text-xs"
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
