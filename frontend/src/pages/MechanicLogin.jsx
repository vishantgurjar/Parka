import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Wrench } from 'lucide-react';
import SEO from '../components/SEO';

export default function MechanicLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/mechanics/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('parkeActiveMechanic', JSON.stringify(data.mechanic));
        localStorage.setItem('parkeMechanicToken', data.token);
        navigate('/mechanic-dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SEO title="Mechanic Login - Parkéé City" />
      <div className="container" style={{ maxWidth: '400px' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Wrench size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.8rem', color: 'var(--fg)' }}>Mechanic Portal</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Log in to manage your roadside assistance profile</p>
          </div>

          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label">Password</label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </div>
            
            <button type="submit" className="btn-gradient full-width" style={{ padding: '14px', borderRadius: '8px', marginTop: '1rem', fontWeight: 'bold' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In as Mechanic'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
            Not registered? <span onClick={() => navigate('/mechanic-register')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>Join Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}
