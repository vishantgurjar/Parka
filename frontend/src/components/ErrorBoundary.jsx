import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#030712', 
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ 
            padding: '40px', 
            borderRadius: '24px', 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#5eead4' }}>Oops! System Safety Triggered</h1>
            <p style={{ color: '#9ca3af', marginBottom: '2rem', maxWidth: '400px' }}>
              We've caught a minor glitch. Your vehicle protection is still active in the background.
            </p>
            <button 
              onClick={this.handleReset}
              style={{
                padding: '12px 32px',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)',
                color: '#030712',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Restart Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
