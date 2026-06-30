import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck, Mail, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../components/SEO';

export default function RefundPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setActiveAccordion(prev => (prev === index ? null : index));
  };

  const sections = [
    {
      title: "1. Smart QR Decal Hardware Orders",
      content: "All physical smart QR decals are manufactured custom to order. If your QR decal arrives damaged during shipping, shows print defects, or contains coding errors, we will dispatch a replacement sticker free of charge. You must report hardware damages within 48 hours of delivery at support@parxeecity.com with delivery photo proofs. Due to the custom nature of vehicle printing, refunds are not issued for decal orders once they are custom-coded and dispatched."
    },
    {
      title: "2. Subscription Tiers (Silver, Gold, Diamond)",
      content: "Subscription payments unlock pro features such as Sentinel Cam Mode cloud storage, secure phone masking calling bridges, and priority mechanic response dispatching. If you upgrade to a premium subscription plan, you may cancel it at any time. We offer a 7-day money-back guarantee on subscription upgrades if you have not triggered any SOS mechanics dispatch calls during that time. If a refund is requested after 7 days, your service will remain active until the end of the current billing cycle, and no further billing will occur."
    },
    {
      title: "3. Cancellation of SOS Mechanic Response Requests",
      content: "Once you launch an Emergency SOS request and a nearby mechanic accepts and departs for your location, a booking fee is reserved. If you resolve the issue independently or decide to cancel, you may cancel the dispatch. However, if the mechanic has already covered more than 2 kilometers towards your location, a minor mobilization fee may be charged to offset fuel costs, and the remainder of the booking fee will be returned to your wallet or original payment source."
    },
    {
      title: "4. Processing Timelines & Payment Gateways",
      content: "Approved refunds are processed back to the original method of payment (UPI, Credit/Debit Card, or Net Banking) within 5 to 7 business days. You will receive an automated SMS and email confirmation once our finance gateway initiates the refund. Bank processing times may vary based on your financial institution."
    },
    {
      title: "5. How to File a Dispute or Refund Claim",
      content: "To initiate a dispute, contact support@parxeecity.com. Please include: 1) Your registered mobile number, 2) Transaction reference ID, 3) Decal serial number (if applicable), and 4) A clear description of the issue. Our support team responds to all refund claims within 24 hours."
    }
  ];

  return (
    <div className="refund-policy-page" style={{ background: '#030712', minHeight: '100vh', color: '#fff', paddingTop: '100px', paddingBottom: '60px' }}>
      <SEO 
        title="Cancellation & Refunds - Parxéé City"
        description="Read Parxéé City's cancellation and refund guidelines regarding subscriptions, smart QR decal hardware, and mechanical response services."
      />

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', background: 'rgba(94, 234, 212, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
            <RefreshCw size={16} className="pulse-primary" />
            Policy Agreement
          </div>
          <h1 style={{ fontSize: window.innerWidth < 768 ? '2.5rem' : '3.5rem', fontWeight: '900', letterSpacing: '-1.5px', margin: '0 0 15px 0' }}>
            Cancellation & <span className="text-gradient">Refunds</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Transparent rules and timelines regarding subscriptions, smart QR decals, and emergency roadside dispatch bookings.
          </p>
        </header>

        {/* Highlight Card */}
        <div className="glass" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(94, 234, 212, 0.15)', background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.01) 0%, rgba(94, 234, 212, 0.05) 100%)', marginBottom: '2.5rem' }}>
          <div style={{ color: 'var(--primary)', flexShrink: 0 }}>
            <ShieldCheck size={32} />
          </div>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
            We guarantee quick processing on all valid refund requests. UPI and card transactions are handled via PCI-compliant payment bridges.
          </p>
        </div>

        {/* Accordion Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sections.map((section, idx) => {
            const isOpen = activeAccordion === idx;
            return (
              <div 
                key={idx} 
                className="glass" 
                style={{ 
                  borderRadius: '16px', 
                  border: isOpen ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.05)', 
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleAccordion(idx)}
                  style={{
                    width: '100%',
                    padding: '1.5rem',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', letterSpacing: '-0.2px' }}>{section.title}</span>
                  <div style={{ color: isOpen ? 'var(--primary)' : 'rgba(255,255,255,0.4)' }}>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Accordion Content */}
                {isOpen && (
                  <div 
                    style={{ 
                      padding: '0 1.5rem 1.5rem 1.5rem', 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '0.95rem', 
                      lineHeight: '1.7',
                      borderTop: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    <p style={{ marginTop: '1rem' }}>{section.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Support Notice */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          <p>
            Have more questions regarding billing policies? File an inquiry on our <a href="/contact" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Contact Page</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
