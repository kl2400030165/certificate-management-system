import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const RESEND_COOLDOWN = 60; // seconds

const VerifyOtpPage = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const modeFromUrl = searchParams.get('mode');
    const mode = modeFromUrl || sessionStorage.getItem('certifyOtpFlow') || 'register';
    const isLoginMode = mode === 'login';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN);
    const [resending, setResending] = useState(false);
    const inputsRef = useRef([]);
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    // Countdown timer
    useEffect(() => {
        if (resendCountdown <= 0) return;
        const t = setTimeout(() => setResendCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCountdown]);

    const handleDigit = (idx, val) => {
        if (!/^\d?$/.test(val)) return;
        const next = [...otp];
        next[idx] = val;
        setOtp(next);
        if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const next = [...otp];
        [...pasted].forEach((ch, i) => { next[i] = ch; });
        setOtp(next);
        inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) { setError('Please enter the full 6-digit code'); return; }

        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/api/auth/verify-otp', { email, otp: code });
            sessionStorage.removeItem('certifyOtpFlow');
            updateUser(data);
            setSuccess(isLoginMode ? 'Verified! Taking you to your dashboard…' : 'Email verified! Taking you to your dashboard…');
            const target = data.role === 'admin' ? '/admin/dashboard' : '/dashboard';
            setTimeout(() => navigate(target, { replace: true }), 600);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputsRef.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCountdown > 0) return;
        setResending(true);
        setError('');
        try {
            await api.post('/api/auth/resend-otp', { email });
            setSuccess('A new code has been sent to your email.');
            setResendCountdown(RESEND_COOLDOWN);
            setOtp(['', '', '', '', '', '']);
            inputsRef.current[0]?.focus();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setResending(false);
            setTimeout(() => setSuccess(''), 4000);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card fade-up" style={{ maxWidth: 440 }}>
                {/* Logo */}
                <div className="auth-logo">
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
                    <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CertifyPro</span>
                </div>

                {/* Shield icon */}
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(79,142,247,0.15), rgba(139,92,246,0.15))',
                        border: '2px solid rgba(79,142,247,0.3)', fontSize: 28, margin: '0 auto 12px'
                    }}>🔐</div>
                </div>

                <h2 className="auth-title" style={{ marginTop: 0 }}>
                    {isLoginMode ? 'Two-Factor Verification' : 'Check your email'}
                </h2>
                <p className="auth-subtitle" style={{ marginBottom: 6 }}>
                    {isLoginMode
                        ? 'Enter the login OTP we sent to'
                        : 'We sent a 6-digit verification code to'}
                </p>
                <p style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: 14, marginBottom: 24, wordBreak: 'break-all' }}>
                    {email || 'your email'}
                </p>

                {error && <div className="auth-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}
                {success && <div className="auth-success" style={{ marginBottom: 16 }}>✓ {success}</div>}

                <form onSubmit={handleSubmit}>
                    {/* 6-digit OTP boxes */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }} onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => inputsRef.current[i] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleDigit(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                style={{
                                    width: 52, height: 60,
                                    textAlign: 'center',
                                    fontSize: 26, fontWeight: 700,
                                    borderRadius: 12,
                                    border: `2px solid ${digit ? 'var(--primary)' : 'var(--border)'}`,
                                    background: 'var(--surface-2)',
                                    color: 'var(--text)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    boxShadow: digit ? '0 0 0 3px rgba(79,142,247,0.2)' : 'none',
                                    caretColor: 'var(--primary)',
                                }}
                                onFocus={e => e.target.select()}
                                autoFocus={i === 0}
                            />
                        ))}
                    </div>

                    <button type="submit" className="btn-primary-custom w-100" disabled={loading}
                        style={{ justifyContent: 'center', padding: '13px', marginBottom: 16 }}>
                        {loading ? '⏳ Verifying…' : '✅ Verify & Continue'}
                    </button>
                </form>

                {/* Resend */}
                <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
                    Didn't receive it?{' '}
                    {resendCountdown > 0 ? (
                        <span>Resend in <strong style={{ color: 'var(--primary)' }}>{resendCountdown}s</strong></span>
                    ) : (
                        <button onClick={handleResend} disabled={resending}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 14, padding: 0 }}>
                            {resending ? 'Sending…' : 'Resend code'}
                        </button>
                    )}
                </div>

                <div className="auth-link" style={{ marginTop: 20 }}>
                    <Link to="/login">← Back to sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtpPage;
