import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * Enterprise Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary Caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '600px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <FaExclamationTriangle style={{ fontSize: '64px', color: '#ef4444', marginBottom: '20px' }} />
            <h1>Oops! Something went wrong</h1>
            <p style={{ color: '#6b7280', margin: '20px 0' }}>
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                textAlign: 'left',
                margin: '20px 0',
                padding: '15px',
                background: '#f3f4f6',
                borderRadius: '8px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ fontSize: '12px', margin: '5px 0', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.toString()}
                </pre>
                <pre style={{ fontSize: '12px', margin: '5px 0', whiteSpace: 'pre-wrap' }}>
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '30px' }}>
              <button 
                onClick={this.handleReset} 
                className="btn btn-primary"
                style={{ padding: '10px 24px' }}
              >
                Return to Dashboard
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-outline-secondary"
                style={{ padding: '10px 24px' }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
