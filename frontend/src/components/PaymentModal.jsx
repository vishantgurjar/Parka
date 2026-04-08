import { useState, useEffect, useContext } from 'react';
import { X, ShieldCheck, CreditCard } from 'lucide-react';
import { AuthContext } from '../App';

export default function PaymentModal({ plan, onClose, entityId, entityType = 'user', onSuccess }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRazorpayPayment = async () => {
    if (!entityId || entityId === 'undefined') {
      setError("Please log in to upgrade your account.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create Order on Backend
      const orderRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.amount,
          receipt: `${entityId}_${Date.now()}`
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
            const verifyRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/payment/verify-signature`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                entityType,
                entityId,
                amount: plan.amount
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
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
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
      <div className="modal-content" style={{ maxWidth: '450px', padding: '2rem' }}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <CreditCard size={32} />
          </div>
          <h3 id="modalTitle" style={{ fontSize: '1.5rem' }}>Pay ₹{plan.amount}</h3>
          
          {plan.name === 'Gold PRO' ? (
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '15px', borderRadius: '12px', marginTop: '1rem', textAlign: 'left', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
              <h4 style={{ color: '#eab308', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} /> Upgrade to Gold PRO
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>✓ Secure WebRTC Privacy Calling</li>
                <li>✓ Holographic Sticker Delivery</li>
                <li>✓ Multi-Vehicle Support (Up to 3)</li>
                <li>✓ Priority SOS Assistance</li>
              </ul>
            </div>
          ) : plan.name === 'Diamond PRO' ? (
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '15px', borderRadius: '12px', marginTop: '1rem', textAlign: 'left', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <h4 style={{ color: '#8b5cf6', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} /> Upgrade to Diamond PRO
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>✓ Everything in Gold PRO</li>
                <li>✓ Multi-Vehicle Support (Up to 5)</li>
                <li>✓ Zero SOS Convenience Fees</li>
                <li>✓ Dedicated Analytics Log</li>
              </ul>
            </div>
          ) : (
            <p className="modal-desc" style={{ fontSize: '0.95rem' }}>Complete payment for <strong>{plan.name}</strong> securely via Razorpay.</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <img src="https://img.icons8.com/color/48/000000/upi.png" alt="UPI" style={{ height: '24px' }} />
            <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" style={{ height: '24px' }} />
            <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" style={{ height: '24px' }} />
            <img src="https://img.icons8.com/color/48/000000/google-pay-india.png" alt="GPay" style={{ height: '24px' }} />
          </div>
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
          style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', background: plan.name === 'Gold PRO' ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' : plan.name === 'Diamond PRO' ? 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' : 'var(--gradient-primary)' }}
        >
          {loading ? 'Processing...' : `Pay via Razorpay`}
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
