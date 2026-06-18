import axios from 'axios';
import { config } from '../config/environment';

/**
 * Enterprise-grade Axios instance with advanced interceptors
 */
const API = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Request interceptor - Add auth token to all requests
 */
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token');
    
    // Add auth header for all requests except /auth endpoints
    if (token && !req.url.includes('/auth')) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${req.method.toUpperCase()} ${req.url}`, req.data || '');
    }

    return req;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
API.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    const { response, message } = error;

    // Network error (no response from server)
    if (!response) {
      console.error('🌐 Network Error:', message);
      showToast('Network error. Please check your internet connection.', 'error');
      return Promise.reject({ message: 'Network error. Please try again.' });
    }

    const { status, data } = response;

    // Handle different status codes
    switch (status) {
      case 400:
        // Bad Request - validation errors
        console.warn('⚠️ Bad Request:', data);
        showToast(data.message || 'Invalid request data', 'warning');
        break;

      case 401:
        // Unauthorized - token expired or invalid
        console.warn('🔒 Unauthorized - Auto logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        showToast('Session expired. Please login again.', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        break;

      case 403:
        // Forbidden - insufficient permissions
        console.warn('🚫 Access Denied');
        showToast('Access denied. You do not have permission.', 'error');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
        break;

      case 404:
        // Not Found
        console.warn('🔍 Resource Not Found:', data);
        showToast(data.message || 'Resource not found', 'warning');
        break;

      case 409:
        // Conflict - duplicate entry
        console.warn('⚡ Conflict:', data);
        showToast(data.message || 'Resource already exists', 'warning');
        break;

      case 500:
      case 502:
      case 503:
        // Server Error
        console.error('💥 Server Error:', data);
        showToast('Server error. Please try again later.', 'error');
        break;

      default:
        console.error('❌ Unexpected Error:', status, data);
        showToast(data.message || 'An unexpected error occurred', 'error');
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to show toast notifications
 * (Uses alert for now, can be replaced with react-toastify or similar)
 */
const showToast = (message, type = 'info') => {
  // Store toast in sessionStorage to be picked up by App component
  const toast = { message, type, timestamp: Date.now() };
  sessionStorage.setItem('latestToast', JSON.stringify(toast));
  
  // Dispatch custom event for toast
  window.dispatchEvent(new CustomEvent('showToast', { detail: toast }));
};

export default API;