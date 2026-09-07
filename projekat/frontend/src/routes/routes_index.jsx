// frontend/src/routes/index.jsx
import ProtectedRoute from '../modules/auth/ProtectedRoute';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ApplicationsPage      from '../pages/ApplicationsPage';
import AuthPage              from '../pages/AuthPage';
import DashboardPage         from '../pages/DashboardPage';
import ListingsPage          from '../pages/ListingsPage';
import NotFoundPage          from '../pages/NotFoundPage';
import ProfilePage           from '../pages/ProfilePage';
import AdminDashboard        from '../pages/AdminDashboard';
import LandingPage           from '../pages/LandingPage';
import RegisterPage          from '../pages/RegisterPage';
import PrivacyPolicy         from '../pages/PrivacyPolicy';
import TermsAndConditions    from '../pages/TermsAndConditions';
import CookiesPolicy         from '../pages/CookiesPolicy';
// ── Role dashboards (dummy pages until fully implemented) ──
import StudentDashboard      from '../pages/StudentDashboard';
import CompanyProfilePage    from '../pages/CompanyProfilePage';
import KompanijaDashboard    from '../pages/KompanijaDashboard';
import KoordinatorDashboard  from '../pages/KoordinatorDashboard';

import ForgotPasswordPage  from '../pages/ForgotPasswordPage';
import ResetPasswordPage   from '../pages/ResetPasswordPage';
import VerifyEmailPage     from '../pages/VerifyEmailPage';
import PublicListingsPage from '../pages/PublicListingsPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"          element={<LandingPage />} />
        <Route path="/auth"      element={<AuthPage />} />
        <Route path="/login"     element={<AuthPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/privacy"   element={<PrivacyPolicy />} />
        <Route path="/terms"   element={<TermsAndConditions />} />
        <Route path="/cookies" element={<CookiesPolicy />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
        <Route path="/verify-email"    element={<VerifyEmailPage />} />

        {/* Role dashboards – each role lands on its own route */}
        <Route path="/dashboard/student" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/company/:id" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <CompanyProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/company" element={
          <ProtectedRoute allowedRoles={['COMPANY']}>
            <KompanijaDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/coordinator" element={
          <ProtectedRoute allowedRoles={['COORDINATOR']}>
            <KoordinatorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Generic / shared (keep for now, will be replaced per-role) */}
        <Route path="/dashboard"     element={<DashboardPage />} />
        <Route path="/listings"      element={<ListingsPage />} />
        <Route path="/applications"  element={<ApplicationsPage />} />
        <Route path="/profile"       element={<ProfilePage />} />
        <Route path="/listings/public" element={<PublicListingsPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
