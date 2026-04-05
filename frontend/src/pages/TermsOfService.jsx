import React, { useEffect } from 'react';
import SEO from '../components/SEO';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '80vh' }}>
      <SEO 
        title="Terms of Service - Parkéé City"
        description="Read the terms and conditions for using Parkéé City's smart vehicle protection and emergency services."
      />
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>Terms of Service</h1>
      <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)',boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <p style={{ marginBottom: '1rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
        <p style={{ marginBottom: '1rem' }}>
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Parké City website and services operated by us.
        </p>
        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Conditions of Use</h3>
        <p style={{ marginBottom: '1rem' }}>
          By accessing this website, you agree to be bound by these website Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
        </p>
        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Service Modification</h3>
        <p style={{ marginBottom: '1rem' }}>
          We reserve the right to withdraw or amend our service, and any service or material we provide via the website, in our sole discretion without notice. We will not be liable if for any reason all or any part of the service is unavailable at any time or for any period.
        </p>
        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Governing Law</h3>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </p>
      </div>
    </div>
  );
}
