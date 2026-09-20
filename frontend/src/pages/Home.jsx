import { Wrench, PhoneCall, CheckCircle, ShieldCheck, MapPin, AlertTriangle, Smartphone, Zap, Sparkles, Cpu, Send, Download, Printer, Car, Eye, Play, Pause, Volume2, VolumeX, RotateCcw, ArrowRight, Video, ChevronRight, CheckCircle2, MessageSquare, QrCode as QrIcon } from 'lucide-react';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import EmergencyCard from '../components/EmergencyCard';
import CustomerCard from '../components/CustomerCard';
import EmergencySticker from '../components/EmergencySticker';
import { toPng } from 'html-to-image';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import LiveCommandGrid from '../components/LiveCommandGrid';
import TrustProofStrip from '../components/TrustProofStrip';
import SOSWorkflowExplainer from '../components/SOSWorkflowExplainer';
import ServiceCoverageChecker from '../components/ServiceCoverageChecker';
import PrivacySecurityDiagram from '../components/PrivacySecurityDiagram';
import PricingComparisonTable from '../components/PricingComparisonTable';
import RealUseCasesGrid from '../components/RealUseCasesGrid';
import CustomerTestimonialsGrid from '../components/CustomerTestimonialsGrid';
import EnhancedFAQSection from '../components/EnhancedFAQSection';

