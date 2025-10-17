import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import './i18n/index'; // Initialize i18n

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data persistence settings
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      cacheTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
      
      // Refetch behavior
      refetchOnWindowFocus: true, // Refresh when user returns to tab
      refetchOnMount: true, // Always fetch fresh data on component mount
      refetchOnReconnect: true, // Refetch when internet reconnects
      
      // Background updates
      refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
      refetchIntervalInBackground: false, // Don't refresh when tab is not active
      
      // Error handling
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Keep previous data while fetching new data (prevents blank pages)
      keepPreviousData: true,
      
      // Prevent unnecessary network requests
      notifyOnChangeProps: ['data', 'error', 'isLoading'],
    },
    mutations: {
      retry: 1,
      // Optimistic updates for better UX
      onMutate: async () => {
        // Cancel any outgoing refetches so they don't overwrite optimistic update
        await queryClient.cancelQueries();
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <AppRoutes />
              <Toaster position="top-right" />
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
