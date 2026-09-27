import React, { useContext } from 'react';
import { Check, ArrowRight, Award } from 'lucide-react';
import { AuthContext } from '../App';

export default function PricingComparisonTable({ onOpenPayment }) {
  const { user } = useContext(AuthContext);

  // Check if current user has an active, non-expired paid plan
  const hasActivePlan = (() => {
    if (!user) return false;
    // Owner / Admin bypass
    if (user.email === import.meta.env.VITE_ADMIN_EMAIL || user.role === 'admin') return true;
    if (!user.subscriptionTier || user.subscriptionTier.toLowerCase() === 'free') return false;
    
    // Check expiration date if present
    if (user.subscriptionExpiresAt) {
      const expiry = new Date(user.subscriptionExpiresAt).getTime();
      if (expiry < Date.now()) {
        return false; // Plan expired -> show pricing table to renew!
      }
    }
    
    return ['silver', 'gold', 'diamond', 'pro', 'gold pro'].includes(user.subscriptionTier.toLowerCase());
  })();

  // If user already has an active, non-expired plan, hide completely (gayab)
  if (hasActivePlan) {
    return null;
  }

  const plans = [
    {
      id: 'silver',
      name: 'Silver Security',
      badge: 'STARTER PROTECTION',
      trialBadge: '✨ 7-DAY FREE TRIAL',
      price: '199',
      period: 'month',
      highlight: false,
      color: '#38bdf8',
      buttonBg: 'var(--gradient-primary)',
      buttonColor: '#000',
      features: [
        { label: 'ENCRYPTED SMART TAG', value: '1 Digital Encrypted QR Tag' },
        { label: 'MASKED VOIP PRIVACY CALLING', value: 'Unlimited Masked Calls' },
        { label: 'WHATSAPP & SMS INSTANT ALERTS', value: 'Instant WhatsApp & SMS' },
        { label: 'HIGHWAY EMERGENCY ROADSIDE SOS', value: 'Standard SOS Dispatch (Pay per callout)' },
        { label: 'AI ENGINE SOUND DIAGNOSTICS', value: '5 Diagnostics / Month' },
        { label: 'TOWING & RECOVERY DISCOUNT', value: '10% Towing Discount' },
        { label: 'SMART DIGITAL PASS', value: 'Instant QR Activation & HQ Download' },
        { label: 'SUPPORT & ASSISTANCE LEVEL', value: 'Standard Email & Ticket' }
      ]
    },
    {
      id: 'gold',
      name: 'Gold Highway Guard',
      badge: '🔥 MOST POPULAR',
      trialBadge: '🔥 7-DAY FREE TRIAL',
      price: '399',
      period: '6 months',
      highlight: true,
      color: '#f59e0b',
      buttonBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      buttonColor: '#000',
      features: [
        { label: 'ENCRYPTED SMART TAG', value: 'Premium Encrypted Smart Tag' },
        { label: 'MASKED VOIP PRIVACY CALLING', value: 'Unlimited Masked Calls' },
        { label: 'WHATSAPP & SMS INSTANT ALERTS', value: 'Instant WhatsApp & SMS + Map' },
        { label: 'HIGHWAY EMERGENCY ROADSIDE SOS', value: '1 Free Emergency Callout / Period' },
        { label: 'AI ENGINE SOUND DIAGNOSTICS', value: 'Unlimited AI Diagnostics' },
        { label: 'TOWING & RECOVERY DISCOUNT', value: '30% Towing Discount' },
        { label: 'SMART DIGITAL PASS', value: 'Instant QR Activation & HQ Download' },
        { label: 'SUPPORT & ASSISTANCE LEVEL', value: '24/7 Priority WhatsApp Support' }
      ]
    },
    {
      id: 'diamond',
      name: 'Diamond Ultimate VIP',
      badge: '⭐ COMPLETE PEACE OF MIND',
      trialBadge: '⭐ 7-DAY FREE TRIAL',
      price: '599',
      period: 'year',
      highlight: false,
      color: '#38bdf8',
      buttonBg: 'var(--gradient-primary)',
      buttonColor: '#000',
      features: [
        { label: 'ENCRYPTED SMART TAG', value: '2 Multi-Vehicle Smart QR Tags' },
        { label: 'MASKED VOIP PRIVACY CALLING', value: 'Unlimited Masked Calls' },
        { label: 'WHATSAPP & SMS INSTANT ALERTS', value: 'Instant WhatsApp & SMS + Dash Log' },
        { label: 'HIGHWAY EMERGENCY ROADSIDE SOS', value: 'Unlimited Priority Highway SOS' },
        { label: 'AI ENGINE SOUND DIAGNOSTICS', value: 'Unlimited AI Diagnostics + Live Tech' },
        { label: 'TOWING & RECOVERY DISCOUNT', value: 'FREE First Towing (upto 25 km)' },
        { label: 'SMART DIGITAL PASS', value: 'Instant QR Activation & VIP Download' },
        { label: 'SUPPORT & ASSISTANCE LEVEL', value: 'Dedicated Relationship Manager (24/7)' }
      ]
    }
  ];

  const handleSelectPlan = (plan) => {
    if (onOpenPayment) {
      onOpenPayment({
        name: plan.name,
        price: plan.price,
        amount: plan.price,
        tier: plan.id,
        isTrial: true,
        trialDays: 7,
        recurringAmount: plan.price,
        period: plan.period
      });
    }
  };

  return (
    <section id="pricing" className="pricing reveal" style={{ padding: '6rem 0 4rem', position: 'relative' }}>
      <div className="mesh-bg" style={{ opacity: 0.05 }}>
        <div className="mesh-blob mesh-blob-3" style={{ top: 'auto', bottom: '0', left: '0' }}></div>
      </div>

      <div className="container" style={{ maxWidth: '1240px' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '6px 18px',
            borderRadius: '100px',
            color: '#10b981',
            fontSize: '0.8rem',
            fontWeight: '800',
            marginBottom: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <Award size={16} />
            7-DAY FREE TRIAL · ₹0 TODAY · AUTOPAY ENABLED
          </div>
          <h2 className="section-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: 'var(--tracking-tight)', marginBottom: '0.75rem' }}>
            Choose the Protection <span className="text-gradient">Your Vehicle Deserves</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Start with <strong style={{ color: '#10b981' }}>7 Days Free Access</strong>. AutoPay only charges after your trial completes. Cancel anytime with 1 click before day 7 without paying a single rupee!
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem',
          alignItems: 'stretch'
        }}>
          {plans.map((p) => (
            <div
              key={p.id}
              className="glass-premium"
              style={{
                padding: '2.5rem 2rem 2rem',
                borderRadius: '28px',
                border: p.highlight 
                  ? '2px solid #f59e0b' 
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: p.highlight 
                  ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(3, 7, 18, 0.95) 100%)' 
                  : 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(3, 7, 18, 0.85) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: p.highlight 
                  ? '0 25px 50px -12px rgba(245, 158, 11, 0.25), 0 0 35px rgba(245, 158, 11, 0.15)' 
                  : '0 20px 40px rgba(0,0,0,0.5)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              {/* Highlight Badge */}
              {p.highlight && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#000',
                  fontWeight: '900',
                  fontSize: '0.75rem',
                  padding: '5px 18px',
                  borderRadius: '50px',
                  letterSpacing: '1px',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                  whiteSpace: 'nowrap'
                }}>
                  {p.badge}
                </div>
              )}

              <div>
                {/* Header Tag */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: p.highlight ? '#f59e0b' : 'var(--primary)',
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase'
                  }}>
                    {p.badge}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    7-DAY TRIAL
                  </span>
                </div>

                <h3 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                  {p.name}
                </h3>

                {/* Price Display with Free Trial Callout */}
                <div style={{ margin: '1.25rem 0 0.5rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>₹</span>
                    <span style={{ fontSize: '3.2rem', fontWeight: '900', color: '#fff', lineHeight: '1', letterSpacing: '-1px' }}>{p.price}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }}>/{p.period}</span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>✓ ₹0 Today (7-Day Trial)</span>
                    <span style={{ color: 'var(--muted)', fontWeight: 'normal' }}>· AutoPay starts on Day 8</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '1.5rem 0' }}></div>

                {/* Detailed Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {p.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: p.highlight ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '2px',
                        flexShrink: 0
                      }}>
                        <Check size={12} color={p.highlight ? '#f59e0b' : '#38bdf8'} strokeWidth={3} />
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: '800', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {feat.label}
                        </div>
                        <div style={{ color: '#fff', fontWeight: '700', marginTop: '1px' }}>
                          {feat.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => handleSelectPlan(p)}
                  className="btn-gradient light-sweep"
                  style={{
                    width: '100%',
                    marginTop: '2rem',
                    padding: '16px',
                    borderRadius: '16px',
                    fontWeight: '900',
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    background: p.buttonBg,
                    color: p.buttonColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: p.highlight ? '0 10px 25px rgba(245, 158, 11, 0.35)' : '0 10px 25px rgba(20, 184, 166, 0.35)'
                  }}
                >
                  <span>Start 7-Day Free Trial</span>
                  <ArrowRight size={18} />
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)', marginTop: '8px', margin: '8px 0 0 0' }}>
                  ₹0 charged today · Cancel anytime in 1 click
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Reassurance guarantee footer */}
        <div style={{
          marginTop: '3.5rem',
          padding: '1.5rem 2rem',
          borderRadius: '20px',
          background: 'rgba(16, 185, 129, 0.04)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div>
            <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>🛡️ 100% Risk-Free 7-Day Trial</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Zero commitment, cancel anytime</span>
          </div>
          <div>
            <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>💳 Seamless UPI & Card AutoPay</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>RBI e-mandate compliant recurring setup</span>
          </div>
          <div>
            <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>⚡ Instant Account Activation</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Unlock all VIP features in seconds</span>
          </div>
        </div>

      </div>
    </section>
  );
}
