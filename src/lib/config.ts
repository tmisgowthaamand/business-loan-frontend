// Configuration utility for backend URL
export const getBackendURL = () => {
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

export const BACKEND_URL = getBackendURL();

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  const baseUrl = getBackendURL();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};
