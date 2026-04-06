import { Component } from 'react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('CertifyPro UI error:', error, info?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <div className="error-boundary-icon" aria-hidden>⚠️</div>
            <h1>Something went wrong</h1>
            <p>
              This screen protects the rest of the app. You can try again or go back to a safe page.
            </p>
            {import.meta.env.DEV && this.state.error?.message && (
              <pre className="error-boundary-detail">{this.state.error.message}</pre>
            )}
            <div className="error-boundary-actions">
              <button type="button" className="btn-primary-custom" onClick={this.handleRetry}>
                Try again
              </button>
              <Link to="/dashboard" className="btn-secondary-custom">
                Dashboard
              </Link>
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
