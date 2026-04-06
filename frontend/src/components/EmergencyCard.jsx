import React from 'react';
import { Smartphone, Wrench, AlertTriangle } from 'lucide-react';

const EmergencyCard = React.forwardRef(({ user, qrUrl }, ref) => {
  if (!user) return null;

  // Determine Premium styling
  const isDiamond = user.subscriptionTier === 'diamond';
  const isGold = user.subscriptionTier === 'gold';
  
  let themeClass = "theme-standard";
  if (isDiamond) themeClass = "theme-diamond";
  else if (isGold) themeClass = "theme-gold";

  return (
    <div className={`emergency-card-container ${themeClass}`} ref={ref}>
      <div className="emergency-card">
        {/* Animated Background Glow */}
        <div className="card-glow-bg"></div>

        {/* Header */}
        <div className="emergency-card-header">
          <div className="card-logo">
            <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.4)' }} />
            <span className="logo-text">Parkéé City</span>
          </div>
          <p className="card-subtitle">
             {isDiamond ? "💎 Diamond Protection" : isGold ? "🌟 Gold Protection" : "24/7 Roadside Assistance"}
          </p>
        </div>

        {/* QR Section */}
        <div className="card-body">
          <div className="card-qr-glow-ring">
            <div className="card-qr-wrapper">
              {qrUrl ? (
                <img src={qrUrl} alt="Vehicle QR Code" className="card-qr-img" />
              ) : (
                <div style={{width:'180px', height:'180px', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc'}}>Generating...</div>
              )}
            </div>
          </div>
          
          <div className="scan-for-help">
            <Smartphone className="scan-icon" size={20} />
            <span className="scan-text">SCAN FOR INSTANT HELP</span>
          </div>

          <div className="card-badges">
            <div className="card-badge road-assist">
              <span className="badge-icon">📍</span> Live GPS Tracking
            </div>
            <div className="card-badge engine-repair">
              <span className="badge-icon">🛡️</span> Privacy Calling
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="card-divider"></div>

        {/* Footer Info */}
        <div className="card-footer-info">
          <p className="helpline">
            Helpline: <strong>7895039922</strong> | SOS: <strong>112</strong>
          </p>
          <p className="instruction">Stick on dashboard or windshield for quick emergency access</p>
        </div>

        {/* Bottom Banner */}
        <div className="emergency-banner">
          <AlertTriangle size={16} />
          <span>IN EMERGENCY — SCAN QR IMMEDIATELY</span>
        </div>
      </div>
    </div>
  );
});

EmergencyCard.displayName = 'EmergencyCard';

export default EmergencyCard;
