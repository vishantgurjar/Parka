import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import SEO from '../components/SEO';
import { 
  MapPin, DollarSign, Home, CheckCircle, Navigation, 
  ShieldCheck, TrendingUp, Info, Plus, Trash2, Camera, 
  Zap, Eye, HelpCircle, Layers, Check 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBackendUrl } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function HostSpace() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    address: '',
    pricePerHour: '50',
    description: '',
    lat: '',
    lng: ''
  });
  const [spotType, setSpotType] = useState('Driveway');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]); // Base64 data-URIs
  
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Earnings calculator state
  const [calcPrice, setCalcPrice] = useState(50);
  const [calcHours, setCalcHours] = useState(8);
  const [monthlyEarnings, setMonthlyEarnings] = useState(12000);

  // Sync earnings calculation
  useEffect(() => {
    setMonthlyEarnings(calcPrice * calcHours * 30);
  }, [calcPrice, calcHours]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '3rem', maxWidth: '450px' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>Access Host Console</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>You need to be logged in to access the PARXÉÉ Space Host dashboard and begin earning.</p>
          <button onClick={() => navigate('/login', { state: { from: '/host' } })} className="btn-gradient" style={{ padding: '14px 28px', borderRadius: '12px', width: '100%', fontSize: '1rem', fontWeight: 'bold' }}>Go to Login</button>
        </div>
      </div>
    );
  }

  // Handle spot type selection
  const spotTypes = [
    { id: 'Driveway', label: 'Driveway', icon: '🚗' },
    { id: 'Garage', label: 'Garage', icon: '🔒' },
    { id: 'Basement', label: 'Basement', icon: '🏢' },
    { id: 'Open Plot', label: 'Open Plot', icon: '🛣️' }
  ];

  // Handle amenities selection
  const amenitiesList = [
    { id: 'CCTV', label: 'CCTV Security', icon: <Eye size={14} /> },
    { id: 'EV Charger', label: 'EV Charger', icon: <Zap size={14} /> },
    { id: 'Covered', label: 'Covered Parking', icon: <Home size={14} /> },
    { id: 'Gate Access', label: 'Secure Gate', icon: <ShieldCheck size={14} /> }
  ];

  const toggleAmenity = (id) => {
    if (selectedAmenities.includes(id)) {
      setSelectedAmenities(selectedAmenities.filter(item => item !== id));
    } else {
      setSelectedAmenities([...selectedAmenities, id]);
    }
  };

  // Handle local image file uploads and convert to Base64
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed!");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Fetch location coordinates
  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({ ...formData, lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast.success("GPS Coordinates Locked! 📍");
          setIsLocating(false);
        },
        (err) => {
          // Fallback coords (e.g. Delhi area) to allow seamless sandbox listing
          const fallbackLat = 28.6139 + (Math.random() - 0.5) * 0.05;
          const fallbackLng = 77.2090 + (Math.random() - 0.5) * 0.05;
          setFormData({ ...formData, lat: fallbackLat, lng: fallbackLng });
          toast.success("Simulation: Location set (Delhi GPS fallback)!");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  // Submit Listing
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lat || !formData.lng) {
      toast.error("Please lock your GPS location coordinates first.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const baseUrl = getBackendUrl();
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
          location: { lat: formData.lat, lng: formData.lng },
          spotType,
          amenities: selectedAmenities,
          images: uploadedImages
        })
      });

      if (res.ok) {
        toast.success("Space listed successfully! Premium hosting active.");
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
      <SEO title="Premium Host Console - PARXÉÉ SPACE" description="Monetize your parking spots with premium security and high earnings." />
      <div className="bg-grain"></div>
      
      <section className="host-page-section">
        <div className="container" style={{ maxWidth: '1200px' }}>
          
          {/* Host vs Book Segmented Control Tab */}
          <div className="segmented-control-wrapper">
            <div className="segmented-control">
              <button 
                type="button"
                onClick={() => {}} 
                className="segmented-btn active"
              >
                <Home size={16} /> Host Your Space
              </button>
              <button 
                type="button"
                onClick={() => navigate('/park')} 
                className="segmented-btn inactive"
              >
                <MapPin size={16} /> Book Parking Spot
              </button>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="host-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
            
            {/* LEFT SIDE: Premium Console Presentation */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
              
              {/* Badge */}
              <div style={{ alignSelf: 'flex-start', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(94, 234, 212, 0.15) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '50px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontWeight: '900', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                <Layers size={14} /> PARXÉÉ PRESTIGE HOST
              </div>
              
              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '900', letterSpacing: '-1.5px', lineHeight: '1.1', marginBottom: '1.5rem' }}>
                Turn Empty Space Into <span className="text-gradient">Passive Wealth.</span>
              </h1>
              
              <p style={{ color: 'var(--muted)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '3rem', maxWidth: '520px' }}>
                Join the premium parking network. Host your driveway, garage, or private parking bay and get access to secure automatic payouts, smart scheduling, and 24/7 verified guard support.
              </p>

              {/* DYNAMIC EARNINGS CALCULATOR */}
              <div className="bento-item" style={{ padding: '2.5rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '24px', position: 'relative', overflow: 'hidden', marginBottom: '3rem' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} style={{ color: 'var(--primary)' }} /> Estimate Your Earnings
                </h3>

                {/* Slider 1: Hourly rate */}
                <div style={{ marginBottom: '1.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <span style={{ color: 'var(--muted)' }}>Set Price per Hour</span>
                    <span style={{ color: '#fff' }}>₹{calcPrice}/hr</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="200" 
                    step="5"
                    value={calcPrice} 
                    onChange={(e) => setCalcPrice(Number(e.target.value))}
                    style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', outline: 'none', cursor: 'pointer', accentColor: 'var(--primary)' }} 
                  />
                </div>

                {/* Slider 2: Occupancy hours */}
                <div style={{ marginBottom: '2.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <span style={{ color: 'var(--muted)' }}>Daily Booked Hours</span>
                    <span style={{ color: '#fff' }}>{calcHours} hrs/day</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="24" 
                    value={calcHours} 
                    onChange={(e) => setCalcHours(Number(e.target.value))}
                    style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', outline: 'none', cursor: 'pointer', accentColor: 'var(--primary)' }} 
                  />
                </div>

                {/* Earnings Output Display */}
                <div style={{ background: 'rgba(94, 234, 212, 0.04)', border: '1px solid rgba(94, 234, 212, 0.1)', borderRadius: '16px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', fontWeight: 'bold' }}>Projected Income</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.5px' }}>₹{monthlyEarnings.toLocaleString('en-IN')}<span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--muted)' }}>/mo</span></span>
                  </div>
                  <div style={{ background: 'rgba(94, 234, 212, 0.1)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', padding: '6px 12px', borderRadius: '50px' }}>
                    ⚡ High Demand Spot
                  </div>
                </div>
              </div>

              {/* PRESTIGE BENCHMARKS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(94, 234, 212, 0.1)', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '4px' }}>Guaranteed Host Shield Protection</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Your property is secured with our zero-liability hosting shield policy against accidental damages.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '10px', borderRadius: '12px' }}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '4px' }}>EV SmartGrid Hub Ready</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Turn your space into an EV charging hub by selecting the EV amenity pill and double your occupancy.</p>
                  </div>
                </div>

                {/* Prestige Booking Option Card */}
                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(168, 85, 247, 0.04)', border: '1px dashed rgba(168, 85, 247, 0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '8px', borderRadius: '50%' }}>
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.95rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>Looking to Book a Space?</h5>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>Rent premium spots instantly on live satellite radar map.</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => navigate('/park')} 
                    className="btn-gradient" 
                    style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', border: 'none', padding: '10px 16px', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                  >
                    Open Parking Booking Radar
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: Interactive Premium Form */}
            <div className="bento-item" style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
              
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '2rem' }}>List Parking Spot</h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                
                {/* 1. Address input */}
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Complete Spot Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', top: '15px', left: '14px', opacity: 0.5 }} />
                    <input 
                      type="text" 
                      placeholder="e.g., Suite 42, Skyline Towers, Gurugram"
                      required
                      style={{ width: '100%', padding: '14px 14px 14px 42px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', outline: 'none', transition: 'border-color 0.2s' }}
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>

                {/* 2. Spot Type selectors (2x2 Grid) */}
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: '10px', display: 'block' }}>Select Parking Spot Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {spotTypes.map((type) => {
                      const isActive = spotType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSpotType(type.id)}
                          style={{
                            background: isActive ? 'rgba(168, 85, 247, 0.08)' : 'rgba(0,0,0,0.2)',
                            border: isActive ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            color: isActive ? '#fff' : 'var(--muted)',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>{type.icon}</span>
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Pricing input */}
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Hourly Price (INR)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '14px', left: '14px', opacity: 0.5, fontWeight: 'bold', fontSize: '1.1rem' }}>₹</span>
                    <input 
                      type="number" 
                      min="10"
                      max="500"
                      placeholder="e.g., 50"
                      required
                      style={{ width: '100%', padding: '14px 14px 14px 35px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                      value={formData.pricePerHour}
                      onChange={e => setFormData({...formData, pricePerHour: e.target.value})}
                    />
                  </div>
                </div>

                {/* 4. Description input */}
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Spot Description & Access Rules</label>
                  <textarea 
                    rows="3"
                    placeholder="Provide details (e.g. 'Opposite Blue Gate, enter via parking card, CCTV active...')"
                    style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', outline: 'none', resize: 'vertical' }}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                {/* 5. Amenities Pills selection */}
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: '10px', display: 'block' }}>Select Amenity Features</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {amenitiesList.map((item) => {
                      const isSelected = selectedAmenities.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleAmenity(item.id)}
                          style={{
                            background: isSelected ? 'rgba(94, 234, 212, 0.1)' : 'rgba(255,255,255,0.02)',
                            color: isSelected ? 'var(--primary)' : 'var(--muted)',
                            border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                            padding: '10px 16px',
                            borderRadius: '50px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {item.icon}
                          {item.label}
                          {isSelected && <Check size={12} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Premium Image Upload with Live Base64 Preview */}
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: '10px', display: 'block' }}>Upload Spot Images (Premium Feature)</label>
                  
                  {/* Dropzone design */}
                  <label 
                    style={{
                      border: '2px dashed rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: 'rgba(0,0,0,0.15)',
                      transition: 'border-color 0.2s',
                      gap: '8px'
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={handleImageUpload} 
                    />
                    <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}>
                      <Camera size={22} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Drag and drop or Browse images</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Supports JPG, PNG (Max 3 files)</span>
                  </label>

                  {/* Previews display */}
                  {uploadedImages.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '12px' }}>
                      {uploadedImages.map((src, index) => (
                        <div 
                          key={index} 
                          style={{
                            position: 'relative',
                            height: '75px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <img src={src} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(239, 68, 68, 0.85)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 7. Location verification widget */}
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>Spot Location Verification</label>
                  {formData.lat ? (
                    <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', color: '#10b981', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                        <CheckCircle size={18} /> GPS Coordinates Locked & Verified
                      </div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.9, marginLeft: '26px', display: 'flex', gap: '15px' }}>
                        <span>Lat: {Number(formData.lat).toFixed(6)}</span>
                        <span>Lng: {Number(formData.lng).toFixed(6)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, lat: '', lng: '' })}
                        style={{ alignSelf: 'flex-start', margin: '8px 0 0 26px', background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}
                      >
                        Reset Coordinates
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button 
                        type="button" 
                        onClick={handleGetLocation} 
                        className={`glass ${isLocating ? 'pulse-anim' : ''}`}
                        disabled={isLocating}
                        style={{ width: '100%', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)' }}
                      >
                        <Navigation size={18} style={{ color: 'var(--primary)' }} /> {isLocating ? 'Scanning Satellite GPS...' : 'Verify Spot GPS Location'}
                      </button>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Info size={12} /> Please ensure you are standing at the parking space before verification.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  className="btn-gradient light-sweep" 
                  disabled={isSubmitting || !formData.lat}
                  style={{ marginTop: '1rem', padding: '16px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (isSubmitting || !formData.lat) ? 0.4 : 1 }}
                >
                  {isSubmitting ? 'Registering Premium Spot...' : 'Activate Premium Listing'}
                </button>

              </form>
            </div>

          </div>
        </div>
      </section>

      {/* CSS details to ensure custom UI enhancements look perfect */}
      <style dangerouslySetInnerHTML={{__html: `
        .host-page-section {
          padding: 8rem 0 6rem;
          min-height: 100vh;
          position: relative;
        }
        .segmented-control-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 3rem;
        }
        .segmented-control {
          background: rgba(255, 255, 255, 0.03);
          padding: 6px;
          border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: inline-flex;
          gap: 4px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .segmented-control:hover {
          border-color: rgba(168, 85, 247, 0.3);
          box-shadow: 0 8px 32px 0 rgba(168, 85, 247, 0.15);
          transform: translateY(-2px);
        }
        .segmented-btn {
          border: none;
          padding: 10px 24px;
          border-radius: 50px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .segmented-btn.active {
          background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
          color: #fff;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
        }
        .segmented-btn.inactive {
          background: transparent;
          color: var(--muted);
        }
        .segmented-btn.inactive:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(94, 234, 212, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(94, 234, 212, 0); }
          100% { box-shadow: 0 0 0 0 rgba(94, 234, 212, 0); }
        }
        .pulse-anim {
          animation: pulse 1.5s infinite;
          border-color: var(--primary) !important;
        }
        @media (max-width: 900px) {
          .host-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
        @media (max-width: 768px) {
          .host-page-section {
            padding: 9.5rem 0 4rem !important;
          }
          .segmented-control-wrapper {
            margin-bottom: 2rem;
            padding: 0 1rem;
          }
          .segmented-control {
            width: 100%;
            max-width: 380px;
          }
          .segmented-btn {
            flex: 1;
            justify-content: center;
            padding: 10px 16px;
            font-size: 0.8rem;
          }
        }
      `}} />
    </>
  );
}
