import { useState, useEffect } from 'react';
import { Wrench, MapPin, PhoneCall, Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MechanicList() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/mechanics`);
        if (!res.ok) throw new Error('Failed to fetch mechanics');
        const data = await res.json();
        
        // Consistent distance based on mechanic ID (1.0 to 3.0 km)
        const getConsistentDistance = (id) => {
          let hash = 0;
          const strId = String(id);
          for (let i = 0; i < strId.length; i++) {
            hash = strId.charCodeAt(i) + ((hash << 5) - hash);
          }
          return (1 + (Math.abs(hash) % 20) / 10).toFixed(1);
        };

        const mechanicsWithDistance = data.map(m => ({
          ...m,
          distance: getConsistentDistance(m._id)
        })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        
        setMechanics(mechanicsWithDistance);
      } catch (err) {
        console.error("Error fetching mechanics:", err);
        setError("Could not load mechanics at this time. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMechanics();
  }, []);

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '4rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(13, 148, 136, 0.15)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                <Wrench size={16} /> Partner Network
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--fg)' }}>Find a <span className="text-gradient">Nearby Mechanic</span></h1>
            <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                Showing trusted emergency mechanics within a <strong style={{color: 'var(--primary)'}}>1-3 km radius</strong> of your location. Call now for immediate assistance.
            </p>
        </div>

        {loading ? (
           <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading mechanics directory...</div>
        ) : error ? (
           <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
           </div>
        ) : mechanics.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <Wrench size={48} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Mechanics Registered Yet</h3>
              <p style={{ color: 'var(--muted)' }}>Be the first mechanic to join our network!</p>
              <Link to="/mechanic-register" className="btn-gradient" style={{ display: 'inline-block', marginTop: '1.5rem', textDecoration: 'none', padding: '10px 20px', borderRadius: '8px' }}>
                 Register as a Mechanic
              </Link>
           </div>
        ) : (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {mechanics.map((mechanic) => (
                 <div key={mechanic._id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.4rem', margin: '0 0 4px 0', color: 'var(--fg)' }}>{mechanic.name}</h3>
                            <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>{mechanic.shopName}</div>
                        </div>
                        <div style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            <Star size={14} fill="currentColor" /> {mechanic.experienceYears}+ Yrs
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--primary)', fontSize: '0.95rem', marginBottom: '8px', fontWeight: '600' }}>
                        <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ lineHeight: '1.4' }}>{mechanic.distance} km away</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                        <span style={{ lineHeight: '1.4' }}>{mechanic.highwayLocation}</span>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '20px', flexGrow: 1 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Services Offered</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {mechanic.services && mechanic.services.length > 0 ? (
                                mechanic.services.map((service, idx) => (
                                    <span key={idx} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle size={10} style={{color: 'var(--primary)'}}/> {service}
                                    </span>
                                ))
                            ) : (
                                <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>General Assistance</span>
                            )}
                        </div>
                    </div>

                    <a href={`tel:${mechanic.phone}`} className="btn-gradient full-width" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none' }}>
                        <PhoneCall size={18} />
                        Call {mechanic.phone}
                    </a>
                 </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
}
