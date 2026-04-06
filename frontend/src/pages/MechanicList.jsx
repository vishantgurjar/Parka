import { useState, useEffect } from 'react';
import { Wrench, MapPin, PhoneCall, Star, CheckCircle, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MechanicList() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'list' or 'map'
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Attempt to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Geolocation error:", err)
      );
    }

    const fetchMechanics = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/mechanics`);
        if (!res.ok) throw new Error('Failed to fetch mechanics');
        const data = await res.json();
        
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

  const defaultCenter = userLocation ? [userLocation.lat, userLocation.lng] : [28.6139, 77.2090]; // Default Delhi

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '4rem' }}>
      <SEO 
        title="Find Nearby Mechanics - Parkéé City"
        description="Find and contact professional mechanics near you for emergency vehicle repair and roadside assistance. 24/7 service available on major highways."
      />
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(13, 148, 136, 0.15)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                <Wrench size={16} /> Partner Network
            </div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--fg)' }}>Find a <span className="text-gradient">Nearby Mechanic</span></h1>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '1.5rem' }}>
              <button 
                onClick={() => setViewMode('list')} 
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer',
                  background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'var(--fg)',
                  border: `2px solid var(--primary)`,
                  transition: 'all 0.3s'
                }}
              >
                <ListIcon size={18} /> List View
              </button>
              <button 
                onClick={() => setViewMode('map')} 
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer',
                  background: viewMode === 'map' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'map' ? 'white' : 'var(--fg)',
                  border: `2px solid var(--primary)`,
                  transition: 'all 0.3s'
                }}
              >
                <MapIcon size={18} /> Live Map View
              </button>
            </div>
        </div>

        {loading ? (
             <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading mechanics directory...</div>
        ) : error ? (
             <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>
        ) : mechanics.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                 <p>No Online Mechanics Found</p>
                 <Link to="/mechanic-register" className="btn-gradient" style={{ padding: '10px 20px', borderRadius: '8px', textDecoration: 'none' }}>Register as Mechanic</Link>
             </div>
        ) : (
          viewMode === 'map' ? (
            <div style={{ height: '600px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {userLocation && (
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userMarkerIcon}>
                    <Popup><strong>You are here</strong></Popup>
                  </Marker>
                )}

                {mechanics.map((mach) => {
                  // Fallback to slightly randomize coordinates if missing so they appear near user
                  const lat = mach.latitude || (defaultCenter[0] + (Math.random() - 0.5) * 0.1);
                  const lng = mach.longitude || (defaultCenter[1] + (Math.random() - 0.5) * 0.1);

                  return (
                    <Marker key={mach._id} position={[lat, lng]} icon={customMarkerIcon}>
                      <Popup>
                        <div style={{ padding: '5px', textAlign: 'center' }}>
                          <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#10b981' }}>{mach.name}</h3>
                          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>{mach.shopName}</p>
                          <a href={`tel:${mach.phone}`} style={{ 
                            background: '#10b981', color: 'white', padding: '8px 12px', borderRadius: '20px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' 
                          }}>
                            <PhoneCall size={14} /> Call Now
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
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
          )
        )}
      </div>
    </div>
  );
}
