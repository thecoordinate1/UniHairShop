import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck, Tag, Sparkles, CheckCircle2, Info, Eye, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LencoCheckoutWizard from './LencoCheckoutWizard';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    createOrder,
    bundles,
    addBundleToCart,
    user,
    products,
    setSelectedProduct,
    addToast
  } = useApp();

  const [deliveryType, setDeliveryType] = useState('Hostel Delivery');
  const [hostelDetails, setHostelDetails] = useState(user.hostel || 'UNILUS Silverest Hostel, Block C, Room 14');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showLencoModal, setShowLencoModal] = useState(false);

  const FREE_DELIVERY_THRESHOLD = 200; // ZMW

  // Lock body scroll when cart drawer is open
  useEffect(() => {
    if (!isCartOpen) return;
    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = deliveryType === 'Hostel Delivery' ? (isFreeDelivery ? 0 : 15) : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  const handleReviewProduct = (cartItem) => {
    const fullProduct = (products && products.find((p) => p.id === cartItem.id)) || cartItem;
    setSelectedProduct(fullProduct);
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'STUDENT15' || promoCode.trim().toUpperCase() === 'UNZA15') {
      setDiscountPercent(15);
      addToast('Student promo applied! 15% discount.', 'success');
    } else {
      addToast('Invalid code. Try "STUDENT15" for 15% off!', 'error');
    }
  };

  const handleLencoSuccess = async (lencoResult) => {
    setShowLencoModal(false);
    try {
      await createOrder({
        totalAmount,
        deliveryType,
        hostelDetails,
        paymentMethod: lencoResult.paymentMethod,
        lencoRef: lencoResult.lencoReference
      });
    } catch {
      // createOrder already shows a toast explaining what went wrong
    }
  };

  return (
    <>
      <div
        className="drawer-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) setIsCartOpen(false); }}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-amber-400/15 p-2 rounded-xl text-amber-500">
                  <ShoppingBag size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight m-0">
                  Cart ({cart.reduce((acc, i) => acc + i.quantity, 0)})
                </h3>
              </div>

              <button
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent border-0 cursor-pointer"
                onClick={() => setIsCartOpen(false)}
                title="Close drawer (Esc)"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Hostel Delivery Progress Bar */}
            <div className="bg-black/[0.03] dark:bg-white/[0.04] p-3 rounded-2xl border border-black/5 dark:border-white/10 mb-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <Truck size={14} className="text-amber-500" />
                  <span>
                    {isFreeDelivery ? '🎉 FREE Campus Hostel Delivery unlocked!' : `Add K${amountNeededForFreeDelivery} more for FREE hostel delivery`}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-500">{progressPercent}%</span>
              </div>

              <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cart Items or Empty State */}
          <div className="flex-1 overflow-y-auto pr-1 my-2 flex flex-col gap-3">
            {cart.length === 0 ? (
              <div className="empty-state py-8">
                <div className="empty-state-icon bg-amber-400/15">
                  <ShoppingBag size={28} className="text-amber-500" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">Your cart is empty</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Add hair growth oils, silk bonnets, edge controls, or styling kits to your bag!
                </p>

                {/* Quick Bundle Add in Empty State */}
                <div className="mt-2 text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Campus Favorites:</span>
                  {bundles.slice(0, 1).map((b) => (
                    <div key={b.id} className="p-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="badge badge-low-stock text-[9px] py-0.2 px-1.5 mb-1">{b.savings}</span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white m-0 truncate">{b.title}</h5>
                        <span className="price-tag text-xs">K {b.bundlePrice}</span>
                      </div>
                      <button
                        className="apple-btn-primary text-xs px-3 py-1.5 shrink-0"
                        onClick={() => addBundleToCart(b)}
                      >
                        Add Bundle
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] flex flex-col gap-2 transition-all hover:border-amber-400/40 group"
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail with quick view trigger */}
                    <div
                      className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10 cursor-pointer group-hover:opacity-90"
                      onClick={() => handleReviewProduct(item)}
                      title="Click to review full product details"
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Eye size={16} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="badge badge-in-stock text-[8px] py-0.1 px-1">
                          {item.category || 'Product'}
                        </span>
                      </div>

                      <h4
                        onClick={() => handleReviewProduct(item)}
                        className="text-xs font-bold text-slate-900 dark:text-white truncate m-0 cursor-pointer hover:text-amber-500 transition-colors"
                        title={`Click to review ${item.name}`}
                      >
                        {item.name}
                      </h4>

                      <div className="flex items-center gap-2 my-0.5">
                        <span className="price-tag text-xs">K {item.price}</span>
                        <span className="text-[10px] text-slate-400">
                          Total: <strong className="text-slate-700 dark:text-slate-300">K {item.price * item.quantity}</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => handleReviewProduct(item)}
                        className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer mt-0.5"
                      >
                        <Info size={11} />
                        <span>Review Product Details</span>
                      </button>
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-500 bg-transparent border-0 p-0 cursor-pointer transition-colors"
                        aria-label={`Remove ${item.name}`}
                        title="Remove from cart"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-lg border border-black/5 dark:border-white/10">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white bg-transparent border-0 p-0 cursor-pointer"
                          aria-label="Decrease"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-bold min-w-[14px] text-center text-slate-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white bg-transparent border-0 p-0 cursor-pointer"
                          aria-label="Increase"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="pt-3 border-t border-black/10 dark:border-white/10 flex flex-col gap-3">
              {/* Delivery Choice */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  className={`p-2 rounded-xl border font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    deliveryType === 'Hostel Delivery'
                      ? 'border-amber-400 bg-amber-400/15 text-amber-500 dark:text-amber-300 font-bold'
                      : 'border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-slate-400'
                  }`}
                  onClick={() => setDeliveryType('Hostel Delivery')}
                >
                  <Truck size={13} />
                  <span>Hostel Delivery ({isFreeDelivery ? 'Free' : 'K15'})</span>
                </button>

                <button
                  className={`p-2 rounded-xl border font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    deliveryType === 'Salon Pickup'
                      ? 'border-emerald-400 bg-emerald-400/15 text-emerald-600 dark:text-emerald-300 font-bold'
                      : 'border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-slate-400'
                  }`}
                  onClick={() => setDeliveryType('Salon Pickup')}
                >
                  <span>Salon Pickup (Free)</span>
                </button>
              </div>

              {/* Promo code input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  className="form-input py-1.5 text-xs flex-1 uppercase"
                  placeholder="Promo Code (STUDENT15)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button
                  className="apple-btn-secondary text-xs px-3 py-1.5"
                  onClick={handleApplyPromo}
                >
                  Apply
                </button>
              </div>

              {/* Summary line */}
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">K {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hostel Delivery:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{isFreeDelivery || deliveryType === 'Salon Pickup' ? 'FREE' : `K ${deliveryFee}`}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-500 font-bold">
                    <span>Student Discount (15%):</span>
                    <span>-K {discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-1 border-t border-black/5 dark:border-white/5">
                  <span>Total Amount:</span>
                  <span className="price-tag text-lg">K {totalAmount}</span>
                </div>
              </div>

              <button
                className="apple-btn-primary w-full text-xs py-3"
                onClick={() => setShowLencoModal(true)}
              >
                <span>Checkout (K {totalAmount})</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {showLencoModal && (
        <LencoCheckoutWizard
          amount={totalAmount}
          title={`Campus Order (${cart.length} items)`}
          onSuccess={handleLencoSuccess}
          onClose={() => setShowLencoModal(false)}
          allowPayOnArrival={true}
        />
      )}
    </>
  );
}
