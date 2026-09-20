import React from 'react';
import { Moon, AlertOctagon, BatteryCharging, ShieldAlert, Key, Car, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RealUseCasesGrid() {
  const useCases = [
    {
      title: 'Midnight Highway Breakdown',
      subtitle: 'Stranded with Family in the Dark',
      desc: 'No local mechanic numbers? Tap Highway SOS to lock your GPS and dispatch the nearest verified patrol within 15 minutes.',
      icon: Moon,
      tag: 'CRITICAL EMERGENCY',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(3, 7, 18, 0.8) 100%)'
    },
    {
      title: 'Wrong Parking / Blocked Gate',
      subtitle: 'Zero Anger, 100% Privacy',
      desc: 'If your car is mistakenly blocking someone, they scan your Smart Tag and notify you politely on WhatsApp without knowing your personal phone number.',
      icon: AlertOctagon,
      tag: 'DAILY CONVENIENCE',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(3, 7, 18, 0.8) 100%)'
    },
    {
      title: '5-Minute Towing Crane Warning',
      subtitle: 'Avoid Heavy Fines & Car Scratches',
      desc: 'Get an instant urgent warning from traffic marshals or security guards before the towing crane hooks your vehicle.',
      icon: ShieldAlert,
      tag: 'MONEY SAVER',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(3, 7, 18, 0.8) 100%)'
    },
    {
      title: 'Dead Battery & Puncture Jumpstart',
      subtitle: 'Instant Roadside Tech on Site',
      desc: 'Left headlights on overnight? On-demand mobile battery booster and hydraulic tyre replacement dispatched right to your parking spot.',
      icon: BatteryCharging,
      tag: 'INSTANT ASSISTANCE',
      color: '#38bdf8',
      gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(3, 7, 18, 0.8) 100%)'
    }
  ];

  return (
    <section className="reveal" style={{ margin: '4rem 0 3rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(20, 184, 166, 0.12)',
            border: '1px solid rgba(20, 184, 166, 0.3)',
            padding: '6px 16px',
            borderRadius: '100px',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <Car size={16} />
            REAL-WORLD SCENARIOS
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>
            Built for Every Situation on <span className="text-gradient">Indian Roads</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            From crowded city parking slots to desolate national highways at 2 AM — Parxéé keeps you covered.
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.5rem'
        }}>
          {useCases.map((uc, idx) => {
            const Icon = uc.icon;
            return (
              <div
                key={idx}
                className="glass-premium"
                style={{
                  padding: '2rem 1.75rem',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: uc.gradient,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s ease, border-color 0.3s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: `${uc.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${uc.color}40`
                    }}>
                      <Icon size={24} color={uc.color} />
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      color: uc.color,
                      letterSpacing: '1px'
                    }}>
                      {uc.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
                    {uc.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: uc.color, marginBottom: '0.85rem' }}>
                    {uc.subtitle}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5' }}>
                    {uc.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
