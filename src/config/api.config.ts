// Production-ready API configuration for Render and Vercel deployments

const getApiBaseUrl = (): string => {
  // Check if we're in production
  const isProduction = import.meta.env.PROD;
  const isDevelopment = import.meta.env.DEV;
  
  // Check for Vercel deployment
  const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
  
  // Environment-specific URLs
  if (isProduction || isVercel) {
    // Production: Use Render backend
    return 'https://business-loan-backend.onrender.com';
  }
  
  // Development: Use localhost
  return 'http://localhost:5002';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      VERIFY: '/api/auth/verify',
    },
    
    // Enquiries
    ENQUIRIES: {
      BASE: '/api/enquiries',
      CREATE: '/api/enquiries',
      LIST: '/api/enquiries',
      UPDATE: (id: number) => `/api/enquiries/${id}`,
      DELETE: (id: number) => `/api/enquiries/${id}`,
      ASSIGN_STAFF: (id: number) => `/api/enquiries/${id}/assign-staff`,
      SYNC_STATUS: '/api/enquiries/sync/status',
      SYNC_TO_SUPABASE: '/api/enquiries/sync/to-supabase',
    },
    
    // Documents
    DOCUMENTS: {
      BASE: '/api/documents',
      UPLOAD: '/api/documents/upload',
      LIST: '/api/documents',
      BY_ENQUIRY: (enquiryId: number) => `/api/documents/enquiry/${enquiryId}`,
      VIEW: (id: number) => `/api/documents/${id}/view`,
      VERIFY: (id: number) => `/api/documents/${id}/verify`,
      DELETE: (id: number) => `/api/documents/${id}`,
      REMOVE_DUPLICATES: (enquiryId: number) => `/api/documents/remove-duplicates/${enquiryId}`,
    },
    
    // Shortlist
    SHORTLIST: {
      BASE: '/api/shortlist',
      CREATE: '/api/shortlist',
      LIST: '/api/shortlist',
      UPDATE: (id: number) => `/api/shortlist/${id}`,
      DELETE: (id: number) => `/api/shortlist/${id}`,
      CREATE_FROM_ENQUIRY: '/api/shortlist/create-from-enquiry',
    },
    
    // Payment Gateway
    PAYMENT_GATEWAY: {
      BASE: '/api/cashfree',
      APPLY: '/api/cashfree/apply',
      LIST: '/api/cashfree/applications',
      UPDATE_STATUS: (id: number) => `/api/cashfree/${id}/status`,
    },
    
    // Staff Management
    STAFF: {
      BASE: '/api/staff',
      CREATE: '/api/staff',
      LIST: '/api/staff',
      UPDATE: (id: number) => `/api/staff/${id}`,
      DELETE: (id: number) => `/api/staff/${id}`,
      GRANT_ACCESS: (id: number) => `/api/staff/${id}/grant-access`,
      REVOKE_ACCESS: (id: number) => `/api/staff/${id}/revoke-access`,
      RESEND_VERIFICATION: (id: number) => `/api/staff/resend-verification/${id}`,
      STATS: '/api/staff/stats',
      TEST_EMAIL: '/api/staff/test/email',
      SYNC_STATUS: '/api/staff/sync/status',
      SYNC_TO_SUPABASE: '/api/staff/sync/to-supabase',
    },
    
    // Notifications
    NOTIFICATIONS: {
      BASE: '/api/notifications',
      LIST: '/api/notifications',
      COUNT: '/api/notifications/count',
      MARK_READ: (id: string) => `/api/notifications/${id}/read`,
      MARK_ALL_READ: '/api/notifications/mark-all-read',
      DELETE: (id: string) => `/api/notifications/${id}`,
      CREATE_TEST: '/api/notifications/test/create-sample',
    },
    
    // Transactions
    TRANSACTIONS: {
      BASE: '/api/transactions',
      CREATE: '/api/transactions',
      LIST: '/api/transactions',
      UPDATE: (id: number) => `/api/transactions/${id}`,
      DELETE: (id: number) => `/api/transactions/${id}`,
    },
    
    // Health Check
    HEALTH: {
      CHECK: '/api/health',
      PING: '/api/health/ping',
      ROOT: '/', // Root endpoint for API status
    },
  },
  
  // Request configuration
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper function to get full URL
export const getFullUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to check if we're in production
export const isProduction = (): boolean => {
  return import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'));
};

// Helper function to check if we're in development
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV && !(typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'));
};

// Export for debugging
export const debugApiConfig = () => {
  console.log('🔧 API Configuration:', {
    baseUrl: API_CONFIG.BASE_URL,
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    environment: import.meta.env.MODE,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  });
};

// Log configuration on import (only in development)
if (isDevelopment()) {
  debugApiConfig();
}
