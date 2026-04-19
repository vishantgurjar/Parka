import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PhoneCall, AlertTriangle, User, Car, MapPin, ShieldCheck, Wrench, ChevronRight, Lock, Bell, Lightbulb, Info } from 'lucide-react';
import SEO from '../components/SEO';
import SecureCallModal from '../components/SecureCallModal';
import { AuthContext } from '../App';

export default function VehicleLandingPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSecureCall, setShowSecureCall] = useState(false);
  const [nearestMechanic, setNearestMechanic] = useState({ phone: '7895039922', name: 'Parkéé Admin' });
  const [reporting, setReporting] = useState(null);
  const { user: currentUser } = useContext(AuthContext);


  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app'}/api/auth/vehicle/${id}`);
        const data = await res.json();
        
        if (res.ok) {
          setVehicle(data);

          // Request location to notify owner (PRO Feature logic is on backend)
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                sendScanAlert(latitude, longitude, data.phone);
                fetchNearestMechanic(latitude, longitude);
              },

              (error) => {
                console.log("Location denied or error:", error);
                sendScanAlert(null, null, data.phone);
              }
            );
          } else {
            sendScanAlert(null, null, data.phone);
          }

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

    const sendScanAlert = (lat, lng, ownerPhone) => {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app'}/api/alerts/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vehicleId: id, 
          ownerPhone: ownerPhone,
          lat, 
          lng 
        })
      }).catch(err => console.log('Alert skipped:', err));
    };

    const fetchNearestMechanic = async (lat, lng) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app'}/api/mechanics/nearest?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          setNearestMechanic(data);
        }
      } catch (err) {
        console.log("Could not find nearest mechanic:", err);
      }
    };


    fetchVehicle();
  }, [id]);

  const handleReportIssue = async (issueType) => {
    if (reporting) return;
    setReporting(issueType);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app'}/api/user/report-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: id,
          reporterId: currentUser?._id,
          issueType: issueType
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Success! ${data.message}`);
      } else {
        alert(data.message || "Failed to notify owner.");
      }
    } catch (err) {
      console.error(err);
      alert("Error reporting issue. Check your connection.");
    } finally {
      setReporting(null);
    }
  };


  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
        <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Scanning Security Grid...</div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#030712', padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Security ID Invalid</h2>
        <p style={{ color: 'var(--muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>{error || "We could not find a verified vehicle linked to this ID."}</p>
        <Link to="/" className="btn-gradient" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '8px' }}>Register Your Own Vehicle</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712', padding: '80px 1rem 40px' }}>
      <SEO 
        title={`${vehicle?.name || 'Vehicle'}'s Protected Identity - Parkéé City`}
        description={`Safety landing page for ${vehicle?.name || 'Owner'}'s ${vehicle?.make || ''} ${vehicle?.model || 'Vehicle'}. Instant emergency contact access.`}
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
        <div className="electric-border" style={{ marginBottom: '2rem' }}>
          <div className="glass-premium" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div className="shimmer-shimmer"></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Owner</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{vehicle.name}</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Number</p>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>
                  {vehicle.subscriptionTier === 'diamond' || vehicle.subscriptionTier === 'gold' ? '🔒 SECURE (PRO)' : (vehicle.phone || 'N/A')}
                </p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vehicle Plate</p>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>{vehicle.plateNumber || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vehicle Model</p>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>{vehicle.make} {vehicle.model}</p>
              </div>
            </div>
            <div className="card-chip" style={{ position: 'absolute', top: '15px', right: '15px', opacity: 0.5 }}></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* 1. Primary Action: Secure Privacy Call (PRO) OR Direct Call (Standard) */}
          {(vehicle.subscriptionTier === 'gold' || vehicle.subscriptionTier === 'diamond') ? (
            <button onClick={() => setShowSecureCall(true)} className="btn-gradient" style={{ 
              border: 'none',
              cursor: 'pointer',
              padding: '18px', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '1.2rem',
              fontWeight: '800',
              background: 'var(--gradient-primary)',
              color: '#fff',
              boxShadow: '0 10px 25px rgba(13, 148, 136, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '14px' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem' }}>Secure Privacy Call</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: '500' }}>IDENTITY HIDDEN • ENCRYPTED</div>
                </div>
              </div>
              <ChevronRight size={24} />
            </button>
          ) : (
            <a href={`tel:${vehicle.phone || '7895039922'}`} className="btn-gradient" style={{ 
              textDecoration: 'none', 
              padding: '18px', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '1.2rem',
              fontWeight: '800',
              background: 'var(--gradient-primary)',
              color: '#fff',
              boxShadow: '0 10px 25px rgba(13, 148, 136, 0.3)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '14px' }}>
                  <PhoneCall size={24} />
                </div>
                Call Owner Now
              </div>
              <ChevronRight size={24} />
            </a>
          )}

          {/* 2. No Fallback for PRO (Strict Privacy) */}
          {!(vehicle.subscriptionTier === 'gold' || vehicle.subscriptionTier === 'diamond') && (
            <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', marginTop: '-5px' }}>
               Standard Network call will be initiated.
            </div>
          )}
          
          {/* 3. Highway Emergency Help (Critical) */}
          <a href={`tel:${nearestMechanic.phone}`} style={{ 
            textDecoration: 'none', 
            padding: '20px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            border: 'none',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: '900',
            color: '#fff',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)',
            animation: 'pulse-emergency 2s infinite'
          }}>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes pulse-emergency {
                0% { transform: scale(1); box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4); }
                50% { transform: scale(1.02); box-shadow: 0 15px 45px rgba(239, 68, 68, 0.6); }
                100% { transform: scale(1); box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4); }
              }
            `}} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '14px' }}>
                <AlertTriangle size={28} />
              </div>
              {nearestMechanic.name === 'Parkéé Admin' ? 'HIGHWAY HELP (24/7)' : `SOS: ${nearestMechanic.shopName || nearestMechanic.name}`}
            </div>
            <ChevronRight size={24} />
          </a>


          {/* 4. Find Mechanic */}
          <Link to="/mechanics" style={{ 
            textDecoration: 'none', 
            padding: '16px', 
            borderRadius: '20px', 
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

          {/* 5. Report Issue (Neighbor Rewards) */}
          <div className="glass-premium" style={{ marginTop: '1rem', padding: '1.5rem', borderRadius: '24px', border: '1px dashed var(--border)' }}>
             <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                <Bell size={18} /> Help the Owner
             </h3>
             <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                See something wrong? Notify {vehicle.name} instantly and earn <strong>50 Parkéé Points</strong>.
             </p>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { id: 'wrong_parking', label: 'Wrongly Parked', icon: AlertTriangle },
                  { id: 'lights_on', label: 'Lights are ON', icon: Lightbulb },
                  { id: 'window_open', label: 'Window Open', icon: Info },
                  { id: 'flat_tire', label: 'Flat Tire', icon: Wrench }
                ].map((item) => (
                  <button 
                    key={item.id}
                    disabled={reporting === item.id}
                    onClick={() => handleReportIssue(item.label)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      padding: '12px 8px',
                      borderRadius: '12px',
                      color: 'var(--fg)',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <item.icon size={14} color="var(--primary)" />
                    {reporting === item.label ? 'Notifying...' : item.label}
                  </button>
                ))}
             </div>
             
             {!currentUser && (
               <p style={{ marginTop: '12px', fontSize: '0.75rem', color: '#eab308', textAlign: 'center' }}>
                  Log in to earn points for helping!
               </p>
             )}
          </div>
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
