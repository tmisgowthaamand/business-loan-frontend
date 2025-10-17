import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { PlayIcon, StopIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { AutoRefreshTester, RefreshTestResult } from '../../utils/testAutoRefresh';
import toast from 'react-hot-toast';

const AutoRefreshTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<RefreshTestResult[]>([]);
  const [testProgress, setTestProgress] = useState('');
  const queryClient = useQueryClient();

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setTestProgress('Initializing tests...');
    
    try {
      const tester = new AutoRefreshTester(queryClient);
      
      // Test all endpoints
      setTestProgress('Testing API endpoints...');
      await tester.testAllEndpoints();
      
      // Test cache invalidation
      setTestProgress('Testing cache invalidation...');
      await tester.testCacheInvalidation();
      
      // Get results
      const testResults = tester.results;
      setResults(testResults);
      
      // Generate report
      const report = tester.generateReport();
      console.log(report);
      
      const successCount = testResults.filter((r: any) => r.status === 'success').length;
      const totalCount = testResults.length;
      
      toast.success(`Tests completed! ${successCount}/${totalCount} passed`);
      setTestProgress(`Completed: ${successCount}/${totalCount} tests passed`);
      
    } catch (error: any) {
      console.error('Test execution failed:', error);
      toast.error(`Test execution failed: ${error.message}`);
      setTestProgress(`Failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setTestProgress('');
  };

  const manualRefresh = () => {
    setTestProgress('Manually refreshing all queries...');
    
    const queryKeys = [
      'dashboard-data',
      'enquiries', 
      'documents',
      'documents-verification',
      'shortlists',
      'cashfree-applications',
      'staff'
    ];

    queryKeys.forEach(key => {
      queryClient.invalidateQueries(key);
    });

    toast.success('Manual refresh triggered for all queries');
    setTestProgress('Manual refresh completed');
  };

  const getStatusIcon = (status: 'success' | 'error') => {
    return status === 'success' ? '✅' : '❌';
  };

  const getStatusColor = (status: 'success' | 'error') => {
    return status === 'success' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Auto-Refresh Functionality Test</h2>
        <div className="flex space-x-3">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <StopIcon className="h-4 w-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Run Tests
              </>
            )}
          </button>
          
          <button
            onClick={manualRefresh}
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Manual Refresh
          </button>
          
          <button
            onClick={clearResults}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear Results
          </button>
        </div>
      </div>

      {testProgress && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">{testProgress}</p>
        </div>
      )}

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border rounded-lg ${
                  result.status === 'success' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{result.page}</h4>
                  <span className="text-lg">{getStatusIcon(result.status)}</span>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">
                  <code className="bg-gray-100 px-1 rounded">{result.endpoint}</code>
                </p>
                
                <p className={`text-sm ${getStatusColor(result.status)} mb-2`}>
                  {result.message}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                  {result.dataCount !== undefined && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {result.dataCount} items
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{results.length}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Testing Instructions</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Click "Run Tests" to verify all API endpoints and cache functionality</li>
          <li>• Use "Manual Refresh" to trigger immediate data refresh across all pages</li>
          <li>• Check browser console for detailed logs and reports</li>
          <li>• Navigate between pages to verify data persistence</li>
          <li>• Refresh the browser page to test data persistence after reload</li>
        </ul>
      </div>
    </div>
  );
};

export default AutoRefreshTest;
