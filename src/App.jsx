import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import WhatsAppWidget from './components/WhatsAppWidget';
import HomeView from './views/HomeView';
import ServicesView from './views/ServicesView';
import BookingModal from './views/BookingModal';
import ShopView from './views/ShopView';
import ProductDetailModal from './views/ProductDetailModal';
import CartView from './views/CartView';
import AccountView from './views/AccountView';
import AboutView from './views/AboutView';
import AdminDashboardView from './views/AdminDashboardView';

export default function App() {
  const { activeTab } = useApp();

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'services':
        return <ServicesView />;
      case 'shop':
        return <ShopView />;
      case 'cart':
        return <CartView />;
      case 'account':
        return <AccountView />;
      case 'about':
        return <AboutView />;
      case 'admin':
        return <AdminDashboardView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {renderCurrentView()}
      </main>

      <BottomNav />
      <Toast />
      <WhatsAppWidget />

      <BookingModal />
      <ProductDetailModal />
    </div>
  );
}
