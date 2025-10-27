import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useRefreshAllData } from '../hooks/useEnhancedQuery';
import { renderDataPersistence } from '../services/renderDataPersistence';

interface DataRefreshButtonProps {
  module?: string;
  className?: string;
  showText?: boolean;
}

const DataRefreshButton: React.FC<DataRefreshButtonProps> = ({ 
  module = 'all', 
  className = '',
  showText = true 
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const refreshAllData = useRefreshAllData();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log(`🔄 [RENDER-PERSISTENCE] Manual refresh triggered for: ${module}`);
    
    try {
      if (module === 'all') {
        await refreshAllData();
      } else {
        await renderDataPersistence.refreshAllModules();
      }
      console.log(`✅ [RENDER-PERSISTENCE] ${module} data refreshed successfully`);
    } catch (error) {
      console.error(`❌ [RENDER-PERSISTENCE] Failed to refresh ${module} data:`, error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={`Refresh ${module} data`}
    >
      <ArrowPathIcon 
        className={`h-4 w-4 ${showText ? 'mr-2' : ''} ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      {showText && (isRefreshing ? 'Refreshing...' : 'Refresh Data')}
    </button>
  );
};

export default DataRefreshButton;
