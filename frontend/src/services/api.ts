import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api/v1' : '/api/v1');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nyayalens_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for 401 & 404 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token if unauthorized
      localStorage.removeItem('nyayalens_token');
    }
    if (error.response && error.response.status === 404) {
      console.error(
        `[NyayaLens API Error] 404 Not Found at: ${error.config?.baseURL}${error.config?.url}. ` +
        `If deployed, make sure VITE_API_BASE_URL environment variable is set to your live backend (e.g. https://your-backend.onrender.com/api/v1).`
      );
    }
    return Promise.reject(error);
  }
);
