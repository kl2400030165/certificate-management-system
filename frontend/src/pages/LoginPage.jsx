import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiShieldCheckLine, RiErrorWarningLine } from 'react-icons/ri';
import api from '../utils/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Backend returns 202 + { step:"otp_sent", email } — never a JWT here
            await api.post('/api/auth/login', { email, password });
            sessionStorage.setItem('certifyOtpFlow', 'login');
            navigate(`/verify-otp?email=${encodeURIComponent(email)}&mode=login`);
        } catch (err) {
            if (!err.response) {
                setError('Cannot reach backend server. Start backend on http://localhost:8080 and try again.');
                return;
            }
            const msg = err.response?.data?.message || '';
            if (msg === 'EMAIL_NOT_VERIFIED') {
                sessionStorage.setItem('certifyOtpFlow', 'register');
                navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
                return;
            }
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card fade-up">
                <div className="auth-logo">
                    <div className="brand-icon" style={{ width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}><RiShieldCheckLine /></div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>CertifyPro</span>
                </div>

                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-subtitle">Sign in to manage your certifications</p>

                {error && <div className="auth-error"><RiErrorWarningLine /> {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }}><RiMailLine /></span>
                            <input className="form-input" style={{ paddingLeft: 42 }} type="email" placeholder="you@example.com"
                                value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }}><RiLockLine /></span>
                            <input className="form-input" style={{ paddingLeft: 42, paddingRight: 42 }}
                                type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)} required />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>
                                {showPwd ? <RiEyeOffLine /> : <RiEyeLine />}
                            </button>
                        </div>
                    </div>

                    {/* OTP info hint */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)',
                        borderRadius: 8, padding: '10px 14px', margin: '12px 0', fontSize: 13,
                        color: 'var(--text-muted)'
                    }}>
                        <span style={{ fontSize: 16, display: 'inline-flex' }}><RiLockLine /></span>
                        <span>A one-time code will be sent to your email after sign‑in.</span>
                    </div>

                    <button type="submit" className="btn-primary-custom w-100" disabled={loading}
                        style={{ justifyContent: 'center', padding: '13px', marginTop: 4 }}>
                        {loading ? 'Sending OTP...' : 'Continue'}
                    </button>
                </form>

                <div className="auth-link" style={{ marginTop: 16 }}>
                    Don't have an account? <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
