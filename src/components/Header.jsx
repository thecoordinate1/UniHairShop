import React, { useState } from 'react';
import { Scissors, ShoppingBag, User, ShieldCheck, MapPin, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { activeTab, setActiveTab, cart, isAdmin, setIsAdmin, currentCampus, setCurrentCampus, lusakaUniversities, addToast } = useApp();
  const [showCampusDropdown, setShowCampusDropdown] = useState(false);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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
          <button className="brand-logo truncate shrink-0" onClick={() => setActiveTab('home')}>
            <Scissors size={22} className="shrink-0" />
            <span className="text-lg sm:text-xl font-extrabold">UniHairShop</span>
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
            <div className="absolute top-12 left-0 z-50 w-72 max-w-[calc(100vw-32px)] bg-slate-800 border border-amber-400/50 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[11px] text-slate-400 font-bold px-2 py-1 border-b border-white/10 mb-1">
                LUSAKA UNIVERSITIES:
              </div>
              <div className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1">
                {lusakaUniversities.map((uni, idx) => (
                  <button
                    key={uni.id}
                    onClick={() => handleSelectCampus(uni.name)}
                    className={`w-full p-2 rounded-lg text-left flex items-center justify-between text-xs transition-colors ${
                      currentCampus === uni.name
                        ? 'bg-amber-400/20 text-amber-400 font-bold border border-amber-400/40'
                        : 'hover:bg-white/10 text-slate-200 font-medium'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate font-semibold">{uni.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{uni.area}</div>
                    </div>
                    {idx === 0 && (
                      <span className="bg-amber-400/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">
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
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setActiveTab('home')}
            className={`text-sm font-medium transition-colors bg-transparent border-0 ${
              activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`text-sm font-medium transition-colors bg-transparent border-0 ${
              activeTab === 'services' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`text-sm font-medium transition-colors bg-transparent border-0 ${
              activeTab === 'shop' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`text-sm font-medium transition-colors bg-transparent border-0 ${
              activeTab === 'about' ? 'text-amber-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Lusaka Info
          </button>
        </nav>

        {/* Right Header Actions */}
        <div className="header-actions shrink-0">
          <button className="icon-btn" title="Cart" onClick={() => setActiveTab('cart')}>
            <ShoppingBag size={18} />
            {totalCartCount > 0 && <span className="badge-count">{totalCartCount}</span>}
          </button>

          <button className="icon-btn" title="My Account" onClick={() => setActiveTab('account')}>
            <User size={18} />
          </button>

          <button
            className="role-switcher-btn"
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
