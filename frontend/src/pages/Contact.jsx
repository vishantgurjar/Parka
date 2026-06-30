import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { toast } from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', category: 'General Inquiry', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API request delay
    await new Promise(r => setTimeout(r, 1200));
    console.log("Contact submission:", form);
    
    setIsSubmitting(false);
    setIsSuccess(true);
    toast.success("Message sent successfully!");
    setForm({ name: '', email: '', phone: '', category: 'General Inquiry', message: '' });
  };

  return (
    <div className="contact-page" style={{ background: '#030712', minHeight: '100vh', color: '#fff', paddingTop: '100px', paddingBottom: '60px' }}>
      <SEO 
        title="Contact Us - Parxéé City"
        description="Have questions or need emergency assistance? Get in touch with the Parxéé City support team 24/7."
      />

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: window.innerWidth < 768 ? '2.5rem' : '3.5rem', fontWeight: '900', letterSpacing: '-1.5px', margin: '0 0 15px 0' }}>
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Whether you are stranded on a highway, ordering custom QR decals, or exploring partnership channels, our team is active 24/7.
          </p>
        </header>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 992 ? '1fr' : '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
          
          {/* Left Column: Form */}
          <div className="glass" style={{ padding: window.innerWidth < 768 ? '1.5rem' : '3rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Send Us a Message</h3>
            
            {isSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ color: 'var(--primary)', display: 'inline-flex', marginBottom: '1rem' }}>
                  <CheckCircle2 size={56} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Message Dispatched!</h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Thank you for reaching out. A support coordinator will follow up via email or phone within 2 hours.
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="glass light-sweep"
                  style={{ padding: '10px 24px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="name" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Full Name <span style={{ color: 'var(--destructive)' }}>*</span></label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name" 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                {/* Email & Phone Row */}
                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label htmlFor="email" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Email Address <span style={{ color: 'var(--destructive)' }}>*</span></label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@example.com" 
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label htmlFor="phone" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX" 
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>
                </div>

                {/* Category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="category" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Reason for Contact</label>
                  <select 
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="SOS & Emergency Support">SOS & Emergency Support</option>
                    <option value="QR Decal Ordering">QR Decal Ordering</option>
                    <option value="Partnership / Mechanic Sign-up">Partnership / Mechanic Sign-up</option>
                    <option value="Billing / Refund Claim">Billing / Refund Claim</option>
                  </select>
                </div>

                {/* Message */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label htmlFor="message" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Message Details <span style={{ color: 'var(--destructive)' }}>*</span></label>
                  <textarea 
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us what you need assistance with..." 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'none', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-gradient pulse-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', borderRadius: '50px', background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)', color: '#030712', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Send Dispatch Message</span>
                      <Send size={18} />
                    </>
                  )}
                </button>

              </form>
            )}
          </div>

          {/* Right Column: Channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Card 1: SOS Line */}
            <div className="glass" style={{ padding: '1.8rem', borderRadius: '20px', border: '1px solid rgba(244, 63, 94, 0.2)', background: 'linear-gradient(135deg, rgba(244,63,94,0.02) 0%, rgba(244,63,94,0.07) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>24/7 SOS Helpline</h4>
                  <span style={{ fontSize: '0.8rem', color: '#f43f5e', fontWeight: '800', textTransform: 'uppercase' }}>Highway Emergency Only</span>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                Stranded or facing a vehicle emergency? Connect directly to our dispatch agents.
              </p>
              <a href="tel:9112200000" style={{ display: 'inline-flex', fontSize: '1.25rem', fontWeight: '800', color: '#f43f5e', textDecoration: 'none' }}>
                +91 91122 00000
              </a>
            </div>

            {/* Card 2: Email */}
            <div className="glass" style={{ padding: '1.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(94, 234, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Mail size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Email Support</h4>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Responses within 12 hours</span>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                For general support, custom business QR queries, and account upgrades.
              </p>
              <a href="mailto:support@parxeecity.com" style={{ display: 'inline-flex', fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)', textDecoration: 'none' }}>
                support@parxeecity.com
              </a>
            </div>

            {/* Card 3: WhatsApp Live */}
            <div className="glass" style={{ padding: '1.8rem', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'linear-gradient(135deg, rgba(16,185,129,0.02) 0%, rgba(16,185,129,0.07) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>WhatsApp Quick Help</h4>
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700', textTransform: 'uppercase' }}>Active Agent Chat</span>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                Quick questions about QR decaling setup, delivery, or registration.
              </p>
              <a href="https://wa.me/919112200000" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#10b981', color: '#030712', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '800', textDecoration: 'none' }}>
                Start WhatsApp Chat
              </a>
            </div>

            {/* Card 4: HQ */}
            <div className="glass" style={{ padding: '1.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Registered Office</h4>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>HQ Operations</span>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Parxéé City Tech Private Limited, <br />
                Netaji Subhash Place, Pitampura, <br />
                New Delhi, 110034, India.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
