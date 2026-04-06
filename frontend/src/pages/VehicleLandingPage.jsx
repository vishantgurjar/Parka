import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PhoneCall, AlertTriangle, User, Car, MapPin, ShieldCheck, Wrench, ChevronRight, Lock } from 'lucide-react';
import SEO from '../components/SEO';
import SecureCallModal from '../components/SecureCallModal';

export default function VehicleLandingPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSecureCall, setShowSecureCall] = useState(false);

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
          
          {(vehicle.subscriptionTier === 'gold' || vehicle.subscriptionTier === 'diamond') ? (
            <button onClick={() => setShowSecureCall(true)} className="btn-gradient" style={{ 
              border: 'none',
              cursor: 'pointer',
              padding: '20px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              color: '#fff',
              boxShadow: '0 10px 20px rgba(234, 179, 8, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                  <Lock size={24} />
                </div>
                Secure WebRTC Call
              </div>
              <ChevronRight size={24} />
            </button>
          ) : (
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
          )}
          
          {/* Point 3: WhatsApp Integration (PRO Only) */}
          {['silver', 'gold', 'diamond'].includes(vehicle.subscriptionTier) && (
            <a 
              href={`https://wa.me/${vehicle.phone}?text=${encodeURIComponent(`Hi ${vehicle.name}, I'm near your ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber || 'vehicle'}) and wanted to reach out regarding it.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                textDecoration: 'none', 
                padding: '20px', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                background: '#25D366', // WhatsApp Green
                color: '#fff',
                boxShadow: '0 10px 20px rgba(37, 211, 102, 0.2)',
                border: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                WhatsApp Chat (PRO)
              </div>
              <ChevronRight size={24} />
            </a>
          )}

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

      {showSecureCall && (
        <SecureCallModal vehicleId={vehicle._id} onClose={() => setShowSecureCall(false)} />
      )}
    </div>
  );
}
