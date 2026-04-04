import { useState } from 'react';
import { User, Mail, MapPin, Wrench, Navigation, CheckCircle, CreditCard, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';

export default function MechanicRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    email: '',
    phone: '',
    password: '',
    highwayLocation: '',
    experienceYears: '',
    services: [],
    dateOfBirth: '',
    idNumber: '',
    latitude: null,
    longitude: null
  });

  const REGISTRATION_FEE = 499;

  const availableServices = [
    'Engine Repair', 'Towing', 'Tire Change', 'Battery Jumpstart', 
    'Fuel Delivery', 'Lockout Service', 'AC Repair', 'General Diagnostics'
  ];

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLoading(false);
        alert("Exact shop location captured successfully! ✅");
      },
      (err) => {
        console.error("Location error:", err);
        setLoading(false);
        setError("Could not get location. Please ensure GPS is enabled and permission is granted.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleCheckboxChange = (service) => {
    setFormData(prev => {
      if (prev.services.includes(service)) {
        return { ...prev, services: prev.services.filter(s => s !== service) };
      } else {
        return { ...prev, services: [...prev.services, service] };
      }
    });
  };

  const handleInitiateRegistration = (e) => {
    e.preventDefault();
    
    // Validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!formData.dateOfBirth) {
      setError("Please provide your date of birth for verification.");
      return;
    }

    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setError("You must be at least 18 years old to register as a partner.");
      return;
    }

    if (formData.services.length === 0) {
      setError("Please select at least one service you offer.");
      return;
    }
    setError(null);
    setShowPayment(true);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/mechanics/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Registration Submitted Successfully! Your profile will be active after payment verification by our team.");
        navigate('/');
      } else {
        setError(data.message || 'Registration failed.');
        setShowPayment(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error connecting to the server.');
      setShowPayment(false);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="glass-card">
          <div className="card-header">
              <h1 className="card-title">
                  <Wrench style={{color: 'var(--primary)'}} size={32} />
                  Mechanic Partner Registration
              </h1>
              <p className="card-description">
                  Join Parké City's Highway Emergency Network and reach more customers
              </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleInitiateRegistration}>
              {/* Personal & Shop Info */}
              <div style={{marginBottom: '32px'}}>
                  <h3 className="section-title">
                      <User /> Profile Information
                  </h3>
                  <div className="form-grid form-grid-2">
                      <div className="form-group">
                          <label className="form-label">Full Name</label>
                          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="First & Last Name" required />
                      </div>
                      <div className="form-group">
                          <label className="form-label">Shop/Business Name</label>
                          <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} placeholder="e.g. Sharma Auto Repairs" required />
                      </div>
                      <div className="form-group">
                          <label className="form-label">Email Address</label>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="mechanic@example.com" required />
                      </div>
                      <div className="form-group">
                          <label className="form-label">Phone Number</label>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="For emergency calls" required />
                      </div>
                      <div className="form-group">
                          <label className="form-label">Create Password</label>
                          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Secure password" required minLength="6" />
                      </div>
                      <div className="form-group">
                          <label className="form-label">Years of Experience</label>
                          <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} placeholder="e.g. 5" required min="0" max="50" />
                      </div>
                      <div className="form-group">
                          <label className="form-label"><Calendar size={16} /> Date of Birth</label>
                          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                          <label className="form-label"><FileText size={16} /> ID Proof Number (Aadhar/PAN)</label>
                          <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="XXXX-XXXX-XXXX" required />
                      </div>
                  </div>
              </div>

              <div className="separator"></div>

              {/* Location Info */}
              <div style={{marginBottom: '32px'}}>
                  <h3 className="section-title">
                      <Navigation /> Service Area
                  </h3>
                  <div className="form-group">
                      <label className="form-label">Primary Highway/Location</label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input type="text" name="highwayLocation" value={formData.highwayLocation} onChange={handleChange} placeholder="e.g. NH-48 (Delhi-Jaipur Highway), near Sector 29" style={{ flexGrow: 1 }} required />
                        <button type="button" onClick={detectLocation} className="btn-secondary" style={{ padding: '0 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                          <MapPin size={16} /> Detect Exact Location
                        </button>
                      </div>
                      {formData.latitude && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '8px', fontWeight: 'bold' }}>
                          ✓ Exact coordinates captured: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                        </p>
                      )}
                      <p style={{fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px'}}>Be specific so broken-down drivers can find you easily. Use the "Detect" button for maximum accuracy.</p>
                  </div>
              </div>

              <div className="separator"></div>

              {/* Services Offered */}
              <div style={{marginBottom: '32px'}}>
                  <h3 className="section-title">
                      <CheckCircle /> Services Offered
                  </h3>
                  <p style={{fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '16px'}}>Select all emergencies you can handle:</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {availableServices.map(service => (
                      <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <input 
                          type="checkbox" 
                          checked={formData.services.includes(service)}
                          onChange={() => handleCheckboxChange(service)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                        />
                        <span style={{ color: 'var(--fg)' }}>{service}</span>
                      </label>
                    ))}
                  </div>
              </div>

              <button type="submit" className="btn-gradient full-width" style={{padding: '16px', fontSize: '1.1rem', border: 'none', borderRadius: '12px', fontWeight: 'bold'}} disabled={loading}>
                  {loading ? 'Processing...' : `Pay ₹${REGISTRATION_FEE} & Register`}
              </button>
          </form>
        </div>
      </div>

      {showPayment && (
        <PaymentModal 
          plan={{ name: 'Mechanic Registration', amount: REGISTRATION_FEE }} 
          onClose={() => setShowPayment(false)} 
        />
      )}
      
      {/* Overlay Step for Finalizing */}
      {showPayment && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1001, width: '90%', maxWidth: '400px' }}>
          <button 
            onClick={handleFinalSubmit} 
            className="btn-gradient full-width" 
            style={{ padding: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : '✅ I have Paid, Complete Registration'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#fff', marginTop: '8px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            Registration will be pending until payment is verified.
          </p>
        </div>
      )}
    </div>
  );
}

