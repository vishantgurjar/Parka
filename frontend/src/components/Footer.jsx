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
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="logo" onClick={(e) => handleScroll(e, 'home')}>
              <div className="logo-icon">
                <img src="/logo.png" alt="Parkéé City Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
              </div>
              <span className="logo-text">Parkéé City</span>
            </Link>
            <p>Revolutionizing urban parking with smart technology and seamless QR-based access. Emergency highway assistance available 24/7.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Quick Links</h4>
              <a href="#home" onClick={(e) => handleScroll(e, 'home')}>Home</a>
              <a href="#emergency" onClick={(e) => handleScroll(e, 'emergency')}>Emergency Service</a>
              <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')}>Pricing</a>
              <a href="#contact" onClick={(e) => handleScroll(e, 'contact')}>Contact</a>
            </div>
            <div>
              <h4>Support</h4>
              <Link to="/help-center">Help Center</Link>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-of-service">Terms of Service</Link>
              <Link to="/faq">FAQ</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Parkéé City. All rights reserved. Built with ❤️ for smarter cities
        </div>
      </div>
    </footer>
  );
}
