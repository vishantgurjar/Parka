import { Wrench, PhoneCall, CheckCircle, ShieldCheck, MapPin, AlertTriangle, Smartphone, Zap, Sparkles, Cpu, Send, Download, Printer } from 'lucide-react';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import EmergencyCard from '../components/EmergencyCard';
import CustomerCard from '../components/CustomerCard';
import { toPng } from 'html-to-image';

export default function Home({ onOpenPayment }) {
  const { user } = useContext(AuthContext);
  const [locationLabel, setLocationLabel] = useState('Detecting location...');

  useEffect(() => {
    // Attempt dynamic location detection via IP service (free & fast)
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.city) {
          setLocationLabel(`${data.city}, ${data.country_code}`);
        } else {
          setLocationLabel('Location Available');
        }
      })
      .catch(() => setLocationLabel('Location Detected'));
  }, []);
  
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [activeCard, setActiveCard] = useState('profile'); // profile or emergency

  // Point: QR URL Generation (Stable Restored)
  const qrUrl = user ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/v/${user._id}` : "";

  useEffect(() => {
    if ('WebkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
    }
  }, []);

  const handleVoiceSOS = () => {
    if (!voiceSupported) return;
    
    const SpeechRecognition = window.WebkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;

    recognition.onstart = () => setIsVoiceListening(true);
    recognition.onend = () => setIsVoiceListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes('help') || transcript.includes('emergency') || transcript.includes('bachao')) {
        window.location.href = 'tel:911'; 
        alert("Emergency Voice SOS Triggered! Calling Emergency Services...");
      }
    };

    recognition.start();
  };

  const handlePrint = () => {
    window.print();
  };

  const qrRef = useRef(null);
  const downloadQR = async () => {
    if (qrRef.current === null) return;
    try {
      const name = user?.name?.replace(/\s+/g, '-') || 'id-card';
      const dataUrl = await toPng(qrRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `parkee-city-${name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading QR:', err);
      alert("Could not generate image. Please try taking a screenshot instead.");
    }
  };


  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <SEO 
        title="Parkéé City - Smart Vehicle Protection & Emergency Services"
        description="Secure your vehicle with Parkéé City's smart QR-based Emergency Cards. Get 24/7 roadside assistance, highway engine repair, and instant contact access."
      />
      {/* ========== HERO ========== */}
      {/* ========== HERO ========== */}
      <section id="home" className="hero" style={{ perspective: '1000px' }}>
        <div className="hero-bg"></div>
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
          
          <p className="hero-desc">
            Experience 24/7 Roadside Intelligence. From QR-based Emergency ID Cards to AI-powered Diagnostics, we've got you covered.
          </p>
          
          <div className="hero-cta-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '4rem' }}>
            <Link to="/mechanics" className="btn-gradient pulse-primary" style={{ padding: '16px 32px', borderRadius: '50px' }}>
              <MapPin size={22} />
              Find Help Now
            </Link>
            <Link to="/community-help" className="glass" style={{ padding: '16px 32px', borderRadius: '50px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Community✨
            </Link>
          </div>

          {user?.subscriptionTier === 'diamond' && (
            <div style={{ marginTop: '2rem', padding: '12px 24px', borderRadius: '50px', background: 'rgba(94, 234, 212, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              <Sparkles size={18} />
              Welcome Back, DIAMOND MEMBER
            </div>
          )}

          <div className="hero-features">
            <div className="feature-card">
              <div className="feature-icon-box"><Cpu size={24} /></div>
              <h4 className="feature-title">AI Health</h4>
              <p>Gemini-powered engine diagnostics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box"><ShieldCheck size={24} /></div>
              <h4 className="feature-title">Secure call</h4>
              <p>WebRTC Privacy-first calling</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box"><Zap size={24} /></div>
              <h4 className="feature-title">Live SOS</h4>
              <p>Real-time emergency broadcast</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box"><Smartphone size={24} /></div>
              <h4 className="feature-title">Smart QR</h4>
              <p>Instant contact without logs</p>
            </div>
          </div>
          
        </div>
      </section>



      {/* ========== EMERGENCY SERVICES ========== */}
      <section id="emergency" className="emergency">
        <div className="emergency-bg"></div>
        <div className="hero-glow emergency-glow-1"></div>
        <div className="hero-glow emergency-glow-2"></div>
        
        <div className="container emergency-content">
          <div className="section-header">
            <div className="emergency-badge">
              🚨 24/7 Highway Assistance
            </div>
            <h2 className="section-title">Critical <span className="text-gradient">Services</span></h2>
            <p className="section-desc">Immediate response for vehicle emergencies. Your safety is our top priority.</p>
          </div>

          <div className="services-grid">
            <div className="service-card glass-card">
              <div className="service-icon-wrap" style={{ background: 'var(--gradient-emergency)' }}>
                <AlertTriangle size={24} />
              </div>
              <h3>Engine Breakdown</h3>
              <p>Critical mechanical support on highways with verified mechanics arriving in under 30 mins.</p>
            </div>
            <div className="service-card glass-card">
              <div className="service-icon-wrap">
                <ShieldCheck size={24} />
              </div>
              <h3>Smart Protection</h3>
              <p>Keep your contact details private while still allowing emergency notifications via QR scan.</p>
            </div>
            <div className="service-card glass-card">
              <div className="service-icon-wrap">
                <Zap size={24} />
              </div>
              <h3>Live Tracking</h3>
              <p>Track your assigned mechanic's real-time location as they head towards your vehicle.</p>
            </div>
          </div>

          <div className="emergency-cta-card glass-card">
            <div className="emergency-phone-icon pulse-primary">
              <PhoneCall size={32} />
            </div>
            <h3>Immediate Roadside Help?</h3>
            <p>Running into trouble on a dark highway? Our network is active 24/7 across major cities.</p>
            <a href="tel:+917895039922" className="emergency-call-btn">Call Emergency Mechanic</a>
            <p className="emergency-location">
              <MapPin size={14} /> Detect Location: {locationLabel}
            </p>
          </div>
        </div>
      </section>

      {/* ========== PRICING (Hidden for Subscribed) ========== */}
      {(!user?.subscriptionTier || !['silver', 'gold', 'diamond'].includes(user.subscriptionTier)) && (
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
              <span className="period" style={{color: '#a855f7'}}> /year</span>
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
    )}

      {/* ========== QR SECTION ========== */}
      <section id="qr" className="qr-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Your Smart <span className="text-gradient">QR Profile</span></h2>
            <p className="section-desc">Manage your emergency card details and digital identity.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', width: '100%' }}>
            {/* Deploy Trigger: Card Switcher Tabs (Unified Section) */}
            <div className="card-switcher">
              <button 
                className={`switcher-btn ${activeCard === 'emergency' ? 'active' : ''}`}
                onClick={() => setActiveCard('emergency')}
              >
                Emergency Card
              </button>
              <button 
                className={`switcher-btn ${activeCard === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveCard('profile')}
              >
                Parkee Card
              </button>
            </div>

            {user ? (
               <div className="fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', alignItems: 'center' }}>
                 <div ref={qrRef} className="qr-container">
                    {activeCard === 'profile' ? (
                      <CustomerCard user={user} qrUrl={qrUrl} />
                    ) : (
                      <EmergencyCard 
                        user={user}
                        qrUrl={qrUrl}
                        theme={user?.subscriptionTier?.toLowerCase() === 'diamond' ? 'diamond' : (user?.subscriptionTier?.toLowerCase() === 'gold' ? 'gold' : 'standard')} 
                      />
                    )}
                 </div>
                 
                 <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={downloadQR} className="btn-gradient" style={{ padding: '12px 24px' }}>
                      <Download size={18} />
                      Download Image
                    </button>
                    <button onClick={handlePrint} className="btn-secondary" style={{ padding: '12px 24px' }}>
                      <Printer size={18} />
                      Print Card
                    </button>
                 </div>
               </div>

            ) : (
              <div className="qr-card glass-card">
                <div className="qr-icon-wrap">
                  <Smartphone size={24} />
                </div>
                <h3>Start Protection</h3>
                <p className="qr-subtitle">Scan & Stay Safe Everywhere</p>
                <div className="qr-tags">
                  <span className="qr-tag tag-primary">24/7 Monitoring</span>
                  <span className="qr-tag tag-danger">SOS Alerts</span>
                </div>
                <div className="qr-image-wrap pulse-primary">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '8px' }}>
                    <rect width="120" height="120" rx="8" fill="#0f172a"/>
                    <rect x="15" y="15" width="35" height="35" rx="4" stroke="#2dd4bf" strokeWidth="3" fill="none"/>
                    <rect x="22" y="22" width="21" height="21" rx="2" fill="#2dd4bf"/>
                    <rect x="70" y="15" width="35" height="35" rx="4" stroke="#2dd4bf" strokeWidth="3" fill="none"/>
                    <rect x="77" y="22" width="21" height="21" rx="2" fill="#2dd4bf"/>
                    <rect x="15" y="70" width="35" height="35" rx="4" stroke="#2dd4bf" strokeWidth="3" fill="none"/>
                    <rect x="22" y="77" width="21" height="21" rx="2" fill="#2dd4bf"/>
                    <rect x="70" y="70" width="14" height="14" fill="#2dd4bf"/>
                    <rect x="88" y="70" width="14" height="14" fill="#2dd4bf"/>
                    <rect x="70" y="88" width="14" height="14" fill="#2dd4bf"/>
                    <rect x="88" y="88" width="14" height="14" fill="#2dd4bf"/>
                    <rect x="55" y="55" width="10" height="10" fill="#2dd4bf"/>
                  </svg>
                </div>
                <p className="qr-scan-text">Scan for a live preview of our dashboard</p>
                <div className="qr-actions">
                  <Link to="/register" className="btn-gradient">Get Started</Link>
                  <Link to="/faq" className="btn-secondary">Learn More</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== CONTACT ========== */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Get in <span className="text-gradient">Touch</span></h2>
            <p className="section-desc">Have questions? We're here to help you 24/7.</p>
          </div>
          <div className="contact-form glass-card">
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Your Name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Email Address" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="4" placeholder="How can we help?"></textarea>
              </div>
              <button className="btn-gradient full-width" style={{ padding: '14px' }}>
                <Send size={18} />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
