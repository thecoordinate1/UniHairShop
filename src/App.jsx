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

// Auto-retrying dynamic import wrapper to survive post-deployment chunk hash rotations
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageHasBeenForceRefreshed = window.sessionStorage.getItem('unihair_chunk_refreshed');

    try {
      const module = await componentImport();
      window.sessionStorage.removeItem('unihair_chunk_refreshed');
      return module;
    } catch (error) {
      if (!pageHasBeenForceRefreshed) {
        window.sessionStorage.setItem('unihair_chunk_refreshed', 'true');
        window.location.reload();
        return { default: () => <ViewSkeleton /> };
      }
      throw error;
    }
  });
}

// Code-split all view components with automatic retry
const HomeView = lazyWithRetry(() => import('./views/HomeView'));
const ServicesView = lazyWithRetry(() => import('./views/ServicesView'));
const BookingModal = lazyWithRetry(() => import('./views/BookingModal'));
const ShopView = lazyWithRetry(() => import('./views/ShopView'));
const ProductDetailModal = lazyWithRetry(() => import('./views/ProductDetailModal'));
const CartView = lazyWithRetry(() => import('./views/CartView'));
const AccountView = lazyWithRetry(() => import('./views/AccountView'));
const MessagesView = lazyWithRetry(() => import('./views/MessagesView'));
const VendorStudioView = lazyWithRetry(() => import('./views/VendorStudioView'));
const AboutView = lazyWithRetry(() => import('./views/AboutView'));
const AdminDashboardView = lazyWithRetry(() => import('./views/AdminDashboardView'));

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
  const { activeTab, userMode, user, authLoading, isGuestMode, setShowAuthModal } = useApp();

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

  // App Gate: Inaccessible without login OR guest mode
  if (!user?.isLoggedIn && !isGuestMode) {
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

        {/* Guest Mode Indicator Banner */}
        {isGuestMode && !user?.isLoggedIn && (
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border-b border-amber-400/20 px-3 sm:px-4 py-2 text-center text-xs text-amber-600 dark:text-amber-300 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 shadow-sm backdrop-blur-md">
            <span>🎓 <strong>Guest Mode:</strong> You're previewing campus salon services & shop items.</span>
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="font-bold underline text-amber-600 dark:text-amber-300 hover:text-amber-500 dark:hover:text-amber-100 bg-transparent border-0 cursor-pointer p-0"
            >
              Sign In to Book & Earn Points
            </button>
          </div>
        )}

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
