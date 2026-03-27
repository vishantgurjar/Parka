import React, { useEffect } from 'react';

export default function HelpCenter() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '80vh' }}>
      <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>Help Center</h1>
      <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3>How can we help you today?</h3>
        <p style={{ marginTop: '1rem' }}>
          Welcome to the Parké City Help Center. Here you can find answers to our most commonly asked questions, instructions on using our services, and ways to contact our support team.
        </p>
        <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', lineHeight: '1.8' }}>
          <li><strong>Emergency Service:</strong> Call our 24/7 hotline at 789-503-9922.</li>
          <li><strong>Account Issues:</strong> Navigate to the login page and click 'Forgot Password' or contact support directly.</li>
          <li><strong>Payment Issues:</strong> Ensuring your UPI application is updated usually resolves most payment gateway timeouts.</li>
        </ul>
        <p style={{ marginTop: '1rem' }}>
          If you need further assistance, please fill out the contact form on our <a href="/#contact" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</a> page.
        </p>
      </div>
    </div>
  );
}
