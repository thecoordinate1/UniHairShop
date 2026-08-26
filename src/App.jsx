import React, { Suspense, lazy, useEffect } from 'react';
import { Scissors } from 'lucide-react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import WhatsAppWidget from './components/WhatsAppWidget';
import ErrorBoundary from './components/ErrorBoundary';
import CartDrawer from './components/CartDrawer';
import StylistProfileModal from './components/StylistProfileModal';
import SafetyModal from './components/SafetyModal';
import InstallBanner from './components/InstallBanner';
import AuthModal from './components/AuthModal';
import AuthGuard from './components/AuthGuard';
import AuthWall from './components/AuthWall';

// Code-split all view components
const HomeView = lazy(() => import('./views/HomeView'));
const ServicesView = lazy(() => import('./views/ServicesView'));
const BookingModal = lazy(() => import('./views/BookingModal'));
const ShopView = lazy(() => import('./views/ShopView'));
const ProductDetailModal = lazy(() => import('./views/ProductDetailModal'));
const CartView = lazy(() => import('./views/CartView'));
const AccountView = lazy(() => import('./views/AccountView'));
const MessagesView = lazy(() => import('./views/MessagesView'));
const VendorStudioView = lazy(() => import('./views/VendorStudioView'));
const AboutView = lazy(() => import('./views/AboutView'));
const AdminDashboardView = lazy(() => import('./views/AdminDashboardView'));

function ViewSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 animate-pulse" aria-busy="true" aria-label="Loading content">
      <div className="w-3/4 h-8 bg-black/5 dark:bg-white/[0.06] rounded-2xl" />
      <div className="w-1/2 h-4 bg-black/5 dark:bg-white/[0.04] rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 bg-black/5 dark:bg-white/[0.04] rounded-3xl border border-black/5 dark:border-white/5" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { activeTab, userMode, user, authLoading } = useApp();

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, userMode]);

  // Session Hydration Screen
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white p-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-2xl shadow-apple-gold animate-bounce mb-4">
          <Scissors size={32} />
        </div>
        <h2 className="text-base font-extrabold text-amber-400 tracking-wide m-0">UniHairShop Campus Hub</h2>
        <p className="text-xs text-slate-400 mt-1">Verifying campus session...</p>
      </div>
    );
  }

  // App Gate: Inaccessible without login / active session
  if (!user?.isLoggedIn) {
    return (
      <ErrorBoundary>
        <AuthWall />
        <Toast />
      </ErrorBoundary>
    );
  }

  const renderCurrentView = () => {
    // If in vendor mode and activeTab is home/vendor, show VendorStudioView guarded
    if (userMode === 'vendor' && (activeTab === 'home' || activeTab === 'vendor')) {
      return (
        <AuthGuard requiredRole="vendor">
          <VendorStudioView />
        </AuthGuard>
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'services':
        return <ServicesView />;
      case 'shop':
        return <ShopView />;
      case 'cart':
        return <CartView />;
      case 'messages':
        return <MessagesView />;
      case 'vendor':
        return (
          <AuthGuard requiredRole="vendor">
            <VendorStudioView />
          </AuthGuard>
        );
      case 'account':
        return <AccountView />;
      case 'about':
        return <AboutView />;
      case 'admin':
        return <AdminDashboardView />;
      default:
        return userMode === 'vendor' ? (
          <AuthGuard requiredRole="vendor">
            <VendorStudioView />
          </AuthGuard>
        ) : (
          <HomeView />
        );
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
          {/* Install banner positioned inside main flow with safe area top clearance */}
          <InstallBanner />

          <Suspense fallback={<ViewSkeleton />}>
            {renderCurrentView()}
          </Suspense>
        </main>

        <BottomNav />
        <Toast />
        <WhatsAppWidget />

        {/* Global Modals & Drawers */}
        <CartDrawer />
        <StylistProfileModal />
        <SafetyModal />
        <AuthModal />

        <Suspense fallback={null}>
          <BookingModal />
          <ProductDetailModal />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
