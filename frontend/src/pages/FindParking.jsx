import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SEO from '../components/SEO';
import { AuthContext } from '../App';
import { toast } from 'react-hot-toast';
import { Navigation, Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically center map
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function FindParking() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default: New Delhi
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [bookingHours, setBookingHours] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    // 1. Get User Location Automatically
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
        () => toast.error("Location access denied. Showing default area.")
      );
    }

    // 2. Fetch Spaces from Backend
    const fetchSpaces = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app';
        const res = await fetch(`${baseUrl}/api/spaces`);
        if (res.ok) {
          const data = await res.json();
          setSpaces(data);
        }
      } catch (err) {
        console.error("Failed to load spaces", err);
      }
    };
    fetchSpaces();
  }, []);

  const handleBook = async () => {
    if (!user) {
      toast.error("Please login to book a space");
      navigate('/login');
      return;
    }
    
    setIsBooking(true);
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app';
      const res = await fetch(`${baseUrl}/api/spaces/book/${selectedSpace._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hours: bookingHours })
      });

      if (res.ok) {
        toast.success(`Successfully booked for ${bookingHours} hour(s)!`);
        setSelectedSpace(null);
      } else {
        toast.error("Booking failed. Space might be unavailable.");
      }
    } catch (err) {
      toast.error("Server error during booking.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <>
      <SEO title="Find Parking - PARXÉÉ SPACE" description="Find and book premium parking spaces near you." />
      <div className="bg-grain"></div>

      <section style={{ position: 'relative', height: '100vh', paddingTop: '80px', display: 'flex' }}>
        {/* Map Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <ChangeView center={mapCenter} zoom={13} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">Carto</a>'
            />
            
            {spaces.map(space => (
              <Marker 
                key={space._id} 
                position={[space.location.lat, space.location.lng]}
                eventHandlers={{ click: () => setSelectedSpace(space) }}
              >
                <Popup>
                  <strong>{space.address}</strong><br/>
                  ₹{space.pricePerHour} / hour
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Booking Panel Overlay (when a space is selected) */}
        {selectedSpace && (
          <div className="bento-item glass light-sweep" style={{ 
            position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', 
            width: '90%', maxWidth: '400px', zIndex: 10, padding: '1.5rem', 
            background: 'rgba(3, 7, 18, 0.9)', backdropFilter: 'blur(10px)' 
          }}>
            <button onClick={() => setSelectedSpace(null)} style={{ position: 'absolute', top: '10px', right: '15px', color: '#fff', opacity: 0.5 }}>✕</button>
            
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{selectedSpace.address}</h3>
            <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '1rem' }}>{selectedSpace.description || "Premium secure parking spot."}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6 }}>Price</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{selectedSpace.pricePerHour}/hr</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.6 }}>Host</span>
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{selectedSpace.hostId?.name || "Verified User"}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block', marginBottom: '4px' }}>Duration (Hours)</label>
                <input 
                  type="number" 
                  min="1" max="24" 
                  value={bookingHours} 
                  onChange={e => setBookingHours(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block', marginBottom: '4px' }}>Total Amount</label>
                <div style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}>
                  ₹{selectedSpace.pricePerHour * bookingHours}
                </div>
              </div>
            </div>

            <button 
              onClick={handleBook}
              disabled={isBooking}
              className="btn-gradient light-sweep" 
              style={{ width: '100%', padding: '14px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <CreditCard size={18} /> {isBooking ? 'Processing...' : 'Book & Pay Now'}
            </button>
          </div>
        )}

        {/* Floating Top Header */}
        <div style={{
          position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, background: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(10px)',
          padding: '12px 24px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <Navigation size={18} color="var(--primary)" />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>PARXÉÉ SPACE RADAR</span>
        </div>

        {/* Empty State Overlay */}
        {spaces.length === 0 && (
          <div className="bento-item glass light-sweep" style={{
            position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, padding: '2rem', textAlign: 'center', width: '90%', maxWidth: '400px',
            background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(12px)'
          }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Navigation size={28} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Spaces Nearby</h3>
            <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '1.5rem' }}>We couldn't find any premium parking spots in this area right now.</p>
            <button onClick={() => navigate('/host-space')} className="btn-gradient full-width light-sweep" style={{ padding: '14px', borderRadius: '12px', fontWeight: 'bold' }}>
              Host Your Space Instead
            </button>
          </div>
        )}
      </section>
    </>
  );
}
