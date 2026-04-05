import { useState, useEffect } from 'react';
import { X, ShieldCheck, CreditCard } from 'lucide-react';

export default function PaymentModal({ plan, onClose, entityId, entityType = 'user', onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create Order on Backend
      const orderRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.amount,
          receipt: `receipt_${entityId}_${Date.now()}`
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create order');

      // 2. Options for Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SZhRunfEKtZwk4',
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Parkéé City",
        description: `Payment for ${plan.name}`,
        image: "/logo.png",
        order_id: orderData.id,
        handler: async function (response) {
          // 3. Verify Signature on Backend
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/payment/verify-signature`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                entityType,
                entityId
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              alert("Payment Successful! ✓");
              if (onSuccess) onSuccess(verifyData);
              onClose();
            } else {
              throw new Error(verifyData.message || 'Signature verification failed');
            }
          } catch (err) {
            console.error("Verification Error:", err);
            setError("Payment verification failed. Please contact support with Payment ID: " + response.razorpay_payment_id);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#0d9488"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        setError(response.error.description);
      });
      rzp1.open();

    } catch (err) {
      console.error("Payment Error:", err);
      setError(err.message || 'Could not initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" id="paymentModal" onClick={(e) => {
      if(e.target.id === 'paymentModal') onClose();
    }}>
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CreditCard size={32} />
          </div>
          <h3 id="modalTitle">Pay ₹{plan.amount}</h3>
          <p className="modal-desc" style={{ fontSize: '0.95rem' }}>Complete payment for <strong>{plan.name}</strong> securely via Razorpay.</p>
        </div>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <button 
          className="btn-gradient full-width" 
          onClick={handleRazorpayPayment} 
          disabled={loading}
          style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : `Pay Now`}
        </button>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', textAlign: 'center' }}>
          <p className="modal-trust" style={{ color: 'var(--muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <ShieldCheck size={14} />
            Secured by Razorpay · 128-bit Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
