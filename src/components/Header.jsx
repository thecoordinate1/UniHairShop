import React from 'react';
import { Scissors, ShoppingBag, User, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { activeTab, setActiveTab, cart, isAdmin, setIsAdmin, user } = useApp();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="top-header">
      <div className="header-inner">
        {/* Brand Logo & Campus Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="brand-logo" onClick={() => setActiveTab('home')}>
            <Scissors size={24} />
            <span>UniHairShop</span>
          </button>

          <div className="campus-badge">
            <MapPin size={12} />
            <span>UNZA Great East</span>
          </div>
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
            Campus Info
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

          {/* Quick Role Switcher (Student vs Admin) */}
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
