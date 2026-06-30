import React, { useEffect } from 'react';
import { ShieldCheck, Cpu, Zap, Users, QrCode, Compass, Heart, Award } from 'lucide-react';
import SEO from '../components/SEO';

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page" style={{ background: '#030712', minHeight: '100vh', color: '#fff', paddingTop: '100px', paddingBottom: '60px' }}>
      <SEO 
        title="About Us - Parxéé City"
        description="Pioneering the next generation of smart vehicle security and highway emergency response. Learn about Parxéé City's mission, values, and technology."
      />

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Hero Section */}
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '50px', background: 'rgba(94, 234, 212, 0.1)', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>
            <Compass size={16} />
            Our Journey
          </div>
          <h1 style={{ fontSize: window.innerWidth < 768 ? '2.5rem' : '3.5rem', fontWeight: '900', letterSpacing: '-1.5px', margin: '0 0 15px 0', lineHeight: '1.2' }}>
            Pioneering the Next Era of <br />
            <span className="text-gradient">Vehicle Security</span> & Response
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Smart QR technology, secure call masking, and active highway safety networks combined to create a safer, smarter world for drivers.
          </p>
        </header>

        {/* Vision & Mission Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
          <div className="glass" style={{ padding: '3rem 2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(94, 234, 212, 0.1)', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>
              <Heart size={26} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Our Mission</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7' }}>
              Our mission is to safeguard every vehicle owner and highway traveler. We build cutting-edge, decentralized vehicle identification systems that protect user privacy while enabling instantaneous communication and emergency dispatch when minutes count.
            </p>
          </div>

          <div className="glass" style={{ padding: '3rem 2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'center', color: '#3b82f6', marginBottom: '1.5rem' }}>
              <ShieldCheck size={26} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Our Vision</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: '1.7' }}>
              We envision a future where parking, highway emergencies, and vehicle notifications are fully integrated, contactless, and privacy-first. By deploying smart QR kits on every vehicle across the country, we are standardizing driver assistance and safety protocols nationwide.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <section style={{ marginBottom: '5rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '900', marginBottom: '3rem' }}>
            The Pillars of <span className="text-gradient">Parxéé City</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr 1fr', gap: '1.5rem' }}>
            {/* Pillar 1 */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s ease', cursor: 'default' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ color: 'var(--primary)', marginBottom: '1.2rem' }}>
                <QrCode size={36} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.8rem' }}>Smart QR Ecosystem</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Contactless vehicle notifications. Scan decals to alert owners about parking blockages, double parking, or open windows instantly, keeping phone numbers fully private.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s ease', cursor: 'default' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ color: '#f43f5e', marginBottom: '1.2rem' }}>
                <Zap size={36} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.8rem' }}>On-Highway Mechanics</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                A 24/7 hyper-local mechanical response grid. When vehicle failures occur on remote roads, our intelligent dispatch router matches you to the closest verified mechanic in seconds.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s ease', cursor: 'default' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ color: '#38bdf8', marginBottom: '1.2rem' }}>
                <Cpu size={36} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.8rem' }}>Sentinel Cam Guard</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Transform smart devices into smart dashcams. Built-in G-Force impact analysis and cloud synchronization ensure video proof is secured and broadcasted automatically during crash incidents.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline / Milestones */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: '900', marginBottom: '3rem' }}>
            Our Growth & <span className="text-gradient">Future Path</span>
          </h2>

          <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', paddingLeft: '2rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
            
            {/* Item 1 */}
            <div style={{ position: 'relative', marginBottom: '3rem' }}>
              <div style={{ position: 'absolute', left: '-2.6rem', top: '0.2rem', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary)', border: '4px solid #030712', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Q1 2025 • The Genesis</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '5px 0' }}>Concept & Core Protocols</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Parxéé City was conceptualized in New Delhi to resolve vehicle blockages and caller data safety. Developed caller-masking bridges and launched smart QR kits locally.
              </p>
            </div>

            {/* Item 2 */}
            <div style={{ position: 'relative', marginBottom: '3rem' }}>
              <div style={{ position: 'absolute', left: '-2.6rem', top: '0.2rem', width: '18px', height: '18px', borderRadius: '50%', background: '#3b82f6', border: '4px solid #030712' }}></div>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>Q3 2025 • Scaling Security</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '5px 0' }}>Sentinel Mode & Mechanics Registry</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Introduced Sentinel Cam Mode for mobile crash logging and integrated the hyper-local registry system containing verified mechanics on regional highways.
              </p>
            </div>

            {/* Item 3 */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-2.6rem', top: '0.2rem', width: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)', border: '4px solid #030712' }}></div>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '1px' }}>2026 & Beyond • Nationwide Protection</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '5px 0' }}>EV Hubs & Smart Communities</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Deploying interactive charging finders (EV Hub), hosting systems for space providers, and aiming to secure 1 Million vehicles nationwide with robust QR guards.
              </p>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
