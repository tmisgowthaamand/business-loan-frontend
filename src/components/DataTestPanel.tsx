import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { dataTestingService } from '../utils/dataTestingUtils';
import { useRenderData } from './RenderDataProvider';
import { 
  PlayIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const DataTestPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();
  const { isReady } = useRenderData();

  React.useEffect(() => {
    dataTestingService.setQueryClient(queryClient);
  }, [queryClient]);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      console.log('🧪 [DATA-TEST-PANEL] Starting comprehensive test suite...');
      const results = await dataTestingService.runFullTestSuite();
      setTestResults(results);
      console.log('🧪 [DATA-TEST-PANEL] Test suite completed:', results);
    } catch (error) {
      console.error('🧪 [DATA-TEST-PANEL] Test suite failed:', error);
      setTestResults({
        overallStatus: 'fail',
        summary: 'Test suite execution failed',
        error: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const copyReport = () => {
    if (testResults) {
      const report = dataTestingService.generateReport(testResults);
      navigator.clipboard.writeText(report);
      alert('Test report copied to clipboard!');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'fail':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (!isReady) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="text-sm text-yellow-700">
            Data services are initializing. Please wait before running tests.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Data Persistence Test Suite
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </button>
            {testResults && (
              <button
                onClick={copyReport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                Copy Report
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        {isRunning && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">
              Testing data visibility and persistence across all pages...
            </p>
          </div>
        )}

        {testResults && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className={`p-4 rounded-lg ${
              testResults.overallStatus === 'pass' ? 'bg-green-50 border border-green-200' :
              testResults.overallStatus === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {getStatusIcon(testResults.overallStatus)}
                <div className="ml-3">
                  <h4 className={`text-sm font-medium ${
                    testResults.overallStatus === 'pass' ? 'text-green-800' :
                    testResults.overallStatus === 'warning' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    Overall Status: {testResults.overallStatus.toUpperCase()}
                  </h4>
                  <p className={`text-sm ${
                    testResults.overallStatus === 'pass' ? 'text-green-700' :
                    testResults.overallStatus === 'warning' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {testResults.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Page Tests Summary */}
            {testResults.pageTests && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Page Tests</h4>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {testResults.pageTests.map((pageTest: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        pageTest.overallStatus === 'pass' ? 'bg-green-50 border-green-200' :
                        pageTest.overallStatus === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {pageTest.page}
                        </span>
                        {getStatusIcon(pageTest.overallStatus)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {pageTest.modules.length} modules tested
                      </p>
                      <p className="text-xs text-gray-500">
                        Data loaded: {pageTest.allModulesLoaded ? 'Yes' : 'No'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Detailed Results */}
                {showDetails && (
                  <div className="mt-4 space-y-3">
                    {testResults.pageTests.map((pageTest: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">
                            {pageTest.page} ({pageTest.route})
                          </h5>
                          {getStatusIcon(pageTest.overallStatus)}
                        </div>
                        
                        <div className="space-y-1">
                          {pageTest.testResults.map((result: any, resultIndex: number) => (
                            <div key={resultIndex} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{result.module}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  result.dataLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {result.dataCount} items
                                </span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  result.cacheStatus === 'fresh' ? 'bg-blue-100 text-blue-800' :
                                  result.cacheStatus === 'stale' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {result.cacheStatus}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Persistence Test */}
            {testResults.persistenceTest && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Persistence Test</h4>
                <div className={`p-3 rounded-lg border ${
                  testResults.persistenceTest.persistenceStatus === 'pass' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Data Persistence: {testResults.persistenceTest.persistenceStatus.toUpperCase()}
                    </span>
                    {getStatusIcon(testResults.persistenceTest.persistenceStatus)}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <p>Before refresh: {Object.entries(testResults.persistenceTest.beforeRefresh)
                      .map(([k, v]) => `${k}:${v}`).join(', ')}</p>
                    <p>After refresh: {Object.entries(testResults.persistenceTest.afterRefresh)
                      .map(([k, v]) => `${k}:${v}`).join(', ')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTestPanel;
