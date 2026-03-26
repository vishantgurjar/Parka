import { useEffect, useState, useContext } from 'react';
import { X, Loader } from 'lucide-react';
import { AuthContext } from '../App';

export default function PaymentModal({ plan, onClose }) {
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const amountStr = plan.amount.toString().replace(/,/g, '');
        const amount = parseInt(amountStr);
        
        // 1. Create order on backend
        const { data: order } = await import('axios').then(m => m.default).then(axios => axios.post(`${import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app'}/api/payments/order`, {
          amount: amount,
          userId: user?._id || user?.id
        }));

        // 2. Initialize Razorpay Checkout
        const options = {
          key: "STmrw1SE0wAdVz", // Merchant ID
          amount: order.amount,
          currency: order.currency,
          name: "Parké City",
          description: plan.name + " Plan",
          order_id: order.id,
          handler: async function (response) {
            try {
              // 3. Verify payment on backend
              await import('axios').then(m => m.default).then(axios => axios.post(`${import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app'}/api/payments/verify`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }));
              alert("Payment Successful! Your plan has been activated.");
              onClose();
            } catch (err) {
              console.error(err);
              setError("Payment verification failed.");
            }
          },
          modal: {
            ondismiss: function() {
              onClose(); // Close the wrapper when Razorpay closes
            }
          },
          prefill: {
            name: user?.name || "Customer",
            email: user?.email || "",
            contact: user?.phone || ""
          },
          theme: {
            color: "#0d9488"
          }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          setError("Payment Failed: " + response.error.description);
        });
        rzp.open();

      } catch (err) {
        console.error(err);
        setError("Something went wrong while initiating payment.");
      }
    };

    initiatePayment();
  }, [plan, onClose, user]);

  return (
    <div className="modal-overlay show" id="paymentModal" onClick={(e) => {
      if(e.target.id === 'paymentModal') onClose();
    }}>
      <div className="modal-content" style={{ textAlign: 'center', padding: '2rem' }}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        {error ? (
          <div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Payment Error</h3>
            <p className="modal-desc" style={{ color: 'red' }}>{error}</p>
            <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={onClose}>Close</button>
          </div>
        ) : (
          <div>
            <Loader size={48} className="spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
            <h3>Processing Payment...</h3>
            <p className="modal-desc">Please complete the payment in the Razorpay window.</p>
          </div>
        )}
      </div>
    </div>
  );
}
