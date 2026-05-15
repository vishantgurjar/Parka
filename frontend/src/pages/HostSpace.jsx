import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import SEO from '../components/SEO';
import { MapPin, DollarSign, Home, CheckCircle, Navigation } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function HostSpace() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    pricePerHour: '',
    description: '',
    lat: '',
    lng: ''
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || !token) {
    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
        <h2>Please Login to Host a Space</h2>
        <button onClick={() => navigate('/login')} className="btn-gradient" style={{ marginTop: '1rem', padding: '12px 24px', borderRadius: '12px' }}>Go to Login</button>
      </div>
    );
  }

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({ ...formData, lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast.success("Location acquired via GPS!");
          setIsLocating(false);
        },
        (err) => {
          toast.error("Could not get location. Please ensure location services are enabled.");
          setIsLocating(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      toast.error("Please click 'Get Current Location' first.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app';
      const res = await fetch(`${baseUrl}/api/spaces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address: formData.address,
          pricePerHour: Number(formData.pricePerHour),
          description: formData.description,
          location: { lat: formData.lat, lng: formData.lng }
        })
      });

      if (res.ok) {
        toast.success("Space listed successfully! Your space is now active.");
        navigate('/profile');
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to list space");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Host Space - PARXÉÉ SPACE" description="Rent your empty parking space and earn." />
      <div className="bg-grain"></div>
      
      <section style={{ padding: '8rem 0', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="hero-badge glass" style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '50px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '1rem' }}>
              <Home size={16} style={{ marginRight: '8px' }}/> PARXÉÉ SPACE
            </div>
            <h2 style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>List Your <span className="text-gradient">Space.</span></h2>
            <p style={{ opacity: 0.7, marginTop: '1rem', marginBottom: '2rem' }}>Turn your empty driveway or garage into a premium parking spot and earn securely.</p>
            <button 
              onClick={() => navigate('/park')} 
              className="glass light-sweep" 
              style={{ 
                padding: '12px 24px', 
                borderRadius: '50px', 
                fontWeight: '800', 
                color: '#a855f7', 
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                background: 'rgba(168, 85, 247, 0.1)'
              }}
            >
              <MapPin size={18} /> Find Parking Location
            </button>
          </div>

          <div className="bento-item light-sweep" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px', display: 'block' }}>Complete Address</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', top: '14px', left: '14px', opacity: 0.5 }} />
                  <input 
                    type="text" 
                    placeholder="e.g., 123 Tech Park, Sector 15"
                    required
                    style={{ width: '100%', padding: '14px 14px 14px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px', display: 'block' }}>Price per Hour (₹)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={18} style={{ position: 'absolute', top: '14px', left: '14px', opacity: 0.5 }} />
                  <input 
                    type="number" 
                    min="10"
                    placeholder="e.g., 50"
                    required
                    style={{ width: '100%', padding: '14px 14px 14px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    value={formData.pricePerHour}
                    onChange={e => setFormData({...formData, pricePerHour: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px', display: 'block' }}>Description / Landmarks</label>
                <textarea 
                  rows="3"
                  placeholder="Any special instructions for finding or entering the spot?"
                  style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px', display: 'block' }}>Location Verification</label>
                {formData.lat ? (
                  <div style={{ padding: '14px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid #34d399', borderRadius: '12px', color: '#34d399', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                      <CheckCircle size={18} /> GPS Coordinates Locked
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, marginLeft: '26px' }}>
                      Lat: {Number(formData.lat).toFixed(6)}, Lng: {Number(formData.lng).toFixed(6)}
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleGetLocation} 
                    className="glass"
                    disabled={isLocating}
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <Navigation size={18} /> {isLocating ? 'Acquiring...' : 'Get Current Location'}
                  </button>
                )}
                <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '8px' }}>Please stand near the parking space when clicking this.</p>
              </div>

              <button 
                type="submit" 
                className="btn-gradient light-sweep" 
                disabled={isSubmitting || !formData.lat}
                style={{ marginTop: '1rem', padding: '16px', borderRadius: '12px', fontWeight: 'bold', opacity: (isSubmitting || !formData.lat) ? 0.5 : 1 }}
              >
                {isSubmitting ? 'Publishing...' : 'List Space Now'}
              </button>

            </form>
          </div>
        </div>
      </section>
    </>
  );
}
