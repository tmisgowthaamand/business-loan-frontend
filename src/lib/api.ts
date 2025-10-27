import axios from 'axios';
import MockDataService from '../services/mockData.service';
import { SecureTokenStorage } from '../utils/secureTokenStorage';
import { SecureLogger } from '../utils/secureLogger';
import { RequestIntegrity } from '../utils/requestIntegrity';

// Secure environment-based configuration
const getBackendURL = () => {
  // Validate environment variables
  const envBackendUrl = import.meta.env.VITE_BACKEND_URL;
  const isProd = import.meta.env.PROD;
  const isDev = import.meta.env.DEV;
  
  // Check for environment variable first (allows override)
  if (envBackendUrl) {
    // Validate URL format for security
    if (isValidUrl(envBackendUrl)) {
      SecureLogger.log('🔗 Using environment variable backend URL');
      return envBackendUrl;
    } else {
      SecureLogger.error('🚨 Invalid VITE_BACKEND_URL format, falling back to default');
    }
  }
  
  // Production configuration
  if (isProd) {
    const renderBackendURL = 'https://business-loan-backend.onrender.com';
    SecureLogger.log('🔗 Production mode - using secure backend');
    return renderBackendURL;
  }
  
  // Development configuration
  if (isDev) {
    const localURL = 'http://localhost:5002';
    SecureLogger.log('🔗 Development mode - using localhost');
    console.log('🔍 Backend URL configured as:', localURL);
    return localURL;
  }
  
  // Fallback
  throw new Error('Unable to determine backend URL - check environment configuration');
};

// URL validation helper
const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

const BACKEND_URL = getBackendURL();

// Production-safe initialization logging
SecureLogger.log('🔗 Backend URL configured');
SecureLogger.log('📊 Dashboard system ready for deployment - v2.0.0');
SecureLogger.log('🚀 Environment initialized', {
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  timestamp: new Date().toISOString()
});

// Test backend connectivity
const testBackendConnectivity = async () => {
  try {
    console.log('🔍 Testing backend connectivity to:', BACKEND_URL);
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (response.ok) {
      console.log('✅ Backend connectivity test successful');
      return true;
    } else {
      console.error('❌ Backend connectivity test failed - Status:', response.status);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Backend connectivity test failed - Error:', error.message);
    console.error('🔍 Possible causes:');
    console.error('   - Backend server not running on port 5002');
    console.error('   - CORS configuration issue');
    console.error('   - Network connectivity problem');
    return false;
  }
};

// Run connectivity test on initialization
testBackendConnectivity();

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
    // Add security headers and integrity checks
    config = RequestIntegrity.addSecurityHeaders(config);
    
    const fullURL = `${config.baseURL || window.location.origin}${config.url}`;
    SecureLogger.apiLog(
      config.method?.toUpperCase() || 'GET',
      config.url || '',
      undefined,
      { fullURL, timestamp: new Date().toISOString() }
    );
    
    // Enhanced auth token handling for Render deployment
    const isSupabaseEndpoint = config.url?.includes('/api/supabase/');
    const isMockEndpoint = config.url?.includes('/api/mock/');
    const isHealthEndpoint = config.url?.includes('/health');
    const isDashboardEndpoint = config.url?.includes('/api/dashboard');
    
    if (!isSupabaseEndpoint && !isMockEndpoint && !isHealthEndpoint && !isDashboardEndpoint) {
      const token = SecureTokenStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        
        // Add CSRF token for state-changing operations
        if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
          const csrfToken = SecureTokenStorage.getCSRFToken();
          if (csrfToken) {
            config.headers['X-CSRF-Token'] = csrfToken;
          }
        }
        
        SecureLogger.debug('🔑 [RENDER] Added auth token to request');
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log('ℹ️ [RENDER] No auth token found - using demo mode');
        }
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.log('ℹ️ [RENDER] Skipping auth token for endpoint:', config.url);
      }
    }
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors with enhanced Render logging
api.interceptors.response.use(
  (response) => {
    // Validate response integrity
    RequestIntegrity.validateResponse(response);
    
    // Sanitize response data
    response.data = RequestIntegrity.sanitizeResponse(response.data);
    
    SecureLogger.apiLog(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      response.status,
      {
        statusText: response.statusText,
        dataLength: Array.isArray(response.data) ? response.data.length : typeof response.data,
        timestamp: new Date().toISOString()
      }
    );
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
        SecureTokenStorage.removeToken();
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
