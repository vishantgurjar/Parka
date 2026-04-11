import React from 'react';

const EmergencyCard = React.forwardRef(({ user, qrUrl }, ref) => {
  if (!user) return null;

  // Dynamic helper for owner name display
  // Using split/pop to get the last name/surname as shown in the mockup "PANWAR"
  const ownerName = user.name || 'VEHICLE OWNER';
  const nameParts = ownerName.trim().split(' ');
  const displayName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ownerName;

  return (
    <div className="emergency-card-container" ref={ref} style={{ padding: '0' }}>
      <div className="qr-card-v2">
        {/* Left Sidebar: Red bar with rotated text */}
        <div className="qr-sidebar-v2">
           <span>EMERGENCY</span>
        </div>

        {/* Right Content Area */}
        <div className="qr-content-v2">
          {/* Top Row: Logo and Branding + Silver Chip */}
          <div className="qr-header-v2">
            <div className="qr-brand-v2">
               <img src="/logo.png" alt="Logo" />
               <span>PARKÉÉ CITY</span>
            </div>
            <div className="qr-chip-v2"></div>
          </div>

          {/* Middle Row: Primary ID (The Surname/Name matching PANWAR in mockup) */}
          <div style={{ margin: '20px 0' }}>
            <span className="qr-label-v2">SMART VEHICLE ID</span>
            <span className="qr-value-v2" style={{ fontSize: '1.75rem' }}>{displayName}</span>
          </div>

          {/* Bottom Row: Helpline, Plate and QR Code */}
          <div className="qr-footer-v2">
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '20px' }}>
                <span className="qr-label-v2">EMERGENCY HELPLINE</span>
                <span className="qr-helpline-v2">+91 78950 39922</span>
              </div>
              
              <div style={{ display: 'flex', gap: '40px' }}>
                <div>
                   <span className="qr-label-v2">VEHICLE PLATE</span>
                   <span className="qr-value-v2" style={{ fontSize: '1.1rem' }}>{user.plateNumber || 'HAWJQIO'}</span>
                </div>
                <div>
                   <span className="qr-label-v2">ACCESS</span>
                   <span className="qr-value-v2" style={{ fontSize: '1.1rem', color: '#64748b' }}>24/7 Global</span>
                </div>
              </div>
            </div>

            {/* QR Code Container with "SCAN FOR HELP" label */}
            <div className="qr-frame-v2">
              {qrUrl ? (
                <img src={qrUrl} alt="QR Code" />
              ) : (
                <div style={{ width: '140px', height: '140px', background: '#e2e8f0', borderRadius: '4px' }}></div>
              )}
              <div className="qr-scan-text-v2">SCAN FOR HELP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

EmergencyCard.displayName = 'EmergencyCard';

export default EmergencyCard;
