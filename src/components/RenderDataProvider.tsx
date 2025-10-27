import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { renderDataPersistence } from '../services/renderDataPersistence';
import { crossModuleSync } from '../services/crossModuleSync';

interface RenderDataContextType {
  isReady: boolean;
  refreshAllData: () => Promise<void>;
  getModuleStatus: (module: string) => boolean;
  forceSync: () => Promise<void>;
}

const RenderDataContext = createContext<RenderDataContextType | null>(null);

export const useRenderData = () => {
  const context = useContext(RenderDataContext);
  if (!context) {
    throw new Error('useRenderData must be used within RenderDataProvider');
  }
  return context;
};

interface RenderDataProviderProps {
  children: React.ReactNode;
}

export const RenderDataProvider: React.FC<RenderDataProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeServices = async () => {
      console.log('🚀 [RENDER-DATA-PROVIDER] Initializing all data services...');
      
      try {
        // Initialize persistence service
        renderDataPersistence.setQueryClient(queryClient);
        
        // Initialize cross-module sync
        crossModuleSync.setQueryClient(queryClient);
        
        // Preload critical data
        await renderDataPersistence.preloadAllModules();
        
        setIsReady(true);
        console.log('✅ [RENDER-DATA-PROVIDER] All services ready');
        
      } catch (error) {
        console.error('❌ [RENDER-DATA-PROVIDER] Initialization failed:', error);
        // Still set ready to true to allow app to function with cached data
        setIsReady(true);
      }
    };

    initializeServices();
  }, [queryClient]);

  const refreshAllData = async () => {
    console.log('🔄 [RENDER-DATA-PROVIDER] Refreshing all data...');
    await renderDataPersistence.refreshAllModules();
  };

  const getModuleStatus = (module: string): boolean => {
    // Check if module data is available in cache
    const cached = queryClient.getQueryData([module]);
    return !!cached;
  };

  const forceSync = async () => {
    console.log('🔄 [RENDER-DATA-PROVIDER] Force syncing all modules...');
    await crossModuleSync.forceSyncAll();
  };

  const contextValue: RenderDataContextType = {
    isReady,
    refreshAllData,
    getModuleStatus,
    forceSync
  };

  return (
    <RenderDataContext.Provider value={contextValue}>
      {children}
    </RenderDataContext.Provider>
  );
};

export default RenderDataProvider;
