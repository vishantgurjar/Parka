import React from 'react';
import { ShieldCheck, User, Car, Clock } from 'lucide-react';

const CustomerCard = React.forwardRef(({ user, qrUrl }, ref) => {
  if (!user) return null;

  const isDiamond = user.subscriptionTier === 'diamond';
  const isGold = user.subscriptionTier === 'gold';
  const vipClass = isDiamond ? 'minimal-card-vip-diamond' : (isGold ? 'minimal-card-vip-gold' : '');

  return (
    <div className="customer-card-container" ref={ref} style={{ padding: '0' }}>
      <div className={`minimal-card ${vipClass}`} style={{ width: '480px', height: '240px', padding: '0', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header Bar */}
        <div style={{ padding: '12px 24px', background: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <img src="/logo.png" alt="Logo" style={{ width: '18px', height: '18px' }} />
             <span style={{ color: '#fff', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '1px' }}>PARKÉE CITY</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2dd4bf', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px' }}>
             <ShieldCheck size={10} /> VERIFIED CUSTOMER
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Info Section */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '16px' }}>
               <span className="minimal-label">Vehicle Owner</span>
               <span className="minimal-value" style={{ textTransform: 'uppercase' }}>{user.name}</span>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
               <span className="minimal-label">Registration Plate</span>
               <span className="minimal-value" style={{ fontSize: '1.2rem', color: '#111827', textTransform: 'uppercase', letterSpacing: '1px' }}>{user.plateNumber || 'HR-51-AA-0001'}</span>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
               <div>
                  <span className="minimal-label">Membership</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: isDiamond ? '#8b5cf6' : (isGold ? '#ca8a04' : '#6b7280') }}>
                    {user.subscriptionTier?.toUpperCase() || 'STANDARD'}
                  </span>
               </div>
               <div>
                  <span className="minimal-label">Validity</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>Lifetime Access</span>
               </div>
            </div>
          </div>

          {/* QR Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
             <div className="minimal-qr-frame">
               {qrUrl ? (
                 <img src={qrUrl} alt="QR" style={{ width: '90px', height: '90px', display: 'block' }} />
               ) : (
                 <div style={{ width: '90px', height: '90px', background: '#f3f4f6' }}></div>
               )}
             </div>
             <span className="minimal-label" style={{ fontSize: '0.5rem' }}>SCAN TO CONTACT</span>
          </div>

        </div>

        {/* Subtle Footer Divider */}
        <div style={{ height: '4px', background: isDiamond ? 'linear-gradient(90deg, #8b5cf6, #3b82f6)' : (isGold ? 'linear-gradient(90deg, #eab308, #ca8a04)' : '#f3f4f6') }}></div>
      </div>
    </div>
  );
});

CustomerCard.displayName = 'CustomerCard';

export default CustomerCard;
