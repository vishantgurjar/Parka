import React from 'react';
import { ShieldCheck } from 'lucide-react';

const CustomerCard = React.forwardRef(({ user, qrUrl }, ref) => {
  if (!user) return null;

  const subscriptionTier = user.subscriptionTier?.toLowerCase() || 'standard';
  const isDiamond = subscriptionTier === 'diamond' || subscriptionTier === 'pro';
  const isGold = subscriptionTier === 'gold';
  
  // Custom class for the specific look from the photo
  const vipClass = isDiamond ? 'minimal-card-vip-diamond' : (isGold ? 'minimal-card-vip-gold' : '');

  return (
    <div className="customer-card-container" ref={ref} style={{ padding: '0' }}>
      <div className={`hybrid-card ${vipClass}`}>
        
        {/* Top Carbon Fiber Section */}
        <div className="carbon-section">
          <div className="hybrid-brand">
             <img src="/logo.png" alt="Logo" />
             <span>PARKÉÉ CITY</span>
          </div>
          <div className="hybrid-chip"></div>
        </div>

        {/* Bottom Sapphire Glass Section */}
        <div className="glass-section">
          
          {/* Info Section (Left) */}
          <div className="hybrid-info">
             <div className="hybrid-info-group">
                <span className="hybrid-label">VEHICLE OWNER</span>
                <span className="hybrid-value">{user.name || 'VISHANT PANWAR'}</span>
             </div>
             
             <div className="hybrid-info-group">
                <span className="hybrid-label">REGISTRATION PLATE</span>
                <span className="hybrid-value">{user.plateNumber || 'HAWJQIO'}</span>
             </div>

             <div style={{ display: 'flex', gap: '30px', marginTop: '5px' }}>
                <div className="hybrid-info-group">
                   <span className="hybrid-label">MEMBERSHIP</span>
                   <span className="hybrid-value" style={{ color: isDiamond ? '#818cf8' : (isGold ? '#eab308' : '#38bdf8') }}>
                      {user.subscriptionTier?.toUpperCase() || 'STANDARD'}
                   </span>
                </div>
                <div className="hybrid-info-group">
                   <span className="hybrid-label">VALIDITY</span>
                   <span className="hybrid-value">LIFETIME ACCESS</span>
                </div>
             </div>
          </div>

          {/* QR Section (Right) */}
          <div className="hybrid-qr-wrap">
             <div className="hybrid-qr-white">
               {qrUrl ? (
                 <img src={qrUrl} alt="QR Code" />
               ) : (
                 <div className="qr-placeholder" style={{ width: '90px', height: '90px' }}></div>
               )}
             </div>
             <span className="hybrid-scan-text">SCAN TO CONTACT</span>
          </div>

        </div>
      </div>
    </div>
  );
});

CustomerCard.displayName = 'CustomerCard';

export default CustomerCard;
