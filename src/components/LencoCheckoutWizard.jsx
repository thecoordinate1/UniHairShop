import React, { useState, useEffect } from 'react';
import { X, Shield, Smartphone, CreditCard, CheckCircle, Loader2, Lock, ArrowRight, Banknote, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LencoCheckoutWizard({ amount, title, onSuccess, onClose, allowPayOnArrival = true }) {
  const { user, addToast } = useApp();

  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('airtel');
  const [phone, setPhone] = useState(user.phone || '0971234567');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [lencoRef, setLencoRef] = useState('');
  const [loading, setLoading] = useState(false);

  // Press Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleStartPayment = () => {
    if ((method === 'airtel' || method === 'mtn' || method === 'zamtel') && (!phone || phone.length < 10)) {
      addToast('Please enter a valid Zambian phone number (e.g. 097xxxxxxx)', 'info');
      return;
    }

    if (method === 'arrival') {
      const mockRef = `LNC-POA-${Math.floor(100000 + Math.random() * 900000)}`;
      onSuccess({ paymentMethod: 'Pay on Arrival / Pickup', lencoReference: mockRef });
      return;
    }

    setStep(3);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const generatedRef = `LNC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      setLencoRef(generatedRef);
    }, 2200);
  };

  const handleConfirmPin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 1500);
  };

  const handleFinish = () => {
    onSuccess({
      paymentMethod: method === 'card' ? 'Card (Lenco Pay)' : `${method.toUpperCase()} Mobile Money (Lenco)`,
      lencoReference: lencoRef
    });
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-card max-w-md border border-emerald-500/40" onClick={(e) => e.stopPropagation()}>
        {/* Prominent Close X Button */}
        <button className="modal-close" onClick={onClose} title="Close payment wizard (Esc)" aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Lenco Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="momo-logo lenco-pay">LENCO</div>
            <div>
              <h4 className="text-sm font-bold text-white m-0">Lenco Pay Checkout</h4>
              <p className="text-[11px] text-slate-400 m-0">Zambian Mobile Money & Card Gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <Lock size={12} />
            <span>256-bit SSL</span>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="bg-slate-900/80 p-3 rounded-xl mb-4 flex justify-between items-center border border-white/10">
          <div>
            <p className="text-xs text-slate-400 m-0">Payment For:</p>
            <p className="text-sm font-bold text-white m-0 truncate max-w-[200px]">{title}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 m-0">Total Amount:</p>
            <p className="price-tag m-0 text-base">K {amount}</p>
          </div>
        </div>

        {/* STEP 1 & 2: Select Payment Method & Phone */}
        {step === 1 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2.5">
              Select Payment Method:
            </p>

            <div className="flex flex-col gap-2.5 mb-4">
              <div
                className={`momo-option ${method === 'airtel' ? 'selected' : ''}`}
                onClick={() => setMethod('airtel')}
              >
                <div className="momo-logo airtel">Airtel</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm m-0">Airtel Money (Zambia)</p>
                  <p className="text-[11px] text-slate-400 m-0">Direct mobile money STK prompt</p>
                </div>
              </div>

              <div
                className={`momo-option ${method === 'mtn' ? 'selected' : ''}`}
                onClick={() => setMethod('mtn')}
              >
                <div className="momo-logo mtn">MTN</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm m-0">MTN Mobile Money</p>
                  <p className="text-[11px] text-slate-400 m-0">Instant MoMo pin request</p>
                </div>
              </div>

              <div
                className={`momo-option ${method === 'zamtel' ? 'selected' : ''}`}
                onClick={() => setMethod('zamtel')}
              >
                <div className="momo-logo zamtel">Zamtel</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm m-0">Zamtel Kwacha</p>
                  <p className="text-[11px] text-slate-400 m-0">Zamtel mobile wallet push</p>
                </div>
              </div>

              <div
                className={`momo-option ${method === 'card' ? 'selected' : ''}`}
                onClick={() => setMethod('card')}
              >
                <div className="bg-slate-700 p-1.5 rounded flex items-center">
                  <CreditCard size={18} className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm m-0">Bank Card (Visa / Mastercard)</p>
                  <p className="text-[11px] text-slate-400 m-0">Processed by Lenco Gateway</p>
                </div>
              </div>

              {allowPayOnArrival && (
                <div
                  className={`momo-option ${method === 'arrival' ? 'selected' : ''}`}
                  onClick={() => setMethod('arrival')}
                >
                  <div className="bg-emerald-500/20 p-1.5 rounded">
                    <Banknote size={18} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm m-0">Pay on Arrival / Cash on Pickup</p>
                    <p className="text-[11px] text-slate-400 m-0">Pay at salon counter or delivery</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input fields */}
            {(method === 'airtel' || method === 'mtn' || method === 'zamtel') && (
              <div className="form-group">
                <label className="form-label">Zambian Mobile Money Number:</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 0971234567 or 0961234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            )}

            {method === 'card' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Card Number:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY):</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="08/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVC:</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              className="btn-success w-full mt-2"
              onClick={handleStartPayment}
            >
              <span>{method === 'arrival' ? 'Confirm Booking / Order' : `Pay K ${amount} via Lenco`}</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onClose}
              className="w-full text-center text-xs text-slate-400 hover:text-white mt-3 flex items-center justify-center gap-1 bg-transparent border-0"
            >
              <ArrowLeft size={14} />
              <span>Cancel Payment</span>
            </button>
          </div>
        )}

        {/* STEP 3: STK Push / PIN Authorization Prompt */}
        {step === 3 && (
          <div className="text-center py-2">
            {loading ? (
              <div>
                <Loader2 size={40} className="spin animate-spin text-amber-400 mx-auto mb-4" />
                <h4 className="text-base font-bold text-white mb-2">Initiating Lenco Payment...</h4>
                <p className="text-xs text-slate-400">Sending STK Push prompt to {phone}...</p>
              </div>
            ) : (
              <div>
                <div className="bg-emerald-500/15 text-emerald-400 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Smartphone size={30} />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Check Your Phone!</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Lenco has sent an STK prompt to <strong>{phone}</strong>. Enter your Mobile Money PIN on your handset or simulate authorization below:
                </p>

                <div className="bg-slate-900/90 p-4 rounded-xl border border-dashed border-amber-400/50 mb-5">
                  <p className="text-xs text-amber-400 font-semibold mb-1">
                    [Simulated Handset Prompt]
                  </p>
                  <p className="text-xs text-white mb-3">
                    Authorize UniHairShop payment of K {amount}? Ref: {lencoRef}
                  </p>
                  <input
                    type="password"
                    maxLength={4}
                    className="form-input text-center tracking-[8px] text-lg max-w-[160px] mx-auto"
                    placeholder="PIN"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                  />
                </div>

                <button
                  className="btn-primary w-full"
                  onClick={handleConfirmPin}
                >
                  Authorize Payment (K {amount})
                </button>

                <button
                  onClick={onClose}
                  className="w-full text-center text-xs text-slate-400 hover:text-white mt-3 flex items-center justify-center gap-1 bg-transparent border-0"
                >
                  <ArrowLeft size={14} />
                  <span>Cancel Payment</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Success Receipt */}
        {step === 4 && (
          <div className="text-center py-2">
            <div className="bg-emerald-500/20 text-emerald-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={38} />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Payment Approved!</h3>
            <p className="text-xs text-slate-400 mb-4">
              Lenco Transaction Reference: <strong className="text-amber-400">{lencoRef}</strong>
            </p>

            <div className="bg-slate-900/80 p-3.5 rounded-xl text-left text-xs mb-5 space-y-1.5 border border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">Merchant:</span>
                <span className="text-white font-semibold">UniHairShop Zambia</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="text-amber-400 font-bold">K {amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Channel:</span>
                <span className="text-white font-semibold">{method.toUpperCase()} via Lenco Pay</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payer Phone:</span>
                <span className="text-white font-semibold">{phone}</span>
              </div>
            </div>

            <button
              className="btn-success w-full"
              onClick={handleFinish}
            >
              Continue to Confirmation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
