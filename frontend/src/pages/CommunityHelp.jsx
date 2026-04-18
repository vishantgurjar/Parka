import { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AuthContext } from '../App';
import { MapPin, Heart, AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const helpIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function CommunityHelp() {
  const { user } = useContext(AuthContext);
  const [userLocation, setUserLocation] = useState([28.6139, 77.2090]); // Default Delhi
  const [helpRequests, setHelpRequests] = useState([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [newHelp, setNewHelp] = useState({ type: 'Flat Tire', description: '' });
  const [loading, setLoading] = useState(true);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app';

  useEffect(() => {
    // Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        () => setLoading(false)
      );
    } else {
      setLoading(false);
    }
    fetchNearbyHelp();
  }, []);

  const fetchNearbyHelp = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/community-help/nearby`);
      const data = await res.json();
      setHelpRequests(data);
    } catch (err) {
      console.error("Error fetching help requests:", err);
    }
  };

  const handlePostRequest = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to post a help request.");
    
    setIsSubmittingRequest(true);
    try {
      const res = await fetch(`${API_BASE}/api/community-help/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          userName: user.name,
          userPhone: user.phone || 'N/A',
          type: newHelp.type === 'Fuel Needed' ? 'Fuel' : newHelp.type,
          description: newHelp.description,
          location: {
            lat: userLocation[0],
            lng: userLocation[1]
          }
        })
      });
      if (res.ok) {
        alert("Help request broadcasted to the community!");
        setIsRequesting(false);
        setNewHelp({ type: 'Flat Tire', description: '' });
        fetchNearbyHelp();
      } else {
        const errorData = await res.json();
        alert(`Failed: ${errorData.message || 'Check your internet connection'}`);
      }
    } catch (err) {
      alert("Failed to post request. Please check if the server is running.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleAcceptHelp = async (requestId) => {
    if (!user) return alert("Please login to help others.");
    if (confirm("Do you want to accept this help request? You will earn 100 Parkéé Credits!")) {
      try {
        const res = await fetch(`${API_BASE}/api/community-help/${requestId}/accept`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ helperId: user._id, helperName: user.name })
        });
        if (res.ok) {
          alert("Help request accepted! Please contact the user to coordinate.");
          fetchNearbyHelp();
        }
      } catch (err) {
        alert("Error accepting request.");
      }
    }
  };

  return (
    <div className="community-help-page" style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
          <div className="emergency-badge" style={{ marginBottom: '1rem' }}>
            <Heart size={14} /> COMMUNITY FEED
          </div>
          <h2 className="section-title">Help & <span className="text-gradient">Support</span></h2>
          <p className="section-desc">Direct requests from the neighborhood. Help someone today.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
          {/* MAP */}
          <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', height: '600px', border: '1px solid var(--border)' }}>
            <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ChangeView center={userLocation} />
              
              <Marker position={userLocation} icon={userIcon}>
                <Popup><b>You are here</b></Popup>
              </Marker>
              {helpRequests.map((req) => (
                <Marker key={req._id} position={[req.location.lat, req.location.lng]} icon={helpIcon}>
                  <Popup>
                    <div style={{ padding: '10px' }}>
                      <h4 style={{ color: 'var(--destructive)', marginBottom: '5px' }}>🚨 {req.type}</h4>
                      <p style={{ fontSize: '0.85rem', margin: '5px 0' }}>{req.description}</p>
                      <p style={{ fontSize: '0.75rem', color: '#666' }}>By: {req.userName}</p>
                      {user && req.userId !== user._id && req.status === 'pending' && (
                        <button 
                          onClick={() => handleAcceptHelp(req._id)}
                          style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', width: '100%', fontWeight: 'bold' }}
                        >
                          I can help!
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="var(--primary)" /> Smart Helper
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
                Stranded or need a quick hand? Post a request and nearby Parkéé Sathis will reach out.
              </p>
              <button 
                onClick={() => setIsRequesting(true)}
                className="btn-gradient full-width" 
                style={{ padding: '12px', borderRadius: '12px' }}
              >
                Post Help Request
              </button>
            </div>

            <div className="active-requests">
              <h4 style={{ marginBottom: '1rem', paddingLeft: '0.5rem' }}>Nearby Activity</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {helpRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <Heart size={24} color="var(--muted)" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>No active requests nearby. Everything looks good! ✅</p>
                  </div>
                ) : (
                  helpRequests.map(req => (
                    <div key={req._id} className="glass" style={{ padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--destructive)', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{req.type}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}><Clock size={10} /> {new Date(req.createdAt).toLocaleTimeString()}</span>
                       </div>
                       <p style={{ fontSize: '0.85rem', marginBottom: '0.8rem' }}>{req.description || "In need of assistance nearby."}</p>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>{req.userName[0]}</div>
                          <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{req.userName}</span>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REQUEST MODAL */}
      {isRequesting && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div className="glass" style={{ maxWidth: '450px', width: '90%', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)', margin: 'auto' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Ask for Help</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Broadcasting to nearby Sathis...</p>
            
            <form onSubmit={handlePostRequest}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Issue Type</label>
                <select 
                  value={newHelp.type}
                  onChange={(e) => setNewHelp({ ...newHelp, type: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                >
                  <option>Flat Tire</option>
                  <option>Jumpstart</option>
                  <option>Fuel Needed</option>
                  <option>Tool Help</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: '600' }}>Add Note</label>
                <textarea 
                   rows="3" 
                   value={newHelp.description}
                   onChange={(e) => setNewHelp({ ...newHelp, description: e.target.value })}
                   placeholder="Describe what you need..."
                   style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--fg)', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <button type="button" onClick={() => setIsRequesting(false)} className="btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: '12px' }}>Cancel</button>
                 <button 
                   type="submit" 
                   className="btn-gradient" 
                   disabled={isSubmittingRequest}
                   style={{ flex: 2, padding: '12px', borderRadius: '12px', opacity: isSubmittingRequest ? 0.7 : 1, cursor: isSubmittingRequest ? 'not-allowed' : 'pointer' }}
                 >
                   {isSubmittingRequest ? 'Broadcasting...' : 'Post Request'}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
