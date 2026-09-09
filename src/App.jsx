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
import PostAuthScreen from './components/PostAuthScreen';
import SuspendedAccountScreen from './components/SuspendedAccountScreen';

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
const ServiceDetailModal = lazyWithRetry(() => import('./views/ServiceDetailModal'));
const CartView = lazyWithRetry(() => import('./views/CartView'));
const AccountView = lazyWithRetry(() => import('./views/AccountView'));
const MessagesView = lazyWithRetry(() => import('./views/MessagesView'));
const VendorStudioView = lazyWithRetry(() => import('./views/VendorStudioView'));
const AboutView = lazyWithRetry(() => import('./views/AboutView'));
const LegalView = lazyWithRetry(() => import('./views/LegalView'));
const AdminDashboardView = lazyWithRetry(() => import('./views/AdminDashboardView'));

function ViewSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6" aria-busy="true" aria-label="Loading content">
      <div className="w-3/4 h-8 skeleton" />
      <div className="w-1/2 h-4 skeleton" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 skeleton rounded-3xl border border-black/5 dark:border-white/5" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const {
    activeTab,
    setActiveTab,
    userMode,
    user,
    authLoading,
    isGuestMode,
    postAuthScreen,
    setShowAuthModal,
    staffList,
    setSelectedStylist,
    addToast
  } = useApp();

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, userMode]);

  // Deep-link for a notification click (?tab=messages, ?tab=account, ?tab=vendor)
  useEffect(() => {
    try {
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      const validTabs = ['home', 'services', 'shop', 'cart', 'messages', 'vendor', 'account', 'about', 'legal', 'admin'];
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch (e) {
      console.warn('Tab deep-link parsing fallback:', e);
    }
  }, [setActiveTab]);

  // Deep-link resolution for stylist handles (?stylist=juniorfades or /@juniorfades)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const stylistParam = urlParams.get('stylist') || urlParams.get('barber') || urlParams.get('braider');
      const pathParam = window.location.pathname.replace(/^\/@?/, '');

      const targetIdentifier = stylistParam || (pathParam && pathParam.length > 2 && !['services', 'shop', 'messages', 'account', 'vendor', 'about'].includes(pathParam.toLowerCase()) ? pathParam : null);

      if (targetIdentifier && staffList && staffList.length > 0) {
        const found = staffList.find(
          (s) =>
            s.id.toLowerCase() === targetIdentifier.toLowerCase() ||
            (s.handle && s.handle.toLowerCase() === targetIdentifier.toLowerCase()) ||
            s.name.toLowerCase().includes(targetIdentifier.toLowerCase())
        );

        if (found) {
          setSelectedStylist(found);
          addToast(`Viewing verified stylist: ${found.name}`, 'info');
        }
      }
    } catch (e) {
      console.warn('Deep-link parsing fallback:', e);
    }
  }, [staffList, setSelectedStylist, addToast]);

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

  // Post-Auth Gate: email confirmation / password recovery links land here first,
  // taking priority over guest mode or the normal sign-in wall until resolved.
  if (postAuthScreen) {
    return (
      <ErrorBoundary>
        <PostAuthScreen mode={postAuthScreen} />
        <Toast />
      </ErrorBoundary>
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

  // Suspended accounts are blocked from the app entirely — a UI backstop on
  // top of the server-side is_user_suspended() checks in every write path.
  if (user?.isLoggedIn && user?.isSuspended) {
    return (
      <ErrorBoundary>
        <SuspendedAccountScreen />
        <Toast />
      </ErrorBoundary>
    );
  }

  const renderCurrentView = () => {
    // If in admin mode and activeTab is home/admin, show AdminDashboardView guarded
    if (userMode === 'admin' && (activeTab === 'home' || activeTab === 'admin')) {
      return (
        <AuthGuard requiredRole="admin">
          <AdminDashboardView />
        </AuthGuard>
      );
    }

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
      case 'legal':
        return <LegalView />;
      case 'admin':
        return (
          <AuthGuard requiredRole="admin">
            <AdminDashboardView />
          </AuthGuard>
        );
      default:
        if (userMode === 'admin') {
          return (
            <AuthGuard requiredRole="admin">
              <AdminDashboardView />
            </AuthGuard>
          );
        }
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
          <ServiceDetailModal />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
