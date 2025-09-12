import { Navigate, Outlet } from 'react-router-dom';
import { authApi } from '../lib/api';

export default function ProtectedRoute() {
  const isAuthenticated = authApi.isAuthenticated();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
