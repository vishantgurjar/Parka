import { Wrench, PhoneCall, CheckCircle, Smartphone, Printer, Send, ShieldCheck, MapPin, AlertTriangle, Download } from 'lucide-react';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';

export default function Home({ onOpenPayment }) {
  const { user } = useContext(AuthContext);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (user) {
      // VCard format to instantly load contact info and dialer when scanned
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\nTEL:${user.phone || ''}\nEND:VCARD`;
      const base = 'https://api.qrserver.com/v1/create-qr-code/';
      setQrUrl(`${base}?size=250x250&data=${encodeURIComponent(vcard)}&color=0d9488&bgcolor=ffffff`);
    } else {
      setQrUrl('');
    }
  }, [user]);

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
            Smart Parking Solutions
          </div>
          <h1 className="hero-title">
            Smart Parking for <span className="text-gradient">Modern Cities</span>
          </h1>
          <p className="hero-desc">
            Find, reserve, and access parking spots instantly with our revolutionary QR-based smart parking system. No more circling around looking for parking!
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
            <div className="section-header">
              <h2 className="section-title">Your Vehicle QR Code</h2>
              <p className="section-desc">Print this QR code and place it on your dashboard. Anyone can scan it to call you if your vehicle needs to be moved.</p>
            </div>
            <div className="qr-card">
              <div className="qr-icon-wrap">
                <Smartphone size={28} />
              </div>
              <h3>{user.name}'s Vehicle</h3>
              <p className="qr-subtitle">Scan to Contact Owner</p>
              <div className="qr-tags">
                <span className="qr-tag tag-primary">📍 Parking Assistance</span>
              </div>
              <div className="qr-image-wrap">
                {qrUrl && <img src={qrUrl} alt="Vehicle QR Code" width="192" height="192" />}
              </div>
              <p className="qr-scan-text">Scan with any phone camera to call {user.phone}</p>
              <div className="qr-actions">
                <a href={qrUrl} download="Vehicle-QR.png" target="_blank" rel="noreferrer" className="btn-outline-primary" style={{textDecoration: 'none'}}>
                  <Download size={16} />
                  Download QR
                </a>
                <button className="btn-secondary" onClick={() => window.print()}>
                  <Printer size={16} />
                  Print for Car
                </button>
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
