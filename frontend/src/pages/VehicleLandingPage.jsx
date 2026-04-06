import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PhoneCall, AlertTriangle, User, Car, MapPin, ShieldCheck, Wrench, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function VehicleLandingPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/auth/vehicle/${id}`);
        const data = await res.json();
        
        if (res.ok) {
          setVehicle(data);

          // Trigger Security SMS/WhatsApp Alert Mock
          fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/alerts/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehicleId: id })
          }).catch(err => console.log('Alert skipped:', err));

        } else {
          setError(data.message || 'Vehicle not found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={64} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops!</h2>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>{error}</p>
        <Link to="/" className="btn-gradient" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '8px' }}>Go Back Home</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 1rem 40px' }}>
      <SEO 
        title={`${vehicle.name}'s Vehicle - Parkéé City`}
        description={`Safety landing page for ${vehicle.name}'s ${vehicle.make} ${vehicle.model}. Instant emergency contact and roadside assistance.`}
      />
      
      <div className="container" style={{ maxWidth: '500px' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--card-bg)', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)'
          }}>
            <Car size={40} className="text-gradient" />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            <span className="text-gradient">Vehicle Info</span>
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(20, 184, 166, 0.1)', padding: '6px 12px', borderRadius: '100px', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}>
            <ShieldCheck size={16} />
            Verified Profile
          </div>
        </div>

        {/* Vehicle Details Card */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Owner</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{vehicle.name}</p>
            </div>
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Vehicle Plate</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>{vehicle.plateNumber || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Make & Model</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{vehicle.make} {vehicle.model}</p>
            </div>
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Color & Year</p>
              <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>{vehicle.color} ({vehicle.year})</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a href={`tel:${vehicle.phone || '7895039922'}`} className="btn-gradient" style={{ 
            textDecoration: 'none', 
            padding: '20px', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 20px rgba(13, 148, 136, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                <PhoneCall size={24} />
              </div>
              Contact Owner
            </div>
            <ChevronRight size={24} />
          </a>

          <a href="tel:7895039922" style={{ 
            textDecoration: 'none', 
            padding: '20px', 
            borderRadius: '16px', 
            background: 'var(--card-bg)',
            border: '2px solid rgba(239, 68, 68, 0.2)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#ef4444'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '12px' }}>
                <AlertTriangle size={24} />
              </div>
              Highway Help
            </div>
            <ChevronRight size={24} />
          </a>

          <Link to="/mechanics" style={{ 
            textDecoration: 'none', 
            padding: '20px', 
            borderRadius: '16px', 
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: 'var(--fg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '10px', borderRadius: '12px' }}>
                <Wrench size={24} />
              </div>
              Nearby Mechanic
            </div>
            <ChevronRight size={24} />
          </Link>
        </div>

        {/* Footer Info */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <img src="/logo.png" alt="Parkéé City" style={{ width: '32px', height: '32px', borderRadius: '8px', marginBottom: '1rem', opacity: 0.8 }} />
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            This vehicle is protected by <br/>
            <strong>Parkéé City Smart Parking Systems</strong>
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
              Register Your Vehicle →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
