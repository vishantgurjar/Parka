import { useNavigate } from 'react-router-dom';
import { Zap, Cpu, Shield, ParkingSquare, Wrench, QrCode, ArrowRight } from 'lucide-react';

export default function LiveCommandGrid() {
  const navigate = useNavigate();

  const tiles = [
    {
      id: 'ev-hub',
      title: 'EV Station Locator',
      subtitle: 'Find live chargers, slot availability & fast DC hubs near you',
      icon: Zap,
      color: '#2dd4bf', // Neon Teal / Mint
      glow: 'rgba(45, 212, 191, 0.45)',
      borderGlow: 'rgba(45, 212, 191, 0.7)',
      tag: '⚡ FAST CHARGE',
      status: 'Live Radar',
      actionText: 'Find EV Chargers',
      onClick: () => navigate('/ev-hub')
    },
    {
      id: 'ai-doctor',
      title: 'Instant AI Diagnosis',
      subtitle: 'Upload engine sounds, dash lights or photos for Gemini AI diagnosis',
      icon: Cpu,
      color: '#38bdf8', // Neon Cyan
      glow: 'rgba(56, 189, 248, 0.45)',
      borderGlow: 'rgba(56, 189, 248, 0.7)',
      tag: '🤖 AI DOCTOR',
      status: 'Ready to Scan',
      actionText: 'Start AI Diagnosis',
      onClick: () => navigate('/ai-doctor')
    },
    {
      id: 'cam-sentinel',
      title: 'Cam Sentinel',
      subtitle: 'Multi-angle real-time visual inspection & scratch/dent detection',
      icon: Shield,
      color: '#818cf8', // Electric Indigo/Blue
      glow: 'rgba(129, 140, 248, 0.45)',
      borderGlow: 'rgba(129, 140, 248, 0.7)',
      tag: '🛡️ LIVE SCAN',
      status: 'Live Cam Active',
      actionText: 'Open Live Cam',
      onClick: () => navigate('/cam')
    },
    {
      id: 'host-space',
      title: 'Rent Parking Spot',
      subtitle: 'Host your vacant parking slot to earn ₹ or reserve safe spots',
      icon: ParkingSquare,
      color: '#10b981', // Emerald Green
      glow: 'rgba(16, 185, 129, 0.45)',
      borderGlow: 'rgba(16, 185, 129, 0.7)',
      tag: '🅿️ EARN DAILY',
      status: 'Instant Booking',
      actionText: 'Host / Find Space',
      onClick: () => navigate('/host')
    },
    {
      id: 'roadside-rescue',
      title: 'Quick Roadside Rescue',
      subtitle: 'Emergency towing, flat tyre, jumpstart & mechanic in 15 mins',
      icon: Wrench,
      color: '#f59e0b', // Amber Gold
      glow: 'rgba(245, 158, 11, 0.45)',
      borderGlow: 'rgba(245, 158, 11, 0.7)',
      tag: '🔧 24/7 SOS',
      status: 'Mechanics Online',
      actionText: 'Request SOS Rescue',
      onClick: () => navigate('/mechanics')
    },
    {
      id: 'qr-shield',
      title: 'Smart QR Shield',
      subtitle: 'Private windshield tag — get contacted without revealing phone number',
      icon: QrCode,
      color: '#c084fc', // Cyber Purple
      glow: 'rgba(192, 132, 252, 0.45)',
      borderGlow: 'rgba(192, 132, 252, 0.7)',
      tag: '🪪 100% PRIVATE',
      status: 'Ready to Order',
      actionText: 'Get Smart QR Tag',
      onClick: () => {
        const el = document.getElementById('qr') || document.getElementById('smart-tag');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          navigate('/pricing');
        }
      }
    }
  ];

  return (
    <div className="live-command-grid-section reveal active" style={{ width: '100%', maxWidth: '1120px', margin: '0 auto 4rem' }}>
      
      {/* Platform Value Proposition Banner (Explains What Parka Does) */}
      <div className="ecosystem-value-banner glass">
        <div className="eco-value-item">
          <div className="eco-icon-box" style={{ background: 'rgba(192, 132, 252, 0.12)', borderColor: 'rgba(192, 132, 252, 0.35)' }}>
            <QrCode size={20} color="#c084fc" />
          </div>
          <div className="eco-text-content">
            <div className="eco-item-header">
              <span className="eco-title">Smart QR Windshield Tag</span>
              <span className="eco-badge" style={{ color: '#c084fc' }}>100% PRIVATE</span>
            </div>
            <p className="eco-desc">Contact vehicle owners for wrong parking or emergency without sharing phone numbers.</p>
          </div>
        </div>

        <div className="eco-divider"></div>

        <div className="eco-value-item">
          <div className="eco-icon-box" style={{ background: 'rgba(45, 212, 191, 0.12)', borderColor: 'rgba(45, 212, 191, 0.35)' }}>
            <Zap size={20} color="#2dd4bf" />
          </div>
          <div className="eco-text-content">
            <div className="eco-item-header">
              <span className="eco-title">EV Charging & Parking</span>
              <span className="eco-badge" style={{ color: '#2dd4bf' }}>LIVE AVAILABILITY</span>
            </div>
            <p className="eco-desc">Find live EV slots, book parking spaces, or host your own empty spot to earn ₹ daily.</p>
          </div>
        </div>

        <div className="eco-divider"></div>

        <div className="eco-value-item">
          <div className="eco-icon-box" style={{ background: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.35)' }}>
            <Wrench size={20} color="#f59e0b" />
          </div>
          <div className="eco-text-content">
            <div className="eco-item-header">
              <span className="eco-title">24/7 SOS & AI Diagnostics</span>
              <span className="eco-badge" style={{ color: '#f59e0b' }}>15-MIN DISPATCH</span>
            </div>
            <p className="eco-desc">Instant roadside breakdown rescue + Gemini AI photo & audio engine diagnosis.</p>
          </div>
        </div>
      </div>

      {/* Grid Header Label */}
      <div className="command-grid-header">
        <div className="live-indicator">
          <span className="pulse-dot"></span>
          <span className="live-text">INTERACTIVE LIVE MODULES</span>
        </div>
        <h3 className="command-grid-title">DIRECT ACCESS COMMAND GRID</h3>
        <p className="command-grid-subtitle">
          Click any active tool below to launch and use it immediately
        </p>
      </div>

      {/* 6 Neon 3D Interactive Tiles */}
      <div className="command-tiles-grid">
        {tiles.map((tile) => {
          const IconComponent = tile.icon;
          return (
            <div
              key={tile.id}
              role="button"
              tabIndex={0}
              aria-label={`Open ${tile.title}`}
              className="command-tile-card glass"
              onClick={tile.onClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  tile.onClick();
                }
              }}
              style={{
                '--tile-color': tile.color,
                '--tile-glow': tile.glow,
                '--tile-border-glow': tile.borderGlow,
              }}
            >
              <div className="tile-glow-backdrop"></div>
              
              <div className="tile-top-row">
                <span className="tile-badge">{tile.tag}</span>
                <span className="tile-status-pill">
                  <span className="status-bullet"></span>
                  {tile.status}
                </span>
                <div className="tile-icon-wrapper">
                  <IconComponent size={24} color={tile.color} style={{ filter: `drop-shadow(0 0 10px ${tile.color})` }} />
                </div>
              </div>

              <div className="tile-content">
                <h4 className="tile-title" style={{ color: tile.color }}>
                  {tile.title}
                </h4>
                <p className="tile-subtitle">{tile.subtitle}</p>
              </div>

              {/* High-visibility Action Button */}
              <div className="tile-cta-container">
                <div className="tile-cta-btn">
                  <span>{tile.actionText}</span>
                  <ArrowRight size={16} className="tile-btn-arrow" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
