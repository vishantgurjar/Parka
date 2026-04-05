import React, { useEffect } from 'react';
import SEO from '../components/SEO';

export default function FAQ() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '80vh' }}>
      <SEO 
        title="FAQ - Parkéé City"
        description="Frequently asked questions about Parkéé City's smart parking solutions, emergency cards, and highway assistance services."
      />
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>Frequently Asked Questions</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)',boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>How do I download the Emergency Card?</h3>
          <p>Once registered and logged in, you can download your QR-coded Emergency Card directly from the Home page under the QR Section by clicking "Download Emergency Card".</p>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)',boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>What happens when someone scans the QR code?</h3>
          <p>Scanning the QR code on your vehicle will immediately prompt a VCard download or a contact screen on the scanner's phone, allowing them to contact you securely without exposing your phone number publicly across the windshield.</p>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)',boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Is there a refund policy?</h3>
          <p>We offer a secure UPI payment system. Please contact our support team through the Contact form for any payment-related disputes. Cancellations are instant.</p>
        </div>
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)',boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>How do mechanics join the network?</h3>
          <p>Mechanics can join our partner network by registering through the "Join Our Partner Network" link in the Emergency section. A successful payment profile is required for active listing.</p>
        </div>
      </div>
    </div>
  );
}
