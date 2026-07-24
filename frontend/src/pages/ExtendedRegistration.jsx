import { useState, useContext } from 'react';
import { User, Mail, Calendar, MapPin, Car, FileText, Bookmark, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { toast } from 'react-hot-toast';
import { getBackendUrl } from '../utils/api';
import VerificationSection from '../components/VerificationSection';

export default function ExtendedRegistration() {
  const [step, setStep] = useState(1);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Verification & Password Visbility States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    make: '',
    model: '',
    year: '',
    color: '',
    plateNumber: '',
    rcNumber: '',
    rcExpiryDate: '',
    licenseNumber: '',
    licenseExpiryDate: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 30}, (_, i) => currentYear - i);

  const handlePersonalSubmit = (e) => {
    e.preventDefault();
    if (!isEmailVerified) {
      return toast.error('Please verify your Email Address OTP to continue.');
    }
    if (!isPhoneVerified) {
      return toast.error('Please verify your Mobile Phone SMS OTP to continue.');
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailVerified || !isPhoneVerified) {
      return toast.error('Email & Phone number verification are mandatory to complete registration.');
    }
    
    const password = formData.password || 'parkecity123';

    const payload = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      password: password,
      isEmailVerified: isEmailVerified,
      isPhoneVerified: isPhoneVerified,
      make: formData.make,
      model: formData.model,
      year: formData.year,
      color: formData.color,
      plateNumber: formData.plateNumber,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      rcNumber: formData.rcNumber,
      rcExpiryDate: formData.rcExpiryDate,
      licenseNumber: formData.licenseNumber,
      licenseExpiryDate: formData.licenseExpiryDate
    };

    try {
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        login(data.user, data.token);
        alert(`Registration Complete, ${data.user.name}! You are now logged in.`);
        navigate('/');
      } else {
        alert(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Network error connecting to the server.');
    }
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg)' }}>
      <SEO 
        title="Register Vehicle - Parxéé City"
        description="Register your vehicle with Parxéé City to get your smart QR-based Emergency Card and access premium protection services."
      />
      <div className="container">
        
        {step === 1 ? (
          <div className="glass-card">
            <div className="card-header">
                <h1 className="card-title">
                    <User style={{color: 'var(--primary)'}} size={32} />
                    Personal Information
                </h1>
                <p className="card-description">
                    Please provide your personal details to create your Parxéé City profile
                </p>
            </div>

            <form onSubmit={handlePersonalSubmit}>
                {/* Basic Info */}
                <div style={{marginBottom: '32px'}}>
                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" required />
                        </div>
                    </div>
                </div>

                <div className="separator"></div>

                {/* Contact & Verification Info */}
                <VerificationSection 
                  email={formData.email}
                  setEmail={(val) => setFormData(prev => ({ ...prev, email: val }))}
                  phone={formData.phone}
                  setPhone={(val) => setFormData(prev => ({ ...prev, phone: val }))}
                  isEmailVerified={isEmailVerified}
                  setIsEmailVerified={setIsEmailVerified}
                  isPhoneVerified={isPhoneVerified}
                  setIsPhoneVerified={setIsPhoneVerified}
                />

                <div style={{marginBottom: '32px'}}>
                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label"><Lock size={16}/> Account Password</label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                  type={showPassword ? "text" : "password"} 
                                  name="password" 
                                  value={formData.password} 
                                  onChange={handleChange} 
                                  placeholder="Create account password" 
                                  required 
                                  style={{ paddingRight: '46px' }}
                                />
                                <button 
                                  type="button" 
                                  onClick={() => setShowPassword(!showPassword)}
                                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--muted)'}
                                  title={showPassword ? "Hide password" : "Show password"}
                                >
                                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label"><Calendar size={16}/> Date of Birth</label>
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                <div className="separator"></div>

                {/* Address Info */}
                <div style={{marginBottom: '32px'}}>
                    <h3 className="section-title">
                        <MapPin /> Address Information
                    </h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Street Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main Street" required />
                        </div>
                        <div className="form-grid form-grid-3">
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">ZIP Code</label>
                                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="xxxxxx" required />
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn-gradient full-width" style={{padding: '16px', fontSize: '1rem', border: 'none', borderRadius: '12px'}}>
                    Continue to Vehicle Details
                </button>
            </form>
          </div>
        ) : (
          <div className="glass-card">
            <div className="card-header">
                <h1 className="card-title">
                    <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                    Vehicle Details
                </h1>
                <p className="card-description">
                    Add your vehicle information and documentation details
                </p>
            </div>

            <form onSubmit={handleVehicleSubmit}>
                {/* Vehicle Basic Info */}
                <div style={{marginBottom: '32px'}}>
                    <h3 className="section-title">
                        <Car /> Vehicle Information
                    </h3>
                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Make</label>
                            <select name="make" value={formData.make} onChange={handleChange} required>
                                <option value="">Select make</option>
                                {['Toyota','Honda','Ford','Suzuki','BMW','Mercedes-Benz','Audi','Nissan','Hyundai','Kia','Range Rover','Mahindra','Tata','MG Motor','Lexus','Renault','Volkswagen','Jeep','Other'].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Model</label>
                            <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="Camry, Accord, F-150..." required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Year</label>
                            <select name="year" value={formData.year} onChange={handleChange} required>
                                <option value="">Select year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Color</label>
                            <select name="color" value={formData.color} onChange={handleChange} required>
                                <option value="">Select color</option>
                                {['White','Black','Silver','Gray','Red','Blue','Green','Brown','Orange','Yellow','Purple','Gold'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{marginTop: '16px'}}>
                        <label className="form-label">License Plate Number</label>
                        <input type="text" name="plateNumber" value={formData.plateNumber} onChange={handleChange} placeholder="UPxx AB xxxx" style={{textTransform: 'uppercase'}} required />
                    </div>
                </div>

                <div className="separator"></div>

                {/* RC Details */}
                <div style={{marginBottom: '32px'}}>
                    <h3 className="section-title">
                        <FileText /> Registration Certificate (RC)
                    </h3>
                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label">RC Number</label>
                            <input type="text" name="rcNumber" value={formData.rcNumber} onChange={handleChange} placeholder="UP01AB1234" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">RC Expiry Date</label>
                            <input type="date" name="rcExpiryDate" value={formData.rcExpiryDate} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                <div className="separator"></div>

                {/* Driving License */}
                <div style={{marginBottom: '32px'}}>
                    <h3 className="section-title">
                        <Bookmark /> Driving License Details
                    </h3>
                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label">License Number</label>
                            <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="DL123456789" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">License Expiry Date</label>
                            <input type="date" name="licenseExpiryDate" value={formData.licenseExpiryDate} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                <div className="separator"></div>
                <div className="btn-group">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{padding: '16px', borderRadius: '12px', border: 'none'}}>
                        Back to Personal Info
                    </button>
                    <button type="submit" className="btn-gradient" style={{padding: '16px', border: 'none', borderRadius: '12px', flex: '2'}}>
                        Complete Registration
                    </button>
                </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
