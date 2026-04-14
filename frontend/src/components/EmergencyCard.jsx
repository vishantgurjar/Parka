import React from 'react';
import { ShieldCheck } from 'lucide-react';

const EmergencyCard = React.forwardRef(({ user, qrUrl, theme = 'standard' }, ref) => {
  if (!user) return null;

  const subscriptionTier = user.subscriptionTier?.toLowerCase() || 'standard';
  const isDiamond = subscriptionTier === 'diamond';
  const isGold = subscriptionTier === 'gold';
  const vipClass = isDiamond ? 'minimal-card-vip-diamond' : (isGold ? 'minimal-card-vip-gold' : '');

  // Main emergency name from photo style (e.g. surname)
  const displayName = (user && user.name) 
    ? user.name.split(' ').pop()
    : 'PANWAR';

  return (
    <div className="emergency-card-container" ref={ref} style={{ padding: '0' }}>
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
                <span className="hybrid-label">SMART VEHICLE ID</span>
                <span className="hybrid-value">{displayName}</span>
             </div>
             
             <div className="hybrid-info-group">
                <span className="hybrid-label">EMERGENCY HELPLINE</span>
                <span className="hybrid-helpline">+91 78950 39922</span>
             </div>

             <div style={{ display: 'flex', gap: '30px', marginTop: '5px' }}>
                <div className="hybrid-info-group">
                   <span className="hybrid-label">VEHICLE PLATE</span>
                   <span className="hybrid-value" style={{ fontSize: '0.8rem' }}>{user.plateNumber || 'HAWJQIO'}</span>
                </div>
                <div className="hybrid-info-group">
                   <span className="hybrid-label">ACCESS</span>
                   <span className="hybrid-value" style={{ fontSize: '0.85rem' }}>24/7 GLOBAL</span>
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
             <span className="hybrid-scan-text">SCAN FOR HELP</span>
          </div>

        </div>
      </div>
    </div>
  );
});

EmergencyCard.displayName = 'EmergencyCard';

export default EmergencyCard;
