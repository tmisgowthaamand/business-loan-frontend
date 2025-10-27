import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';

interface PageTest {
  name: string;
  path: string;
  description: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

const AllPagesTest: React.FC = () => {
  const [tests, setTests] = useState<PageTest[]>([
    { name: 'Login Page', path: '/login', description: 'Staff authentication', status: 'pending' },
    { name: 'Dashboard', path: '/dashboard', description: 'Main dashboard with stats', status: 'pending' },
    { name: 'Enquiries List', path: '/enquiries', description: 'View all enquiries', status: 'pending' },
    { name: 'New Enquiry', path: '/enquiries/new', description: 'Create new enquiry', status: 'pending' },
    { name: 'Documents', path: '/documents', description: 'Document management', status: 'pending' },
    { name: 'Document Verification', path: '/documents/verification', description: 'Verify documents', status: 'pending' },
    { name: 'Shortlist', path: '/shortlist', description: 'Manage shortlisted clients', status: 'pending' },
    { name: 'Payment Gateway', path: '/payment-gateway', description: 'Payment applications', status: 'pending' },
    { name: 'Loan Application', path: '/apply', description: 'Public loan application form', status: 'pending' },
  ]);

  const [apiTests, setApiTests] = useState<PageTest[]>([
    { name: 'Backend Health', path: '/api/health', description: 'Backend connectivity', status: 'pending' },
    { name: 'Staff Endpoints', path: '/api/staff', description: 'Staff management API', status: 'pending' },
    { name: 'Enquiries API', path: '/api/enquiries', description: 'Enquiries CRUD API', status: 'pending' },
    { name: 'Documents API', path: '/api/documents', description: 'Document management API', status: 'pending' },
    { name: 'Notifications API', path: '/api/notifications', description: 'Notifications system', status: 'pending' },
  ]);

  const testApiEndpoint = async (endpoint: string, index: number) => {
    try {
      const response = await api.get(endpoint);
      setApiTests(prev => prev.map((test, i) => 
        i === index ? { ...test, status: 'success' } : test
      ));
    } catch (error: any) {
      setApiTests(prev => prev.map((test, i) => 
        i === index ? { 
          ...test, 
          status: 'error', 
          error: error.message || 'API call failed' 
        } : test
      ));
    }
  };

  const runAllApiTests = async () => {
    for (let i = 0; i < apiTests.length; i++) {
      await testApiEndpoint(apiTests[i].path, i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  useEffect(() => {
    // Auto-run API tests on component mount
    runAllApiTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-yellow-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🧪 Complete System Test - All Pages & APIs
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Frontend Pages */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                🖥️ Frontend Pages
                <span className="ml-2 text-sm text-gray-500">({tests.length} pages)</span>
              </h2>
              <div className="space-y-3">
                {tests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <Link 
                            to={test.path} 
                            className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {test.name}
                          </Link>
                          <p className="text-sm text-gray-600">{test.description}</p>
                          <p className="text-xs text-gray-400 font-mono">{test.path}</p>
                        </div>
                      </div>
                      {test.error && (
                        <p className="text-sm text-red-600 mt-2">{test.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Endpoints */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                🔌 API Endpoints
                <span className="ml-2 text-sm text-gray-500">({apiTests.length} endpoints)</span>
              </h2>
              <div className="space-y-3">
                {apiTests.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h3 className="font-medium text-gray-900">{test.name}</h3>
                          <p className="text-sm text-gray-600">{test.description}</p>
                          <p className="text-xs text-gray-400 font-mono">{test.path}</p>
                        </div>
                      </div>
                      {test.error && (
                        <p className="text-sm text-red-600 mt-2">{test.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={runAllApiTests}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🔄 Re-run API Tests
              </button>
            </div>
          </div>

          {/* System Status Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 System Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {apiTests.filter(t => t.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">APIs Working</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {apiTests.filter(t => t.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">API Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{tests.length}</div>
                <div className="text-sm text-gray-600">Total Pages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((apiTests.filter(t => t.status === 'success').length / apiTests.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">System Health</div>
              </div>
            </div>
          </div>

          {/* Staff Login Credentials */}
          <div className="mt-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔐 Staff Login Credentials</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Admin:</strong> gowthaamankrishna1998@gmail.com / 12345678</p>
                <p><strong>Employee:</strong> gowthaamaneswar1998@gmail.com / 12345678</p>
                <p><strong>Admin:</strong> admin@gmail.com / admin123</p>
              </div>
              <div>
                <p><strong>Servers:</strong></p>
                <p>Frontend: http://localhost:5001</p>
                <p>Backend: http://localhost:5002</p>
                <p>Render: https://business-loan-backend.onrender.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPagesTest;
