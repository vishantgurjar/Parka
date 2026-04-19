import { Car } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer className="footer glass" style={{ 
      padding: window.innerWidth < 768 ? '40px 0 20px' : '80px 0 40px'
    }}>
      <div className="container">
        <div className="footer-top" style={{ marginBottom: '60px', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: '60px' }}>
          <div className="footer-brand" style={{ maxWidth: '400px' }}>
            <Link to="/" className="logo" onClick={(e) => handleScroll(e, 'home')} style={{ marginBottom: '24px' }}>
              <div className="logo-icon light-sweep" style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px',
                background: 'var(--gradient-primary)'
              }}>
                <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
              </div>
              <span className="logo-text text-gradient" style={{ fontSize: window.innerWidth < 768 ? '1.15rem' : '1.4rem', fontWeight: '800', letterSpacing: 'var(--tracking-tighter)' }}>PARKÉÉ CITY</span>
            </Link>
            <p style={{ fontSize: '1rem', opacity: 0.6, fontWeight: '500', lineHeight: '1.6' }}>
              Pioneering the next generation of vehicle security and highway response. Smart QR technology for a safer, smarter world.
            </p>
          </div>
          
          <div className="footer-links" style={{ gap: '4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Ecosystem</h4>
              <a href="#home" onClick={(e) => handleScroll(e, 'home')} style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: '600' }}>Platform</a>
              <a href="#emergency" onClick={(e) => handleScroll(e, 'emergency')} style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: '600' }}>SOS Response</a>
              <Link to="/mechanics" style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: '600' }}>Mechanics</Link>
              <Link to="/sentinel" style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: '600', color: 'var(--primary)' }}>Sentinel AI</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Company</h4>
              <Link to="/help-center" style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: '600' }}>Support</Link>
              <Link to="/privacy-policy" style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: '600' }}>Privacy</Link>
              <Link to="/terms-of-service" style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: '600' }}>Terms</Link>
              <Link to="/faq" style={{ fontSize: '0.9rem', opacity: 0.7, fontWeight: '600' }}>FAQ Hub</Link>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          fontSize: '0.8rem', 
          opacity: 0.4,
          fontWeight: '600',
          letterSpacing: '0.05em'
        }}>
          <div>
            <p>&copy; {new Date().getFullYear()} PARKÉÉ CITY. All rights reserved.</p>
            <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.5, letterSpacing: '2px' }}>PREMIUM AI ENGINE V3.1 ACTIVE</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>DESIGNED BY ANTIGRAVITY</span>
            <span>PROUDLY INDIAN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
