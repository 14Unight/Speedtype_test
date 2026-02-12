import { useAuth } from '@/context/AuthContext.jsx';

export const useAuthHook = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    logoutAll,
    updateProfile,
    checkAuthStatus,
    ensureGuestSession
  } = useAuth();

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    logoutAll,
    updateProfile,
    checkAuthStatus,
    ensureGuestSession,
    isGuest: !isAuthenticated
  };
};
