import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Cpu, Shield, ParkingSquare, Wrench, QrCode, Activity, BatteryCharging, Gauge } from 'lucide-react';

export default function LiveCommandGrid() {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState({
    speed: 120,
    battery: 88,
    range: 340
  });

  // Subtle live telemetry pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry({
        speed: Math.floor(115 + Math.random() * 10),
        battery: 88,
        range: Math.floor(335 + Math.random() * 8)
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const tiles = [
    {
      id: 'ev-hub',
      title: 'EV Station Locator',
      subtitle: 'Live Charger Slot Finder',
      icon: Zap,
      color: '#2dd4bf', // Neon Teal / Mint
      glow: 'rgba(45, 212, 191, 0.4)',
      borderGlow: 'rgba(45, 212, 191, 0.6)',
      tag: '⚡ FAST CHARGE',
      onClick: () => navigate('/ev-hub')
    },
    {
      id: 'ai-doctor',
      title: 'Instant AI Diagnosis',
      subtitle: 'Upload Audio / Photo Diagnostic',
      icon: Cpu,
      color: '#38bdf8', // Neon Cyan
      glow: 'rgba(56, 189, 248, 0.4)',
      borderGlow: 'rgba(56, 189, 248, 0.6)',
      tag: '🤖 NEURAL SCAN',
      onClick: () => navigate('/ai-doctor')
    },
    {
      id: 'cam-sentinel',
      title: 'Cam Sentinel',
      subtitle: 'Live Vehicle Inspection',
      icon: Shield,
      color: '#818cf8', // Electric Indigo/Blue
      glow: 'rgba(129, 140, 248, 0.4)',
      borderGlow: 'rgba(129, 140, 248, 0.6)',
      tag: '🛡️ LIVE LENS',
      onClick: () => navigate('/cam')
    },
    {
      id: 'host-space',
      title: 'Rent Parking Spot',
      subtitle: 'Host Space & Earn ₹',
      icon: ParkingSquare,
      color: '#10b981', // Emerald Green
      glow: 'rgba(16, 185, 129, 0.4)',
      borderGlow: 'rgba(16, 185, 129, 0.6)',
      tag: '🅿️ EARN DAILY',
      onClick: () => navigate('/host')
    },
    {
      id: 'roadside-rescue',
      title: 'Quick Roadside Rescue',
      subtitle: 'Nearest Mechanic in 15 mins',
      icon: Wrench,
      color: '#f59e0b', // Amber Gold
      glow: 'rgba(245, 158, 11, 0.4)',
      borderGlow: 'rgba(245, 158, 11, 0.6)',
      tag: '🔧 24/7 ACTIVE',
      onClick: () => navigate('/mechanics')
    },
    {
      id: 'qr-shield',
      title: 'Smart QR Shield',
      subtitle: 'Virtual Windshield Tag',
      icon: QrCode,
      color: '#c084fc', // Cyber Purple
      glow: 'rgba(192, 132, 252, 0.4)',
      borderGlow: 'rgba(192, 132, 252, 0.6)',
      tag: '🪪 100% PRIVATE',
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
    <div className="live-command-grid-section reveal active" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto 4rem' }}>
      
      {/* Telemetry Header Widget */}
      <div className="telemetry-deck glass">
        <div className="telemetry-gauge">
          <div className="gauge-icon"><Gauge size={18} color="#2dd4bf" /></div>
          <div className="gauge-info">
            <span className="gauge-val text-gradient">{telemetry.speed} <small>km/h</small></span>
            <span className="gauge-label">SPEED RADAR</span>
          </div>
        </div>

        <div className="telemetry-divider"></div>

        <div className="telemetry-gauge">
          <div className="gauge-icon"><BatteryCharging size={18} color="#10b981" /></div>
          <div className="gauge-info">
            <span className="gauge-val" style={{ color: '#10b981' }}>{telemetry.battery}% <small>OPTIMAL</small></span>
            <span className="gauge-label">POWER GRID</span>
          </div>
        </div>

        <div className="telemetry-divider"></div>

        <div className="telemetry-gauge">
          <div className="gauge-icon"><Activity size={18} color="#38bdf8" /></div>
          <div className="gauge-info">
            <span className="gauge-val" style={{ color: '#38bdf8' }}>{telemetry.range} <small>km</small></span>
            <span className="gauge-label">EST. RANGE</span>
          </div>
        </div>
      </div>

      {/* Grid Header Label */}
      <div className="command-grid-header">
        <div className="live-indicator">
          <span className="pulse-dot"></span>
          <span className="live-text">TELEMETRY ONLINE</span>
        </div>
        <h3 className="command-grid-title">LIVE VEHICLE COMMAND GRID</h3>
        <p className="command-grid-subtitle">Tap any core automotive module for instant access</p>
      </div>

      {/* 6 Neon 3D Glass Tiles */}
      <div className="command-tiles-grid">
        {tiles.map((tile) => {
          const IconComponent = tile.icon;
          return (
            <div
              key={tile.id}
              className="command-tile-card glass"
              onClick={tile.onClick}
              style={{
                '--tile-color': tile.color,
                '--tile-glow': tile.glow,
                '--tile-border-glow': tile.borderGlow,
              }}
            >
              <div className="tile-glow-backdrop"></div>
              
              <div className="tile-top-row">
                <span className="tile-badge">{tile.tag}</span>
                <div className="tile-icon-wrapper">
                  <IconComponent size={26} color={tile.color} style={{ filter: `drop-shadow(0 0 10px ${tile.color})` }} />
                </div>
              </div>

              <div className="tile-content">
                <h4 className="tile-title" style={{ color: tile.color }}>
                  {tile.title}
                </h4>
                <p className="tile-subtitle">{tile.subtitle}</p>
              </div>

              <div className="tile-action-arrow">
                <span>LAUNCH</span>
                <span className="arrow">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
