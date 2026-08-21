import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialServices, initialProducts, initialStaff, initialBookings, initialOrders } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState('home');

  // Role state (Student vs Admin)
  const [isAdmin, setIsAdmin] = useState(false);

  // User auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('unihair_user');
    return saved ? JSON.parse(saved) : {
      isLoggedIn: true,
      name: 'Kondwani Phiri',
      phone: '0971234567',
      hostel: 'October Hall, Room 14',
      loyaltyPoints: 120, // K10 = 1 pt -> 120 pts = K12 value
      referralCode: 'UNZA-KONDWANI-88',
      favorites: ['srv-1', 'prd-1']
    };
  });

  // Services State (Persisted)
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('unihair_services');
    return saved ? JSON.parse(saved) : initialServices;
  });

  // Products State (Persisted)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('unihair_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  // Bookings State (Persisted)
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('unihair_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  // Orders State (Persisted)
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('unihair_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  // Cart State (Persisted)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('unihair_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals state
  const [bookingService, setBookingService] = useState(null); // Service selected for booking
  const [selectedProduct, setSelectedProduct] = useState(null); // Product detail modal
  const [lencoCheckoutState, setLencoCheckoutState] = useState(null); // Lenco checkout wizard state

  // Toast System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('unihair_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('unihair_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('unihair_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('unihair_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('unihair_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('unihair_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart Management
  const addToCart = (product, quantity = 1) => {
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
  };

  const updateCartQuantity = (productId, delta) => {
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
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => setCart([]);

  // Wishlist / Favorites Toggle
  const toggleFavorite = (id) => {
    setUser((prev) => {
      const exists = prev.favorites.includes(id);
      const updated = exists
        ? prev.favorites.filter((favId) => favId !== id)
        : [...prev.favorites, id];
      addToast(exists ? 'Removed from favorites' : 'Saved to favorites!', 'success');
      return { ...prev, favorites: updated };
    });
  };

  // Booking logic
  const createBooking = (newBookingData) => {
    const bookingId = `UHS-B${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: bookingId,
      ...newBookingData,
      customerName: user.name,
      customerPhone: user.phone,
      paymentStatus: newBookingData.paymentMethod === 'Pay on Arrival' ? 'Pending' : 'Paid',
      status: 'Confirmed',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Award loyalty points (1 point per K10)
    const pointsEarned = Math.floor(newBookingData.price / 10);
    setUser((prev) => ({ ...prev, loyaltyPoints: prev.loyaltyPoints + pointsEarned }));

    addToast(`Booking ${bookingId} confirmed! +${pointsEarned} loyalty points earned.`, 'success');
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
    addToast(`Booking ${bookingId} has been cancelled.`, 'info');
  };

  const rescheduleBooking = (bookingId, newDate, newTime) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, date: newDate, time: newTime } : b))
    );
    addToast(`Booking ${bookingId} rescheduled to ${newDate} at ${newTime}`, 'success');
  };

  // E-Commerce Order Logic
  const createOrder = (orderData) => {
    const orderId = `UHS-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      items: cart,
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

    // Reduce stock counts in products state
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cart.find((item) => item.id === p.id);
        if (cartItem) {
          const newStock = Math.max(0, p.stock - cartItem.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    // Award points
    const pointsEarned = Math.floor(orderData.totalAmount / 10);
    setUser((prev) => ({ ...prev, loyaltyPoints: prev.loyaltyPoints + pointsEarned }));

    clearCart();
    addToast(`Order ${orderId} placed successfully! Track status in Account.`, 'success');
    return newOrder;
  };

  // Admin Actions
  const addService = (serviceData) => {
    const newId = `srv-${Date.now()}`;
    const newSrv = { id: newId, ...serviceData, image: serviceData.image || '/images/barber_service.jpg' };
    setServices((prev) => [...prev, newSrv]);
    addToast(`New service "${serviceData.name}" created!`, 'success');
  };

  const updateService = (id, updatedData) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
    addToast('Service updated', 'success');
  };

  const addProduct = (productData) => {
    const newId = `prd-${Date.now()}`;
    const newPrd = { id: newId, ...productData, image: productData.image || '/images/hair_product.jpg', rating: 5.0, reviewsCount: 1 };
    setProducts((prev) => [...prev, newPrd]);
    addToast(`New product "${productData.name}" added to shop!`, 'success');
  };

  const updateProductStock = (productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Number(newStock) } : p))
    );
    addToast('Stock level updated', 'info');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    addToast(`Order ${orderId} updated to "${newStatus}"`, 'success');
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    addToast(`Booking ${bookingId} marked as "${newStatus}"`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
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
        staffList: initialStaff
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
