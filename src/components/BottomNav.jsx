import React from 'react';
import { Home, Calendar, ShoppingBag, ShoppingCart, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { activeTab, setActiveTab, cart, isAdmin } = useApp();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
        onClick={() => setActiveTab('services')}
      >
        <Calendar size={20} />
        <span>Book</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`}
        onClick={() => setActiveTab('shop')}
      >
        <ShoppingBag size={20} />
        <span>Shop</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={() => setActiveTab('cart')}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingCart size={20} />
          {totalCartCount > 0 && <span className="badge-count" style={{ top: -6, right: -8 }}>{totalCartCount}</span>}
        </div>
        <span>Cart</span>
      </button>

      {isAdmin ? (
        <button
          className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
          <span>Admin</span>
        </button>
      ) : (
        <button
          className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <User size={20} />
          <span>Account</span>
        </button>
      )}
    </nav>
  );
}
