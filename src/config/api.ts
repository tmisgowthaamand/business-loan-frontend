import axios from 'axios';

// API Configuration for Business Loan Portal
// Automatically detects environment and uses appropriate backend URL

const getBaseURL = () => {
  // Check if we're in production (Vercel deployment)
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://business-loan-backend.onrender.com/api';
  }
  
  // Check if we're in Render deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://business-loan-backend.onrender.com/api';
  }
  
  // Local development
  return 'http://localhost:5002/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.headers['X-Request-Time'] = new Date().toISOString();
    
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    verify: '/auth/verify',
  },
  
  // Enquiries
  enquiries: {
    list: '/enquiries',
    create: '/enquiries',
    update: (id: number) => `/enquiries/${id}`,
    delete: (id: number) => `/enquiries/${id}`,
    stats: '/enquiries/stats',
  },
  
  // Documents
  documents: {
    list: '/documents',
    upload: '/documents/upload',
    verify: (id: number) => `/documents/${id}/verify`,
    delete: (id: number) => `/documents/${id}`,
  },
  
  // Shortlist
  shortlist: {
    list: '/shortlist',
    create: '/shortlist',
    update: (id: number) => `/shortlist/${id}`,
    delete: (id: number) => `/shortlist/${id}`,
    createFromEnquiry: '/shortlist/from-enquiry',
  },
  
  // Staff
  staff: {
    list: '/staff',
    create: '/staff',
    update: (id: number) => `/staff/${id}`,
    delete: (id: number) => `/staff/${id}`,
    verify: (id: number) => `/staff/verify/${id}`,
    resendVerification: (id: number) => `/staff/resend-verification/${id}`,
  },
  
  // Payments
  payments: {
    list: '/cashfree',
    create: '/cashfree/apply',
    update: (id: number) => `/cashfree/${id}`,
    updateStatus: (id: number) => `/cashfree/${id}/status`,
  },
  
  // Transactions
  transactions: {
    list: '/transactions',
    create: '/transactions',
    update: (id: number) => `/transactions/${id}`,
  },
  
  // Notifications
  notifications: {
    list: '/notifications',
    count: '/notifications/count',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/mark-all-read',
    delete: (id: string) => `/notifications/${id}`,
  },
  
  // Dashboard
  dashboard: {
    stats: '/dashboard/stats',
    recent: '/dashboard/recent',
  },
};

// Helper functions for common API operations
export const apiHelpers = {
  // Get with error handling
  async get(url: string, params?: any) {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },
  
  // Post with error handling
  async post(url: string, data?: any) {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },
  
  // Put with error handling
  async put(url: string, data?: any) {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },
  
  // Delete with error handling
  async delete(url: string) {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  },
};

export default api;
