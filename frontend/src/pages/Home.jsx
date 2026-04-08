import { Wrench, PhoneCall, CheckCircle, Smartphone, Printer, Send, ShieldCheck, MapPin, AlertTriangle, Download } from 'lucide-react';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App';
import EmergencyCard from '../components/EmergencyCard';
import CustomerCard from '../components/CustomerCard';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import SEO from '../components/SEO';

export default function Home({ onOpenPayment }) {
  const { user, isPro } = useContext(AuthContext);
  
  // Point 6: Voice SOS
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    if ('WebkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
    }
  }, []);

  const startVoiceSOS = () => {
    if (!isPro()) return alert("Voice SOS is a PRO feature. Please upgrade to use it.");
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsVoiceListening(true);
    recognition.onend = () => setIsVoiceListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes("help me") || transcript.includes("parkee help")) {
        window.location.href = '/mechanics?sos=true';
      }
    };
    recognition.start();
  };
  const [qrUrl, setQrUrl] = useState('');
  const [activeTab, setActiveTab] = useState('emergency'); // 'emergency' or 'customer'
  const cardRef = useRef(null);
  const customerRef = useRef(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const baseUrl = window.location.origin;
    const qrApi = 'https://api.qrserver.com/v1/create-qr-code/';
    
    if (user) {
      const scanUrl = `${baseUrl}/v/${user._id}`;
      setQrUrl(`${qrApi}?size=300x300&data=${encodeURIComponent(scanUrl)}&color=0d9488&bgcolor=ffffff`);
    } else {
      // Demo URL for guests
      const demoUrl = `${baseUrl}/v/demo`;
      setQrUrl(`${qrApi}?size=300x300&data=${encodeURIComponent(demoUrl)}&color=0d9488&bgcolor=ffffff`);
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


  const handleContact = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Thank you! Your message has been sent successfully. ✓');
        setContactForm({ ...contactForm, message: '' });
      } else {
        alert(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Contact error:', err);
      alert('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO 
        title="Parkéé City - Smart Vehicle Protection & Emergency Services"
        description="Secure your vehicle with Parkéé City's smart QR-based Emergency Cards. Get 24/7 roadside assistance, highway engine repair, and instant contact access."
      />
      {/* ========== HERO ========== */}
      <section id="home" className="hero" style={{ perspective: '1000px' }}>
        <div className="hero-bg" style={{ background: 'radial-gradient(circle at top right, rgba(94, 234, 212, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.1), transparent 40%)' }}></div>
        <div className="hero-glow hero-glow-1 animate-float" style={{ opacity: 0.15 }}></div>
        <div className="hero-glow hero-glow-2 animate-float" style={{ animationDelay: '-3s', opacity: 0.1 }}></div>
        
        <div className="container hero-content">
          <div className="hero-badge glass animate-float" style={{ border: '1px solid var(--primary-glow)', boxShadow: '0 0 20px var(--primary-glow)', color: 'var(--primary)' }}>
            <ShieldCheck size={16} />
            Next-Gen Vehicle Security
          </div>
          
          <h1 className="hero-title" style={{ letterSpacing: '-2px' }}>
            The Smartest Way to <br />
            <span className="text-gradient">Protect Your Vehicle</span>
          </h1>
          
          <p className="hero-desc" style={{ fontSize: '1.2rem', marginBottom: '4rem' }}>
            Experience 24/7 Roadside Intelligence. From QR-based Emergency ID Cards to AI-powered Diagnostics, we've got you covered.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '4rem' }}>
            <Link to="/mechanics" className="btn-gradient pulse-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '50px' }}>
              <MapPin size={22} />
              Find Help Now
            </Link>
            <Link to="/community-help" className="glass" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '50px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Community✨
            </Link>
          </div>

          <div className="hero-stats glass" style={{ padding: '2rem', borderRadius: '24px', maxWidth: '800px', margin: '0 auto', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="stat">
              <div className="stat-value text-gradient">500+</div>
              <div className="stat-label">Smart Spots</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div className="stat">
              <div className="stat-value text-gradient">24/7</div>
              <div className="stat-label">Live Support</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div className="stat">
              <div className="stat-value text-gradient">50K+</div>
              <div className="stat-label">Trusted Users</div>
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
            <div className="service-card glass-card">
              <div className="service-icon-wrap"><Wrench size={24} /></div>
              <h3>Engine Repair</h3>
              <p>Expert mechanics for all engine issues on the highway</p>
            </div>
            <div className="service-card glass-card">
              <div className="service-icon-wrap"><AlertTriangle size={24} /></div>
              <h3>Breakdown Help</h3>
              <p>Quick response for vehicle breakdowns anywhere</p>
            </div>
            <div className="service-card glass-card">
              <div className="service-icon-wrap"><CheckCircle size={24} /></div>
              <h3>24/7 Support</h3>
              <p>Round the clock emergency support on highways</p>
            </div>
            <div className="service-card glass-card">
              <div className="service-icon-wrap"><ShieldCheck size={24} /></div>
              <h3>Secure Network</h3>
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
            <div className="emergency-location" style={{ marginBottom: '1.5rem' }}>
              <MapPin size={16} />
              Service available on all major highways
            </div>

            {/* Point 6: Voice SOS Button (PRO Exclusive) */}
            {voiceSupported && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <button 
                  onClick={startVoiceSOS}
                  style={{ 
                    padding: '12px 24px', borderRadius: '50px', border: '1.5px solid var(--border)',
                    background: isVoiceListening ? 'rgba(239, 68, 68, 0.15)' : 'var(--card-bg)',
                    color: isVoiceListening ? '#ef4444' : 'var(--muted)',
                    display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    fontWeight: 'bold', fontSize: '0.9rem'
                  }}
                >
                  <div className={isVoiceListening ? "pulse-anim" : ""} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    {isVoiceListening ? "Listening..." : (isPro() ? "Voice SOS Enabled" : "Voice SOS (PRO ONLY)")}
                  </div>
                </button>
                {!isPro() && <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '6px' }}>Upgrade to Silver/Gold to unlock voice triggers</p>}
              </div>
            )}
            
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Link to="/mechanics" className="btn-gradient full-width" style={{ textDecoration: 'none', display: 'inline-flex', padding: '14px 16px', fontSize: '1rem', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', borderRadius: '12px', fontWeight: 'bold' }}>
                <MapPin size={20} style={{ marginRight: '8px' }} />
                Find Nearby Mechanics (1-3 km)
              </Link>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Are you a highway mechanic?</p>
              <Link to="/mechanic-register" className="btn-outline-primary" style={{ textDecoration: 'none', display: 'inline-flex', padding: '8px 16px', fontSize: '0.9rem', alignItems: 'center' }}>
                <Wrench size={16} style={{ marginRight: '8px' }} />
                Join Our Partner Network
              </Link>
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
            {/* Silver Plan */}
            <div className="pricing-card glass-card">
              <div className="plan-header">
                <div className="plan-icon"><CheckCircle size={20} /></div>
                <div><h3>Silver</h3></div>
              </div>
              <div className="plan-price"><span className="currency">₹</span><span className="amount">250</span></div>
              <span className="period">/month</span>
              <ul className="plan-features">
                <li><span className="check">✓</span> Standard QR Profile</li>
                <li><span className="check">✓</span> SMS Alert System</li>
                <li><span className="check">✓</span> 1 Vehicle Limit</li>
                <li><span className="check">✓</span> Basic Tech Support</li>
              </ul>
              <button className="plan-btn glass" onClick={() => onOpenPayment('Silver', '250')}>Subscribe Now</button>
            </div>
            {/* Gold PRO (Featured) */}
            <div className="pricing-card featured glass-card" style={{ borderColor: 'var(--primary)' }}>
              <div className="plan-badge">⭐ Best Value</div>
              <div className="plan-header">
                <div className="plan-icon featured-icon"><ShieldCheck size={20} /></div>
                <div><h3>Gold PRO</h3><span className="savings text-gradient">Most Popular</span></div>
              </div>
              <div className="plan-price"><span className="currency">₹</span><span className="amount">450</span></div>
              <span className="period">/6 months</span>
              <ul className="plan-features">
                <li style={{fontWeight: 'bold', color: 'var(--primary)'}}><span className="check featured-check">✓</span> Secure WebRTC Privacy Calling</li>
                <li><span className="check featured-check">✓</span> Holographic Sticker Delivery</li>
                <li><span className="check featured-check">✓</span> Up to 3 Vehicles</li>
                <li><span className="check featured-check">✓</span> Priority SOS Assistance</li>
              </ul>
              <button className="plan-btn-featured pulse-primary" onClick={() => onOpenPayment('Gold PRO', '450')}>Subscribe Now</button>
            </div>
            {/* Diamond PRO */}
            <div className="pricing-card glass-card" style={{border: '1.5px solid #a855f7', boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)'}}>
              <div className="plan-header">
                <div className="plan-icon" style={{background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7'}}><ShieldCheck size={20} /></div>
                <div><h3>Diamond PRO</h3><span className="savings" style={{color: '#a855f7'}}>Elite Protection</span></div>
              </div>
              <div className="plan-price"><span className="currency" style={{color: '#a855f7'}}>₹</span><span className="amount" style={{color: '#a855f7'}}>1,000</span></div>
              <span className="period">/year</span>
              <ul className="plan-features">
                <li style={{fontWeight: 'bold', color: '#a855f7'}}><span className="check" style={{background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7'}}>✓</span> Everything in Gold PRO</li>
                <li><span className="check" style={{background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7'}}>✓</span> Multi-Vehicle (Up to 5)</li>
                <li><span className="check" style={{background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7'}}>✓</span> Zero Booking Fees</li>
                <li><span className="check" style={{background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7'}}>✓</span> Personal Priority Line</li>
              </ul>
              <button className="plan-btn" style={{background: '#a855f7', color: '#fff', borderRadius: '12px'}} onClick={() => onOpenPayment('Diamond PRO', '1000')}>Go Diamond</button>
            </div>
          </div>
          <p className="pricing-trust">
            <ShieldCheck size={16} />
            Secured by UPI · Cancel anytime · No hidden fees
          </p>
        </div>
      </section>

      {/* ========== QR SECTION ========== */}
      <section id="qr" className="qr-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Your <span className="text-gradient">Smart Vehicle ID</span> Card</h2>
            <p className="section-desc">Get your premium QR card today. Highly attractive, professional, and life-saving.</p>
          </div>

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
                  <EmergencyCard 
                    ref={cardRef} 
                    user={user || { name: 'VISHANT GURJAR', subscriptionTier: 'diamond' }} 
                    qrUrl={qrUrl} 
                  />
                </div>
              ) : (
                <div style={{ transform: 'scale(1)', margin: '1rem 0' }}>
                  <CustomerCard 
                    ref={customerRef} 
                    user={user || { name: 'VISHANT GURJAR', subscriptionTier: 'gold', plateNumber: 'HR51 AA 0001' }} 
                    qrUrl={qrUrl} 
                  />
                </div>
              )}
              
              {!user && (
                <div style={{ textAlign: 'center', marginTop: '1rem', background: 'rgba(56, 189, 248, 0.1)', padding: '10px 20px', borderRadius: '12px', border: '1px dashed #38bdf8' }}>
                  <p style={{ color: '#38bdf8', fontWeight: 'bold', margin: 0 }}>
                    ✨ Log in to generate your personalized Card!
                  </p>
                  <Link to="/login" style={{ color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '800', marginTop: '5px', display: 'block' }}>Log In Now →</Link>
                </div>
              )}

              <div className="qr-actions" style={{ maxWidth: '450px', width: '100%', display: user ? 'flex' : 'none' }}>

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
              <input 
                type="text" 
                placeholder="ABC XYZ" 
                required 
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="ABC@example.com" 
                required 
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea 
                rows="5" 
                placeholder="How can we help you?" 
                required
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="btn-gradient full-width" 
              disabled={isSubmitting}
              style={{display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1}}
            >
              <Send size={20} style={{marginRight: '8px'}} />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

    </>
  );
}
