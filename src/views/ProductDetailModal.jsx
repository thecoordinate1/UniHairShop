import React, { useState } from 'react';
import { X, Star, ShoppingBag, Truck, ShieldCheck, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductDetailModal() {
  const { selectedProduct, setSelectedProduct, addToCart, setActiveTab } = useApp();
  const [qty, setQty] = useState(1);

  if (!selectedProduct) return null;

  const handleAddToCart = () => {
    addToCart(selectedProduct, qty);
    setSelectedProduct(null);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, qty);
    setSelectedProduct(null);
    setActiveTab('cart');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '500px' }}>
        <button className="modal-close" onClick={() => setSelectedProduct(null)}>
          <X size={18} />
        </button>

        <div style={{ height: '220px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '16px' }}>
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <span className="badge badge-in-stock" style={{ marginBottom: '8px' }}>
          {selectedProduct.category}
        </span>

        <h2 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '8px' }}>{selectedProduct.name}</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <span className="price-tag" style={{ fontSize: '1.3rem' }}>K {selectedProduct.price}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFB800', fontSize: '0.85rem' }}>
            <Star size={16} fill="#FFB800" />
            <span style={{ fontWeight: 700 }}>{selectedProduct.rating}</span>
            <span style={{ color: 'var(--text-muted)' }}>({selectedProduct.reviewsCount} reviews)</span>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {selectedProduct.description}
        </p>

        {/* Delivery perk info */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '20px', fontSize: '0.82rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Truck size={20} style={{ color: 'var(--primary)' }} />
          <div>
            <p style={{ color: '#fff', fontWeight: 600, margin: 0 }}>Campus Hostel Delivery Available</p>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Delivered to your room or available for salon pickup!</p>
          </div>
        </div>

        {/* Quantity selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quantity:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15, 23, 42, 0.8)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              style={{ background: 'none', color: '#fff', display: 'flex' }}
            >
              <Minus size={16} />
            </button>
            <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              style={{ background: 'none', color: '#fff', display: 'flex' }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleAddToCart}>
            Add to Cart
          </button>
          <button className="btn-primary" onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
