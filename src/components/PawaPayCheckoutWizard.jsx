import React, { useState, useEffect, useRef } from 'react';
import { X, Smartphone, Loader2, Lock, ArrowRight, Banknote, ArrowLeft, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initiatePayment, pollPaymentStatus, PAWAPAY_PROVIDERS } from '../lib/pawapay';

// Real PawaPay mobile money checkout. `type`/`recordId` identify the
// already-created booking or order this payment is charging against — the
// server re-derives and validates the amount itself, this component never
// gets to decide what gets charged.
export default function PawaPayCheckoutWizard({ type, recordId, amount, title, onSuccess, onClose, allowPayOnArrival = true }) {
  const { user, addToast } = useApp();

  const [provider, setProvider] = useState('AIRTEL_OAPI_ZMB');
  const [phone, setPhone] = useState(user.phone || '');
  const [stage, setStage] = useState('select'); // 'select' | 'waiting' | 'failed'
  const [loading, setLoading] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelledRef.current = true;
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handlePayOnArrival = () => {
    onSuccess({ paymentMethod: 'Pay on Arrival / Pickup', providerReference: null });
  };

  const handleStartPayment = async () => {
    if (!phone || phone.replace(/\D/g, '').length < 9) {
      addToast('Please enter a valid Zambian mobile money number (e.g. 097xxxxxxx)', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await initiatePayment({ type, id: recordId, amount, phone, provider });
      setStage('waiting');
      setLoading(false);

      const outcome = await pollPaymentStatus(result.depositId);
      if (cancelledRef.current) return;

      if (outcome === 'paid') {
        onSuccess({
          paymentMethod: `${PAWAPAY_PROVIDERS.find((p) => p.code === provider)?.label} (PawaPay)`,
          providerReference: result.depositId
        });
      } else if (outcome === 'failed') {
        setStage('failed');
        addToast('Payment was not approved. Please try again.', 'error');
      } else {
        setStage('failed');
        addToast('We didn\'t get a confirmation in time. Check your phone — if you approved it, your payment will still go through shortly.', 'info');
      }
    } catch (err) {
      setLoading(false);
      setStage('select');
      addToast(err.message || 'Unable to start payment. Please try again.', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-card max-w-md border border-emerald-500/40" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} title="Close payment wizard (Esc)" aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="momo-logo pawapay-brand">PawaPay</div>
            <div>
              <h4 className="text-sm font-bold text-white m-0">Mobile Money Checkout</h4>
              <p className="text-[11px] text-slate-400 m-0">Airtel, MTN & Zamtel — Zambia</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <Lock size={12} />
            <span>Secure</span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl mb-4 flex justify-between items-center border border-white/10">
          <div>
            <p className="text-xs text-slate-400 m-0">Payment For:</p>
            <p className="text-sm font-bold text-white m-0 truncate max-w-[200px]">{title}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 m-0">Amount:</p>
            <p className="price-tag m-0 text-base">K {amount}</p>
          </div>
        </div>

        {stage === 'select' && (
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2.5">Select Mobile Money Provider:</p>

            <div className="flex flex-col gap-2.5 mb-4">
              {PAWAPAY_PROVIDERS.map((p) => (
                <div
                  key={p.code}
                  className={`momo-option ${provider === p.code ? 'selected' : ''}`}
                  onClick={() => setProvider(p.code)}
                >
                  <div className={`momo-logo ${p.brandClass}`}>{p.shortLabel}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm m-0">{p.label}</p>
                  </div>
                </div>
              ))}

              {allowPayOnArrival && (
                <div className="momo-option" onClick={handlePayOnArrival}>
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

            <div className="form-group">
              <label className="form-label">Mobile Money Number:</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 0971234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button className="btn-success w-full mt-2" onClick={handleStartPayment} disabled={loading}>
              <span>{loading ? 'Starting payment…' : `Pay K${amount} Now`}</span>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
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

        {stage === 'waiting' && (
          <div className="text-center py-2">
            <div className="bg-emerald-500/15 text-emerald-400 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
              <Smartphone size={30} />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Check Your Phone!</h4>
            <p className="text-xs text-slate-400 mb-4">
              Approve the payment prompt sent to <strong>{phone}</strong> to complete your K{amount} payment.
            </p>
            <Loader2 size={28} className="animate-spin text-amber-400 mx-auto" />
            <p className="text-[11px] text-slate-500 mt-3">Waiting for confirmation… this can take up to a minute.</p>

            <button
              onClick={onClose}
              className="w-full text-center text-xs text-slate-400 hover:text-white mt-5 flex items-center justify-center gap-1 bg-transparent border-0"
            >
              <ArrowLeft size={14} />
              <span>Close (payment will still complete if approved)</span>
            </button>
          </div>
        )}

        {stage === 'failed' && (
          <div className="text-center py-2">
            <div className="bg-rose-500/15 text-rose-400 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={30} />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Payment Not Completed</h4>
            <p className="text-xs text-slate-400 mb-4">
              We couldn't confirm this payment. You can try again below.
            </p>
            <button className="btn-primary w-full" onClick={() => setStage('select')}>
              Try Again
            </button>
            <button
              onClick={onClose}
              className="w-full text-center text-xs text-slate-400 hover:text-white mt-3 flex items-center justify-center gap-1 bg-transparent border-0"
            >
              <ArrowLeft size={14} />
              <span>Close</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
