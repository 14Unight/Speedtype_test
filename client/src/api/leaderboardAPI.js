import api from './axiosInstance.js';

export const leaderboardAPI = {
  // Get leaderboard data
  getLeaderboard: async (params = {}) => {
    const { page = 1, limit = 50, timeframe = 'all', difficulty = null } = params;
    const response = await api.get('/leaderboard', {
      params: { page, limit, timeframe, difficulty }
    });
    return response.data;
  },

  // Get current user's rank
  getUserRank: async (params = {}) => {
    const { timeframe = 'all', difficulty = null } = params;
    const response = await api.get('/leaderboard/my-rank', {
      params: { timeframe, difficulty }
    });
    return response.data;
  },

  // Get global statistics
  getGlobalStats: async () => {
    const response = await api.get('/leaderboard/stats');
    return response.data;
  }
};
