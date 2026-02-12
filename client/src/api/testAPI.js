import api from './axiosInstance.js';

export const testAPI = {
  // Get test text and create session
  getText: async (params = {}) => {
    const { language = 'en', difficulty = 'medium', duration = 60 } = params;
    const response = await api.get('/test/texts', {
      params: { language, difficulty, duration }
    });
    return response.data;
  },

  // Submit test result
  submitResult: async (resultData) => {
    const response = await api.post('/test/submit', resultData);
    return response.data;
  },

  // Get user test history
  getHistory: async (params = {}) => {
    const { page = 1, limit = 20, timeframe = 'all' } = params;
    const response = await api.get('/test/history', {
      params: { page, limit, timeframe }
    });
    return response.data;
  },

  // Get guest test history
  getGuestHistory: async (params = {}) => {
    const { page = 1, limit = 20 } = params;
    const response = await api.get('/test/guest-history', {
      params: { page, limit }
    });
    return response.data;
  },

  // Ensure guest session exists
  ensureGuestSession: async () => {
    const response = await api.post('/test/guest-session');
    return response.data;
  }
};
