import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, Phone, KeyRound, User, Car, CheckCircle, AlertTriangle, ArrowRight, Loader2, Mail, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { getBackendUrl } from '../utils/api';
import { AuthContext } from '../App';

export default function ActivateSticker() {
  const { stickerId } = useParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Flow steps: 'loading' | 'invalid' | 'phone_input' | 'otp_verify' | 'register_form' | 'success'
  const [step, setStep] = useState('loading');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState(''); // Secure verified session token
  const [ownerName, setOwnerName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [email, setEmail] = useState('');

  const API_BASE = getBackendUrl();

  // Validate sticker status on mount
  useEffect(() => {
    const checkStickerStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stickers/status/${stickerId}`);
        const data = await res.json();

        if (res.status === 404) {
          setErrorMessage(data.message || 'Invalid QR Sticker ID.');
          setStep('invalid');
        } else if (res.ok) {
          if (data.status === 'Active') {
            // Already active - redirect to the public profile directly
            toast.success("This sticker is already active. Opening Emergency Profile...");
            navigate(`/v/${stickerId}`, { replace: true });
          } else {
            setStep('phone_input');
          }
        } else {
          setErrorMessage('Could not check sticker status. Try again.');
          setStep('invalid');
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Network error checking sticker status.');
        setStep('invalid');
      }
    };

    if (stickerId) {
      checkStickerStatus();
    } else {
      setErrorMessage('No Sticker ID provided.');
      setStep('invalid');
    }
  }, [stickerId, navigate, API_BASE]);

  // Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      return toast.error('Please enter a valid 10-digit mobile number.');
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/stickers/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, stickerId })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setStep('otp_verify');
      } else {
        toast.error(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      return toast.error('Please enter a 6-digit OTP.');
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/stickers/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, stickerId })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setOtpToken(data.token);
        setStep('register_form');
      } else {
        toast.error(data.message || 'Incorrect OTP.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Complete Activation
  const handleActivate = async (e) => {
    e.preventDefault();
    if (!ownerName || !vehicleNumber || !vehicleBrand || !vehicleModel || !vehicleColor || !emergencyContact) {
      return toast.error('Please fill in all required fields.');
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/stickers/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stickerId,
          phone,
          activationToken: otpToken,
          ownerName,
          vehicleNumber,
          vehicleBrand,
          vehicleModel,
          vehicleColor,
          emergencyContact,
          email
        })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        // Login local session so the user dashboard is active
        if (data.user) {
          // Verify if actual login token is returned, if not we can use the activationToken temporarily or prompt login
          // We will save user details so user is logged in
          localStorage.setItem('parkeActiveUser', JSON.stringify(data.user));
          localStorage.setItem('parkeToken', otpToken);
          // Sync frontend AuthContext
          login(data.user, otpToken);
        }
        setStep('success');
      } else {
        toast.error(data.message || 'Activation failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error during activation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030712', padding: '100px 1rem 40px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SEO 
        title={`Activate Smart Sticker ${stickerId} - Parxéé City`} 
        description="Quick secure activation for pre-printed Parxéé City smart vehicle protection cards."
      />

      <div style={{ width: '100%', maxWidth: '480px' }}>
        
        {/* Logo / Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Parxéé City" style={{ width: '60px', height: '60px', borderRadius: '15px', marginBottom: '1rem', border: '1px solid rgba(20, 184, 166, 0.3)' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#fff', marginBottom: '0.25rem' }}>PARXÉÉ CITY</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Smart Vehicle Identity & Road Safety Platform</p>
        </div>

        {/* Outer Card with glassmorphism */}
        <div className="electric-border" style={{ borderRadius: '24px' }}>
          <div className="glass-premium" style={{ padding: '2rem', borderRadius: '24px' }}>
            
            {/* Step 1: Loading status */}
            {step === 'loading' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <Loader2 size={48} className="text-gradient" style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 1.5rem' }} />
                <p style={{ fontWeight: '600', color: 'var(--primary)' }}>Verifying Sticker ID Security Grid...</p>
                <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
              </div>
            )}

            {/* Step 1B: Invalid Status */}
            {step === 'invalid' && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <AlertTriangle size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: '#fff' }}>Activation Blocked</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
                  {errorMessage || 'This Sticker ID is invalid or cannot be verified. Please check the QR code on your card.'}
                </p>
                <Link to="/" className="btn-secondary" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 'bold' }}>
                  Return to Home
                </Link>
              </div>
            )}

            {/* Step 2: Request OTP */}
            {step === 'phone_input' && (
              <form onSubmit={handleSendOtp}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Shield size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>Sticker ID: {stickerId}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Enter your mobile number to verify and activate this sticker.</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Mobile Number</label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      <Phone size={16} />
                      <span>+91</span>
                    </div>
                    <input 
                      type="tel" 
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').substring(0, 10))}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 14px 14px 75px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.3s' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-gradient" 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 'bold', border: 'none', color: '#000', background: 'var(--gradient-primary)', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loading ? 'Sending Code...' : 'Send Verification OTP'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {/* Step 3: Verify OTP */}
            {step === 'otp_verify' && (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <KeyRound size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>Verify Mobile</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>We sent a 6-digit OTP code to <strong>+91 {phone}</strong>.</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Enter 6-Digit OTP</label>
                  <input 
                    type="text" 
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '6px', fontWeight: 'bold', outline: 'none', transition: 'all 0.3s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => setStep('phone_input')} 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 'bold', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-gradient" 
                    style={{ flex: 2, padding: '14px', borderRadius: '12px', fontWeight: 'bold', border: 'none', color: '#000', background: 'var(--gradient-primary)', cursor: loading ? 'not-allowed' : 'pointer' }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Vehicle & Owner Registration */}
            {step === 'register_form' && (
              <form onSubmit={handleActivate}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>Vehicle Protection Registration</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Link your vehicle details to Sticker ID <strong>{stickerId}</strong>.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '6px', marginBottom: '1.5rem' }}>
                  
                  {/* Owner Name */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      <User size={12} color="var(--primary)" /> Owner Full Name *
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ramesh Kumar"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none' }}
                      required
                    />
                  </div>

                  {/* Vehicle Plate Number */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      <Car size={12} color="var(--primary)" /> Vehicle Plate Number *
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. DL 3C AB 1234"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none' }}
                      required
                    />
                  </div>

                  {/* Brand & Model (Flex Row) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '6px' }}>Brand (Make) *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Hyundai"
                        value={vehicleBrand}
                        onChange={(e) => setVehicleBrand(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '6px' }}>Model Name *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. i20"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Vehicle Color */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '6px' }}>Vehicle Color *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. White"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none' }}
                      required
                    />
                  </div>

                  {/* Emergency Contact Number */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      <Users size={12} color="var(--primary)" /> Emergency Contact No *
                    </label>
                    <input 
                      type="tel" 
                      placeholder="Parents / Spouse Phone Number"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value.replace(/[^0-9]/g, ''))}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none' }}
                      required
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      <Mail size={12} color="var(--primary)" /> Email Address (Optional)
                    </label>
                    <input 
                      type="email" 
                      placeholder="e.g. name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none' }}
                    />
                  </div>

                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-gradient" 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 'bold', border: 'none', color: '#000', background: 'var(--gradient-primary)', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Saving Protection Settings...' : '✔ Complete Activation'}
                </button>
              </form>
            )}

            {/* Step 5: Success screen */}
            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ color: 'var(--primary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', background: 'rgba(20, 184, 166, 0.1)' }}>
                  <CheckCircle size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>Successfully Activated!</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Your PARXÉÉ CITY QR sticker is now active. Anyone scanning the sticker can contact you securely and report roadside emergencies.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>STICKER DETAILS:</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Sticker ID:</span>
                    <strong style={{ color: '#fff' }}>{stickerId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Owner:</span>
                    <strong style={{ color: '#fff' }}>{ownerName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Vehicle Plate:</span>
                    <strong style={{ color: 'var(--primary)' }}>{vehicleNumber}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    onClick={() => navigate('/profile')} 
                    className="btn-gradient" 
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 'bold', border: 'none', color: '#000', background: 'var(--gradient-primary)', cursor: 'pointer' }}
                  >
                    Go to User Dashboard
                  </button>
                  <button 
                    onClick={() => navigate(`/v/${stickerId}`)} 
                    className="btn-secondary" 
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 'bold', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
                  >
                    View Public Safety Profile
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
