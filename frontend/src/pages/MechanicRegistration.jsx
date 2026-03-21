import { useState } from 'react';
import { User, Mail, MapPin, Wrench, Navigation, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MechanicRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    email: '',
    phone: '',
    password: '',
    highwayLocation: '',
    experienceYears: '',
    services: []
  });

  const availableServices = [
    'Engine Repair', 'Towing', 'Tire Change', 'Battery Jumpstart', 
    'Fuel Delivery', 'Lockout Service', 'AC Repair', 'General Diagnostics'
  ];

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.services.length === 0) {
      setError("Please select at least one service you offer.");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parka-backend.vercel.app'}/api/mechanics/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Registration Successful! Welcome to the Parké City Mechanic Network.");
        // Redirect to home or a mechanic dashboard if you build one later
        navigate('/');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error connecting to the server.');
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

          <form onSubmit={handleSubmit}>
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
                          <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} placeholder="e.g. 5" required min="0" />
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
                      <input type="text" name="highwayLocation" value={formData.highwayLocation} onChange={handleChange} placeholder="e.g. NH-48 (Delhi-Jaipur Highway), near Sector 29" required />
                      <p style={{fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px'}}>Be specific so broken-down drivers can find you easily.</p>
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
                  {loading ? 'Registering...' : 'Register as Mechanic Partner'}
              </button>
          </form>
        </div>
      </div>
    </div>
  );
}
