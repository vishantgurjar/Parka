import { useState, useEffect, useRef } from 'react';
import { Mic, Activity, AlertCircle, CheckCircle, RefreshCcw, Volume2, Send, Banknote } from 'lucide-react';
import SEO from '../components/SEO';

export default function AIAssistant() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [diagnosis, setDiagnosis] = useState(null);
  const [symptom, setSymptom] = useState('');
  const [error, setError] = useState(null);
  const [audioSignature, setAudioSignature] = useState(null);
  const freqHistoryRef = useRef([]);
  
  // Audio Visualizer Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [visualizerData, setVisualizerData] = useState(new Array(15).fill(20));

  const startAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus('recording');
      setProgress(0);
      setDiagnosis(null);
      setError(null);

      // Setup Audio Visualizer
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024; // High resolution for engine sound nuances
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      const spectralSnapshots = [];
      const updateVisualizer = () => {
        analyser.getByteFrequencyData(dataArrayRef.current);
        
        // Take a snapshot every ~500ms
        if (Math.random() > 0.9) {
           spectralSnapshots.push(Array.from(dataArrayRef.current.slice(0, 100))); // First 100 bins capture meat of the sound
        }

        // Normalize for our 15 bars
        const scaled = Array.from(dataArrayRef.current.slice(0, 15)).map(v => Math.max(20, v / 2));
        setVisualizerData(scaled);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      // Simulate 5 seconds of real listening
      let recTimer = 0;
      const recInterval = setInterval(() => {
        recTimer += 4;
        setProgress(recTimer);
        if (recTimer >= 100) {
          clearInterval(recInterval);
          
          // Calculate the final fingerprint
          const finalSnapshot = dataArrayRef.current;
          let peaks = [];
          for(let i=1; i<finalSnapshot.length-1; i++) {
             if(finalSnapshot[i] > finalSnapshot[i-1] && finalSnapshot[i] > finalSnapshot[i+1]) {
                peaks.push({ bin: i, val: finalSnapshot[i] });
             }
          }
          const topPeaks = peaks.sort((a,b) => b.val - a.val).slice(0, 5);
          
          let signature = 'mid'; 
          const avgPeakBin = topPeaks.reduce((acc, p) => acc + p.bin, 0) / (topPeaks.length || 1);
          if (avgPeakBin > 40) signature = 'high';
          else if (avgPeakBin < 10) signature = 'low';

          stopRecording(stream);
          setStatus('analyzing');
          analyzeData(signature, topPeaks);
        }
      }, 200);

    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required for AI Sound Analysis. Please enable it in your browser settings.");
    }
  };

  const stopRecording = (stream) => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const analyzeData = async (signature, peaks) => {
    setProgress(0);
    const progressTimer = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 95));
    }, 150);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://parkee-city-backend.vercel.app'}/api/ai/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            symptom: symptom, 
            audioSignature: signature,
            spectralPeaks: peaks 
        })
      });

      const data = await res.json();
      clearInterval(progressTimer);
      setProgress(100);

      if (res.ok) {
        setDiagnosis(data);
        setStatus('complete');
      } else {
        setError(data.message || "Failed to analyze sound.");
        setStatus('idle');
      }
    } catch (err) {
      clearInterval(progressTimer);
      console.error("Analysis error:", err);
      setError("Network error. Please ensure the backend is running and Gemini API key is valid.");
      setStatus('idle');
    }
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '4rem' }}>
      <SEO 
        title="AI Engine Sound Analyzer - Parkéé City"
        description="Diagnose your car's abnormal engine sounds using our AI-powered acoustic analyzer."
      />
      
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              <Volume2 size={16} /> Parkéé AI Labs (Beta)
          </div>
          <h1 className="ai-assistant-title" style={{ color: 'var(--fg)', marginBottom: '1rem' }}>AI Engine <span style={{color:'#38bdf8'}}>Sound Analyzer</span></h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Hearing a weird noise? Describe it or hold your phone near the engine, and let our AI Acoustic Engine diagnose the problem.
          </p>
        </div>

        <div className="glass-card fadeIn" style={{ padding: '3rem 2rem', textAlign: 'center', minHeight: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)', width: '100%', maxWidth: '450px' }}>
              <AlertCircle size={20} style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontWeight: '500' }}>{error}</p>
            </div>
          )}

          {status === 'idle' && (
            <div className="fadeIn" style={{ width: '100%', maxWidth: '450px' }}>
              <div style={{ marginBottom: '2.5rem' }}>
                <textarea 
                  placeholder="Optional: Describe the sound (e.g., 'Ticking from the left side', 'Squealing when braking')"
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)', color: 'var(--fg)', fontSize: '1rem', resize: 'none', marginBottom: '1.5rem'
                  }}
                  rows="3"
                />
                <button 
                    onClick={startAnalysis}
                    className="pulse-anim"
                    style={{
                    width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 15px 35px rgba(56, 189, 248, 0.4)', color: 'white', margin: '0 auto 1.5rem'
                    }}
                >
                    <Mic size={40} />
                </button>
                <h2>{symptom ? 'Analyze Diagnostic' : 'Tap to Listen'}</h2>
                <p style={{ color: 'var(--muted)' }}>Requires microphone permission</p>
              </div>
            </div>
          )}

          {status === 'recording' && (
            <div style={{ animation: 'fadeIn 0.5s ease-in', width: '100%', maxWidth: '400px', position: 'relative' }}>
              <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', height: '100px' }}>
                {visualizerData.map((height, i) => (
                  <div key={i} className="sonic-bar" style={{
                    height: `${Math.max(15, height * 0.8)}px`, 
                    animationDelay: `${i * 0.05}s`
                  }} />
                ))}
              </div>
              <h2 style={{ color: '#38bdf8', letterSpacing: '1px' }}>Listening to Engine...</h2>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginTop: '2rem', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', transition: 'width 0.2s linear' }} />
              </div>
            </div>
          )}


          {status === 'analyzing' && (
            <div className="fadeIn" style={{ width: '100%', maxWidth: '400px', position: 'relative', overflow: 'hidden', borderRadius: '20px', padding: '2rem' }}>
              <div className="scanline"></div>
              <Activity size={80} color="#38bdf8" className="pulse-anim" style={{ marginBottom: '1.5rem' }} />
              <h2 style={{ color: '#38bdf8' }}>AI Deep Scan Scanning...</h2>
              <p style={{ color: 'var(--muted)' }}>Analyzing acoustic patterns and technical signatures...</p>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginTop: '2rem', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', transition: 'width 0.3s linear' }} />
              </div>
            </div>
          )}


          {status === 'complete' && diagnosis && (
            <div className="fadeIn" style={{ width: '100%', maxWidth: '500px', textAlign: 'left' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                {diagnosis.dangerLevel === 'CRITICAL' ? <AlertCircle size={40} color="#ef4444" /> : 
                 diagnosis.dangerLevel === 'MEDIUM' ? <AlertCircle size={40} color="#eab308" /> : 
                 <CheckCircle size={40} color="#10b981" />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h2 style={{ margin: 0 }}>{diagnosis.issue}</h2>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      v{diagnosis.version || "2.1-Legacy"}
                    </span>
                  </div>
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
                <p style={{ margin: '0 0 1rem 0', lineHeight: 1.6 }}>{diagnosis.details}</p>
                
                {/* Confidence Meter */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      <span style={{ color: 'var(--muted)' }}>AI Confidence Score</span>
                      <span style={{ color: diagnosis.confidence > 85 ? '#10b981' : '#eab308' }}>{diagnosis.confidence || 85}%</span>
                   </div>
                   <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${diagnosis.confidence || 85}%`, 
                        height: '100%', 
                        background: diagnosis.confidence > 85 ? '#10b981' : '#eab308',
                        transition: 'width 1s ease-out' 
                      }} />
                   </div>
                </div>
              </div>

              {diagnosis.estimatedCost && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', padding: '1rem', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '4px' }}>
                    <Banknote size={18} />
                    <strong style={{fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Estimated Repair Cost</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{diagnosis.estimatedCost}</p>
                </div>
              )}

              <div style={{ background: 'rgba(56, 189, 248, 0.1)', borderLeft: '4px solid #38bdf8', padding: '1rem', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
                <strong style={{color: '#38bdf8'}}>Recommended Action:</strong> {diagnosis.action}
              </div>

              {diagnosis.otherPossibilities && diagnosis.otherPossibilities.length > 0 && (
                <div style={{ marginTop: '0.5rem', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                   <h5 style={{ margin: '0 0 10px 0', color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Other Possible Causes Detected</h5>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {diagnosis.otherPossibilities.map((p, idx) => (
                        <span key={idx} style={{ 
                            fontSize: '0.8rem', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', 
                            padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(56,189,248,0.2)' 
                        }}>
                          {p}
                        </span>
                      ))}
                   </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setStatus('idle')} className="btn-secondary" style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--fg)', borderRadius: '8px', cursor: 'pointer' }}>
                  <RefreshCcw size={18} /> Analyze Again
                </button>
                <button onClick={() => window.location.href='/mechanics'} className="btn-gradient" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Find Mechanic Nearby
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

