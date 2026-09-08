import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, Truck, Store, CheckCircle, Info, Eye, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PawaPayCheckoutWizard from '../components/PawaPayCheckoutWizard';

export default function CartView() {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    createOrder,
    setActiveTab,
    products,
    setSelectedProduct,
    user,
    addToast
  } = useApp();

  const [deliveryType, setDeliveryType] = useState('Hostel Delivery');
  const [hostelDetails, setHostelDetails] = useState(user?.hostel || '');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showPaymentWizard, setShowPaymentWizard] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = deliveryType === 'Hostel Delivery' ? 15 : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleReviewProduct = (cartItem) => {
    const fullProduct = (products && products.find((p) => p.id === cartItem.id)) || cartItem;
    setSelectedProduct(fullProduct);
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'STUDENT15' || promoCode.trim().toUpperCase() === 'UNZA15') {
      setDiscountPercent(15);
      addToast('Promo code applied! 15% student discount.', 'success');
    } else {
      addToast('Invalid promo code. Try "STUDENT15" for 15% student discount!', 'error');
    }
  };

  const handleCheckout = async () => {
    setPlacingOrder(true);
    try {
      const newOrder = await createOrder({
        totalAmount,
        deliveryType,
        hostelDetails,
        paymentMethod: 'Pending Mobile Money Payment'
      });
      setPendingOrder(newOrder);
      setShowPaymentWizard(true);
    } catch {
      // createOrder already shows a toast explaining what went wrong
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    setShowPaymentWizard(false);
    setPlacedOrder({ ...pendingOrder, paymentMethod: paymentResult.paymentMethod });
  };

  if (placedOrder) {
    return (
      <div className="text-center py-8 px-4 max-w-md mx-auto">
        <div className="bg-emerald-500/20 text-emerald-400 w-[70px] h-[70px] rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} />
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Order Placed Successfully!</h1>
        <p className="text-sm text-slate-400 mb-5">
          Order Reference: <strong className="text-amber-400">{placedOrder.id}</strong>
        </p>

        <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 text-left text-sm mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Items Count:</span>
            <span className="text-white font-semibold">{placedOrder.items.length} items</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Delivery Mode:</span>
            <span className="text-white font-semibold">{placedOrder.deliveryType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Amount:</span>
            <span className="price-tag text-base">K {placedOrder.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment Channel:</span>
            <span className="text-emerald-400 font-semibold">{placedOrder.paymentMethod}</span>
          </div>
        </div>

        <button
          className="btn-primary w-full"
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

  if (!cart.length && !pendingOrder) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon bg-amber-400/15">
          <ShoppingCart size={34} className="text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-slate-400 mb-6">
          Explore our campus shop for hair oils, shampoo, clippers, and cosmetics!
        </p>
        <button className="btn-primary" onClick={() => setActiveTab('shop')}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold text-white tracking-tight">Shopping Cart ({cart.length})</h1>

      {/* Cart Items List */}
      <div className="flex flex-col gap-3">
        {cart.map((item) => (
          <div
            key={item.id}
            className="card p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all hover:border-amber-400/40 group"
          >
            {/* Clickable image thumbnail */}
            <div
              className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10 cursor-pointer bg-white/5 group-hover:opacity-90"
              onClick={() => handleReviewProduct(item)}
              title="Click to review full product details"
            >
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Eye size={18} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-in-stock text-[10px] py-0.2 px-1.5">
                  {item.category || 'Product'}
                </span>
                <span className="text-[11px] text-slate-400">Unit: K {item.price}</span>
              </div>

              <h4
                onClick={() => handleReviewProduct(item)}
                className="text-sm font-bold text-white mb-1 truncate cursor-pointer hover:text-amber-400 transition-colors"
                title={`Click to review ${item.name}`}
              >
                {item.name}
              </h4>

              <div className="flex items-center gap-3 mb-2">
                <span className="price-tag text-sm">Item Total: K {item.price * item.quantity}</span>
              </div>

              <button
                onClick={() => handleReviewProduct(item)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1 rounded-xl border border-amber-400/25 cursor-pointer transition-all"
              >
                <Info size={13} />
                <span>Review Product Details</span>
              </button>
            </div>

            {/* Quantity controls & Remove button */}
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
              <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-white/10 shrink-0">
                <button
                  onClick={() => updateCartQuantity(item.id, -1)}
                  className="bg-transparent text-white hover:text-amber-400 p-1 flex border-0 cursor-pointer"
                  aria-label={`Decrease quantity of ${item.name}`}
                >
                  <Minus size={14} />
                </button>
                <span className="font-bold text-sm min-w-[20px] text-center text-white">{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.id, 1)}
                  className="bg-transparent text-white hover:text-amber-400 p-1 flex border-0 cursor-pointer"
                  aria-label={`Increase quantity of ${item.name}`}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="bg-transparent text-slate-400 hover:text-[#FF2D55] p-2 border-0 transition-colors shrink-0 cursor-pointer"
                aria-label={`Remove ${item.name} from cart`}
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Choice */}
      <div className="bg-white/[0.04] p-4 rounded-2xl border border-white/10">
        <h3 className="text-base font-bold text-white mb-3">Choose Delivery Option:</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            className={`p-3 rounded-2xl border flex items-center gap-2 transition-all ${
              deliveryType === 'Hostel Delivery'
                ? 'border-amber-400 bg-amber-400/10'
                : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'
            }`}
            onClick={() => setDeliveryType('Hostel Delivery')}
          >
            <Truck size={18} className="text-amber-400 shrink-0" aria-hidden="true" />
            <div className="text-left">
              <p className="font-bold text-sm text-white m-0">Hostel Delivery</p>
              <p className="text-[11px] text-slate-400 m-0">K15 Campus Fee</p>
            </div>
          </button>

          <button
            className={`p-3 rounded-2xl border flex items-center gap-2 transition-all ${
              deliveryType === 'Salon Pickup'
                ? 'border-emerald-400 bg-emerald-400/10'
                : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'
            }`}
            onClick={() => setDeliveryType('Salon Pickup')}
          >
            <Store size={18} className="text-emerald-400 shrink-0" aria-hidden="true" />
            <div className="text-left">
              <p className="font-bold text-sm text-white m-0">Salon Pickup</p>
              <p className="text-[11px] text-slate-400 m-0">Free at Campus Salon</p>
            </div>
          </button>
        </div>

        {deliveryType === 'Hostel Delivery' && (
          <div className="form-group mb-0">
            <label className="form-label" htmlFor="cart-hostel">Hostel Name & Room Number:</label>
            <input
              id="cart-hostel"
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
      <div className="flex gap-3">
        <input
          type="text"
          className="form-input flex-1"
          placeholder="Promo code (e.g. STUDENT15)"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          aria-label="Promo code"
        />
        <button className="btn-secondary shrink-0" onClick={handleApplyPromo}>
          Apply
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white/[0.04] p-5 rounded-2xl border border-white/10">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-slate-400">Subtotal:</span>
          <span className="text-white font-semibold">K {subtotal}</span>
        </div>
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-slate-400">Delivery Fee:</span>
          <span className="text-white font-semibold">K {deliveryFee}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between mb-2 text-sm text-emerald-400">
            <span>Student Discount ({discountPercent}%):</span>
            <span>-K {discountAmount}</span>
          </div>
        )}
        <div className="flex justify-between pt-3 border-t border-white/10 text-lg font-extrabold">
          <span className="text-white">Total Amount:</span>
          <span className="price-tag text-xl">K {totalAmount}</span>
        </div>

        <button
          className="btn-success w-full mt-4"
          onClick={handleCheckout}
          disabled={placingOrder}
        >
          <span>{placingOrder ? 'Placing order…' : `Checkout via Mobile Money (K ${totalAmount})`}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>

      {showPaymentWizard && pendingOrder && (
        <PawaPayCheckoutWizard
          type="order"
          recordId={pendingOrder.id}
          amount={totalAmount}
          title={`Shop Order (${pendingOrder.items?.length || 1} items)`}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentWizard(false)}
          allowPayOnArrival={true}
        />
      )}
    </div>
  );
}
