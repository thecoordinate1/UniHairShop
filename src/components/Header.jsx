import React, { useState, useEffect, useRef } from 'react';
import { Scissors, MapPin, ChevronDown, Sun, Moon, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const {
    activeTab,
    setActiveTab,
    isAdmin,
    setIsAdmin,
    currentCampus,
    setCurrentCampus,
    lusakaUniversities,
    theme,
    toggleTheme,
    cart,
    setIsCartOpen,
    addToast
  } = useApp();

  const [showCampusDropdown, setShowCampusDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Get campus short name for compact mobile rendering
  const currentCampusObj = lusakaUniversities.find((u) => u.name === currentCampus) || { shortName: 'Silverest' };
  const campusShortDisplay = currentCampusObj.shortName || currentCampus.replace(' Campus', '').replace('University of ', '');

  // Close dropdown on Escape key or outside click
  useEffect(() => {
    if (!showCampusDropdown) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowCampusDropdown(false);
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCampusDropdown(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showCampusDropdown]);

  const handleSelectCampus = (uniName) => {
    setCurrentCampus(uniName);
    setShowCampusDropdown(false);
    addToast(`Campus set to ${uniName}!`, 'info');
  };

  return (
    <header className="top-header" role="banner">
      <div className="header-inner">
        {/* Left: Brand Logo & Sleek Campus Badge */}
        <div className="flex items-center gap-2 relative min-w-0" ref={dropdownRef}>
          <button
            className="brand-logo truncate shrink-0"
            onClick={() => setActiveTab('home')}
            aria-label="UniHairShop — Return to Explore"
          >
            <Scissors size={20} className="shrink-0 text-amber-500" aria-hidden="true" />
            <span className="text-base sm:text-lg font-extrabold tracking-tight">UniHair</span>
          </button>

          {/* Compact Campus Pill */}
          <button
            className="campus-badge max-w-[135px] sm:max-w-[200px] truncate cursor-pointer hover:opacity-85 transition-opacity shrink"
            onClick={() => setShowCampusDropdown(!showCampusDropdown)}
            title="Click to change campus"
            aria-expanded={showCampusDropdown}
            aria-haspopup="listbox"
            aria-label={`Current campus: ${currentCampus}. Click to switch.`}
          >
            <MapPin size={11} className="shrink-0" aria-hidden="true" />
            <span className="truncate text-[11px] sm:text-xs">
              <span className="sm:hidden">{campusShortDisplay}</span>
              <span className="hidden sm:inline">{currentCampus}</span>
            </span>
            <ChevronDown size={11} className="shrink-0" aria-hidden="true" />
          </button>

          {/* Dropdown Menu */}
          {showCampusDropdown && (
            <div
              className="absolute top-11 left-0 z-50 w-72 max-w-[calc(100vw-32px)] bg-white/95 dark:bg-[#1A1A22]/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-3xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150"
              role="listbox"
              aria-label="Select your campus"
            >
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2 py-1 border-b border-black/5 dark:border-white/10 mb-2 flex items-center justify-between">
                <span>Select University Hub:</span>
                <span className="text-[9px] text-emerald-500 font-semibold">Active</span>
              </div>
              <div className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1">
                {lusakaUniversities.map((uni, idx) => (
                  <button
                    key={uni.id}
                    onClick={() => handleSelectCampus(uni.name)}
                    role="option"
                    aria-selected={currentCampus === uni.name}
                    className={`w-full p-2.5 rounded-2xl text-left flex items-center justify-between text-xs transition-all duration-200 cursor-pointer ${
                      currentCampus === uni.name
                        ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-400/30'
                        : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-medium'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate font-semibold">{uni.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{uni.area}</div>
                    </div>
                    {idx === 0 && (
                      <span className="bg-amber-400/20 text-amber-500 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 border border-amber-400/30">
                        Main
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: Desktop Navigation Links (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/[0.06] p-1 rounded-full border border-black/5 dark:border-white/10 backdrop-blur-md" role="navigation" aria-label="Desktop navigation">
          {[
            { id: 'home', label: 'Explore' },
            { id: 'services', label: 'Services' },
            { id: 'shop', label: 'Shop' },
            { id: 'messages', label: 'Messages' },
            { id: 'account', label: 'Bookings' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={activeTab === item.id ? 'page' : undefined}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 bg-transparent border-0 cursor-pointer ${
                activeTab === item.id
                  ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm font-bold border border-black/5 dark:border-white/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Clean, Uncluttered Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="icon-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-slate-700" />
            )}
          </button>

          {/* Slide-Out Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="icon-btn"
            title="Open Shopping Cart"
            aria-label={`Open Cart with ${cartTotalItems} items`}
          >
            <ShoppingBag size={17} />
            {cartTotalItems > 0 && (
              <span className="badge-count" aria-hidden="true">
                {cartTotalItems}
              </span>
            )}
          </button>

          {/* Admin Switcher (Desktop Only to prevent mobile clutter) */}
          <button
            className="hidden md:flex role-switcher-btn cursor-pointer"
            onClick={() => {
              const nextMode = !isAdmin;
              setIsAdmin(nextMode);
              if (nextMode) setActiveTab('admin');
              else setActiveTab('home');
            }}
            title="Toggle Admin / Student Mode"
            aria-label={`Switch to ${isAdmin ? 'Student' : 'Admin'} mode`}
          >
            <ShieldCheck size={14} aria-hidden="true" />
            <span>{isAdmin ? 'Admin' : 'Student'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
