import { useContext, useState } from 'react';
import { Moon, Sun, Menu, X, Car } from 'lucide-react';
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
    <header className="header" id="header">
      <div className="container header-inner">
        <Link to="/" className="logo" onClick={(e) => handleScroll(e, 'home')}>
          <div className="logo-icon">
             <img src="/logo.png" alt="Parkéé City Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
          </div>
          <span className="logo-text">Parkéé City</span>
        </Link>
        <nav className="nav-desktop">
          <a href="#home" onClick={(e) => handleScroll(e, 'home')}>Home</a>
          <a href="#emergency" onClick={(e) => handleScroll(e, 'emergency')}>Emergency Service</a>
          <Link to="/mechanics" onClick={(e) => { setIsMenuOpen(false); }}>Find Mechanics</Link>
          <Link to="/ai-doctor" onClick={(e) => { setIsMenuOpen(false); }} className="shimmer-text" style={{fontWeight: 'bold'}}>AI Doctor</Link>
          <button onClick={() => { setIsMenuOpen(false); onOpenPayment('Gold PRO', 999); }} className="shimmer-text" style={{fontWeight: 'bold', background: 'transparent', border: 'none', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit'}}>Get PRO</button>
          {user && <a href="#qr" onClick={(e) => handleScroll(e, 'qr')}>QR Access</a>}
          <a href="#contact" onClick={(e) => handleScroll(e, 'contact')}>Contact</a>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: '600', padding: '0 10px', display: 'flex', alignItems: 'center', height: '100%' }}>
                Hi, {user.name?.split(' ')[0] || 'User'}
              </span>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-outline-primary" style={{ padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <button className="btn-login" onClick={() => navigate('/login')} style={{ background: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold' }}>Login / Register</button>
          )}
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className={`menu-toggle ${isMenuOpen ? 'menu-open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      <nav className={`nav-mobile ${isMenuOpen ? 'show' : ''}`} id="navMobile">
        <a href="#home" onClick={(e) => handleScroll(e, 'home')}>Home</a>
        <a href="#emergency" onClick={(e) => handleScroll(e, 'emergency')}>Emergency Service</a>
        <Link to="/mechanics" onClick={(e) => { setIsMenuOpen(false); }}>Find Mechanics</Link>
        <Link to="/ai-doctor" onClick={(e) => { setIsMenuOpen(false); }} className="shimmer-text" style={{fontWeight: 'bold'}}>AI Doctor</Link>
        <button onClick={() => { setIsMenuOpen(false); onOpenPayment('Gold PRO', 999); }} className="shimmer-text" style={{fontWeight: 'bold', background: 'transparent', border: 'none', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', padding: '0'}}>Get PRO</button>
        {user && <a href="#qr" onClick={(e) => handleScroll(e, 'qr')}>QR Access</a>}
        <a href="#contact" onClick={(e) => handleScroll(e, 'contact')}>Contact</a>
        {user ? (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ display: 'block', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 'bold', textAlign: 'center' }}>
              Hello, {user.name}
            </span>
            <button onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }} className="btn-gradient full-width" style={{ padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="btn-gradient full-width" style={{ padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>Login / Register</button>
          </div>
        )}
      </nav>
    </header>
  );
}
