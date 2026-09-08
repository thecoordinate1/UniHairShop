import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  initialServices,
  initialProducts,
  initialStaff,
  initialBookings,
  initialOrders,
  initialBundles,
  initialConversations,
  lusakaUniversities
} from '../data/mockData';

const AppContext = createContext();

// Unified placeholder shown for any person (stylist/vendor) without a real
// uploaded profile photo — never a stock/AI-generated photo standing in for
// someone's actual picture.
export const DEFAULT_AVATAR = '/images/avatar_placeholder.svg';

// Safe localStorage helpers
function safeGetItem(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[UniHairShop] localStorage write failed for "${key}":`, e.message);
  }
}

// Generate collision-resistant IDs
function generateId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

// Generate collision-resistant 7-digit numeric referral code
export function generate7DigitReferralCode() {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
}

export const defaultGuestUser = {
  isLoggedIn: false,
  id: null,
  name: 'Student Guest',
  email: '',
  phone: '',
  campus: 'UNILUS Silverest Campus',
  hostel: '',
  role: 'customer',
  loyaltyPoints: 0,
  referralCode: '',
  referredBy: '',
  referralCount: 0,
  pointsHistory: [],
  favorites: []
};

export const AppProvider = ({ children }) => {
  // 1. Theme & User Mode States
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('unihair_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [userMode, setUserMode] = useState(() => {
    try {
      return localStorage.getItem('unihair_user_mode') || 'customer';
    } catch {
      return 'customer';
    }
  });

  // Which view a signed-in account is allowed to be in, by role. Used to
  // decide whether to keep a manually-chosen mode (e.g. a vendor browsing as
  // a customer) across session refreshes, rather than snapping it back.
  const validModesForRole = (role) => {
    if (role === 'admin') return ['admin', 'vendor', 'customer'];
    if (role === 'vendor') return ['vendor', 'customer'];
    return ['customer'];
  };

  const [vendorTab, setVendorTab] = useState('overview');
  const [activeTab, setActiveTab] = useState('home');

  const [currentCampus, setCurrentCampus] = useState(() => {
    try {
      return localStorage.getItem('unihair_campus') || 'UNILUS Silverest Campus';
    } catch {
      return 'UNILUS Silverest Campus';
    }
  });

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pendingAuthCallback, setPendingAuthCallback] = useState(null);

  // Guest Mode State
  const [isGuestMode, setIsGuestMode] = useState(() => {
    try {
      return localStorage.getItem('unihair_guest_mode') === 'true';
    } catch {
      return false;
    }
  });

  // 2. User & Vendor Profiles
  const [user, setUser] = useState(() => {
    const saved = safeGetItem('unihair_user', defaultGuestUser);
    if (!saved || !saved.isLoggedIn) {
      return defaultGuestUser;
    }
    return saved;
  });

  const [vendorProfile, setVendorProfile] = useState(() => safeGetItem('unihair_vendor_profile', {
    id: null,
    name: '',
    role: '',
    campus: '',
    dormLocation: '',
    avatar: DEFAULT_AVATAR,
    isVerified: false,
    badge: 'Campus Stylist (Pending Verification)',
    travelsToDorm: true,
    travelFee: 20,
    hasStudio: true,
    phone: '',
    payoutProvider: 'Airtel Money',
    payoutNumber: '',
    bio: '',
    idDocumentUrl: null
  }));

  const [vendorWallet, setVendorWallet] = useState(() => safeGetItem('unihair_vendor_wallet', {
    availableBalance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    completedJobsCount: 0,
    payouts: []
  }));
  const [vendorSales, setVendorSales] = useState([]);

  // 3. Platform Data & Chat
  const [services, setServices] = useState(() => safeGetItem('unihair_services', initialServices));
  const [products, setProducts] = useState(() => safeGetItem('unihair_products', initialProducts));
  const [bundles] = useState(initialBundles);
  const [staffList, setStaffList] = useState(() => safeGetItem('unihair_staff', initialStaff));
  const [bookings, setBookings] = useState(() => safeGetItem('unihair_bookings', initialBookings));
  const [orders, setOrders] = useState(() => safeGetItem('unihair_orders', initialOrders));
  const [cart, setCart] = useState(() => safeGetItem('unihair_cart', []));
  const [conversations, setConversations] = useState(() => safeGetItem('unihair_conversations', initialConversations));
  const [reviews, setReviews] = useState(() => safeGetItem('unihair_reviews', []));
  const [activeChatStylistId, setActiveChatStylistId] = useState(null);

  // 4. Modals & Filters
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [bookingService, setBookingService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [lencoCheckoutState, setLencoCheckoutState] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [toasts, setToasts] = useState([]);

  // Toast Helpers
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Lightweight self-hosted funnel tracking — no third-party analytics vendor
  // is wired up, so this is the only way to ever learn whether a real funnel
  // step (signup, booking, order, referral) is actually happening. Fire-and-
  // forget: analytics must never block or break the feature it's measuring.
  const trackEvent = useCallback((eventName, metadata = {}) => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase.from('analytics_events').insert([{
      event_name: eventName,
      user_id: user?.id || null,
      campus: currentCampus || null,
      metadata
    }]).then(null, () => {});
  }, [user?.id, currentCampus]);

  // Theme Synchronizer
  useEffect(() => {
    try {
      localStorage.setItem('unihair_theme', theme);
    } catch { /* ignore */ }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Which view modes this signed-in account is actually allowed to switch into,
  // derived from the DB-hydrated role (never from client-only state).
  const availableViewModes = useMemo(() => {
    if (!user?.isLoggedIn) return ['customer'];
    if (user.role === 'admin') return ['admin', 'vendor', 'customer'];
    if (user.role === 'vendor') return ['vendor', 'customer'];
    return ['customer'];
  }, [user?.isLoggedIn, user?.role]);

  const switchViewMode = useCallback(async (targetMode) => {
    if (targetMode === 'admin') {
      if (user?.role !== 'admin') {
        addToast('Admin access required.', 'error');
        return;
      }
      setUserMode('admin');
      setActiveTab('admin');
      addToast('Switched to Master Admin view', 'success');
      return;
    }

    if (targetMode === 'customer') {
      setUserMode('customer');
      setActiveTab('home');
      addToast('Switched to Student Customer Mode', 'info');
      return;
    }

    // targetMode === 'vendor' -> Enforce Database Verification Check
    if (user?.role === 'admin') {
      // An admin previewing Vendor Studio has no vendor_profiles row of their
      // own most of the time — without this, whatever vendorProfile happened
      // to already be cached (e.g. stale test data) kept showing instead of
      // the signed-in admin's real details.
      if (isSupabaseConfigured && supabase && user?.id) {
        try {
          const { data: vendorData } = await supabase
            .from('vendor_profiles')
            .select('id, name, is_verified, role, dorm_location, avatar, phone, bio')
            .eq('id', user.id)
            .maybeSingle();
          if (vendorData) {
            setVendorProfile((prev) => ({
              ...prev,
              id: vendorData.id,
              name: vendorData.name || prev.name,
              role: vendorData.role || prev.role,
              isVerified: vendorData.is_verified ?? false,
              dormLocation: vendorData.dorm_location || prev.dormLocation,
              avatar: vendorData.avatar || prev.avatar,
              phone: vendorData.phone || prev.phone,
              bio: vendorData.bio || prev.bio
            }));
          } else {
            setVendorProfile((prev) => ({
              ...prev,
              id: user.id,
              name: user.name || 'Master Admin',
              phone: user.phone || prev.phone,
              isVerified: false,
              badge: 'Master Admin Preview'
            }));
          }
        } catch (err) {
          console.warn('Database admin vendor profile check:', err);
        }
      } else {
        setVendorProfile((prev) => ({ ...prev, id: user?.id || prev.id, name: user?.name || prev.name }));
      }
      setUserMode('vendor');
      setActiveTab('vendor');
      addToast('Master Admin access granted to Vendor Studio', 'success');
      return;
    }

    if (!user?.isLoggedIn) {
      addToast('Please sign in to access Vendor Studio.', 'error');
      return;
    }

    // Check database for vendor registration
    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        const { data: vendorData } = await supabase
          .from('vendor_profiles')
          .select('id, name, is_verified, role, dorm_location, avatar, phone, bio')
          .eq('id', user.id)
          .single();

        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const isVendorInDb = (profileData && profileData.role === 'vendor') || (vendorData && vendorData.id);

        if (!isVendorInDb && user.role !== 'vendor') {
          addToast('Database check: No stylist account found. Onboard below to activate your Vendor Studio!', 'info');
          setActiveTab('vendor');
          return;
        }

        if (vendorData) {
          setVendorProfile((prev) => ({
            ...prev,
            id: vendorData.id,
            name: vendorData.name || prev.name,
            role: vendorData.role || prev.role,
            isVerified: vendorData.is_verified ?? false,
            dormLocation: vendorData.dorm_location || prev.dormLocation,
            avatar: vendorData.avatar || prev.avatar,
            phone: vendorData.phone || prev.phone,
            bio: vendorData.bio || prev.bio
          }));
        }
      } catch (err) {
        console.warn('Database vendor verification check:', err);
      }
    } else {
      if (user.role !== 'vendor') {
        addToast('No stylist account registered. Onboard below to activate Vendor Studio!', 'info');
        setActiveTab('vendor');
        return;
      }
    }

    setUserMode('vendor');
    setActiveTab('vendor');
    addToast('Verified Campus Stylist workspace activated!', 'success');
  }, [user, setActiveTab, addToast]);

  const toggleUserMode = useCallback(async () => {
    await switchViewMode(userMode === 'vendor' ? 'customer' : 'vendor');
  }, [userMode, switchViewMode]);

  // Supabase Backend Sync, Auth Listener & Realtime Subscription
  useEffect(() => {
    // Check for auth callback parameters in URL (Email Verification, Password Recovery, Auth Errors)
    let justConfirmedEmail = false;
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      if (hash.includes('error_description=') || search.includes('error_description=')) {
        try {
          const params = new URLSearchParams(hash.replace(/^#/, '') || search);
          const errorDesc = params.get('error_description') || 'Authentication verification link failed or expired.';
          addToast(decodeURIComponent(errorDesc.replace(/\+/g, ' ')), 'error');
          window.history.replaceState(null, '', window.location.pathname);
        } catch { /* ignore */ }
      } else if (hash.includes('type=signup') || hash.includes('type=email_change')) {
        justConfirmedEmail = true;
        addToast('🎉 Email verified successfully! Please sign in to continue.', 'success');
        window.history.replaceState(null, '', window.location.pathname);
        // The confirmation link auto-establishes a session; sign back out so the
        // user lands on the sign-in screen instead of being silently logged in.
        if (isSupabaseConfigured && supabase) {
          supabase.auth.signOut().catch(() => {});
        }
        setShowAuthModal(true);
      } else if (hash.includes('type=recovery')) {
        addToast('🔑 Password recovery session authenticated. You can update your password in Settings.', 'info');
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    if (justConfirmedEmail) {
      setAuthLoading(false);
    } else {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              const assignedRole = profile.role || 'customer';
              const validPoints = typeof profile?.loyalty_points === 'number' ? profile.loyalty_points : 50;
              const validCode = (profile?.referral_code && /^\d{7}$/.test(profile.referral_code))
                ? profile.referral_code
                : generate7DigitReferralCode();
              const validCount = typeof profile?.referral_count === 'number' ? profile.referral_count : 0;
              const validHistory = Array.isArray(profile?.points_history) && profile.points_history.length > 0
                ? profile.points_history
                : [{
                    id: 'pt-welcome',
                    type: 'welcome',
                    points: validPoints,
                    title: 'Welcome Loyalty Balance 🎓',
                    date: new Date().toISOString()
                  }];

              // Backfill referral code or missing points if needed in Supabase
              if (profile && (!profile.referral_code || !/^\d{7}$/.test(profile.referral_code) || profile.loyalty_points === null || profile.loyalty_points === undefined)) {
                supabase.from('profiles').update({
                  referral_code: validCode,
                  loyalty_points: validPoints,
                  referral_count: validCount,
                  points_history: validHistory
                }).eq('id', currentSession.user.id).then(null, () => {});
              }

              setUser({
                id: profile?.id || currentSession.user.id,
                isLoggedIn: true,
                name: profile?.name || currentSession.user.email?.split('@')[0],
                email: currentSession.user.email,
                phone: profile?.phone || '0971234567',
                campus: profile?.campus || currentCampus,
                hostel: profile?.hostel || 'Campus Hostel',
                role: assignedRole,
                loyaltyPoints: validPoints,
                referralCode: validCode,
                referredBy: profile?.referred_by || '',
                referralCount: validCount,
                pointsHistory: validHistory,
                favorites: []
              });
              setUserMode((prevMode) => {
                const validModes = validModesForRole(assignedRole);
                return validModes.includes(prevMode) ? prevMode : validModes[0];
              });
            }
          });
      }
      setAuthLoading(false);
    });
    }

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        const assignedRole = profile?.role || 'customer';
        const validPoints = typeof profile?.loyalty_points === 'number' ? profile.loyalty_points : 50;
        const validCode = (profile?.referral_code && /^\d{7}$/.test(profile.referral_code))
          ? profile.referral_code
          : generate7DigitReferralCode();
        const validCount = typeof profile?.referral_count === 'number' ? profile.referral_count : 0;
        const validHistory = Array.isArray(profile?.points_history) && profile.points_history.length > 0
          ? profile.points_history
          : [{
              id: 'pt-welcome',
              type: 'welcome',
              points: validPoints,
              title: 'Welcome Loyalty Balance 🎓',
              date: new Date().toISOString()
            }];

        setUser((prev) => ({
          ...prev,
          id: profile?.id || currentSession.user.id,
          isLoggedIn: true,
          name: profile?.name || prev.name,
          email: currentSession.user.email,
          phone: profile?.phone || prev.phone,
          campus: profile?.campus || prev.campus,
          hostel: profile?.hostel || prev.hostel,
          role: assignedRole,
          loyaltyPoints: validPoints,
          referralCode: validCode,
          referredBy: profile?.referred_by || prev.referredBy || '',
          referralCount: validCount,
          pointsHistory: validHistory
        }));

        setUserMode((prevMode) => {
          const validModes = validModesForRole(assignedRole);
          return validModes.includes(prevMode) ? prevMode : validModes[0];
        });
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUserMode('customer');
      }
    });

    // 1. Fetch initial services from Supabase
    const fetchSupabaseData = async () => {
      try {
        const { data: srvData } = await supabase.from('services').select('*');
        if (srvData && srvData.length > 0) {
          setServices(srvData);
        }

        const { data: prdData } = await supabase.from('products').select('*');
        if (prdData && prdData.length > 0) {
          setProducts(prdData);
        }

        const { data: bData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (bData && bData.length > 0) {
          setBookings(bData);
        }

        const { data: vProfiles } = await supabase.from('vendor_profiles').select('*');
        if (vProfiles && vProfiles.length > 0) {
          setStaffList(vProfiles);
        }

        // Fetch Conversations & Messages
        const { data: convData } = await supabase.from('conversations').select('*').order('updated_at', { ascending: false });
        const { data: msgData } = await supabase.from('messages').select('*').order('created_at', { ascending: true });

        if (convData && convData.length > 0) {
          const mapped = convData.map((c) => {
            const matchingMsgs = (msgData || [])
              .filter((m) => m.conversation_id === c.id || m.conversation_id === `conv-${c.stylist_id}`)
              .map((m) => ({
                id: m.id,
                sender: m.sender,
                text: m.text,
                time: m.time
              }));
            return {
              id: c.id,
              stylistId: c.stylist_id,
              stylistName: c.stylist_name,
              avatar: c.avatar || DEFAULT_AVATAR,
              stylistRole: c.stylist_role || 'Campus Stylist',
              lastMessage: c.last_message || (matchingMsgs.length > 0 ? matchingMsgs[matchingMsgs.length - 1].text : 'Hello!'),
              lastTimestamp: c.last_timestamp || 'Active',
              unreadCount: c.unread_count || 0,
              messages: matchingMsgs.length > 0 ? matchingMsgs : (initialConversations.find((ic) => ic.stylistId === c.stylist_id)?.messages || [])
            };
          });
          setConversations(mapped);
        }

        const { data: reviewData } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (reviewData) {
          setReviews(reviewData);
        }
      } catch (err) {
        console.info('[UniHairShop] Supabase live fetch notice:', err.message);
      }
    };

    fetchSupabaseData();

    // 2. Realtime listener on Bookings & Messages
    const bookingChannel = supabase
      .channel('public:bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBookings((prev) => {
            const exists = prev.some((b) => b.id === payload.new.id);
            return exists ? prev : [payload.new, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setBookings((prev) => prev.map((b) => (b.id === payload.new.id ? payload.new : b)));
        } else if (payload.eventType === 'DELETE') {
          setBookings((prev) => prev.filter((b) => b.id === payload.old.id));
        }
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === newMsg.conversation_id || `conv-${c.stylistId}` === newMsg.conversation_id) {
              if (c.messages.some((m) => m.id === newMsg.id)) return c;
              return {
                ...c,
                lastMessage: newMsg.text,
                lastTimestamp: newMsg.time || 'Just now',
                messages: [...c.messages, { id: newMsg.id, sender: newMsg.sender, text: newMsg.text, time: newMsg.time }]
              };
            }
            return c;
          })
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  // Debounced persistence
  const persistTimers = useRef({});
  const debouncedPersist = useCallback((key, value) => {
    if (persistTimers.current[key]) clearTimeout(persistTimers.current[key]);
    persistTimers.current[key] = setTimeout(() => safeSetItem(key, value), 300);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('unihair_campus', currentCampus); } catch { /* ignore */ }
  }, [currentCampus]);

  useEffect(() => {
    try { localStorage.setItem('unihair_user_mode', userMode); } catch { /* ignore */ }
  }, [userMode]);

  useEffect(() => { debouncedPersist('unihair_user', user); }, [user, debouncedPersist]);
  useEffect(() => { debouncedPersist('unihair_vendor_profile', vendorProfile); }, [vendorProfile, debouncedPersist]);
  useEffect(() => { debouncedPersist('unihair_vendor_wallet', vendorWallet); }, [vendorWallet, debouncedPersist]);
  useEffect(() => { debouncedPersist('unihair_services', services); }, [services, debouncedPersist]);
  useEffect(() => { debouncedPersist('unihair_products', products); }, [products, debouncedPersist]);
  useEffect(() => { debouncedPersist('unihair_bookings', bookings); }, [bookings, debouncedPersist]);
  useEffect(() => { debouncedPersist('unihair_orders', orders); }, [orders, debouncedPersist]);
  useEffect(() => { debouncedPersist('unihair_cart', cart); }, [cart, debouncedPersist]);
  useEffect(() => { debouncedPersist('unihair_conversations', conversations); }, [conversations, debouncedPersist]);

  // Cart Management
  const addToCart = useCallback((product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    addToast(`Added "${product.name}" to cart!`, 'success');
  }, [addToast]);

  const addBundleToCart = useCallback((bundle) => {
    const bundleProduct = {
      id: bundle.id,
      name: bundle.title,
      category: 'Campus Essentials Bundle',
      description: bundle.tagline || (bundle.items ? bundle.items.join(', ') : 'Campus Hair & Grooming Bundle'),
      price: bundle.bundlePrice,
      image: bundle.image,
      stock: 10,
      quantity: 1
    };
    addToCart(bundleProduct, 1);
    addToast(`Bundle "${bundle.title}" added to cart! (${bundle.savings})`, 'success');
  }, [addToCart, addToast]);

  const updateCartQuantity = useCallback((productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    addToast('Item removed from cart', 'info');
  }, [addToast]);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((id) => {
    setUser((prev) => {
      const exists = prev.favorites.includes(id);
      const updated = exists
        ? prev.favorites.filter((favId) => favId !== id)
        : [...prev.favorites, id];
      return { ...prev, favorites: updated };
    });
    setUser((prev) => {
      const justToggled = prev.favorites.includes(id);
      addToast(justToggled ? 'Saved to favorites!' : 'Removed from favorites', 'success');
      return prev;
    });
  }, [addToast]);

  // Messaging Management with Dual Role & Supabase Sync
  const sendMessage = useCallback((stylistId, text, senderOverride) => {
    if (!text || !text.trim()) return;
    const sender = senderOverride || (userMode === 'vendor' ? 'stylist' : 'user');
    const msgId = `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: msgId,
      sender,
      text: text.trim(),
      time: timeStr
    };

    setConversations((prev) => {
      const existingConv = prev.find((c) => c.stylistId === stylistId);
      if (existingConv) {
        return prev.map((conv) => {
          if (conv.stylistId === stylistId) {
            return {
              ...conv,
              lastMessage: text.trim(),
              lastTimestamp: 'Just now',
              messages: [...conv.messages, newMsg]
            };
          }
          return conv;
        });
      } else {
        const targetStaff = staffList.find((s) => s.id === stylistId) || {
          name: 'Campus Stylist',
          role: 'Hair Specialist',
          avatar: DEFAULT_AVATAR
        };
        const newConv = {
          id: `conv-${stylistId}`,
          stylistId,
          stylistName: targetStaff.name,
          avatar: targetStaff.avatar || DEFAULT_AVATAR,
          stylistRole: targetStaff.role || 'Campus Stylist',
          lastMessage: text.trim(),
          lastTimestamp: 'Just now',
          unreadCount: 0,
          messages: [newMsg]
        };
        return [newConv, ...prev];
      }
    });

    // Sync message to Supabase
    if (isSupabaseConfigured && supabase) {
      const convId = `conv-${stylistId}`;
      supabase.from('conversations').upsert([{
        id: convId,
        stylist_id: stylistId,
        stylist_name: staffList.find((s) => s.id === stylistId)?.name || 'Campus Stylist',
        last_message: text.trim(),
        last_timestamp: timeStr,
        unread_count: 0
      }]).then(() => {
        supabase.from('messages').insert([{
          id: newMsg.id,
          conversation_id: convId,
          sender,
          text: text.trim(),
          time: newMsg.time
        }]).then(null, () => {});
      }, () => {});
    }

    // Client assistant simulation if sending in customer mode
    if (sender === 'user') {
      setTimeout(() => {
        const replies = [
          "Got it! I have your slot booked and will be ready.",
          "Perfect! Looking forward to your appointment. See you at your hostel!",
          "Received! Let me know if you need to adjust anything.",
          "Awesome, see you on campus!"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const stylistReply = {
          id: `m-reply-${Date.now()}`,
          sender: 'stylist',
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setConversations((prev) => {
          return prev.map((conv) => {
            if (conv.stylistId === stylistId) {
              return {
                ...conv,
                lastMessage: randomReply,
                lastTimestamp: 'Just now',
                messages: [...conv.messages, stylistReply]
              };
            }
            return conv;
          });
        });

        if (isSupabaseConfigured && supabase) {
          supabase.from('messages').insert([{
            id: stylistReply.id,
            conversation_id: `conv-${stylistId}`,
            sender: 'stylist',
            text: randomReply,
            time: stylistReply.time
          }]).then(null, () => {});
        }
      }, 1800);
    }
  }, [userMode, staffList]);

  // Smart Booking Creation with Escrow & No-Show Deposit Support
  const createBooking = useCallback(async (newBookingData) => {
    // Bookings require a phone number (the stylist needs a way to reach you).
    // Fail clearly here instead of letting it hit a raw database constraint
    // error, in case an account somehow lacks one.
    if (!user.phone || !user.phone.trim()) {
      addToast('Please add a phone number to your profile before booking (Account → Edit Profile).', 'error');
      throw new Error('Missing phone number');
    }
    const bookingId = generateId('UHS-B');
    const paymentMode = newBookingData.paymentMode || (newBookingData.paymentMethod === 'Pay on Arrival' ? 'arrival' : 'full');
    const totalPrice = Number(newBookingData.totalPrice || newBookingData.price || 0);
    const depositAmount = paymentMode === 'deposit' ? 25 : (paymentMode === 'full' ? totalPrice : 0);
    const balanceDue = Math.max(0, totalPrice - depositAmount);

    const newBooking = {
      id: bookingId,
      ...newBookingData,
      campus: currentCampus,
      customerName: user.name,
      customerPhone: user.phone,
      paymentMode,
      depositAmount,
      balanceDue,
      paymentStatus: paymentMode === 'arrival' ? 'Pending (Pay on Arrival)' : (paymentMode === 'deposit' ? 'Deposit Paid (K25)' : 'Paid in Full'),
      status: 'Confirmed',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Insert into Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: remoteBooking, error } = await supabase.rpc('request_booking', {
          p_service_id: newBookingData.serviceId || 'srv-1',
          p_service_name: newBookingData.serviceName || 'Campus Service',
          p_category: newBookingData.category || 'Barbering',
          p_staff_id: newBookingData.staffId || 'stf-1',
          p_date: newBookingData.date || new Date().toISOString().split('T')[0],
          p_time: newBookingData.time || '14:00',
          p_hostel: newBookingData.hostel || 'Hostel Room',
          p_service_type: newBookingData.serviceType || 'Travel to Dorm',
          p_price: Number(newBookingData.price || 90),
          p_total_price: totalPrice,
          p_add_ons: newBookingData.selectedAddOns || []
        });
        if (error) throw error;
        if (remoteBooking) {
          setBookings((prev) => [remoteBooking, ...prev.filter((booking) => booking.id !== bookingId)]);
        }
      } catch (err) {
        setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
        throw new Error(err.message || 'Unable to request this booking. Please choose another slot.');
      }
    }

    // The vendor's wallet is credited only when the job is actually completed
    // (see transition_booking / completeBooking) — never at request time,
    // and never for a payment that hasn't actually been collected yet.

    // In production, points are credited by the protected transition_booking
    // function only after a stylist marks the appointment completed.
    const pointsEarned = isSupabaseConfigured && supabase ? 0 : Math.max(5, Math.floor(totalPrice / 10));
    const newPtEntry = {
      id: `pt-bk-${Date.now()}`,
      type: 'booking',
      points: pointsEarned,
      title: `Campus Appointment (${newBookingData.serviceName || 'Hair Service'}) 💈`,
      date: new Date().toISOString()
    };
    setUser((prev) => {
      if (pointsEarned === 0) return prev;
      const nextPoints = (prev.loyaltyPoints || 0) + pointsEarned;
      const nextHistory = [newPtEntry, ...(prev.pointsHistory || [])];
      if (isSupabaseConfigured && supabase && prev.id) {
        supabase.from('profiles').update({
          loyalty_points: nextPoints,
          points_history: nextHistory
        }).eq('id', prev.id).then(null, () => {});
      }
      return {
        ...prev,
        loyaltyPoints: nextPoints,
        pointsHistory: nextHistory
      };
    });

    addToast(`Booking ${bookingId} confirmed at ${currentCampus}! +${pointsEarned} loyalty points earned 💎`, 'success');
    trackEvent('booking_created', { bookingId, serviceName: newBookingData.serviceName, totalPrice });
    return newBooking;
  }, [currentCampus, user.name, user.phone, addToast, trackEvent]);

  const updateVendorSchedule = useCallback((stylistId, newScheduleConfig) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === stylistId ? { ...s, scheduleConfig: newScheduleConfig } : s))
    );
    setVendorProfile((prev) => (prev.id === stylistId ? { ...prev, scheduleConfig: newScheduleConfig } : prev));
    addToast('Schedule & class hours updated successfully!', 'success');
  }, [addToast]);

  const cancelBooking = useCallback(async (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('bookings').update({ status: 'Cancelled' }).eq('id', bookingId).then(null, () => {});
    }
    addToast(`Booking ${bookingId} has been cancelled.`, 'info');
  }, [addToast]);

  const claimNoShowRefund = useCallback(async (bookingId) => {
    const target = bookings.find((b) => b.id === bookingId);
    const refundAmount = target?.depositAmount > 0 ? target.depositAmount : (target?.totalPrice || 25);

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Refunded (Stylist No-Show)', paymentStatus: 'Refunded to MoMo' } : b))
    );

    setVendorWallet((prev) => ({
      ...prev,
      availableBalance: Math.max(0, prev.availableBalance - refundAmount)
    }));

    setUser((prev) => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints + 15
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('bookings').update({ status: 'Refunded (Stylist No-Show)', payment_status: 'Refunded to MoMo' }).eq('id', bookingId).then(null, () => {});
    }

    addToast(`Escrow refund of K${refundAmount} credited back to your MoMo account!`, 'success');
  }, [bookings, addToast]);

  const claimClientNoShow = useCallback(async (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Client No-Show', paymentStatus: 'Disbursed to Stylist' } : b))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('bookings').update({ status: 'Client No-Show', payment_status: 'Disbursed to Stylist' }).eq('id', bookingId).then(null, () => {});
    }
    addToast('Client No-Show logged. Deposit fee credited to your wallet for travel compensation.', 'info');
  }, [addToast]);

  const rescheduleBooking = useCallback(async (bookingId, newDate, newTime) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, date: newDate, time: newTime } : b))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('bookings').update({ date: newDate, time: newTime }).eq('id', bookingId).then(null, () => {});
    }
    addToast(`Booking ${bookingId} rescheduled to ${newDate} at ${newTime}`, 'success');
  }, [addToast]);

  // Calendar .ics generator & download
  const exportToCalendar = useCallback((booking) => {
    if (!booking) return;
    const dateFormatted = (booking.date || '2026-08-24').replace(/-/g, '');
    const startTimeStr = (booking.time || '14:00').replace(/[^0-9]/g, '').padEnd(4, '0');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UniHairShop//Campus Appointment//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${booking.id}@unihairshop.co.zm`,
      `DTSTAMP:${dateFormatted}T100000Z`,
      `DTSTART:${dateFormatted}T${startTimeStr}00Z`,
      `SUMMARY:UniHairShop: ${booking.serviceName} with ${booking.staffName || 'Stylist'}`,
      `DESCRIPTION:Campus Grooming Appointment for ${booking.customerName}. Ref: ${booking.id}. Location: ${booking.campus} (${booking.hostel || 'Hostel'})`,
      `LOCATION:${booking.campus}, ${booking.hostel || 'Student Centre'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `UniHairShop_${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Calendar (.ics) invite downloaded! Sync with Apple / Google Calendar.', 'success');
  }, [addToast]);

  // Order Management — places the order server-side via place_order() so real
  // inventory (vendor-listed products) is decremented and sold-out items can
  // never be oversold, and so a vendor's product sales/wallet credit can't be
  // forged by the client. Local/no-Supabase mode keeps a simple simulation
  // since there's no server to be authoritative there.
  const createOrder = useCallback(async (orderData) => {
    const currentCart = cart;

    if (isSupabaseConfigured && supabase) {
      let remoteOrder;
      try {
        const { data, error } = await supabase.rpc('place_order', {
          p_items: currentCart.map((item) => ({
            id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image
          })),
          p_campus: currentCampus,
          p_delivery_type: orderData.deliveryType,
          p_hostel_details: orderData.hostelDetails,
          p_payment_method: orderData.paymentMethod
        });
        if (error) throw error;
        remoteOrder = data;
      } catch (err) {
        addToast(err.message || 'Unable to place this order. Please try again.', 'error');
        throw err;
      }

      const newOrder = {
        id: remoteOrder.id,
        items: remoteOrder.items,
        campus: remoteOrder.campus,
        totalAmount: Number(remoteOrder.total_amount),
        customerName: remoteOrder.customer_name,
        customerPhone: remoteOrder.customer_phone,
        deliveryType: remoteOrder.delivery_type,
        hostelDetails: remoteOrder.hostel_details,
        paymentMethod: remoteOrder.payment_method,
        paymentStatus: remoteOrder.payment_status,
        status: remoteOrder.status,
        createdAt: remoteOrder.created_at
      };
      setOrders((prev) => [newOrder, ...prev]);

      const { data: freshProducts } = await supabase.from('products').select('*');
      if (freshProducts) setProducts(freshProducts);

      const pointsEarned = Math.max(5, Math.floor(newOrder.totalAmount / 10));
      const newOrderPtEntry = {
        id: `pt-ord-${Date.now()}`,
        type: 'order',
        points: pointsEarned,
        title: `Hostel Beauty Order (${currentCart.length || 1} items) 🛍️`,
        date: new Date().toISOString()
      };
      setUser((prev) => {
        const nextPoints = (prev.loyaltyPoints || 0) + pointsEarned;
        const nextHistory = [newOrderPtEntry, ...(prev.pointsHistory || [])];
        if (prev.id) {
          supabase.from('profiles').update({
            loyalty_points: nextPoints,
            points_history: nextHistory
          }).eq('id', prev.id).then(null, () => {});
        }
        return { ...prev, loyaltyPoints: nextPoints, pointsHistory: nextHistory };
      });

      clearCart();
      setIsCartOpen(false);
      addToast(`Order ${newOrder.id} placed for ${currentCampus}! +${pointsEarned} points earned 💎`, 'success');
      trackEvent('order_placed', { orderId: newOrder.id, totalAmount: newOrder.totalAmount, itemCount: currentCart.length });
      return newOrder;
    }

    const orderId = generateId('UHS-ORD');
    const newOrder = {
      id: orderId,
      items: currentCart,
      campus: currentCampus,
      totalAmount: orderData.totalAmount,
      customerName: user.name,
      customerPhone: user.phone,
      deliveryType: orderData.deliveryType,
      hostelDetails: orderData.hostelDetails,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'Pay on Delivery / Pickup' ? 'Pending' : 'Paid',
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setOrders((prev) => [newOrder, ...prev]);
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = currentCart.find((item) => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    const pointsEarned = Math.max(5, Math.floor(orderData.totalAmount / 10));
    const newOrderPtEntry = {
      id: `pt-ord-${Date.now()}`,
      type: 'order',
      points: pointsEarned,
      title: `Hostel Beauty Order (${currentCart.length || 1} items) 🛍️`,
      date: new Date().toISOString()
    };
    setUser((prev) => ({
      ...prev,
      loyaltyPoints: (prev.loyaltyPoints || 0) + pointsEarned,
      pointsHistory: [newOrderPtEntry, ...(prev.pointsHistory || [])]
    }));

    clearCart();
    setIsCartOpen(false);
    addToast(`Order ${orderId} placed for ${currentCampus}! +${pointsEarned} points earned 💎`, 'success');
    trackEvent('order_placed', { orderId, totalAmount: orderData.totalAmount, itemCount: currentCart.length });
    return newOrder;
  }, [cart, currentCampus, user.name, user.phone, clearCart, addToast, trackEvent]);

  // Vendor Specific Actions
  const updateVendorProfile = useCallback(async (profileData) => {
    setVendorProfile((prev) => ({ ...prev, ...profileData }));
    if (isSupabaseConfigured && supabase) {
      const dbPayload = { id: vendorProfile.id, ...profileData };
      if ('idDocumentUrl' in dbPayload) {
        dbPayload.id_document_url = dbPayload.idDocumentUrl;
        delete dbPayload.idDocumentUrl;
      }
      supabase.from('vendor_profiles').upsert([dbPayload]).then(null, () => {});
    }
    addToast('Vendor Studio profile updated!', 'success');
  }, [vendorProfile.id, addToast]);

  const toggleVendorDormTravel = useCallback(() => {
    setVendorProfile((prev) => {
      const nextTravel = !prev.travelsToDorm;
      addToast(nextTravel ? 'Dorm travel enabled for bookings!' : 'Dorm travel turned off (Studio only)', 'info');
      return { ...prev, travelsToDorm: nextTravel };
    });
  }, [addToast]);

  const acceptBooking = useCallback(async (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Confirmed' } : b))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('bookings').update({ status: 'Confirmed' }).eq('id', bookingId).then(null, () => {});
    }
    addToast(`Booking ${bookingId} accepted!`, 'success');
  }, [addToast]);

  // The wallet shown in Vendor Studio is server-authoritative: transition_booking
  // and place_order are the only things that credit it (on a completed job or a
  // product sale) and request_vendor_payout the only thing that debits it, so
  // we always pull real numbers here rather than trust a locally-mutated balance.
  const refreshVendorWallet = useCallback(async (vendorId) => {
    if (!isSupabaseConfigured || !supabase || !vendorId) return;
    const { data: walletRow } = await supabase
      .from('vendor_wallets')
      .select('*')
      .eq('vendor_id', vendorId)
      .maybeSingle();
    const { data: payoutRows } = await supabase
      .from('vendor_payouts')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    setVendorWallet({
      availableBalance: Number(walletRow?.available_balance || 0),
      pendingBalance: Number(walletRow?.pending_balance || 0),
      totalEarned: Number(walletRow?.total_earned || 0),
      completedJobsCount: walletRow?.completed_jobs_count || 0,
      payouts: (payoutRows || []).map((p) => ({
        id: p.id,
        date: p.date,
        amount: Number(p.amount),
        provider: p.provider,
        number: p.number,
        status: p.status,
        ref: p.reference
      }))
    });
  }, []);

  // Real per-product sales history for the "My Shop" tab — written only by
  // place_order(), never client-forgeable.
  const refreshVendorSales = useCallback(async (vendorId) => {
    if (!isSupabaseConfigured || !supabase || !vendorId) return;
    const { data: saleRows } = await supabase
      .from('product_sales')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    setVendorSales((saleRows || []).map((s) => ({
      id: s.id,
      orderId: s.order_id,
      productId: s.product_id,
      productName: s.product_name,
      quantity: s.quantity,
      unitPrice: Number(s.unit_price),
      totalAmount: Number(s.total_amount),
      customerName: s.customer_name,
      createdAt: s.created_at
    })));
  }, []);

  useEffect(() => {
    if (userMode !== 'vendor' || !vendorProfile.id) return;
    refreshVendorWallet(vendorProfile.id);
    refreshVendorSales(vendorProfile.id);
  }, [userMode, vendorProfile.id, refreshVendorWallet, refreshVendorSales]);

  const completeBooking = useCallback(async (bookingId) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    const previousStatus = targetBooking?.status;
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Completed' } : b))
    );
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.rpc('transition_booking', {
        p_booking_id: bookingId,
        p_status: 'Completed',
        p_date: null,
        p_time: null
      });
      if (error) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: previousStatus || b.status } : b))
        );
        addToast(error.message || 'Unable to complete this booking.', 'error');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('loyalty_points, points_history')
        .eq('id', user.id)
        .single();
      if (profile) {
        setUser((prev) => ({ ...prev, loyaltyPoints: profile.loyalty_points || 0, pointsHistory: profile.points_history || [] }));
      }
      await refreshVendorWallet(vendorProfile.id);
    } else {
      const amount = Number(targetBooking?.totalPrice || targetBooking?.total_price || 0);
      setVendorWallet((prev) => ({
        ...prev,
        availableBalance: prev.availableBalance + amount,
        totalEarned: prev.totalEarned + amount,
        completedJobsCount: prev.completedJobsCount + 1
      }));
    }
    addToast(`Booking ${bookingId} marked as completed! Funds ready for payout.`, 'success');
    trackEvent('booking_completed', { bookingId });
  }, [addToast, bookings, user.id, trackEvent, refreshVendorWallet, vendorProfile.id]);

  // Real customer reviews, written server-side only via submit_review() so a
  // vendor's rating/reviews_count can never be forged by the client.
  const submitReview = useCallback(async (bookingId, rating, comment) => {
    if (!isSupabaseConfigured || !supabase) {
      addToast('Reviews require a live connection — please try again once online.', 'error');
      return false;
    }
    const { data, error } = await supabase.rpc('submit_review', {
      p_booking_id: bookingId,
      p_rating: rating,
      p_comment: comment || null
    });
    if (error) {
      addToast(error.message || 'Unable to submit your review.', 'error');
      return false;
    }
    if (data) {
      setReviews((prev) => [data, ...prev]);
    }
    const { data: vendorRow } = await supabase
      .from('vendor_profiles')
      .select('rating, reviews_count')
      .eq('id', data?.vendor_id)
      .single();
    if (vendorRow) {
      setStaffList((prev) =>
        prev.map((s) => (s.id === data.vendor_id ? { ...s, rating: vendorRow.rating, reviewsCount: vendorRow.reviews_count, reviews_count: vendorRow.reviews_count } : s))
      );
    }
    addToast('Thanks for your review!', 'success');
    return true;
  }, [addToast]);

  const requestVendorPayout = useCallback(async (amount, provider, accountNumber) => {
    if (amount <= 0 || amount > vendorWallet.availableBalance) {
      addToast('Invalid payout amount or insufficient balance.', 'error');
      return false;
    }

    if (isSupabaseConfigured && supabase) {
      const { data: payout, error } = await supabase.rpc('request_vendor_payout', {
        p_amount: Number(amount),
        p_provider: provider || 'Airtel Money',
        p_number: accountNumber || vendorProfile.payoutNumber
      });
      if (error) {
        addToast(error.message || 'Unable to request payout.', 'error');
        return false;
      }
      await refreshVendorWallet(vendorProfile.id);
      addToast(`Payout of K${amount} sent to ${provider} (${accountNumber})! Ref: ${payout?.reference}`, 'success');
      return true;
    }

    const payoutId = generateId('PAY');
    const newPayout = {
      id: payoutId,
      date: new Date().toISOString().split('T')[0],
      amount: Number(amount),
      provider: provider || 'Airtel Money',
      number: accountNumber || vendorProfile.payoutNumber,
      status: 'Completed',
      ref: `${provider.slice(0, 3).toUpperCase()}-TX-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setVendorWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - Number(amount),
      payouts: [newPayout, ...prev.payouts]
    }));
    addToast(`Payout of K${amount} sent to ${provider} (${accountNumber})! Ref: ${newPayout.ref}`, 'success');
    return true;
  }, [vendorWallet.availableBalance, vendorProfile.id, vendorProfile.payoutNumber, addToast, refreshVendorWallet]);

  const addVendorPortfolioItem = useCallback((item) => {
    const newItem = {
      id: generateId('port'),
      image: item.image || '/images/barber_service.jpg',
      tag: item.tag || 'Hair Transformation',
      client: item.client || 'Campus Client'
    };

    const currentEntry = staffList.find((s) => s.id === vendorProfile.id);
    const nextPortfolio = [newItem, ...(currentEntry?.portfolio || [])];

    setStaffList((prev) =>
      prev.map((s) => (s.id === vendorProfile.id ? { ...s, portfolio: nextPortfolio } : s))
    );

    if (isSupabaseConfigured && supabase && vendorProfile.id) {
      supabase.from('vendor_profiles').update({ portfolio: nextPortfolio }).eq('id', vendorProfile.id).then(null, () => {});
    }

    addToast(`New hairstyle "${item.tag}" added to your portfolio!`, 'success');
  }, [vendorProfile.id, staffList, addToast]);

  const addService = useCallback(async (serviceData) => {
    const newId = generateId('srv');
    const newSrv = {
      id: newId,
      ...serviceData,
      image: serviceData.image || '/images/barber_service.jpg',
      staffIds: [vendorProfile.id]
    };
    setServices((prev) => [...prev, newSrv]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('services').insert([{
        id: newId,
        name: serviceData.name,
        category: serviceData.category,
        price: serviceData.price,
        duration: serviceData.duration,
        description: serviceData.description,
        image: newSrv.image,
        can_travel: serviceData.canTravel,
        in_studio: serviceData.inStudio,
        staff_ids: [vendorProfile.id]
      }]).then(null, () => {});
    }

    addToast(`New service "${serviceData.name}" added to your menu!`, 'success');
  }, [vendorProfile.id, addToast]);

  const updateService = useCallback((id, updatedData) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
    addToast('Service updated', 'success');
  }, [addToast]);

  const addProduct = useCallback(async (productData) => {
    const newId = generateId('prd');
    const newPrd = { id: newId, ...productData, image: productData.image || '/images/hair_product.jpg', rating: 0, reviewsCount: 0 };
    setProducts((prev) => [...prev, newPrd]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').insert([{
        id: newId,
        name: productData.name,
        category: productData.category,
        price: productData.price,
        stock: productData.stock,
        description: productData.description,
        image: newPrd.image,
        vendor_id: productData.vendorId || null
      }]).then(null, () => {});
    }

    addToast(`New product "${productData.name}" added to shop!`, 'success');
    return newPrd;
  }, [addToast]);

  const updateProductStock = useCallback((productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Number(newStock) } : p))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('products').update({ stock: Number(newStock) }).eq('id', productId).then(null, () => {});
    }
    addToast('Stock level updated', 'info');
  }, [addToast]);

  const deleteProduct = useCallback((productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (isSupabaseConfigured && supabase) {
      supabase.from('products').delete().eq('id', productId).then(null, () => {});
    }
    addToast('Product removed from shop', 'info');
  }, [addToast]);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('orders').update({ status: newStatus }).eq('id', orderId).then(null, () => {});
    }
    addToast(`Order ${orderId} updated to "${newStatus}"`, 'success');
  }, [addToast]);

  const updateBookingStatus = useCallback((bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId).then(null, () => {});
    }
    addToast(`Booking ${bookingId} marked as "${newStatus}"`, 'success');
  }, [addToast]);

  // Authentication & RBAC Functions
  const signIn = useCallback(async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      setUser((prev) => ({ ...prev, isLoggedIn: true, email }));
      addToast('Signed in successfully!', 'success');
      return { success: true };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    if (data?.session) {
      setSession(data.session);
    }
    return { success: true, data };
  }, [addToast]);

  const signUp = useCallback(async (userData) => {
    const isStylist = userData.role === 'vendor';
    const cleanEmail = userData.email.trim();
    const cleanName = userData.name.trim();
    const cleanPhone = userData.phone.trim();
    const cleanCampus = userData.campus || currentCampus;
    const cleanHostel = userData.hostel?.trim() || 'Campus Hostel';
    const cleanReferralCode = (userData.referralCode || '').trim().toUpperCase();
    const assignedRole = isStylist ? 'vendor' : 'customer';

    // Unique 7-digit referral code
    const userReferralCode = generate7DigitReferralCode();

    // Reward points calculation
    const baseWelcomePoints = 50;
    const referralBonusPoints = cleanReferralCode ? 25 : 0;
    const totalInitialPoints = baseWelcomePoints + referralBonusPoints;

    const initialPointsHistory = [
      {
        id: `pt-welcome-${Date.now()}`,
        type: 'welcome',
        points: baseWelcomePoints,
        title: 'Welcome to UniHair Shop Bonus 🎓',
        date: new Date().toISOString()
      }
    ];

    if (cleanReferralCode) {
      initialPointsHistory.push({
        id: `pt-ref-bonus-${Date.now()}`,
        type: 'referral_used',
        points: referralBonusPoints,
        title: `Campus Referral Bonus (Code: ${cleanReferralCode}) 🎁`,
        date: new Date().toISOString()
      });
    }

    if (!isSupabaseConfigured || !supabase) {
      const newUserId = `usr-${Date.now().toString(36)}`;
      const newUser = {
        isLoggedIn: true,
        id: newUserId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        campus: cleanCampus,
        hostel: cleanHostel,
        role: assignedRole,
        loyaltyPoints: totalInitialPoints,
        referralCode: userReferralCode,
        referredBy: cleanReferralCode || null,
        referralCount: 0,
        pointsHistory: initialPointsHistory,
        favorites: []
      };
      setUser(newUser);
      if (isStylist) {
        setUserMode('vendor');
        setVendorProfile((prev) => ({
          ...prev,
          id: newUserId,
          name: cleanName,
          campus: cleanCampus,
          dormLocation: cleanHostel,
          phone: cleanPhone,
          isVerified: false,
          badge: 'Campus Stylist (Pending Verification)'
        }));
        setStaffList((prev) => [
          ...prev,
          {
            id: newUserId,
            name: cleanName,
            role: 'Hair Specialist',
            campus: cleanCampus,
            dormLocation: cleanHostel,
            avatar: DEFAULT_AVATAR,
            isVerified: false,
            badge: 'Campus Stylist',
            travelsToDorm: true,
            travelFee: 20,
            hasStudio: true,
            phone: cleanPhone,
            payoutProvider: 'Airtel Money',
            payoutNumber: cleanPhone
          }
        ]);
      }
      addToast(
        cleanReferralCode
          ? `Welcome to UniHair Shop, ${cleanName}! 🎓 ${baseWelcomePoints} pts welcome + 25 pts referral bonus added (${totalInitialPoints} Pts total)!`
          : `Welcome to UniHair Shop, ${cleanName}! 🎓 +${baseWelcomePoints} welcome reward points added!`,
        'success'
      );
      trackEvent('signup_completed', { role: assignedRole, campus: cleanCampus, referred: Boolean(cleanReferralCode) });
      return { success: true };
    }

    // Remote Supabase Auth SignUp
    const redirectUrl = typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/`
      : 'https://www.unihair.shop/';

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: userData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: cleanName,
          phone: cleanPhone,
          campus: cleanCampus,
          hostel: cleanHostel,
          role: assignedRole,
          referral_code: userReferralCode,
          referred_by: cleanReferralCode || null
        }
      }
    });

    if (error) throw error;

    if (data?.user) {
      const newUserId = data.user.id;

      // Note: the profiles row (including welcome points and referral bonus) is created
      // server-side by the handle_new_user() DB trigger on auth.users insert — it doesn't
      // need a client-side write here. vendor_profiles has no equivalent trigger, so that
      // upsert below is still required for stylist signups.
      if (isStylist) {
        try {
          await supabase.from('vendor_profiles').upsert([{
            id: newUserId,
            name: cleanName,
            role: 'Hair Specialist',
            campus: cleanCampus,
            dorm_location: cleanHostel,
            avatar: DEFAULT_AVATAR,
            is_verified: false,
            badge: 'Campus Stylist (Pending Verification)',
            travels_to_dorm: true,
            travel_fee: 20,
            has_studio: true,
            phone: cleanPhone,
            bio: `Campus stylist at ${cleanCampus}`,
            payout_provider: 'Airtel Money',
            payout_number: cleanPhone
          }]);
        } catch { /* ignore */ }
      }

      // Only log the new account in locally if Supabase actually returned a live
      // session (i.e. email confirmation is disabled). When confirmation is required,
      // data.session is null and the user must confirm their email and sign in explicitly —
      // otherwise the app would show them as logged in with no real Supabase session.
      if (data.session) {
        setUser({
          isLoggedIn: true,
          id: newUserId,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          campus: cleanCampus,
          hostel: cleanHostel,
          role: assignedRole,
          loyaltyPoints: totalInitialPoints,
          referralCode: userReferralCode,
          referredBy: cleanReferralCode || null,
          referralCount: 0,
          pointsHistory: initialPointsHistory,
          favorites: []
        });

        if (isStylist) {
          setUserMode('vendor');
        }

        setSession(data.session);
      }
    }

    addToast(
      cleanReferralCode
        ? `Account created successfully! Welcome, ${cleanName}! 🎓 ${baseWelcomePoints} pts welcome + 25 pts referral bonus added (${totalInitialPoints} Pts total)!`
        : `Account created successfully! Welcome, ${cleanName}! 🎓 +${baseWelcomePoints} welcome points added!`,
      'success'
    );
    trackEvent('signup_completed', { role: assignedRole, campus: cleanCampus, referred: Boolean(cleanReferralCode) });
    return { success: true, data };
  }, [currentCampus, addToast, trackEvent]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setSession(null);
    setUser(defaultGuestUser);
    setUserMode('customer');
    addToast('Signed out of UniHairShop', 'info');
  }, [addToast]);

  const terminateAllSessions = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut({ scope: 'global' }).catch(() => {});
      } catch { /* ignore */ }
    }
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('sb-') || key.startsWith('unihair_user') || key.startsWith('unihair_session')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } catch { /* ignore */ }

    setSession(null);
    setUser(defaultGuestUser);
    setUserMode('customer');
    setIsGuestMode(false);
    addToast('All active sessions terminated. Please sign in or create a new account.', 'info');
  }, [addToast]);

  const continueAsGuest = useCallback(() => {
    setIsGuestMode(true);
    try {
      localStorage.setItem('unihair_guest_mode', 'true');
    } catch {}
    addToast('Exploring UniHairShop in Guest Mode. 🎓 Sign in anytime to book or message!', 'info');
  }, [addToast]);

  const exitGuestMode = useCallback(() => {
    setIsGuestMode(false);
    try {
      localStorage.removeItem('unihair_guest_mode');
    } catch {}
  }, []);

  const requireAuth = useCallback((actionCallback) => {
    if (user?.isLoggedIn && (session || !isSupabaseConfigured)) {
      actionCallback();
    } else {
      setPendingAuthCallback(() => actionCallback);
      setShowAuthModal(true);
    }
  }, [user?.isLoggedIn, session]);

  const updateUserProfile = useCallback(async (profileUpdates) => {
    setUser((prev) => ({ ...prev, ...profileUpdates }));
    if (isSupabaseConfigured && supabase && user.id) {
      try {
        await supabase.from('profiles').update({
          name: profileUpdates.name,
          phone: profileUpdates.phone,
          hostel: profileUpdates.hostel,
          campus: profileUpdates.campus
        }).eq('id', user.id);
      } catch { /* ignore */ }
    }
    addToast('Student profile updated successfully!', 'success');
  }, [user.id, addToast]);

  const onboardAsStylist = useCallback(async (stylistData) => {
    setUser((prev) => ({ ...prev, role: 'vendor' }));
    // Not verified yet — an admin has to review this stylist (and, ideally, an
    // ID document) before the "Verified" badge is real. The DB trigger already
    // enforces this server-side; this local state just needs to match reality.
    const newVendor = {
      id: user.id || `stf-${Date.now().toString(36)}`,
      name: stylistData.name || user.name,
      role: stylistData.specialty || 'Barbering',
      campus: stylistData.campus || currentCampus,
      dormLocation: stylistData.hostel || user.hostel || 'Hostel Studio',
      avatar: DEFAULT_AVATAR,
      isVerified: false,
      badge: 'Campus Stylist (Pending Verification)',
      travelsToDorm: true,
      travelFee: 20,
      hasStudio: true,
      phone: stylistData.phone || user.phone,
      bio: stylistData.bio || `Campus stylist at ${currentCampus}.`,
      payoutProvider: 'Airtel Money',
      payoutNumber: stylistData.phone || user.phone
    };

    setVendorProfile(newVendor);
    setUserMode('vendor');

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').update({ role: 'vendor' }).eq('id', user.id);
        await supabase.from('vendor_profiles').upsert([{
          id: newVendor.id,
          name: newVendor.name,
          role: newVendor.role,
          campus: newVendor.campus,
          dorm_location: newVendor.dormLocation,
          avatar: newVendor.avatar,
          is_verified: false,
          badge: newVendor.badge,
          travels_to_dorm: true,
          travel_fee: 20,
          has_studio: true,
          phone: newVendor.phone,
          bio: newVendor.bio,
          payout_provider: newVendor.payoutProvider,
          payout_number: newVendor.payoutNumber
        }]);
      } catch { /* ignore */ }
    }

    addToast('Welcome to Vendor Studio! Your profile is pending verification — an admin will review it shortly.', 'success');
  }, [user, currentCampus, addToast]);

  // Master Admin Specific Operations
  const verifyStylist = useCallback(async (stylistId, isVerified) => {
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === stylistId
          ? { ...s, isVerified, is_verified: isVerified, badge: isVerified ? 'Verified Campus Stylist' : 'Campus Stylist' }
          : s
      )
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('vendor_profiles')
          .update({
            is_verified: isVerified,
            badge: isVerified ? 'Verified Campus Stylist' : 'Campus Stylist'
          })
          .eq('id', stylistId);
      } catch { /* ignore */ }
    }

    addToast(isVerified ? 'Stylist verification badge approved! 🛡️' : 'Stylist badge removed.', 'success');
  }, [addToast]);

  const settleVendorPayout = useCallback(async (payoutId, reference) => {
    const txRef = reference || `SETTLED-AM-${Math.floor(100000 + Math.random() * 900000)}`;

    setVendorWallet((prev) => ({
      ...prev,
      payouts: prev.payouts.map((p) =>
        p.id === payoutId ? { ...p, status: 'Completed', ref: txRef } : p
      )
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('vendor_payouts')
          .update({ status: 'Completed', reference: txRef })
          .eq('id', payoutId);
      } catch { /* ignore */ }
    }

    addToast(`Payout ${payoutId} settled successfully! Ref: ${txRef}`, 'success');
  }, [addToast]);

  // Context value memoization
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    userMode,
    setUserMode,
    toggleUserMode,
    switchViewMode,
    availableViewModes,
    vendorTab,
    setVendorTab,
    vendorProfile,
    updateVendorProfile,
    toggleVendorDormTravel,
    vendorWallet,
    vendorSales,
    requestVendorPayout,
    acceptBooking,
    completeBooking,
    addVendorPortfolioItem,
    activeTab,
    setActiveTab,
    currentCampus,
    setCurrentCampus,
    lusakaUniversities,
    session,
    authLoading,
    isGuestMode,
    setIsGuestMode,
    continueAsGuest,
    exitGuestMode,
    user,
    setUser,
    signIn,
    signUp,
    signOut,
    terminateAllSessions,
    requireAuth,
    pendingAuthCallback,
    setPendingAuthCallback,
    updateUserProfile,
    onboardAsStylist,
    services,
    products,
    bundles,
    staffList,
    bookings,
    orders,
    cart,
    addToCart,
    addBundleToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    toggleFavorite,
    showAuthModal,
    setShowAuthModal,
    isCartOpen,
    setIsCartOpen,
    bookingService,
    setBookingService,
    selectedProduct,
    setSelectedProduct,
    selectedStylist,
    setSelectedStylist,
    showSafetyModal,
    setShowSafetyModal,
    lencoCheckoutState,
    setLencoCheckoutState,
    conversations,
    reviews,
    submitReview,
    trackEvent,
    activeChatStylistId,
    setActiveChatStylistId,
    sendMessage,
    createBooking,
    cancelBooking,
    rescheduleBooking,
    claimNoShowRefund,
    claimClientNoShow,
    updateVendorSchedule,
    exportToCalendar,
    createOrder,
    addService,
    updateService,
    addProduct,
    updateProductStock,
    deleteProduct,
    updateOrderStatus,
    updateBookingStatus,
    verifyStylist,
    settleVendorPayout,
    filterCategory,
    setFilterCategory,
    serviceTypeFilter,
    setServiceTypeFilter,
    priceFilter,
    setPriceFilter,
    ratingFilter,
    setRatingFilter,
    availabilityFilter,
    setAvailabilityFilter,
    toasts,
    addToast,
    dismissToast
  }), [
    theme, toggleTheme, userMode, toggleUserMode, switchViewMode, availableViewModes, vendorTab,
    vendorProfile, updateVendorProfile, toggleVendorDormTravel, vendorWallet, vendorSales,
    requestVendorPayout, acceptBooking, completeBooking, addVendorPortfolioItem,
    activeTab, currentCampus, session, authLoading, isGuestMode, continueAsGuest, exitGuestMode, user,
    signIn, signUp, signOut, terminateAllSessions, requireAuth, pendingAuthCallback, updateUserProfile, onboardAsStylist,
    verifyStylist, settleVendorPayout,
    services, products, bundles, staffList, bookings, orders, cart,
    showAuthModal, isCartOpen, bookingService, selectedProduct, selectedStylist,
    showSafetyModal, lencoCheckoutState, conversations, reviews, submitReview, trackEvent, activeChatStylistId,
    filterCategory, serviceTypeFilter, priceFilter, ratingFilter, availabilityFilter,
    toasts,
    addToCart, addBundleToCart, updateCartQuantity, removeFromCart, clearCart,
    toggleFavorite, sendMessage, createBooking, cancelBooking, rescheduleBooking,
    claimNoShowRefund, claimClientNoShow,
    updateVendorSchedule, exportToCalendar, createOrder, addService, updateService, addProduct,
    updateProductStock, deleteProduct, updateOrderStatus, updateBookingStatus,
    addToast, dismissToast
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
