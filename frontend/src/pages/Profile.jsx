import { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { User, Mail, Phone, Car, ShieldCheck, MapPin, Award, FileText, Calendar, Zap, X, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function Profile() {
  const { user, login } = useContext(AuthContext);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State for Documents
  const [docData, setDocData] = useState({
    rcNumber: user?.rcNumber || '',
    rcExpiryDate: user?.rcExpiryDate || '',
    licenseNumber: user?.licenseNumber || '',
    licenseExpiryDate: user?.licenseExpiryDate || '',
    insuranceProvider: user?.insuranceProvider || '',
    insurancePolicyNumber: user?.insurancePolicyNumber || '',
    insuranceExpiryDate: user?.insuranceExpiryDate || ''
  });

  if (!user) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2 className="section-title">Please login to view your profile.</h2>
      </div>
    );
  }

  const handleDocChange = (e) => {
    setDocData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateDocuments = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/user/update-documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, ...docData })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, localStorage.getItem('parkeToken'));
        setIsDocsModalOpen(false);
        alert('Documents updated successfully! Verification status will be updated shortly.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating documents.');
    } finally {
      setIsLoading(false);
    }
  };

  const redeemPerk = async (perk) => {
    if ((user.parkeePoints || 0) < perk.cost) {
      alert('Insufficient points!');
      return;
    }

    if (!confirm(`Confirm redemption of ${perk.name} for ${perk.cost} points?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/user/redeem-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, pointsToDeduct: perk.cost, perkName: perk.name })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, localStorage.getItem('parkeToken'));
        alert(`Successfully redeemed ${perk.name}! Check your email for details.`);
      }
    } catch (err) {
      console.error(err);
      alert('Redemption failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const perks = [
    { id: 1, name: 'Free Highway Towing', description: 'One-time free towing service up to 20km.', cost: 500, icon: <Car size={20} /> },
    { id: 2, name: 'Gold Membership (1 Mo)', description: 'Upgrade to Gold for 30 days for free.', cost: 1000, icon: <Award size={20} /> },
    { id: 3, name: 'Priority SOS Response', description: 'Get top priority for your next 3 SOS requests.', cost: 300, icon: <Zap size={20} /> },
    { id: 4, name: 'Premium Dashboard Theme', description: 'Unlock exclusive profile animations and colors.', cost: 200, icon: <Zap size={20} /> }
  ];

  const tierColor = user.subscriptionTier === 'diamond' ? '#818cf8' : (user.subscriptionTier === 'gold' ? '#eab308' : '#38bdf8');
  const isVerified = user.rcNumber && user.licenseNumber && user.insuranceProvider;

  return (
    <>
      <SEO title={`${user.name} - Profile | Parkéé City`} />
      
      <div className="profile-page" style={{ padding: '100px 0 60px', background: 'var(--bg)', minHeight: '90vh' }}>
        <div className="container">
          
          <div className="section-header" style={{ marginBottom: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="emergency-badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', marginBottom: '1.5rem' }}>
              <User size={14} /> ACCOUNT OVERVIEW
            </div>
            <h2 className="section-title">Your Premium <span className="text-gradient">Profile</span></h2>
          </div>

          <div className="form-grid form-grid-2" style={{ gap: '30px', alignItems: 'start' }}>
            
            {/* CARD 1: PERSONAL IDENTITY (Carbon Fiber Style) */}
            <div className="hybrid-card" style={{ width: '100%', height: 'auto', minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
              <div className="carbon-section" style={{ height: '80px' }}>
                <div className="hybrid-brand">
                  <div className="logo-icon" style={{ background: tierColor, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#fff' }}>
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
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.1)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Award size={24} />
              </div>
              <p className="hybrid-label">PARKÉÉ POINTS</p>
              <h3 className="text-gradient" style={{ fontSize: '2rem', margin: '8px 0' }}>{user.parkeePoints || 0}</h3>
              <button 
                onClick={() => setIsRedeemModalOpen(true)}
                className="btn-gradient" 
                style={{ padding: '8px 20px', borderRadius: '50px', fontSize: '0.8rem', marginTop: '10px', width: '100%', border: 'none' }}
              >
                Redeem Store
              </button>
            </div>

            {/* STAT CARD 2: DOCS STATUS */}
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: `1px solid ${isVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)'}` }}>
              <div style={{ width: '48px', height: '48px', background: isVerified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)', color: isVerified ? '#22c55e' : '#eab308', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <FileText size={24} />
              </div>
              <p className="hybrid-label" style={{ color: isVerified ? '#22c55e' : '#eab308' }}>DIGITAL DOCUMENTS</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '12px' }}>
                <div title="RC Status" style={{ color: user.rcNumber ? '#22c55e' : '#f43f5e' }}><Zap size={16} /></div>
                <div title="License Status" style={{ color: user.licenseNumber ? '#22c55e' : '#f43f5e' }}><ShieldCheck size={16} /></div>
                <div title="Insurance Status" style={{ color: user.insuranceProvider ? '#22c55e' : '#f43f5e' }}><Calendar size={16} /></div>
              </div>
              <button 
                onClick={() => setIsDocsModalOpen(true)}
                className="btn-secondary" 
                style={{ padding: '8px 20px', borderRadius: '50px', fontSize: '0.8rem', marginTop: '15px', width: '100%' }}
              >
                Manage Docs
              </button>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '12px', fontWeight: 'bold' }}>
                Security Audit: {isVerified ? 'VERIFIED' : 'INCOMPLETE'}
              </p>
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

      {/* --- MODALS --- */}

      {/* REDEEM STORE MODAL */}
      {isRedeemModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '0', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                <div style={{ background: 'var(--gradient-primary)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingBag size={20} /> Redeem Rewards
                    </h3>
                    <button onClick={() => setIsRedeemModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                </div>
                <div style={{ padding: '20px' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Available Points:</span>
                        <h4 style={{ fontSize: '1.5rem', color: '#38bdf8', fontWeight: '900' }}>{user.parkeePoints || 0}</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
                        {perks.map(perk => (
                            <div key={perk.id} className="glass" style={{ padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ color: '#38bdf8' }}>{perk.icon}</div>
                                    <div>
                                        <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{perk.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{perk.description}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => redeemPerk(perk)}
                                    disabled={isLoading || (user.parkeePoints || 0) < perk.cost}
                                    style={{ padding: '6px 14px', borderRadius: '50px', border: 'none', background: (user.parkeePoints || 0) >= perk.cost ? '#38bdf8' : 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    {perk.cost} P
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MANAGE DOCUMENTS MODAL */}
      {isDocsModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ width: '95%', maxWidth: '600px', padding: '0', overflow: 'hidden', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
                <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(129, 140, 248, 0.3)' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} color="#818cf8" /> Manage Digital Vault
                    </h3>
                    <button onClick={() => setIsDocsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                </div>
                <form onSubmit={updateDocuments} style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '10px', background: 'rgba(129, 140, 248, 0.05)', borderRadius: '8px' }}>
                        <ShieldCheck size={18} color="#818cf8" />
                        <p style={{ fontSize: '0.8rem', color: '#818cf8' }}>Submit valid certificate numbers for official Parkéé Verification.</p>
                    </div>

                    <div className="form-grid form-grid-2" style={{ gap: '20px' }}>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>RC NUMBER</label>
                           <input type="text" name="rcNumber" value={docData.rcNumber} onChange={handleDocChange} placeholder="UPxx AA xxxx" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>RC EXPIRY</label>
                           <input type="date" name="rcExpiryDate" value={docData.rcExpiryDate} onChange={handleDocChange} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                    </div>

                    <div className="separator" style={{ margin: '20px 0' }}></div>

                    <div className="form-grid form-grid-2" style={{ gap: '20px' }}>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>LICENSE NUMBER</label>
                           <input type="text" name="licenseNumber" value={docData.licenseNumber} onChange={handleDocChange} placeholder="DLxxxxxxxxxxxx" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>LICENSE EXPIRY</label>
                           <input type="date" name="licenseExpiryDate" value={docData.licenseExpiryDate} onChange={handleDocChange} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                    </div>

                    <div className="separator" style={{ margin: '20px 0' }}></div>

                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>INSURANCE PROVIDER</label>
                        <input type="text" name="insuranceProvider" value={docData.insuranceProvider} onChange={handleDocChange} placeholder="e.g. HDFC Ergo, LIC, TATA AIG" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>

                    <div className="form-grid form-grid-2" style={{ gap: '20px' }}>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>POLICY NUMBER</label>
                           <input type="text" name="insurancePolicyNumber" value={docData.insurancePolicyNumber} onChange={handleDocChange} placeholder="POLxxxxxxxxx" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                       <div className="form-group">
                           <label className="form-label" style={{ fontSize: '0.75rem' }}>POLICY EXPIRY</label>
                           <input type="date" name="insuranceExpiryDate" value={docData.insuranceExpiryDate} onChange={handleDocChange} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }} />
                       </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn-gradient full-width" 
                        style={{ marginTop: '30px', padding: '16px', borderRadius: '12px', fontWeight: 'bold', border: 'none' }}
                    >
                        {isLoading ? 'Encrypting & Saving...' : 'Submit Documents for Verification'}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '15px' }}>
                        *Your data is encrypted using AES-256 for Parkéé Sentinel Security.
                    </p>
                </form>
            </div>
        </div>
      )}
    </>
  );
}
