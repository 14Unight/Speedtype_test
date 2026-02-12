import { Navigate } from 'react-router-dom';
import { useAuthHook } from '@/hooks/useAuth.js';
import { Loader } from './Loader.jsx';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthHook();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const GuestOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthHook();

  if (isLoading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isLoading } = useAuthHook();

  if (isLoading) {
    return <Loader />;
  }

  return children;
};
