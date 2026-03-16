import React from 'react';
import { Smartphone, Wrench, AlertTriangle } from 'lucide-react';

const EmergencyCard = React.forwardRef(({ user, qrUrl }, ref) => {
  if (!user) return null;

  return (
    <div className="emergency-card-container" ref={ref}>
      <div className="emergency-card">
        {/* Header */}
        <div className="emergency-card-header">
          <div className="card-logo">
            <span className="logo-box">P</span>
            <span className="logo-text">PARKE CITY</span>
          </div>
          <p className="card-subtitle">24/7 Roadside Assistance & Emergency Repair</p>
        </div>

        {/* QR Section */}
        <div className="card-body">
          <div className="card-qr-wrapper">
            {qrUrl && <img src={qrUrl} alt="Vehicle QR Code" className="card-qr-img" />}
          </div>
          
          <div className="scan-for-help">
            <span className="scan-icon">🧮</span>
            <span className="scan-text">SCAN FOR HELP</span>
          </div>

          <div className="card-badges">
            <div className="card-badge road-assist">
              <span className="badge-icon">🛣️</span>
              Road Assist
            </div>
            <div className="card-badge engine-repair">
              <span className="badge-icon">🔧</span>
              Engine Repair
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="card-divider"></div>

        {/* Footer Info */}
        <div className="card-footer-info">
          <p className="helpline">
            <strong>Helpline:</strong> 7895039922 | <strong>SOS:</strong> 112
          </p>
          <p className="instruction">Stick on dashboard or windshield for quick access</p>
        </div>

        {/* Bottom Banner */}
        <div className="emergency-banner">
          <AlertTriangle size={14} />
          <span>IN EMERGENCY — SCAN QR OR CALL 7895039922</span>
        </div>
      </div>
    </div>
  );
});

EmergencyCard.displayName = 'EmergencyCard';

export default EmergencyCard;
