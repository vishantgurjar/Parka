import React, { useEffect } from 'react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '80vh' }}>
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>Privacy Policy</h1>
      <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)',boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <p style={{ marginBottom: '1rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
        <p style={{ marginBottom: '1rem' }}>
          Parké City ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Parké City.
        </p>
        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Information We Collect</h3>
        <p style={{ marginBottom: '1rem' }}>
          We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey, or fill out a form. This includes your name, email address, phone number, and vehicle information.
        </p>
        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>How We Use Your Information</h3>
        <p style={{ marginBottom: '1rem' }}>
          The information we collect from you may be used to personalize your experience, improve our website, improve customer service, process transactions, or send periodic emails and SMS regarding emergency services.
        </p>
        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Contact Us</h3>
        <p>
          If you have any questions about this Privacy Policy, please contact us.
        </p>
      </div>
    </div>
  );
}
