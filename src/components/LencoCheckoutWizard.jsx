import React, { useState, useEffect } from 'react';
import { X, Shield, Smartphone, CreditCard, CheckCircle, Loader2, Lock, ArrowRight, Banknote } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LencoCheckoutWizard({ amount, title, onSuccess, onClose, allowPayOnArrival = true }) {
  const { user, addToast } = useApp();

  const [step, setStep] = useState(1); // 1: Select Method, 2: Enter Details, 3: Processing STK Push, 4: Success Receipt
  const [method, setMethod] = useState('airtel'); // airtel, mtn, zamtel, card, arrival
  const [phone, setPhone] = useState(user.phone || '0971234567');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [lencoRef, setLencoRef] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartPayment = () => {
    if ((method === 'airtel' || method === 'mtn' || method === 'zamtel') && (!phone || phone.length < 10)) {
      addToast('Please enter a valid Zambian phone number (e.g. 097xxxxxxx)', 'info');
      return;
    }

    if (method === 'arrival') {
      // Direct completion for Pay on Arrival / Pickup
      const mockRef = `LNC-POA-${Math.floor(100000 + Math.random() * 900000)}`;
      onSuccess({ paymentMethod: 'Pay on Arrival / Pickup', lencoReference: mockRef });
      return;
    }

    // Advance to STK Push / Processing step
    setStep(3);
    setLoading(true);

    // Simulate Lenco API response after 2.5 seconds
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
      setStep(4); // Success step
    }, 1500);
  };

  const handleFinish = () => {
    onSuccess({
      paymentMethod: method === 'card' ? 'Card (Lenco Pay)' : `${method.toUpperCase()} Mobile Money (Lenco)`,
      lencoReference: lencoRef
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '480px', border: '1px solid rgba(27, 183, 132, 0.4)' }}>
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Lenco Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="momo-logo lenco-pay">LENCO</div>
            <div>
              <h4 style={{ fontSize: '1rem', color: '#fff', margin: 0 }}>Lenco Pay Checkout</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Instant Zambian Mobile Money & Card Gateway</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00E676', fontSize: '0.75rem', fontWeight: 600 }}>
            <Lock size={12} />
            <span>256-bit SSL</span>
          </div>
        </div>

        {/* Amount Summary */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Payment For:</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>{title}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Total Amount:</p>
            <p className="price-tag" style={{ margin: 0 }}>K {amount}</p>
          </div>
        </div>

        {/* STEP 1 & 2: Select Payment Method & Phone */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px' }}>
              Select Payment Method:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div
                className={`momo-option ${method === 'airtel' ? 'selected' : ''}`}
                onClick={() => setMethod('airtel')}
              >
                <div className="momo-logo airtel">Airtel</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Airtel Money (Zambia)</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Direct mobile money STK prompt</p>
                </div>
              </div>

              <div
                className={`momo-option ${method === 'mtn' ? 'selected' : ''}`}
                onClick={() => setMethod('mtn')}
              >
                <div className="momo-logo mtn">MTN</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>MTN Mobile Money</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Instant MoMo pin request</p>
                </div>
              </div>

              <div
                className={`momo-option ${method === 'zamtel' ? 'selected' : ''}`}
                onClick={() => setMethod('zamtel')}
              >
                <div className="momo-logo zamtel">Zamtel</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Zamtel Kwacha</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Zamtel mobile wallet push</p>
                </div>
              </div>

              <div
                className={`momo-option ${method === 'card' ? 'selected' : ''}`}
                onClick={() => setMethod('card')}
              >
                <div style={{ background: '#334155', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                  <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Bank Card (Visa / Mastercard)</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Processed by Lenco Gateway</p>
                </div>
              </div>

              {allowPayOnArrival && (
                <div
                  className={`momo-option ${method === 'arrival' ? 'selected' : ''}`}
                  onClick={() => setMethod('arrival')}
                >
                  <div style={{ background: 'rgba(0, 200, 83, 0.2)', padding: '4px 8px', borderRadius: '6px' }}>
                    <Banknote size={18} style={{ color: '#00E676' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Pay on Arrival / Cash on Pickup</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Pay at salon counter or delivery</p>
                  </div>
                </div>
              )}
            </div>

            {/* Account input fields depending on method */}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
              className="btn-success"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={handleStartPayment}
            >
              <span>{method === 'arrival' ? 'Confirm Booking / Order' : `Pay K ${amount} via Lenco`}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 3: STK Push / PIN Authorization Prompt */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            {loading ? (
              <div>
                <Loader2 size={40} className="spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Initiating Lenco Payment...</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sending STK Push prompt to {phone}...</p>
              </div>
            ) : (
              <div>
                <div style={{ background: 'rgba(0, 200, 83, 0.15)', color: '#00E676', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Smartphone size={32} />
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Check Your Phone!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Lenco has sent an STK prompt to <strong>{phone}</strong>. Enter your Mobile Money PIN on your handset or simulate authorization below:
                </p>

                <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--primary)', marginBottom: '20px' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '8px' }}>
                    [Simulated Handset Prompt]
                  </p>
                  <p style={{ fontSize: '0.88rem', color: '#fff', marginBottom: '12px' }}>
                    Authorize UniHairShop payment of K {amount}? Ref: {lencoRef}
                  </p>
                  <input
                    type="password"
                    maxLength={4}
                    className="form-input"
                    style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', maxWidth: '180px', margin: '0 auto' }}
                    placeholder="PIN"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                  />
                </div>

                <button
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={handleConfirmPin}
                >
                  Authorize Payment (K {amount})
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Success Receipt */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ background: 'rgba(0, 200, 83, 0.2)', color: '#00E676', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={38} />
            </div>

            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>Payment Approved!</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Lenco Transaction Reference: <strong style={{ color: 'var(--primary)' }}>{lencoRef}</strong>
            </p>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '14px', borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: '0.82rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Merchant:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>UniHairShop Zambia</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>K {amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Channel:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{method.toUpperCase()} via Lenco Pay</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payer Phone:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{phone}</span>
              </div>
            </div>

            <button
              className="btn-success"
              style={{ width: '100%' }}
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
