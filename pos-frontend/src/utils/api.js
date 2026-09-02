import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://pos-system-3p1s.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});



// Universal request interceptor: automatically attach Bearer token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const impersonateStoreId = sessionStorage.getItem('impersonate_store_id');
    if (impersonateStoreId) {
      config.headers['X-Impersonate-Store-Id'] = impersonateStoreId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Universal response interceptor: clean up expired tokens gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRequest =
        error.config?.url?.includes('/auth/signin') ||
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/signup');

      if (!isAuthRequest && localStorage.getItem('jwt')) {
        localStorage.removeItem('jwt');
        sessionStorage.removeItem('impersonate_store_id');
        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== '/' &&
          !window.location.pathname.startsWith('/auth')
        ) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;