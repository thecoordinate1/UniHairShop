import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Truck, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductDetailModal() {
  const { selectedProduct, setSelectedProduct, addToCart, setActiveTab } = useApp();
  const [qty, setQty] = useState(1);

  // Lock body scroll and handle Escape key to close modal
  useEffect(() => {
    if (!selectedProduct) return;

    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProduct, setSelectedProduct]);

  if (!selectedProduct) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedProduct(null);
    }
  };

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
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Product details for ${selectedProduct.name}`}
    >
      <div className="modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* iOS Sheet Drag Handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" aria-hidden="true"></div>

        {/* Prominent Close X Button */}
        <button
          className="modal-close"
          onClick={() => setSelectedProduct(null)}
          title="Close Quick View (Esc)"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="h-52 w-full rounded-2xl overflow-hidden mb-4 border border-white/10">
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <span className="badge badge-in-stock mb-2">
          {selectedProduct.category}
        </span>

        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">{selectedProduct.name}</h2>

        <div className="flex items-center gap-4 mb-3">
          <span className="price-tag text-xl">K {selectedProduct.price}</span>
          <div className="flex items-center gap-1 text-amber-400 text-sm">
            <Star size={16} fill="#F5A623" aria-hidden="true" />
            <span className="font-bold">{selectedProduct.rating}</span>
            <span className="text-slate-400">({selectedProduct.reviewsCount} reviews)</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
          {selectedProduct.description}
        </p>

        {/* Delivery perk info */}
        <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10 mb-4 text-xs flex gap-2.5 items-center">
          <Truck size={20} className="text-amber-400 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-white font-semibold m-0">Campus Hostel Delivery Available</p>
            <p className="text-slate-400 m-0">Delivered directly to your hostel room or salon pickup!</p>
          </div>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-semibold text-slate-300">Quantity:</span>
          <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="text-white hover:text-amber-400 bg-transparent border-0 cursor-pointer p-1"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-sm min-w-5 text-center">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="text-white hover:text-amber-400 bg-transparent border-0 cursor-pointer p-1"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <button
            className="apple-btn-secondary text-xs"
            onClick={handleAddToCart}
            disabled={selectedProduct.stock <= 0}
          >
            Add to Cart
          </button>
          <button
            className="apple-btn-primary text-xs"
            onClick={handleBuyNow}
            disabled={selectedProduct.stock <= 0}
          >
            Buy Now
          </button>
        </div>

        {/* Prominent Footer Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="w-full text-center text-xs text-slate-400 hover:text-white py-2 flex items-center justify-center gap-1 bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Close & Continue Browsing</span>
        </button>
      </div>
    </div>
  );
}
