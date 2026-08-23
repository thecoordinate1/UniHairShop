import React, { Suspense, lazy, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import WhatsAppWidget from './components/WhatsAppWidget';
import ErrorBoundary from './components/ErrorBoundary';

// Code-split all view components for faster initial load
const HomeView = lazy(() => import('./views/HomeView'));
const ServicesView = lazy(() => import('./views/ServicesView'));
const BookingModal = lazy(() => import('./views/BookingModal'));
const ShopView = lazy(() => import('./views/ShopView'));
const ProductDetailModal = lazy(() => import('./views/ProductDetailModal'));
const CartView = lazy(() => import('./views/CartView'));
const AccountView = lazy(() => import('./views/AccountView'));
const AboutView = lazy(() => import('./views/AboutView'));
const AdminDashboardView = lazy(() => import('./views/AdminDashboardView'));

// Skeleton loading fallback for code-split views
function ViewSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 animate-pulse" aria-busy="true" aria-label="Loading content">
      <div className="w-3/4 h-8 bg-white/[0.06] rounded-2xl" />
      <div className="w-1/2 h-4 bg-white/[0.04] rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 bg-white/[0.04] rounded-3xl border border-white/5" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { activeTab } = useApp();

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

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
    <ErrorBoundary>
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      <div className="app-container">
        <Header />

        <main id="main-content" className="main-content" role="main">
          <Suspense fallback={<ViewSkeleton />}>
            {renderCurrentView()}
          </Suspense>
        </main>

        <BottomNav />
        <Toast />
        <WhatsAppWidget />

        <Suspense fallback={null}>
          <BookingModal />
          <ProductDetailModal />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
