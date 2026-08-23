import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone PWA mode (iOS, Android, Chrome)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://') ||
      window.matchMedia('(display-mode: fullscreen)').matches;

    if (isStandalone) return;

    // 2. Check if user already installed or dismissed within the last 7 days (localStorage)
    const isInstalled = localStorage.getItem('unihair_pwa_installed') === 'true';
    if (isInstalled) return;

    const dismissedUntil = localStorage.getItem('unihair_install_dismissed_until');
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // 3. Listen for native browser install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      localStorage.setItem('unihair_pwa_installed', 'true');
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 4. Fallback prompt after user explores for 5 seconds on non-installed mobile/desktop
    const timer = setTimeout(() => {
      if (!isStandalone && !isInstalled && (!dismissedUntil || Date.now() >= Number(dismissedUntil))) {
        setShowBanner(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('unihair_pwa_installed', 'true');
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Guide for iOS Safari and other browsers
      alert("To install UniHairShop on your phone:\n1. Tap the Share button in Safari / Chrome\n2. Scroll down and tap 'Add to Home Screen'");
      // Don't show again for 7 days
      localStorage.setItem('unihair_install_dismissed_until', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Don't show again for 7 days when dismissed
    localStorage.setItem('unihair_install_dismissed_until', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
  };

  if (!showBanner) return null;

  return (
    /* Positioned with safe offset below header so it never covers navigation */
    <div className="w-full max-w-[1200px] mx-auto px-4 mb-4 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="bg-gradient-to-r from-amber-500/15 via-white/90 to-amber-500/10 dark:from-amber-500/20 dark:via-[#1A1A22]/95 dark:to-slate-900/90 backdrop-blur-2xl border border-amber-400/40 p-3.5 sm:p-4 rounded-3xl shadow-xl flex items-center justify-between gap-3 text-slate-900 dark:text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-extrabold shadow-md shrink-0">
            <Smartphone size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold tracking-tight truncate m-0">Install UniHair App</h4>
              <span className="badge badge-low-stock text-[9px] py-0.2 px-1.5 font-bold hidden sm:inline-flex">PWA Fast</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate m-0 mt-0.5">
              1-tap mobile booking, faster offline load & real-time updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="apple-btn-primary text-xs px-3.5 py-1.5 sm:py-2"
            aria-label="Install App"
          >
            <Download size={13} aria-hidden="true" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-transparent border-0 cursor-pointer"
            title="Dismiss for 7 days"
            aria-label="Dismiss install banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
