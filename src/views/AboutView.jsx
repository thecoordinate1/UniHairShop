import React from 'react';
import { MapPin, Clock, Phone, MessageCircle, Mail, Sparkles, Award, GraduationCap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AboutView() {
  const { lusakaUniversities, currentCampus, setCurrentCampus, addToast } = useApp();
  const whatsappNumber = "260772822579";

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">UniHairShop Lusaka Campuses</h1>
        <p className="text-slate-400 text-sm">
          On-campus grooming, hair dressing, nail tech, and e-commerce for university students across Lusaka, Zambia.
        </p>
      </div>

      {/* Lusaka Universities List with UNILUS Silverest at Top */}
      <div className="card p-5 border border-amber-400/40">
        <div className="flex items-center gap-2.5 mb-4">
          <GraduationCap size={24} className="text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white">Supported Lusaka Universities & Campuses</h3>
            <p className="text-xs text-slate-400">Fast hostel delivery & bookable salon branches</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {lusakaUniversities.map((uni, idx) => (
            <div
              key={uni.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                idx === 0
                  ? 'bg-amber-400/15 border-amber-400'
                  : 'bg-slate-900/60 border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-bold ${idx === 0 ? 'text-amber-400' : 'text-white'}`}>{uni.name}</h4>
                  {idx === 0 && (
                    <span className="badge badge-low-stock text-[10px] py-0.5 px-1.5">Primary Hub</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 m-0">Area: {uni.area}</p>
              </div>

              <button
                className={currentCampus === uni.name ? 'btn-primary text-xs px-3 py-1.5' : 'btn-secondary text-xs px-3 py-1.5'}
                onClick={() => {
                  setCurrentCampus(uni.name);
                  addToast(`Selected ${uni.name}!`, 'success');
                }}
              >
                {currentCampus === uni.name ? 'Active' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <MapPin size={24} className="text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">UNILUS Silverest Main Hub</h3>
              <p className="text-xs text-slate-400">University of Lusaka — Silverest Campus, Student Centre</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Our main flagship campus salon location at Silverest Campus! Quick delivery to all hostel blocks.
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Clock size={24} className="text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Opening Hours</h3>
              <p className="text-xs text-slate-400">Monday – Saturday: 08:00 AM – 19:30 PM</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Open late for evening haircut appointments before weekend events!
          </p>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-lg font-bold text-white mb-3">Direct Campus Contact & Support</h3>

        <div className="flex flex-col gap-3">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-white text-sm hover:text-emerald-400 transition-colors"
          >
            <div className="bg-emerald-500 p-2 rounded-full text-white">
              <MessageCircle size={18} />
            </div>
            <span>WhatsApp Support Desk: +260 772 822579</span>
          </a>

          <div className="flex items-center gap-3 text-white text-sm">
            <div className="bg-amber-400/20 p-2 rounded-full text-amber-400">
              <Phone size={18} />
            </div>
            <span>Phone Line: +260 772 822579</span>
          </div>

          <div className="flex items-center gap-3 text-white text-sm">
            <div className="bg-pink-500/20 p-2 rounded-full text-pink-400">
              <Mail size={18} />
            </div>
            <span>Email: info@unihairshop.co.zm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
