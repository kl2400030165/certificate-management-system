import { BrowserRouter, Routes, Route, Navigate, Suspense, lazy } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';
import LoadingSplash from './components/LoadingSplash';

// Code-split pages — each loads only when first navigated to
const LoginPage                 = lazy(() => import('./pages/LoginPage'));
const RegisterPage              = lazy(() => import('./pages/RegisterPage'));
const VerifyOtpPage             = lazy(() => import('./pages/VerifyOtpPage'));
const UserDashboard             = lazy(() => import('./pages/UserDashboard'));
const AddCertificationPage      = lazy(() => import('./pages/AddCertificationPage'));
const MyCertificationsPage      = lazy(() => import('./pages/MyCertificationsPage'));
const CertificateViewPage       = lazy(() => import('./pages/CertificateViewPage'));
const AdminDashboard            = lazy(() => import('./pages/admin/AdminDashboard'));
const AllCertificationsPage     = lazy(() => import('./pages/admin/AllCertificationsPage'));
const ExpiringCertificationsPage = lazy(() => import('./pages/admin/ExpiringCertificationsPage'));
const RenewalManagementPage     = lazy(() => import('./pages/admin/RenewalManagementPage'));
const NotificationPreferencesPage = lazy(() => import('./pages/NotificationPreferencesPage'));
const CalendarViewPage          = lazy(() => import('./pages/CalendarViewPage'));
const ProfilePage               = lazy(() => import('./pages/ProfilePage'));
const RoadmapPage               = lazy(() => import('./pages/RoadmapPage'));
const CareerImpactPage          = lazy(() => import('./pages/CareerImpactPage'));

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
      <Suspense fallback={<LoadingSplash message="Loading page..." />}>
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
      </Suspense>
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
