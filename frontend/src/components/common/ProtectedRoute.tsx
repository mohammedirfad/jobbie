import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { PageLoader } from './Loader';

export const ProtectedRoute = ({ adminOnly = false }: { adminOnly?: boolean }) => {
  const { isAuthenticated, user, loading } = useAppSelector(s => s.auth);
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};
