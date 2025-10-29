import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';
import toast from 'react-hot-toast';

// Inline responsive hook for build compatibility
type Device = 'mobile' | 'tablet' | 'desktop';
const useResponsive = (): Device => {
  const [device, setDevice] = useState<Device>('desktop');
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setDevice('mobile');
      else if (width < 1024) setDevice('tablet');
      else setDevice('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return device;
};

function CashfreeList() {
  const device = useResponsive();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.message && location.state?.type === 'success') {
      toast.success(location.state.message);
      // Clear the state to prevent showing the message again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data: applications, isLoading, refetch, error } = useQuery(
    ['cashfree-applications', searchTerm, statusFilter],
    async () => {
      try {
        console.log('🔄 Fetching payment gateway applications...');
        
        // Fetch payment gateway applications from API endpoint
        const gatewayResponse = await api.get('/api/cashfree/applications').catch(err => {
          console.warn('⚠️ Payment gateway API error:', err.message);
          return { data: [] };
        });
        
        const applications = gatewayResponse.data || [];
        
        console.log('✅ Fetched payment gateway applications:', applications.length);
        
        // Filter applications based on search and status
        let filteredApplications = applications;
        
        if (searchTerm) {
          filteredApplications = filteredApplications.filter((app: any) => 
            app.shortlist?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.shortlist?.mobile?.includes(searchTerm) ||
            app.shortlist?.enquiry?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (statusFilter) {
          filteredApplications = filteredApplications.filter((app: any) => app.status === statusFilter);
        }
        
        console.log('✅ Returning filtered payment gateway applications:', filteredApplications.length);
        console.log('💳 Sample application data:', filteredApplications[0]);
        return filteredApplications;
      } catch (error) {
        console.error('❌ Error fetching payment gateway data:', error);
        // Return empty array instead of throwing to prevent blank pages
        return [];
      }
    },
    {
      // Enhanced settings for better persistence
      staleTime: 5 * 60 * 1000, // 5 minutes for payment data
      cacheTime: 15 * 60 * 1000, // 15 minutes cache
      keepPreviousData: true, // Prevent blank pages
      refetchOnMount: false, // Don't refetch on mount to preserve data
      refetchOnWindowFocus: false, // Don't refetch on focus to preserve data
      refetchInterval: false, // Disable auto-refresh to preserve data
      onSuccess: (data) => {
        console.log('💳 Payment applications query success:', data?.length || 0, 'applications');
        if (data && data.length > 0) {
          console.log('💳 First application details:', data[0]);
          console.log('💳 Shortlist data:', data[0]?.shortlist);
        }
      },
      onError: (error) => {
        console.error('💳 Payment applications query error:', error);
      }
    }
  );

  // Status update mutation
  const updateStatusMutation = useMutation(
    async ({ id, status }: { id: number; status: string }) => {
      return api.patch(`/api/cashfree/${id}/status`, { status });
    },
    {
      onSuccess: () => {
        toast.success('Status updated successfully!');
        queryClient.invalidateQueries('cashfree-applications');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update status');
      },
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    async (id: number) => {
      return api.delete(`/api/cashfree/${id}`);
    },
    {
      onSuccess: (response, deletedId) => {
        toast.success(response.data?.message || 'Payment application deleted successfully!');
        
        // Optimistic update - immediately remove from cache
        queryClient.setQueryData(['cashfree-applications', searchTerm, statusFilter], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((app: any) => app.id !== deletedId);
        });
        
        // Also invalidate to ensure consistency
        queryClient.invalidateQueries('cashfree-applications');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete payment application');
      },
    }
  );

  const handleDeleteApplication = (id: number) => {
    deleteMutation.mutate(id);
  };


  const isMobile = device === 'mobile';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'TRANSACTION_DONE':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment gateway applications...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Gateway Applications</h1>
            <p className="text-gray-600">Manage loan applications submitted to payment gateway</p>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Applications</h3>
            <p className="text-gray-500 mb-4">
              There was an error loading the payment gateway applications.
            </p>
            <button
              onClick={() => refetch()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Gateway Applications</h1>
          <p className="text-gray-600">Manage loan applications submitted to payment gateway</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="TRANSACTION_DONE">Transaction Done</option>
            <option value="CLOSED">Closed</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              refetch();
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
          
          <button
            onClick={() => {
              queryClient.invalidateQueries(['cashfree-applications']);
              refetch();
            }}
            className="btn-primary"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Applications Table/Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {applications && applications.length > 0 ? (
          <div className={`${isMobile ? 'space-y-4' : 'overflow-x-auto'}`}>
            {isMobile ? (
              // Mobile Card View
              <div className="space-y-4">
                {applications.map((application: any) => (
                  <motion.div
                    key={application.id}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {application.shortlist.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      📱 {application.shortlist.mobile}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      🏢 {application.shortlist.businessType || application.shortlist.businessName || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      💰 ₹{application.shortlist.loanAmount?.toLocaleString() || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      📅 {new Date(application.submittedAt).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {application.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: application.id, status: 'TRANSACTION_DONE' })}
                            disabled={updateStatusMutation.isLoading}
                            className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                          >
                            Mark Done
                          </button>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: application.id, status: 'CLOSED' })}
                            disabled={updateStatusMutation.isLoading}
                            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                          >
                            Close
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteApplication(application.id)}
                        disabled={deleteMutation.isLoading}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // Desktop Table View
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-indigo-600">
                    <tr>
                      <th className="w-16 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        S.No
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Submitted Date
                      </th>
                      <th className="w-48 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Name
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="w-48 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Business
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Loan Amount
                      </th>
                      <th className="w-28 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Submitted By
                      </th>
                      <th className="w-44 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application: any, index: number) => (
                    <motion.tr
                      key={application.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="w-16 px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {index + 1}
                      </td>
                      <td className="w-32 px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="w-48 px-4 py-4 text-sm font-medium text-gray-900">
                        <div className="truncate" title={application.shortlist.name}>
                          {application.shortlist.name}
                        </div>
                      </td>
                      <td className="w-32 px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.shortlist.mobile}
                      </td>
                      <td className="w-48 px-4 py-4 text-sm text-gray-500">
                        <div className="truncate" title={application.shortlist.businessType || application.shortlist.businessName || 'N/A'}>
                          {application.shortlist.businessType || application.shortlist.businessName || 'N/A'}
                        </div>
                      </td>
                      <td className="w-32 px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                        ₹{application.shortlist.loanAmount?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="w-28 px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {application.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="w-32 px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.submittedBy?.name || 'N/A'}
                      </td>
                      <td className="w-44 px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1 items-center">
                          {application.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => updateStatusMutation.mutate({ id: application.id, status: 'TRANSACTION_DONE' })}
                                disabled={updateStatusMutation.isLoading}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50 text-xs px-1"
                              >
                                Mark Done
                              </button>
                              <button
                                onClick={() => updateStatusMutation.mutate({ id: application.id, status: 'CLOSED' })}
                                disabled={updateStatusMutation.isLoading}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 text-xs px-1"
                              >
                                Close
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteApplication(application.id)}
                            disabled={deleteMutation.isLoading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 text-xs px-1"
                            title="Delete Application"
                          >
                            Delete
                          </button>
                        </div>
                        {application.decisionDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Decision: {new Date(application.decisionDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Gateway Applications</h3>
            <p className="text-gray-500 mb-4">
              No applications have been submitted to the payment gateway yet.
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>To create payment gateway applications:</p>
              <p>1. Go to Shortlist Applications</p>
              <p>2. Click "Apply" on a shortlisted client</p>
              <p>3. Submit the payment gateway application</p>
            </div>
            <button
              onClick={() => refetch()}
              className="btn-outline mt-4"
            >
              🔄 Refresh Data
            </button>
          </div>
        )}
      </motion.div>

      {/* Statistics */}
      {applications && applications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter((app: any) => app.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">Pending Applications</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter((app: any) => app.status === 'TRANSACTION_DONE').length}
            </div>
            <div className="text-sm text-gray-600">Completed Transactions</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600">
              {applications.filter((app: any) => app.status === 'CLOSED').length}
            </div>
            <div className="text-sm text-gray-600">Closed Applications</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default CashfreeList;
