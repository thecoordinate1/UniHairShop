import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingBag, Truck, Plus, Minus, ArrowLeft, Check, ShieldCheck, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductDetailModal() {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    updateCartQuantity,
    cart,
    setActiveTab,
    setIsCartOpen,
    addToast
  } = useApp();

  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const cartItem = selectedProduct ? cart.find((i) => i.id === selectedProduct.id) : null;
  const isInCart = Boolean(cartItem);

  // Lock body scroll and handle Escape key to close modal
  useEffect(() => {
    if (!selectedProduct) return;

    // If item is already in cart, set initial selector to its cart quantity
    const existing = cart.find((i) => i.id === selectedProduct.id);
    setQty(existing ? existing.quantity : 1);
    setActiveImageIndex(0);

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
  }, [selectedProduct, cart]);

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

  const handleUpdateCartQty = () => {
    if (cartItem) {
      const diff = qty - cartItem.quantity;
      if (diff !== 0) {
        updateCartQuantity(selectedProduct.id, diff);
        addToast(`Updated ${selectedProduct.name} quantity to ${qty}`, 'success');
      }
    } else {
      addToCart(selectedProduct, qty);
    }
    setSelectedProduct(null);
  };

  const handleViewCart = () => {
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
        <div className="w-12 h-1.5 bg-black/20 dark:bg-white/20 rounded-full mx-auto mb-4 sm:hidden" aria-hidden="true"></div>

        {/* Prominent Close X Button */}
        <button
          className="modal-close"
          onClick={() => setSelectedProduct(null)}
          title="Close Quick View (Esc)"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="relative h-56 w-full rounded-3xl overflow-hidden mb-2 border border-black/10 dark:border-white/10 shadow-sm bg-black/5 dark:bg-white/5">
          <img
            src={(selectedProduct.images?.length ? selectedProduct.images[activeImageIndex] : null) || selectedProduct.image}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {isInCart && (
            <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Check size={13} />
              <span>In Cart ({cartItem.quantity})</span>
            </div>
          )}
        </div>

        {selectedProduct.images?.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {selectedProduct.images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setActiveImageIndex(i)}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer p-0 ${
                  i === activeImageIndex ? 'border-amber-400' : 'border-black/10 dark:border-white/10'
                }`}
              >
                <img src={img} alt={`${selectedProduct.name} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className="badge badge-in-stock text-xs py-0.5 px-2">
            {selectedProduct.category}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'In Stock'}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
          {selectedProduct.name}
        </h2>

        <div className="flex items-center gap-4 mb-3 pb-3 border-b border-black/5 dark:border-white/5">
          <div>
            <span className="price-tag text-2xl">K {selectedProduct.price}</span>
            <span className="text-[11px] text-slate-400 block">Unit Price (ZMW)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-500 text-sm ml-auto bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
            {(selectedProduct.rating || 0) > 0 ? (
              <>
                <Star size={16} fill="#F5A623" aria-hidden="true" />
                <span className="font-bold">{Number(selectedProduct.rating).toFixed(1)}</span>
                <span className="text-slate-400 text-xs">({selectedProduct.reviewsCount || selectedProduct.reviews_count || 0} reviews)</span>
              </>
            ) : (
              <span className="text-slate-400 text-xs">No ratings yet</span>
            )}
          </div>
        </div>

        {/* Full Details & Description */}
        <div className="mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Description & Details</h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 m-0 leading-relaxed bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-2xl border border-black/5 dark:border-white/5">
            {selectedProduct.description}
          </p>
        </div>

        {/* Campus Delivery Perk Info */}
        <div className="bg-emerald-500/10 dark:bg-emerald-500/15 p-3 rounded-2xl border border-emerald-500/20 mb-4 text-xs flex gap-2.5 items-center">
          <Truck size={20} className="text-emerald-500 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-slate-900 dark:text-white font-bold m-0">Campus Hostel Room Delivery Available</p>
            <p className="text-slate-500 dark:text-slate-400 m-0">Delivered directly to your hostel room or free pickup at campus salon!</p>
          </div>
        </div>

        {/* Quantity selector & Subtotal calculation */}
        <div className="flex items-center justify-between mb-5 bg-black/[0.02] dark:bg-white/[0.04] p-3 rounded-2xl border border-black/5 dark:border-white/10">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Quantity</span>
            <span className="text-[11px] text-amber-500 font-semibold">
              Item Total: K {selectedProduct.price * qty}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 shadow-sm">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="text-slate-600 dark:text-slate-300 hover:text-amber-500 bg-transparent border-0 cursor-pointer p-1"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-sm min-w-5 text-center text-slate-900 dark:text-white">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="text-slate-600 dark:text-slate-300 hover:text-amber-500 bg-transparent border-0 cursor-pointer p-1"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {isInCart ? (
            <>
              <button
                className="apple-btn-secondary text-xs"
                onClick={handleUpdateCartQty}
              >
                Update Cart ({qty})
              </button>
              <button
                className="apple-btn-primary text-xs"
                onClick={handleViewCart}
              >
                View in Cart
              </button>
            </>
          ) : (
            <>
              <button
                className="apple-btn-secondary text-xs"
                onClick={handleAddToCart}
                disabled={selectedProduct.stock <= 0}
              >
                Add to Cart
              </button>
              <button
                className="apple-btn-primary text-xs"
                onClick={() => {
                  addToCart(selectedProduct, qty);
                  setSelectedProduct(null);
                  setActiveTab('cart');
                }}
                disabled={selectedProduct.stock <= 0}
              >
                Buy Now
              </button>
            </>
          )}
        </div>

        {/* Prominent Footer Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="w-full text-center text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white py-2 flex items-center justify-center gap-1 bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Back to Cart / Browsing</span>
        </button>
      </div>
    </div>
  );
}
