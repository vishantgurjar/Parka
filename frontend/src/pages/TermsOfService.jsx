import React, { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import SEO from '../components/SEO';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setActiveAccordion(prev => (prev === index ? null : index));
  };

  const sections = [
    {
      title: "1. Smart QR Decal Hardware & Account Ownership",
      content: "Upon receiving your physical smart QR decal, you must bind it to a verified vehicle profile. You agree to: \n\n• Maintain up-to-date and accurate vehicle registration markers (license plate, make, model).\n• Prevent misuse of the QR scanner page. Bystanders must scan only to relay genuine vehicle warnings.\n• Be responsible for keeping your profile password and API token key secure. Parxéé City is not responsible for unauthorized logins on your dashboard."
    },
    {
      title: "2. Subscription Tiers & Billing Rules",
      content: "Access to professional services (Silver, Gold, Diamond subscription tiers) is billed periodically (monthly/annually) based on your selected package. Payments are made through local UPI, net-banking, and debit/credit card interfaces. Upgrades apply instantly. Subscription cancellations stop future billing cycles, and services remain active until the end of the paid term."
    },
    {
      title: "3. Emergency Highway SOS & Mechanics Network",
      content: "Our roadside mechanics service matches stranded drivers with third-party mechanical responders nearby. While Parxéé City strictly verifies mechanical responders (requiring driver registration licenses and identity checks), we function as an dispatcher platform. We do not assume responsibility for physical damage, service delays, or repairs executed by independent mechanics on road segments."
    },
    {
      title: "4. Sentinel Cam Mode & Cloud Evidence Storage",
      content: "Sentinel Mode transforms your phone into an active black-box camera. The software processes impact events using built-in phone sensors. In the event of a crash, video proof is automatically secured and uploaded to our secure servers. You guarantee that: \n\n• You possess correct permissions to record video along public roadways.\n• You do not misuse storage bandwidth or upload corrupted payloads.\n• You acknowledge that sensor metrics depend on physical device calibrations."
    },
    {
      title: "5. Restrictions & Prohibited Activities",
      content: "You are prohibited from: \n\n• Bypassing our masked calling system to extract raw phone numbers of vehicle owners.\n• Reverse engineering the QR decal matching keys.\n• Sending false vehicle emergencies or spamming our mechanical network.\n• Attempting unauthorized SQL/NoSQL injections or backend API requests."
    },
    {
      title: "6. Limitation of Liability & Governing Law",
      content: "Parxéé City, its directors, and employees shall not be liable for any indirect, incidental, or special damages arising out of software offline status, mobile sensor failure, or mechanical road repairs. These terms are governed by and construed in accordance with the laws of India. Any legal actions or disputes shall be submitted exclusively to courts located in New Delhi, India."
    }
  ];

  return (
    <div className="terms-page" style={{ background: '#030712', minHeight: '100vh', color: '#fff', paddingTop: '100px', paddingBottom: '60px' }}>
      <SEO 
        title="Terms of Service - Parxéé City"
        description="Review Parxéé City's Terms & Conditions regarding smart QR decal mappings, subscriber rights, mechanic dispatches, and legal governing laws."
      />

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', background: 'rgba(94, 234, 212, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
            <FileText size={16} />
            User Terms
          </div>
          <h1 style={{ fontSize: window.innerWidth < 768 ? '2.5rem' : '3.5rem', fontWeight: '900', letterSpacing: '-1.5px', margin: '0 0 15px 0' }}>
            Terms & <span className="text-gradient">Conditions</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Last Revised: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Please read these terms carefully before mapping your QR decals.
          </p>
        </header>

        {/* Advisory Box */}
        <div className="glass" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(251, 146, 60, 0.15)', background: 'linear-gradient(135deg, rgba(251,146,60,0.01) 0%, rgba(251,146,60,0.05) 100%)', marginBottom: '2.5rem' }}>
          <div style={{ color: '#fb923c', flexShrink: 0 }}>
            <AlertTriangle size={32} />
          </div>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
            <strong>Agreement Notice:</strong> By scanning, ordering, or activating our smart QR services, you explicitly accept these binding terms and conditions.
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

        {/* Policy Contact */}
        <div style={{ textAlign: 'center', marginTop: '3.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          <p>
            Questions regarding terms and fair use policies? Contact legal coordinators at <a href="mailto:legal@parxeecity.com" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>legal@parxeecity.com</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
