import { QueryClient } from 'react-query';
import api from '../lib/api';

/**
 * Render Data Persistence Service
 * Ensures all modules maintain data visibility across page refreshes, 
 * login/logout, and server restarts in Render deployment
 */

export interface ModuleData {
  enquiries: any[];
  documents: any[];
  shortlist: any[];
  staff: any[];
  payments: any[];
  transactions: any[];
  notifications: any[];
}

export interface DataPersistenceConfig {
  staleTime: number;
  cacheTime: number;
  refetchInterval: number;
  retryAttempts: number;
  retryDelay: number;
}

class RenderDataPersistenceService {
  private queryClient: QueryClient | null = null;
  private isRenderEnvironment: boolean = false;
  private persistenceConfig: DataPersistenceConfig;

  constructor() {
    // Detect Render environment
    this.isRenderEnvironment = 
      process.env.NODE_ENV === 'production' && 
      (window.location.hostname.includes('render.com') || 
       window.location.hostname.includes('onrender.com'));

    // Enhanced configuration for Render deployment
    this.persistenceConfig = {
      staleTime: this.isRenderEnvironment ? 8 * 60 * 1000 : 5 * 60 * 1000, // 8 minutes in Render, 5 minutes locally
      cacheTime: this.isRenderEnvironment ? 45 * 60 * 1000 : 30 * 60 * 1000, // 45 minutes in Render, 30 minutes locally
      refetchInterval: this.isRenderEnvironment ? 3 * 60 * 1000 : 5 * 60 * 1000, // 3 minutes in Render, 5 minutes locally
      retryAttempts: this.isRenderEnvironment ? 5 : 3, // More retries in Render
      retryDelay: this.isRenderEnvironment ? 2000 : 1000 // Longer delay in Render
    };

    console.log('🔄 [RENDER-PERSISTENCE] Service initialized:', {
      environment: this.isRenderEnvironment ? 'RENDER' : 'LOCAL',
      config: this.persistenceConfig
    });
  }

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
    console.log('🔄 [RENDER-PERSISTENCE] QueryClient attached');
  }

  /**
   * Get optimized React Query configuration for Render deployment
   */
  getQueryConfig(moduleName: string, customConfig?: Partial<DataPersistenceConfig>) {
    const config = { ...this.persistenceConfig, ...customConfig };
    
    return {
      staleTime: config.staleTime,
      cacheTime: config.cacheTime,
      refetchInterval: config.refetchInterval,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      keepPreviousData: true, // Critical for preventing blank pages
      suspense: false,
      retry: (failureCount: number, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          console.log(`🔄 [RENDER-PERSISTENCE] ${moduleName}: Not retrying 4xx error`);
          return false;
        }
        // Retry network errors and 5xx errors
        const shouldRetry = failureCount < config.retryAttempts;
        console.log(`🔄 [RENDER-PERSISTENCE] ${moduleName}: Retry ${failureCount}/${config.retryAttempts}, will retry: ${shouldRetry}`);
        return shouldRetry;
      },
      retryDelay: (attemptIndex: number) => {
        const delay = Math.min(config.retryDelay * 2 ** attemptIndex, 30000);
        console.log(`⏳ [RENDER-PERSISTENCE] ${moduleName}: Retry ${attemptIndex + 1} in ${delay}ms`);
        return delay;
      },
      onSuccess: (data: any) => {
        console.log(`✅ [RENDER-PERSISTENCE] ${moduleName}: Data loaded successfully`, {
          count: Array.isArray(data) ? data.length : (data?.length || 'N/A'),
          timestamp: new Date().toLocaleTimeString(),
          environment: this.isRenderEnvironment ? 'RENDER' : 'LOCAL'
        });
      },
      onError: (error: any) => {
        console.error(`❌ [RENDER-PERSISTENCE] ${moduleName}: Data load error`, {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    };
  }

  /**
   * Fetch data with enhanced error handling and fallbacks
   */
  async fetchModuleData(endpoint: string, moduleName: string, fallbackData: any[] = []): Promise<any[]> {
    try {
      console.log(`🔄 [RENDER-PERSISTENCE] ${moduleName}: Fetching from ${endpoint}...`);
      
      const response = await api.get(endpoint);
      const data = response.data || fallbackData;
      
      console.log(`✅ [RENDER-PERSISTENCE] ${moduleName}: Fetched ${Array.isArray(data) ? data.length : 'N/A'} items`);
      
      return Array.isArray(data) ? data : fallbackData;
    } catch (error: any) {
      console.error(`❌ [RENDER-PERSISTENCE] ${moduleName}: Fetch error`, {
        endpoint,
        error: error.message,
        status: error.response?.status
      });
      
      // Return cached data if available
      if (this.queryClient) {
        const cachedData = this.queryClient.getQueryData([moduleName]);
        if (cachedData && Array.isArray(cachedData)) {
          console.log(`🔄 [RENDER-PERSISTENCE] ${moduleName}: Using cached data (${cachedData.length} items)`);
          return cachedData;
        }
      }
      
      return fallbackData;
    }
  }

  /**
   * Preload all module data to prevent blank pages
   */
  async preloadAllModules(): Promise<ModuleData> {
    console.log('🚀 [RENDER-PERSISTENCE] Preloading all modules...');
    
    const [enquiries, documents, shortlist, staff, payments, transactions, notifications] = await Promise.allSettled([
      this.fetchModuleData('/api/enquiries', 'enquiries', []),
      this.fetchModuleData('/api/documents', 'documents', []),
      this.fetchModuleData('/api/shortlist', 'shortlist', []),
      this.fetchModuleData('/api/staff', 'staff', []),
      this.fetchModuleData('/api/cashfree', 'payments', []),
      this.fetchModuleData('/api/transactions', 'transactions', []),
      this.fetchModuleData('/api/notifications', 'notifications', [])
    ]);

    const moduleData: ModuleData = {
      enquiries: enquiries.status === 'fulfilled' ? enquiries.value : [],
      documents: documents.status === 'fulfilled' ? documents.value : [],
      shortlist: shortlist.status === 'fulfilled' ? shortlist.value : [],
      staff: staff.status === 'fulfilled' ? this.extractStaffData(staff.value) : [],
      payments: payments.status === 'fulfilled' ? payments.value : [],
      transactions: transactions.status === 'fulfilled' ? transactions.value : [],
      notifications: notifications.status === 'fulfilled' ? this.extractNotificationsData(notifications.value) : []
    };

    // Prefill query cache with loaded data
    if (this.queryClient) {
      this.queryClient.setQueryData(['enquiries'], moduleData.enquiries);
      this.queryClient.setQueryData(['documents'], moduleData.documents);
      this.queryClient.setQueryData(['shortlist'], moduleData.shortlist);
      this.queryClient.setQueryData(['staff'], moduleData.staff);
      this.queryClient.setQueryData(['payments'], moduleData.payments);
      this.queryClient.setQueryData(['transactions'], moduleData.transactions);
      this.queryClient.setQueryData(['notifications'], moduleData.notifications);
    }

    console.log('✅ [RENDER-PERSISTENCE] All modules preloaded:', {
      enquiries: moduleData.enquiries.length,
      documents: moduleData.documents.length,
      shortlist: moduleData.shortlist.length,
      staff: moduleData.staff.length,
      payments: moduleData.payments.length,
      transactions: moduleData.transactions.length,
      notifications: moduleData.notifications.length
    });

    return moduleData;
  }

  /**
   * Force refresh all modules
   */
  async refreshAllModules(): Promise<void> {
    if (!this.queryClient) {
      console.warn('🔄 [RENDER-PERSISTENCE] QueryClient not available for refresh');
      return;
    }

    console.log('🔄 [RENDER-PERSISTENCE] Force refreshing all modules...');

    await Promise.all([
      this.queryClient.invalidateQueries(['enquiries']),
      this.queryClient.invalidateQueries(['documents']),
      this.queryClient.invalidateQueries(['shortlist']),
      this.queryClient.invalidateQueries(['staff']),
      this.queryClient.invalidateQueries(['payments']),
      this.queryClient.invalidateQueries(['transactions']),
      this.queryClient.invalidateQueries(['notifications']),
      this.queryClient.invalidateQueries(['dashboard-data'])
    ]);

    console.log('✅ [RENDER-PERSISTENCE] All modules refreshed');
  }

  /**
   * Handle authentication state changes
   */
  async handleAuthChange(isLoggedIn: boolean, user?: any): Promise<void> {
    console.log('🔐 [RENDER-PERSISTENCE] Auth state changed:', { isLoggedIn, user: user?.name });

    if (!this.queryClient) return;

    if (isLoggedIn && user) {
      // User logged in - preload all data
      await this.preloadAllModules();
    } else {
      // User logged out - clear all cached data
      this.queryClient.clear();
      console.log('🔐 [RENDER-PERSISTENCE] Cache cleared on logout');
    }
  }

  /**
   * Get fallback data for each module to prevent blank pages
   */
  getFallbackData(moduleName: string): any[] {
    const fallbacks = {
      enquiries: [],
      documents: [],
      shortlist: [],
      staff: [
        { id: 1, name: 'Perivi', email: 'gowthaamankrishna1998@gmail.com', role: 'ADMIN', department: 'Management' },
        { id: 2, name: 'Venkat', email: 'gowthaamaneswar1998@gmail.com', role: 'EMPLOYEE', department: 'Operations' },
        { id: 3, name: 'Harish', email: 'newacttmis@gmail.com', role: 'ADMIN', department: 'Client Management' }
      ],
      payments: [],
      transactions: [],
      notifications: []
    };

    return fallbacks[moduleName as keyof typeof fallbacks] || [];
  }

  /**
   * Extract staff data from API response
   */
  private extractStaffData(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && data.staff) {
      return Array.isArray(data.staff) ? data.staff : [];
    }
    return [];
  }

  /**
   * Extract notifications data from API response
   */
  private extractNotificationsData(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && data.notifications) {
      return Array.isArray(data.notifications) ? data.notifications : [];
    }
    return [];
  }

  /**
   * Check if data should be refreshed based on last update time
   */
  shouldRefreshData(queryKey: string): boolean {
    if (!this.queryClient) return true;

    const queryState = this.queryClient.getQueryState([queryKey]);
    if (!queryState?.dataUpdatedAt) return true;

    const timeSinceUpdate = Date.now() - queryState.dataUpdatedAt;
    const shouldRefresh = timeSinceUpdate > this.persistenceConfig.staleTime;

    console.log(`🔄 [RENDER-PERSISTENCE] ${queryKey}: Should refresh? ${shouldRefresh} (${Math.round(timeSinceUpdate / 1000)}s since update)`);
    
    return shouldRefresh;
  }
}

// Export singleton instance
export const renderDataPersistence = new RenderDataPersistenceService();
export default renderDataPersistence;
