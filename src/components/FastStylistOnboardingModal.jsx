import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, ArrowLeft, UploadCloud, Scissors, MapPin, Phone, ShieldCheck, DollarSign, Clock, Store, Truck, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { campusHostels, lusakaUniversities } from '../data/mockData';
import { playSuccessChime } from '../lib/soundEffects';

export default function FastStylistOnboardingModal({ isOpen, onClose }) {
  const { currentCampus, staffList, user, onboardAsStylist, addToast } = useApp();

  const [step, setStep] = useState(1); // 1: Personal Info & Dorm, 2: Services & Pricing, 3: Portfolio & Launch

  // Step 1 State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [selectedCampus, setSelectedCampus] = useState(currentCampus || 'UNILUS Silverest Campus');
  const availableHostels = campusHostels[selectedCampus] || ['Hostel Block A', 'Off-Campus Boarding'];
  const [selectedHostel, setSelectedHostel] = useState(availableHostels[0] || 'Hostel Block A');
  const [roomNumber, setRoomNumber] = useState('');
  const [handle, setHandle] = useState('');

  // Step 2 State
  const [specialty, setSpecialty] = useState('Barbering');
  const [serviceName, setServiceName] = useState('Campus Haircut & Lineup');
  const [price, setPrice] = useState('90');
  const [duration, setDuration] = useState('35');
  const [travelsToDorm, setTravelsToDorm] = useState(true);
  const [hasStudio, setHasStudio] = useState(true);

  // Step 3 State
  const [bio, setBio] = useState('Passionate student stylist offering clean, scalp-friendly hair services right on campus!');
  const [portfolioImage, setPortfolioImage] = useState('/images/barber_service.jpg');
  const [completedStylist, setCompletedStylist] = useState(null);

  // Auto-generate handle from name
  useEffect(() => {
    if (name && !handle) {
      const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
      setHandle(`${clean}cuts`);
    }
  }, [name]);

  useEffect(() => {
    const list = campusHostels[selectedCampus] || ['Hostel Block A'];
    setSelectedHostel(list[0] || 'Hostel Block A');
  }, [selectedCampus]);

  if (!isOpen) return null;

  const handleImagePicker = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPortfolioImage(event.target.result);
        addToast('Portfolio photo attached!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteOnboarding = () => {
    if (!name.trim()) {
      addToast('Please enter your full name or stylist brand name', 'error');
      setStep(1);
      return;
    }
    if (!phone || phone.length < 10) {
      addToast('Please enter a valid 10-digit WhatsApp number', 'error');
      setStep(1);
      return;
    }

    const stylistPayload = {
      name: name.trim(),
      handle: (handle || name.toLowerCase().replace(/[^a-z0-9]/g, '')).replace(/^@/, ''),
      role: specialty === 'Barbering' ? 'Campus Barber' : specialty === 'Braids & Wigs' ? 'Braider & Wig Artist' : `${specialty} Specialist`,
      campus: selectedCampus,
      dormLocation: `${selectedHostel}${roomNumber ? `, Room ${roomNumber}` : ''}`,
      avatar: portfolioImage || '/images/barber_service.jpg',
      bio: bio.trim(),
      specialties: [specialty, serviceName],
      travelsToDorm,
      hasStudio,
      phone: phone.trim(),
      servicePayload: {
        name: serviceName.trim() || 'Campus Hair Styling',
        category: specialty,
        price: Number(price) || 90,
        duration: Number(duration) || 35,
        description: bio.trim(),
        canTravel: travelsToDorm,
        inStudio: hasStudio
      }
    };

    onboardAsStylist(stylistPayload);
    playSuccessChime();
    setCompletedStylist(stylistPayload);
  };

  const shareUrl = `${window.location.origin}/?stylist=${completedStylist?.handle || handle}`;

  const handleCopyBioLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      addToast(`Direct booking link copied: ${shareUrl}`, 'success');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card max-w-lg p-6 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {!completedStylist ? (
          <div>
            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-verified text-[10px] py-0.5 px-2 font-bold flex items-center gap-1">
                <Sparkles size={11} />
                <span>60-Second Stylist Setup</span>
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">Step {step} of 3</span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight m-0 mb-1">
              Become a Verified Campus Stylist
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mb-5">
              Start receiving bookings from students in your university hostels today!
            </p>

            {/* Step Progress Dots */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    step >= i ? 'bg-amber-400' : 'bg-black/10 dark:bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* STEP 1: Basic Info & Dorm Address */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="stylist-name">Full Name / Brand Name:</label>
                  <input
                    id="stylist-name"
                    type="text"
                    required
                    placeholder="e.g. Kondwani / FadesByKondwani"
                    className="form-input text-xs"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 form-group">
                  <div>
                    <label className="form-label" htmlFor="stylist-phone">WhatsApp Phone Number:</label>
                    <input
                      id="stylist-phone"
                      type="tel"
                      required
                      placeholder="e.g. 0971234567"
                      className="form-input text-xs"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="stylist-handle">Booking Handle (@handle):</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">@</span>
                      <input
                        id="stylist-handle"
                        type="text"
                        placeholder="kondwanicuts"
                        className="form-input text-xs pl-7 font-mono"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 form-group">
                  <div>
                    <label className="form-label" htmlFor="stylist-campus">University Campus:</label>
                    <select
                      id="stylist-campus"
                      className="form-select text-xs"
                      value={selectedCampus}
                      onChange={(e) => setSelectedCampus(e.target.value)}
                    >
                      {lusakaUniversities.map((u) => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" htmlFor="stylist-hostel">Hostel Block / Hall:</label>
                    <select
                      id="stylist-hostel"
                      className="form-select text-xs"
                      value={selectedHostel}
                      onChange={(e) => setSelectedHostel(e.target.value)}
                    >
                      {availableHostels.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="stylist-room">Room / Flat Number:</label>
                  <input
                    id="stylist-room"
                    type="text"
                    placeholder="e.g. Room 14, 2nd Floor"
                    className="form-input text-xs"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!name.trim()) return addToast('Please enter your name', 'error');
                    if (!phone || phone.length < 10) return addToast('Please enter valid phone number', 'error');
                    setStep(2);
                  }}
                  className="apple-btn-primary w-full text-xs py-3 mt-4"
                >
                  <span>Continue to Services & Pricing</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* STEP 2: Services & Pricing */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Primary Specialty Category:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['Barbering', 'Braids & Wigs', 'Nails & Makeup', 'Locs & Natural', 'Skin & Facial'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSpecialty(cat);
                          if (cat === 'Barbering') setServiceName('Fresh Taper Fade & Lineup');
                          if (cat === 'Braids & Wigs') setServiceName('Knotless Braids / Wig Install');
                          if (cat === 'Nails & Makeup') setServiceName('Acrylic Full Set & Nail Art');
                          if (cat === 'Locs & Natural') setServiceName('Loc Retwist & Scalp Detox');
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          specialty === cat
                            ? 'bg-[#007AFF] border-[#007AFF] text-white shadow-apple-blue font-bold'
                            : 'bg-black/[0.02] dark:bg-white/[0.04] border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="first-service-name">Featured Service Name:</label>
                  <input
                    id="first-service-name"
                    type="text"
                    className="form-input text-xs"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 form-group">
                  <div>
                    <label className="form-label" htmlFor="first-service-price">Price (ZMW):</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">K</span>
                      <input
                        id="first-service-price"
                        type="number"
                        className="form-input text-xs pl-7 font-bold"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label" htmlFor="first-service-duration">Duration (Minutes):</label>
                    <div className="relative">
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400">mins</span>
                      <input
                        id="first-service-duration"
                        type="number"
                        className="form-input text-xs pr-12 font-bold"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div
                    onClick={() => setTravelsToDorm(!travelsToDorm)}
                    className={`p-3 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all ${
                      travelsToDorm
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-black/10 dark:border-white/10 text-slate-500'
                    }`}
                  >
                    <Truck size={16} className={travelsToDorm ? 'text-emerald-500' : 'text-slate-400'} />
                    <span className="text-xs">Travel to Dorms</span>
                  </div>

                  <div
                    onClick={() => setHasStudio(!hasStudio)}
                    className={`p-3 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all ${
                      hasStudio
                        ? 'border-[#007AFF] bg-[#007AFF]/10 text-blue-800 dark:text-blue-300 font-bold'
                        : 'border-black/10 dark:border-white/10 text-slate-500'
                    }`}
                  >
                    <Store size={16} className={hasStudio ? 'text-[#007AFF]' : 'text-slate-400'} />
                    <span className="text-xs">Host in My Room</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="apple-btn-secondary text-xs px-4 py-3"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="apple-btn-primary flex-1 text-xs py-3"
                  >
                    <span>Continue to Portfolio</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Portfolio & Launch */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Profile / Hair Portfolio Photo:</label>
                  <div className="flex items-center gap-4 bg-black/[0.02] dark:bg-white/[0.02] p-3.5 rounded-2xl border border-black/10 dark:border-white/10">
                    <img
                      src={portfolioImage}
                      alt="Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0 bg-slate-800"
                    />
                    <div className="flex-1">
                      <label className="apple-btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 cursor-pointer">
                        <Camera size={13} />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImagePicker}
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1 m-0">
                        Upload a photo of your recent cut, braids, or styling work.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="stylist-bio">Short Bio / Tagline:</label>
                  <textarea
                    id="stylist-bio"
                    rows={3}
                    className="form-input text-xs"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="bg-amber-400/10 p-3 rounded-2xl border border-amber-400/30 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-300 font-bold">
                    <ShieldCheck size={14} />
                    <span>Your Direct Booking Handle:</span>
                  </div>
                  <p className="font-mono text-xs text-slate-800 dark:text-slate-200 m-0 font-bold">
                    unihair.shop/@{handle || 'yourhandle'}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="apple-btn-secondary text-xs px-4 py-3"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteOnboarding}
                    className="apple-btn-primary flex-1 text-xs py-3 font-bold bg-gradient-to-r from-amber-400 to-orange-500 border-0 shadow-apple-gold"
                  >
                    <span>Launch My Stylist Studio 🚀</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Success Screen with Shareable Bio Link */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <Check size={32} />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight m-0 mb-1">
              You are Live on UniHairShop! 💈
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mb-5">
              Your profile is verified and ready for student appointments at {completedStylist.campus}.
            </p>

            <div className="card p-4 bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-left mb-5 space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={completedStylist.avatar}
                  alt={completedStylist.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-amber-400 shadow-sm shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">{completedStylist.name}</h3>
                  <p className="text-xs text-amber-500 font-semibold m-0">@{completedStylist.handle}</p>
                  <p className="text-[11px] text-slate-400 m-0">{completedStylist.dormLocation}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Your Personal Bio Link:</span>
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-black/50 p-2 rounded-xl border border-black/10 dark:border-white/10 font-mono text-xs text-amber-600 dark:text-amber-300">
                  <span className="truncate">{shareUrl}</span>
                  <button
                    onClick={handleCopyBioLink}
                    className="apple-btn-secondary text-[11px] py-1 px-2 shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onClose();
                  handleCopyBioLink();
                }}
                className="apple-btn-primary w-full text-xs py-3 font-bold"
              >
                Go to My Vendor Studio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
