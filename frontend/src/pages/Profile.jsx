import { useContext } from 'react';
import { AuthContext } from '../App';
import { User, Mail, Phone, Car, ShieldCheck, MapPin, Award, FileText, Calendar, Zap } from 'lucide-react';
import SEO from '../components/SEO';

export default function Profile() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 className="section-title">Please login to view your profile.</h2>
      </div>
    );
  }

  const tierColor = user.subscriptionTier === 'diamond' ? '#818cf8' : (user.subscriptionTier === 'gold' ? '#eab308' : '#38bdf8');

  return (
    <>
      <SEO title={`${user.name} - Profile | Parkéé City`} />
      
      <div className="profile-page" style={{ padding: '100px 0 60px', background: 'var(--bg)', minHeight: '90vh' }}>
        <div className="container">
          
          <div className="section-header" style={{ marginBottom: '40px' }}>
            <div className="emergency-badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
              <User size={14} /> ACCOUNT OVERVIEW
            </div>
            <h2 className="section-title">Your Premium <span className="text-gradient">Profile</span></h2>
          </div>

          <div className="form-grid form-grid-2" style={{ gap: '30px', alignItems: 'start' }}>
            
            {/* CARD 1: PERSONAL IDENTITY (Carbon Fiber Style) */}
            <div className="hybrid-card" style={{ width: '100%', height: 'auto', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
              <div className="carbon-section" style={{ height: '80px' }}>
                <div className="hybrid-brand">
                  <div className="logo-icon" style={{ background: tierColor, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyCenter: 'center', borderRadius: '50%', color: '#fff' }}>
                    <User size={24} />
                  </div>
                  <span>PERSONAL IDENTITY</span>
                </div>
                <div className={`tier-badge tier-badge-${user.subscriptionTier?.toLowerCase()}`} style={{ padding: '6px 16px', borderRadius: '50px', fontWeight: '900', fontSize: '0.8rem', background: tierColor, color: '#fff' }}>
                  {user.subscriptionTier?.toUpperCase() || 'FREE'}
                </div>
              </div>

              <div className="glass-section" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
                <div className="hybrid-info">
                  <div className="hybrid-info-group">
                    <span className="hybrid-label">FULL NAME</span>
                    <span className="hybrid-value" style={{ fontSize: '1.8rem' }}>{user.name}</span>
                  </div>
                </div>

                <div className="form-grid form-grid-2" style={{ width: '100%', gap: '20px' }}>
                  <div className="hybrid-info-group">
                    <span className="hybrid-label"><Mail size={10} style={{ marginRight: '4px' }} /> EMAIL ADDRESS</span>
                    <span className="hybrid-value" style={{ fontSize: '1rem', textTransform: 'none' }}>{user.email}</span>
                  </div>
                  <div className="hybrid-info-group">
                    <span className="hybrid-label"><Phone size={10} style={{ marginRight: '4px' }} /> CONTACT NUMBER</span>
                    <span className="hybrid-value" style={{ fontSize: '1rem' }}>{user.phone || 'Not Provided'}</span>
                  </div>
                </div>
                
                <div className="hybrid-info-group" style={{ width: '100%' }}>
                  <span className="hybrid-label"><MapPin size={10} style={{ marginRight: '4px' }} /> REGISTERED ADDRESS</span>
                  <span className="hybrid-value" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {user.address ? `${user.address}, ${user.city}, ${user.state} ${user.zipCode}` : 'Address not yet updated in system'}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: VEHICLE IDENTITY (Sapphire Glass Style) */}
            <div className="hybrid-card" style={{ width: '100%', height: 'auto', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
              <div className="carbon-section" style={{ height: '80px', borderBottomColor: '#818cf8', boxShadow: '0 4px 15px rgba(129, 140, 248, 0.2)' }}>
                <div className="hybrid-brand">
                  <Car size={24} color="#818cf8" />
                  <span style={{ textShadow: '0 0 10px rgba(129, 140, 248, 0.3)' }}>VEHICLE IDENTITY</span>
                </div>
                <div className="hybrid-chip" style={{ background: 'linear-gradient(135deg, #818cf8 0%, #3730a3 100%)' }}></div>
              </div>

              <div className="glass-section" style={{ background: 'rgba(129, 140, 248, 0.05)', flexDirection: 'column', alignItems: 'flex-start', gap: '24px' }}>
                <div className="hybrid-info">
                  <div className="hybrid-info-group">
                    <span className="hybrid-label" style={{ color: '#818cf8' }}>REGISTRATION PLATE</span>
                    <span className="hybrid-helpline" style={{ color: '#fff', fontSize: '2.2rem', textShadow: '0 0 15px rgba(129, 140, 248, 0.5)' }}>
                      {user.plateNumber || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="form-grid form-grid-3" style={{ width: '100%', gap: '20px' }}>
                  <div className="hybrid-info-group">
                    <span className="hybrid-label" style={{ color: '#818cf8' }}>MAKE</span>
                    <span className="hybrid-value" style={{ fontSize: '1rem' }}>{user.make || 'N/A'}</span>
                  </div>
                  <div className="hybrid-info-group">
                    <span className="hybrid-label" style={{ color: '#818cf8' }}>MODEL</span>
                    <span className="hybrid-value" style={{ fontSize: '1rem' }}>{user.model || 'N/A'}</span>
                  </div>
                  <div className="hybrid-info-group">
                    <span className="hybrid-label" style={{ color: '#818cf8' }}>YEAR</span>
                    <span className="hybrid-value" style={{ fontSize: '1rem' }}>{user.year || 'N/A'}</span>
                  </div>
                </div>

                <div className="hybrid-info-group">
                  <span className="hybrid-label" style={{ color: '#818cf8' }}>VEHICLE COLOR</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: user.color || '#ccc', border: '1px solid rgba(255,255,255,0.2)' }}></div>
                    <span className="hybrid-value" style={{ fontSize: '1rem' }}>{user.color || 'STREAK'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="form-grid form-grid-3" style={{ marginTop: '30px', gap: '20px' }}>
            
            {/* STAT CARD 1: REWARDS */}
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Award size={24} />
              </div>
              <p className="hybrid-label">PARKÉÉ POINTS</p>
              <h3 className="text-gradient" style={{ fontSize: '2rem', margin: '8px 0' }}>{user.parkeePoints || 0}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Redeem for premium perks</p>
            </div>

            {/* STAT CARD 2: DOCS STATUS */}
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FileText size={24} />
              </div>
              <p className="hybrid-label" style={{ color: '#8b5cf6' }}>DIGITAL DOCUMENTS</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '12px' }}>
                <div title="RC Status" style={{ color: user.rcNumber ? '#22c55e' : '#f43f5e' }}><Zap size={16} /></div>
                <div title="License Status" style={{ color: user.licenseNumber ? '#22c55e' : '#f43f5e' }}><ShieldCheck size={16} /></div>
                <div title="Insurance Status" style={{ color: user.insuranceProvider ? '#22c55e' : '#f43f5e' }}><Calendar size={16} /></div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '8px' }}>Security Audit: {user.rcNumber ? 'VERIFIED' : 'PENDING'}</p>
            </div>

            {/* STAT CARD 3: SECURITY SENTINEL */}
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(244, 63, 94, 0.1)' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <ShieldCheck size={24} />
              </div>
              <p className="hybrid-label" style={{ color: '#f43f5e' }}>SENTINEL MODE</p>
              <h3 style={{ fontSize: '1.2rem', color: '#f43f5e', margin: '8px 0', fontWeight: 'bold' }}>ACTIVE 🛡️</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>24/7 AI-Protection Enabled</p>
            </div>

          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              *Member since: {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
