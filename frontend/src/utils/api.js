import axios from 'axios';

const getStoredToken = () => sessionStorage.getItem('certToken') || localStorage.getItem('certToken');

const clearStoredSession = () => {
  sessionStorage.removeItem('certToken');
  sessionStorage.removeItem('certUser');
  localStorage.removeItem('certToken');
  localStorage.removeItem('certUser');
};

const apiBaseUrl = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:8080' : 'https://certificate-management-system-backend.onrender.com');

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear session and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/api/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      clearStoredSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
