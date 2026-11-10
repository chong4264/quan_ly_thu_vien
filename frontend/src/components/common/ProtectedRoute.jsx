import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ staffOnly = false }) {
  const { user, loading, isStaff } = useAuth();
  if (loading) return <div className="p-8 text-on-surface-variant">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (staffOnly && !isStaff) return <Navigate to="/tra-cuu-sach" replace />;
  return <Outlet />;
}
