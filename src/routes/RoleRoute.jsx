import { Navigate } from 'react-router-dom';
import PageLoader from '../components/PageLoader';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ children, allowedRoles }) {
  const { loading, profileLoading, role, isAuthenticated } = useAuth();

  if (loading || (isAuthenticated && profileLoading)) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && allowedRoles.includes(role)) return children;
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}