export default function Home({ onOpenPayment }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [locationLabel, setLocationLabel] = useState('Detecting location...');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [iosModalImage, setIosModalImage] = useState(null);

  // --- INTERACTIVE DEMO EXPLAINER VIDEO STATE ---
  const [demoScene, setDemoScene] = useState(0);
  const [isPlayingDemo, setIsPlayingDemo] = useState(true);
  const [isDemoAudioOn, setIsDemoAudioOn] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);

  const DEMO_SCENES = [
    {
      id: 0,
      step: 'STEP 01',
      title: 'Smart Tag on Windshield',
      subtitle: 'Vehicle is protected with an encrypted smart QR tag',
      narration: 'The Parxéé Smart Tag is affixed to your car windshield. Your personal phone number stays 100% private and protected.',
      badge: '100% Privacy Protection',
      color: '#2dd4bf',
      icon: 'Car'
    },
    {
      id: 1,
      step: 'STEP 02',
      title: 'Passerby Scans Tag with Camera',
      subtitle: 'Anyone can scan using standard phone camera, zero app required',
      narration: 'If your vehicle needs to be moved, anyone can scan the tag using their default smartphone camera without installing any app.',
      badge: 'Zero App Download Required',
      color: '#38bdf8',
      icon: 'Smartphone'
    },
    {
      id: 2,
      step: 'STEP 03',
      title: 'Parxéé Privacy Shield Portal',
      subtitle: 'Instant options for Masked Voice Calling & 1-Click WhatsApp Alert',
      narration: 'Scanning opens the encrypted privacy portal to initiate masked voice calling or instant WhatsApp alerts without exposing your number.',
      badge: 'Encrypted Masked Routing',
      color: '#a855f7',
      icon: 'ShieldCheck'
    },
    {
      id: 3,
      step: 'STEP 04',
      title: 'Owner Receives Instant Alert',
      subtitle: 'Vehicle owner receives immediate notification with live GPS location',
      narration: 'You receive an instant alert on WhatsApp with vehicle status and location. Problem resolved smoothly in seconds!',
      badge: 'Real-Time Notification Delivery',
      color: '#10b981',
      icon: 'MessageSquare'
    }
  ];

  // Auto-play demo simulation
  useEffect(() => {
    let interval = null;
    if (isPlayingDemo) {
      interval = setInterval(() => {
        setDemoProgress(prev => {
          if (prev >= 100) {
            setDemoScene(curr => (curr + 1) % DEMO_SCENES.length);
            return 0;
          }
          return prev + 2; // ~5 seconds per scene
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlayingDemo, demoScene]);

  // Voiceover narration helper
  const speakNarration = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isDemoAudioOn && DEMO_SCENES[demoScene]) {
      speakNarration(DEMO_SCENES[demoScene].narration);
    }
  }, [demoScene, isDemoAudioOn]);

  const handleSelectScene = (index) => {
    setDemoScene(index);
    setDemoProgress(0);
  };

  const toggleDemoAudio = () => {
    const nextState = !isDemoAudioOn;
    setIsDemoAudioOn(nextState);
    if (!nextState && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    } else if (nextState) {
      speakNarration(DEMO_SCENES[demoScene].narration);
      toast.success('Audio narration turned ON 🔊');
    }
  };




  const isIOSDevice = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  };

  useEffect(() => {
    const dataToEncode = user 
      ? (user.smartTagId 
          ? `${window.location.origin}/activate/${user.smartTagId}` 
          : `${window.location.origin}/v/${user._id}`) 
      : `${window.location.origin}/v/GUEST_PREVIEW`;
    
    QRCode.toDataURL(dataToEncode, {
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    .then(url => {
      setQrCodeDataUrl(url);
    })
    .catch(err => {
      console.error("Failed to generate QR Code locally:", err);
    });
  }, [user]);

  useEffect(() => {
    // Reveal animation observer - lower threshold for better compatibility with short laptop screens
    const observerOptions = { threshold: 0.01, rootMargin: '0px 0px -10px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const observeElements = () => {
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    };

    // Observe immediately and after a short delay to capture all rendered elements
    observeElements();
    const timer = setTimeout(observeElements, 500);
    
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
      
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [user]);
  
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [activeCard, setActiveCard] = useState('profile'); // profile or emergency
  const [showSOSHub, setShowSOSHub] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    console.log("Contact Request Sent:", contactForm);
    toast.success("Success! Your request has been sent to the Parxéé City team.");
    setContactForm({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  useEffect(() => {
    const handleScrollSOS = () => setShowSOSHub(window.scrollY > 400);
    window.addEventListener('scroll', handleScrollSOS);
    return () => window.removeEventListener('scroll', handleScrollSOS);
  }, []);

  // Point: QR URL Generation (Stable Restored)
  const qrUrl = qrCodeDataUrl || (user ? (user.smartTagId ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/activate/${user.smartTagId}` : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/v/${user._id}`) : "");

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
        toast.success("Emergency Voice SOS Triggered! Calling Emergency Services...");
      }
    };

    recognition.start();
  };

  const qrRef = useRef(null);
  const downloadQR = async () => {
    if (!qrRef.current) return;
    
    // Step 1: Create the hidden capture clone
    const isVertical = activeCard === 'profile';
    const cardSelector = isVertical ? '.emergency-sticker-card' : '.hybrid-card';
    const originalCard = qrRef.current.querySelector(cardSelector) || qrRef.current;
    const clonedCard = originalCard.cloneNode(true);
    
    try {
      const name = user?.name?.replace(/\s+/g, '-') || 'id-card';
      
      // Step 2: Inject the clone into the hidden background layer
      clonedCard.classList.add(isVertical ? 'is-downloading-sticker' : 'is-downloading');
      document.body.appendChild(clonedCard);
      
      // Step 3: Wait specifically for images and fonts to be ready
      // 500ms is the "Gold Standard" for mobile rendering stability
      await new Promise(r => setTimeout(r, 500));

      const options = {
        width: isVertical ? 360 : 520,
        height: isVertical ? 560 : 300,
        pixelRatio: 4, 
        backgroundColor: '#030712',
        style: {
          transform: 'none',
          margin: '0',
          padding: '0',
          width: isVertical ? '360px' : '520px',
          height: isVertical ? '560px' : '300px'
        }
      };

      const dataUrl = await toPng(clonedCard, options);
      
      if (isIOSDevice()) {
        // iOS/iPhone specific flow: Show custom visual instructions modal & try native sharing
        setIosModalImage(dataUrl);
        
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], `parxee-city-${name}.png`, { type: 'image/png' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Parxéé City ID Card`,
              text: `My Parxéé City Smart QR Card`
            });
            toast.success("Share sheet opened!");
          } else {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `parxee-city-${name}.png`;
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
          }
        } catch (downloadErr) {
          console.warn("iOS sharing/download failed:", downloadErr);
        }
      } else {
        // Original Android / Desktop flow
        const link = document.createElement('a');
        link.download = `parxee-city-${name}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Final Download Error:', err);
      toast.error("Mobile render failed. Please use a screenshot if this continues.");
    } finally {
      // Step 4: Immediate cleanup
      if (document.body.contains(clonedCard)) {
        document.body.removeChild(clonedCard);
      }
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
        title="Parxéé City - Smart Vehicle Protection & Emergency Services"
        description="Secure your vehicle with Parxéé City's smart QR-based Emergency Cards. Get 24/7 roadside assistance, highway engine repair, and instant contact access."
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
          <a href="tel:+919112200000" style={{ fontSize: '0.95rem', fontWeight: '900', color: '#fff' }}>HELPLINE: 91122 00000</a>
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
            opacity: 1, 
            animation: 'blurIn 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))',
            fontSize: 'clamp(3rem, 8vw, 6rem)', 
            letterSpacing: 'var(--tracking-tighter)', 
            fontWeight: '900',
            marginBottom: '2rem'
          }}>
            Automotive Security <span className="text-gradient shimmer-text">Reimagined</span>
          </h1>
          
          <div className="reveal active" style={{ transitionDelay: '0.2s' }}>
            <p className="hero-desc reveal active" style={{ 
              animation: 'fadeIn 1s ease-out 0.5s forwards',
              opacity: 0,
              fontSize: '1.25rem', 
              textShadow: 'none', 
              marginBottom: '4rem' 
            }}>
              Advanced AI Diagnostics. Roadside Intelligence. <br /> 
              Instant Emergency QR Profiles for Smart Drivers.
            </p>
          </div>
          
          <div className="reveal active" style={{ transitionDelay: '0.4s' }}>
            <div className="hero-cta-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <Link to="/mechanics" className="btn-gradient light-sweep" style={{ padding: '16px 36px', borderRadius: '18px', fontSize: '1.05rem' }}>
                <MapPin size={22} />
                Find Assistance
              </Link>
              <Link to="/help" className="glass" style={{ padding: '16px 36px', borderRadius: '18px', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Join Community
              </Link>
            </div>
          </div>

          {(user?.subscriptionTier?.toLowerCase() === 'diamond' || user?.subscriptionTier?.toLowerCase() === 'pro') && (
            <div className="reveal active" style={{ transitionDelay: '0.5s', marginBottom: '2rem' }}>
              <div style={{ padding: '12px 24px', borderRadius: '50px', background: 'rgba(94, 234, 212, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <Sparkles size={18} />
                Welcome Back, DIAMOND MEMBER
              </div>
            </div>
          )}

          {/* ========== LIVE VEHICLE COMMAND GRID (6 NEON TILES + TELEMETRY) ========== */}
          <LiveCommandGrid />

          <div className="bento-grid reveal active" style={{ transitionDelay: '0.6s' }}>
            <div className="bento-item bento-large light-sweep" style={{ textAlign: 'left', justifyContent: 'flex-end' }}>
               <div className="feature-icon-box" style={{ marginBottom: 'auton', width: '56px', height: '56px' }}><Cpu size={32} /></div>
               <div>
                  <h4 className="feature-title" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Cam Mode Diagnostics</h4>
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
               <p style={{ color: 'rgba(255,255,255,0.8)' }}>Broadcast your emergency to the nearest verified helplines in real-time.</p>
            </div>

            <div className="bento-item light-sweep">
               <div className="feature-icon-box" style={{ width: '48px', height: '48px' }}><Smartphone size={24} /></div>
               <h4 className="feature-title" style={{ fontSize: '1.1rem' }}>Smart QR</h4>
               <p style={{ fontSize: '0.8rem' }}>Instant digital identity card.</p>
            </div>
          </div>

          {/* ========== VERIFIED LIVE TRUST PROOF & CERTIFICATION STRIP ========== */}
          <TrustProofStrip />
          
        </div>
      </section>

      {/* ======================================================== */}
      {/* 🎬 CINEMATIC INTERACTIVE DEMO VIDEO & EXPLAINER PLAYER */}
      {/* ======================================================== */}
      <section id="demo-video" className="reveal active" style={{ padding: '70px 0', position: 'relative' }}>
        <div className="container">
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(45, 212, 191, 0.12)', 
              color: '#2dd4bf', 
              padding: '8px 22px', 
              borderRadius: '50px', 
              fontSize: '0.8rem', 
              fontWeight: '800', 
              letterSpacing: '1px', 
              marginBottom: '1.25rem', 
              border: '1px solid rgba(45, 212, 191, 0.25)' 
            }}>
              <Video size={16} /> 🎬 INTERACTIVE DEMO & WORKFLOW
            </div>
            <h2 className="section-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', letterSpacing: 'var(--tracking-tight)' }}>
              See How Parxéé <span className="text-gradient">Protects Your Vehicle</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
              Experience the seamless 30-second workflow: QR Tagging, Instant Camera Scan, and 100% Privacy Shielding.
            </p>
          </div>

          {/* Cinematic Video Player Container */}
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(3, 7, 18, 0.98) 100%)',
            borderRadius: '28px',
            border: '1.5px solid rgba(45, 212, 191, 0.3)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(45, 212, 191, 0.15)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            
            {/* Player Top Bar (Status & Controls) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'rgba(0, 0, 0, 0.4)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Live Badge & Scene Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }}></span>
                  LIVE SIMULATION
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#fff' }}>
                  <span style={{ color: DEMO_SCENES[demoScene].color, marginRight: '6px' }}>{DEMO_SCENES[demoScene].step}:</span>
                  {DEMO_SCENES[demoScene].title}
                </div>
              </div>

              {/* Player Top Action Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Voice Narration Toggle */}
                <button
                  onClick={toggleDemoAudio}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isDemoAudioOn ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: isDemoAudioOn ? '#2dd4bf' : 'var(--muted)',
                    border: isDemoAudioOn ? '1px solid rgba(45, 212, 191, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="Audio Narration Voiceover"
                >
                  {isDemoAudioOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  <span>{isDemoAudioOn ? 'Voice On' : 'Voice Off'}</span>
                </button>

                {/* Play / Pause */}
                <button
                  onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {isPlayingDemo ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlayingDemo ? 'Pause' : 'Play'}</span>
                </button>

                {/* Restart */}
                <button
                  onClick={() => { handleSelectScene(0); setIsPlayingDemo(true); }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                  title="Restart Demo from Step 1"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Video Canvas Stage (Scene Visualizer) */}
            <div style={{
              minHeight: '440px',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.5) 0%, rgba(3, 7, 18, 0.9) 100%)'
            }}>

              {/* SCENE 0: SMART TAG ON WINDSHIELD */}
              {demoScene === 0 && (
                <div className="fadeIn" style={{ width: '100%', maxWidth: '720px', textAlign: 'center' }}>
                  {/* Car Windshield Glass Mockup */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(15, 23, 42, 0.7) 100%)',
                    borderRadius: '24px',
                    border: '2px solid rgba(56, 189, 248, 0.3)',
                    padding: '30px 24px',
                    boxShadow: 'inset 0 0 30px rgba(56, 189, 248, 0.1), 0 15px 35px rgba(0,0,0,0.5)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Glass Reflection Highlight */}
                    <div style={{ position: 'absolute', top: 0, left: '-50%', width: '200%', height: '100%', background: 'linear-gradient(60deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)', pointerEvents: 'none' }}></div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                      {/* Left: Sticker Graphic */}
                      <div style={{
                        background: '#030712',
                        border: '2px solid #2dd4bf',
                        borderRadius: '16px',
                        padding: '16px',
                        width: '180px',
                        margin: '0 auto',
                        boxShadow: '0 10px 25px rgba(45, 212, 191, 0.3)',
                        textAlign: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#2dd4bf' }}>PARXÉÉ TAG</span>
                          <ShieldCheck size={14} color="#2dd4bf" />
                        </div>
                        <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', display: 'inline-block', marginBottom: '8px' }}>
                          <QrIcon size={75} color="#000" />
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '900', color: '#fff', background: 'rgba(255,255,255,0.08)', padding: '4px', borderRadius: '6px' }}>
                          DL 01 AB 1234
                        </div>
                      </div>

                      {/* Right: Key Feature Points */}
                      <div style={{ flex: 1, minWidth: '260px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.3)', padding: '12px 16px', borderRadius: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2dd4bf', fontWeight: '800', fontSize: '0.9rem', marginBottom: '4px' }}>
                            <ShieldCheck size={18} /> 100% Number Privacy
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                            Your personal phone number remains strictly private. No more leaving vulnerable paper notes on the dashboard.
                          </div>
                        </div>

                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '12px 16px', borderRadius: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '800', fontSize: '0.9rem', marginBottom: '4px' }}>
                            <Zap size={18} /> Weatherproof & UV-Resistant
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                            Built with industrial-grade vinyl film. Resistant to rain, heat, and sun damage for years of durability.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 1: STRANGER SCANS QR WITH PHONE */}
              {demoScene === 1 && (
                <div className="fadeIn" style={{ width: '100%', maxWidth: '720px', textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '24px'
                  }}>
                    {/* Phone Camera Scanner Mockup */}
                    <div style={{
                      width: '240px',
                      height: '340px',
                      background: '#000',
                      borderRadius: '28px',
                      border: '3px solid rgba(56, 189, 248, 0.6)',
                      padding: '16px',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(56, 189, 248, 0.2)'
                    }}>
                      {/* Top Camera Bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: '#fff' }}>
                        <span>📷 CAMERA SCANNER</span>
                        <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>AUTO-FOCUS</span>
                      </div>

                      {/* Viewfinder Target */}
                      <div style={{
                        width: '140px',
                        height: '140px',
                        margin: '0 auto',
                        border: '2px dashed #38bdf8',
                        borderRadius: '16px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(56, 189, 248, 0.05)'
                      }}>
                        {/* Scanning Laser Beam Animation */}
                        <div style={{
                          position: 'absolute',
                          top: '10%',
                          left: 0,
                          width: '100%',
                          height: '2px',
                          background: '#38bdf8',
                          boxShadow: '0 0 10px #38bdf8',
                          animation: 'pulse 1s infinite alternate'
                        }}></div>
                        <QrIcon size={65} color="#38bdf8" />
                      </div>

                      {/* Instant URL Recognized Banner */}
                      <div style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', borderRadius: '10px', padding: '8px', fontSize: '0.7rem', color: '#fff', fontWeight: '700' }}>
                        🔗 parxee.com/v/DL01AB1234<br/>
                        <span style={{ color: '#2dd4bf', fontSize: '0.6rem' }}>⚡ Tap to Open Vehicle Shield</span>
                      </div>
                    </div>

                    {/* Explainer Sidecard */}
                    <div style={{ flex: 1, minWidth: '260px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                          📸 No App Download Required!
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                          Guards, passerby, or neighbors can scan instantly with their default phone camera or Google Lens. Connects in under 0.5 seconds.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, background: 'rgba(56, 189, 248, 0.08)', padding: '10px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                          <div style={{ fontSize: '1rem', fontWeight: '900', color: '#38bdf8' }}>0.5s</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Scan Latency</div>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(45, 212, 191, 0.08)', padding: '10px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
                          <div style={{ fontSize: '1rem', fontWeight: '900', color: '#2dd4bf' }}>100%</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>Smartphones Supported</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 2: PRIVACY SHIELD ACTION SCREEN */}
              {demoScene === 2 && (
                <div className="fadeIn" style={{ width: '100%', maxWidth: '720px', textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '24px'
                  }}>
                    {/* Parxee Mobile Portal Mockup */}
                    <div style={{
                      width: '260px',
                      background: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '24px',
                      border: '2px solid rgba(168, 85, 247, 0.5)',
                      padding: '18px 16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(168, 85, 247, 0.25)',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '4px 10px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: '800', marginBottom: '8px' }}>
                        <ShieldCheck size={12} /> SECURE PORTAL
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#fff' }}>DL 01 AB 1234</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '14px' }}>Owner Details Protected by Parxéé Shield</div>

                      {/* 3 Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', padding: '10px 12px', borderRadius: '10px', color: '#fff', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={14} /> 1-Click WhatsApp Alert</span>
                          <span style={{ fontSize: '0.6rem', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>INSTANT</span>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', padding: '10px 12px', borderRadius: '10px', color: '#fff', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><PhoneCall size={14} /> Masked Voice Call</span>
                          <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>ENCRYPTED</span>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', padding: '10px 12px', borderRadius: '10px', color: '#fff', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14} /> Roadside SOS</span>
                          <span style={{ fontSize: '0.6rem', background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>24/7</span>
                        </div>
                      </div>
                    </div>

                    {/* Explainer text */}
                    <div style={{ flex: 1, minWidth: '260px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#c084fc', marginBottom: '6px' }}>
                          🔒 Zero Spam & Complete Identity Shield
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                          Callers and strangers never see your actual contact number. Calls are routed anonymously through cloud encryption, and alerts are transmitted automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SCENE 3: OWNER RECEIVES INSTANT WHATSAPP ALERT */}
              {demoScene === 3 && (
                <div className="fadeIn" style={{ width: '100%', maxWidth: '720px', textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '24px'
                  }}>
                    {/* Owner's Phone Mockup with WhatsApp Bubble */}
                    <div style={{
                      width: '280px',
                      background: '#0b141a',
                      borderRadius: '24px',
                      border: '2px solid rgba(16, 185, 129, 0.5)',
                      padding: '16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(16, 185, 129, 0.25)',
                      textAlign: 'left'
                    }}>
                      {/* WhatsApp Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff' }}>Parxéé Safety Bot</div>
                          <div style={{ fontSize: '0.65rem', color: '#25D366' }}>Verified Business ✅</div>
                        </div>
                      </div>

                      {/* WhatsApp Chat Bubble */}
                      <div style={{
                        background: '#005c4b',
                        color: '#fff',
                        borderRadius: '12px 12px 12px 0',
                        padding: '12px',
                        fontSize: '0.75rem',
                        lineHeight: '1.45',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{ fontWeight: '800', color: '#2dd4bf', marginBottom: '4px' }}>🚨 PARXÉÉ PARKING ALERT</div>
                        Your vehicle <b>(DL 01 AB 1234)</b> has a parking notice: <br/>
                        <span style={{ color: '#fef08a', fontWeight: '700' }}>"Vehicle is blocking driveway. Please relocate."</span>
                        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '0.7rem', color: '#a7f3d0' }}>
                          📍 Live GPS Location Attached<br/>
                          ⏱️ Sent just now
                        </div>
                      </div>
                    </div>

                    {/* Explainer & Success */}
                    <div style={{ flex: 1, minWidth: '260px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: '800', color: '#10b981', marginBottom: '6px' }}>
                          <CheckCircle2 size={20} /> Resolved in 10 Seconds!
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                          Move your vehicle quickly and calmly. Avoid accidental towing, traffic penalties, and neighborhood parking disputes.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          const cta = document.getElementById('hero-cta') || document.querySelector('.btn-primary');
                          if (cta) cta.scrollIntoView({ behavior: 'smooth' });
                          else navigate('/auth');
                        }}
                        style={{
                          background: 'var(--gradient-primary)',
                          color: '#fff',
                          border: 'none',
                          padding: '14px 24px',
                          borderRadius: '12px',
                          fontSize: '0.9rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 8px 25px rgba(45, 212, 191, 0.4)'
                        }}
                      >
                        <span>Order Parxéé Smart Tag Now (₹299)</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Timeline Progress & Scene Switcher */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '16px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {/* 4 Segmented Progress Bars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {DEMO_SCENES.map((scene, idx) => (
                  <div
                    key={scene.id}
                    onClick={() => handleSelectScene(idx)}
                    style={{
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      height: '100%',
                      background: scene.color,
                      width: demoScene === idx ? `${demoProgress}%` : demoScene > idx ? '100%' : '0%',
                      transition: demoScene === idx ? 'width 0.1s linear' : 'none'
                    }}></div>
                  </div>
                ))}
              </div>

              {/* Interactive Scene Tab Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '8px' }}>
                {DEMO_SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSelectScene(idx)}
                    style={{
                      background: demoScene === idx ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: demoScene === idx ? `1.5px solid ${scene.color}` : '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '8px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: scene.color }}>
                      0{idx + 1}
                    </span>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>{scene.title.split(' ')[0]} {scene.title.split(' ')[1] || ''}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{scene.badge}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 3 Step Quick Overview Cards Below Video */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginTop: '3rem'
          }}>
            <div className="glass-card bento-item" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem', marginBottom: '14px' }}>
                1
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>Apply on Windshield</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                Activate your tag online and easily stick it onto your car's front windshield inside in just 30 seconds.
              </p>
            </div>

            <div className="glass-card bento-item" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem', marginBottom: '14px' }}>
                2
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>Scan in Emergency</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                If your car is blocking a gate or in danger, anyone scans the QR using their standard smartphone camera.
              </p>
            </div>

            <div className="glass-card bento-item" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem', marginBottom: '14px' }}>
                3
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>Receive Instant Alerts</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: '1.5' }}>
                Get instant WhatsApp messages or encrypted voice calls immediately while keeping your phone number completely private.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========== CLEAR SOS EMERGENCY WORKFLOW EXPLAINER ========== */}
      <SOSWorkflowExplainer />

      {/* ========== REAL-LIFE HIGHWAY USE CASES & SITUATIONS ========== */}
      <RealUseCasesGrid />

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
            <a href="tel:+919112200000" className="btn-gradient light-sweep" style={{ background: 'var(--gradient-emergency)', padding: '16px 40px', borderRadius: '50px' }}>Call Helpline: 91122 00000</a>
            <p className="emergency-location" style={{ marginTop: '1.5rem', fontSize: '0.8rem', opacity: 0.6 }}>
              <MapPin size={14} /> ACTIVE IN: {locationLabel}
            </p>
          </div>
        </div>
      </section>

      {/* ========== SERVICE COVERAGE & HIGHWAY RADAR CHECKER ========== */}
      <ServiceCoverageChecker />

      {/* ========== TRANSPARENT PRICING & PLAN COMPARISON TABLE ========== */}
      <PricingComparisonTable onOpenPayment={onOpenPayment} />

      {/* ========== ZERO PHONE LEAKAGE & PRIVACY SHIELD DIAGRAM ========== */}
      <PrivacySecurityDiagram />

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
                CUSTOMER CARD
              </button>
            </div>

            <div className="reveal" style={{ transitionDelay: '0.2s', width: '100%', display: 'flex', justifyContent: 'center' }}>
              {(() => {
                const guestUser = { name: 'GUEST USER', plateNumber: 'UP 16 XX 0000', subscriptionTier: 'silver' };
                const displayUser = user || guestUser;

                return (
                   <div className="fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%', alignItems: 'center' }}>
                     {!user && (
                       <div className="hero-badge glass" style={{ marginBottom: '0', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '12px 24px', borderRadius: '50px' }}>
                          <Sparkles size={16} style={{ marginRight: '8px' }} />
                          PREVIEW: Login to personalize your card
                       </div>
                     )}
                       {activeCard === 'profile' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '24px 20px', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', minWidth: '320px', maxWidth: '385px', width: '100%', margin: '0 auto' }}>
                          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '12px' }}>
                            STICKER ID: {user?.smartTagId || 'PC000001'}
                          </span>
                          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0', overflow: 'visible' }}>
                            <div ref={qrRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                              <EmergencySticker 
                                user={displayUser} 
                                qrUrl={qrCodeDataUrl} 
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', flexWrap: 'wrap', marginTop: '14px' }}>
                            <button 
                              onClick={downloadQR} 
                              className="btn-gradient light-sweep" 
                              style={{ padding: '12px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', border: 'none', color: '#000', cursor: 'pointer', flex: 1, textAlign: 'center', minWidth: '130px' }}
                            >
                              Download HQ Card
                            </button>
                            <button 
                              onClick={() => navigate('/activate')}
                              className="btn-secondary" 
                              style={{ padding: '12px 20px', borderRadius: '8px', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', flex: 1, textAlign: 'center', minWidth: '130px' }}
                            >
                              Activate Card
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="qr-container" style={{ border: 'none', background: 'transparent', padding: '0', perspective: '2000px' }}>
                           <div className="light-sweep" style={{ borderRadius: '32px' }}>
                              <EmergencyCard 
                                ref={qrRef}
                                user={displayUser} 
                                qrUrl={qrCodeDataUrl} 
                              />
                           </div>
                        </div>
                      )}

                      {!user && (
                         <div className="qr-actions" style={{ maxWidth: '400px', width: '100%', marginTop: '2rem' }}>
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

      {/* ========== REAL VERIFIED VEHICLE OWNER TESTIMONIALS ========== */}
      <CustomerTestimonialsGrid />

      {/* ========== SEARCHABLE CATEGORIZED FAQ SECTION ========== */}
      <EnhancedFAQSection />

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
              <button type="submit" disabled={isSubmitting} className="btn-gradient full-width light-sweep" style={{ padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? (
                  <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                ) : (
                  <Send size={18} />
                )}
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </button>
            </form>
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        </div>
      </section>

      {/* ========== iOS SAVE MODAL ========== */}
      {iosModalImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 10005,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={() => setIosModalImage(null)}
        >
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(244, 63, 94, 0.2)',
            textAlign: 'center',
            position: 'relative',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIosModalImage(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                lineHeight: '1'
              }}
            >
              ×
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              <ShieldCheck size={14} /> iPhone Save Instructions
            </div>

            <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Save Your Smart QR Card
            </h3>
            
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '20px' }}>
              Due to iOS Safari security policies, programmatic downloads are restricted. Please follow the instructions below to save your card:
            </p>

            {/* Generated Image Preview */}
            <div style={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              marginBottom: '20px',
              background: '#030712',
              position: 'relative'
            }}>
              <img 
                src={iosModalImage} 
                alt="Smart QR Card Preview" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block',
                  WebkitTouchCallout: 'default'
                }} 
              />
            </div>

            {/* Step-by-Step Instructions */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#f43f5e', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>1</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.3' }}>
                  <strong>Tap and hold</strong> (long-press) the card image above.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#f43f5e', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>2</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.3' }}>
                  Select <strong>"Save to Photos"</strong> or <strong>"Add to Photos"</strong>.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#f43f5e', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>3</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.3' }}>
                  Alternatively, you can take a <strong>screenshot</strong> of the card.
                </p>
              </div>
            </div>

            {/* Hindi Translation Helper */}
            <div style={{
              fontSize: '0.8rem',
              color: '#94a3b8',
              lineHeight: '1.4',
              fontStyle: 'italic',
              marginBottom: '20px',
              padding: '0 8px'
            }}>
              <strong>हिंदी सहायता:</strong> कार्ड इमेज पर कुछ सेकंड दबाकर रखें, फिर <strong>"Save to Photos"</strong> चुनें, या स्क्रीनशॉट लें।
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={async () => {
                  try {
                    const name = user?.name?.replace(/\s+/g, '-') || 'id-card';
                    const res = await fetch(iosModalImage);
                    const blob = await res.blob();
                    const file = new File([blob], `parxee-city-${name}.png`, { type: 'image/png' });
                    
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                      await navigator.share({
                        files: [file],
                        title: `Parxéé City ID Card`,
                        text: `My Parxéé City Smart QR Card`
                      });
                      toast.success("Share sheet opened!");
                    } else {
                      const blobUrl = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.download = `parxee-city-${name}.png`;
                      link.href = blobUrl;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                      toast.success("Download triggered!");
                    }
                  } catch (e) {
                    console.error("Save/Share failed:", e);
                    toast.error("Blocked by browser. Please use Tap & Hold.");
                  }
                }}
                className="btn-gradient light-sweep" 
                style={{ flex: 1, padding: '14px', borderRadius: '14px', fontWeight: 'bold', fontSize: '0.9rem' }}
              >
                Share / Save (शेयर / सेव करें)
              </button>
              <button 
                onClick={() => setIosModalImage(null)}
                style={{ 
                  flex: 1, 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: '#fff', 
                  padding: '14px', 
                  borderRadius: '14px', 
                  fontWeight: 'bold', 
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
          
          <style>{`
            @keyframes scaleUp {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
// Revert to stable build - Trigger rebuild
