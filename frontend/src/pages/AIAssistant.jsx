import { useState, useEffect } from 'react';
import { Mic, Activity, AlertCircle, CheckCircle, RefreshCcw, Volume2 } from 'lucide-react';
import SEO from '../components/SEO';

export default function AIAssistant() {
  // State machine: idle, recording, analyzing, complete
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [diagnosis, setDiagnosis] = useState(null);

  const startAnalysis = () => {
    setStatus('recording');
    setProgress(0);
    setDiagnosis(null);

    // Simulate 4 seconds of recording
    let recTimer = 0;
    const recInterval = setInterval(() => {
      recTimer += 5;
      setProgress(recTimer);
      if (recTimer >= 100) {
        clearInterval(recInterval);
        setStatus('analyzing');
        analyzeAudio();
      }
    }, 200); // 100 / 5 = 20 ticks. 20 * 200ms = 4000ms
  };

  const analyzeAudio = () => {
    setProgress(0);
    // Simulate 3 seconds of AI analysis
    let anaTimer = 0;
    const anaInterval = setInterval(() => {
      anaTimer += 10;
      setProgress(anaTimer);
      if (anaTimer >= 100) {
        clearInterval(anaInterval);
        
        // Pick a random mock diagnosis for realism
        const mockOutcomes = [
          {
            issue: "Loose Alternator Belt",
            dangerLevel: "LOW",
            details: "A high-pitched squeal was detected consistent with a loose or worn serpentine/alternator belt. It is safe to drive, but you should have it tightened or replaced soon.",
            action: "Drive to nearest mechanic"
          },
          {
            issue: "Worn Brake Pads",
            dangerLevel: "MEDIUM",
            details: "The grinding acoustic signature matches metal-on-metal contact indicative of completely worn brake pads. Braking distance will be significantly impaired.",
            action: "Drive slowly to nearest mechanic"
          },
          {
            issue: "Engine Knocking (Rod Knock)",
            dangerLevel: "CRITICAL",
            details: "Deep metallic thudding detected from the engine block. This indicates severe internal bearing failure. Driving further may destroy the engine completely.",
            action: "PULL OVER IMMEDIATELY AND CALL A TOW TRUCK"
          }
        ];
        
        setDiagnosis(mockOutcomes[Math.floor(Math.random() * mockOutcomes.length)]);
        setStatus('complete');
      }
    }, 300);
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '4rem' }}>
      <SEO 
        title="AI Engine Sound Analyzer - Parkéé City"
        description="Diagnose your car's abnormal engine sounds using out AI-powered accoustic analyzer."
      />
      
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              <Volume2 size={16} /> Parkéé AI Labs (Beta)
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--fg)' }}>AI Engine <span style={{color:'#38bdf8'}}>Sound Analyzer</span></h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Hearing a weird noise? Hold your phone near the dashboard or hood, and let our AI Accoustic Engine diagnose the problem in seconds.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          {status === 'idle' && (
            <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
              <button 
                onClick={startAnalysis}
                className="pulse-anim"
                style={{
                  width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 15px 35px rgba(56, 189, 248, 0.4)', color: 'white', marginBottom: '2rem'
                }}
              >
                <Mic size={50} />
              </button>
              <h2>Tap to Analyze</h2>
              <p style={{ color: 'var(--muted)' }}>Requires microphone permission</p>
            </div>
          )}

          {status === 'recording' && (
            <div style={{ animation: 'fadeIn 0.5s ease-in', width: '100%', maxWidth: '400px' }}>
              <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {/* Simulated Audio Visualizer Bars */}
                {[...Array(10)].map((_, i) => (
                  <div key={i} style={{
                    width: '8px', height: `${Math.random() * 60 + 20}px`, 
                    background: '#ef4444', borderRadius: '4px',
                    animation: `pulse-anim ${Math.random() * 0.5 + 0.3}s infinite alternate`
                  }} />
                ))}
              </div>
              <h2 style={{ color: '#ef4444' }}>Listening to Engine...</h2>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '2rem', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#ef4444', transition: 'width 0.2s linear' }} />
              </div>
            </div>
          )}

          {status === 'analyzing' && (
            <div style={{ animation: 'fadeIn 0.5s ease-in', width: '100%', maxWidth: '400px' }}>
              <Activity size={80} color="#38bdf8" className="pulse-anim" style={{ marginBottom: '1.5rem' }} />
              <h2 style={{ color: '#38bdf8' }}>Running AI Accoustic Models...</h2>
              <p style={{ color: 'var(--muted)' }}>Comparing against 10,000+ known engine failure audio signatures.</p>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '2rem', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#38bdf8', transition: 'width 0.3s linear' }} />
              </div>
            </div>
          )}

          {status === 'complete' && diagnosis && (
            <div style={{ animation: 'fadeIn 0.5s ease-in', width: '100%', maxWidth: '500px', textAlign: 'left' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                {diagnosis.dangerLevel === 'CRITICAL' ? <AlertCircle size={40} color="#ef4444" /> : 
                 diagnosis.dangerLevel === 'MEDIUM' ? <AlertCircle size={40} color="#eab308" /> : 
                 <CheckCircle size={40} color="#10b981" />}
                <div>
                  <h2 style={{ margin: 0 }}>{diagnosis.issue}</h2>
                  <span style={{ 
                    fontSize: '0.8rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px',
                    background: diagnosis.dangerLevel === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : diagnosis.dangerLevel === 'MEDIUM' ? 'rgba(234,179,8,0.2)' : 'rgba(16,185,129,0.2)',
                    color: diagnosis.dangerLevel === 'CRITICAL' ? '#ef4444' : diagnosis.dangerLevel === 'MEDIUM' ? '#eab308' : '#10b981'
                  }}>
                    {diagnosis.dangerLevel} DANGER
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.85rem' }}>AI Diagnostic Details</h4>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{diagnosis.details}</p>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.1)', borderLeft: '4px solid #38bdf8', padding: '1rem', borderRadius: '0 8px 8px 0', marginBottom: '2rem' }}>
                <strong>Recommended Action:</strong> {diagnosis.action}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setStatus('idle')} className="btn-secondary" style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <RefreshCcw size={18} /> Analyze Again
                </button>
                <button onClick={() => window.location.href='/mechanics'} className="btn-gradient" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', border: 'none', color: 'white' }}>
                  Find Mechanic
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
