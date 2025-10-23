import axios from 'axios';
import MockDataService from '../services/mockData.service';

// Determine the backend URL based on environment
const getBackendURL = () => {
  // Check for environment variable first (allows override)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Check if we're in production (Vercel deployment)
  if (import.meta.env.PROD) {
    // Try multiple backend URLs for production
    const productionBackends = [
      'https://business-loan-backend.onrender.com',
      'https://business-loan-api.onrender.com',
      'https://loan-backend-api.onrender.com'
    ];
    
    // For now, use the first one - we'll add health check logic later
    return productionBackends[0];
  }
  
  // Default to localhost for development
  return 'http://localhost:5002';
};

const BACKEND_URL = getBackendURL();

console.log('🔗 Backend URL configured:', BACKEND_URL);
console.log('📊 Updated deployment with all localhost data - v1.0.1');

// Show login credentials in production when using mock data
if (import.meta.env.PROD && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
  console.log('🔐 PRODUCTION LOGIN CREDENTIALS (EXACT LOCALHOST PASSWORDS):');
  console.log('👑 Admin: govindamarketing9998@gmail.com / pankil123');
  console.log('👑 Admin: admin@gmail.com / admin123');
  console.log('👑 Admin: newclientmgmt@gmail.com / harish123');
  console.log('👤 Employee: govindamanager9998@gmail.com / venkat123');
  console.log('👤 Employee: dinesh@gmail.com / dinesh123');
}

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
      console.error('🔍 Backend URL:', BACKEND_URL);
      console.error('🔍 Environment:', import.meta.env.PROD ? 'Production' : 'Development');
      
      // In production, show user-friendly error
      if (import.meta.env.PROD) {
        console.error('🚨 Production backend is not accessible. Please check deployment status.');
        // You could show a toast notification here
      }
    }
    
    return Promise.reject(error);
  }
);

