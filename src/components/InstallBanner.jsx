import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = sessionStorage.getItem('unihair_install_dismissed');
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback: Show on mobile browsers that support PWA after 3 seconds
    const timer = setTimeout(() => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      if (!isStandalone && !isDismissed) {
        setShowBanner(true);
      }
    }, 4000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Guide for iOS Safari or browsers without prompt API
      alert("To install UniHairShop on your phone:\n1. Tap the Share button in Safari / Chrome\n2. Select 'Add to Home Screen'");
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('unihair_install_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-white/95 dark:bg-[#1C1C24]/95 backdrop-blur-2xl border border-amber-400/40 p-3.5 sm:p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-3 text-slate-900 dark:text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-md shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold tracking-tight truncate m-0">Install UniHair App</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate m-0">Fast 1-tap bookings & offline access</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="apple-btn-primary text-xs px-3.5 py-2"
            aria-label="Install App"
          >
            <Download size={13} aria-hidden="true" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-transparent border-0 cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
