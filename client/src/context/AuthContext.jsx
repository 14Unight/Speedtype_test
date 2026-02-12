import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '@/api/authAPI.js';
import { testAPI } from '@/api/testAPI.js';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authAPI.getMe();
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { user, accessToken } = response.data;
        
        // Store access token
        localStorage.setItem('accessToken', accessToken);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user, accessToken } = response.data;
        
        // Store access token
        localStorage.setItem('accessToken', accessToken);
        
        // Update state
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    }
    
    // Clear local state
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
    
    toast.success('Logged out successfully');
  };

  const logoutAll = async () => {
    try {
      await authAPI.logoutAll();
    } catch (error) {
      console.error('Logout all API call failed:', error);
    }
    
    // Clear local state
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
    
    toast.success('Logged out from all devices');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.data.user);
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const ensureGuestSession = async () => {
    if (isAuthenticated) return null;
    
    try {
      const response = await testAPI.ensureGuestSession();
      return response.data;
    } catch (error) {
      console.error('Failed to ensure guest session:', error);
      return null;
    }
  };

  const value = {
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
