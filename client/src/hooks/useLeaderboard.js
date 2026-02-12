import { useState, useEffect, useCallback } from 'react';
import { leaderboardAPI } from '@/api/leaderboardAPI.js';
import { toast } from 'react-toastify';

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState({
    results: [],
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    },
    userRank: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    timeframe: 'all',
    difficulty: null
  });

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (newFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mergedFilters = { ...filters, ...newFilters };
      const response = await leaderboardAPI.getLeaderboard(mergedFilters);
      
      if (response.success) {
        setLeaderboard(response.data);
        setFilters(mergedFilters);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch leaderboard';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Change page
  const changePage = useCallback((page) => {
    if (page >= 1 && page <= leaderboard.pagination.totalPages) {
      fetchLeaderboard({ page });
    }
  }, [fetchLeaderboard, leaderboard.pagination.totalPages]);

  // Change filters
  const changeFilters = useCallback((newFilters) => {
    fetchLeaderboard({ ...newFilters, page: 1 }); // Reset to first page when changing filters
  }, [fetchLeaderboard]);

  // Refresh current data
  const refresh = useCallback(() => {
    fetchLeaderboard(filters);
  }, [fetchLeaderboard, filters]);

  // Initial fetch
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    isLoading,
    error,
    filters,
    fetchLeaderboard,
    changePage,
    changeFilters,
    refresh
  };
};

export const useUserRank = () => {
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserRank = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await leaderboardAPI.getUserRank(filters);
      
      if (response.success) {
        setUserRank(response.data.userRank);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch user rank';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    userRank,
    isLoading,
    error,
    fetchUserRank
  };
};

export const useGlobalStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGlobalStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await leaderboardAPI.getGlobalStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch global stats';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchGlobalStats();
  }, [fetchGlobalStats]);

  return {
    stats,
    isLoading,
    error,
    fetchGlobalStats
  };
};
