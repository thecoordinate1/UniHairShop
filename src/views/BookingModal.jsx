import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, CheckCircle, ArrowRight, Shield, MessageSquare, MapPin, ArrowLeft } from 'lucide-react';
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

  // Press Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setBookingService]);

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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleBackdropClick}>
        <div className="modal-card max-w-lg" onClick={(e) => e.stopPropagation()}>
          {/* Prominent X Close Button */}
          <button className="modal-close" onClick={handleClose} title="Close booking (Esc)" aria-label="Close modal">
            <X size={20} />
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
              <div className="grid grid-cols-2 gap-3 form-group">
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
                  placeholder="e.g. UNILUS Silverest Hostel Block C Room 14"
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

              {/* Action Buttons */}
              <button
                className="btn-primary w-full mt-2"
                onClick={() => setShowLencoWizard(true)}
              >
                <span>Proceed to Payment (K {bookingService.price})</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handleClose}
                className="w-full text-center text-xs text-slate-400 hover:text-white mt-3 flex items-center justify-center gap-1 bg-transparent border-0"
              >
                <ArrowLeft size={14} />
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
                  href={`https://wa.me/260772822579?text=Hi%20UniHairShop,%20I%20just%20booked%20${confirmedBooking.serviceName}%20at%20${confirmedBooking.campus}%20ref:${confirmedBooking.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-success w-full text-xs"
                >
                  <MessageSquare size={16} />
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
