import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, CheckCircle, ArrowRight, ShieldCheck, MessageSquare, MapPin, ArrowLeft, Download, Plus, Check, Truck, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LencoCheckoutWizard from '../components/LencoCheckoutWizard';

export default function BookingModal() {
  const {
    bookingService,
    setBookingService,
    staffList,
    createBooking,
    exportToCalendar,
    setActiveTab,
    user,
    currentCampus,
    lusakaUniversities,
    addToast
  } = useApp();

  const [selectedStaff, setSelectedStaff] = useState('Any Available Specialist');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [selectedCampus, setSelectedCampus] = useState(currentCampus);
  const [serviceType, setServiceType] = useState('travel'); // 'travel' | 'studio'
  const [hostel, setHostel] = useState(user.hostel || 'UNILUS Silverest Hostel, Block C, Room 14');
  const [phone, setPhone] = useState(user.phone || '0971234567');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
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

  // Calculate pricing breakdown
  const basePrice = bookingService.price || 0;
  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const campusObj = lusakaUniversities.find((u) => u.name === selectedCampus) || lusakaUniversities[0];
  const travelFee = serviceType === 'travel' ? (campusObj.travelFee || 20) : 0;
  const serviceFee = 5; // Campus Safety & Support Fee (ZMW)
  const grandTotal = basePrice + addOnsTotal + travelFee + serviceFee;

  const toggleAddOn = (addon) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const validate = () => {
    const newErrors = {};
    if (selectedDate < today) {
      newErrors.date = 'Cannot book in the past. Please select today or a future date.';
    }
    if (!phone || phone.replace(/\s/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid Zambian phone number (at least 10 digits).';
    }
    if (serviceType === 'travel' && !hostel.trim()) {
      newErrors.hostel = 'Please specify your hostel block and room number for travel.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (!validate()) {
      addToast('Please fix the highlighted errors before proceeding.', 'error');
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
      basePrice,
      selectedAddOns,
      serviceType: serviceType === 'travel' ? 'Travel to Dorm' : 'Visit Studio',
      travelFee,
      serviceFee,
      totalPrice: grandTotal,
      price: grandTotal,
      staffName: selectedStaff,
      date: selectedDate,
      time: selectedTime,
      campus: selectedCampus,
      hostel: serviceType === 'travel' ? hostel : 'Campus Studio / Student Centre',
      paymentMethod: lencoResult.paymentMethod,
      lencoRef: lencoResult.lencoReference
    });
    setConfirmedBooking(newBooking);
  };

  const handleClose = () => {
    setBookingService(null);
    setConfirmedBooking(null);
    setSelectedAddOns([]);
    setErrors({});
  };

  return (
    <>
      <div
        className="modal-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label={`Book ${bookingService.name}`}
      >
        <div className="modal-card max-w-lg" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={handleClose} title="Close booking (Esc)" aria-label="Close modal">
            <X size={18} />
          </button>

          {!confirmedBooking ? (
            <div>
              {/* Service Header Summary */}
              <div className="border-b border-black/10 dark:border-white/10 pb-3.5 mb-4">
                <span className="badge badge-in-stock mb-1.5">{bookingService.category}</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{bookingService.name}</h3>
                <div className="flex gap-4 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>Duration: {bookingService.duration} mins</span>
                  <span className="price-tag text-base">Base: K {bookingService.price}</span>
                </div>
              </div>

              {/* 1. Service Delivery Mode Choice */}
              <div className="mb-4">
                <label className="form-label">Service Location Choice:</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setServiceType('travel')}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all text-left ${
                      serviceType === 'travel'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                        : 'border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Truck size={20} className="text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Travel to My Dorm</div>
                      <div className="text-[10px] text-slate-500">Stylist visits your room</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceType('studio')}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all text-left ${
                      serviceType === 'studio'
                        ? 'border-amber-400 bg-amber-400/15 text-amber-600 dark:text-amber-300 font-bold shadow-sm'
                        : 'border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Store size={20} className="text-amber-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Visit Stylist Studio</div>
                      <div className="text-[10px] text-slate-500">Salon / Room studio</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Campus & Stylist Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 form-group">
                <div>
                  <label className="form-label" htmlFor="booking-campus">Campus Location:</label>
                  <select
                    id="booking-campus"
                    className="form-select text-xs"
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                  >
                    {lusakaUniversities.map((uni) => (
                      <option key={uni.id} value={uni.name}>{uni.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" htmlFor="booking-staff">Stylist / Barber:</label>
                  <select
                    id="booking-staff"
                    className="form-select text-xs"
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                  >
                    <option value="Any Available Specialist">Any Available Specialist</option>
                    {staffList.map((stf) => (
                      <option key={stf.id} value={stf.name}>{stf.name} ({stf.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. Date & Interactive Time Slot Selection with Real-time Conflict Detection */}
              <div className="form-group">
                <label className="form-label" htmlFor="booking-date">Select Appointment Date:</label>
                <input
                  id="booking-date"
                  type="date"
                  min={today}
                  className={`form-input text-xs ${errors.date ? 'error' : ''}`}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (errors.date) setErrors((p) => ({ ...p, date: undefined }));
                  }}
                />
                {errors.date && <p className="form-error-text">{errors.date}</p>}
              </div>

              <div className="form-group mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="form-label mb-0">Select Time Slot:</label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Availability
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {availableTimeSlots.map((slot) => {
                    const isBooked = bookings.some((b) =>
                      b.status === 'Confirmed' &&
                      b.date === selectedDate &&
                      b.time === slot &&
                      (selectedStaff === 'Any Available Specialist' || b.staffName === selectedStaff)
                    );
                    const isSelected = selectedTime === slot && !isBooked;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all border cursor-pointer ${
                          isBooked
                            ? 'opacity-45 bg-rose-500/10 border-rose-500/20 text-rose-500 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#007AFF] border-[#007AFF] text-white shadow-apple-blue font-bold'
                            : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-amber-400/40'
                        }`}
                      >
                        <span>{slot}</span>
                        {isBooked && <span className="text-[8px] no-underline font-bold mt-0.5">Booked</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Add-Ons Selection */}
              {bookingService.addOns && bookingService.addOns.length > 0 && (
                <div className="mb-4">
                  <label className="form-label">Customize Service Add-Ons:</label>
                  <div className="space-y-2">
                    {bookingService.addOns.map((addon) => {
                      const isSelected = selectedAddOns.some((a) => a.id === addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddOn(addon)}
                          className={`p-2.5 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#007AFF] bg-[#007AFF]/10 text-slate-900 dark:text-white font-semibold'
                              : 'border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isSelected ? 'bg-[#007AFF] border-[#007AFF] text-white' : 'border-slate-400'}`}>
                              {isSelected && <Check size={12} />}
                            </div>
                            <span>{addon.name} (+{addon.duration}m)</span>
                          </div>
                          <span className="price-tag text-xs">+K {addon.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Customer Contact & Dorm Details */}
              {serviceType === 'travel' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="booking-hostel">Hostel Name & Room Number:</label>
                  <input
                    id="booking-hostel"
                    type="text"
                    className={`form-input text-xs ${errors.hostel ? 'error' : ''}`}
                    placeholder="e.g. UNILUS Silverest Hostel, Block C, Room 14"
                    value={hostel}
                    onChange={(e) => {
                      setHostel(e.target.value);
                      if (errors.hostel) setErrors((p) => ({ ...p, hostel: undefined }));
                    }}
                  />
                  {errors.hostel && <p className="form-error-text">{errors.hostel}</p>}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="booking-phone">Mobile Phone (for SMS / WhatsApp Confirmation):</label>
                <input
                  id="booking-phone"
                  type="tel"
                  className={`form-input text-xs ${errors.phone ? 'error' : ''}`}
                  placeholder="e.g. 0971234567"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
                  }}
                />
                {errors.phone && <p className="form-error-text">{errors.phone}</p>}
              </div>

              {/* Transparent Price Breakdown */}
              <div className="bg-black/[0.03] dark:bg-white/[0.04] p-3.5 rounded-2xl border border-black/5 dark:border-white/10 mb-4 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Base Service:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">K {basePrice}</span>
                </div>
                {addOnsTotal > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Selected Add-ons ({selectedAddOns.length}):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">+K {addOnsTotal}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Hostel Travel Fee:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{serviceType === 'travel' ? `+K ${travelFee}` : 'Free (In Studio)'}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Campus Safety & Support:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">+K {serviceFee}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-black/5 dark:border-white/10 text-sm font-extrabold text-slate-900 dark:text-white">
                  <span>Total Amount:</span>
                  <span className="price-tag text-base">K {grandTotal}</span>
                </div>
              </div>

              <button
                className="apple-btn-primary w-full text-xs py-3"
                onClick={handleProceedToPayment}
              >
                <span>Proceed to Payment (K {grandTotal})</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            /* Confirmation Screen with Instant .ics Calendar Sync */
            <div className="text-center py-2">
              <div className="bg-emerald-500/20 text-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={36} />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">Appointment Confirmed!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Booking Reference: <strong className="text-amber-500">{confirmedBooking.id}</strong>
              </p>

              <div className="bg-black/[0.02] dark:bg-white/[0.04] p-4 rounded-2xl border border-black/10 dark:border-white/10 text-left text-xs mb-5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{confirmedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="text-amber-500 font-bold">{confirmedBooking.date} at {confirmedBooking.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{confirmedBooking.campus} ({confirmedBooking.hostel})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="price-tag text-sm">K {confirmedBooking.totalPrice}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {/* Instant .ics Calendar Sync Button */}
                <button
                  onClick={() => exportToCalendar(confirmedBooking)}
                  className="apple-btn-secondary w-full text-xs flex items-center justify-center gap-2 py-2.5"
                >
                  <Download size={15} />
                  <span>Sync to Calendar (.ics Download)</span>
                </button>

                {/* WhatsApp Dispatch Button */}
                <a
                  href={`https://wa.me/260772822579?text=Hi%20UniHairShop,%20I%20just%20booked%20${encodeURIComponent(confirmedBooking.serviceName)}%20at%20${encodeURIComponent(confirmedBooking.campus)}%20for%20${confirmedBooking.date}%20at%20${confirmedBooking.time}.%20Ref:%20${confirmedBooking.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-success w-full text-xs flex items-center justify-center gap-2 py-2.5"
                >
                  <MessageSquare size={15} />
                  <span>Send Ticket to Stylist on WhatsApp</span>
                </a>

                <button
                  className="apple-btn-primary w-full text-xs mt-1"
                  onClick={() => {
                    handleClose();
                    setActiveTab('account');
                  }}
                >
                  View in My Bookings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLencoWizard && (
        <LencoCheckoutWizard
          amount={grandTotal}
          title={`Booking: ${bookingService.name}`}
          onSuccess={handleLencoSuccess}
          onClose={() => setShowLencoWizard(false)}
          allowPayOnArrival={true}
        />
      )}
    </>
  );
}
