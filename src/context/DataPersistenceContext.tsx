import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { usePreloadData, useRefreshAllData } from '../hooks/useDataPersistence';
import { QUERY_KEYS } from '../utils/queryKeys';

interface DataPersistenceContextType {
  isDataLoaded: boolean;
  isLoading: boolean;
  refreshAllData: () => Promise<void>;
  preloadAllData: () => Promise<void>;
  lastRefresh: Date | null;
}

const DataPersistenceContext = createContext<DataPersistenceContextType | undefined>(undefined);

export const useDataPersistence = () => {
  const context = useContext(DataPersistenceContext);
  if (!context) {
    throw new Error('useDataPersistence must be used within a DataPersistenceProvider');
  }
  return context;
};

interface DataPersistenceProviderProps {
  children: React.ReactNode;
}

export const DataPersistenceProvider: React.FC<DataPersistenceProviderProps> = ({ children }) => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  const queryClient = useQueryClient();
  const { preloadAllData } = usePreloadData();
  const { refreshAllData } = useRefreshAllData();

  // Initialize data on app start
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Initializing data persistence...');
      setIsLoading(true);
      
      try {
        // Check if we have cached data
        const cachedEnquiries = queryClient.getQueryData(QUERY_KEYS.ENQUIRIES);
        const cachedStaff = queryClient.getQueryData(QUERY_KEYS.STAFF);
        
        if (cachedEnquiries && cachedStaff) {
          console.log('📦 Using cached data');
          setIsDataLoaded(true);
        } else {
          console.log('⚡ Preloading fresh data...');
          await preloadAllData();
          setIsDataLoaded(true);
        }
        
        setLastRefresh(new Date());
        console.log('✅ Data persistence initialized');
      } catch (error) {
        console.error('❌ Failed to initialize data:', error);
        // Still mark as loaded to prevent infinite loading
        setIsDataLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [queryClient, preloadAllData]);

  // Enhanced refresh function
  const handleRefreshAllData = async () => {
    console.log('🔄 Refreshing all application data...');
    setIsLoading(true);
    
    try {
      await refreshAllData();
      setLastRefresh(new Date());
      console.log('✅ All data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced preload function
  const handlePreloadAllData = async () => {
    console.log('⚡ Preloading all application data...');
    setIsLoading(true);
    
    try {
      await preloadAllData();
      setIsDataLoaded(true);
      setLastRefresh(new Date());
      console.log('✅ All data preloaded successfully');
    } catch (error) {
      console.error('❌ Failed to preload data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh data every 10 minutes for Render deployment
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('⏰ Auto-refreshing data for Render deployment...');
      await handleRefreshAllData();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Connection restored, refreshing data...');
      await handleRefreshAllData();
    };

    const handleOffline = () => {
      console.log('📴 Connection lost, using cached data...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for visibility change (tab focus)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && isDataLoaded) {
        // Only refresh if it's been more than 5 minutes since last refresh
        const now = new Date();
        const timeSinceLastRefresh = lastRefresh ? now.getTime() - lastRefresh.getTime() : Infinity;
        
        if (timeSinceLastRefresh > 5 * 60 * 1000) { // 5 minutes
          console.log('👁️ Tab focused, refreshing stale data...');
          await handleRefreshAllData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isDataLoaded, lastRefresh]);

  const value: DataPersistenceContextType = {
    isDataLoaded,
    isLoading,
    refreshAllData: handleRefreshAllData,
    preloadAllData: handlePreloadAllData,
    lastRefresh,
  };

  return (
    <DataPersistenceContext.Provider value={value}>
      {children}
    </DataPersistenceContext.Provider>
  );
};
