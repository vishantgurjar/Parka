import { useState } from 'react';
import { X } from 'lucide-react';

export default function PaymentModal({ plan, onClose }) {
  const [view, setView] = useState('app'); // 'app' or 'qr'
  const UPI_ID = '7895039922@ybl';
  
  const qrBaseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
  const amountStr = plan.amount.toString().replace(/,/g, '');
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent('Parkéé City')}&am=${amountStr}&cu=INR&tn=${encodeURIComponent('Parkéé City - ' + plan.name + ' Plan')}`;
  const qrUrl = `${qrBaseUrl}?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  const payWithApp = (scheme) => {
    const schemes = { tez: 'tez://upi/pay', phonepe: 'phonepe://pay', paytm: 'paytmmp://pay', upi: 'upi://pay' };
    const base = schemes[scheme] || 'upi://pay';
    const url = `${base}?pa=${UPI_ID}&pn=${encodeURIComponent('Parkéé City')}&am=${amountStr}&cu=INR&tn=${encodeURIComponent('Parkéé City - ' + plan.name + ' Plan')}`;
    window.location.href = url;
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => alert('UPI ID copied: ' + UPI_ID));
  };

  return (
    <div className="modal-overlay show" id="paymentModal" onClick={(e) => {
      if(e.target.id === 'paymentModal') onClose();
    }}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h3 id="modalTitle">Pay ₹{plan.amount} — {plan.name}</h3>
        <p className="modal-desc">Choose a UPI app or scan QR code to pay securely</p>
        
        {view === 'app' ? (
          <div id="modalAppView">
            <div className="upi-grid">
              <button className="upi-app-btn" onClick={() => payWithApp('tez')}>
                  <div className="upi-icon">G</div>
                  <div><strong>Google Pay</strong><br/><small>Pay ₹{plan.amount}</small></div>
              </button>
              <button className="upi-app-btn" onClick={() => payWithApp('phonepe')}>
                  <div className="upi-icon" style={{background:'#5f259f', color:'#fff'}}>P</div>
                  <div><strong>PhonePe</strong><br/><small>Pay ₹{plan.amount}</small></div>
              </button>
              <button className="upi-app-btn" onClick={() => payWithApp('paytm')}>
                  <div className="upi-icon" style={{background:'#00b9f5', color:'#fff'}}>₹</div>
                  <div><strong>Paytm</strong><br/><small>Pay ₹{plan.amount}</small></div>
              </button>
              <button className="upi-app-btn" onClick={() => payWithApp('upi')}>
                  <div className="upi-icon" style={{background:'#4caf50', color:'#fff'}}>U</div>
                  <div><strong>BHIM UPI</strong><br/><small>Pay ₹{plan.amount}</small></div>
              </button>
            </div>
            <a href={upiUrl} className="btn-gradient full-width" style={{marginTop:'12px', display:'block', textAlign:'center', padding: '12px'}}>🔗 Open Any UPI App</a>
            <div className="divider"><span>or</span></div>
            <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setView('qr')}>📱 Show QR Code</button>
                <button className="btn-secondary" onClick={copyUPI}>📋 Copy UPI ID</button>
            </div>
            <p className="modal-trust">🔒 Secured by UPI · No data stored</p>
          </div>
        ) : (
          <div id="modalQRView" className="modal-qr-view">
            <div className="modal-qr-wrap">
                <img src={qrUrl} width="200" height="200" alt="UPI QR" />
            </div>
            <p>Scan with any UPI app to pay <strong>₹{plan.amount}</strong></p>
            <div className="upi-id-display">
                <span>UPI ID:</span>
                <code>{UPI_ID}</code>
                <button onClick={copyUPI}>📋</button>
            </div>
            <div>
              <button className="link-btn" onClick={() => setView('app')}>← Back to app selection</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
