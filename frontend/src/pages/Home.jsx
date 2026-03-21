import { Wrench, PhoneCall, CheckCircle, Smartphone, Printer, Send, ShieldCheck, MapPin, AlertTriangle, Download } from 'lucide-react';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App';
import EmergencyCard from '../components/EmergencyCard';
import CustomerCard from '../components/CustomerCard';
import { toPng } from 'html-to-image';

export default function Home({ onOpenPayment }) {
  const { user } = useContext(AuthContext);
  const [qrUrl, setQrUrl] = useState('');
  const [activeTab, setActiveTab] = useState('emergency'); // 'emergency' or 'customer'
  const cardRef = useRef(null);
  const customerRef = useRef(null);

  useEffect(() => {
    if (user) {
      // VCard format to instantly load contact info and dialer when scanned
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\nTEL:${user.phone || ''}\nEND:VCARD`;
      const base = 'https://api.qrserver.com/v1/create-qr-code/';
      // Use the teal color from the design
      setQrUrl(`${base}?size=300x300&data=${encodeURIComponent(vcard)}&color=0d9488&bgcolor=ffffff`);
    } else {
      setQrUrl('');
    }
  }, [user]);

  const handleDownload = async (type) => {
    const ref = type === 'emergency' ? cardRef : customerRef;
    if (ref.current === null) return;
    
    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `ParkeCity-${type === 'emergency' ? 'Emergency' : 'Customer'}-Card-${user.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };


  const handleContact = (e) => {
    e.preventDefault();
    alert('Thank you! We will get back to you soon. ✓');
    e.target.reset();
  };

  return (
    <>
      {/* ========== HERO ========== */}
      <section id="home" className="hero">
        <div className="hero-bg"></div>
        <div className="hero-glow hero-glow-1"></div>
        <div className="hero-glow hero-glow-2"></div>
        <div className="container hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            Smart Vehicle Protection
          </div>
          <h1 className="hero-title">
            Smart Solutions for <span className="text-gradient">Every Vehicle</span>
          </h1>
          <p className="hero-desc">
            Secure your vehicle with our advanced QR-based Emergency Cards. Get 24/7 roadside assistance, smarter parking, and instant contact access, all in one scan.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value text-gradient">500+</div>
              <div className="stat-label">Parking Spots</div>
            </div>
            <div className="stat">
              <div className="stat-value text-gradient">24/7</div>
              <div className="stat-label">Support</div>
            </div>
            <div className="stat">
              <div className="stat-value text-gradient">50K+</div>
              <div className="stat-label">Happy Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== EMERGENCY ========== */}
      <section id="emergency" className="emergency">
        <div className="emergency-bg"></div>
        <div className="hero-glow emergency-glow-1"></div>
        <div className="hero-glow emergency-glow-2"></div>
        <div className="container emergency-content">
          <div className="section-header">
            <div className="emergency-badge">
              <AlertTriangle size={16} />
              Emergency Highway Service
            </div>
            <h2 className="section-title">Emergency Car Engine Repair</h2>
            <p className="section-desc">Stranded on the highway? Our emergency repair team is just one call away. Professional mechanics available 24/7.</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon-wrap"><Wrench size={24} /></div>
              <h3>Engine Repair</h3>
              <p>Expert mechanics for all engine issues on the highway</p>
            </div>
            <div className="service-card">
              <div className="service-icon-wrap"><AlertTriangle size={24} /></div>
              <h3>Breakdown Assistance</h3>
              <p>Quick response for vehicle breakdowns anywhere</p>
            </div>
            <div className="service-card">
              <div className="service-icon-wrap"><CheckCircle size={24} /></div>
              <h3>24/7 Available</h3>
              <p>Round the clock emergency support on highways</p>
            </div>
            <div className="service-card">
              <div className="service-icon-wrap"><ShieldCheck size={24} /></div>
              <h3>Safe & Reliable</h3>
              <p>Trained professionals with verified credentials</p>
            </div>
          </div>
          <div className="emergency-cta-card">
            <div className="emergency-phone-icon">
              <PhoneCall size={32} />
            </div>
            <h3>Need Emergency Help?</h3>
            <p>Call our 24/7 emergency highway assistance hotline</p>
            <a href="tel:7895039922" className="emergency-call-btn" style={{ textDecoration: 'none' }}>
              <PhoneCall size={20} />
              789-503-9922
            </a>
            <div className="emergency-location">
              <MapPin size={16} />
              Service available on all major highways
            </div>
            
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Are you a highway mechanic?</p>
              <a href="/mechanic-register" className="btn-outline-primary" style={{ textDecoration: 'none', display: 'inline-flex', padding: '8px 16px', fontSize: '0.9rem' }}>
                <Wrench size={16} style={{ marginRight: '8px' }} />
                Join Our Partner Network
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section id="pricing" className="pricing">
        <div className="hero-glow pricing-glow"></div>
        <div className="container pricing-content">
          <div className="section-header">
            <div className="pricing-badge">
              ⭐ Choose Your Plan
            </div>
            <h2 className="section-title">Simple, Transparent <span className="text-gradient">Pricing</span></h2>
            <p className="section-desc">Subscribe to a plan that works for you. Cancel anytime. Pay securely via UPI.</p>
          </div>
          <div className="pricing-grid">
            {/* Monthly */}
            <div className="pricing-card">
              <div className="plan-header">
                <div className="plan-icon"><CheckCircle size={20} /></div>
                <div><h3>Monthly</h3></div>
              </div>
              <div className="plan-price"><span className="currency">₹</span><span className="amount">250</span></div>
              <span className="period">/month</span>
              <ul className="plan-features">
                <li><span className="check">✓</span> Perfect for quick visits</li>
                <li><span className="check">✓</span> No commitment required</li>
                <li><span className="check">✓</span> Pay as you go</li>
                <li><span className="check">✓</span> Basic support</li>
              </ul>
              <button className="plan-btn" onClick={() => onOpenPayment('Monthly', '250')}>Subscribe Now</button>
            </div>
            {/* Half Yearly (Featured) */}
            <div className="pricing-card featured">
              <div className="plan-badge">⭐ Most Popular</div>
              <div className="plan-header">
                <div className="plan-icon featured-icon"><ShieldCheck size={20} /></div>
                <div><h3>Half Yearly</h3><span className="savings">Save 70%</span></div>
              </div>
              <div className="plan-price"><span className="currency">₹</span><span className="amount">450</span></div>
              <span className="period">/6 months</span>
              <ul className="plan-features">
                <li><span className="check featured-check">✓</span> Best value for regular trips</li>
                <li><span className="check featured-check">✓</span> Up to 6 months coverage</li>
                <li><span className="check featured-check">✓</span> Priority access & support</li>
                <li><span className="check featured-check">✓</span> Save ₹1,050 vs monthly</li>
              </ul>
              <button className="plan-btn plan-btn-featured" onClick={() => onOpenPayment('Half Yearly', '450')}>Subscribe Now</button>
            </div>
            {/* Yearly */}
            <div className="pricing-card">
              <div className="plan-header">
                <div className="plan-icon"><ShieldCheck size={20} /></div>
                <div><h3>Yearly</h3><span className="savings">Save 67%</span></div>
              </div>
              <div className="plan-price"><span className="currency">₹</span><span className="amount">1,000</span></div>
              <span className="period">/year</span>
              <ul className="plan-features">
                <li><span className="check">✓</span> Unlimited access all year</li>
                <li><span className="check">✓</span> Reserved spot guarantee</li>
                <li><span className="check">✓</span> 24/7 premium support</li>
                <li><span className="check">✓</span> Save ₹2,000 vs monthly</li>
              </ul>
              <button className="plan-btn" onClick={() => onOpenPayment('Yearly', '1000')}>Subscribe Now</button>
            </div>
          </div>
          <p className="pricing-trust">
            <ShieldCheck size={16} />
            Secured by UPI · Cancel anytime · No hidden fees
          </p>
        </div>
      </section>

      {/* ========== QR SECTION ========== */}
      {user && (
        <section id="qr" className="qr-section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button 
                onClick={() => setActiveTab('emergency')} 
                className={activeTab === 'emergency' ? 'btn-gradient' : 'btn-secondary'}
                style={{ borderRadius: '12px', padding: '10px 24px', border: 'none' }}
              >
                Emergency Card
              </button>
              <button 
                onClick={() => setActiveTab('customer')} 
                className={activeTab === 'customer' ? 'btn-gradient' : 'btn-secondary'}
                style={{ borderRadius: '12px', padding: '10px 24px', border: 'none' }}
              >
                Customer Card
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              {activeTab === 'emergency' ? (
                <div style={{ transform: 'scale(1.1)', margin: '1rem 0' }}>
                  <EmergencyCard ref={cardRef} user={user} qrUrl={qrUrl} />
                </div>
              ) : (
                <div style={{ transform: 'scale(1)', margin: '1rem 0' }}>
                  <CustomerCard ref={customerRef} user={user} qrUrl={qrUrl} />
                </div>
              )}
              
              <div className="qr-actions" style={{ maxWidth: '450px', width: '100%' }}>
                <button onClick={() => handleDownload(activeTab)} className="btn-outline-primary" style={{ border: 'none', cursor: 'pointer' }}>
                  <Download size={16} />
                  Download {activeTab === 'emergency' ? 'Emergency Card' : 'Customer Card'}
                </button>
                <a href="tel:7895039922" className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <PhoneCall size={16} />
                  Direct Call
                </a>
              </div>
            </div>
            <div className="sos-section">
              <p>For emergencies, please continue to use national helplines:</p>
              <a href="tel:112" className="btn-sos" style={{textDecoration: 'none'}}>⚠️ SOS Emergency — 112</a>
            </div>
          </div>
        </section>
      )}

      {/* ========== CONTACT ========== */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Get in Touch</h2>
            <p className="section-desc">Have questions? We're here to help</p>
          </div>
          <form className="contact-form" onSubmit={handleContact}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="ABC XYZ" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="ABC@example.com" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea rows="5" placeholder="How can we help you?" required></textarea>
            </div>
            <button type="submit" className="btn-gradient full-width" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer'}}>
              <Send size={20} style={{marginRight: '8px'}} />
              Send Message
            </button>
          </form>
        </div>
      </section>

    </>
  );
}
