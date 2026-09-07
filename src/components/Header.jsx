import React, { useState, useEffect, useRef } from 'react';
import { Scissors, MapPin, ChevronDown, Sun, Moon, ShoppingBag, Store, User, Sparkles, ShieldCheck, Trophy, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import FastStylistOnboardingModal from './FastStylistOnboardingModal';
import AmbassadorHubModal from './AmbassadorHubModal';

const ROLE_SWITCHER_OPTIONS = [
  { id: 'admin', label: 'Master Admin' },
  { id: 'vendor', label: 'Vendor Studio' },
  { id: 'customer', label: 'Student Customer' }
];

export default function Header() {
  const {
    activeTab,
    setActiveTab,
    userMode,
    toggleUserMode,
    switchViewMode,
    availableViewModes,
    currentCampus,
    setCurrentCampus,
    lusakaUniversities,
    theme,
    toggleTheme,
    cart,
    setIsCartOpen,
    user,
    showAuthModal,
    setShowAuthModal,
    addToast
  } = useApp();

  const [showCampusDropdown, setShowCampusDropdown] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const dropdownRef = useRef(null);
  const roleSwitcherRef = useRef(null);

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

  // Close role switcher dropdown on Escape key or outside click
  useEffect(() => {
    if (!showRoleSwitcher) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowRoleSwitcher(false);
    };

    const handleClickOutside = (e) => {
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(e.target)) {
        setShowRoleSwitcher(false);
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
  }, [showRoleSwitcher]);

  const handleSelectCampus = (uniName) => {
    setCurrentCampus(uniName);
    setShowCampusDropdown(false);
    addToast(`Campus set to ${uniName}!`, 'info');
  };

  return (
    <header className="top-header" role="banner">
      <div className="header-inner min-w-0">
        {/* Left: Brand Logo & Sleek Campus Badge */}
        <div className="flex items-center gap-2 relative min-w-0" ref={dropdownRef}>
          <button
            className="brand-logo truncate shrink-0"
            onClick={() => setActiveTab(userMode === 'vendor' ? 'vendor' : userMode === 'admin' ? 'admin' : 'home')}
            aria-label="UniHairShop — Return to Home"
          >
            <Scissors size={20} className="shrink-0 text-amber-500" aria-hidden="true" />
            <span className="text-base sm:text-lg font-extrabold tracking-tight">UniHair</span>
          </button>

          {/* Compact Campus Pill */}
          <button
            className="campus-badge max-w-[130px] sm:max-w-[200px] truncate cursor-pointer hover:opacity-85 transition-opacity shrink"
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
          {userMode === 'customer' ? (
            [
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
            ))
          ) : userMode === 'admin' ? (
            [
              { id: 'admin', label: 'Admin Dashboard' },
              { id: 'messages', label: 'Messages' },
              { id: 'account', label: 'Profile Settings' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={activeTab === item.id ? 'page' : undefined}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 bg-transparent border-0 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 shadow-sm font-bold border border-amber-400/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))
          ) : (
            [
              { id: 'vendor', label: 'Vendor Studio' },
              { id: 'messages', label: 'Client Messages' },
              { id: 'account', label: 'Profile Settings' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={activeTab === item.id ? 'page' : undefined}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-200 bg-transparent border-0 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 shadow-sm font-bold border border-amber-400/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))
          )}
        </nav>

        {/* Right: Clean Action Buttons & Role Switcher */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Admin Role Switcher (Admin / Vendor / Customer) */}
          {user?.role === 'admin' && (
            <div className="relative" ref={roleSwitcherRef}>
              <button
                onClick={() => setShowRoleSwitcher((v) => !v)}
                className={`px-2 sm:px-3 py-1.5 rounded-2xl text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-apple-gold'
                    : 'bg-amber-400/15 border-amber-400/30 text-amber-500 hover:bg-amber-400/25'
                }`}
                title="Switch role view"
                aria-label="Switch role view"
                aria-haspopup="listbox"
                aria-expanded={showRoleSwitcher}
              >
                <ShieldCheck size={13} className="shrink-0" />
                <span className="hidden lg:inline">
                  {ROLE_SWITCHER_OPTIONS.find((opt) => opt.id === userMode)?.label || 'Master Admin'}
                </span>
                <ChevronDown size={11} className="shrink-0" aria-hidden="true" />
              </button>

              {showRoleSwitcher && (
                <div
                  className="absolute top-11 right-0 z-50 w-52 bg-white/95 dark:bg-[#1A1A22]/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-3xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
                  role="listbox"
                  aria-label="Select role view"
                >
                  {ROLE_SWITCHER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        switchViewMode(opt.id);
                        setShowRoleSwitcher(false);
                      }}
                      role="option"
                      aria-selected={userMode === opt.id}
                      className={`w-full p-2.5 rounded-2xl text-left text-xs transition-all duration-200 cursor-pointer ${
                        userMode === opt.id
                          ? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-400/30'
                          : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-medium'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ambassador MoMo Hub Trigger */}
          <button
            onClick={() => setShowAmbassadorModal(true)}
            className="px-2 sm:px-3 py-1.5 rounded-2xl text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer border bg-amber-400/10 border-amber-400/30 text-amber-500 hover:bg-amber-400/20"
            title="Earn K10 MoMo per booking referral"
          >
            <Trophy size={13} className="text-amber-500 shrink-0" />
            <span className="hidden md:inline">Ambassador</span>
          </button>

          {/* 60-Second Fast Stylist Onboarding Button (Customer Mode) */}
          {userMode === 'customer' && (
            <button
              onClick={() => setShowOnboardingModal(true)}
              className="px-2 sm:px-3 py-1.5 rounded-2xl text-[11px] sm:text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-amber-400/40"
              title="Join as a Campus Stylist in 60s"
            >
              <Plus size={13} className="text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Become a Stylist</span>
            </button>
          )}

          {/* Dual Architecture 1-Tap Mode Switcher (non-admin accounts only — admins use the role switcher above) */}
          {user?.role !== 'admin' && (
            <button
              onClick={toggleUserMode}
              className={`hidden sm:flex px-2 sm:px-3 py-1.5 rounded-2xl text-[11px] sm:text-xs font-bold transition-all duration-200 items-center gap-1.5 cursor-pointer border ${
                userMode === 'vendor'
                  ? 'bg-gradient-to-r from-amber-500/20 to-amber-400/25 border-amber-400/40 text-amber-600 dark:text-amber-300 shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-amber-400/30'
              }`}
              title={`Switch to ${userMode === 'vendor' ? 'Customer' : 'Vendor Studio'} Mode`}
              aria-label={`Switch to ${userMode === 'vendor' ? 'Customer' : 'Vendor Studio'} Mode`}
            >
              {userMode === 'vendor' ? (
                <>
                  <Store size={13} className="text-amber-500 shrink-0" />
                  <span className="hidden xs:inline">Vendor Studio</span>
                </>
              ) : (
                <>
                  <Scissors size={13} className="text-amber-500 shrink-0" />
                  <span className="hidden xs:inline">Vendor Mode</span>
                </>
              )}
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="icon-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-amber-400" />
            ) : (
              <Moon size={16} className="text-slate-700" />
            )}
          </button>

          {/* Slide-Out Cart Trigger (Customer Mode) */}
          {userMode === 'customer' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="icon-btn"
              title="Open Shopping Cart"
              aria-label={`Open Cart with ${cartTotalItems} items`}
            >
              <ShoppingBag size={16} />
              {cartTotalItems > 0 && (
                <span className="badge-count" aria-hidden="true">
                  {cartTotalItems}
                </span>
              )}
            </button>
          )}

          {/* Sign In Button for Unauthenticated Guest Mode */}
          {!user?.isLoggedIn && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="apple-btn-primary text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-2xl flex items-center gap-1 font-bold shadow-apple-gold cursor-pointer shrink-0"
              title="Sign In or Register"
            >
              <User size={13} />
              <span className="hidden xs:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Fast Stylist Onboarding Wizard Modal */}
      {showOnboardingModal && (
        <FastStylistOnboardingModal
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
        />
      )}

      {/* Campus Ambassador Rewards Modal */}
      {showAmbassadorModal && (
        <AmbassadorHubModal
          isOpen={showAmbassadorModal}
          onClose={() => setShowAmbassadorModal(false)}
        />
      )}
    </header>
  );
}
