import React from 'react';
import { MapPin, Clock, Phone, MessageCircle, Mail, Sparkles, Award, GraduationCap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AboutView() {
  const { lusakaUniversities, currentCampus, setCurrentCampus, addToast } = useApp();
  const whatsappNumber = "260772822579";

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <div className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-2 backdrop-blur-md">
          <Sparkles size={14} className="text-amber-400" aria-hidden="true" />
          <span>Lusaka University Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">UniHairShop Campus Network</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
          On-campus grooming, hair dressing, nail tech, and e-commerce for university students across Lusaka, Zambia.
        </p>
      </div>

      {/* Lusaka Universities List with UNILUS Silverest at Top */}
      <div className="card p-5 sm:p-6 border border-amber-400/30">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap size={26} className="text-amber-400 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Supported Lusaka Universities & Campuses</h2>
            <p className="text-xs text-slate-400">Fast hostel delivery & bookable salon branches</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5" role="list">
          {lusakaUniversities.map((uni, idx) => (
            <div
              key={uni.id}
              role="listitem"
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
                currentCampus === uni.name
                  ? 'bg-amber-400/15 border-amber-400/60 shadow-sm'
                  : 'bg-slate-900/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-bold truncate ${currentCampus === uni.name ? 'text-amber-300' : 'text-white'}`}>{uni.name}</h3>
                  {idx === 0 && (
                    <span className="badge badge-low-stock text-[10px] py-0.5 px-2">Primary Hub</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Area: {uni.area}</p>
              </div>

              <button
                className={currentCampus === uni.name ? 'apple-btn-primary text-xs px-4 py-1.5' : 'apple-btn-secondary text-xs px-4 py-1.5'}
                onClick={() => {
                  setCurrentCampus(uni.name);
                  addToast(`Active campus set to ${uni.name}!`, 'success');
                }}
                aria-label={`Select ${uni.name} as active campus`}
              >
                {currentCampus === uni.name ? 'Active' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <MapPin size={24} className="text-amber-400 shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">UNILUS Silverest Main Hub</h3>
              <p className="text-xs text-slate-400">University of Lusaka — Silverest Campus, Student Centre</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our flagship campus salon location at Silverest Campus! Quick delivery to all hostel blocks and student accommodation.
          </p>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock size={24} className="text-emerald-400 shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Opening Hours</h3>
              <p className="text-xs text-slate-400">Monday – Saturday: 08:00 AM – 19:30 PM</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Open late for evening haircut appointments before campus events and weekend outings!
          </p>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <h3 className="text-base font-bold text-white mb-4 tracking-tight">Direct Campus Contact & Support</h3>

        <div className="flex flex-col gap-3">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-white text-sm hover:text-emerald-400 transition-colors p-2.5 rounded-xl hover:bg-white/5"
            aria-label="Contact WhatsApp Support Desk on +260 772 822579"
          >
            <div className="bg-emerald-500 p-2 rounded-full text-white shrink-0">
              <MessageCircle size={18} />
            </div>
            <span>WhatsApp Support Desk: +260 772 822579</span>
          </a>

          <div className="flex items-center gap-3 text-white text-sm p-2.5 rounded-xl">
            <div className="bg-amber-400/20 p-2 rounded-full text-amber-400 shrink-0">
              <Phone size={18} />
            </div>
            <span>Direct Phone Line: +260 772 822579</span>
          </div>

          <div className="flex items-center gap-3 text-white text-sm p-2.5 rounded-xl">
            <div className="bg-pink-500/20 p-2 rounded-full text-pink-400 shrink-0">
              <Mail size={18} />
            </div>
            <span>Email Inquiries: info@unihairshop.co.zm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
