import React, { useState } from 'react';
import { AlertTriangle, MapPin, Radio, ShieldCheck, PhoneCall, Navigation, Clock, CheckCircle2, ChevronRight, Zap, Shield } from 'lucide-react';

export default function SOSWorkflowExplainer() {
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      step: '01',
      title: '1-Tap Emergency Trigger',
      subtitle: 'GPS Triangulation within 3 Meters',
      desc: 'When you tap Highway SOS, the system automatically captures your precise satellite GPS coordinates and sends an urgent distress signal.',
      detailBadge: 'Instant GPS Lock',
      actionPrompt: 'Satellite coordinates captured automatically',
      icon: MapPin,
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.15)'
    },
    {
      step: '02',
      title: 'Automated Patrol Dispatch',
      subtitle: 'Nearest 3 Verified Mechanics Alerted',
      desc: 'Our central server matches your vehicle model and exact highway location with the 3 closest certified roadside units within a 10 km radius.',
      detailBadge: '15-20 Min Avg SLA',
      actionPrompt: 'Nearest mechanic accepts within 45 seconds',
      icon: Radio,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)'
    },
    {
      step: '03',
      title: 'Masked Private Call Bridge',
      subtitle: '100% Number Masking & Ephemeral Channel',
      desc: 'You and the assigned mechanic are connected instantly via a secure private WebRTC voice bridge. Neither party sees the personal phone number.',
      detailBadge: 'Zero Phone Exposure',
      actionPrompt: 'Encrypted bridge connects in < 3 seconds',
      icon: PhoneCall,
      color: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.15)'
    },
    {
      step: '04',
      title: 'Live Technician Radar & Resolution',
      subtitle: 'Real-time GPS Tracking + Control Room Backup',
      desc: 'Track the mechanic vehicle moving toward you in real-time on the map widget. Parxéé 24x7 control room monitors the case until you are safely back on the road.',
      detailBadge: 'Full Live Tracking',
      actionPrompt: 'Case closed only after you confirm safety',
      icon: Navigation,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)'
    }
  ];

  return (
    <section className="reveal" style={{ margin: '4rem 0 3rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '6px 16px',
            borderRadius: '100px',
            color: '#ef4444',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <AlertTriangle size={16} />
            EMERGENCY TRANSPARENCY
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>
            What Happens When You Press <span style={{ color: '#ef4444' }}>SOS</span>?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            No guesswork. Here is the step-by-step automated workflow that protects you and your family during highway breakdowns and accidents.
          </p>
        </div>

        {/* Step Navigation Pills */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {workflowSteps.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                style={{
                  background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? `2px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.2rem 1rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: isSelected ? `0 10px 30px ${item.bgGlow}` : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: '900',
                    color: item.color,
                    letterSpacing: '1px'
                  }}>
                    STEP {item.step}
                  </span>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isSelected ? item.color : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={16} color={isSelected ? '#000' : '#9ca3af'} />
                  </div>
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                  lineHeight: '1.3'
                }}>
                  {item.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Detailed Visual Breakdown Card */}
        {workflowSteps[activeStep] && (
          <div className="glass-premium" style={{
            padding: '2.5rem 2rem',
            borderRadius: '24px',
            border: `1px solid ${workflowSteps[activeStep].color}50`,
            background: `linear-gradient(135deg, ${workflowSteps[activeStep].bgGlow} 0%, rgba(3, 7, 18, 0.8) 100%)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
            position: 'relative',
            boxShadow: `0 20px 40px ${workflowSteps[activeStep].bgGlow}`
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: `${workflowSteps[activeStep].color}20`,
                color: workflowSteps[activeStep].color,
                padding: '6px 14px',
                borderRadius: '50px',
                fontSize: '0.8rem',
                fontWeight: '800',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={16} />
                {workflowSteps[activeStep].detailBadge}
              </div>

              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem' }}>
                {workflowSteps[activeStep].title}
              </h3>

              <h4 style={{ fontSize: '1.05rem', color: workflowSteps[activeStep].color, fontWeight: '700', marginBottom: '1rem' }}>
                {workflowSteps[activeStep].subtitle}
              </h4>

              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {workflowSteps[activeStep].desc}
              </p>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(0,0,0,0.4)',
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.85rem',
                color: '#fff',
                fontWeight: '600'
              }}>
                <Zap size={16} color={workflowSteps[activeStep].color} />
                <span>{workflowSteps[activeStep].actionPrompt}</span>
              </div>
            </div>

            {/* Visual simulation graphics */}
            <div style={{
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '20px',
              padding: '1.75rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>
                  Live System Radar Preview
                </span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ● Active 24/7
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Shield size={20} color="var(--primary)" />
                  <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                    <strong>Privacy Protocol:</strong> Phone numbers 100% masked
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Clock size={20} color="#f59e0b" />
                  <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                    <strong>Average Response:</strong> 14 Mins on Highways
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Radio size={20} color="#38bdf8" />
                  <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                    <strong>Network:</strong> 2,850+ Verified Roadside Techs
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
