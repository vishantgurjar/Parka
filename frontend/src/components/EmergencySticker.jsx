import React from 'react';

const EmergencySticker = React.forwardRef(({ user, qrUrl }, ref) => {
  if (!user) return null;

  const subscriptionTier = user.subscriptionTier?.toLowerCase() || 'standard';
  const isDiamond = subscriptionTier === 'diamond' || subscriptionTier === 'pro';
  const isGold = subscriptionTier === 'gold';
  const vipClass = isDiamond ? 'minimal-card-vip-diamond' : (isGold ? 'minimal-card-vip-gold' : '');

  return (
    <div 
      className="emergency-sticker-container" 
      ref={ref} 
      style={{ padding: '0', display: 'flex', justifyContent: 'center', width: '100%' }}
    >
      <div 
        className={`emergency-sticker-card ${vipClass}`} 
        style={{ 
          width: '360px', 
          height: '560px', 
          display: 'flex', 
          flexDirection: 'column', 
          background: '#090d16',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          borderRadius: '24px',
          overflow: 'hidden'
        }}
      >
        {/* Top Header Section */}
        <div 
          style={{ 
            height: '85px', 
            background: 'linear-gradient(to bottom, #0f172a, #0b1329)',
            borderBottom: '2px solid #38bdf8',
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 24px',
            position: 'relative',
            zIndex: 2
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src="/logo.png" 
              alt="Parxéé City Logo" 
              style={{ width: '38px', height: '38px', objectFit: 'contain' }}
            />
            <span style={{ fontWeight: '900', fontSize: '1.45rem', color: '#fff', letterSpacing: '2px' }}>
              PARXÉÉ CITY
            </span>
          </div>
          <div className="hybrid-chip" style={{ width: '50px', height: '36px', borderRadius: '6px' }}></div>
        </div>

        {/* Card Body Section */}
        <div 
          style={{ 
            flex: 1, 
            background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.8) 0%, #090d16 100%)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* QR Container Section (Middle) */}
          <div 
            style={{ 
              background: '#0b1329',
              border: '2px solid #38bdf8',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
              borderRadius: '20px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              maxWidth: '230px',
              margin: '0 auto'
            }}
          >
            <div 
              style={{ 
                background: '#fff', 
                padding: '8px', 
                borderRadius: '12px', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
              }}
            >
              {qrUrl ? (
                <img 
                  src={qrUrl} 
                  alt="QR Code" 
                  style={{ width: '160px', height: '160px', display: 'block' }}
                />
              ) : (
                <div style={{ width: '160px', height: '160px', background: '#ccc' }}></div>
              )}
            </div>
            <span 
              style={{ 
                fontSize: '0.8rem', 
                fontWeight: '900', 
                color: '#38bdf8', 
                letterSpacing: '2px', 
                textTransform: 'uppercase' 
              }}
            >
              SCAN FOR HELP
            </span>
          </div>

          {/* Details Section (Bottom) */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            {/* Helpline info */}
            <div style={{ textAlign: 'center' }}>
              <span 
                style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: '800', 
                  color: '#94a3b8', 
                  letterSpacing: '1.5px', 
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px'
                }}
              >
                EMERGENCY HELPLINE
              </span>
              <span 
                style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: '900', 
                  color: '#818cf8', 
                  letterSpacing: '1px',
                  display: 'block',
                  textShadow: '0 0 10px rgba(129, 140, 248, 0.3)'
                }}
              >
                +91 91122 00000
              </span>
            </div>

            {/* Grid for Plate & Access */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, textAlign: 'left' }}>
                <span 
                  style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: '800', 
                    color: '#94a3b8', 
                    letterSpacing: '1px', 
                    textTransform: 'uppercase' 
                  }}
                >
                  VEHICLE PLATE
                </span>
                <span 
                  style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '900', 
                    color: '#fff', 
                    textTransform: 'uppercase' 
                  }}
                >
                  {user.plateNumber || 'PENDING'}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, textAlign: 'right' }}>
                <span 
                  style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: '800', 
                    color: '#94a3b8', 
                    letterSpacing: '1px', 
                    textTransform: 'uppercase' 
                  }}
                >
                  ACCESS
                </span>
                <span 
                  style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '900', 
                    color: '#fff', 
                    textTransform: 'uppercase' 
                  }}
                >
                  24/7 GLOBAL
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

EmergencySticker.displayName = 'EmergencySticker';

export default EmergencySticker;
