import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import AutoRefreshTest from '../../components/Testing/AutoRefreshTest';

interface TestResult {
  endpoint: string;
  status: 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
  lastUpdated: string;
  dataCount?: number;
}

const RefreshTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const queryClient = useQueryClient();

  // Define test endpoints
  const testEndpoints = [
    { key: 'enquiries', endpoint: '/api/enquiries', label: 'Enquiries' },
    { key: 'shortlists', endpoint: '/api/shortlist', label: 'Shortlist' },
    { key: 'documents', endpoint: '/api/documents', label: 'Documents' },
    { key: 'staff', endpoint: '/api/staff', label: 'Staff' },
    { key: 'cashfree', endpoint: '/api/cashfree', label: 'Payment Gateway' },
  ];

  // Test each endpoint
  const testEndpoint = async (endpoint: string) => {
    try {
      const response = await api.get(endpoint);
      const data = response.data;
      
      return {
        endpoint,
        status: 'success' as const,
        data,
        lastUpdated: new Date().toLocaleTimeString(),
        dataCount: Array.isArray(data) ? data.length : Array.isArray(data?.staff) ? data.staff.length : undefined
      };
    } catch (error: any) {
      return {
        endpoint,
        status: 'error' as const,
        error: error.message,
        lastUpdated: new Date().toLocaleTimeString()
      };
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setTestResults(prev => prev.map(result => ({ ...result, status: 'loading' as const })));
    
    const results = await Promise.all(
      testEndpoints.map(({ endpoint }) => testEndpoint(endpoint))
    );
    
    setTestResults(results);
    setRefreshCount(prev => prev + 1);
    
    const successCount = results.filter(r => r.status === 'success').length;
    toast.success(`Test completed: ${successCount}/${results.length} endpoints working`);
  };

  // Initialize tests on mount
  useEffect(() => {
    runAllTests();
  }, []);

  // Auto-refresh every 30 seconds (matching global config)
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh triggered by test page');
      runAllTests();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAutoRefreshEnabled]);

  // Test React Query cache
  const { data: enquiriesCache } = useQuery('enquiries', () => api.get('/api/enquiries').then((r: any) => r.data), {
    staleTime: 3 * 60 * 1000,
    keepPreviousData: true,
  });

  const { data: shortlistCache } = useQuery('shortlists', () => api.get('/api/shortlist').then((r: any) => r.data), {
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true,
  });

  const { data: documentsCache } = useQuery('documents', () => api.get('/api/documents').then((r: any) => r.data), {
    staleTime: 8 * 60 * 1000,
    keepPreviousData: true,
  });

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'loading':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  const invalidateAllCaches = () => {
    const queryKeys = ['enquiries', 'shortlists', 'documents', 'staff', 'cashfree', 'dashboard-data'];
    
    queryKeys.forEach(key => {
      queryClient.invalidateQueries(key);
    });
    
    toast.success('All caches invalidated - data will refresh automatically');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Data Persistence & Auto-Refresh Test</h1>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAutoRefreshEnabled}
                onChange={(e) => setIsAutoRefreshEnabled(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
            </label>
            <span className="text-sm text-gray-500">Refreshes: {refreshCount}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={runAllTests}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Test All Endpoints
          </button>
          
          <button
            onClick={invalidateAllCaches}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Invalidate Caches
          </button>
        </div>
      </div>

      {/* API Endpoint Tests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoint Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testResults.map((result, index) => (
            <motion.div
              key={result.endpoint}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">
                  {testEndpoints.find(e => e.endpoint === result.endpoint)?.label || result.endpoint}
                </h3>
                {getStatusIcon(result.status)}
              </div>
              
              <p className="text-xs text-gray-600 mb-2">
                <code className="bg-gray-100 px-1 rounded">{result.endpoint}</code>
              </p>
              
              {result.status === 'success' && (
                <div className="space-y-1">
                  {result.dataCount !== undefined && (
                    <p className="text-sm text-green-700">
                      ✅ {result.dataCount} items found
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Last updated: {result.lastUpdated}
                  </p>
                </div>
              )}
              
              {result.status === 'error' && (
                <div className="space-y-1">
                  <p className="text-sm text-red-700">❌ {result.error}</p>
                  <p className="text-xs text-gray-500">
                    Failed at: {result.lastUpdated}
                  </p>
                </div>
              )}
              
              {result.status === 'loading' && (
                <p className="text-sm text-yellow-700">🔄 Testing...</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* React Query Cache Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">React Query Cache Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Enquiries Cache</h3>
            <p className="text-sm text-gray-600">
              {enquiriesCache ? `✅ ${Array.isArray(enquiriesCache) ? enquiriesCache.length : 'N/A'} items cached` : '❌ No cache'}
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Shortlist Cache</h3>
            <p className="text-sm text-gray-600">
              {shortlistCache ? `✅ ${Array.isArray(shortlistCache) ? shortlistCache.length : 'N/A'} items cached` : '❌ No cache'}
            </p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Documents Cache</h3>
            <p className="text-sm text-gray-600">
              {documentsCache ? `✅ ${Array.isArray(documentsCache) ? documentsCache.length : 'N/A'} items cached` : '❌ No cache'}
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Auto-Refresh Test Component */}
      <AutoRefreshTest />

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Testing Instructions</h2>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Auto-refresh:</strong> This page automatically tests endpoints every 30 seconds when enabled</p>
          <p>• <strong>Manual test:</strong> Click "Test All Endpoints" to immediately check all API endpoints</p>
          <p>• <strong>Cache test:</strong> Click "Invalidate Caches" to test cache refresh functionality</p>
          <p>• <strong>Navigation test:</strong> Navigate to other pages and return - data should persist</p>
          <p>• <strong>Refresh test:</strong> Refresh the browser page - data should remain visible</p>
          <p>• <strong>Console logs:</strong> Check browser console for detailed refresh activity</p>
        </div>
      </div>
    </div>
  );
};

export default RefreshTestPage;
