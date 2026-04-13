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
      <div className={`minimal-card ${vipClass}`}>
        
        {/* Top Header Bar from Photo */}
        <div className="minimal-card-header" style={{ background: '#0f172a' }}>
          <div className="minimal-card-brand">
             <img src="/logo.png" alt="Logo" />
             <span>PARKÉÉ CITY</span>
          </div>
          <div className="minimal-card-badge" style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
             <ShieldCheck size={12} /> EMERGENCY SERVICES
          </div>
        </div>

        {/* Main Content Area */}
        <div className="minimal-card-body">
          
          {/* Info Section (Left) */}
          <div className="minimal-card-info">
             <div className="minimal-info-group">
                <span className="minimal-label">SMART VEHICLE ID</span>
                <span className="minimal-value">{displayName}</span>
             </div>
             
             <div className="minimal-info-group">
                <span className="minimal-label">EMERGENCY HELPLINE</span>
                <span className="minimal-value" style={{ fontSize: '1.6rem', color: '#f43f5e' }}>+91 78950 39922</span>
             </div>

             <div className="minimal-info-footer">
                <div className="minimal-info-group">
                   <span className="minimal-label">VEHICLE PLATE</span>
                   <span className="minimal-value-small">{user.plateNumber || 'HAWJQIO'}</span>
                </div>
                <div className="minimal-info-group">
                   <span className="minimal-label">ACCESS</span>
                   <span className="minimal-value-small">24/7 GLOBAL</span>
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
             <span className="minimal-qr-caption">SCAN FOR HELP</span>
          </div>

        </div>
      </div>
    </div>
  );
});

EmergencyCard.displayName = 'EmergencyCard';

export default EmergencyCard;
