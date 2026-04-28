import axios from 'axios';

const getStoredToken = () => sessionStorage.getItem('certToken') || localStorage.getItem('certToken');

const clearStoredSession = () => {
  sessionStorage.removeItem('certToken');
  sessionStorage.removeItem('certUser');
  localStorage.removeItem('certToken');
  localStorage.removeItem('certUser');
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
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
    if (error.response?.status === 401) {
      clearStoredSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
