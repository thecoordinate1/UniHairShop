import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Truck, Store, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LencoCheckoutWizard from '../components/LencoCheckoutWizard';

export default function CartView() {
  const { cart, updateCartQuantity, removeFromCart, createOrder, setActiveTab, user } = useApp();

  const [deliveryType, setDeliveryType] = useState('Hostel Delivery'); // 'Hostel Delivery' or 'Salon Pickup'
  const [hostelDetails, setHostelDetails] = useState(user.hostel || 'October Hall, Room 14');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showLencoModal, setShowLencoModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = deliveryType === 'Hostel Delivery' ? 15 : 0; // K15 campus hostel delivery fee
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'STUDENT15' || promoCode.trim().toUpperCase() === 'UNZA15') {
      setDiscountPercent(15);
    } else {
      alert('Invalid promo code. Try "STUDENT15" for 15% student discount!');
    }
  };

  const handleLencoSuccess = (lencoResult) => {
    setShowLencoModal(false);
    const newOrder = createOrder({
      totalAmount,
      deliveryType,
      hostelDetails,
      paymentMethod: lencoResult.paymentMethod,
      lencoRef: lencoResult.lencoReference
    });
    setPlacedOrder(newOrder);
  };

  if (placedOrder) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(0, 200, 83, 0.2)', color: '#00E676', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={40} />
        </div>

        <h1 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '8px' }}>Order Placed Successfully!</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Order Reference: <strong style={{ color: 'var(--primary)' }}>{placedOrder.id}</strong>
        </p>

        <div style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.85rem', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Items Count:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{placedOrder.items.length} items</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Delivery Mode:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{placedOrder.deliveryType}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1rem' }}>K {placedOrder.totalAmount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment Channel:</span>
            <span style={{ color: '#00E676', fontWeight: 600 }}>{placedOrder.paymentMethod}</span>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%' }}
          onClick={() => {
            setPlacedOrder(null);
            setActiveTab('account');
          }}
        >
          Track Order Status in Account
        </button>
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px', maxWidth: '440px', margin: '0 auto' }}>
        <div style={{ background: 'rgba(255, 184, 0, 0.15)', color: 'var(--primary)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShoppingCart size={34} />
        </div>
        <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Explore our campus shop for hair oils, shampoo, clippers, and cosmetics!
        </p>
        <button className="btn-primary" onClick={() => setActiveTab('shop')}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '1.8rem', color: '#fff' }}>Shopping Cart ({cart.length})</h1>

      {/* Cart Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cart.map((item) => (
          <div key={item.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />

            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>{item.name}</h4>
              <span className="price-tag" style={{ fontSize: '0.9rem' }}>K {item.price}</span>
            </div>

            {/* Quantity controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <button onClick={() => updateCartQuantity(item.id, -1)} style={{ background: 'none', color: '#fff', display: 'flex' }}>
                <Minus size={14} />
              </button>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
              <button onClick={() => updateCartQuantity(item.id, 1)} style={{ background: 'none', color: '#fff', display: 'flex' }}>
                <Plus size={14} />
              </button>
            </div>

            <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', color: 'var(--text-muted)' }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Delivery Choice */}
      <div style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px' }}>Choose Delivery Option:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <button
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid',
              borderColor: deliveryType === 'Hostel Delivery' ? 'var(--primary)' : 'var(--border-color)',
              background: deliveryType === 'Hostel Delivery' ? 'rgba(255, 184, 0, 0.12)' : 'rgba(15, 23, 42, 0.6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => setDeliveryType('Hostel Delivery')}
          >
            <Truck size={18} style={{ color: 'var(--primary)' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>Hostel Delivery</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>K15 Campus Fee</p>
            </div>
          </button>

          <button
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid',
              borderColor: deliveryType === 'Salon Pickup' ? 'var(--primary)' : 'var(--border-color)',
              background: deliveryType === 'Salon Pickup' ? 'rgba(255, 184, 0, 0.12)' : 'rgba(15, 23, 42, 0.6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => setDeliveryType('Salon Pickup')}
          >
            <Store size={18} style={{ color: '#00E676' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>Salon Pickup</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Free at Campus Salon</p>
            </div>
          </button>
        </div>

        {deliveryType === 'Hostel Delivery' && (
          <div className="form-group">
            <label className="form-label">Hostel Name & Room Number:</label>
            <input
              type="text"
              className="form-input"
              value={hostelDetails}
              onChange={(e) => setHostelDetails(e.target.value)}
              placeholder="e.g. October Hall Room 14"
            />
          </div>
        )}
      </div>

      {/* Promo Code Input */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Promo code (e.g. STUDENT15)"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
        />
        <button className="btn-secondary" onClick={handleApplyPromo}>
          Apply
        </button>
      </div>

      {/* Summary */}
      <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
          <span style={{ color: '#fff' }}>K {subtotal}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Delivery Fee:</span>
          <span style={{ color: '#fff' }}>K {deliveryFee}</span>
        </div>
        {discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#00E676' }}>
            <span>Student Discount ({discountPercent}%):</span>
            <span>-K {discountAmount}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '1.1rem', fontWeight: 800 }}>
          <span>Total Amount:</span>
          <span className="price-tag" style={{ fontSize: '1.25rem' }}>K {totalAmount}</span>
        </div>

        <button
          className="btn-success"
          style={{ width: '100%', marginTop: '16px' }}
          onClick={() => setShowLencoModal(true)}
        >
          <span>Checkout via Lenco Pay (K {totalAmount})</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {showLencoModal && (
        <LencoCheckoutWizard
          amount={totalAmount}
          title={`Shop Order (${cart.length} items)`}
          onSuccess={handleLencoSuccess}
          onClose={() => setShowLencoModal(false)}
          allowPayOnArrival={true}
        />
      )}
    </div>
  );
}
