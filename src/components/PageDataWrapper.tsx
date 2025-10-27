import React, { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import { renderDataPersistence } from '../services/renderDataPersistence';
import DataRefreshButton from './DataRefreshButton';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PageDataWrapperProps {
  children: React.ReactNode;
  modules: string[];
  showRefreshButton?: boolean;
  className?: string;
}

const PageDataWrapper: React.FC<PageDataWrapperProps> = ({
  children,
  modules,
  showRefreshButton = true,
  className = ''
}) => {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Ensure data persistence service is initialized
    if (!renderDataPersistence) {
      console.warn('🔄 [PAGE-WRAPPER] RenderDataPersistence service not available');
      return;
    }

    // Set query client if not already set
    renderDataPersistence.setQueryClient(queryClient);

    // Preload specific modules for this page
    const preloadModules = async () => {
      setIsPreloading(true);
      setPreloadError(null);

      try {
        console.log(`🔄 [PAGE-WRAPPER] Preloading modules for page: ${modules.join(', ')}`);
        
        const modulePromises = modules.map(async (module) => {
          const endpoint = getModuleEndpoint(module);
          return renderDataPersistence.fetchModuleData(endpoint, module, []);
        });

        const results = await Promise.allSettled(modulePromises);
        
        // Log results
        results.forEach((result, index) => {
          const module = modules[index];
          if (result.status === 'fulfilled') {
            console.log(`✅ [PAGE-WRAPPER] ${module}: ${result.value.length} items loaded`);
          } else {
            console.error(`❌ [PAGE-WRAPPER] ${module}: Failed to load`, result.reason);
          }
        });

      } catch (error: any) {
        console.error('❌ [PAGE-WRAPPER] Failed to preload modules:', error);
        setPreloadError(error.message || 'Failed to load page data');
      } finally {
        setIsPreloading(false);
      }
    };

    preloadModules();
  }, [modules, queryClient]);

  const getModuleEndpoint = (module: string): string => {
    const endpoints: Record<string, string> = {
      enquiries: '/api/enquiries',
      documents: '/api/documents',
      shortlist: '/api/shortlist',
      staff: '/api/staff',
      payments: '/api/cashfree',
      transactions: '/api/transactions',
      notifications: '/api/notifications'
    };
    return endpoints[module] || `/api/${module}`;
  };

  if (isPreloading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Loading Page Data</h2>
            <p className="text-sm text-gray-500">
              Preparing {modules.join(', ')} data for optimal experience...
            </p>
            <div className="mt-4 text-xs text-gray-400">
              🔄 Render deployment optimization in progress
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (preloadError) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">Data Loading Issue</h2>
            <p className="text-sm text-gray-500 mb-4">
              {preloadError}
            </p>
            <div className="space-y-2">
              <DataRefreshButton 
                className="w-full justify-center"
                showText={true}
              />
              <p className="text-xs text-gray-400">
                The page will continue to work with cached data
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {showRefreshButton && (
        <div className="fixed top-4 right-4 z-50">
          <DataRefreshButton 
            module={modules.join(',')}
            className="shadow-lg"
            showText={false}
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default PageDataWrapper;
