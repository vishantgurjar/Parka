import { useState, useContext } from 'react';
import { Car } from 'lucide-react';
import { AuthContext } from '../App';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        login(data.user, data.token);
        alert(`Welcome back, ${data.user.name}!`);
        navigate('/');
      } else {
        alert(data.message || 'Login failed. Please check credentials or register initially.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Network error connecting to the server.');
    }
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', margin: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Car size={40} style={{ color: 'var(--primary)', margin: '0 auto' }} />
          <h3 style={{ marginTop: '1rem', fontSize: '1.75rem' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '1rem', marginTop: '0.5rem' }}>
            {mode === 'login' ? 'Log in to manage your parking & subscriptions' : 'Join Parké City for smart parking and emergency services'}
          </p>
        </div>

        {mode === 'login' ? (
           <form onSubmit={handleLogin}>
             <div style={{ marginBottom: '1.5rem' }}>
               <input type="email" placeholder="Email Address" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{ width: '100%', padding: '14px', marginBottom: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontSize: '1rem' }} />
               <input type="password" placeholder="Password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontSize: '1rem' }} />
             </div>
             <button type="submit" className="btn-gradient full-width" style={{ padding: '16px', fontSize: '1.1rem', border: 'none', cursor: 'pointer', borderRadius: '8px', color: 'white', fontWeight: 'bold' }}>Log In</button>
             <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '1rem', color: 'var(--muted)' }}>
               Don't have an account? <button type="button" onClick={() => setMode('register')} style={{ color: 'var(--primary)', background:'none', border:'none', fontWeight: 'bold', cursor: 'pointer' }}>Register here</button>
             </p>
             <div className="divider" style={{ margin: '1.5rem 0' }}><span>or</span></div>
             <p style={{ textAlign: 'center', fontSize: '1rem', color: 'var(--muted)' }}>
               <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Go to Extended Registration Portal</Link>
             </p>
           </form>
        ) : (
          <div>
            <p style={{textAlign: "center", marginBottom: "1.5rem", fontSize: '1.1rem', lineHeight: '1.5'}}>
              We utilize a dedicated Extended Registration Portal to collect all required vehicle details and KYC documents securely.
            </p>
            <button 
              onClick={() => navigate('/register')} 
              className="btn-gradient full-width" 
              style={{ padding: '16px', fontSize: '1.1rem', border: 'none', cursor: 'pointer', borderRadius: '8px', color: 'white', fontWeight: 'bold' }}
            >
              Go to Registration Portal
            </button>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '1rem', color: 'var(--muted)' }}>
               Already have an account? <button type="button" onClick={() => setMode('login')} style={{ color: 'var(--primary)', background:'none', border:'none', fontWeight: 'bold', cursor: 'pointer' }}>Log in here</button>
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
