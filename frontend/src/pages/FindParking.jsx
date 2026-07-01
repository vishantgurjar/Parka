import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SEO from '../components/SEO';
import { AuthContext } from '../App';
import { toast } from 'react-hot-toast';
import { Navigation, Clock, CreditCard, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl } from '../utils/api';
import PaymentModal from '../components/PaymentModal';

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
  useEffect(() => {
    map.setView(center, zoom);
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
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
  const [paymentPlan, setPaymentPlan] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    const onSuccess = (pos) => {
      setMapCenter([pos.coords.latitude, pos.coords.longitude]);
    };

    const onError = async (err) => {
      console.warn("FindParking GPS lookup failed, attempting IP fallback:", err);
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            setMapCenter([data.latitude, data.longitude]);
            toast.success(`Location detected: ${data.city || 'Your Area'} 🌐`);
            return;
          }
        }
      } catch (ipErr) {
        console.error("FindParking IP fallback failed:", ipErr);
      }

      // Final fallback
      setMapCenter([28.6139, 77.2090]);
      if (!window.isSecureContext) {
        toast.error("GPS is blocked on insecure (HTTP) connections. Please use HTTPS or search manually!", { duration: 6000 });
      } else if (err && err.code === err.PERMISSION_DENIED) {
        toast.error("Location permission is blocked in your browser settings. Please search manually!", { duration: 6000 });
      } else {
        toast.error("GPS signal check failed. Showing Delhi area. Please search manually!", { duration: 4000 });
      }
    };

    // 1. Get User Location Automatically
    if (navigator.geolocation) {
      // Try cached position first (fastest)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onSuccess(pos);
          // Try to get fresh high-accuracy position in background
          navigator.geolocation.getCurrentPosition(onSuccess, () => {}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
        },
        () => {
          // If no cached, try high accuracy
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            (err) => {
              // Try low accuracy fallback
              navigator.geolocation.getCurrentPosition(
                onSuccess,
                (err2) => onError(err2),
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
              );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: false, timeout: 2000, maximumAge: Infinity }
      );
    } else {
      onError(new Error("Not supported"));
    }

    // 2. Fetch Spaces from Backend
    const fetchSpaces = async () => {
      try {
        const baseUrl = getBackendUrl();
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

  const fetchActiveBooking = async () => {
    if (!user) return;
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/spaces/bookings/active/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.booking) {
          setActiveBooking({
            id: data.booking._id,
            space: data.booking.spaceId,
            hours: data.booking.hours,
            amount: data.booking.price,
            otp: data.booking.otp,
            timestamp: new Date(data.booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        } else {
          setActiveBooking(null);
        }
      }
    } catch (err) {
      console.error("Failed to load active booking:", err);
    }
  };

  useEffect(() => {
    fetchActiveBooking();
  }, [user]);

  const handleBook = () => {
    if (!user) {
      toast.error("Please login to book a space");
      navigate('/login', { state: { from: '/park' } });
      return;
    }
    
    // Set payment details to launch Razorpay checkout modal
    setPaymentPlan({
      name: `Parking Spot Booking (${bookingHours} hours)`,
      amount: selectedSpace.pricePerHour * bookingHours,
      hours: bookingHours
    });
  };

  const handleBookingPaymentSuccess = () => {
    toast.success(`Successfully booked for ${bookingHours} hour(s)!`);
    setSelectedSpace(null);
    setPaymentPlan(null);
    fetchActiveBooking();
    
    // Refresh spaces list
    const fetchSpaces = async () => {
      try {
        const baseUrl = getBackendUrl();
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
  };

  const handleCompleteParking = async () => {
    if (!activeBooking) return;
    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/spaces/bookings/complete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ bookingId: activeBooking.id })
      });
      if (res.ok) {
        toast.success("Parking session completed successfully!");
        setActiveBooking(null);
        // Refresh spaces list
        const fetchSpaces = async () => {
          try {
            const baseUrl = getBackendUrl();
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
      } else {
        toast.error("Failed to complete parking session.");
      }
    } catch (err) {
      console.error("Complete booking error:", err);
      toast.error("Network error completing parking session.");
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
            {/* Satellite Map for real-world view */}
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              attribution="Map data © Google"
              maxZoom={20}
            />
            
            {spaces.map(space => {
              // Custom premium marker for parking spots
              const parkingIcon = new L.DivIcon({
                html: `<div style="background: linear-gradient(135deg, #10b981, #059669); color: white; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 20px rgba(16, 185, 129, 0.8), 0 0 0 2px rgba(16, 185, 129, 0.4);"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>`,
                className: 'custom-parking-icon',
                iconSize: [44, 44],
                iconAnchor: [22, 22],
                popupAnchor: [0, -22]
              });

              return (
                <Marker 
                  key={space._id} 
                  position={[space.location.lat, space.location.lng]}
                  icon={parkingIcon}
                  eventHandlers={{ click: () => setSelectedSpace(space) }}
                >
                  <Popup className="premium-popup">
                    <div style={{ padding: '5px', textAlign: 'center' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>Verified Space</strong><br/>
                      <span style={{ color: '#000' }}>{space.address}</span><br/>
                      <div style={{ marginTop: '8px', background: '#f3f4f6', padding: '4px', borderRadius: '4px', fontWeight: 'bold' }}>₹{space.pricePerHour} / hour</div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Booking Panel Overlay (when a space is selected) */}
        {selectedSpace && (
          <div className="bento-item glass light-sweep" style={{ 
            position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', 
            width: '90%', maxWidth: '400px', zIndex: 10010, padding: '1.5rem', 
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

        {/* Floating Top Header & Search Bar */}
        <div style={{
          position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 10010, background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(12px)',
          padding: '8px 16px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          width: '90%', maxWidth: '450px'
        }}>
          <Navigation size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
          <form onSubmit={async (e) => {
            e.preventDefault();
            const query = e.target.search.value;
            if (!query.trim()) return;
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
              const data = await res.json();
              if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setMapCenter([parseFloat(lat), parseFloat(lon)]);
                toast.success(`Found: ${data[0].display_name.split(',')[0]}`);
              } else {
                toast.error("Location not found.");
              }
            } catch (err) {
              toast.error("Search failed.");
            }
          }} style={{ display: 'flex', width: '100%', gap: '8px' }}>
            <input 
              name="search"
              type="text" 
              placeholder="Search Area (e.g. Noida, GK-2)..." 
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
            />
            <button type="submit" className="btn-gradient" style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', border: 'none', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
              Search
            </button>
          </form>
        </div>

        {/* Empty State Overlay */}
        {spaces.length === 0 && !activeBooking && (
          <div className="bento-item glass light-sweep" style={{
            position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 10010, padding: '2rem', textAlign: 'center', width: '90%', maxWidth: '400px',
            background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(12px)'
          }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Navigation size={28} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Spaces Nearby</h3>
            <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '1.5rem' }}>We couldn't find any premium parking spots in this area right now.</p>
            <button onClick={() => navigate('/host')} className="btn-gradient full-width light-sweep" style={{ padding: '14px', borderRadius: '12px', fontWeight: 'bold' }}>
              Host Your Space Instead
            </button>
          </div>
        )}

        {/* Booking Confirmed Receipt Overlay */}
        {activeBooking && (
          <div className="bento-item glass light-sweep" style={{
            position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 10020, padding: '2rem', width: '90%', maxWidth: '420px',
            background: 'rgba(3, 7, 18, 0.95)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(16, 185, 129, 0.15)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '54px', height: '54px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.8rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <Check size={26} />
              </div>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase' }}>PARXÉÉ SECURE TICKET</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px', color: '#fff' }}>Booking Confirmed</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--muted)' }}>Spot Address:</span>
                <span style={{ fontWeight: 'bold', color: '#fff', textAlign: 'right', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeBooking.space.address}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--muted)' }}>Reserved Duration:</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>{activeBooking.hours} Hour(s)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--muted)' }}>Amount Paid:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{activeBooking.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--muted)' }}>Booking Time:</span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>{activeBooking.timestamp}</span>
              </div>
              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', marginTop: '6px', paddingTop: '12px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Gate Passcode / OTP</span>
                <span style={{ display: 'block', fontSize: '1.8rem', fontFamily: 'monospace', fontWeight: '900', color: 'var(--primary)', letterSpacing: '2px' }}>{activeBooking.otp}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => {
                  const url = `https://www.google.com/maps/search/?api=1&query=${activeBooking.space.location.lat},${activeBooking.space.location.lng}`;
                  window.open(url, '_blank');
                }} 
                className="btn-gradient" 
                style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
              >
                <Navigation size={14} /> Navigate
              </button>
              <button 
                onClick={handleCompleteParking} 
                className="glass" 
                style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.85rem', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', background: 'rgba(239, 68, 68, 0.05)' }}
              >
                Stop Parking
              </button>
            </div>
          </div>
        )}

        {paymentPlan && (
          <PaymentModal 
            plan={paymentPlan} 
            entityId={selectedSpace?._id} 
            entityType="parking" 
            onClose={() => setPaymentPlan(null)} 
            onSuccess={handleBookingPaymentSuccess}
          />
        )}
      </section>
    </>
  );
}
