import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Navigation tab state ('home' | 'services' | 'bookings' | 'shop' | 'messages' | 'account' | 'admin' | 'about')
  const [activeTab, setActiveTab] = useState('home');

  // Active Campus Selection (Default: UNILUS Silverest Campus)
  const [currentCampus, setCurrentCampus] = useState(() => {
    try {
      return localStorage.getItem('unihair_campus') || 'UNILUS Silverest Campus';
    } catch {
      return 'UNILUS Silverest Campus';
    }
  });

  // Role state (Student vs Admin)
  const [isAdmin, setIsAdmin] = useState(false);

  // User auth state
  const [user, setUser] = useState(() => safeGetItem('unihair_user', {
    isLoggedIn: true,
    name: 'Kondwani Phiri',
    phone: '0971234567',
    hostel: 'UNILUS Silverest Hostel, Block C, Room 14',
    loyaltyPoints: 140,
    referralCode: 'UNILUS-KONDWANI-88',
    favorites: ['srv-1', 'prd-1', 'stf-1']
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [bookingService, setBookingService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [lencoCheckoutState, setLencoCheckoutState] = useState(null);

  // Granular Filter Engine States
  const [filterCategory, setFilterCategory] = useState('All');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All'); // 'All' | 'travel' | 'studio'
  const [priceFilter, setPriceFilter] = useState('All'); // 'All' | 'under100' | '100to200' | 'over200'
  const [ratingFilter, setRatingFilter] = useState('All'); // 'All' | '4.8+'
  const [availabilityFilter, setAvailabilityFilter] = useState('All'); // 'All' | 'today' | 'weekend'

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

    // Simulate stylist automated reply after 2 seconds
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
    }, 2000);
  }, []);

  // Smart Booking Creation
  const createBooking = useCallback((newBookingData) => {
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

    const pointsEarned = Math.floor((newBookingData.totalPrice || newBookingData.price) / 10);
    setUser((prev) => ({ ...prev, loyaltyPoints: prev.loyaltyPoints + pointsEarned }));

    addToast(`Booking ${bookingId} confirmed at ${currentCampus}! +${pointsEarned} loyalty points`, 'success');
    return newBooking;
  }, [currentCampus, user.name, user.phone, addToast]);

  const cancelBooking = useCallback((bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
    addToast(`Booking ${bookingId} has been cancelled per the 12hr policy.`, 'info');
  }, [addToast]);

  const rescheduleBooking = useCallback((bookingId, newDate, newTime) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, date: newDate, time: newTime } : b))
    );
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
  const createOrder = useCallback((orderData) => {
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

  const addService = useCallback((serviceData) => {
    const newId = generateId('srv');
    const newSrv = { id: newId, ...serviceData, image: serviceData.image || '/images/barber_service.jpg' };
    setServices((prev) => [...prev, newSrv]);
    addToast(`New service "${serviceData.name}" created!`, 'success');
  }, [addToast]);

  const updateService = useCallback((id, updatedData) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
    addToast('Service updated', 'success');
  }, [addToast]);

  const addProduct = useCallback((productData) => {
    const newId = generateId('prd');
    const newPrd = { id: newId, ...productData, image: productData.image || '/images/hair_product.jpg', rating: 5.0, reviewsCount: 1 };
    setProducts((prev) => [...prev, newPrd]);
    addToast(`New product "${productData.name}" added to shop!`, 'success');
  }, [addToast]);

  const updateProductStock = useCallback((productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Number(newStock) } : p))
    );
    addToast('Stock level updated', 'info');
  }, [addToast]);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    addToast(`Order ${orderId} updated to "${newStatus}"`, 'success');
  }, [addToast]);

  const updateBookingStatus = useCallback((bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    addToast(`Booking ${bookingId} marked as "${newStatus}"`, 'success');
  }, [addToast]);

  // Context value memoization
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    currentCampus,
    setCurrentCampus,
    lusakaUniversities,
    isAdmin,
    setIsAdmin,
    user,
    setUser,
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
    theme, toggleTheme, activeTab, currentCampus, isAdmin, user,
    services, products, bundles, staffList, bookings, orders, cart,
    isCartOpen, bookingService, selectedProduct, selectedStylist,
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
