import React, { useState, useEffect } from 'react';
import { Home, Calendar, ShoppingBag, ShoppingCart, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { activeTab, setActiveTab, cart, isAdmin } = useApp();
  const [progress, setProgress] = useState(100);
  const [loading, setLoading] = useState(false);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Trigger progress bar whenever activeTab changes
  useEffect(() => {
    setLoading(true);
    setProgress(15);
    const t1 = setTimeout(() => setProgress(50), 120);
    const t2 = setTimeout(() => setProgress(85), 250);
    const t3 = setTimeout(() => setProgress(100), 400);
    const t4 = setTimeout(() => setLoading(false), 700);

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

  // Determine dynamic bar color: Red -> Amber -> Green as it completes
  const getBarColor = () => {
    if (progress < 45) return '#FF2D55'; // Red
    if (progress < 85) return '#F5A623'; // Amber/Orange
    return '#34C759'; // Vibrant Green
  };

  return (
    <nav className="bottom-nav overflow-hidden">
      {/* Top Edge Loading Bar (Red -> Green Transition) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 pointer-events-none">
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${loading ? 'opacity-100' : 'opacity-0'}`}
          style={{
            width: `${progress}%`,
            backgroundColor: getBarColor(),
            boxShadow: `0 0 10px ${getBarColor()}`
          }}
        />
      </div>

      <button
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => handleTabClick('home')}
      >
        <Home size={18} />
        <span>Home</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
        onClick={() => handleTabClick('services')}
      >
        <Calendar size={18} />
        <span>Book</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`}
        onClick={() => handleTabClick('shop')}
      >
        <ShoppingBag size={18} />
        <span>Shop</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={() => handleTabClick('cart')}
      >
        <div className="relative">
          <ShoppingCart size={18} />
          {totalCartCount > 0 && <span className="badge-count" style={{ top: -6, right: -10 }}>{totalCartCount}</span>}
        </div>
        <span>Cart</span>
      </button>

      {isAdmin ? (
        <button
          className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => handleTabClick('admin')}
        >
          <ShieldCheck size={18} className="text-amber-400" />
          <span>Admin</span>
        </button>
      ) : (
        <button
          className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => handleTabClick('account')}
        >
          <User size={18} />
          <span>Account</span>
        </button>
      )}
    </nav>
  );
}
