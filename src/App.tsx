import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import { RenderDataProvider } from './components/RenderDataProvider';
import './utils/runDataTests'; // Initialize browser testing utilities
import './i18n'; // Initialize i18n

// Render-optimized React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Enhanced data persistence settings for Render deployment
      staleTime: 5 * 60 * 1000, // 5 minutes - longer stale time for better persistence
      cacheTime: 30 * 60 * 1000, // 30 minutes - extended cache for Render deployment
      
      // Render-optimized refetch behavior
      refetchOnWindowFocus: true, // Refresh when user returns to tab
      refetchOnMount: true, // Always fetch fresh data on component mount
      refetchOnReconnect: true, // Refetch when internet reconnects
      
      // Background updates optimized for Render cold starts and data persistence
      refetchInterval: 3 * 60 * 1000, // Auto-refresh every 3 minutes (optimized for Render)
      refetchIntervalInBackground: false, // Don't refresh when tab is not active
      
      // Enhanced data persistence - prevent data loss
      suspense: false,
      useErrorBoundary: false,
      
      // Enhanced error handling for Render deployment
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network errors and 5xx errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff optimized for Render cold starts
        const delay = Math.min(1000 * 2 ** attemptIndex, 15000);
        console.log(`⏳ [RENDER] Query retry ${attemptIndex + 1} in ${delay}ms`);
        return delay;
      },
      
      // Keep previous data while fetching new data (prevents blank pages)
      keepPreviousData: true,
      
      // Prevent unnecessary network requests
      notifyOnChangeProps: ['data', 'error', 'isLoading'],
      
      // Global error handler for Render deployment
      onError: (error: any) => {
        console.error('❌ [RENDER] Global query error:', {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          timestamp: new Date().toISOString()
        });
      },
      
      // Global success handler for monitoring
      onSuccess: (data: any) => {
        console.log('✅ [RENDER] Global query success:', {
          dataType: Array.isArray(data) ? 'array' : typeof data,
          length: Array.isArray(data) ? data.length : 'N/A',
          timestamp: new Date().toISOString()
        });
      }
    },
    mutations: {
      // Enhanced mutation configuration for Render
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry once for network errors
        return failureCount < 1;
      },
      retryDelay: 2000, // 2 second delay for mutation retries
      
      // Enhanced optimistic updates for better UX
      onMutate: async () => {
        console.log('🚀 [RENDER] Mutation starting - canceling queries');
        // Cancel any outgoing refetches so they don't overwrite optimistic update
        await queryClient.cancelQueries();
      },
      
      // Global mutation error handler
      onError: (error: any) => {
        console.error('❌ [RENDER] Global mutation error:', {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          timestamp: new Date().toISOString()
        });
      },
      
      // Global mutation success handler
      onSuccess: (data: any) => {
        console.log('✅ [RENDER] Global mutation success:', {
          dataType: typeof data,
          timestamp: new Date().toISOString()
        });
      }
    },
  },
});

// Enhanced logging for Render deployment
console.log('🚀 [RENDER] React Query client initialized with Render-optimized configuration');
console.log('📊 [RENDER] Query settings:', {
  staleTime: '3 minutes',
  cacheTime: '20 minutes',
  refetchInterval: '2 minutes',
  retryAttempts: '3 (with smart error handling)',
  timestamp: new Date().toISOString()
});

function App() {
  console.log('🏠 [RENDER] App component initializing with enhanced data persistence...');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RenderDataProvider>
          <AuthProvider>
            <NotificationProvider>
              <BrowserRouter>
                <AppRoutes />
                <ScrollToTop />
                <Toaster 
                  position="top-right" 
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#4ade80',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </BrowserRouter>
            </NotificationProvider>
          </AuthProvider>
        </RenderDataProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
