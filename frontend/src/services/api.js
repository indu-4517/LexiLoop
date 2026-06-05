import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Response interceptor: normalize errors to consistent shape
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const vocabApi = {
  // Word management
  getAllWords: () => api.get('/words').then((r) => r.data),
  addWord: (word) => api.post('/words', { word }).then((r) => r.data),
  deleteWord: (id) => api.delete(`/words/${id}`).then((r) => r.data),

  // Review
  getDueWords: () => api.get('/words/review').then((r) => r.data),
  submitReview: (id, correct, devMode) =>
    api.patch(`/words/${id}/review`, { correct, devMode }).then((r) => r.data),

  // Dev mode utilities
  resetWord: (id) => api.patch(`/words/${id}/reset`).then((r) => r.data),
  advanceTime: (days) =>
    api.post('/words/advance-time', { days }).then((r) => r.data),
};