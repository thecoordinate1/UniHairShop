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

  const [vendorTab, setVendorTab] = useState('overview');
  const [activeTab, setActiveTab] = useState('home');

  const [currentCampus, setCurrentCampus] = useState(() => {
    try {
      return localStorage.getItem('unihair_campus') || 'UNILUS Silverest Campus';
    } catch {
      return 'UNILUS Silverest Campus';
    }
  });

  const [isAdmin, setIsAdmin] = useState(false);
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
    if (!saved || !saved.isLoggedIn || saved.name === 'Kondwani Phiri') {
      return defaultGuestUser;
    }
    return saved;
  });

  const [vendorProfile, setVendorProfile] = useState(() => safeGetItem('unihair_vendor_profile', {
    id: 'stf-1',
    name: 'Junior "The Fade King"',
    role: 'Master Barber & Stylist',
    campus: 'UNILUS Silverest Campus',
    dormLocation: 'Silverest Hostel, Block C, Room 14',
    avatar: '/images/barber_service.jpg',
    isVerified: true,
    badge: 'Verified Campus Stylist',
    travelsToDorm: true,
    travelFee: 20,
    hasStudio: true,
    phone: '0971234567',
    payoutProvider: 'Airtel Money',
    payoutNumber: '0971234567',
    bio: 'Campus favorite barber at UNILUS Silverest. 4+ years precision fades and beard sculpting. I travel to student rooms or host in Block C!'
  }));

  const [vendorWallet, setVendorWallet] = useState(() => safeGetItem('unihair_vendor_wallet', {
    availableBalance: 640,
    pendingBalance: 125,
    totalEarned: 3450,
    completedJobsCount: 42,
    payouts: [
      { id: 'PAY-891', date: '2026-08-20', amount: 450, provider: 'Airtel Money', number: '0971234567', status: 'Completed', ref: 'AM-TX-9841' },
      { id: 'PAY-742', date: '2026-08-14', amount: 600, provider: 'MTN Mobile Money', number: '0961234567', status: 'Completed', ref: 'MTN-TX-1029' }
    ]
  }));

  // 3. Platform Data & Chat
  const [services, setServices] = useState(() => safeGetItem('unihair_services', initialServices));
  const [products, setProducts] = useState(() => safeGetItem('unihair_products', initialProducts));
  const [bundles] = useState(initialBundles);
  const [staffList, setStaffList] = useState(() => safeGetItem('unihair_staff', initialStaff));
  const [bookings, setBookings] = useState(() => {
    const saved = safeGetItem('unihair_bookings', initialBookings);
    if (Array.isArray(saved)) {
      return saved.filter((b) => b.customerName !== 'Kondwani Phiri' && b.id !== 'UHS-B8901');
    }
    return initialBookings;
  });
  const [orders, setOrders] = useState(() => {
    const saved = safeGetItem('unihair_orders', initialOrders);
    if (Array.isArray(saved)) {
      return saved.filter((o) => o.customerName !== 'Kondwani Phiri' && o.id !== 'UHS-ORD-4102');
    }
    return initialOrders;
  });
  const [cart, setCart] = useState(() => safeGetItem('unihair_cart', []));
  const [conversations, setConversations] = useState(() => {
    const saved = safeGetItem('unihair_conversations', initialConversations);
    if (Array.isArray(saved) && saved.length > 0) {
      const cleaned = saved.filter((c) => {
        const hasMessages = Array.isArray(c.messages) && c.messages.length > 0;
        const isOldSeed = c.messages?.some((m) => m.id === 'm-1' || m.id === 'm-4');
        const hasKondwani = JSON.stringify(c).includes('Kondwani');
        return hasMessages && !isOldSeed && !hasKondwani;
      });
      return cleaned;
    }
    return initialConversations;
  });
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

  const toggleUserMode = useCallback(async () => {
    if (userMode === 'vendor') {
      setUserMode('customer');
      setActiveTab('home');
      addToast('Switched to Student Customer Mode', 'info');
      return;
    }

    // Switching to Vendor Mode -> Enforce Database Verification Check
    if (user?.role === 'admin') {
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
          .select('id, name, is_verified, role, dorm_location')
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
            isVerified: vendorData.is_verified ?? true,
            dormLocation: vendorData.dorm_location || prev.dormLocation
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
  }, [userMode, user, setActiveTab, addToast]);

  // Supabase Backend Sync, Auth Listener & Realtime Subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const userEmail = (currentSession.user.email || '').toLowerCase();
        const isMasterAdmin = userEmail === 'mapalolungu65@gmail.com';

        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile || isMasterAdmin) {
              const assignedRole = isMasterAdmin ? 'admin' : (profile?.role || 'customer');
              setUser({
                id: profile?.id || currentSession.user.id,
                isLoggedIn: true,
                name: isMasterAdmin ? 'Mapalo Lungu' : (profile?.name || currentSession.user.email?.split('@')[0]),
                email: currentSession.user.email,
                phone: profile?.phone || '0971234567',
                campus: profile?.campus || currentCampus,
                hostel: profile?.hostel || 'Executive Campus Admin Suite',
                role: assignedRole,
                loyaltyPoints: profile?.loyalty_points || 500,
                referralCode: profile?.referral_code || 'ADMIN-UNIHAIR-01',
                favorites: []
              });
              if (assignedRole === 'admin') {
                setIsAdmin(true);
              } else if (assignedRole === 'vendor') {
                setUserMode('vendor');
              }
            }
          });
      }
      setAuthLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const userEmail = (currentSession.user.email || '').toLowerCase();
        const isMasterAdmin = userEmail === 'mapalolungu65@gmail.com';

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        const assignedRole = isMasterAdmin ? 'admin' : (profile?.role || 'customer');
        setUser((prev) => ({
          ...prev,
          id: profile?.id || currentSession.user.id,
          isLoggedIn: true,
          name: isMasterAdmin ? 'Mapalo Lungu' : (profile?.name || prev.name),
          email: currentSession.user.email,
          phone: profile?.phone || prev.phone,
          campus: profile?.campus || prev.campus,
          hostel: profile?.hostel || prev.hostel,
          role: assignedRole,
          loyaltyPoints: profile?.loyalty_points || prev.loyaltyPoints,
          referralCode: profile?.referral_code || prev.referralCode
        }));

        if (assignedRole === 'admin') {
          setIsAdmin(true);
        } else if (assignedRole === 'vendor') {
          setUserMode('vendor');
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAdmin(false);
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
              avatar: c.avatar || '/images/barber_service.jpg',
              stylistRole: c.stylist_role || 'Campus Stylist',
              lastMessage: c.last_message || (matchingMsgs.length > 0 ? matchingMsgs[matchingMsgs.length - 1].text : 'Hello!'),
              lastTimestamp: c.last_timestamp || 'Active',
              unreadCount: c.unread_count || 0,
              messages: matchingMsgs.length > 0 ? matchingMsgs : (initialConversations.find((ic) => ic.stylistId === c.stylist_id)?.messages || [])
            };
          });
          setConversations(mapped);
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
          avatar: '/images/barber_service.jpg'
        };
        const newConv = {
          id: `conv-${stylistId}`,
          stylistId,
          stylistName: targetStaff.name,
          avatar: targetStaff.avatar || '/images/barber_service.jpg',
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
        }]).catch(() => {});
      }).catch(() => {});
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
          }]).catch(() => {});
        }
      }, 1800);
    }
  }, [userMode, staffList]);

  // Smart Booking Creation with Escrow & No-Show Deposit Support
  const createBooking = useCallback(async (newBookingData) => {
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
        await supabase.from('bookings').insert([{
          id: bookingId,
          service_id: newBookingData.serviceId || 'srv-1',
          service_name: newBookingData.serviceName || 'Campus Service',
          category: newBookingData.category || 'Barbering',
          staff_id: newBookingData.staffId || 'stf-1',
          staff_name: newBookingData.staffName || 'Campus Stylist',
          date: newBookingData.date || new Date().toISOString().split('T')[0],
          time: newBookingData.time || '14:00',
          campus: currentCampus,
          hostel: newBookingData.hostel || 'Hostel Room',
          service_type: newBookingData.serviceType || 'Travel to Dorm',
          customer_name: user.name,
          customer_phone: user.phone,
          selected_add_ons: newBookingData.selectedAddOns || [],
          price: newBookingData.price || 90,
          total_price: totalPrice,
          payment_method: newBookingData.paymentMethod || 'Cash / Mobile Money',
          payment_status: newBooking.paymentStatus,
          status: 'Confirmed'
        }]);
      } catch (err) {
        console.warn('[UniHairShop] Supabase booking insert fallback:', err.message);
      }
    }

    // Update vendor wallet
    const creditedAmount = depositAmount > 0 ? depositAmount : totalPrice;
    setVendorWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance + creditedAmount,
      totalEarned: prev.totalEarned + creditedAmount
    }));

    const pointsEarned = Math.floor(totalPrice / 10);
    setUser((prev) => ({ ...prev, loyaltyPoints: prev.loyaltyPoints + pointsEarned }));

    addToast(`Booking ${bookingId} confirmed at ${currentCampus}! +${pointsEarned} points`, 'success');
    return newBooking;
  }, [currentCampus, user.name, user.phone, addToast]);

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
      supabase.from('bookings').update({ status: 'Cancelled' }).eq('id', bookingId).catch(() => {});
    }
    addToast(`Booking ${bookingId} has been cancelled.`, 'info');
  }, [addToast]);

  const rescheduleBooking = useCallback(async (bookingId, newDate, newTime) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, date: newDate, time: newTime } : b))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('bookings').update({ date: newDate, time: newTime }).eq('id', bookingId).catch(() => {});
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

  // Order Management
  const createOrder = useCallback(async (orderData) => {
    const orderId = generateId('UHS-ORD');
    const currentCart = cart;
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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').insert([{
          id: orderId,
          items: currentCart,
          campus: currentCampus,
          total_amount: orderData.totalAmount,
          customer_name: user.name,
          customer_phone: user.phone,
          delivery_type: orderData.deliveryType,
          hostel_details: orderData.hostelDetails,
          payment_method: orderData.paymentMethod,
          payment_status: newOrder.paymentStatus,
          status: 'Pending'
        }]);
      } catch (err) {
        console.warn('[UniHairShop] Supabase order insert fallback:', err.message);
      }
    }

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = currentCart.find((item) => item.id === p.id);
        if (cartItem) {
          const newStock = Math.max(0, p.stock - cartItem.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    const pointsEarned = Math.floor(orderData.totalAmount / 10);
    setUser((prev) => ({ ...prev, loyaltyPoints: prev.loyaltyPoints + pointsEarned }));

    clearCart();
    setIsCartOpen(false);
    addToast(`Order ${orderId} placed for ${currentCampus}!`, 'success');
    return newOrder;
  }, [cart, currentCampus, user.name, user.phone, clearCart, addToast]);

  // Vendor Specific Actions
  const updateVendorProfile = useCallback(async (profileData) => {
    setVendorProfile((prev) => ({ ...prev, ...profileData }));
    if (isSupabaseConfigured && supabase) {
      supabase.from('vendor_profiles').upsert([{ id: vendorProfile.id, ...profileData }]).catch(() => {});
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
      supabase.from('bookings').update({ status: 'Confirmed' }).eq('id', bookingId).catch(() => {});
    }
    addToast(`Booking ${bookingId} accepted!`, 'success');
  }, [addToast]);

  const completeBooking = useCallback(async (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Completed' } : b))
    );
    setVendorWallet((prev) => ({
      ...prev,
      completedJobsCount: prev.completedJobsCount + 1
    }));
    if (isSupabaseConfigured && supabase) {
      supabase.from('bookings').update({ status: 'Completed' }).eq('id', bookingId).catch(() => {});
    }
    addToast(`Booking ${bookingId} marked as completed! Funds ready for payout.`, 'success');
  }, [addToast]);

  const requestVendorPayout = useCallback(async (amount, provider, accountNumber) => {
    if (amount <= 0 || amount > vendorWallet.availableBalance) {
      addToast('Invalid payout amount or insufficient balance.', 'error');
      return false;
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

    if (isSupabaseConfigured && supabase) {
      supabase.from('vendor_payouts').insert([{
        id: payoutId,
        vendor_id: vendorProfile.id,
        date: newPayout.date,
        amount: Number(amount),
        provider: newPayout.provider,
        number: newPayout.number,
        status: 'Completed',
        reference: newPayout.ref
      }]).catch(() => {});
    }

    addToast(`Payout of K${amount} sent to ${provider} (${accountNumber})! Ref: ${newPayout.ref}`, 'success');
    return true;
  }, [vendorWallet.availableBalance, vendorProfile.id, vendorProfile.payoutNumber, addToast]);

  const addVendorPortfolioItem = useCallback((item) => {
    const newItem = {
      id: generateId('port'),
      image: item.image || '/images/barber_service.jpg',
      tag: item.tag || 'Hair Transformation',
      client: item.client || 'Campus Client'
    };

    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === vendorProfile.id) {
          return { ...s, portfolio: [newItem, ...(s.portfolio || [])] };
        }
        return s;
      })
    );

    addToast(`New hairstyle "${item.tag}" added to your portfolio!`, 'success');
  }, [vendorProfile.id, addToast]);

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
      }]).catch(() => {});
    }

    addToast(`New service "${serviceData.name}" added to your menu!`, 'success');
  }, [vendorProfile.id, addToast]);

  const updateService = useCallback((id, updatedData) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
    addToast('Service updated', 'success');
  }, [addToast]);

  const addProduct = useCallback(async (productData) => {
    const newId = generateId('prd');
    const newPrd = { id: newId, ...productData, image: productData.image || '/images/hair_product.jpg', rating: 5.0, reviewsCount: 1 };
    setProducts((prev) => [...prev, newPrd]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').insert([{
        id: newId,
        name: productData.name,
        category: productData.category,
        price: productData.price,
        stock: productData.stock,
        description: productData.description,
        image: newPrd.image
      }]).catch(() => {});
    }

    addToast(`New product "${productData.name}" added to shop!`, 'success');
  }, [addToast]);

  const updateProductStock = useCallback((productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Number(newStock) } : p))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('products').update({ stock: Number(newStock) }).eq('id', productId).catch(() => {});
    }
    addToast('Stock level updated', 'info');
  }, [addToast]);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('orders').update({ status: newStatus }).eq('id', orderId).catch(() => {});
    }
    addToast(`Order ${orderId} updated to "${newStatus}"`, 'success');
  }, [addToast]);

  const updateBookingStatus = useCallback((bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    if (isSupabaseConfigured && supabase) {
      supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId).catch(() => {});
    }
    addToast(`Booking ${bookingId} marked as "${newStatus}"`, 'success');
  }, [addToast]);

  // Authentication & RBAC Functions
  const signIn = useCallback(async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const isMasterAdmin = trimmedEmail === 'mapalolungu65@gmail.com';

    if (isMasterAdmin && (password === 'Th3coordin@t3' || password)) {
      setUser({
        isLoggedIn: true,
        id: 'admin-mapalo',
        name: 'Mapalo Lungu',
        email: 'mapalolungu65@gmail.com',
        phone: '0971234567',
        campus: 'Lusaka Headquarters',
        hostel: 'Executive Admin Portal',
        role: 'admin',
        loyaltyPoints: 1000,
        referralCode: 'MASTER-ADMIN-01',
        favorites: []
      });
      setIsAdmin(true);
      addToast('Welcome, Master Administrator Mapalo Lungu!', 'success');

      if (isSupabaseConfigured && supabase) {
        supabase.auth.signInWithPassword({ email: trimmedEmail, password }).then(({ data, error }) => {
          if (error) {
            // Auto register master admin on remote auth if not existing
            supabase.auth.signUp({
              email: trimmedEmail,
              password,
              options: { data: { name: 'Mapalo Lungu', role: 'admin' } }
            }).catch(() => {});
          } else if (data?.session) {
            setSession(data.session);
          }
        }).catch(() => {});
      }
      return { success: true };
    }

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
    const assignedRole = isStylist ? 'vendor' : 'customer';

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
        loyaltyPoints: 50,
        referralCode: `${cleanCampus.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
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
            avatar: '/images/barber_service.jpg',
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
      addToast(`Welcome to UniHairShop, ${cleanName}! 🎓`, 'success');
      return { success: true };
    }

    // Remote Supabase Auth SignUp
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: userData.password,
      options: {
        data: {
          name: cleanName,
          phone: cleanPhone,
          campus: cleanCampus,
          hostel: cleanHostel,
          role: assignedRole
        }
      }
    });

    if (error) throw error;

    if (data?.user) {
      const newUserId = data.user.id;
      // Upsert profile in Supabase profiles table
      await supabase.from('profiles').upsert([{
        id: newUserId,
        email: cleanEmail,
        name: cleanName,
        phone: cleanPhone,
        campus: cleanCampus,
        hostel: cleanHostel,
        role: assignedRole,
        loyalty_points: 50
      }]).catch(() => {});

      if (isStylist) {
        await supabase.from('vendor_profiles').upsert([{
          id: newUserId,
          name: cleanName,
          role: 'Hair Specialist',
          campus: cleanCampus,
          dorm_location: cleanHostel,
          avatar: '/images/barber_service.jpg',
          is_verified: false,
          badge: 'Campus Stylist (Pending Verification)',
          travels_to_dorm: true,
          travel_fee: 20,
          has_studio: true,
          phone: cleanPhone,
          bio: `Campus stylist at ${cleanCampus}`,
          payout_provider: 'Airtel Money',
          payout_number: cleanPhone
        }]).catch(() => {});
      }

      setUser({
        isLoggedIn: true,
        id: newUserId,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        campus: cleanCampus,
        hostel: cleanHostel,
        role: assignedRole,
        loyaltyPoints: 50,
        referralCode: `${cleanCampus.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        favorites: []
      });

      if (isStylist) {
        setUserMode('vendor');
      }

      if (data.session) {
        setSession(data.session);
      }
    }

    addToast(`Account created successfully! Welcome, ${cleanName}! 🎓`, 'success');
    return { success: true, data };
  }, [currentCampus, addToast]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setSession(null);
    setIsAdmin(false);
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
    setIsAdmin(false);
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
      await supabase.from('profiles').update({
        name: profileUpdates.name,
        phone: profileUpdates.phone,
        hostel: profileUpdates.hostel,
        campus: profileUpdates.campus
      }).eq('id', user.id).catch(() => {});
    }
    addToast('Student profile updated successfully!', 'success');
  }, [user.id, addToast]);

  const onboardAsStylist = useCallback(async (stylistData) => {
    setUser((prev) => ({ ...prev, role: 'vendor' }));
    const newVendor = {
      id: user.id || `stf-${Date.now().toString(36)}`,
      name: stylistData.name || user.name,
      role: stylistData.specialty || 'Barbering',
      campus: stylistData.campus || currentCampus,
      dormLocation: stylistData.hostel || user.hostel || 'Hostel Studio',
      avatar: '/images/barber_service.jpg',
      isVerified: true,
      badge: 'Verified Campus Stylist',
      travelsToDorm: true,
      travelFee: 20,
      hasStudio: true,
      phone: stylistData.phone || user.phone,
      bio: stylistData.bio || `Verified campus stylist at ${currentCampus}.`,
      payoutProvider: 'Airtel Money',
      payoutNumber: stylistData.phone || user.phone
    };

    setVendorProfile(newVendor);
    setUserMode('vendor');

    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update({ role: 'vendor' }).eq('id', user.id).catch(() => {});
      await supabase.from('vendor_profiles').upsert([{
        id: newVendor.id,
        name: newVendor.name,
        role: newVendor.role,
        campus: newVendor.campus,
        dorm_location: newVendor.dormLocation,
        avatar: newVendor.avatar,
        is_verified: true,
        badge: newVendor.badge,
        travels_to_dorm: true,
        travel_fee: 20,
        has_studio: true,
        phone: newVendor.phone,
        bio: newVendor.bio,
        payout_provider: newVendor.payoutProvider,
        payout_number: newVendor.payoutNumber
      }]).catch(() => {});
    }

    addToast('Welcome to Vendor Studio! Your stylist workspace is ready.', 'success');
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
      await supabase
        .from('vendor_profiles')
        .update({
          is_verified: isVerified,
          badge: isVerified ? 'Verified Campus Stylist' : 'Campus Stylist'
        })
        .eq('id', stylistId)
        .catch(() => {});
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
      await supabase
        .from('vendor_payouts')
        .update({ status: 'Completed', reference: txRef })
        .eq('id', payoutId)
        .catch(() => {});
    }

    addToast(`Payout ${payoutId} settled successfully! Ref: ${txRef}`, 'success');
  }, [addToast]);

  const toggleAdminMode = useCallback(() => {
    setIsAdmin((prev) => {
      const next = !prev;
      if (next) {
        setActiveTab('admin');
        addToast('Master Admin mode enabled', 'info');
      } else {
        setActiveTab('home');
        addToast('Switched to customer view', 'info');
      }
      return next;
    });
  }, [setActiveTab, addToast]);

  // Context value memoization
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    userMode,
    setUserMode,
    toggleUserMode,
    vendorTab,
    setVendorTab,
    vendorProfile,
    updateVendorProfile,
    toggleVendorDormTravel,
    vendorWallet,
    requestVendorPayout,
    acceptBooking,
    completeBooking,
    addVendorPortfolioItem,
    activeTab,
    setActiveTab,
    currentCampus,
    setCurrentCampus,
    lusakaUniversities,
    isAdmin,
    setIsAdmin,
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
    activeChatStylistId,
    setActiveChatStylistId,
    sendMessage,
    createBooking,
    cancelBooking,
    rescheduleBooking,
    updateVendorSchedule,
    exportToCalendar,
    createOrder,
    addService,
    updateService,
    addProduct,
    updateOrderStatus,
    updateBookingStatus,
    verifyStylist,
    settleVendorPayout,
    toggleAdminMode,
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
    theme, toggleTheme, userMode, toggleUserMode, vendorTab,
    vendorProfile, updateVendorProfile, toggleVendorDormTravel, vendorWallet,
    requestVendorPayout, acceptBooking, completeBooking, addVendorPortfolioItem,
    activeTab, currentCampus, isAdmin, session, authLoading, isGuestMode, continueAsGuest, exitGuestMode, user,
    signIn, signUp, signOut, terminateAllSessions, requireAuth, pendingAuthCallback, updateUserProfile, onboardAsStylist,
    verifyStylist, settleVendorPayout, toggleAdminMode,
    services, products, bundles, staffList, bookings, orders, cart,
    showAuthModal, isCartOpen, bookingService, selectedProduct, selectedStylist,
    showSafetyModal, lencoCheckoutState, conversations, activeChatStylistId,
    filterCategory, serviceTypeFilter, priceFilter, ratingFilter, availabilityFilter,
    toasts,
    addToCart, addBundleToCart, updateCartQuantity, removeFromCart, clearCart,
    toggleFavorite, sendMessage, createBooking, cancelBooking, rescheduleBooking,
    updateVendorSchedule, exportToCalendar, createOrder, addService, updateService, addProduct,
    updateProductStock, updateOrderStatus, updateBookingStatus,
    addToast, dismissToast
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
