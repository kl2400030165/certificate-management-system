import './LoadingSplash.css';

const LoadingSplash = ({ message = 'Loading...' }) => (
    <div className="splash-overlay" role="status" aria-label={message}>
        <div className="splash-content">
            {/* Logo mark */}
            <div className="splash-logo">
                <div className="splash-logo__ring splash-logo__ring--1" />
                <div className="splash-logo__ring splash-logo__ring--2" />
                <div className="splash-logo__ring splash-logo__ring--3" />
                <div className="splash-logo__icon">🎓</div>
            </div>

            {/* App name */}
            <div className="splash-brand">
                <span className="splash-brand__name">CertifyPro</span>
                <span className="splash-brand__tagline">Professional Certification Tracker</span>
            </div>

            {/* Spinner + message */}
            <div className="splash-spinner">
                <div className="splash-spinner__track" />
                <div className="splash-spinner__arc" />
            </div>

            <p className="splash-message">{message}</p>

            {/* Animated dots */}
            <div className="splash-dots">
                <span className="splash-dot" />
                <span className="splash-dot" />
                <span className="splash-dot" />
            </div>
        </div>
    </div>
);

export default LoadingSplash;
