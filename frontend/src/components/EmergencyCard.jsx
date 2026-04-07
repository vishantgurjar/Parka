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
      <div className={`electric-border ${isDiamond ? 'electric-border-diamond' : isGold ? 'electric-border-gold' : ''}`}>
        <div className="emergency-card glass-premium shimmer-shimmer">
          {/* Animated Background Highlights */}
          <div className="holograph-blur" style={{ top: '10%', left: '10%' }}></div>
          <div className="holograph-blur" style={{ bottom: '10%', right: '10%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)' }}></div>

          {/* Header */}
          <div className="emergency-card-header">
            <div className="card-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="card-logo">
                <img src="/logo.png" alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                <span className="logo-text" style={{ fontSize: '1.2rem' }}>Parkéé City</span>
              </div>
              <div className="card-chip"></div>
            </div>
            <p className="card-subtitle">
               {isDiamond ? "💎 DIAMOND PROTECTION" : isGold ? "🌟 GOLD PROTECTION" : "24/7 ROADSIDE ASSISTANCE"}
            </p>
          </div>

          {/* QR Section */}
          <div className="card-body" style={{ background: 'transparent' }}>
            <div className="card-qr-glow-ring" style={{ position: 'relative' }}>
              <div className="holo-halo"></div>
              <div className="card-qr-wrapper" style={{ background: 'white', borderRadius: '12px', padding: '10px', boxShadow: '0 0 20px rgba(0,0,0,0.2)' }}>
                {qrUrl ? (
                  <img src={qrUrl} alt="Vehicle QR Code" className="card-qr-img" style={{ width: '150px', height: '150px' }} />
                ) : (
                  <div style={{width:'150px', height:'150px', display:'flex', alignItems:'center', justifyContent:'center', color:'#666'}}>Generating...</div>
                )}
              </div>
            </div>
            
            <div className="scan-for-help" style={{ marginTop: '10px' }}>
              <Smartphone className="scan-icon" size={18} color={isDiamond ? '#c084fc' : isGold ? '#fbbf24' : '#38bdf8'} />
              <span className="scan-text" style={{ fontSize: '0.8rem', letterSpacing: '2px' }}>SCAN FOR INSTANT HELP</span>
            </div>

            <div className="card-badges" style={{ marginTop: '15px' }}>
              <div className="card-badge road-assist" style={{ fontSize: '0.7rem' }}>
                <span className="badge-icon">📍</span> LIVE GPS
              </div>
              <div className="card-badge engine-repair" style={{ fontSize: '0.7rem' }}>
                <span className="badge-icon">🛡️</span> PRIVACY CALL
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="card-footer-info" style={{ paddingTop: '10px' }}>
            <p className="helpline" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
              Helpline: <strong>7895039922</strong>
            </p>
            <p className="instruction" style={{ fontSize: '0.65rem', opacity: 0.7 }}>Stick on dashboard or windshield</p>
          </div>

          {/* Bottom Banner */}
          <div className="emergency-banner" style={{ fontSize: '0.7rem', padding: '8px' }}>
            <AlertTriangle size={14} />
            <span>EMERGENCY — SCAN QR IMMEDIATELY</span>
          </div>
        </div>
      </div>
    </div>
  );
});


EmergencyCard.displayName = 'EmergencyCard';

export default EmergencyCard;
