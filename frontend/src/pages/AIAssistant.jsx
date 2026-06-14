import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Mic, Activity, AlertCircle, CheckCircle, RefreshCcw, Volume2, Send, Banknote, Wrench } from 'lucide-react';
import SEO from '../components/SEO';
import { getBackendUrl } from '../utils/api';

export default function AIAssistant() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'ev' ? 'ev' : 'ice';
  const [activeTab, setActiveTab] = useState(initialMode);

  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [diagnosis, setDiagnosis] = useState(null);
  const [symptom, setSymptom] = useState('');
  const [error, setError] = useState(null);
  const [visualizerData, setVisualizerData] = useState(new Array(15).fill(20));
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Google Chrome, Microsoft Edge, or Safari.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'hi-IN'; // Works for Hindi, Hinglish, and English
        
        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setSymptom(prev => prev ? `${prev} ${transcript}` : transcript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === 'not-allowed') {
            setError("Microphone permission denied. Please allow microphone access in your browser settings to voice type.");
          } else {
            setError(`Speech typing error: ${event.error}`);
          }
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  // Point 3: Voicebot (Hinglish TTS)
  const speakDiagnosis = (text) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Better for Hinglish accent
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

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

      // Background Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      let speechDetectedText = "";
      let recognizer = null;
      if (SpeechRecognition) {
        try {
          recognizer = new SpeechRecognition();
          recognizer.continuous = true;
          recognizer.interimResults = false;
          recognizer.lang = 'hi-IN'; // Works for Hindi/English/Hinglish
          recognizer.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                speechDetectedText += event.results[i][0].transcript + " ";
              }
            }
          };
          recognizer.start();
        } catch (recognitionErr) {
          console.error("Failed to start background speech recognition:", recognitionErr);
        }
      }

      const spectralSnapshots = [];
      const volumes = [];
      const updateVisualizer = () => {
        analyser.getByteFrequencyData(dataArrayRef.current);
        
        // Calculate average volume of current frame
        const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
        const avgVol = sum / dataArrayRef.current.length;
        volumes.push(avgVol);

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
          
          if (recognizer) {
            try {
              recognizer.stop();
            } catch (e) {
              console.error("Failed to stop background speech recognition:", e);
            }
          }
          
          // Calculate the final fingerprint
          const finalSnapshot = dataArrayRef.current;
          let peaks = [];
          for(let i=1; i<finalSnapshot.length-1; i++) {
             if(finalSnapshot[i] > finalSnapshot[i-1] && finalSnapshot[i] > finalSnapshot[i+1]) {
                peaks.push({ bin: i, val: finalSnapshot[i] });
             }
          }
          const topPeaks = peaks.sort((a,b) => b.val - a.val).slice(0, 5);
          
          stopRecording(stream);

          // 1. Check if speech was explicitly detected
          if (speechDetectedText.trim()) {
            setStatus('idle');
            setSymptom(speechDetectedText.trim());
            setError("Bhaiya, ye toh kisi ki baat karne ki awaz (human voice) lag rahi hai. Humne aapki baat ko text box me likh diya hai, ek baar check karke Analyze button dabayein! Agar gaadi ke engine ki awaz record karni hai, toh please bina bole engine ke paas jaakar record karein!");
            return;
          }

          // Calculate volume characteristics
          const meanVol = volumes.length > 0 ? volumes.reduce((a, b) => a + b, 0) / volumes.length : 0;
          const varianceVol = volumes.length > 0 ? volumes.reduce((a, b) => a + Math.pow(b - meanVol, 2), 0) / volumes.length : 0;
          const stdDevVol = Math.sqrt(varianceVol);
          const minVol = volumes.length > 0 ? Math.min(...volumes) : 0;

          // If sound recorded is too low and no other information is provided, abort.
          const avgPeakVal = topPeaks.length > 0 ? topPeaks.reduce((acc, p) => acc + p.val, 0) / topPeaks.length : 0;
          if (avgPeakVal < 70 && !symptom && !selectedImage) {
            setStatus('idle');
            setError("No significant engine sound detected. Please try recording again closer to a running engine, or click the mic button next to the text box to dictate your symptoms.");
            return;
          }

          // 2. Check for volume stability/fluctuations to detect human speech / erratic noise
          // An engine is a continuous hum/drone (low stdDev, high minVol ratio).
          // Speech or music is intermittent/highly variable (high stdDev, low minVol ratio).
          const isErratic = volumes.length > 0 && (stdDevVol > 8 || (meanVol > 20 && minVol / meanVol < 0.35));

          if (isErratic && !symptom && !selectedImage) {
            setStatus('idle');
            setError("Bhaiya, recorded sound gaadi ke engine ki awaz nahi lag rahi hai (voice ya background noise lag raha hai). Apni gaadi ke engine ke paas jaakar clear sound record karo ya fir text box me detail me apni dikkaat likho!");
            return;
          }
          
          let signature = 'mid'; 
          if (topPeaks.length > 0) {
             const avgPeakBin = topPeaks.reduce((acc, p) => acc + p.bin, 0) / topPeaks.length;
             if (avgPeakBin > 40) signature = 'high';
             else if (avgPeakBin < 10) signature = 'low';
          }

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
      const baseUrl = getBackendUrl();
      const res = await fetch(`${baseUrl}/api/ai/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            symptom: symptom, 
            audioSignature: signature,
            spectralPeaks: peaks,
            image: selectedImage
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

  const analyzeDirectly = () => {
    if (!symptom.trim() && !selectedImage) {
      setError("Please describe your symptoms or upload an image first.");
      return;
    }
    setStatus('analyzing');
    setProgress(0);
    analyzeData('mid', []);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 800px for AI diagnostic (Vite/Gemini doesn't need higher resolution)
          const MAX_DIM = 800;
          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress as JPEG with 0.6 quality (reduces size from 8MB to ~80KB!)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setSelectedImage(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--bg)', paddingBottom: '4rem' }}>
      <SEO 
        title="AI Engine Sound Analyzer - Parxéé City"
        description="Diagnose your car's abnormal engine sounds using our AI-powered acoustic analyzer."
      />
            <div className="container" style={{ maxWidth: '800px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 16px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              <Volume2 size={16} /> Parxéé AI Labs (Beta)
          </div>
          <h1 className="ai-assistant-title" style={{ color: 'var(--fg)', marginBottom: '1rem' }}>
            {activeTab === 'ev' ? "AI EV Cluster" : "AI Engine Sound"} <span style={{color:'#38bdf8'}}>Diagnostics</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            {activeTab === 'ev' 
              ? "Upload a photo of your EV instrument cluster, warning error code, or logs for instant AI diagnosis."
              : "Hearing a weird noise? Describe it or hold your phone near the engine, and let our AI Acoustic Engine diagnose the problem."}
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
              {/* Tab Switcher */}
              <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                <button 
                  onClick={() => { setActiveTab('ice'); setSelectedImage(null); setSymptom(''); }}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold', background: activeTab === 'ice' ? '#38bdf8' : 'transparent', color: activeTab === 'ice' ? '#000' : '#fff', border: 'none', cursor: 'pointer' }}
                >
                  🔊 ICE Acoustic Sound
                </button>
                <button 
                  onClick={() => { setActiveTab('ev'); setSelectedImage(null); setSymptom(''); }}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold', background: activeTab === 'ev' ? '#38bdf8' : 'transparent', color: activeTab === 'ev' ? '#000' : '#fff', border: 'none', cursor: 'pointer' }}
                >
                  🔌 EV Dashboard Cluster
                </button>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <textarea 
                    placeholder={activeTab === 'ev' ? "Describe warning light, error code, or behavior..." : "Optional: Describe the sound (e.g. 'Ticking from left side', 'Squealing when braking')"}
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    style={{
                      width: '100%', padding: '15px 50px 15px 15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)', color: 'var(--fg)', fontSize: '1rem', resize: 'none', marginBottom: '1.5rem'
                    }}
                    rows="3"
                  />
                  <button
                    onClick={toggleSpeechRecognition}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${isListening ? '#ef4444' : 'var(--border)'}`,
                      color: isListening ? '#ef4444' : 'var(--fg)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      zIndex: 10
                    }}
                    title={isListening ? "Stop listening" : "Speak symptom"}
                  >
                    <Mic size={18} className={isListening ? "pulse-anim" : ""} />
                  </button>
                </div>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '-1rem', marginBottom: '1.5rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>💡 Tip: Click the mic 🎙️ icon to speak/dictate your symptoms in Hindi or English.</span>
                </div>
                
                {activeTab === 'ice' ? (
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
                      <div style={{ flex: 1 }}>
                          <button 
                              onClick={startAnalysis}
                              className="pulse-anim"
                              style={{
                              width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 15px 35px rgba(56, 189, 248, 0.4)', color: 'white', margin: '0 auto 1rem'
                              }}
                          >
                              <Mic size={36} />
                          </button>
                          <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Record Sound</p>
                      </div>

                      <div style={{ flex: 1 }}>
                          <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              style={{ display: 'none' }} 
                              ref={fileInputRef}
                              onChange={handleImageSelect}
                          />
                          <button 
                              onClick={() => fileInputRef.current.click()}
                              className={selectedImage ? "" : "pulse-anim"}
                              style={{
                              width: '90px', height: '90px', borderRadius: '50%', background: selectedImage ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.05)',
                              border: `2px solid ${selectedImage ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: selectedImage ? '#38bdf8' : 'var(--muted)', margin: '0 auto 1rem', overflow: 'hidden'
                              }}
                          >
                              {selectedImage ? (
                                  <img src={selectedImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                  <Activity size={36} />
                              )}
                          </button>
                          <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{selectedImage ? "Image Ready" : "Capture Evidence"}</p>
                      </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                      <div style={{ width: '150px' }}>
                          <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              style={{ display: 'none' }} 
                              ref={fileInputRef}
                              onChange={handleImageSelect}
                          />
                          <button 
                              onClick={() => fileInputRef.current.click()}
                              className={selectedImage ? "" : "pulse-anim"}
                              style={{
                              width: '90px', height: '90px', borderRadius: '50%', background: selectedImage ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.05)',
                              border: `2px solid ${selectedImage ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: selectedImage ? '#38bdf8' : 'var(--muted)', margin: '0 auto 1rem', overflow: 'hidden'
                              }}
                          >
                              {selectedImage ? (
                                  <img src={selectedImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                  <Activity size={36} />
                              )}
                          </button>
                          <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{selectedImage ? "Cluster Photo Ready" : "Upload Log/Photo"}</p>
                      </div>
                  </div>
                )}

                <h2>Ready to Diagnose</h2>
                <p style={{ color: 'var(--muted)' }}>
                  {activeTab === 'ev' ? "Upload a console photo or describe the symptom to scan." : "Select an image or record sound for best results."}
                </p>
                
                {(selectedImage || symptom) && (
                   <button 
                      onClick={analyzeDirectly}
                      className="btn-gradient" 
                      style={{ 
                         width: '100%', padding: '15px', borderRadius: '12px', border: 'none', 
                         color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                         boxShadow: '0 10px 25px rgba(56, 189, 248, 0.3)', marginTop: '1.5rem',
                         background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)'
                      }}
                   >
                      Analyze {selectedImage ? (symptom ? "Photo & Symptoms" : "Uploaded Photo") : "Symptom Description"}
                   </button>
                )}
              </div>
            </div>
          )}

          {status === 'recording' && (
            <div style={{ animation: 'fadeIn 0.5s ease-in', width: '100%', maxWidth: '400px', position: 'relative' }}>
              <div style={{ position: 'relative', height: '100px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', overflow: 'hidden' }}>
                <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%', opacity: 0.8 }}>
                  <path 
                    d={`M 0 50 Q 50 ${50 - Math.min(48, (visualizerData[3] || 15) * 1.5)} 100 50 T 200 50`} 
                    fill="none" 
                    stroke="#38bdf8" 
                    strokeWidth="2.5" 
                    style={{ filter: 'drop-shadow(0 0 6px #38bdf8)', transition: 'd 0.1s ease-out' }} 
                  />
                  <path 
                    d={`M 0 50 Q 50 ${50 + Math.min(48, (visualizerData[6] || 10) * 1.2)} 100 50 T 200 50`} 
                    fill="none" 
                    stroke="#818cf8" 
                    strokeWidth="1.5" 
                    opacity="0.5"
                    style={{ filter: 'drop-shadow(0 0 4px #818cf8)', transition: 'd 0.1s ease-out' }} 
                  />
                  <path 
                    d={`M 0 50 Q 50 ${50 - Math.min(48, (visualizerData[9] || 8) * 0.8)} 100 50 T 200 50`} 
                    fill="none" 
                    stroke="#38bdf8" 
                    strokeWidth="1" 
                    opacity="0.3"
                    style={{ transition: 'd 0.1s ease-out' }} 
                  />
                </svg>
              </div>
              <h2 style={{ color: '#38bdf8', letterSpacing: '1px' }}>Listening to Engine...</h2>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', marginTop: '2rem', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', transition: 'width 0.2s linear' }} />
              </div>
            </div>
          )}


          {status === 'analyzing' && (
            <div className="fadeIn" style={{ width: '100%', maxWidth: '450px', position: 'relative', overflow: 'hidden', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '2rem', background: 'rgba(3, 7, 18, 0.9)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
              {selectedImage ? (
                <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={selectedImage} alt="Scanning source" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '4px',
                    background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                    boxShadow: '0 0 15px #38bdf8, 0 0 5px #38bdf8',
                    animation: 'laser-scan 2.5s infinite linear'
                  }} />
                </div>
              ) : (
                <div style={{ position: 'relative', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Activity size={80} color="#38bdf8" className="pulse-anim" />
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '4px',
                    background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                    boxShadow: '0 0 15px #38bdf8, 0 0 5px #38bdf8',
                    animation: 'laser-scan 2s infinite linear'
                  }} />
                </div>
              )}
              <h2 style={{ color: '#38bdf8', fontSize: '1.4rem', marginBottom: '0.5rem' }}>AI Diagnostics Scan...</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Analyzing telemetry nodes and spectral signatures...</p>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)', transition: 'width 0.2s linear' }} />
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
                      v{diagnosis.version || "6.0-ULTRA"}
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
                <button 
                   onClick={() => speakDiagnosis(`${diagnosis.details}. ${diagnosis.estimatedCost && diagnosis.estimatedCost !== '₹0' ? 'Expected cost is ' + diagnosis.estimatedCost : ''}. ${diagnosis.suggestedMechanic && diagnosis.suggestedMechanic !== 'N/A' ? 'Recommended specialist is ' + diagnosis.suggestedMechanic : ''}. Action is: ${diagnosis.action}`)}
                   style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid #38bdf8', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}
                >
                    <Volume2 size={24} />
                </button>
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

              {diagnosis.suggestedMechanic && diagnosis.suggestedMechanic !== 'N/A' && (
                <div style={{ background: 'rgba(249, 115, 22, 0.1)', borderLeft: '4px solid #f97316', padding: '1rem', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f97316', marginBottom: '4px' }}>
                    <Wrench size={18} />
                    <strong style={{fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Recommended Specialist</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{diagnosis.suggestedMechanic}</p>
                </div>
              )}

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
                <button onClick={() => window.location.href='/mechanics'} className="btn-gradient" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Wrench size={16} /> Find {diagnosis.suggestedMechanic && diagnosis.suggestedMechanic !== 'N/A' ? diagnosis.suggestedMechanic.split(' / ')[0] : 'Mechanic'}
                </button>
              </div>

            </div>
          )}

      </div>
      </div>
      <style>{`
        @keyframes laser-scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}

