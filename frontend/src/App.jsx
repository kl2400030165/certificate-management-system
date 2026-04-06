import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import UserDashboard from './pages/UserDashboard';
import AddCertificationPage from './pages/AddCertificationPage';
import MyCertificationsPage from './pages/MyCertificationsPage';
import CertificateViewPage from './pages/CertificateViewPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AllCertificationsPage from './pages/admin/AllCertificationsPage';
import ExpiringCertificationsPage from './pages/admin/ExpiringCertificationsPage';
import RenewalManagementPage from './pages/admin/RenewalManagementPage';

import NotificationPreferencesPage from './pages/NotificationPreferencesPage';
import CalendarViewPage from './pages/CalendarViewPage';
import ProfilePage from './pages/ProfilePage';
import RoadmapPage from './pages/RoadmapPage';
import CareerImpactPage from './pages/CareerImpactPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/global.css';

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return (
      <div id="main-content" className="public-shell" tabIndex={-1}>
        {children}
      </div>
    );
  }
  return (
    <div className="app-layout">
      <Sidebar />
      <main id="main-content" className="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <Routes>
        {/* Public */}
        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />

        {/* User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
        <Route path="/add-certification" element={<ProtectedRoute role="user"><AddCertificationPage /></ProtectedRoute>} />
        <Route path="/certifications" element={<ProtectedRoute role="user"><MyCertificationsPage /></ProtectedRoute>} />
        <Route path="/certificate/:id" element={<ProtectedRoute><CertificateViewPage /></ProtectedRoute>} />

        <Route path="/notifications" element={<ProtectedRoute role="user"><NotificationPreferencesPage /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute role="user"><CalendarViewPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute role="user"><ProfilePage /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute role="user"><RoadmapPage /></ProtectedRoute>} />
        <Route path="/career-impact" element={<ProtectedRoute role="user"><CareerImpactPage /></ProtectedRoute>} />
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/certifications" element={<ProtectedRoute role="admin"><AllCertificationsPage /></ProtectedRoute>} />
        <Route path="/admin/expiring" element={<ProtectedRoute role="admin"><ExpiringCertificationsPage /></ProtectedRoute>} />
        <Route path="/admin/renewals" element={<ProtectedRoute role="admin"><RenewalManagementPage /></ProtectedRoute>} />

        {/* Default */}
        <Route path="*" element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />
            : <Navigate to="/login" />
        } />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <BrowserRouter>
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;
