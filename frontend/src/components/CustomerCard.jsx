import React from 'react';
import { ShieldCheck } from 'lucide-react';

const CustomerCard = React.forwardRef(({ user, qrUrl }, ref) => {
  if (!user) return null;

  const subscriptionTier = user.subscriptionTier?.toLowerCase() || 'standard';
  const isDiamond = subscriptionTier === 'diamond';
  const isGold = subscriptionTier === 'gold';
  
  // Custom class for the specific look from the photo
  const vipClass = isDiamond ? 'minimal-card-vip-diamond' : (isGold ? 'minimal-card-vip-gold' : '');

  return (
    <div className="customer-card-container" ref={ref} style={{ padding: '0' }}>
      <div className={`minimal-card ${vipClass}`}>
        
        {/* Top Header Bar from Photo */}
        <div className="minimal-card-header">
          <div className="minimal-card-brand">
             <img src="/logo.png" alt="Logo" />
             <span>PARKÉÉ CITY</span>
          </div>
          <div className="minimal-card-badge">
             <ShieldCheck size={12} /> VERIFIED CUSTOMER
          </div>
        </div>

        {/* Main Content Area */}
        <div className="minimal-card-body">
          
          {/* Info Section (Left) */}
          <div className="minimal-card-info">
             <div className="minimal-info-group">
                <span className="minimal-label">VEHICLE OWNER</span>
                <span className="minimal-value">{user.name || 'VISHANT PANWAR'}</span>
             </div>
             
             <div className="minimal-info-group">
                <span className="minimal-label">REGISTRATION PLATE</span>
                <span className="minimal-value" style={{ fontSize: '1.4rem' }}>{user.plateNumber || 'HAWJQIO'}</span>
             </div>

             <div className="minimal-info-footer">
                <div className="minimal-info-group">
                   <span className="minimal-label">MEMBERSHIP</span>
                   <span className="minimal-value-small" style={{ color: isDiamond ? '#8b5cf6' : (isGold ? '#ca8a04' : '#1e293b') }}>
                     {user.subscriptionTier?.toUpperCase() || 'STANDARD'}
                   </span>
                </div>
                <div className="minimal-info-group">
                   <span className="minimal-label">VALIDITY</span>
                   <span className="minimal-value-small">Lifetime Access</span>
                </div>
             </div>
          </div>

          {/* QR Section (Right) */}
          <div className="minimal-card-qr-section">
             <div className="minimal-qr-white-frame">
               {qrUrl ? (
                 <img src={qrUrl} alt="QR Code" />
               ) : (
                 <div className="qr-placeholder"></div>
               )}
             </div>
             <span className="minimal-qr-caption">SCAN TO CONTACT</span>
          </div>

        </div>
      </div>
    </div>
  );
});

CustomerCard.displayName = 'CustomerCard';

export default CustomerCard;
