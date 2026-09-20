import React from 'react';
import { ShieldCheck, Clock, Users, Wrench, CheckCircle2, Award, Lock, Zap } from 'lucide-react';

export default function TrustProofStrip() {
  const stats = [
    {
      value: '18,400+',
      label: 'Vehicles Protected',
      subtext: 'Across 42+ Indian Cities',
      icon: Users,
      color: '#2dd4bf'
    },
    {
      value: '14 Mins',
      label: 'Avg Highway SOS Response',
      subtext: 'Real-time GPS Dispatch',
      icon: Clock,
      color: '#f59e0b'
    },
    {
      value: '2,850+',
      label: 'Verified Mechanics',
      subtext: 'Background Checked & Certified',
      icon: Wrench,
      color: '#38bdf8'
    },
    {
      value: '99.4%',
      label: 'SLA Resolution Rate',
      subtext: 'Zero Number Leakage',
      icon: ShieldCheck,
      color: '#10b981'
    }
  ];

  const badges = [
    { label: 'ISO 27001 Security Standard', icon: Lock },
    { label: 'Razorpay Verified Merchant', icon: Award },
    { label: '100% Number Masking Relay', icon: ShieldCheck },
    { label: '24x7 Control Room Backup', icon: Zap }
  ];

  return (
    <section className="reveal" style={{ margin: '3rem 0 2rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Main Stats Counter Bento */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="glass-premium"
                style={{
                  padding: '1.5rem',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.4) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, border-color 0.3s ease'
                }}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: `${stat.color}15`,
                  border: `1px solid ${stat.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={26} color={stat.color} />
                </div>
                <div>
                  <div style={{
                    fontSize: '1.85rem',
                    fontWeight: '900',
                    color: '#fff',
                    letterSpacing: '-0.5px',
                    lineHeight: '1.1'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: 'rgba(255,255,255,0.9)',
                    marginTop: '2px'
                  }}>
                    {stat.label}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--muted)',
                    marginTop: '2px'
                  }}>
                    {stat.subtext}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Verification Certification Badges Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '1rem 1.5rem',
          borderRadius: '16px',
          background: 'rgba(20, 184, 166, 0.04)',
          border: '1px solid rgba(20, 184, 166, 0.15)'
        }}>
          {badges.map((b, i) => {
            const BIcon = b.icon;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.85)'
                }}
              >
                <BIcon size={16} color="var(--primary)" />
                <span>{b.label}</span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