// Enhanced API with mock data fallback
const apiWithFallback = {
  ...api,
  
  // Override get method to provide mock data fallback
  async get(url: string, config?: any) {
    try {
      return await api.get(url, config);
    } catch (error: any) {
      // Check if we should use mock data in production
      const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      const isNetworkError = error.code === 'ECONNREFUSED' || error.message.includes('Network Error');
      
      if (import.meta.env.PROD && useMockData && isNetworkError) {
        console.log('🔄 Backend not available, using mock data for:', url);
        return this.getMockData(url);
      }
      
      throw error;
    }
  },

  // Override post method to handle authentication
  async post(url: string, data?: any, config?: any) {
    try {
      return await api.post(url, data, config);
    } catch (error: any) {
      // Check if we should use mock data in production
      const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      const isNetworkError = error.code === 'ECONNREFUSED' || error.message.includes('Network Error');
      
      if (import.meta.env.PROD && useMockData && isNetworkError) {
        console.log('🔄 Backend not available, using mock authentication for:', url);
        return this.getMockPostData(url, data);
      }
      
      throw error;
    }
  },

  // Override other HTTP methods for completeness
  async put(url: string, data?: any, config?: any) {
    try {
      return await api.put(url, data, config);
    } catch (error: any) {
      const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      const isNetworkError = error.code === 'ECONNREFUSED' || error.message.includes('Network Error');
      
      if (import.meta.env.PROD && useMockData && isNetworkError) {
        console.log('🔄 Backend not available, using mock response for PUT:', url);
        return { status: 200, statusText: 'OK', config: { url }, data: { message: 'Updated successfully', ...data } };
      }
      
      throw error;
    }
  },

  async patch(url: string, data?: any, config?: any) {
    try {
      return await api.patch(url, data, config);
    } catch (error: any) {
      const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      const isNetworkError = error.code === 'ECONNREFUSED' || error.message.includes('Network Error');
      
      if (import.meta.env.PROD && useMockData && isNetworkError) {
        console.log('🔄 Backend not available, using mock response for PATCH:', url);
        return { status: 200, statusText: 'OK', config: { url }, data: { message: 'Updated successfully', ...data } };
      }
      
      throw error;
    }
  },

  async delete(url: string, config?: any) {
    try {
      return await api.delete(url, config);
    } catch (error: any) {
      const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      const isNetworkError = error.code === 'ECONNREFUSED' || error.message.includes('Network Error');
      
      if (import.meta.env.PROD && useMockData && isNetworkError) {
        console.log('🔄 Backend not available, using mock response for DELETE:', url);
        return { status: 200, statusText: 'OK', config: { url }, data: { message: 'Deleted successfully' } };
      }
      
      throw error;
    }
  },
  
  // Mock data mapper
  getMockData(url: string) {
    const mockResponse = { status: 200, statusText: 'OK', config: { url } };
    
    if (url.includes('/api/enquiries')) {
      return { ...mockResponse, data: MockDataService.getEnquiries() };
    }
    
    if (url.includes('/api/documents')) {
      if (url.includes('/enquiry/')) {
        const enquiryId = parseInt(url.split('/enquiry/')[1]);
        const documents = MockDataService.getDocuments().filter(d => d.enquiryId === enquiryId);
        return { ...mockResponse, data: documents };
      }
      return { ...mockResponse, data: MockDataService.getDocuments() };
    }
    
    if (url.includes('/api/shortlist')) {
      return { ...mockResponse, data: MockDataService.getShortlist() };
    }
    
    if (url.includes('/api/cashfree')) {
      return { ...mockResponse, data: MockDataService.getPaymentGateway() };
    }
    
    if (url.includes('/api/staff')) {
      if (url.includes('/stats')) {
        const stats = MockDataService.getDashboardStats();
        return { ...mockResponse, data: { totalStaff: stats.totalStaff, activeStaff: stats.activeStaff } };
      }
      return { ...mockResponse, data: { staff: MockDataService.getStaff() } };
    }
    
    if (url.includes('/api/transactions')) {
      return { ...mockResponse, data: MockDataService.getTransactions() };
    }
    
    if (url.includes('/api/notifications')) {
      if (url.includes('/count')) {
        const notifications = MockDataService.getNotifications();
        return { ...mockResponse, data: { unreadCount: notifications.filter(n => !n.read).length } };
      }
      return { ...mockResponse, data: { notifications: MockDataService.getNotifications(), count: MockDataService.getNotifications().length } };
    }
    
    // Dashboard stats
    if (url.includes('/dashboard') || url.includes('/stats')) {
      return { ...mockResponse, data: MockDataService.getDashboardStats() };
    }
    
    // Default empty response
    console.warn('🤷 No mock data available for:', url);
    return { ...mockResponse, data: [] };
  },

  // Mock POST data handler (for authentication, etc.)
  getMockPostData(url: string, data?: any) {
    const mockResponse = { status: 200, statusText: 'OK', config: { url } };
    
    // Handle authentication endpoints
    if (url.includes('/api/auth/login')) {
      console.log('🔐 Mock authentication attempt for:', data?.email);
      
      if (!data?.email || !data?.password) {
        throw new Error('Email and password are required');
      }
      
      const authResult = MockDataService.authenticateStaff(data.email, data.password);
      
      if (!authResult) {
        const error = new Error('Invalid credentials');
        (error as any).response = { status: 403, data: { message: 'Invalid credentials' } };
        throw error;
      }
      
      console.log('✅ Mock authentication successful for:', authResult.user.name);
      return { ...mockResponse, data: authResult };
    }
    
    // Handle other POST endpoints that might need mock responses
    if (url.includes('/api/enquiries')) {
      // Mock enquiry creation
      const newEnquiry = {
        id: Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { ...mockResponse, data: newEnquiry };
    }
    
    // Default success response for other POST requests
    console.log('🔄 Mock POST response for:', url);
    return { ...mockResponse, data: { message: 'Success', ...data } };
  }
};

export default apiWithFallback;
