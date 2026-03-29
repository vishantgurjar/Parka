import React from 'react';
import { ShieldCheck, User, Phone, Car } from 'lucide-react';

const CustomerCard = React.forwardRef(({ user, qrUrl }, ref) => {
  if (!user) return null;

  return (
    <div className="customer-card-container" ref={ref}>
      <div className="customer-card">
        {/* Top Header */}
        <div className="card-top-header">
          <div className="brand-badge">
            <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
            <span className="brand-name">Parkéé City</span>
          </div>
          <div className="verification-badge">
            <ShieldCheck size={14} />
            <span>VERIFIED CUSTOMER</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-main-content">
          <div className="user-info-section">
            <div className="info-row">
              <User size={16} className="row-icon" />
              <div className="row-data">
                <span className="label">CUSTOMER NAME</span>
                <span className="value uppercase">{user.name}</span>
              </div>
            </div>
            
            <div className="info-row">
              <Phone size={16} className="row-icon" />
              <div className="row-data">
                <span className="label">CONTACT NUMBER</span>
                <span className="value">{user.phone || '+91 7895039922'}</span>
              </div>
            </div>

            <div className="info-row">
              <Car size={16} className="row-icon" />
              <div className="row-data">
                <span className="label">VEHICLE PLATE</span>
                <span className="value uppercase">{user.plateNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="qr-section-right">
            <div className="qr-container-box">
              {qrUrl && <img src={qrUrl} alt="Customer QR Code" className="customer-qr" />}
            </div>
            <span className="qr-caption">SCAN TO CONTACT</span>
          </div>
        </div>

        {/* Footer */}
        <div className="customer-card-footer">
          <div className="footer-glow"></div>
          <span className="secure-text">SECURED BY PARKÉÉ CITY SMART PARKING SYSTEMS</span>
        </div>
      </div>
    </div>
  );
});

CustomerCard.displayName = 'CustomerCard';

export default CustomerCard;
