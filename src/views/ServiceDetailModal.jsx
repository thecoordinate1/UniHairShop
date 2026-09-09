import React, { useEffect } from 'react';
import { X, Clock, Star, Truck, Store, ArrowLeft, Tag, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ServiceDetailModal() {
  const { selectedService, setSelectedService, setBookingService, staffList } = useApp();

  useEffect(() => {
    if (!selectedService) return;
    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedService(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedService, setSelectedService]);

  if (!selectedService) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) setSelectedService(null);
  };

  const handleBookNow = () => {
    setBookingService(selectedService);
    setSelectedService(null);
  };

  const staffIds = selectedService.staffIds || selectedService.staff_ids || [];
  const offeringStylists = staffList.filter((s) => staffIds.includes(s.id));
  const addOns = selectedService.addOns || selectedService.add_ons || [];

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Service details for ${selectedService.name}`}
    >
      <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-black/20 dark:bg-white/20 rounded-full mx-auto mb-4 sm:hidden" aria-hidden="true"></div>

        <button
          className="modal-close"
          onClick={() => setSelectedService(null)}
          title="Close Quick View (Esc)"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="relative h-56 w-full rounded-3xl overflow-hidden mb-4 border border-black/10 dark:border-white/10 shadow-sm bg-black/5 dark:bg-white/5">
          <img src={selectedService.image} alt={selectedService.name} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
            <Clock size={12} className="text-amber-400" aria-hidden="true" />
            <span>{selectedService.duration} mins</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-in-stock text-xs py-0.5 px-2">{selectedService.category}</span>
          {selectedService.canTravel && (
            <span className="badge badge-verified text-[10px] py-0.5 px-2 flex items-center gap-1">
              <Truck size={11} />
              <span>Travels to Dorm</span>
            </span>
          )}
          {selectedService.inStudio && (
            <span className="badge badge-low-stock text-[10px] py-0.5 px-2 flex items-center gap-1">
              <Store size={11} />
              <span>Studio Visit</span>
            </span>
          )}
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
          {selectedService.name}
        </h2>

        <div className="flex items-center gap-4 mb-3 pb-3 border-b border-black/5 dark:border-white/5">
          <div>
            <span className="price-tag text-2xl">K {selectedService.price}</span>
            <span className="text-[11px] text-slate-400 block">Starting Price (ZMW)</span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Service Description</h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 m-0 leading-relaxed bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-2xl border border-black/5 dark:border-white/5">
            {selectedService.description}
          </p>
        </div>

        {addOns.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Tag size={12} />
              <span>Optional Add-Ons</span>
            </h4>
            <div className="space-y-1.5">
              {addOns.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between text-xs bg-black/[0.02] dark:bg-white/[0.03] p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                  <span className="text-slate-700 dark:text-slate-300">{addon.name}</span>
                  <span className="font-semibold text-amber-500">+K {addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {offeringStylists.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Users size={12} />
              <span>Offered By</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {offeringStylists.map((s) => (
                <div key={s.id} className="flex items-center gap-1.5 bg-black/[0.02] dark:bg-white/[0.03] pl-1 pr-2.5 py-1 rounded-full border border-black/5 dark:border-white/5">
                  <img src={s.avatar} alt={s.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{s.name}</span>
                  {(s.rating || 0) > 0 && (
                    <span className="text-[10px] text-amber-500 font-bold flex items-center gap-0.5">
                      <Star size={9} fill="#F5A623" />
                      {Number(s.rating).toFixed(1)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="apple-btn-primary w-full text-sm py-3 mb-3" onClick={handleBookNow}>
          Book This Service
        </button>

        <button
          onClick={() => setSelectedService(null)}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white py-2 flex items-center justify-center gap-1 bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Back to Browsing</span>
        </button>
      </div>
    </div>
  );
}
