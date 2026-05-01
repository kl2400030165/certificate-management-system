import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import LoadingSplash from '../components/LoadingSplash';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Helpers: keep token and user profile in separate localStorage keys
// certToken  → JWT only
// certUser   → profile fields only (no token — avoids stale token copies)
const saveSession = (token, userData) => {
    // During login-init (OTP step) backend returns `token: null`.
    // Avoid persisting `"null"` as a real token; otherwise protected admin calls will send
    // `Authorization: Bearer null`.
    if (token) {
        localStorage.setItem('certToken', token);
    } else {
        localStorage.removeItem('certToken');
    }
    const { token: _t, ...profile } = userData;   // strip token before storing profile
    localStorage.setItem('certUser', JSON.stringify(profile));
};

const clearSession = () => {
    localStorage.removeItem('certToken');
    localStorage.removeItem('certRefreshToken');
    localStorage.removeItem('certUser');
    sessionStorage.removeItem('certToken');
    sessionStorage.removeItem('certUser');
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Connecting to server...');

    // Restore session on app load
    useEffect(() => {
        const token = localStorage.getItem('certToken');
        const stored = localStorage.getItem('certUser');
        if (token && stored) {
            setUser(JSON.parse(stored));
            setLoadingMessage('Verifying your session...');

            // Show a "taking longer than usual" message after 5s (Render cold start)
            const slowTimer = setTimeout(() => {
                setLoadingMessage('Server is waking up, almost there...');
            }, 5000);

            // Verify token is still valid — reuse same token (don't re-issue)
            api.get('/api/auth/me')
                .then(res => {
                    clearTimeout(slowTimer);
                    const { token: _t, ...profile } = res.data;  // ignore any token in response
                    setUser(profile);
                    localStorage.setItem('certUser', JSON.stringify(profile));
                    // certToken stays the same — not overwritten
                })
                .catch(() => {
                    clearTimeout(slowTimer);
                    clearSession();
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        const data = res.data;
        saveSession(data.token, data);
        if (data.refreshToken) {
            localStorage.setItem('certRefreshToken', data.refreshToken);
        }
        const { token: _t, ...profile } = data;
        setUser(profile);
        return { success: true, role: profile.role };
    };

    const register = async (name, email, password) => {
        await api.post('/api/auth/register', { name, email, password });
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        clearSession();
    };

    const updateUser = (nextUser) => {
        if (nextUser?.token) {
            localStorage.setItem('certToken', nextUser.token);
        }
        if (nextUser?.refreshToken) {
            localStorage.setItem('certRefreshToken', nextUser.refreshToken);
        }
        const { token: _t, refreshToken: _r, ...profile } = nextUser || {};
        setUser(profile);
        localStorage.setItem('certUser', JSON.stringify(profile));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {loading
                ? <LoadingSplash message={loadingMessage} />
                : children
            }
        </AuthContext.Provider>
    );
};
