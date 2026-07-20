import { useState, useEffect, useContext } from 'react';
import { X, ShieldCheck, CreditCard } from 'lucide-react';
import { AuthContext } from '../App';
import { getBackendUrl } from '../utils/api';
import { toast } from 'react-hot-toast';

export default function PaymentModal({ plan, onClose, entityId, entityType = 'user', onSuccess }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sandbox simulation states
  const [isMockPayment, setIsMockPayment] = useState(false);
  const [mockStep, setMockStep] = useState('none'); // 'none', 'select_method', 'processing', 'success'
  const [mockMethod, setMockMethod] = useState('upi'); // 'upi', 'card'
  const [mockOrderData, setMockOrderData] = useState(null);
  const [mockProcessingText, setMockProcessingText] = useState('Connecting to sandbox gateway...');

  const handleRazorpayPayment = async () => {
    if (!entityId || entityId === 'undefined') {
      setError("Please log in to upgrade your account.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Always use standard one-time orders instead of subscriptions (due to Razorpay Autopay account / RBI mandate limitations)
    const isSubscription = false;

    try {
      const baseUrl = getBackendUrl();
      let orderData;

      if (isSubscription) {
        // 1. Create Subscription on Backend
        const subRes = await fetch(`${baseUrl}/api/payment/create-subscription`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planName: plan.name,
            amount: plan.amount,
            entityId
          })
        });
        orderData = await subRes.json();
        if (!subRes.ok) throw new Error(orderData.message || 'Failed to create subscription');
      } else {
        // 1. Create Order on Backend
        const orderRes = await fetch(`${baseUrl}/api/payment/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: plan.amount,
            receipt: `${entityId}_${Date.now()}`
          })
        });
        orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create order');
      }

      // If mock payment, intercept for sandbox simulation UI
      if (orderData.isMock) {
        console.log("⚡ Sandbox / Mock Mode Active: Opening simulation modal...");
        setIsMockPayment(true);
        setMockOrderData(orderData);
        setMockStep('select_method');
        setLoading(false);
        return;
      }

      // 2. Options for Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        name: "Parxéé City",
        description: isSubscription ? `Subscription for ${plan.name}` : `Payment for ${plan.name}`,
        image: "/logo.png",
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#0d9488"
        }
      };

      if (isSubscription) {
        options.subscription_id = orderData.id;
        options.handler = async function (response) {
          try {
            const verifyRes = await fetch(`${baseUrl}/api/payment/verify-subscription-signature`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                entityId,
                planName: plan.name
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              toast.success("Subscription Successful! ✓");
              if (onSuccess) onSuccess(verifyData);
              onClose();
            } else {
              throw new Error(verifyData.message || 'Subscription verification failed');
            }
          } catch (err) {
            console.error("Verification Error:", err);
            setError("Subscription verification failed. Please contact support with Subscription ID: " + response.razorpay_subscription_id);
          }
        };
      } else {
        options.amount = orderData.amount;
        options.currency = orderData.currency;
        options.order_id = orderData.id;
        options.handler = async function (response) {
          try {
            const verifyRes = await fetch(`${baseUrl}/api/payment/verify-signature`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                entityType,
                entityId,
                amount: plan.amount,
                userId: user?._id || user?.id,
                hours: plan.hours,
                planName: plan.name
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              toast.success("Payment Successful! ✓");
              if (onSuccess) onSuccess(verifyData);
              onClose();
            } else {
              throw new Error(verifyData.message || 'Signature verification failed');
            }
          } catch (err) {
            console.error("Verification Error:", err);
            setError("Payment verification failed. Please contact support with Payment ID: " + response.razorpay_payment_id);
          }
        };
      }

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

  // Run the sandbox payment simulation
  const executeSandboxSimulation = async () => {
    if (!mockOrderData) return;
    setLoading(true);
    setMockStep('processing');
    setError(null);

    const isSubscription = false;
    const baseUrl = getBackendUrl();

    // Helper to simulate delays
    const delay = ms => new Promise(res => setTimeout(res, ms));

    try {
      setMockProcessingText("Connecting to PARXÉÉ Secure Sandbox Gateway...");
      await delay(1200);

      setMockProcessingText(`Simulating ${mockMethod.toUpperCase()} transaction of ₹${plan.amount}...`);
      await delay(1500);

      setMockProcessingText("Authorizing mock bank response & credentials...");
      await delay(1200);

      setMockProcessingText("Verifying mock signature at backend/verify-signature...");
      await delay(1200);

      const verifyBody = isSubscription 
        ? {
            razorpay_subscription_id: mockOrderData.id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "mock_signature",
            entityId,
            planName: plan.name
          }
        : {
            razorpay_order_id: mockOrderData.id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "mock_signature",
            entityType,
            entityId,
            amount: plan.amount,
            userId: user?._id || user?.id,
            hours: plan.hours,
            planName: plan.name
          };

      const verifyUrl = isSubscription 
        ? `${baseUrl}/api/payment/verify-subscription-signature`
        : `${baseUrl}/api/payment/verify-signature`;

      const verifyRes = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyBody)
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok) {
        setMockStep('success');
        await delay(1200);
        toast.success("Payment Successful! ✓");
        if (onSuccess) onSuccess(verifyData);
        onClose();
      } else {
        throw new Error(verifyData.message || 'Sandbox verification failed');
      }
    } catch (err) {
      console.error("Sandbox Simulation Error:", err);
      setError(err.message || 'Sandbox transaction failed');
      setMockStep('select_method');
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
        
        {/* MOCK PAYMENTS SUB-FLOW */}
        {isMockPayment && mockStep !== 'none' ? (
          <div style={{ textAlign: 'center' }}>
            
            {/* Step 1: Select Method */}
            {mockStep === 'select_method' && (
              <div>
                <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <ShieldCheck size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Sandbox Test Gateway</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
                  No Razorpay API keys configured. Select a payment method to simulate the transaction.
                </p>

                {error && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.8rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {error}
                  </div>
                )}

                {/* Method selector options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem', textAlign: 'left' }}>
                  <button 
                    type="button" 
                    onClick={() => setMockMethod('upi')}
                    style={{
                      background: mockMethod === 'upi' ? 'rgba(13, 148, 136, 0.08)' : 'rgba(0,0,0,0.2)',
                      border: mockMethod === 'upi' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px', padding: '14px', cursor: 'pointer', display: 'flex', width: '100%', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>📱</span>
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', color: mockMethod === 'upi' ? '#fff' : 'var(--muted)' }}>Simulate UPI Transaction</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Mock Google Pay, PhonePe, Paytm payment</span>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setMockMethod('card')}
                    style={{
                      background: mockMethod === 'card' ? 'rgba(13, 148, 136, 0.08)' : 'rgba(0,0,0,0.2)',
                      border: mockMethod === 'card' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px', padding: '14px', cursor: 'pointer', display: 'flex', width: '100%', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>💳</span>
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', color: mockMethod === 'card' ? '#fff' : 'var(--muted)' }}>Simulate Credit/Debit Card</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Mock Visa/Mastercard 3D-Secure workflow</span>
                    </div>
                  </button>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Pay Amount:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{plan.amount}</span>
                </div>

                <button 
                  onClick={executeSandboxSimulation}
                  disabled={loading}
                  className="btn-gradient full-width" 
                  style={{ padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                >
                  Pay via Sandbox Simulator
                </button>
              </div>
            )}

            {/* Step 2: Processing simulation */}
            {mockStep === 'processing' && (
              <div style={{ padding: '2rem 0' }}>
                <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '48px', height: '48px', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Processing Payment</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{mockProcessingText}</p>
                <div style={{ width: '80%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', margin: '1.5rem auto 0', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: '100%', width: '40%', background: 'var(--primary)', borderRadius: 'inherit', position: 'absolute', animation: 'shimmer 1.5s infinite linear' }} />
                </div>
              </div>
            )}

            {/* Step 3: Success notification */}
            {mockStep === 'success' && (
              <div style={{ padding: '2rem 0' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid #10b981', animation: 'pulse 1s infinite' }}>
                  <ShieldCheck size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '8px' }}>Payment Authorized</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>₹{plan.amount} mock transaction completed successfully!</p>
              </div>
            )}

          </div>
        ) : (
          /* REGULAR RAZORPAY / PRODUCTION FLOW */
          <div>
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
                    <li>✓ EV Smart Hub with AI doctor</li>
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
                <img src="https://img.icons8.com/color/48/upi.png" alt="UPI" style={{ height: '24px' }} />
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
              disabled={loading || (error && (error.includes('not configured') || error.includes('gateway')))}
              style={{ 
                padding: '16px', 
                fontSize: '1.1rem', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                border: 'none', 
                cursor: (loading || (error && (error.includes('not configured') || error.includes('gateway')))) ? 'not-allowed' : 'pointer', 
                opacity: (loading || (error && (error.includes('not configured') || error.includes('gateway')))) ? 0.6 : 1,
                background: plan.name === 'Gold PRO' ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' : plan.name === 'Diamond PRO' ? 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' : 'var(--gradient-primary)' 
              }}
            >
              {loading ? 'Processing...' : error && (error.includes('not configured') || error.includes('gateway')) ? 'Payment Unavailable' : `Pay via Razorpay`}
            </button>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', textAlign: 'center' }}>
              <p className="modal-trust" style={{ color: 'var(--muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <ShieldCheck size={14} />
                Secured by Razorpay · 128-bit Encryption
              </p>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}} />
    </div>
  );
}
