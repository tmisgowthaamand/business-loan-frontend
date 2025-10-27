import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { DataPersistenceProvider } from './context/DataPersistenceContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Enhanced data persistence for Render deployment
      staleTime: 10 * 60 * 1000, // 10 minutes - longer stale time for better persistence
      cacheTime: 60 * 60 * 1000, // 60 minutes - extended cache for Render deployment
      
      // Optimized refetch behavior for Render deployment
      refetchOnWindowFocus: false, // Disable to prevent unnecessary requests
      refetchOnMount: 'always', // Always fetch on mount for fresh data
      refetchOnReconnect: true, // Refetch when internet reconnects
      refetchInterval: false, // Disable auto-refresh to reduce server load
      refetchIntervalInBackground: false, // Don't refresh when tab is not active
      
      // Enhanced data persistence - prevent data loss
      keepPreviousData: true, // Prevent blank pages during refetch
      suspense: false,
      
      // Enhanced retry logic for Render deployment
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Enhanced mutation settings for Render deployment
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DataPersistenceProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster position="top-right" />
            </BrowserRouter>
          </AuthProvider>
        </DataPersistenceProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
