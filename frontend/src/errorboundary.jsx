import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // This will show the error in console
    console.error("ERROR BOUNDARY CAUGHT:", error);
    console.error("ERROR INFO:", errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.error) {
      // Show the error on screen instead of blank
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', margin: '20px', borderRadius: '8px' }}>
          <h2>Something went wrong:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {this.state.error.toString()}
          </pre>
          <details style={{ marginTop: '10px' }}>
            <summary>Stack trace</summary>
            <pre style={{ fontSize: '11px' }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;