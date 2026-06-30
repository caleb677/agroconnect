import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('AgroConnect error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#E24B4A' }}>Something went wrong</h2>
          <p style={{ color: '#888', marginTop: 8 }}>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '10px 24px', background: '#0F6E56', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
