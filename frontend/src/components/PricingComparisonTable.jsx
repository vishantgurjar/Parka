import React from 'react';
import { Check, X, Shield, Sparkles, Award, Zap, ArrowRight, HelpCircle } from 'lucide-react';

export default function PricingComparisonTable({ onOpenPayment }) {
  const plans = [
    {
      id: 'silver',
      name: 'Silver Security',
      badge: 'Starter Protection',
      price: '₹299',
      period: 'per year',
      highlight: false,
      color: '#94a3b8',
      features: {
        smartTag: '1 Digital Encrypted QR Tag',
        maskedCalling: 'Unlimited Masked Calls',
        whatsAppAlerts: 'Instant WhatsApp & SMS',
        highwaySOS: 'Standard SOS Dispatch (Pay per callout)',
        aiSoundDoctor: '5 Diagnostics / Month',
        towingDiscount: '10% Towing Discount',
        pwaApp: 'Full PWA App Access',
        freePhysicalSticker: '₹99 Shipping',
        prioritySupport: 'Standard Email & Ticket'
      }
    },
    {
      id: 'gold',
      name: 'Gold Highway Guard',
      badge: '🔥 MOST POPULAR',
      price: '₹599',
      period: 'per year',
      highlight: true,
      color: '#f59e0b',
      features: {
        smartTag: '1 Premium Metallic Smart Tag',
        maskedCalling: 'Unlimited Masked Calls',
        whatsAppAlerts: 'Instant WhatsApp & SMS + Map',
        highwaySOS: '1 Free Emergency Callout / Year',
        aiSoundDoctor: 'Unlimited AI Diagnostics',
        towingDiscount: '30% Towing Discount',
        pwaApp: 'Full PWA App Access + Offline',
        freePhysicalSticker: 'FREE Home Delivery Included',
        prioritySupport: '24/7 Priority WhatsApp Support'
      }
    },
    {
      id: 'diamond',
      name: 'Diamond Ultimate VIP',
      badge: '⭐ COMPLETE PEACE OF MIND',
      price: '₹999',
      period: 'per year',
      highlight: false,
      color: '#38bdf8',
      features: {
        smartTag: '2 Multi-Vehicle Smart QR Tags',
        maskedCalling: 'Unlimited Masked Calls',
        whatsAppAlerts: 'Instant WhatsApp & SMS + Dash Log',
        highwaySOS: 'Unlimited Priority Highway SOS',
        aiSoundDoctor: 'Unlimited AI Diagnostics + Live Tech',
        towingDiscount: 'FREE First Towing (upto 25 km)',
        pwaApp: 'VIP App Access + Family Sharing',
        freePhysicalSticker: 'FREE Express Home Delivery',
        prioritySupport: 'Dedicated Relationship Manager (24/7)'
      }
    }
  ];

  const featureRows = [
    { key: 'smartTag', label: 'Encrypted Smart Tag' },
    { key: 'maskedCalling', label: 'Masked VoIP Privacy Calling' },
    { key: 'whatsAppAlerts', label: 'WhatsApp & SMS Instant Alerts' },
    { key: 'highwaySOS', label: 'Highway Emergency Roadside SOS' },
    { key: 'aiSoundDoctor', label: 'AI Engine Sound Diagnostics' },
    { key: 'towingDiscount', label: 'Towing & Recovery Discount' },
    { key: 'freePhysicalSticker', label: 'Physical Metallic Sticker Delivery' },
    { key: 'prioritySupport', label: 'Support & Assistance Level' }
  ];

  const handleSelectPlan = (plan) => {
    if (onOpenPayment) {
      const amountNum = parseInt(plan.price.replace(/\D/g, ''), 10);
      onOpenPayment(plan.name, amountNum, { tier: plan.id });
    }
  };

  return (
    <section className="reveal" style={{ margin: '4rem 0 3rem' }} id="pricing-matrix">
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '6px 16px',
            borderRadius: '100px',
            color: '#f59e0b',
            fontSize: '0.85rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <Award size={16} />
            TRANSPARENT VALUE COMPARISON
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#fff', marginBottom: '0.75rem' }}>
            Choose the Protection <span className="text-gradient">Your Vehicle Deserves</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Zero hidden fees. 100% money-back guarantee within 7 days if not satisfied.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}>
          {plans.map((p) => (
            <div
              key={p.id}
              className="glass-premium"
              style={{
                padding: '2.25rem 2rem',
                borderRadius: '24px',
                border: p.highlight ? `2px solid ${p.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                background: p.highlight 
                  ? `linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(3, 7, 18, 0.9) 100%)` 
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(3, 7, 18, 0.6) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: p.highlight ? `0 20px 45px rgba(245, 158, 11, 0.2)` : 'none'
              }}
            >
              {p.highlight && (
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#000',
                  fontWeight: '900',
                  fontSize: '0.75rem',
                  padding: '4px 16px',
                  borderRadius: '50px',
                  letterSpacing: '1px',
                  boxShadow: '0 5px 15px rgba(245, 158, 11, 0.4)'
                }}>
                  {p.badge}
                </div>
              )}

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: p.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  {p.badge}
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem' }}>
                  {p.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '1.25rem 0' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff' }}>{p.price}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>/{p.period}</span>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '1.5rem 0 1.25rem' }}></div>

                {/* Feature breakdown list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {featureRows.map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ background: `${p.color}20`, borderRadius: '50%', padding: '3px', marginTop: '2px', flexShrink: 0 }}>
                        <Check size={14} color={p.color} />
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--muted)', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase' }}>{row.label}</span>
                        <strong style={{ color: '#fff' }}>{p.features[row.key]}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(p)}
                className="btn-gradient light-sweep"
                style={{
                  width: '100%',
                  marginTop: '2rem',
                  padding: '14px',
                  borderRadius: '14px',
                  fontWeight: '900',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: p.highlight ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--gradient-primary)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Activate {p.name.split(' ')[0]}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
