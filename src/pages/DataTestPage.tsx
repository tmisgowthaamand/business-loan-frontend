import React from 'react';
import { useAuth } from '../context/AuthContext';
import DataTestPanel from '../components/DataTestPanel';
import { useRenderData } from '../components/RenderDataProvider';
import { 
  CpuChipIcon, 
  ServerIcon, 
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const DataTestPage: React.FC = () => {
  const { user } = useAuth();
  const { isReady, getModuleStatus } = useRenderData();

  const modules = ['enquiries', 'documents', 'shortlist', 'staff', 'payments', 'transactions', 'notifications'];
  const moduleStatuses = modules.map(module => ({
    module,
    status: getModuleStatus(module)
  }));

  const readyModules = moduleStatuses.filter(m => m.status).length;
  const isRenderEnvironment = window.location.hostname.includes('render.com') || 
                              window.location.hostname.includes('onrender.com');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Data Persistence Testing
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Comprehensive testing for Render deployment data visibility and persistence
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-2 rounded-lg ${
                isRenderEnvironment ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <CloudIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">
                  {isRenderEnvironment ? 'Render Environment' : 'Local Environment'}
                </span>
              </div>
              <div className={`flex items-center px-3 py-2 rounded-lg ${
                isReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                <ServerIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">
                  Services {isReady ? 'Ready' : 'Initializing'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CpuChipIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">System Status</h3>
                <p className="text-sm text-gray-500">
                  Data services and persistence layer
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className={`flex items-center ${isReady ? 'text-green-600' : 'text-yellow-600'}`}>
                {isReady ? (
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                )}
                <span className="text-sm font-medium">
                  {isReady ? 'All Systems Ready' : 'Systems Initializing'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ServerIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Module Status</h3>
                <p className="text-sm text-gray-500">
                  Data availability across modules
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ready Modules</span>
                <span className={`text-sm font-medium ${
                  readyModules === modules.length ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {readyModules}/{modules.length}
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    readyModules === modules.length ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${(readyModules / modules.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CloudIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Environment</h3>
                <p className="text-sm text-gray-500">
                  Deployment configuration
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Environment</span>
                <span className="font-medium">
                  {isRenderEnvironment ? 'Production (Render)' : 'Development'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">User</span>
                <span className="font-medium">{user?.name || 'Anonymous'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Module Details */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Module Data Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {moduleStatuses.map(({ module, status }) => (
                <div
                  key={module}
                  className={`p-3 rounded-lg border text-center ${
                    status 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                    status ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <p className="text-xs font-medium capitalize">{module}</p>
                  <p className="text-xs mt-1">
                    {status ? 'Ready' : 'Loading'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Panel */}
        <DataTestPanel />

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Testing Instructions</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>1. System Check:</strong> Ensure all modules show "Ready" status above before running tests.
            </p>
            <p>
              <strong>2. Run Tests:</strong> Click "Run Tests" to execute comprehensive data persistence tests across all pages.
            </p>
            <p>
              <strong>3. Review Results:</strong> Check the test results for any failures or warnings. All pages should show "PASS" status.
            </p>
            <p>
              <strong>4. Persistence Test:</strong> The system will test data persistence by simulating page refreshes.
            </p>
            <p>
              <strong>5. Copy Report:</strong> Use "Copy Report" to get detailed test results for documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTestPage;
