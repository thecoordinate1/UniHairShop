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
    addToast(`Switched active location to ${uniName}!`, 'info');
  };

  return (
    <header className="top-header">
      <div className="header-inner">
        {/* Brand Logo & Interactive Lusaka Campus Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <button className="brand-logo" onClick={() => setActiveTab('home')}>
            <Scissors size={24} />
            <span>UniHairShop</span>
          </button>

          {/* Campus Selector Badge with UNILUS Silverest at top */}
          <button
            className="campus-badge cursor-pointer hover:bg-amber-400/25 transition-colors"
            onClick={() => setShowCampusDropdown(!showCampusDropdown)}
            title="Click to change Lusaka university campus"
          >
            <MapPin size={12} />
            <span>{currentCampus}</span>
            <ChevronDown size={12} />
          </button>

          {/* Dropdown Menu listing Lusaka Universities with UNILUS Silverest at top */}
          {showCampusDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                left: '120px',
                zIndex: 100,
                width: '280px',
                background: 'var(--card-bg)',
                border: '1px solid var(--primary)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                animation: 'popIn 0.2s ease-out'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, padding: '4px 8px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                LUSAKA UNIVERSITIES (SELECT YOUR CAMPUS):
              </div>
              <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {lusakaUniversities.map((uni, idx) => (
                  <button
                    key={uni.id}
                    onClick={() => handleSelectCampus(uni.name)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: currentCampus === uni.name ? 'rgba(255, 184, 0, 0.2)' : 'transparent',
                      color: currentCampus === uni.name ? 'var(--primary)' : '#fff',
                      fontWeight: idx === 0 || currentCampus === uni.name ? 700 : 500,
                      fontSize: '0.82rem',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: idx === 0 ? '1px solid rgba(255, 184, 0, 0.4)' : 'none'
                    }}
                  >
                    <div>
                      <div>{uni.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>{uni.area}</div>
                    </div>
                    {idx === 0 && (
                      <span className="badge badge-low-stock" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>Top</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Quick Nav Links */}
        <nav style={{ display: 'flex', gap: '20px' }} className="desktop-nav-links">
          <button
            onClick={() => setActiveTab('home')}
            style={{
              background: 'none',
              color: activeTab === 'home' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'home' ? 700 : 500
            }}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('services')}
            style={{
              background: 'none',
              color: activeTab === 'services' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'services' ? 700 : 500
            }}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            style={{
              background: 'none',
              color: activeTab === 'shop' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'shop' ? 700 : 500
            }}
          >
            Shop
          </button>
          <button
            onClick={() => setActiveTab('about')}
            style={{
              background: 'none',
              color: activeTab === 'about' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'about' ? 700 : 500
            }}
          >
            Lusaka Info
          </button>
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {/* Cart Icon */}
          <button className="icon-btn" title="Cart" onClick={() => setActiveTab('cart')}>
            <ShoppingBag size={20} />
            {totalCartCount > 0 && <span className="badge-count">{totalCartCount}</span>}
          </button>

          {/* Account Icon */}
          <button className="icon-btn" title="My Account" onClick={() => setActiveTab('account')}>
            <User size={20} />
          </button>

          {/* Quick Role Switcher */}
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
            <ShieldCheck size={16} />
            <span>{isAdmin ? 'Admin View' : 'Student Mode'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
