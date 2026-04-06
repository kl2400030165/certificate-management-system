import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { RiUserLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

const RegisterPage = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

        setLoading(true);
        try {
            await api.post('/api/auth/register', {
                name: form.name,
                email: form.email,
                password: form.password,
            });
            setSuccess('Account created! Check your email for the verification code…');
            sessionStorage.setItem('certifyOtpFlow', 'register');
            setTimeout(() => navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`), 1200);
        } catch (err) {
            const data = err.response?.data;
            let msg = data?.message;
            if (!msg && data && typeof data === 'object') {
                const parts = Object.values(data).filter(v => typeof v === 'string');
                if (parts.length) msg = parts.join(' ');
            }
            setError(msg || err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card fade-up">
                <div className="auth-logo">
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
                    <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CertifyPro</span>
                </div>

                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Start tracking your certifications today</p>

                {error && <div className="auth-error">⚠ {error}</div>}
                {success && <div className="auth-success">✓ {success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }}><RiUserLine /></span>
                            <input className="form-input" style={{ paddingLeft: 42 }} name="name" type="text"
                                placeholder="John Doe" value={form.name} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }}><RiMailLine /></span>
                            <input className="form-input" style={{ paddingLeft: 42 }} name="email" type="email"
                                placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }}><RiLockLine /></span>
                            <input className="form-input" style={{ paddingLeft: 42, paddingRight: 42 }}
                                name="password" type={showPwd ? 'text' : 'password'}
                                placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>
                                {showPwd ? <RiEyeOffLine /> : <RiEyeLine />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }}><RiLockLine /></span>
                            <input className="form-input" style={{ paddingLeft: 42 }} name="confirm" type="password"
                                placeholder="Repeat password" value={form.confirm} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Email OTP notice */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                        borderRadius: 8, padding: '10px 14px', margin: '4px 0 12px', fontSize: 13,
                        color: 'var(--text-muted)'
                    }}>
                        <span style={{ fontSize: 16 }}>📧</span>
                        <span>A 6-digit verification code will be emailed to you after registration.</span>
                    </div>

                    <button type="submit" className="btn-primary-custom w-100" disabled={loading}
                        style={{ justifyContent: 'center', padding: '13px', marginTop: 4 }}>
                        {loading ? '⏳ Creating…' : '🚀 Create Account'}
                    </button>
                </form>

                <div className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
