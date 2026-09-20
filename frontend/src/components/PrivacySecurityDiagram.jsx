import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Lock, EyeOff, UserCheck, PhoneOff, Check, X } from 'lucide-react';

export default function PrivacySecurityDiagram() {
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
            <Lock size={16} />
            ZERO NUMBER LEAKAGE ARCHITECTURE
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>
            Why Never Put Your <span style={{ color: '#ef4444' }}>Real Phone Number</span> on Your Car
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            Paper slips and regular phone numbers expose your family's identity to thousands of strangers daily. Parxéé creates an impenetrable cryptographic shield.
          </p>
        </div>

        {/* Comparison Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          
          {/* Card 1: Old Dangerous Way */}
          <div className="glass-premium" style={{
            padding: '2.25rem 2rem',
            borderRadius: '24px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(3, 7, 18, 0.8) 100%)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={26} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ef4444' }}>The Old Risky Way</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>Writing Mobile Number on Paper Slip</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Phone number visible to 1000s of strangers, valet & stalkers',
                'Risk of unwanted nuisance calls, harassment & cyber-scams',
                'Numbers scraped by illegal data brokers & spam telemarketers',
                'Paper slips fade in rain, blow away, or tear easily',
                'Zero proof or location context during parking disputes'
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.2)', borderRadius: '50%', padding: '3px', marginTop: '2px', flexShrink: 0 }}>
                    <X size={14} color="#ef4444" />
                  </div>
                  <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.4' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: The Parxéé Encrypted Shield */}
          <div className="glass-premium" style={{
            padding: '2.25rem 2rem',
            borderRadius: '24px',
            border: '2px solid rgba(20, 184, 166, 0.6)',
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12) 0%, rgba(3, 7, 18, 0.9) 100%)',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(20, 184, 166, 0.15)'
          }}>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '20px',
              background: 'var(--gradient-primary)',
              color: '#000',
              fontWeight: '900',
              fontSize: '0.75rem',
              padding: '4px 12px',
              borderRadius: '50px',
              textTransform: 'uppercase'
            }}>
              100% PRIVATE
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(20, 184, 166, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={26} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>Parxéé Smart Tag</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', margin: 0 }}>AES-256 Masked Relay Shield</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Your actual mobile number is NEVER printed or exposed',
                'Dual-Bridge VoIP WebRTC Voice Calling (Neither caller sees phone)',
                'Instant 1-Click WhatsApp & SMS alerts with verified GPS coordinates',
                'UV-resistant, waterproof, durable metallic QR tag for life',
                'Passerby can contact you in 3 seconds without downloading any app'
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ background: 'rgba(20, 184, 166, 0.25)', borderRadius: '50%', padding: '3px', marginTop: '2px', flexShrink: 0 }}>
                    <Check size={14} color="var(--primary)" />
                  </div>
                  <span style={{ fontSize: '0.88rem', color: '#fff', fontWeight: '600', lineHeight: '1.4' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
