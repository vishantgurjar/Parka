import React, { useEffect, useState } from 'react';
import { HelpCircle, PhoneCall, Mail, MessageSquare, ChevronDown, ShieldCheck, Zap, CreditCard } from 'lucide-react';
import SEO from '../components/SEO';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className={`glass-card ${isOpen ? 'active' : ''}`} style={{ marginBottom: '12px', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: `1px solid ${isOpen ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.05)'}` }}>
      <button 
        onClick={onClick}
        style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'inherit' }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '1rem', letterSpacing: '0.3px' }}>{question}</span>
        <ChevronDown size={20} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.4s', color: isOpen ? 'var(--primary)' : 'var(--muted)' }} />
      </button>
      <div style={{ maxHeight: isOpen ? '500px' : '0', overflow: 'hidden', transition: 'all 0.4s ease-in-out', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ padding: '0 24px 20px', color: 'var(--muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
          {answer}
        </div>
      </div>
    </div>
  );
};

export default function HelpCenter() {
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      icon: <Zap size={18} />,
      question: "How do I use the Emergency QR Card?",
      answer: "Your QR Card is your digital vehicle identity. Anyone can scan it to contact you instantly if your vehicle is blocking a path or in an emergency. They don't need your phone number—the system routes the alert through our secure server to protect your privacy."
    },
    {
      icon: <ShieldCheck size={18} />,
      question: "Is my privacy protected during calls?",
      answer: "Absolutely. With our PRO plans, we use WebRTC technology to mask your phone number. When someone contacts you via the QR scan, the call is routed through our platform, ensuring neither party ever sees the other's real contact number."
    },
    {
      icon: <CreditCard size={18} />,
      question: "How do I upgrade to Silver or Gold PRO?",
      answer: "Navigate to your Profile or the Pricing section on the Home page. Select a plan and pay securely via any UPI app. Your account will be upgraded instantly to 'PRO' status, unlocking exclusive features like Live Tracking and Secure Calling."
    },
    {
      icon: <HelpCircle size={18} />,
      question: "What should I do in a highway breakdown?",
      answer: "Use the 'Find Help Now' button on the Home page or go to the Mechanics section. You can broadcast a Live SOS, and nearby verified mechanics will bid to help you. You'll see their location, price, and ratings before you accept."
    }
  ];

  return (
    <div className="help-center-page" style={{ paddingTop: '120px', paddingBottom: '80px', background: 'var(--bg)', minHeight: '100vh' }}>
      <SEO 
        title="Help Center - Parkéé City"
        description="Get help with your Parkéé City account, subscriptions, and emergency services. Find contact information and support resources."
      />
      
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="hero-badge glass" style={{ color: 'var(--primary)', border: '1px solid var(--primary)', marginBottom: '1.5rem' }}>
            <HelpCircle size={16} /> SUPPORT RESOURCE
          </div>
          <h1 className="section-title">How can we <span className="text-gradient">help you?</span></h1>
          <p className="section-desc">Search our FAQs or get in touch with our 24/7 support team.</p>
        </div>

        {/* --- FAQ SECTION --- */}
        <div className="faq-section" style={{ marginBottom: '4rem' }}>
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>

        {/* --- CONTACT GRID --- */}
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <PhoneCall size={24} />
            </div>
            <h4 style={{ marginBottom: '8px' }}>24/7 SOS Line</h4>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Immediate technical or physical assistance.</p>
            <a href="tel:+917895039922" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem' }}>+91 78950 39922</a>
          </div>

          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Mail size={24} />
            </div>
            <h4 style={{ marginBottom: '8px' }}>Email Support</h4>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '16px' }}>For account, billing or partnership queries.</p>
            <a href="mailto:support@parkeecity.com" style={{ color: '#a855f7', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem' }}>support@parkee.city</a>
          </div>

          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <MessageSquare size={24} />
            </div>
            <h4 style={{ marginBottom: '8px' }}>Live Chat</h4>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Chat with our AI bot or support agents.</p>
            <span style={{ color: '#22c55e', fontWeight: 'bold', cursor: 'pointer' }}>Start Chatting</span>
          </div>
        </div>

        <div style={{ marginTop: '4rem', textAlign: 'center', padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Didn't find what you were looking for? Use the contact form on our <a href="/" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Home Page</a> and we'll get back to you within 2 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
