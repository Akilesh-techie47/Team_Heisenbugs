import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/layout/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';
import { SearchPage } from './pages/SearchPage';
import { MatchesPage } from './pages/MatchesPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { AdminPage } from './pages/AdminPage';
import { HandoverPage } from './pages/HandoverPage';
import { RecoveredPage } from './pages/RecoveredPage';

// Route guard for authenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin is not a normal user: redirect to Admin Portal
  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Route guard for strictly ADMIN role (Test 1: Normal user opens /admin -> Access Denied)
const AdminProtectedRoute = ({ children }) => {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#C53A34] border border-red-200 flex items-center justify-center mx-auto text-xl font-bold">
          403
        </div>
        <h2 className="text-2xl font-bold text-[#15161A]">Access Denied: Administrator Privileges Required</h2>
        <p className="text-xs text-[#555A63] leading-relaxed max-w-md mx-auto">
          This URL is strictly reserved for authorized university campus administrators. Normal users cannot access this dashboard or execute administrative decisions.
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/home"
            className="px-4 py-2 text-xs font-semibold text-[#555A63] hover:text-[#15161A] bg-white border border-[#E3E5E8] rounded-xl transition-colors"
          >
            Return to My Dashboard
          </Link>
          <Link
            to="/admin/login"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#15161A] hover:bg-neutral-800 rounded-xl shadow-xs transition-colors"
          >
            Sign In with Administrator Credentials
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route element={<Layout />}>
              {/* Public Entry Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Authenticated User Routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <ReportPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <SearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matches"
                element={
                  <ProtectedRoute>
                    <MatchesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims"
                element={
                  <ProtectedRoute>
                    <ClaimsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/handover"
                element={
                  <ProtectedRoute>
                    <HandoverPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recovered"
                element={
                  <ProtectedRoute>
                    <RecoveredPage />
                  </ProtectedRoute>
                }
              />

              {/* Strictly Protected Admin Console (Test 1) */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminPage />
                  </AdminProtectedRoute>
                }
              />

              {/* Moderator URL gracefully redirects to Admin Console */}
              <Route path="/moderator" element={<Navigate to="/admin" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
