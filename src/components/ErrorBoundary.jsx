import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { captureError } from '../lib/errorMonitoring';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[UniHairShop] Uncaught render error:', error, errorInfo);
    captureError(error, { componentStack: errorInfo?.componentStack });

    // Auto-recover from stale chunks after a fresh deployment
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('dynamically imported');

    if (isChunkError) {
      const hasReloaded = window.sessionStorage.getItem('unihair_error_chunk_reloaded');
      if (!hasReloaded) {
        window.sessionStorage.setItem('unihair_error_chunk_reloaded', 'true');
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearAndRestart = () => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('unihair_'));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {
      // localStorage may not be available
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'radial-gradient(circle at center, #1E1E2A 0%, #0A0A0C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif"
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 45, 85, 0.3)',
              borderRadius: '36px',
              padding: '40px 32px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div
              style={{
                background: 'rgba(255, 45, 85, 0.15)',
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <AlertTriangle size={36} color="#FF2D55" />
            </div>

            <h1
              style={{
                color: '#FFFFFF',
                fontSize: '1.5rem',
                fontWeight: 800,
                margin: '0 0 8px 0',
                letterSpacing: '-0.02em'
              }}
            >
              Something Went Wrong
            </h1>

            <p
              style={{
                color: '#94A3B8',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                margin: '0 0 24px 0'
              }}
            >
              UniHairShop encountered an unexpected error. This won't affect your saved data. Try reloading the app.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  textAlign: 'left'
                }}
              >
                <p
                  style={{
                    color: '#FF2D55',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    margin: 0,
                    wordBreak: 'break-word'
                  }}
                >
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#007AFF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '14px 24px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  transition: 'opacity 0.2s'
                }}
              >
                <RefreshCw size={16} />
                Reload App
              </button>

              <button
                onClick={this.handleClearAndRestart}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#94A3B8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '9999px',
                  padding: '12px 24px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  transition: 'opacity 0.2s'
                }}
              >
                <Trash2 size={14} />
                Clear Data & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
