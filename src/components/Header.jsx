import React, { useState } from 'react';
import { Scissors, ShieldCheck, MapPin, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { activeTab, setActiveTab, isAdmin, setIsAdmin, currentCampus, setCurrentCampus, lusakaUniversities, addToast } = useApp();
  const [showCampusDropdown, setShowCampusDropdown] = useState(false);

  const handleSelectCampus = (uniName) => {
    setCurrentCampus(uniName);
    setShowCampusDropdown(false);
    addToast(`Switched location to ${uniName}!`, 'info');
  };

  return (
    <header className="top-header">
      <div className="header-inner">
        {/* Brand Logo & Campus Badge Selector */}
        <div className="flex items-center gap-2 relative min-w-0">
          <button className="brand-logo truncate shrink-0 cursor-pointer" onClick={() => setActiveTab('home')}>
            <Scissors size={22} className="shrink-0 text-amber-400" />
            <span className="text-lg sm:text-xl font-extrabold text-white">UniHairShop</span>
          </button>

          {/* Compact Campus Badge for Mobile & Desktop */}
          <button
            className="campus-badge max-w-[140px] sm:max-w-[200px] truncate cursor-pointer hover:bg-amber-400/25 transition-colors shrink"
            onClick={() => setShowCampusDropdown(!showCampusDropdown)}
            title="Click to change Lusaka campus"
          >
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{currentCampus}</span>
            <ChevronDown size={12} className="shrink-0" />
          </button>

          {/* Dropdown Menu listing Lusaka Universities */}
          {showCampusDropdown && (
            <div className="absolute top-12 left-0 z-50 w-72 max-w-[calc(100vw-32px)] bg-[#1A1A22]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2 py-1 border-b border-white/10 mb-2">
                Lusaka Universities:
              </div>
              <div className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1">
                {lusakaUniversities.map((uni, idx) => (
                  <button
                    key={uni.id}
                    onClick={() => handleSelectCampus(uni.name)}
                    className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between text-xs transition-all duration-200 cursor-pointer ${
                      currentCampus === uni.name
                        ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30'
                        : 'hover:bg-white/10 text-slate-200 font-medium'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate font-semibold">{uni.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{uni.area}</div>
                    </div>
                    {idx === 0 && (
                      <span className="bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 border border-amber-400/30">
                        Top
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Links (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-2 bg-white/[0.06] p-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('home')}
            className={`text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 bg-transparent border-0 cursor-pointer ${
              activeTab === 'home' ? 'bg-white/15 text-white shadow-sm font-bold border border-white/10' : 'text-slate-400 hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 bg-transparent border-0 cursor-pointer ${
              activeTab === 'services' ? 'bg-white/15 text-white shadow-sm font-bold border border-white/10' : 'text-slate-400 hover:text-white'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 bg-transparent border-0 cursor-pointer ${
              activeTab === 'shop' ? 'bg-white/15 text-white shadow-sm font-bold border border-white/10' : 'text-slate-400 hover:text-white'
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 bg-transparent border-0 cursor-pointer ${
              activeTab === 'about' ? 'bg-white/15 text-white shadow-sm font-bold border border-white/10' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lusaka Info
          </button>
        </nav>

        {/* Role Switcher Action */}
        <div className="header-actions shrink-0">
          <button
            className="role-switcher-btn cursor-pointer"
            onClick={() => {
              const nextMode = !isAdmin;
              setIsAdmin(nextMode);
              if (nextMode) setActiveTab('admin');
              else setActiveTab('home');
            }}
            title="Toggle Admin/Student Mode"
          >
            <ShieldCheck size={14} />
            <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'Student'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
