import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';
import useResponsive from '../../hooks/useResponsive';
import toast from 'react-hot-toast';

function ShortlistList() {
  const device = useResponsive();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    shortlist: any;
  }>({ isOpen: false, shortlist: null });
  const queryClient = useQueryClient();
  const location = useLocation();

  // This useEffect will be moved after the query definition

  // Mutation for updating interest status
  const updateInterestStatusMutation = useMutation(
    async ({ id, interestStatus }: { id: number; interestStatus: string }) => {
      console.log('🔄 Sending status update request:', { id, interestStatus });
      const response = await api.patch(`/api/shortlist/${id}`, { interestStatus });
      console.log('✅ Status update response:', response.data);
      return response;
    },
    {
      onSuccess: (response, variables) => {
        const statusText = variables.interestStatus === 'NOT_INTERESTED' ? 'Not Interested' : 'Interested';
        toast.success(`Status updated to: ${statusText}`);
        console.log('🎉 Status successfully updated to:', variables.interestStatus);
        console.log('✅ Backend response:', response.data);
        
        // Refetch in background to ensure consistency
        setTimeout(() => {
          queryClient.invalidateQueries(['shortlists']);
          queryClient.invalidateQueries(['cashfree-applications']);
        }, 100);
      },
      onError: (error: any, variables) => {
        console.error('❌ Status update failed:', error);
        console.error('Failed variables:', variables);
        
        // Revert the optimistic update on error
        queryClient.setQueryData(['shortlists', searchTerm], (oldData: any) => {
          if (!oldData) return oldData;
          
          return oldData.map((shortlist: any) => {
            if (shortlist.id === variables.id) {
              console.log('🔄 Reverting optimistic update for ID:', variables.id);
              // Revert to opposite status (since the update failed)
              const revertedStatus = variables.interestStatus === 'NOT_INTERESTED' ? 'INTERESTED' : 'NOT_INTERESTED';
              return {
                ...shortlist,
                interestStatus: revertedStatus
              };
            }
            return shortlist;
          });
        });
        
        toast.error(`Failed to update status: ${error.response?.data?.message || error.message}`);
      },
    }
  );

  const handleInterestStatusChange = (shortlistId: number, newStatus: string) => {
    // Optimistic update - immediately update the UI
    queryClient.setQueryData(['shortlists', searchTerm], (oldData: any) => {
      if (!oldData) return oldData;
      
      return oldData.map((shortlist: any) => {
        if (shortlist.id === shortlistId) {
          console.log('🔄 Optimistically updating status for ID:', shortlistId, 'to:', newStatus);
          return {
            ...shortlist,
            interestStatus: newStatus
          };
        }
        return shortlist;
      });
    });

    // Then make the API call
    updateInterestStatusMutation.mutate({ id: shortlistId, interestStatus: newStatus });
  };

  // Mutation for deleting shortlist
  const deleteShortlistMutation = useMutation(
    async (id: number) => {
      console.log('🗑️ Executing DELETE request for shortlist ID:', id);
      
      // First check if server is accessible
      try {
        await api.get('/api/staff/health');
        console.log('✅ Server is accessible, proceeding with DELETE');
      } catch (pingError) {
        console.error('❌ Server not accessible:', pingError);
        throw new Error('Backend server is not running. Please start the server first.');
      }
      
      const response = await api.delete(`/api/shortlist/${id}`);
      console.log('✅ DELETE response received:', response.data);
      return response;
    },
    {
      onSuccess: (response, deletedId) => {
        console.log('✅ Delete mutation successful:', response.data);
        toast.success('Shortlist deleted successfully!');
        
        // Optimistic update - remove the item from cache immediately
        queryClient.setQueryData(['shortlists', searchTerm], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((shortlist: any) => shortlist.id !== deletedId);
        });
        
        // Refetch in background to ensure consistency
        setTimeout(() => {
          queryClient.invalidateQueries(['shortlists']);
          queryClient.invalidateQueries(['cashfree-applications']);
        }, 100);
      },
      onError: (error: any) => {
        console.error('❌ Delete mutation failed:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method
        });
        
        let errorMessage = 'Failed to delete shortlist';
        
        if (error.message.includes('Backend server is not running')) {
          errorMessage = 'Backend server is not running. Please start the server on port 5001.';
        } else if (error.response?.status === 404) {
          errorMessage = 'DELETE endpoint not found. Please ensure backend server is running with Supabase routes.';
        } else {
          errorMessage = error.response?.data?.message || 
                        `Failed to delete shortlist (${error.response?.status || error.message})`;
        }
        
        toast.error(errorMessage);
      },
    }
  );

  const handleDeleteShortlist = (shortlistId: number, clientName: string) => {
    if (window.confirm(`Are you sure you want to delete the shortlist for "${clientName}"? This action cannot be undone.`)) {
      console.log('🗑️ Attempting to delete shortlist ID:', shortlistId);
      console.log('API endpoint will be:', `/api/shortlist/${shortlistId}`);
      deleteShortlistMutation.mutate(shortlistId);
    }
  };

  const handleViewShortlist = (shortlist: any) => {
    console.log('👁️ Viewing shortlist:', shortlist.name);
    setViewModal({
      isOpen: true,
      shortlist: shortlist
    });
  };

  const closeViewModal = () => {
    setViewModal({ isOpen: false, shortlist: null });
  };

  const { data: shortlists, isLoading, refetch } = useQuery(
    ['shortlists', searchTerm],
    async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('name', searchTerm);
        
        const response = await api.get(`/api/shortlist?${params}`);
        console.log('📋 Shortlist data received:', response.data?.length || 0, 'items');
        console.log('📋 First shortlist item details:', response.data?.[0]);
        return response.data || [];
      } catch (error) {
        console.error('📋 Error fetching shortlists:', error);
        // Return empty array instead of throwing to prevent blank pages
        return [];
      }
    },
    {
      // Enhanced settings for better persistence
      staleTime: 5 * 60 * 1000, // 5 minutes - longer cache for better persistence
      cacheTime: 15 * 60 * 1000, // 15 minutes cache
      keepPreviousData: true, // Prevent blank pages
      refetchOnMount: false, // Don't refetch on mount to preserve data
      refetchOnWindowFocus: false, // Don't refetch on focus to preserve data
      refetchInterval: false, // Disable auto-refresh to preserve data
      onSuccess: (data) => {
        console.log('📋 Shortlists query success:', data?.length || 0, 'shortlists');
      },
      onError: (error) => {
        console.error('📋 Shortlists query error:', error);
      }
    }
  );

  // Force refresh when returning from edit page or after adding to shortlist
  useEffect(() => {
    // If we're coming from an edit page, force a refresh
    if (location.state?.fromEdit) {
      console.log('Returning from edit page, forcing refresh...', location.state);
      setIsRefreshing(true);
      
      queryClient.clear();
      queryClient.invalidateQueries(['shortlists']);
      queryClient.invalidateQueries(['shortlist']);
      queryClient.invalidateQueries(['cashfree-applications']);
      
      // Force immediate refetch
      setTimeout(() => {
        queryClient.refetchQueries(['shortlists']);
        refetch().finally(() => {
          setIsRefreshing(false);
        });
      }, 50);
    }
    
    // If we're coming from adding to shortlist, show success message
    if (location.state?.fromAdd && location.state?.clientName) {
      toast.success(`🎉 ${location.state.clientName} has been successfully added to shortlist!`);
      // Clear the state to prevent repeated messages
      window.history.replaceState({}, document.title);
    }
  }, [location.state, queryClient, refetch, setIsRefreshing]);

  const isMobile = device === 'mobile';

  if (isLoading || isRefreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isRefreshing ? 'Refreshing data...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shortlisted Applications</h1>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              refetch();
              toast.success('Refreshing shortlist data...');
            }}
            className="btn-outline inline-flex items-center"
          >
            🔄 Refresh
          </button>
          <button
            onClick={async () => {
              try {
                const response = await api.get('/api/staff/health');
                toast.success('Backend server is running!');
                console.log('Server status:', response.data);
              } catch (error: any) {
                toast.error(`Backend server not accessible: ${error.response?.status || error.message}`);
                console.error('Server check failed:', error);
              }
            }}
            className="btn-outline inline-flex items-center"
          >
            Check Server
          </button>
          <Link
            to="/shortlist/new"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Shortlist
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              refetch();
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Shortlists Table/Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {shortlists && shortlists.length > 0 ? (
          <div className={`${isMobile ? 'space-y-4' : 'overflow-x-auto'}`}>
            {isMobile ? (
              // Mobile Card View
              <div className="space-y-4">
                {shortlists.map((shortlist: any) => (
                  <motion.div
                    key={shortlist.id}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{shortlist.name || shortlist.enquiry?.name}</h3>
                      <select
                        value={shortlist.interestStatus || 'INTERESTED'}
                        onChange={(e) => {
                          console.log('Mobile status change:', shortlist.id, 'from:', shortlist.interestStatus, 'to:', e.target.value);
                          handleInterestStatusChange(shortlist.id, e.target.value);
                        }}
                        className={`text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors duration-200 ${
                          shortlist.interestStatus === 'NOT_INTERESTED' 
                            ? 'bg-red-50 border-red-300 text-red-800' 
                            : 'bg-green-50 border-green-300 text-green-800'
                        } ${updateInterestStatusMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={updateInterestStatusMutation.isLoading}
                      >
                        <option value="INTERESTED">✅ Interested</option>
                        <option value="NOT_INTERESTED">❌ Not Interested</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">📱 {shortlist.mobile || shortlist.enquiry?.mobile}</p>
                    <p className="text-sm text-gray-600 mb-1">🏢 {shortlist.businessNature || shortlist.businessName || shortlist.enquiry?.businessType || 'Business'}</p>
                    <p className="text-sm text-gray-600 mb-1">💰 ₹{(shortlist.loanAmount || shortlist.enquiry?.loanAmount || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mb-1">📍 {shortlist.district || shortlist.enquiry?.district || 'Location'}</p>
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-600 mr-2">📋 Loan Status:</span>
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        Pending
                      </span>
                    </div>
                    <div className="flex items-center mb-1">
                      <span className="text-sm text-gray-600 mr-2">👤 Staff:</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {shortlist.staff?.name || shortlist.staff || 'Unassigned'}
                        </span>
                        {shortlist.staff?.role && (
                          <span className="text-xs text-gray-500">
                            {shortlist.staff.role}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">📅 {new Date(shortlist.createdAt || shortlist.date).toLocaleDateString()}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewShortlist(shortlist)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <Link
                        to={`/shortlist/${shortlist.id}/edit`}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      {!shortlist.cashfreeApplication && (
                        <Link
                          to={`/payment-gateway/apply/${shortlist.id}`}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Apply to Payment Gateway
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteShortlist(shortlist.id, shortlist.name || shortlist.enquiry?.name || 'Unknown')}
                        disabled={deleteShortlistMutation.isLoading}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
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
                      <th className="w-24 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        District
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Loan Status
                      </th>
                      <th className="w-24 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="w-24 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Staff
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shortlists.map((shortlist: any, index: number) => (
                    <motion.tr
                      key={shortlist.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="w-16 px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {index + 1}
                      </td>
                      <td className="w-32 px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(shortlist.createdAt || shortlist.date).toLocaleDateString()}
                      </td>
                      <td className="w-48 px-4 py-4 text-sm font-medium text-gray-900">
                        <div className="truncate" title={shortlist.name || shortlist.enquiry?.name}>
                          {shortlist.name || shortlist.enquiry?.name}
                        </div>
                      </td>
                      <td className="w-32 px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shortlist.mobile || shortlist.enquiry?.mobile}
                      </td>
                      <td className="w-48 px-4 py-4 text-sm text-gray-500">
                        <div className="truncate" title={shortlist.businessNature || shortlist.businessName || shortlist.enquiry?.businessType || 'Business'}>
                          {shortlist.businessNature || shortlist.businessName || shortlist.enquiry?.businessType || 'Business'}
                        </div>
                      </td>
                      <td className="w-32 px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                        ₹{(shortlist.loanAmount || shortlist.enquiry?.loanAmount || 0).toLocaleString()}
                      </td>
                      <td className="w-24 px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shortlist.district || shortlist.enquiry?.district || 'N/A'}
                      </td>
                      <td className="w-32 px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="w-24 px-4 py-4 whitespace-nowrap">
                        <select
                          value={shortlist.interestStatus || 'INTERESTED'}
                          onChange={(e) => {
                            console.log('Desktop status change:', shortlist.id, 'from:', shortlist.interestStatus, 'to:', e.target.value);
                            handleInterestStatusChange(shortlist.id, e.target.value);
                          }}
                          className={`text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 ${
                            shortlist.interestStatus === 'NOT_INTERESTED' 
                              ? 'bg-red-50 border-red-300 text-red-800' 
                              : 'bg-green-50 border-green-300 text-green-800'
                          } ${updateInterestStatusMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={updateInterestStatusMutation.isLoading}
                        >
                          <option value="INTERESTED">✅ Interested</option>
                          <option value="NOT_INTERESTED">❌ Not Interested</option>
                        </select>
                      </td>
                      <td className="w-24 px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {shortlist.staff?.name || shortlist.staff || 'Unassigned'}
                          </span>
                          {shortlist.staff?.role && (
                            <span className="text-xs text-gray-500">
                              {shortlist.staff.role}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="w-32 px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewShortlist(shortlist)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                            title="View Shortlist Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/shortlist/${shortlist.id}/edit`}
                            className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                            title="Edit Shortlist"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          {!shortlist.cashfreeApplication && (
                            <Link
                              to={`/payment-gateway/apply/${shortlist.id}`}
                              className="text-green-600 hover:text-green-900"
                              title="Apply to Payment Gateway"
                            >
                              Apply
                            </Link>
                          )}
                          <button
                            onClick={() => handleDeleteShortlist(shortlist.id, shortlist.name || shortlist.enquiry?.name || 'Unknown')}
                            disabled={deleteShortlistMutation.isLoading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                            title="Delete Shortlist"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
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
            <p className="text-gray-500 text-lg">No shortlisted applications found.</p>
            <Link
              to="/shortlist/new"
              className="btn-primary inline-flex items-center mt-4"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Shortlist
            </Link>
          </div>
        )}
      </motion.div>

      {/* View Shortlist Modal */}
      {viewModal.isOpen && viewModal.shortlist && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Shortlist Details - {viewModal.shortlist.name}
                </h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mt-4 space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{viewModal.shortlist.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mobile</label>
                      <p className="mt-1 text-sm text-gray-900">{viewModal.shortlist.mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">District</label>
                      <p className="mt-1 text-sm text-gray-900">{viewModal.shortlist.district || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {viewModal.shortlist.createdAt ? new Date(viewModal.shortlist.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Business Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name</label>
                      <p className="mt-1 text-sm text-gray-900">{viewModal.shortlist.businessName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Nature</label>
                      <p className="mt-1 text-sm text-gray-900">{viewModal.shortlist.businessNature || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Constitution</label>
                      <p className="mt-1 text-sm text-gray-900">{viewModal.shortlist.propPvt || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">GST Status</label>
                      <p className="mt-1 text-sm text-gray-900">{viewModal.shortlist.gstStatus || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Financial Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Loan Amount</label>
                      <p className="mt-1 text-sm text-gray-900 font-semibold">
                        ₹{viewModal.shortlist.loanAmount ? viewModal.shortlist.loanAmount.toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CAP Amount</label>
                      <p className="mt-1 text-sm text-gray-900">
                        ₹{viewModal.shortlist.cap ? viewModal.shortlist.cap.toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Account</label>
                      <p className="mt-1 text-sm text-gray-900">{viewModal.shortlist.bankAccount || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bank Statement Duration</label>
                      <p className="mt-1 text-sm text-gray-900">{viewModal.shortlist.bankStatementDuration || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Staff & Status */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Assignment & Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assigned Staff</label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">
                        {viewModal.shortlist.staff?.name || viewModal.shortlist.staff || 'Unassigned'}
                      </p>
                      {viewModal.shortlist.staff?.role && (
                        <p className="text-xs text-gray-500">{viewModal.shortlist.staff.role}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Interest Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        viewModal.shortlist.interestStatus === 'NOT_INTERESTED' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {viewModal.shortlist.interestStatus === 'NOT_INTERESTED' ? '❌ Not Interested' : '✅ Interested'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                {viewModal.shortlist.comments && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Comments</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {viewModal.shortlist.comments}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end pt-6 border-t border-gray-200 space-x-3">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
                <Link
                  to={`/shortlist/${viewModal.shortlist.id}/edit`}
                  onClick={closeViewModal}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 inline-flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Shortlist
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShortlistList;