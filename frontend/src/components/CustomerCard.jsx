import React from 'react';
import { ShieldCheck, User, Phone, Car } from 'lucide-react';

const CustomerCard = React.forwardRef(({ user, qrUrl }, ref) => {
  if (!user) return null;

  const isDiamond = user.subscriptionTier === 'diamond';
  const isGold = user.subscriptionTier === 'gold';

  return (
    <div className="customer-card-container" ref={ref}>
      <div className={`electric-border ${isDiamond ? 'electric-border-diamond' : isGold ? 'electric-border-gold' : ''}`}>
        <div className="customer-card glass-premium">
          <div className="shimmer-shimmer"></div>
          {/* Top Header */}

          <div className="card-top-header" style={{ background: 'rgba(15, 23, 42, 0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="brand-badge">
              <img src="/logo.png" alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
              <span className="brand-name" style={{ fontSize: '1rem' }}>Parkéé City</span>
            </div>
            <div className="verification-badge" style={{ background: 'rgba(13, 148, 136, 0.2)', color: '#2dd4bf' }}>
              <ShieldCheck size={12} />
              <span>VERIFIED CUSTOMER</span>
            </div>
          </div>

          {/* Card Body */}
          <div className="card-main-content" style={{ padding: '20px', gap: '20px' }}>
            <div className="user-info-section">
              <div className="info-row" style={{ marginBottom: '12px' }}>
                <User size={14} className="row-icon" />
                <div className="row-data">
                  <span className="label">CUSTOMER NAME</span>
                  <span className="value uppercase" style={{ fontSize: '0.9rem', color: '#fff' }}>{user.name}</span>
                </div>
              </div>
              
              <div className="info-row" style={{ marginBottom: '12px' }}>
                <Car size={14} className="row-icon" />
                <div className="row-data">
                  <span className="label">VEHICLE PLATE</span>
                  <span className="value uppercase" style={{ fontSize: '0.9rem', color: '#fff' }}>{user.plateNumber || 'N/A'}</span>
                </div>
              </div>

              <div className="card-chip"></div>
            </div>

            <div className="qr-section-right" style={{ position: 'relative' }}>
              <div className="holo-halo" style={{ width: '120px', height: '120px' }}></div>
              <div className="qr-container-box" style={{ background: 'white', borderRadius: '10px', padding: '8px' }}>
                {qrUrl && <img src={qrUrl} alt="Customer QR Code" className="customer-qr" style={{ width: '90px', height: '90px' }} />}
              </div>
              <span className="qr-caption" style={{ fontSize: '0.6rem', marginTop: '6px' }}>SCAN TO CONTACT</span>
            </div>
          </div>

          {/* Footer */}
          <div className="customer-card-footer" style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="footer-glow"></div>
            <span className="secure-text" style={{ fontSize: '0.55rem', opacity: 0.6 }}>SECURED BY PARKÉÉ CITY SMART ID</span>
          </div>
        </div>
      </div>
    </div>
  );

});

CustomerCard.displayName = 'CustomerCard';

export default CustomerCard;
