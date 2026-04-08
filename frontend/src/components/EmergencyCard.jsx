import React from 'react';
import { Smartphone, AlertCircle, Shield } from 'lucide-react';

const EmergencyCard = React.forwardRef(({ user, qrUrl }, ref) => {
  if (!user) return null;

  const isDiamond = user.subscriptionTier === 'diamond';
  const isGold = user.subscriptionTier === 'gold';
  
  const vipClass = isDiamond ? 'minimal-card-vip-diamond' : (isGold ? 'minimal-card-vip-gold' : '');

  return (
    <div className="emergency-card-container" ref={ref} style={{ padding: '0' }}>
      <div className={`minimal-card ${vipClass}`} style={{ width: '450px', height: '260px', display: 'flex' }}>
        {/* Left Side: SOS Bar */}
        <div style={{ width: '50px', background: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
           <span style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontWeight: '900', fontSize: '1.5rem', letterSpacing: '4px' }}>EMERGENCY</span>
        </div>

        {/* Right Side: Content */}
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <img src="/logo.png" alt="Card Logo" style={{ width: '20px', height: '20px' }} />
                <span style={{ fontWeight: '800', fontSize: '1rem', color: '#111827' }}>PARKÉE CITY</span>
              </div>
              <span className="minimal-label">{isDiamond ? "Diamond Guard" : isGold ? "Gold Member" : "Smart Vehicle ID"}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#111827', textTransform: 'uppercase', display: 'block', marginTop: '2px' }}>
                {user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : user.name}
              </span>
            </div>
            <div className="minimal-chip"></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '16px' }}>
                <span className="minimal-label">Emergency Helpline</span>
                <span className="minimal-value" style={{ fontSize: '1.25rem', color: '#ef4444' }}>+91 78950 39922</span>
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                   <span className="minimal-label">Vehicle Plate</span>
                   <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#111827', textTransform: 'uppercase' }}>{user.plateNumber || 'HR-51-AA-0001'}</span>
                </div>
                <div>
                   <span className="minimal-label">Access</span>
                   <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>24/7 Global</span>
                </div>
              </div>
            </div>

            <div className="minimal-qr-frame">
              {qrUrl ? (
                <img src={qrUrl} alt="QR" style={{ width: '100px', height: '100px', display: 'block' }} />
              ) : (
                <div style={{ width: '100px', height: '100px', background: '#f3f4f6' }}></div>
              )}
              <div style={{ textAlign: 'center', fontSize: '0.55rem', fontWeight: '800', marginTop: '4px', letterSpacing: '1px' }}>SCAN FOR HELP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

EmergencyCard.displayName = 'EmergencyCard';

export default EmergencyCard;
