import { useState, useEffect, useContext } from 'react';
import { Wrench, MapPin, PhoneCall, Star, CheckCircle, Map as MapIcon, List as ListIcon, AlertTriangle, PlusCircle, X, Radio, Check } from 'lucide-react';
import { AuthContext } from '../App';
import { io } from 'socket.io-client';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import PaymentModal from '../components/PaymentModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import TrackingMap from '../components/TrackingMap';


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

const incidentMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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
  const [incidents, setIncidents] = useState([]);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({ type: 'traffic', description: '' });

  const { user, isPro } = useContext(AuthContext);
  
  // Point 1: Live Tracking state
  const [mechanicLocation, setMechanicLocation] = useState(null);

  // Point 6: Voice SOS state
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    if ('WebkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
    }
  }, []);

  const toggleVoiceSOS = () => {
    if (!isPro()) return alert("Voice SOS is a PRO feature. Please upgrade to use it.");
    
    if (isVoiceListening) {
      setIsVoiceListening(false);
    } else {
      startVoiceRecognition();
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsVoiceListening(true);
    recognition.onend = () => setIsVoiceListening(false);
    recognition.onerror = () => setIsVoiceListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Voice Transcript:", transcript);
      if (transcript.includes("help me") || transcript.includes("parkee help") || transcript.includes("emergency")) {
        handleBroadcastSOS();
        recognition.stop();
      }
    };

    recognition.start();
  };

  // SOS States
  const [sosStatus, setSosStatus] = useState('idle'); // idle, broadcasting, accepted, completed
  const [socket, setSocket] = useState(null);
  const [bids, setBids] = useState([]);
  const [activeSosId, setActiveSosId] = useState(null);
  const [assignedMechanic, setAssignedMechanic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');



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

        // Fetch Community Hazard Incidents
        const incidentRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/incidents`);
        if (incidentRes.ok) {
          const incData = await incidentRes.json();
          setIncidents(incData);
        }

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

  // ---------- SOS LOGIC -----------
  useEffect(() => {
    // Cleanup socket on unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  const handleBroadcastSOS = async () => {
    if (!userLocation) {
        alert("We need your location to broadcast an SOS! Please enable GPS.");
        return;
    }
    if (!user) {
        alert("Please log in to use SOS Broadcasts.");
        window.location.href = '/login';
        return;
    }

    setSosStatus('broadcasting');
    try {
        const payload = {
            userId: user._id,
            userName: user.name,
            userPhone: user.phone || 'N/A',
            location: { lat: userLocation.lat, lng: userLocation.lng }
        };
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/sos/broadcast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            const data = await res.json();
            setActiveSosId(data.sosRequest._id);

            // Establish Socket to listen for incoming bids
            const newSocket = io(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}`);
            setSocket(newSocket);

            newSocket.on('connect', () => {
                newSocket.emit('join-sos-room', user._id);
            });

            newSocket.on('mechanic-bid', (bid) => {
                setBids(prev => [...prev, bid]);
            });

            newSocket.on('mechanic-moved', (loc) => {
                setMechanicLocation(loc);
            });
        }
    } catch (err) {
        console.error("Broadcast error:", err);
        alert("Failed to broadcast SOS. Please check your connection.");
        setSosStatus('idle');
    }
  };

  const handleAcceptBid = (bid) => {
      if (!socket || !activeSosId) return;

      if (user?.subscriptionTier === 'diamond') {
          // Zero Convenience Fee
          finalizeSOS(bid);
      } else {
          // Open Razorpay Payment for Platform Fee
          setSelectedBid(bid);
          setShowPaymentModal(true);
      }
  };

  const finalizeSOS = async (bidToAccept = selectedBid) => {
      try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/sos/finalize`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sosId: activeSosId, bid: bidToAccept })
          });
          const data = await res.json();
          if (res.ok) {
              setSosStatus('accepted');
              setAssignedMechanic(bidToAccept);
              if(socket) socket.disconnect();
              setSocket(null);
          } else {
              alert(data.message || "Failed to finalize SOS booking.");
          }
      } catch (e) {
          alert("Network Error finalizing SOS.");
      }
  };

  const handleCompleteSOS = async () => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/sos/${activeSosId}/complete`, {
            method: 'POST'
        });
        if (res.ok) {
            setSosStatus('completed');
            setShowRatingModal(true);
        }
    } catch (e) {
        alert("Error marking job as complete.");
    }
  };

  const handleSubmitReview = async () => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mechanicId: assignedMechanic.mechanicId,
                userId: user._id,
                userName: user.name,
                rating,
                comment,
                sosId: activeSosId
            })
        });
        if (res.ok) {
            alert("Thank you for your feedback!");
            setShowRatingModal(false);
            setSosStatus('idle');
            setAssignedMechanic(null);
        }
    } catch (err) {
        alert("Failed to submit review.");
    }
  };

  // --------------------------------

  const handleReportIncident = async (e) => {
    e.preventDefault();
    if (!userLocation) {
        alert("We need your location to drop a hazard pin! Please enable GPS.");
        return;
    }
    
    try {
        const payload = {
            type: incidentForm.type,
            description: incidentForm.description,
            latitude: userLocation.lat,
            longitude: userLocation.lng
        };
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/incidents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            const data = await res.json();
            setIncidents([data.incident, ...incidents]);
            setShowIncidentModal(false);
            setIncidentForm({ type: 'traffic', description: '' });
            alert("Hazard reported successfully! Everyone in the area has been alerted.");
        }
    } catch (err) {
        alert("Failed to report hazard.");
    }
  };

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
            
            {/* --- LIVE SOS BIDDING --- */}
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid #eab308', padding: '1.5rem', borderRadius: '16px', maxWidth: '600px', margin: '0 auto 2rem' }}>
                <h3 style={{color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px'}}>
                    <Radio size={20} className="pulse-anim" /> Live SOS Broadcast
                </h3>
                <p style={{color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '15px'}}>Stranded? Broadcast your location to all nearby mechanics and get instant bids.</p>
                
                {sosStatus === 'idle' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button onClick={handleBroadcastSOS} className="btn-gradient" style={{background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', width: '100%', padding: '15px', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                            <Radio size={20} /> Broadcast SOS Now
                        </button>
                        
                        {voiceSupported && (
                            <button 
                                onClick={toggleVoiceSOS} 
                                style={{
                                    width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)',
                                    background: isVoiceListening ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                    color: isVoiceListening ? '#ef4444' : 'var(--muted)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
                                    fontWeight: '600', transition: 'all 0.3s'
                                }}
                            >
                                <div className={isVoiceListening ? "pulse-anim" : ""} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                                    {isVoiceListening ? "Listening for 'Help Me'..." : "Enable Voice SOS (PRO)"}
                                </div>
                            </button>
                        )}
                    </div>
                )}

                {sosStatus === 'broadcasting' && (
                    <div className="fadeIn">
                        <div className="shimmer-loading" style={{color: '#eab308', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.2)'}}>
                            <div className="loader" style={{width: '20px', height: '20px', borderTopColor: '#eab308'}}></div>
                            Broadcasting SOS... Finding Best Deals
                        </div>
                        {bids.length > 0 ? (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                {bids.map((b, idx) => (
                                    <div key={idx} className="fadeInUp" style={{background: 'var(--bg)', padding: '16px', borderRadius: '16px', border: '1px solid #eab308', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 20px rgba(234, 179, 8, 0.1)', animationDelay: `${idx * 0.1}s`}}>
                                        <div style={{textAlign: 'left'}}>
                                            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
                                                <strong style={{fontSize: '1.1rem'}}>{b.mechanicName}</strong>
                                                <span style={{fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '20px', fontWeight: 'BOLD'}}>FASTEST RESPONSE</span>
                                            </div>
                                            <div style={{fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                                                <Navigation size={14} /> {b.distance} km away
                                            </div>
                                            <div style={{color: '#10b981', fontWeight: '800', fontSize: '1.3rem', marginTop: '6px'}}>₹{b.price}</div>
                                        </div>
                                        <button onClick={() => handleAcceptBid(b)} className="pulse-gold" style={{background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '30px', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                            <Check size={18} /> Accept
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <p style={{fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0'}}>Waiting for nearby mechanics to respond...</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '10px' }}>
                                    <div className="pulse-anim" style={{ width: '8px', height: '8px', background: '#eab308', borderRadius: '50%' }}></div>
                                    <div className="pulse-anim" style={{ width: '8px', height: '8px', background: '#eab308', borderRadius: '50%', animationDelay: '0.2s' }}></div>
                                    <div className="pulse-anim" style={{ width: '8px', height: '8px', background: '#eab308', borderRadius: '50%', animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <button onClick={() => { if(socket) socket.disconnect(); setSosStatus('idle'); setBids([]); }} style={{background: 'transparent', color: '#ef4444', border: 'none', textDecoration: 'underline', marginTop: '20px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>Cancel Broadcast</button>
                    </div>
                )}

                {sosStatus === 'accepted' && assignedMechanic && (
                    <div className="fadeIn" style={{background: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '12px', border: '1px solid #10b981'}}>
                        <h4 style={{color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px'}}>
                            <CheckCircle size={20} /> Mechanic Assigned!
                        </h4>
                        
                        {/* Point 1: Live Tracking Map (PRO Only) */}
                        {isPro() ? (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '10px' }}>PRO FEATURE: Live Mechanic Tracking Active</p>
                                <TrackingMap userLocation={userLocation} mechanicLocation={mechanicLocation} />
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px dashed #38bdf8', padding: '15px', borderRadius: '12px', marginBottom: '1.5rem' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#38bdf8', fontWeight: 'bold' }}>
                                    ✨ Upgrade to PRO to see your mechanic's live location on the map!
                                </p>
                            </div>
                        )}

                        <p style={{marginBottom: '5px'}}><strong>{assignedMechanic.mechanicName}</strong> is on their way.</p>
                        <p style={{color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '15px'}}>Agreed Amount: ₹{assignedMechanic.price} (Cash/UPI directly to mechanic)</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <a href={`tel:${assignedMechanic.phone}`} className="btn-gradient" style={{textDecoration: 'none', padding: '10px 20px', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#10b981', border: 'none'}}>
                                <PhoneCall size={16} /> Call Mechanic
                            </a>
                            <button onClick={handleCompleteSOS} className="btn-secondary" style={{ borderRadius: '30px', padding: '10px 20px', background: 'var(--primary)', color: '#fff', border: 'none' }}>
                                Mark Job Done
                            </button>
                        </div>
                    </div>
                )}

                {sosStatus === 'completed' && (
                    <div className="fadeIn" style={{padding: '15px', textAlign: 'center'}}>
                         <CheckCircle size={50} color="#10b981" style={{marginBottom: '10px'}} />
                         <h3 style={{color: '#10b981'}}>Job Completed!</h3>
                         <p style={{color: 'var(--muted)', fontSize: '0.9rem'}}>Thank you for using Parkéé City SOS.</p>
                         <button onClick={() => setSosStatus('idle')} className="btn-secondary" style={{marginTop: '15px', padding: '10px 20px', borderRadius: '30px'}}>Close</button>
                    </div>
                )}

            </div>
            {/* ----------------------- */}

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
        ) : (
          viewMode === 'map' ? (
            <div className="fadeIn" style={{ position: 'relative', height: '600px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              {mechanics.length === 0 && (
                <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  📍 No mechanics currently online near you
                </div>
              )}
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

                {/* Community Reported Hazards */}
                {incidents.map((inc) => (
                  <Marker key={inc._id} position={[inc.latitude, inc.longitude]} icon={incidentMarkerIcon}>
                    <Popup>
                      <div style={{ padding: '5px', textAlign: 'center' }}>
                        <AlertTriangle size={24} color="#ef4444" style={{ marginBottom: '5px' }} />
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#ef4444', textTransform: 'capitalize' }}>{inc.type} Hazard</h3>
                        {inc.description && <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem' }}>{inc.description}</p>}
                        <div style={{ fontSize: '0.75rem', color: 'gray' }}>Reported near you</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Floating Action Button for Hazard Reporting */}
              <button 
                onClick={() => setShowIncidentModal(true)}
                title="Report Road Hazard"
                style={{
                  position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 1000, 
                  background: '#ef4444', color: 'white', width: '60px', height: '60px', 
                  borderRadius: '50%', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  boxShadow: '0 10px 25px rgba(239, 68, 68, 0.5)', transition: 'transform 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <PlusCircle size={30} />
              </button>
            </div>
          ) : (
            mechanics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '1.2rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>No Online Mechanics Found in your area right now.</p>
                  <Link to="/mechanic-register" className="btn-gradient" style={{ padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Register as Mechanic</Link>
              </div>
            ) : (
              <div className="fadeIn" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {mechanics.map((mechanic) => (
                  <div key={mechanic._id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                              <h3 style={{ fontSize: '1.4rem', margin: '0 0 4px 0', color: 'var(--fg)' }}>{mechanic.name}</h3>
                              <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>{mechanic.shopName}</div>
                          </div>
                          <div style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                              <Star size={14} fill="currentColor" /> {mechanic.averageRating > 0 ? `${mechanic.averageRating} (${mechanic.numReviews})` : `${mechanic.experienceYears}+ Yrs`}
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

                      <div style={{ display: 'flex', gap: '8px' }}>
                          <a href={`tel:${mechanic.phone}`} className="btn-gradient" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none' }}>
                              <PhoneCall size={18} />
                              Call
                          </a>
                          <button 
                            onClick={() => {
                                if (isPro()) {
                                    window.open(`https://wa.me/${mechanic.phone}?text=${encodeURIComponent(`Hi ${mechanic.name}, I found your profile on Parkéé City. I need assistance with my ${user?.make || 'vehicle'}...`)}`, '_blank');
                                } else {
                                    alert("WhatsApp Chat is a PRO feature! Please upgrade to Silver or Gold plan to use it.");
                                }
                            }}
                            className={isPro() ? "btn-secondary" : "btn-muted"}
                            style={{ 
                                padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold',
                                background: isPro() ? '#25D366' : 'var(--card-bg)',
                                color: isPro() ? '#fff' : 'var(--muted)',
                                position: 'relative'
                            }}
                          >
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              {!isPro() && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#eab308', color: '#000', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '4px' }}>PRO</span>}
                          </button>
                      </div>
                  </div>
                ))}
            </div>
            )
          )
        )}  </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', zIndex: 10001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-card fadeIn" style={{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <h2 style={{marginBottom: '1rem'}}>Rate Your Mechanic</h2>
            <p style={{color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem'}}>How was your experience with {assignedMechanic?.mechanicName}?</p>
            
            <div style={{display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '2rem'}}>
                {[1,2,3,4,5].map(num => (
                    <Star 
                        key={num} 
                        size={32} 
                        fill={rating >= num ? "#eab308" : "transparent"} 
                        color="#eab308" 
                        style={{cursor: 'pointer'}} 
                        onClick={() => setRating(num)}
                    />
                ))}
            </div>

            <textarea 
                placeholder="Write a quick comment (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                    width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)', color: 'var(--fg)', marginBottom: '1.5rem', minHeight: '80px'
                }}
            />

            <button onClick={handleSubmitReview} className="btn-gradient full-width" style={{padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold'}}>
                Submit Review
            </button>
          </div>
        </div>
      )}

      {/* Report Incident Modal */}

      {showIncidentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '2rem', borderRadius: '20px', position: 'relative' }}>
             <button onClick={() => setShowIncidentModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg)' }}>
               <X size={24} />
             </button>
             
             <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '1.5rem' }}>
               <AlertTriangle /> Report Road Hazard
             </h2>
             <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
               Drop a pin at your current GPS location to warn the Parkéé Community.
             </p>

             <form onSubmit={handleReportIncident}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Hazard Type</label>
                  <select 
                    value={incidentForm.type}
                    onChange={(e) => setIncidentForm({...incidentForm, type: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', fontSize: '1rem' }}
                  >
                    <option value="traffic">Heavy Traffic Jam</option>
                    <option value="pothole">Dangerous Pothole</option>
                    <option value="waterlogging">Waterlogging / Flood</option>
                    <option value="accident">Accident Site</option>
                    <option value="police">Police Checking</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description (Optional)</label>
                  <textarea 
                    value={incidentForm.description}
                    placeholder="E.g. Huge crater in the middle lane..."
                    onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--fg)', minHeight: '80px', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit" className="btn-gradient full-width" style={{ padding: '14px', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: 'bold', background: '#ef4444', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', cursor: 'pointer' }}>
                  Drop Warning Pin
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
