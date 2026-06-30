import React, { useState, useEffect } from 'react';
import { Shield, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import SEO from '../components/SEO';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setActiveAccordion(prev => (prev === index ? null : index));
  };

  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information required to operate our secure vehicle notification and response services. This includes: \n\n• Account Identifiers: Your name, email address, phone number, and password hash.\n• Vehicle Records: License plate number, make, model, year, and primary color, which are associated with your smart QR decal.\n• QR Mapping: Serial code keys printed on physical decals bound to your user profile.\n• Device Info: Push notification keys, operating system version, and IP addresses used to login."
    },
    {
      title: "2. Real-Time Geolocation Tracking & SOS Systems",
      content: "Parxéé City requires location access to power our on-road safety systems:\n\n• Mechanic Dispatching: When you trigger a roadside emergency SOS, we log your vehicle's current GPS coordinates to search, match, and route the closest mechanics to your breakdown scene.\n• Sentinel Cam Mode: When driving in Cam Mode, acceleration and impact sensors run locally. If an impact is registered, coordinates are transmitted to our cloud servers to log the accident location and notify rescuers. Your location is not tracked when Sentinel Cam Mode or SOS is offline."
    },
    {
      title: "3. Masked Call & Contact Privacy Protocol",
      content: "To guarantee user data safety, Parxéé City utilizes contact-masking software. When a bystander scans your QR decal to notify you about a vehicle blockage or double parking, their communication request is routed through our encrypted call-masking system. We bridge voice calls and SMS alerts dynamically. Neither your phone number nor the caller's phone number is exposed during this process. Call audio logs and contact numbers are not stored on our databases."
    },
    {
      title: "4. Third-Party Integrations & Data Sharing",
      content: "We do not sell or trade your personal data. We share details only with essential service partners under strict confidentiality agreements:\n\n• Roadside Mechanics: Verified independent mechanics receive your vehicle description, contact phone bridge, and location map pins ONLY during active SOS dispatches.\n• Payment Services: Transaction metadata is routed securely through PCI-compliant gateways (Razorpay/UPI bridges). We do not store card numbers or net-banking credentials.\n• Communication Bridges: Masked calls and text messages are routed via global telecom cloud APIs (such as Twilio/Vonage)."
    },
    {
      title: "5. Cookies & Tracking Technologies",
      content: "We utilize light browser cookies and local storage tokens to preserve your login session, remember UI theme preferences (dark/light mode settings), and run analytical dashboards. You can customize cookie blocks in your browser settings, though doing so might disrupt session state persistence."
    },
    {
      title: "6. Data Retention & Deletion Rights",
      content: "We retain account registration records for as long as your profile remains active. You possess complete rights to view, update, or remove your data. To request permanent deletion of your account, vehicle mappings, and historical cloud recordings, submit a support ticket via support@parxeecity.com. Deletion requests are processed completely within 48 hours."
    }
  ];

  return (
    <div className="privacy-policy-page" style={{ background: '#030712', minHeight: '100vh', color: '#fff', paddingTop: '100px', paddingBottom: '60px' }}>
      <SEO 
        title="Privacy Policy - Parxéé City"
        description="Learn how Parxéé City protects your personal coordinates, masked calls, and vehicle information. Our absolute commitment to your digital safety."
      />

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', background: 'rgba(94, 234, 212, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
            <Lock size={16} />
            Data Safeguard
          </div>
          <h1 style={{ fontSize: window.innerWidth < 768 ? '2.5rem' : '3.5rem', fontWeight: '900', letterSpacing: '-1.5px', margin: '0 0 15px 0' }}>
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Learn how we secure your telemetry and identity.
          </p>
        </header>

        {/* Highlight Alert */}
        <div className="glass" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.15)', background: 'linear-gradient(135deg, rgba(56,189,248,0.01) 0%, rgba(56,189,248,0.05) 100%)', marginBottom: '2.5rem' }}>
          <div style={{ color: '#38bdf8', flexShrink: 0 }}>
            <Shield size={32} />
          </div>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
            <strong>Privacy First Architecture:</strong> We never log your personal phone number on public QR landing pages. Scans establish masked connections only.
          </p>
        </div>

        {/* Accordions */}
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
                {/* Header */}
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

                {/* Content */}
                {isOpen && (
                  <div 
                    style={{ 
                      padding: '0 1.5rem 1.5rem 1.5rem', 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '0.95rem', 
                      lineHeight: '1.7',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    <p style={{ marginTop: '1rem' }}>{section.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact support details */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          <p>
            Have security compliance questions or requests? Write to our Data Protection Officer at <a href="mailto:privacy@parxeecity.com" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>privacy@parxeecity.com</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
