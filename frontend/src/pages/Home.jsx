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
    // Reveal animation observer
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    // IP location detection
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
      
    return () => observer.disconnect();
  }, []);
  
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [activeCard, setActiveCard] = useState('emergency'); // profile or emergency
  const [showSOSHub, setShowSOSHub] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert("Please fill in all fields.");
      return;
    }
    // Simulate API call
    console.log("Contact Request Sent:", contactForm);
    alert("Success! Your request has been sent to the Parkéé City team.");
    setContactForm({ name: '', email: '', message: '' });
  };

  useEffect(() => {
    const handleScrollSOS = () => setShowSOSHub(window.scrollY > 400);
    window.addEventListener('scroll', handleScrollSOS);
    return () => window.removeEventListener('scroll', handleScrollSOS);
  }, []);

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

  const qrRef = useRef(null);
  const downloadQR = async () => {
    if (qrRef.current === null) return;
    try {
      const name = user?.name?.replace(/\s+/g, '-') || 'id-card';
      
      // High-compatibility options for perfect results on all devices
      const options = {
        cacheBust: true,
        width: 520,
        height: 300,
        pixelRatio: 2, // 2x is optimal for cross-device mobile stability
        backgroundColor: '#0f172a', // Match card deep background
        style: {
          transform: 'none',
          perspective: 'none',
          margin: '0',
          padding: '0',
          borderRadius: '20px',
          width: '520px',
          height: '300px',
          display: 'flex',
          overflow: 'hidden'
        }
      };

      const dataUrl = await toPng(qrRef.current, options);
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
      
      {/* ========== BACKGROUND PATTERNS ========== */}
      <div className="bg-grain"></div>
      <div className="bg-grid"></div>
      <div className="bg-dot-grid"></div>

      {/* ========== FLOATING SOS HUB ========== */}
      <div className={`sos-hub glass light-sweep ${showSOSHub ? 'visible' : ''}`} style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: '999',
        padding: '12px 24px',
        borderRadius: '50px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(244, 63, 94, 0.3)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        background: 'rgba(3, 7, 18, 0.8)',
        opacity: showSOSHub ? 1 : 0,
        transform: showSOSHub ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: showSOSHub ? 'auto' : 'none'
      }}>
        <div className="pulse-primary" style={{ background: '#f43f5e', borderRadius: '50%', padding: '8px' }}>
          <AlertTriangle size={20} color="#fff" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.7, letterSpacing: '1px' }}>Emergency Assistance</span>
          <a href="tel:+917895039922" style={{ fontSize: '0.95rem', fontWeight: '900', color: '#fff' }}>CLICK TO CALL</a>
        </div>
      </div>
      
      {/* ========== HERO ========== */}
      <section id="home" className="hero" style={{ perspective: '1200px' }}>
        <div className="mesh-bg">
          <div className="mesh-blob mesh-blob-1"></div>
          <div className="mesh-blob mesh-blob-2"></div>
          <div className="mesh-blob mesh-blob-3"></div>
        </div>
        
        <div className="container hero-content">
          <div className="reveal active">
            <div className="hero-badge glass animate-float" style={{ border: '1px solid var(--primary-glow)', background: 'rgba(255,255,255,0.02)', color: 'var(--primary)', letterSpacing: '2px', fontWeight: '800', textTransform: 'uppercase', fontSize: '10px' }}>
              <ShieldCheck size={14} />
              The Future of Protection
            </div>
          </div>
          
          <h1 className="hero-title reveal active" style={{ 
            fontSize: 'clamp(3rem, 8vw, 6rem)', 
            letterSpacing: 'var(--tracking-tighter)', 
            fontWeight: '900',
            marginBottom: '2rem'
          }}>
            Protect Your <br />
            <span className="text-gradient">Vehicle Journey.</span>
          </h1>
          
          <div className="reveal active" style={{ transitionDelay: '0.2s' }}>
            <p className="hero-desc" style={{ fontSize: '1.25rem', opacity: '0.8', textShadow: 'none', marginBottom: '4rem' }}>
              Advanced AI Diagnostics. Roadside Intelligence. <br /> 
              Instant Emergency QR Profiles for Smart Drivers.
            </p>
          </div>
          
          <div className="reveal active" style={{ transitionDelay: '0.4s' }}>
            <div className="hero-cta-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '6rem' }}>
              <Link to="/mechanics" className="btn-gradient light-sweep" style={{ padding: '20px 40px', borderRadius: '18px', fontSize: '1.1rem' }}>
                <MapPin size={22} />
                Find Assistance
              </Link>
              <Link to="/community-help" className="glass" style={{ padding: '20px 40px', borderRadius: '18px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Join Community
              </Link>
            </div>
          </div>

          {(user?.subscriptionTier?.toLowerCase() === 'diamond' || user?.subscriptionTier?.toLowerCase() === 'pro') && (
            <div className="reveal active" style={{ transitionDelay: '0.5s', marginBottom: '3rem' }}>
              <div style={{ padding: '12px 24px', borderRadius: '50px', background: 'rgba(94, 234, 212, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <Sparkles size={18} />
                Welcome Back, DIAMOND MEMBER
              </div>
            </div>
          )}

          <div className="bento-grid reveal active" style={{ transitionDelay: '0.6s' }}>
            <div className="bento-item bento-large light-sweep" style={{ textAlign: 'left', justifyContent: 'flex-end' }}>
               <div className="feature-icon-box" style={{ marginBottom: 'auton', width: '56px', height: '56px' }}><Cpu size={32} /></div>
               <div>
                  <h4 className="feature-title" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Sentinel AI Diagnostics</h4>
                  <p style={{ fontSize: '0.9rem' }}>Gemini-powered spectral analysis for your engine's health. Instant insights on every scan.</p>
               </div>
            </div>
            
            <div className="bento-item light-sweep">
               <div className="feature-icon-box" style={{ width: '48px', height: '48px' }}><ShieldCheck size={24} /></div>
               <h4 className="feature-title" style={{ fontSize: '1.1rem' }}>Privacy Calls</h4>
               <p style={{ fontSize: '0.8rem' }}>Secure WebRTC encrypted masking.</p>
            </div>

            <div className="bento-item bento-tall light-sweep" style={{ background: 'var(--gradient-primary)', color: 'var(--primary-fg)', borderColor: 'transparent' }}>
               <div className="feature-icon-box" style={{ background: 'rgba(0,0,0,0.2)', color: '#fff', marginTop: 'auto' }}><Zap size={32} /></div>
               <h4 className="feature-title" style={{ color: '#fff', fontSize: '1.2rem', marginTop: '1rem' }}>Live Highway SOS</h4>
               <p style={{ color: 'rgba(255,255,255,0.8)' }}>Broadcast your emergency to the nearest verified mechanics in real-time.</p>
            </div>

            <div className="bento-item light-sweep">
               <div className="feature-icon-box" style={{ width: '48px', height: '48px' }}><Smartphone size={24} /></div>
               <h4 className="feature-title" style={{ fontSize: '1.1rem' }}>Smart QR</h4>
               <p style={{ fontSize: '0.8rem' }}>Instant digital identity card.</p>
            </div>
          </div>
          
        </div>
      </section>

      {/* ========== EMERGENCY SERVICES ========== */}
      <section id="emergency" className="emergency reveal">
        <div className="emergency-bg"></div>
        <div className="mesh-bg" style={{ opacity: 0.1 }}>
          <div className="mesh-blob mesh-blob-2" style={{ left: 'auto', right: '-10%', top: '0' }}></div>
        </div>
        
        <div className="container emergency-content">
          <div className="section-header reveal" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '5rem' }}>
            <div className="emergency-badge" style={{ marginBottom: '1.5rem', padding: '10px 24px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px' }}>
              🚨 ON-DEMAND HIGHWAY RESPONSE
            </div>
            <h2 className="section-title" style={{ fontSize: ' clamp(2rem, 5vw, 3.5rem)', letterSpacing: 'var(--tracking-tight)' }}>Rescue at Your <br/> <span className="text-gradient">Fingertips.</span></h2>
          </div>

          <div className="services-grid">
            <div className="service-card bento-item reveal light-sweep" style={{ transitionDelay: '0.1s' }}>
              <div className="service-icon-wrap" style={{ background: 'var(--gradient-emergency)', width: '64px', height: '64px', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <AlertTriangle size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Breakdown Assist</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Critical mechanical support on highways with verified responders arriving fast.</p>
            </div>
            <div className="service-card bento-item reveal light-sweep" style={{ transitionDelay: '0.2s' }}>
              <div className="service-icon-wrap" style={{ background: 'var(--gradient-primary)', width: '64px', height: '64px', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Smart Privacy</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Secure your contact details while enabling instant emergency alerts via QR.</p>
            </div>
            <div className="service-card bento-item reveal light-sweep" style={{ transitionDelay: '0.3s' }}>
              <div className="service-icon-wrap" style={{ background: 'rgba(255,255,255,0.1)', width: '64px', height: '64px', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <Zap size={32} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Instant Reach</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Every scan triggers a high-priority notification to your security contacts.</p>
            </div>
          </div>

          <div className="emergency-cta-card bento-item reveal light-sweep" style={{ background: 'rgba(244, 63, 94, 0.05)', borderColor: 'rgba(244, 63, 94, 0.2)', padding: '4rem 2rem', marginTop: '3rem' }}>
            <div className="emergency-phone-icon pulse-primary" style={{ background: '#f43f5e', margin: '0 auto 2rem' }}>
              <PhoneCall size={32} />
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: 'var(--tracking-tight)' }}>Help arrives in minutes.</h3>
            <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '2rem' }}>Experience the peace of mind that comes with India's fastest roadside network.</p>
            <a href="tel:+917895039922" className="btn-gradient light-sweep" style={{ background: 'var(--gradient-emergency)', padding: '16px 40px', borderRadius: '50px' }}>Call Emergency Mechanic</a>
            <p className="emergency-location" style={{ marginTop: '1.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
              <MapPin size={14} /> ACTIVE IN: {locationLabel}
            </p>
          </div>
        </div>
      </section>

      {(!user?.subscriptionTier || !['silver', 'gold', 'diamond', 'pro'].includes(user.subscriptionTier?.toLowerCase())) && (
        <section id="pricing" className="pricing reveal">
        <div className="mesh-bg" style={{ opacity: 0.05 }}>
          <div className="mesh-blob mesh-blob-3" style={{ top: 'auto', bottom: '0', left: '0' }}></div>
        </div>
        <div className="container pricing-content">
          <div className="section-header reveal">
            <div className="pricing-badge" style={{ padding: '8px 20px', borderRadius: '50px', background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem', fontWeight: '800', border: '1px solid rgba(255,255,255,0.1)' }}>
              💎 PREMIUM PLANS
            </div>
            <h2 className="section-title" style={{ fontSize: '3rem', letterSpacing: 'var(--tracking-tight)', marginTop: '1.5rem' }}>Simple, Powerful <span className="text-gradient">Access.</span></h2>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card bento-item reveal light-sweep">
              <div className="plan-header">
                <div className="plan-icon" style={{ borderRadius: '12px' }}><CheckCircle size={20} /></div>
                <div><h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Silver</h3></div>
              </div>
              <div className="plan-price" style={{ fontSize: '3.5rem', letterSpacing: 'var(--tracking-tighter)' }}><span className="currency" style={{ fontSize: '1.5rem' }}>₹</span><span className="amount">250</span></div>
              <span className="period" style={{ opacity: 0.6 }}>/month</span>
              <ul className="plan-features" style={{ marginTop: '2rem' }}>
                <li>Standard QR Profile</li>
                <li>SMS Alert System</li>
                <li>1 Vehicle Limit</li>
              </ul>
              <button className="plan-btn glass light-sweep" style={{ marginTop: '2rem', borderRadius: '50px', padding: '14px' }} onClick={() => onOpenPayment('Silver', '250')}>Start Silver</button>
            </div>
            
            <div className="pricing-card bento-item reveal light-sweep" style={{ borderColor: 'var(--primary)', background: 'rgba(94, 234, 212, 0.05)' }}>
              <div className="plan-badge" style={{ top: '20px', right: '20px', background: 'var(--primary)', color: 'var(--primary-fg)', fontSize: '0.6rem', fontWeight: '900', borderRadius: '50px' }}>BEST VALUE</div>
              <div className="plan-header">
                <div className="plan-icon featured-icon" style={{ borderRadius: '12px' }}><ShieldCheck size={20} /></div>
                <div><h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Gold PRO</h3></div>
              </div>
              <div className="plan-price" style={{ fontSize: '3.5rem', letterSpacing: 'var(--tracking-tighter)' }}><span className="currency" style={{ fontSize: '1.5rem' }}>₹</span><span className="amount">450</span></div>
              <span className="period" style={{ opacity: 0.6 }}>/6 months</span>
              <ul className="plan-features" style={{ marginTop: '2rem' }}>
                <li style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Privacy Mode Calling</li>
                <li>Smart Sticker Delivery</li>
                <li>Up to 3 Vehicles</li>
              </ul>
              <button className="plan-btn-featured light-sweep" style={{ marginTop: '2rem', borderRadius: '50px', padding: '14px' }} onClick={() => onOpenPayment('Gold PRO', '450')}>Upgrade to PRO</button>
            </div>

            <div className="pricing-card bento-item reveal light-sweep" style={{ borderColor: '#a855f7', background: 'rgba(168, 85, 247, 0.05)' }}>
              <div className="plan-header">
                <div className="plan-icon" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', borderRadius: '12px' }}><ShieldCheck size={20} /></div>
                <div><h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Diamond</h3></div>
              </div>
              <div className="plan-price" style={{ fontSize: '3.5rem', letterSpacing: 'var(--tracking-tighter)', color: '#a855f7' }}><span className="currency" style={{ fontSize: '1.5rem' }}>₹</span><span className="amount">1,000</span></div>
              <span className="period" style={{ opacity: 0.6 }}>/year</span>
              <ul className="plan-features" style={{ marginTop: '2rem' }}>
                <li style={{ color: '#a855f7', fontWeight: 'bold' }}>Elite Concierge Line</li>
                <li>Zero Booking Fees</li>
                <li>Up to 5 Vehicles</li>
              </ul>
              <button className="plan-btn light-sweep" style={{ background: '#a855f7', color: '#fff', marginTop: '2rem', borderRadius: '50px', padding: '14px' }} onClick={() => onOpenPayment('Diamond PRO', '1000')}>Go Diamond</button>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ========== QR PROFILE SECTION ========== */}
      <section id="qr" className="qr-section reveal" style={{ padding: '8rem 0' }}>
        <div className="container">
          <div className="section-header reveal" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '5rem' }}>
            <h2 className="section-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: 'var(--tracking-tight)' }}>Your Digital <br/> <span className="text-gradient">Identity Hub.</span></h2>
            <p className="section-desc" style={{ fontSize: '1.1rem', opacity: 0.7 }}>Manage your high-security emergency profiles with ease.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', alignItems: 'center', width: '100%' }}>
            <div className="card-switcher reveal" style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button 
                className={`switcher-btn ${activeCard === 'emergency' ? 'active' : ''}`}
                onClick={() => setActiveCard('emergency')}
                style={{ borderRadius: '16px', padding: '12px 24px', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '1px' }}
              >
                EMERGENCY
              </button>
              <button 
                className={`switcher-btn ${activeCard === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveCard('profile')}
                style={{ borderRadius: '16px', padding: '12px 24px', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '1px' }}
              >
                CUSTOMER
              </button>
            </div>

            <div className="reveal" style={{ transitionDelay: '0.2s', width: '100%', display: 'flex', justifyContent: 'center' }}>
              {(() => {
                const guestUser = { name: 'GUEST USER', plateNumber: 'UP 16 XX 0000', subscriptionTier: 'silver' };
                const displayUser = user || guestUser;

                return (
                   <div className="fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%', alignItems: 'center' }}>
                     {!user && (
                       <div className="hero-badge glass reveal" style={{ marginBottom: '0', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '12px 24px', borderRadius: '50px' }}>
                          <Sparkles size={16} style={{ marginRight: '8px' }} />
                          PREVIEW: Login to personalize your card
                       </div>
                     )}
                     
                     <div className="qr-container reveal" style={{ border: 'none', background: 'transparent', padding: '0', perspective: '2000px' }}>
                        <div className="light-sweep" style={{ borderRadius: '32px' }}>
                          {activeCard === 'emergency' ? (
                            <EmergencyCard 
                              ref={qrRef}
                              user={displayUser} 
                              qrUrl={user ? qrUrl : 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GUEST_PREVIEW'} 
                            />
                          ) : (
                            <CustomerCard 
                              ref={qrRef}
                              user={displayUser} 
                              qrUrl={user ? qrUrl : 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GUEST_PREVIEW'} 
                            />
                          )}
                        </div>
                     </div>
                     
                     {user ? (
                       <div className="reveal" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button onClick={downloadQR} className="btn-gradient light-sweep" style={{ padding: '16px 32px', borderRadius: '50px', fontWeight: '800' }}>
                            <Download size={18} />
                            Download HQ Image
                          </button>
                       </div>
                     ) : (
                       <div className="qr-actions reveal" style={{ maxWidth: '400px', width: '100%' }}>
                          <Link to="/register" className="btn-gradient light-sweep" style={{ padding: '16px', borderRadius: '18px', display: 'block', textAlign: 'center', fontWeight: '900' }}>Get Your Premium Card</Link>
                       </div>
                     )}
                   </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ========== CONTACT ========== */}
      <section id="contact" className="contact reveal" style={{ padding: '8rem 0' }}>
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title" style={{ fontSize: '3rem', letterSpacing: 'var(--tracking-tight)' }}>Connect <span className="text-gradient">With Us.</span></h2>
            <p className="section-desc">Our response team is standing by 24/7 for you.</p>
          </div>
          <div className="contact-form bento-item reveal light-sweep" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <form className="form-grid" onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Name</label>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px' }} 
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email</label>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px' }} 
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Message</label>
                <textarea 
                  rows="4" 
                  placeholder="How can we help?" 
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px' }}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                ></textarea>
              </div>
              <button type="submit" className="btn-gradient full-width light-sweep" style={{ padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem' }}>
                <Send size={18} />
                Send Request
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

