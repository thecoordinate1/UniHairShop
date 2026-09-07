import React, { useState, useEffect } from 'react';
import { Home, Calendar, ShoppingBag, MessageCircle, User, Store, Clock, Scissors, Image, Wallet, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const {
    activeTab,
    setActiveTab,
    cart,
    userMode,
    conversations,
    vendorWallet,
    setVendorTab
  } = useApp();

  const [progress, setProgress] = useState(100);
  const [loading, setLoading] = useState(false);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalUnreadMessages = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  // Trigger progress bar on tab change
  useEffect(() => {
    setLoading(true);
    setProgress(20);
    const t1 = setTimeout(() => setProgress(60), 100);
    const t2 = setTimeout(() => setProgress(90), 220);
    const t3 = setTimeout(() => setProgress(100), 360);
    const t4 = setTimeout(() => setLoading(false), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [activeTab]);

  const handleTabClick = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  const handleVendorTabClick = (vTab) => {
    setActiveTab('vendor');
    if (setVendorTab) setVendorTab(vTab);
  };

  const getBarColor = () => {
    if (progress < 50) return '#FF2D55';
    if (progress < 85) return '#F5A623';
    return '#34C759';
  };

  return (
    <nav className="bottom-nav overflow-hidden" role="navigation" aria-label="Mobile main navigation">
      {/* Top Edge Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 pointer-events-none" aria-hidden="true">
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${loading ? 'opacity-100' : 'opacity-0'}`}
          style={{
            width: `${progress}%`,
            backgroundColor: getBarColor(),
            boxShadow: `0 0 8px ${getBarColor()}`
          }}
        />
      </div>

      {userMode === 'admin' ? (
        <>
          {/* Admin 1. Dashboard */}
          <button
            className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => handleTabClick('admin')}
            aria-label="Master Admin Dashboard"
            aria-current={activeTab === 'admin' ? 'page' : undefined}
          >
            <ShieldCheck size={18} className="text-amber-500" aria-hidden="true" />
            <span>Admin</span>
          </button>

          {/* Admin 2. Messages */}
          <button
            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => handleTabClick('messages')}
            aria-label="Messages"
            aria-current={activeTab === 'messages' ? 'page' : undefined}
          >
            <div className="relative">
              <MessageCircle size={18} aria-hidden="true" />
              {totalUnreadMessages > 0 && (
                <span className="badge-count bg-[#007AFF] shadow-blue-500/40" style={{ top: -6, right: -10 }} aria-hidden="true">
                  {totalUnreadMessages}
                </span>
              )}
            </div>
            <span>Chat</span>
          </button>

          {/* Admin 3. Shop */}
          <button
            className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => handleTabClick('shop')}
            aria-label="Campus Shop"
            aria-current={activeTab === 'shop' ? 'page' : undefined}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span>Shop</span>
          </button>

          {/* Admin 4. Profile (also hosts the role switcher) */}
          <button
            className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => handleTabClick('account')}
            aria-label="Profile Settings and Role Switcher"
            aria-current={activeTab === 'account' ? 'page' : undefined}
          >
            <User size={18} aria-hidden="true" />
            <span>Profile</span>
          </button>
        </>
      ) : userMode === 'customer' ? (
        <>
          {/* 1. Explore */}
          <button
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTabClick('home')}
            aria-label="Explore services and stylists"
            aria-current={activeTab === 'home' ? 'page' : undefined}
          >
            <Home size={18} aria-hidden="true" />
            <span>Explore</span>
          </button>

          {/* 2. Bookings */}
          <button
            className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => handleTabClick('services')}
            aria-label="Book a salon appointment"
            aria-current={activeTab === 'services' ? 'page' : undefined}
          >
            <Calendar size={18} aria-hidden="true" />
            <span>Book</span>
          </button>

          {/* 3. Shop */}
          <button
            className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => handleTabClick('shop')}
            aria-label={`Campus Shop${totalCartCount > 0 ? `, ${totalCartCount} in cart` : ''}`}
            aria-current={activeTab === 'shop' ? 'page' : undefined}
          >
            <div className="relative">
              <ShoppingBag size={18} aria-hidden="true" />
              {totalCartCount > 0 && (
                <span className="badge-count" style={{ top: -6, right: -10 }} aria-hidden="true">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span>Shop</span>
          </button>

          {/* 4. Messages */}
          <button
            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => handleTabClick('messages')}
            aria-label={`In-App Messages${totalUnreadMessages > 0 ? `, ${totalUnreadMessages} unread` : ''}`}
            aria-current={activeTab === 'messages' ? 'page' : undefined}
          >
            <div className="relative">
              <MessageCircle size={18} aria-hidden="true" />
              {totalUnreadMessages > 0 && (
                <span className="badge-count bg-[#007AFF] shadow-blue-500/40" style={{ top: -6, right: -10 }} aria-hidden="true">
                  {totalUnreadMessages}
                </span>
              )}
            </div>
            <span>Chat</span>
          </button>

          {/* 5. Profile */}
          <button
            className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => handleTabClick('account')}
            aria-label="My Student Profile and Bookings"
            aria-current={activeTab === 'account' ? 'page' : undefined}
          >
            <User size={18} aria-hidden="true" />
            <span>Profile</span>
          </button>
        </>
      ) : (
        <>
          {/* Vendor 1. Studio */}
          <button
            className={`nav-item ${activeTab === 'vendor' ? 'active' : ''}`}
            onClick={() => handleTabClick('vendor')}
            aria-label="Vendor Studio Dashboard"
            aria-current={activeTab === 'vendor' ? 'page' : undefined}
          >
            <Store size={18} className="text-amber-500" aria-hidden="true" />
            <span>Studio</span>
          </button>

          {/* Vendor 2. Client Chat */}
          <button
            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => handleTabClick('messages')}
            aria-label="Client Messages"
            aria-current={activeTab === 'messages' ? 'page' : undefined}
          >
            <div className="relative">
              <MessageCircle size={18} aria-hidden="true" />
              {totalUnreadMessages > 0 && (
                <span className="badge-count bg-[#007AFF] shadow-blue-500/40" style={{ top: -6, right: -10 }} aria-hidden="true">
                  {totalUnreadMessages}
                </span>
              )}
            </div>
            <span>Clients</span>
          </button>

          {/* Vendor 3. Shop & Retail */}
          <button
            className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`}
            onClick={() => handleTabClick('shop')}
            aria-label="Retail Products"
            aria-current={activeTab === 'shop' ? 'page' : undefined}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span>Shop</span>
          </button>

          {/* Vendor 4. Student Profile Settings */}
          <button
            className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => handleTabClick('account')}
            aria-label="Profile Settings"
            aria-current={activeTab === 'account' ? 'page' : undefined}
          >
            <User size={18} aria-hidden="true" />
            <span>Profile</span>
          </button>
        </>
      )}
    </nav>
  );
}
