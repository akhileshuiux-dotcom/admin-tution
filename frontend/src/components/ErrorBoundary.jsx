import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("EDUWAY CRASH DETAILS:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f8fafc', padding: 20, textAlign: 'center' }}>
          <div style={{ maxWidth: 500 }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Component Error</h1>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
                One of the academy modules failed to initialize. We've logged the technical details for the administrator.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, fontSize: 13, fontFamily: 'monospace', color: '#f43f5e', marginBottom: 24, textAlign: 'left', overflow: 'auto' }}>
                {this.state.error?.toString()}
            </div>
            <button 
                onClick={() => window.location.reload()}
                style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}
            >
                Refresh Academy Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
