import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Runtime Error caught by Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030712',
          padding: '2rem',
          textAlign: 'center',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '2rem',
            borderRadius: '24px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <AlertTriangle size={32} color="#ef4444" />
            </div>
            
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem' }}>
              System Alert
            </h1>
            
            <p style={{ color: '#9ca3af', marginBottom: '2rem', lineHeight: '1.6' }}>
              We encountered a minor glitch while loading this part of the website. 
              Don't worry, your data is safe and we've logged the issue.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)',
                  color: '#030712',
                  border: 'none',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={18} />
                Try Again
              </button>
              
              <a 
                href="/"
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Home size={18} />
                Go Home
              </a>
            </div>
          </div>
          
          <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#4b5563' }}>
            Reference: {this.state.error?.message || 'Unknown Error'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
