import axios from 'axios';

// Determine the backend URL based on environment
const getBackendURL = () => {
  // Check if we're in production (Vercel deployment)
  if (import.meta.env.PROD) {
    return 'https://business-loan-backend.onrender.com';
  }
  
  // Check for environment variable
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:5002';
};

const BACKEND_URL = getBackendURL();

console.log('🔗 Backend URL configured:', BACKEND_URL);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('🔄 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL || window.location.origin}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    // Skip auth token for demo/supabase endpoints to avoid auth issues
    const isSupabaseEndpoint = config.url?.includes('/api/supabase/');
    const isMockEndpoint = config.url?.includes('/api/mock/');
    const isHealthEndpoint = config.url?.includes('/health');
    
    if (!isSupabaseEndpoint && !isMockEndpoint && !isHealthEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Added auth token to request');
      } else {
        console.log('ℹ️ No auth token found in localStorage');
      }
    } else {
      console.log('ℹ️ Skipping auth token for demo endpoint:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      responseData: error.response?.data,
      requestData: error.config?.data
    });
    
    if (error.response?.status === 401) {
      // Only redirect to login for protected endpoints, not demo/supabase endpoints
      const isSupabaseEndpoint = error.config?.url?.includes('/api/supabase/');
      const isMockEndpoint = error.config?.url?.includes('/api/mock/');
      const isHealthEndpoint = error.config?.url?.includes('/health');
      
      if (!isSupabaseEndpoint && !isMockEndpoint && !isHealthEndpoint) {
        console.log('🔐 Unauthorized access to protected endpoint, redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        console.log('⚠️ 401 error on demo endpoint, not redirecting to login:', error.config?.url);
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('🚫 Network Error: Backend server is not running or not accessible');
      console.error('🔍 Check if backend is running on the correct port');
    }
    
    return Promise.reject(error);
  }
);

export default api;
