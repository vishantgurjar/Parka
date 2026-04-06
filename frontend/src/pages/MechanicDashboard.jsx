import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Power, MapPin, Wrench, PhoneCall, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function MechanicDashboard() {
  const navigate = useNavigate();
  const [mechanic, setMechanic] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('parkeActiveMechanic');
    if (!saved) {
      navigate('/mechanic-login');
      return;
    }
    const parsed = JSON.parse(saved);
    setMechanic(parsed);
    setIsOnline(parsed.isAvailable !== false);
  }, [navigate]);

  const toggleStatus = async () => {
    setUpdating(true);
    try {
      const newStatus = !isOnline;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/mechanics/${mechanic._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus })
      });
      if (res.ok) {
        setIsOnline(newStatus);
        const updated = { ...mechanic, isAvailable: newStatus };
        setMechanic(updated);
        localStorage.setItem('parkeActiveMechanic', JSON.stringify(updated));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('parkeActiveMechanic');
    localStorage.removeItem('parkeMechanicToken');
    navigate('/');
  };

  if (!mechanic) return null;

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)' }}>
      <SEO title="Mechanic Dashboard - Parkéé City" />
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--fg)' }}>Dashboard</h1>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}>
            Sign Out
          </button>
        </div>

        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>Online Status</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: '0.95rem' }}>
              Turning this on will list you on the interactive map for drivers.
            </p>
          </div>
          <button 
            onClick={toggleStatus} 
            disabled={updating}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isOnline ? '#10b981' : '#ef4444',
              border: `2px solid ${isOnline ? '#10b981' : '#ef4444'}`,
              padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.3s ease'
            }}
          >
            <Power size={20} />
            {updating ? 'Updating...' : isOnline ? 'You are ONLINE' : 'You are OFFLINE'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wrench size={20} style={{ color: 'var(--primary)' }} /> Profile Info
            </h3>
            <p><strong>Name:</strong> {mechanic.name}</p>
            <p><strong>Shop:</strong> {mechanic.shopName}</p>
            <p><strong>Phone:</strong> {mechanic.phone}</p>
            <p><strong>Experience:</strong> {mechanic.experienceYears} Years</p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} style={{ color: 'var(--primary)' }} /> Location & Services
            </h3>
            <p><strong>Primary Highway:</strong> {mechanic.highwayLocation}</p>
            <div style={{ marginTop: '1rem' }}>
              <strong>Services:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {mechanic.services?.map(s => (
                  <span key={s} style={{ background: 'var(--border)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
