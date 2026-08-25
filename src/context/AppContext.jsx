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

export const AppProvider = ({ children }) => {
  // Theme Mode ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('unihair_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Dual Architecture: User Mode ('customer' | 'vendor')
  const [userMode, setUserMode] = useState(() => {
    try {
      return localStorage.getItem('unihair_user_mode') || 'customer';
    } catch {
      return 'customer';
    }
  });

  // Vendor Studio active sub-tab
  const [vendorTab, setVendorTab] = useState('overview');

  // Sync theme to document.documentElement
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

  // Sync userMode
  useEffect(() => {
    try {
      localStorage.setItem('unihair_user_mode', userMode);
    } catch { /* ignore */ }
  }, [userMode]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleUserMode = useCallback(() => {
    setUserMode((prev) => (prev === 'customer' ? 'vendor' : 'customer'));
  }, []);

  // Navigation tab state ('home' | 'services' | 'bookings' | 'shop' | 'messages' | 'account' | 'admin' | 'about' | 'vendor')
  const [activeTab, setActiveTab] = useState('home');

  // Active Campus Selection (Default: UNILUS Silverest Campus)
  const [currentCampus, setCurrentCampus] = useState(() => {
    try {
      return localStorage.getItem('unihair_campus') || 'UNILUS Silverest Campus';
    } catch {
      return 'UNILUS Silverest Campus';
    }
  });

  // Role state (Student Admin vs Regular)
  const [isAdmin, setIsAdmin] = useState(false);

  // Supabase Authentication & Role State
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pendingAuthCallback, setPendingAuthCallback] = useState(null);

  // Customer Student profile
  const [user, setUser] = useState(() => safeGetItem('unihair_user', {
    isLoggedIn: true,
    id: 'usr-kondwani',
    name: 'Kondwani Phiri',
    email: 'kondwani@unilus.ac.zm',
    phone: '0971234567',
    campus: 'UNILUS Silverest Campus',
    hostel: 'UNILUS Silverest Hostel, Block C, Room 14',
    role: 'customer',
    loyaltyPoints: 140,
    referralCode: 'UNILUS-KONDWANI-88',
    favorites: ['srv-1', 'prd-1', 'stf-1']
  }));

  // Vendor Student profile (Stylist / Barber / Creator)
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

  // Vendor Wallet & Payout State
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

  // Services, Products, Staff, Bookings, Orders
  const [services, setServices] = useState(() => safeGetItem('unihair_services', initialServices));
  const [products, setProducts] = useState(() => safeGetItem('unihair_products', initialProducts));
  const [bundles] = useState(initialBundles);
  const [staffList, setStaffList] = useState(() => safeGetItem('unihair_staff', initialStaff));
  const [bookings, setBookings] = useState(() => safeGetItem('unihair_bookings', initialBookings));
  const [orders, setOrders] = useState(() => safeGetItem('unihair_orders', initialOrders));
  const [cart, setCart] = useState(() => safeGetItem('unihair_cart', []));

  // In-App Chat Conversations
  const [conversations, setConversations] = useState(() => safeGetItem('unihair_conversations', initialConversations));
  const [activeChatStylistId, setActiveChatStylistId] = useState('stf-1');

  // Modals & Drawers
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [bookingService, setBookingService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [lencoCheckoutState, setLencoCheckoutState] = useState(null);

  // Granular Filter Engine States
  const [filterCategory, setFilterCategory] = useState('All');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  // Toast System
  const [toasts, setToasts] = useState([]);

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
        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUser({
                id: profile.id,
                isLoggedIn: true,
                name: profile.name || currentSession.user.email?.split('@')[0],
                email: currentSession.user.email,
                phone: profile.phone || '',
                campus: profile.campus || currentCampus,
                hostel: profile.hostel || '',
                role: profile.role || 'customer',
                loyaltyPoints: profile.loyalty_points || 50,
                referralCode: profile.referral_code || '',
                favorites: []
              });
              if (profile.role === 'vendor') {
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (profile) {
          setUser((prev) => ({
            ...prev,
            id: profile.id,
            isLoggedIn: true,
            name: profile.name || prev.name,
            email: currentSession.user.email,
            phone: profile.phone || prev.phone,
            campus: profile.campus || prev.campus,
            hostel: profile.hostel || prev.hostel,
            role: profile.role || prev.role,
            loyaltyPoints: profile.loyalty_points || prev.loyaltyPoints,
            referralCode: profile.referral_code || prev.referralCode
          }));
          if (profile.role === 'vendor') {
            setUserMode('vendor');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
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
      } catch (err) {
        console.info('[UniHairShop] Supabase live fetch notice:', err.message);
      }
    };

    fetchSupabaseData();

    // 2. Realtime listener on Bookings
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

    return () => {
      supabase.removeChannel(bookingChannel);
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
      price: bundle.bundlePrice,
      image: bundle.image,
      stock: 10,
      quantity: 1
    };
    addToCart(bundleProduct, 1);
    setIsCartOpen(true);
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

  // Messaging Management
  const sendMessage = useCallback((stylistId, text) => {
    if (!text.trim()) return;
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations((prev) => {
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
    });

    // Sync message to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('messages').insert([{
        id: newMsg.id,
        conversation_id: `conv-${stylistId}`,
        sender: 'user',
        text: text.trim(),
        time: newMsg.time
      }]).catch(() => {});
    }

    setTimeout(() => {
      const replies = [
        "Got it! I have your slot booked and will be ready.",
        "Perfect! Looking forward to your appointment.",
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
    }, 2000);
  }, []);

  // Smart Booking Creation
  const createBooking = useCallback(async (newBookingData) => {
    const bookingId = generateId('UHS-B');
    const newBooking = {
      id: bookingId,
      ...newBookingData,
      campus: currentCampus,
      customerName: user.name,
      customerPhone: user.phone,
      paymentStatus: newBookingData.paymentMethod === 'Pay on Arrival' ? 'Pending' : 'Paid',
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
          total_price: newBookingData.totalPrice || 110,
          payment_method: newBookingData.paymentMethod || 'Cash / Mobile Money',
          payment_status: newBooking.paymentStatus,
          status: 'Confirmed'
        }]);
      } catch (err) {
        console.warn('[UniHairShop] Supabase booking insert fallback:', err.message);
      }
    }

    // Update vendor wallet pending/earned
    const bookingAmount = newBookingData.totalPrice || newBookingData.price || 0;
    setVendorWallet((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance + bookingAmount,
      totalEarned: prev.totalEarned + bookingAmount
    }));

    const pointsEarned = Math.floor(bookingAmount / 10);
    setUser((prev) => ({ ...prev, loyaltyPoints: prev.loyaltyPoints + pointsEarned }));

    addToast(`Booking ${bookingId} confirmed at ${currentCampus}! +${pointsEarned} points`, 'success');
    return newBooking;
  }, [currentCampus, user.name, user.phone, addToast]);

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
    if (!isSupabaseConfigured || !supabase) {
      setUser((prev) => ({ ...prev, isLoggedIn: true, ...userData }));
      addToast('Account registered successfully!', 'success');
      return { success: true };
    }
    const { data, error } = await supabase.auth.signUp({
      email: userData.email.trim(),
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
          campus: userData.campus,
          hostel: userData.hostel,
          role: userData.role || 'customer'
        }
      }
    });
    if (error) throw error;
    return { success: true, data };
  }, [addToast]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    setSession(null);
    setUser({
      isLoggedIn: false,
      id: null,
      name: 'Student Guest',
      email: '',
      phone: '',
      campus: currentCampus,
      hostel: '',
      role: 'customer',
      loyaltyPoints: 0,
      referralCode: '',
      favorites: []
    });
    setUserMode('customer');
    addToast('Signed out of UniHairShop', 'info');
  }, [currentCampus, addToast]);

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
    user,
    setUser,
    signIn,
    signUp,
    signOut,
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
    exportToCalendar,
    createOrder,
    addService,
    updateService,
    addProduct,
    updateProductStock,
    updateOrderStatus,
    updateBookingStatus,
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
    activeTab, currentCampus, isAdmin, session, authLoading, user,
    signIn, signUp, signOut, requireAuth, pendingAuthCallback, updateUserProfile, onboardAsStylist,
    services, products, bundles, staffList, bookings, orders, cart,
    showAuthModal, isCartOpen, bookingService, selectedProduct, selectedStylist,
    showSafetyModal, lencoCheckoutState, conversations, activeChatStylistId,
    filterCategory, serviceTypeFilter, priceFilter, ratingFilter, availabilityFilter,
    toasts,
    addToCart, addBundleToCart, updateCartQuantity, removeFromCart, clearCart,
    toggleFavorite, sendMessage, createBooking, cancelBooking, rescheduleBooking,
    exportToCalendar, createOrder, addService, updateService, addProduct,
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
