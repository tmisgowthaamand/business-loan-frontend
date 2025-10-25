import axios from 'axios';
import MockDataService from '../services/mockData.service';

// Determine the backend URL based on environment
const getBackendURL = () => {
  // Check for environment variable first (allows override)
  if (import.meta.env.VITE_BACKEND_URL) {
    console.log('🔗 Using environment variable backend URL:', import.meta.env.VITE_BACKEND_URL);
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Check if we're in production (Vercel/Netlify deployment)
  if (import.meta.env.PROD) {
    // Primary Render backend URL for production
    const renderBackendURL = 'https://business-loan-backend.onrender.com';
    console.log('🔗 Production mode - using Render backend:', renderBackendURL);
    return renderBackendURL;
  }
  
  // Default to localhost for development
  const localURL = 'http://localhost:5002';
  console.log('🔗 Development mode - using localhost:', localURL);
  return localURL;
};

const BACKEND_URL = getBackendURL();

console.log('🔗 [RENDER] Backend URL configured:', BACKEND_URL);
console.log('📊 [RENDER] Dashboard system ready for deployment - v2.0.0');
console.log('🚀 [RENDER] Environment:', {
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  backendURL: BACKEND_URL,
  timestamp: new Date().toISOString()
});

// Credentials removed for security - contact admin for login details

// Create axios instance with Render-optimized configuration
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 90000, // Increased timeout to 90 seconds for Render cold starts
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache', // Prevent caching issues
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false,
  // Render-specific retry configuration
  validateStatus: (status) => {
    // Accept 2xx and 3xx status codes, and specific 4xx for auth
    return (status >= 200 && status < 400) || status === 401 || status === 403;
  }
});

// Request interceptor to add auth token and enhanced logging
api.interceptors.request.use(
  (config) => {
    const fullURL = `${config.baseURL || window.location.origin}${config.url}`;
    console.log('🔄 [RENDER] API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: fullURL,
      timestamp: new Date().toISOString()
    });
    
    // Enhanced auth token handling for Render deployment
    const isSupabaseEndpoint = config.url?.includes('/api/supabase/');
    const isMockEndpoint = config.url?.includes('/api/mock/');
    const isHealthEndpoint = config.url?.includes('/health');
    const isDashboardEndpoint = config.url?.includes('/api/dashboard');
    
    if (!isSupabaseEndpoint && !isMockEndpoint && !isHealthEndpoint && !isDashboardEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 [RENDER] Added auth token to request');
      } else {
        console.log('ℹ️ [RENDER] No auth token found - using demo mode');
      }
    } else {
      console.log('ℹ️ [RENDER] Skipping auth token for endpoint:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors with enhanced Render logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ [RENDER] API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      dataLength: Array.isArray(response.data) ? response.data.length : typeof response.data,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    console.error('❌ [RENDER] API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
      responseData: error.response?.data,
      timestamp: new Date().toISOString()
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
    
    // Enhanced network error handling for Render deployment
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
      console.error('🚫 [RENDER] Network Error: Backend server connection failed');
      console.error('🔍 [RENDER] Backend URL:', BACKEND_URL);
      console.error('🔍 [RENDER] Environment:', import.meta.env.PROD ? 'Production' : 'Development');
      console.error('🔍 [RENDER] Error details:', {
        code: error.code,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      });
      
      // In production, provide specific Render deployment guidance
      if (import.meta.env.PROD) {
        console.error('🚨 [RENDER] Production backend connection failed.');
        console.error('🔧 [RENDER] Possible causes:');
        console.error('   - Render service is cold starting (wait 30-60 seconds)');
        console.error('   - Backend deployment failed');
        console.error('   - Network connectivity issues');
      }
    }
    
    return Promise.reject(error);
  }
);

// Enhanced API with mock data fallback
const apiWithFallback = {
  ...api,
  
  // Override get method with enhanced Render error handling
  async get(url: string, config?: any) {
    try {
      console.log('🔄 [RENDER] GET request to:', url);
      const response = await api.get(url, config);
      console.log('✅ [RENDER] GET success for:', url, '- Data length:', Array.isArray(response.data) ? response.data.length : typeof response.data);
      return response;
    } catch (error: any) {
      console.error('❌ [RENDER] GET failed for:', url, '- Error:', error.message);
      
      // Check if we should use mock data in production
      const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      const isNetworkError = error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.code === 'ERR_NETWORK';
      
      if (import.meta.env.PROD && useMockData && isNetworkError) {
        console.log('🔄 [RENDER] Backend not available, using mock data for:', url);
        return this.getMockData(url);
      }
      
      throw error;
    }
  },

  // Override post method with enhanced Render retry logic
  async post(url: string, data?: any, config?: any) {
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🚀 [RENDER] POST attempt ${attempt}/${maxRetries} for:`, url);
        const response = await api.post(url, data, config);
        console.log(`✅ [RENDER] POST successful on attempt ${attempt}`);
        return response;
      } catch (error: any) {
        lastError = error;
        console.log(`⚠️ [RENDER] POST attempt ${attempt} failed:`, error.message);
        
        // Enhanced auth endpoint handling for Render
        if (url.includes('/auth/login') && (error.response?.status === 403 || error.response?.status === 401)) {
          console.log('🔄 [RENDER] Trying alternative auth endpoints...');
          
          try {
            // Try force-fresh-login endpoint
            if (!url.includes('force-fresh-login')) {
              const altResponse = await api.post('/api/auth/force-fresh-login', data, config);
              console.log('✅ [RENDER] Alternative auth successful');
              return altResponse;
            }
          } catch (altError) {
            console.log('⚠️ [RENDER] Alternative auth also failed:', altError.message);
          }
        }
        
        // Wait before retry (exponential backoff optimized for Render)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          console.log(`⏳ [RENDER] Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Check if we should use mock data as final fallback for Render
    const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
    const isNetworkError = lastError?.code === 'ECONNREFUSED' || lastError?.message.includes('Network Error') || lastError?.code === 'ERR_NETWORK';
    
    if (import.meta.env.PROD && useMockData && isNetworkError) {
      console.log('🔄 [RENDER] All retries failed, using mock authentication for:', url);
      return this.getMockPostData(url, data);
    }
    
    throw lastError;
  },

  // Override other HTTP methods for completeness
  async put(url: string, data?: any, config?: any) {
    try {
      return await api.put(url, data, config);
    } catch (error: any) {
      const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
      const isNetworkError = error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.code === 'ERR_NETWORK';
      
      if (import.meta.env.PROD && useMockData && isNetworkError) {
        console.log('🔄 [RENDER] Backend not available, using mock response for PUT:', url);
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
