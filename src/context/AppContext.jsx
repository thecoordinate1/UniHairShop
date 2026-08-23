import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { initialServices, initialProducts, initialStaff, initialBookings, initialOrders, lusakaUniversities } from '../data/mockData';

const AppContext = createContext();

// Safe localStorage helpers — handles quota exceeded, private browsing, SSR
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
  // Navigation tab state
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
    hostel: 'UNILUS Silverest Hostel, Block C',
    loyaltyPoints: 120,
    referralCode: 'UNILUS-KONDWANI-88',
    favorites: ['srv-1', 'prd-1']
  }));

  // Services State (Persisted)
  const [services, setServices] = useState(() => safeGetItem('unihair_services', initialServices));

  // Products State (Persisted)
  const [products, setProducts] = useState(() => safeGetItem('unihair_products', initialProducts));

  // Bookings State (Persisted)
  const [bookings, setBookings] = useState(() => safeGetItem('unihair_bookings', initialBookings));

  // Orders State (Persisted)
  const [orders, setOrders] = useState(() => safeGetItem('unihair_orders', initialOrders));

  // Cart State (Persisted)
  const [cart, setCart] = useState(() => safeGetItem('unihair_cart', []));

  // Modals state
  const [bookingService, setBookingService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lencoCheckoutState, setLencoCheckoutState] = useState(null);

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

  // Debounced localStorage persistence
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
    // Toast outside setter to avoid stale closure
    setUser((prev) => {
      const justToggled = prev.favorites.includes(id);
      addToast(justToggled ? 'Saved to favorites!' : 'Removed from favorites', 'success');
      return prev;
    });
  }, [addToast]);

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

    const pointsEarned = Math.floor(newBookingData.price / 10);
    setUser((prev) => ({ ...prev, loyaltyPoints: prev.loyaltyPoints + pointsEarned }));

    addToast(`Booking ${bookingId} confirmed at ${currentCampus}! +${pointsEarned} points`, 'success');
    return newBooking;
  }, [currentCampus, user.name, user.phone, addToast]);

  const cancelBooking = useCallback((bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
    addToast(`Booking ${bookingId} has been cancelled.`, 'info');
  }, [addToast]);

  const rescheduleBooking = useCallback((bookingId, newDate, newTime) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, date: newDate, time: newTime } : b))
    );
    addToast(`Booking ${bookingId} rescheduled to ${newDate} at ${newTime}`, 'success');
  }, [addToast]);

  const createOrder = useCallback((orderData) => {
    const orderId = generateId('UHS-ORD');
    const currentCart = cart; // capture current cart
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

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
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
    bookings,
    orders,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    toggleFavorite,
    bookingService,
    setBookingService,
    selectedProduct,
    setSelectedProduct,
    lencoCheckoutState,
    setLencoCheckoutState,
    createBooking,
    cancelBooking,
    rescheduleBooking,
    createOrder,
    addService,
    updateService,
    addProduct,
    updateProductStock,
    updateOrderStatus,
    updateBookingStatus,
    toasts,
    addToast,
    dismissToast,
    staffList: initialStaff
  }), [
    activeTab, currentCampus, isAdmin, user, services, products,
    bookings, orders, cart, bookingService, selectedProduct,
    lencoCheckoutState, toasts,
    addToCart, updateCartQuantity, removeFromCart, clearCart,
    toggleFavorite, createBooking, cancelBooking, rescheduleBooking,
    createOrder, addService, updateService, addProduct,
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
