import { useContext, useState } from 'react';
import { Moon, Sun, Menu, X, Car, Package, Zap } from 'lucide-react';
import { ThemeContext, AuthContext } from '../App';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({ onOpenPayment, installPrompt }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setIsMenuOpen(false);
  };

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    setIsMenuOpen(false);
    
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
    <header className="header glass" id="header" style={{ zIndex: '1000' }}>
      <div className="container header-inner" style={{ 
        height: window.innerWidth < 768 ? '60px' : '80px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        <Link to="/" className="logo" onClick={(e) => handleScroll(e, 'home')} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div className="logo-icon light-sweep" style={{ 
            width: window.innerWidth < 768 ? '32px' : '40px',
            height: window.innerWidth < 768 ? '32px' : '40px',
            borderRadius: '12px',
            background: 'var(--gradient-primary)',
            boxShadow: '0 0 20px var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
             <img src="/logo.png" alt="Parxéé City Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
          </div>
          <span className="logo-text text-gradient" style={{ 
            fontSize: window.innerWidth < 768 ? '1rem' : '1.25rem', 
            fontWeight: '800', 
            letterSpacing: 'var(--tracking-tighter)',
            whiteSpace: 'nowrap'
          }}>PARXÉÉ CITY</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-desktop" style={{ gap: '1.2rem', alignItems: 'center', marginLeft: 'auto', paddingLeft: '2rem' }}>
          <a href="#home" onClick={(e) => handleScroll(e, 'home')} style={{ letterSpacing: '0.02em', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', whiteSpace: 'nowrap' }}>Home</a>
          <Link to="/help" style={{ letterSpacing: '0.02em', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', whiteSpace: 'nowrap' }}>Community</Link>
          <a href="#emergency" onClick={(e) => handleScroll(e, 'emergency')} style={{ letterSpacing: '0.02em', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', whiteSpace: 'nowrap' }}>SOS</a>
          <Link to="/mechanics" style={{ letterSpacing: '0.02em', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', whiteSpace: 'nowrap' }}>Mechanics</Link>

          <Link to="/host" style={{ letterSpacing: '0.02em', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: '#10b981', whiteSpace: 'nowrap' }}>Host Space</Link>
          <Link to="/ev-hub" style={{ letterSpacing: '0.02em', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: '#2dd4bf', textShadow: '0 0 10px rgba(45, 212, 191, 0.4)', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
            <Zap size={13} style={{ fill: '#2dd4bf' }} /> EV Hub
          </Link>
          <Link to="/ai-doctor" style={{ letterSpacing: '0.02em', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--primary)', whiteSpace: 'nowrap' }}>AI Doctor</Link>
          <Link to="/cam" style={{ letterSpacing: '0.02em', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#38bdf8', whiteSpace: 'nowrap' }}>Cam Mode</Link>
          
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }}></div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              {(user.email === import.meta.env.VITE_ADMIN_EMAIL) && (
                <Link to="/sentinel-ops" className="glass shimmer-text" style={{ padding: '6px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '800', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', whiteSpace: 'nowrap' }}>
                  ADMIN OPS
                </Link>
              )}
              <Link to="/profile" className="glass light-sweep" style={{ 
                padding: '6px 12px', 
                borderRadius: '50px', 
                fontSize: '0.7rem', 
                fontWeight: '700',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', 
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}>
                <span style={{ opacity: 0.7 }}>Account</span>
                <span style={{ color: 'var(--primary)' }}>{user.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'transparent', color: 'var(--muted)', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer' }}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-gradient light-sweep" style={{ 
              padding: '10px 24px', 
              borderRadius: '50px', 
              fontSize: '0.8rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              Join Now
            </Link>
          )}
        </nav>
        
        {/* Header Actions (Always visible) */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-toggle" style={{ border: 'none', background: 'transparent', padding: '4px' }}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <nav className={`nav-mobile ${isMenuOpen ? 'show' : ''}`}>
        <a href="#home" onClick={(e) => handleScroll(e, 'home')}>Home</a>
        <Link to="/help" onClick={(e) => { setIsMenuOpen(false); }}>Community</Link>
        <a href="#emergency" onClick={(e) => handleScroll(e, 'emergency')}>Emergency SOS</a>
        <Link to="/mechanics" onClick={(e) => { setIsMenuOpen(false); }}>Find Mechanics</Link>

        <Link to="/host" onClick={(e) => { setIsMenuOpen(false); }} style={{fontWeight: 'bold', color: '#10b981'}}>Host Space</Link>
        <Link to="/ev-hub" onClick={(e) => { setIsMenuOpen(false); }} style={{fontWeight: 'bold', color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '6px'}}><Zap size={14} style={{ fill: '#2dd4bf' }} /> EV Hub ⚡</Link>
        <Link to="/ai-doctor" onClick={(e) => { setIsMenuOpen(false); }} className="shimmer-text" style={{fontWeight: 'bold'}}>AI Doctor</Link>
        <Link to="/cam" onClick={(e) => { setIsMenuOpen(false); }} style={{fontWeight: 'bold', color: '#38bdf8'}}>Cam Mode 🛡️</Link>
        {!user && <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="shimmer-text" style={{fontWeight: 'bold'}}>Get PRO</a>}

        {user && <a href="#qr" onClick={(e) => handleScroll(e, 'qr')}>QR Access</a>}
        <a href="#contact" onClick={(e) => handleScroll(e, 'contact')}>Contact</a>
        {user ? (
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
              Hello, {user?.name || 'User'}
              {['silver', 'gold', 'diamond'].includes(user.subscriptionTier?.toLowerCase()) && (
                <span className={`tier-badge tier-badge-${user.subscriptionTier?.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', background: 'var(--primary)', color: 'var(--primary-fg)' }}>
                  {user.subscriptionTier?.toUpperCase()}
                </span>
              )}
            </span>
            {(user.email === import.meta.env.VITE_ADMIN_EMAIL) && (
              <Link to="/sentinel-ops" onClick={() => setIsMenuOpen(false)} className="btn-secondary full-width" style={{ padding: '12px', borderRadius: '6px', marginBottom: '8px', textAlign: 'center', fontWeight: 'bold', display: 'block', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                ADMIN OPS
              </Link>
            )}
            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="btn-secondary full-width" style={{ padding: '12px', borderRadius: '6px', marginBottom: '8px', textAlign: 'center', fontWeight: 'bold', display: 'block' }}>
              My Profile
            </Link>
            <button onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }} className="btn-gradient full-width" style={{ padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/login" onClick={() => setIsMenuOpen(false)} className="btn-gradient full-width" style={{ marginTop: '1rem', padding: '12px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}>
            Login / Register
          </Link>
        )}

        {installPrompt && (
          <button onClick={handleInstallClick} className="btn-gradient full-width light-sweep" style={{ marginTop: '1rem', padding: '12px', borderRadius: '6px', fontWeight: 'bold', border: 'none' }}>
            📱 Install App
          </button>
        )}

      </nav>
    </header>
  );
}
