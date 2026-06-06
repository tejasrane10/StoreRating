import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import MainLayout from '../components/layout/MainLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminStores from '../pages/admin/AdminStores';
import AdminRatings from '../pages/admin/AdminRatings';
import AdminActivity from '../pages/admin/AdminActivity';
import AdminTopRatedStores from '../pages/admin/AdminTopRatedStores';
import UserDashboard from '../pages/user/UserDashboard';
import StoresPage from '../pages/user/StoresPage';
import MyRatings from '../pages/user/MyRatings';
import StoreOwnerDashboard from '../pages/storeOwner/StoreOwnerDashboard';
import StoreManagementPage from '../pages/storeOwner/StoreManagementPage';
import StoreRatingsPage from '../pages/storeOwner/StoreRatingsPage';
import SettingsPage from '../pages/common/SettingsPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const defaultPath = isAuthenticated
    ? user?.role === 'admin' ? '/admin/dashboard'
    : user?.role === 'storeOwner' ? '/store/dashboard'
    : '/user/dashboard'
    : '/login';

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users"    element={<AdminUsers />} />
        <Route path="stores"   element={<AdminStores />} />
        <Route path="stores/top-rated" element={<AdminTopRatedStores />} />
        <Route path="ratings"  element={<AdminRatings />} />
        <Route path="activity" element={<AdminActivity />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* User routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="stores" element={<StoresPage />} />
        <Route path="ratings" element={<MyRatings />} />
        <Route path="settings"  element={<SettingsPage />} />
      </Route>

      {/* Store Owner routes */}
      <Route
        path="/store"
        element={
          <ProtectedRoute allowedRoles={['storeOwner']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StoreOwnerDashboard />} />
        <Route path="stores" element={<StoreManagementPage />} />
        <Route path="ratings" element={<StoreRatingsPage />} />
        <Route path="settings"  element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={defaultPath} replace />} />
    </Routes>
  );
}
