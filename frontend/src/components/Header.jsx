import { useContext, useState } from 'react';
import { Moon, Sun, Menu, X, Car, Package } from 'lucide-react';
import { ThemeContext, AuthContext } from '../App';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({ onOpenPayment }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    <header className="header glass" id="header" style={{ 
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(3, 7, 18, 0.4)',
      backdropFilter: 'blur(var(--glass-blur)) saturate(180%)',
      zIndex: '1000'
    }}>
      <div className="container header-inner" style={{ height: '80px' }}>
        <Link to="/" className="logo" onClick={(e) => handleScroll(e, 'home')}>
          <div className="logo-icon light-sweep" style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px',
            background: 'var(--gradient-primary)',
            boxShadow: '0 0 20px var(--primary-glow)'
          }}>
             <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
          </div>
          <span className="logo-text text-gradient" style={{ 
            fontSize: '1.4rem', 
            fontWeight: '800', 
            letterSpacing: 'var(--tracking-tighter)' 
          }}>PARKÉÉ</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-desktop" style={{ gap: '2.5rem' }}>
          <a href="#home" onClick={(e) => handleScroll(e, 'home')} style={{ letterSpacing: '0.02em', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700' }}>Home</a>
          <Link to="/community-help" style={{ letterSpacing: '0.02em', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700' }}>Community</Link>
          <a href="#emergency" onClick={(e) => handleScroll(e, 'emergency')} style={{ letterSpacing: '0.02em', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700' }}>SOS</a>
          <Link to="/mechanics" style={{ letterSpacing: '0.02em', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '700' }}>Mechanics</Link>
          <Link to="/ai-doctor" style={{ letterSpacing: '0.02em', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--primary)' }}>AI Doctor</Link>
          
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }}></div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <Link to="/profile" className="glass light-sweep" style={{ 
                padding: '8px 16px', 
                borderRadius: '50px', 
                fontSize: '0.8rem', 
                fontWeight: '700',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', 
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ opacity: 0.7 }}>Account</span>
                <span style={{ color: 'var(--primary)' }}>{user.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'transparent', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-gradient light-sweep" style={{ 
              padding: '10px 24px', 
              borderRadius: '50px', 
              fontSize: '0.8rem',
              fontWeight: '800',
              textTransform: 'uppercase'
            }}>
              Join Now
            </Link>
          )}
        </nav>
        
        {/* Header Actions (Always visible) */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={toggleTheme} className="theme-toggle glass" style={{ border: 'none', background: 'rgba(255,255,255,0.03)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-toggle" style={{ border: 'none', background: 'transparent', padding: '4px' }}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <nav className={`nav-mobile ${isMenuOpen ? 'show' : ''}`}>
        <a href="#home" onClick={(e) => handleScroll(e, 'home')}>Home</a>
        <Link to="/community-help" onClick={(e) => { setIsMenuOpen(false); }}>Community</Link>
        <a href="#emergency" onClick={(e) => handleScroll(e, 'emergency')}>Emergency SOS</a>
        <Link to="/mechanics" onClick={(e) => { setIsMenuOpen(false); }}>Find Mechanics</Link>
        <Link to="/ai-doctor" onClick={(e) => { setIsMenuOpen(false); }} className="shimmer-text" style={{fontWeight: 'bold'}}>AI Doctor</Link>
        <Link to="/sentinel" onClick={(e) => { setIsMenuOpen(false); }} style={{fontWeight: 'bold', color: '#38bdf8'}}>Sentinel Mode 🛡️</Link>
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

      </nav>
    </header>
  );
}
