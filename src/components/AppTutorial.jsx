import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Home,
  Calendar,
  ShoppingBag,
  MessageCircle,
  User,
  Trophy,
  Heart,
  Store,
  Sparkles,
  PartyPopper
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AppTutorial({ isOpen, onClose }) {
  const { setActiveTab, userMode, user } = useApp();
  const [step, setStep] = useState(0);

  const isVendorOrAdmin = user?.role === 'vendor' || user?.role === 'admin';

  const steps = [
    {
      icon: Sparkles,
      title: 'Welcome to UniHairShop!',
      description: "Quick tour of what everything does — takes about a minute. Tap \"Next\" whenever you're ready, and we'll actually take you to each part of the app as we go.",
      tab: null
    },
    {
      icon: MapPin,
      title: 'Campus Selector',
      description: 'Top-left of the header. Switch your campus here so bookings, delivery, and the stylists you see are all local to where you actually are.',
      tab: 'home'
    },
    {
      icon: Home,
      title: 'Explore Tab',
      description: "This is Home. Browse verified campus stylists, see who's trending, and tap any stylist to view their profile, portfolio, and reviews.",
      tab: 'home'
    },
    {
      icon: Calendar,
      title: 'Services Tab',
      description: "Book a haircut, braids, nails, or any other service here. Pick a stylist, a time slot, and pay a small deposit or the full amount by mobile money — you'll get a Safety Code to confirm you're meeting the right person.",
      tab: 'services'
    },
    {
      icon: ShoppingBag,
      title: 'Shop Tab',
      description: 'Buy hair products and beauty essentials, delivered straight to your hostel room. Add items to your cart, then checkout with mobile money or cash on delivery.',
      tab: 'shop'
    },
    {
      icon: MessageCircle,
      title: 'Messages Tab',
      description: "Chat directly with your stylist to coordinate room visits or ask questions before booking. Every conversation gets its own Safety Code — check it against your stylist's when they arrive.",
      tab: 'messages'
    },
    {
      icon: Heart,
      title: 'Favorites',
      description: 'Tap the heart icon on any service to save it — find all your saved services later from Account → Favorites.',
      tab: 'services'
    },
    {
      icon: Trophy,
      title: 'Loyalty Points & Ambassador Program',
      description: "Every booking and order earns loyalty points (redeemable for discounts). Head to Account to see your points, your 7-digit referral code, and the Campus Ambassador program — share your link and earn cash once a friend you refer completes their first appointment.",
      tab: 'account'
    },
    ...(isVendorOrAdmin ? [{
      icon: Store,
      title: 'Vendor Studio',
      description: userMode === 'admin'
        ? 'As an admin, use the role switcher in the header to preview Vendor Studio — where stylists manage their services, products, bookings, and payouts.'
        : 'Use the role switcher (or "Vendor Studio" button) in the header to manage your services, products, bookings, and mobile money payouts.',
      tab: 'account'
    }] : []),
    {
      icon: PartyPopper,
      title: "You're All Set!",
      description: "That's everything! You can restart this tour anytime from Account → Take a Tour. Enjoy UniHairShop!",
      tab: null
    }
  ];

  const totalSteps = steps.length;
  const current = steps[step];

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !current) return;
    if (current.tab) setActiveTab(current.tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else onClose();
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const Icon = current.icon;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col justify-end pointer-events-none">
      {/* Light dimming at the very bottom only, so the real screen above stays fully visible and readable */}
      <div className="pointer-events-auto bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-16 pb-[max(1rem,env(safe-area-inset-bottom))] px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-[#1A1A22] rounded-3xl shadow-2xl border border-black/10 dark:border-white/15 p-5 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center border-0 cursor-pointer"
            aria-label="Close tour"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-3 pr-8">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/15 text-amber-500 flex items-center justify-center border border-amber-400/25 shrink-0">
              <Icon size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">{current.title}</h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{current.description}</p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-amber-400' : 'w-1.5 bg-black/15 dark:bg-white/15'}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="apple-btn-secondary text-xs px-3.5 py-2.5 flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            )}
            <button
              onClick={handleNext}
              className="apple-btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5"
            >
              <span>{step === totalSteps - 1 ? 'Finish' : 'Next'}</span>
              {step < totalSteps - 1 && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
