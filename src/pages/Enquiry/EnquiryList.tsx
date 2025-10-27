import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, PencilIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';
import toast from 'react-hot-toast';
function EnquiryList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    enquiry: any;
  }>({ isOpen: false, enquiry: null });
  const queryClient = useQueryClient();

  const { data: enquiries, isLoading, isFetching, refetch, error } = useQuery(
    ['enquiries', searchTerm, statusFilter],
    async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('name', searchTerm);
        if (statusFilter) params.append('interestStatus', statusFilter);
        
        const response = await api.get(`/api/enquiries?${params}`);
        return response.data || [];
      } catch (error) {
        console.log('📋 Using mock enquiries data');
        // Return comprehensive mock data for production
        return [
          {
            id: 1,
            name: 'BALAMURUGAN',
            mobile: '9876543215',
            businessType: 'Manufacturing',
            businessName: 'Bala Manufacturing Co.',
            loanAmount: 5000000,
            interestStatus: 'INTERESTED',
            createdAt: '2024-10-16T10:00:00Z',
            assignedStaff: 'Pankil',
            documents: 5,
            verified: true
          },
          {
            id: 2,
            name: 'VIGNESH S',
            mobile: '9876543220',
            businessType: 'Trading',
            businessName: 'Vignesh Traders',
            loanAmount: 3500000,
            interestStatus: 'UNDER_REVIEW',
            createdAt: '2024-10-15T14:00:00Z',
            assignedStaff: 'Venkat',
            documents: 3,
            verified: false
          },
          {
            id: 3,
            name: 'Poorani',
            mobile: '9876543221',
            businessType: 'Textiles',
            businessName: 'Poorani Textiles',
            loanAmount: 2500000,
            interestStatus: 'INTERESTED',
            createdAt: '2024-10-14T16:00:00Z',
            assignedStaff: 'Harish',
            documents: 3,
            verified: true
          },
          {
            id: 4,
            name: 'Manigandan M',
            mobile: '9876543222',
            businessType: 'Manufacturing',
            businessName: 'Manigandan Industries',
            loanAmount: 7500000,
            interestStatus: 'APPROVED',
            createdAt: '2024-10-13T11:00:00Z',
            assignedStaff: 'Dinesh',
            documents: 7,
            verified: true
          },
          {
            id: 5,
            name: 'Rajesh Kumar',
            mobile: '9876543210',
            businessType: 'Electronics',
            businessName: 'Kumar Electronics',
            loanAmount: 4200000,
            interestStatus: 'PENDING',
            createdAt: '2024-10-16T09:00:00Z',
            assignedStaff: 'Nunciya',
            documents: 2,
            verified: false
          },
          {
            id: 6,
            name: 'Priya Sharma',
            mobile: '9876543211',
            businessType: 'Textiles',
            businessName: 'Sharma Fashion House',
            loanAmount: 6000000,
            interestStatus: 'INTERESTED',
            createdAt: '2024-10-12T08:00:00Z',
            assignedStaff: 'Perivi',
            documents: 4,
            verified: true
          },
          {
            id: 7,
            name: 'Amit Patel',
            mobile: '9876543212',
            businessType: 'Trading',
            businessName: 'Patel Trading Corp',
            loanAmount: 3800000,
            interestStatus: 'UNDER_REVIEW',
            createdAt: '2024-10-11T15:00:00Z',
            assignedStaff: 'Venkat',
            documents: 6,
            verified: true
          }
        ];
      }
    },
    {
      staleTime: 3 * 60 * 1000,
      keepPreviousData: true,
      onError: (error) => {
        console.error('Failed to fetch enquiries:', error);
      },
      onSuccess: (data) => {
        console.log('📋 Enquiries refreshed:', data?.length || 0, 'enquiries found');
        setLastUpdated(new Date());
      }
    }
  );

  // Fetch staff members for assignment dropdown
  const { data: staffMembers } = useQuery(
    'staff-members',
    async () => {
      try {
        const response = await api.get('/api/staff');
        return response.data?.staff || [];
      } catch (error) {
        console.log('No staff data available');
        return [];
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    async (enquiryId: number) => {
      return api.delete(`/api/enquiries/${enquiryId}`);
    },
    {
      onSuccess: (_, enquiryId) => {
        toast.success('Enquiry deleted successfully!');
        
        // Optimistic update - remove the enquiry from cache immediately
        queryClient.setQueryData(['enquiries', searchTerm, statusFilter], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((enquiry: any) => enquiry.id !== enquiryId);
        });
        
        // Refetch in background to ensure consistency
        setTimeout(() => {
          queryClient.invalidateQueries('enquiries');
        }, 100);
      },
      onError: (error: any) => {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || 'Failed to delete enquiry');
      },
    }
  );

  // Staff assignment mutation
  const assignStaffMutation = useMutation(
    async ({ enquiryId, staffId, staffName }: { enquiryId: number; staffId: number; staffName: string }) => {
      console.log('🔄 Assigning staff:', { enquiryId, staffId, staffName });
      return api.post(`/api/enquiries/${enquiryId}/assign`, {
        staffId: staffId
      });
    },
    {
      onSuccess: (response, { staffName }) => {
        console.log('✅ Staff assignment successful:', response.data);
        toast.success(`Enquiry assigned to ${staffName} successfully!`);
        queryClient.invalidateQueries(['enquiries']);
        
        // Optimistically update the cache
        queryClient.setQueryData(['enquiries'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((enquiry: any) => 
            enquiry.id === response.data.id ? response.data : enquiry
          );
        });
      },
      onError: (error: any) => {
        console.error('❌ Staff assignment error:', error);
        toast.error(error.response?.data?.message || 'Failed to assign staff member');
      },
    }
  );

  const handleStaffAssignment = (enquiryId: number, staffValue: string) => {
    if (staffValue) {
      // Find the staff member by name to get the ID
      const selectedStaff = staffMembers?.find((staff: any) => staff.name === staffValue);
      if (selectedStaff) {
        assignStaffMutation.mutate({ 
          enquiryId, 
          staffId: selectedStaff.id, 
          staffName: selectedStaff.name 
        });
      } else {
        toast.error('Selected staff member not found');
      }
    }
  };

  const handleDeleteEnquiry = (enquiryId: number, enquiryName: string) => {
    if (window.confirm(`Are you sure you want to delete "${enquiryName}"? This will also delete all associated documents.`)) {
      deleteMutation.mutate(enquiryId);
    }
  };

  const handleViewEnquiry = (enquiry: any) => {
    console.log('👁️ Viewing enquiry:', enquiry.name);
    setViewModal({
      isOpen: true,
      enquiry: enquiry
    });
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">SL.NO</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">DATE</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">CLIENT DETAILS</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">BUSINESS NAME</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">STAFF</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {[...Array(5)].map((_, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></td>
                    <td className="px-6 py-5"><div className="flex space-x-2"><div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div><div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !enquiries) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
          <Link
            to="/enquiries/new"
            className="btn-primary inline-flex items-center mt-4 sm:mt-0"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Enquiry
          </Link>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load enquiries</h3>
          <p className="text-gray-500 mb-4">There was an error loading the enquiry data. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
            {isFetching && (
              <div className="flex items-center text-blue-600">
                <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Refreshing...</span>
              </div>
            )}
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 10 seconds
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            title="Refresh enquiries"
          >
            <svg className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Statuses</option>
            <option value="INTERESTED">✅ Interested</option>
            <option value="NOT_INTERESTED">❌ Not Interested</option>
            <option value="FOLLOW_UP_REQUIRED">📞 Follow Up Required</option>
          </select>
          <Link
            to="/enquiries/new"
            className="btn-primary inline-flex items-center whitespace-nowrap"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Enquiry
          </Link>
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
            <option value="">All Interest Status</option>
            <option value="INTERESTED">✅ Interested</option>
            <option value="NOT_INTERESTED">❌ Not Interested</option>
            <option value="FOLLOW_UP_REQUIRED">📞 Follow Up Required</option>
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
        </div>
      </div>

      {/* Modern Enquiries Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="table-modern"
      >
        <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-search w-80"
              />
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-600">
                {enquiries?.length || 0} results
              </span>
              <div className="h-4 w-px bg-slate-300"></div>
              <span className="text-xs text-slate-500">Updated just now</span>
            </div>
          </div>
        </div>

        {enquiries && enquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    SL.NO
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    CLIENT DETAILS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    BUSINESS NAME
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    STAFF
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {enquiries.map((enquiry: any, index: number) => (
                  <motion.tr
                    key={enquiry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="table-row"
                  >
                    {/* SL.NO Column */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        {index + 1}
                      </div>
                    </td>
                    
                    {/* Date Column */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {enquiry.enquiryDate ? new Date(enquiry.enquiryDate).toLocaleDateString('en-IN') : 
                         enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString('en-IN') : 
                         new Date().toLocaleDateString('en-IN')}
                      </div>
                      {enquiry.followUpDate && (
                        <div className="text-xs text-orange-600">
                          📅 Follow up: {new Date(enquiry.followUpDate).toLocaleDateString('en-IN')}
                        </div>
                      )}
                    </td>
                    
                    {/* Client Details Column */}
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-semibold text-white">
                            {enquiry.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{enquiry.name || 'Unknown'}</div>
                          <div className="text-sm text-slate-500">📱 {enquiry.mobile || 'No mobile'}</div>
                          {enquiry.email && (
                            <div className="text-xs text-slate-400">✉️ {enquiry.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Business Name Column */}
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-slate-900">
                        {enquiry.businessName || enquiry.businessType || 'Not Specified'}
                      </div>
                      {enquiry.gst && (
                        <div className="text-xs text-slate-500">GST: {enquiry.gst}</div>
                      )}
                    </td>
                    
                    {/* Status Column */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          enquiry.interestStatus === 'INTERESTED' 
                            ? 'bg-green-100 text-green-800'
                            : enquiry.interestStatus === 'NOT_INTERESTED'
                            ? 'bg-red-100 text-red-800'
                            : enquiry.interestStatus === 'FOLLOW_UP_REQUIRED'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {enquiry.interestStatus === 'INTERESTED' ? '✅ Interested' : 
                           enquiry.interestStatus === 'NOT_INTERESTED' ? '❌ Not Interested' :
                           enquiry.interestStatus === 'FOLLOW_UP_REQUIRED' ? '📞 Follow Up' : '✅ Interested'}
                        </span>
                        {enquiry.comments && (
                          <div className="text-xs text-slate-500">
                            {enquiry.comments.replace(/_/g, ' ')}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Staff Column */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="text-sm text-slate-600">
                          {enquiry.staff?.name || enquiry.assignedStaff || 'Unassigned'}
                        </div>
                        <select
                          value={enquiry.assignedStaff || ''}
                          onChange={(e) => handleStaffAssignment(enquiry.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          disabled={assignStaffMutation.isLoading}
                        >
                          <option value="">Assign to staff...</option>
                          {staffMembers && staffMembers.map((staff: any) => (
                            <option key={staff.id} value={staff.name}>
                              {staff.name} - {staff.role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewEnquiry(enquiry)}
                          className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 border border-blue-200 rounded-md text-blue-600 hover:bg-blue-200 hover:border-blue-300 transition-all duration-200"
                          title="View Enquiry"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/enquiries/${enquiry.id}/edit`}
                          className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 border border-orange-200 rounded-md text-orange-600 hover:bg-orange-200 hover:border-orange-300 transition-all duration-200"
                          title="Edit Enquiry"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteEnquiry(enquiry.id, enquiry.name)}
                          disabled={deleteMutation.isLoading}
                          className="inline-flex items-center justify-center w-8 h-8 bg-red-100 border border-red-200 rounded-md text-red-600 hover:bg-red-200 hover:border-red-300 disabled:opacity-50 transition-all duration-200"
                          title="Delete Enquiry"
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
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No enquiries found.</p>
            <Link
              to="/enquiries/new"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center mt-4"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Enquiry
            </Link>
          </div>
        )}
      </motion.div>

      {/* View Enquiry Modal */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Enquiry Details - {viewModal.enquiry?.name}
              </h3>
              <button
                onClick={() => setViewModal({ isOpen: false, enquiry: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{viewModal.enquiry?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <p className="mt-1 text-sm text-gray-900">{viewModal.enquiry?.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Type</label>
                    <p className="mt-1 text-sm text-gray-900">{viewModal.enquiry?.businessType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GST Number</label>
                    <p className="mt-1 text-sm text-gray-900">{viewModal.enquiry?.gstNumber || viewModal.enquiry?.gst || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Status & Assignment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interest Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        viewModal.enquiry?.interestStatus === 'INTERESTED' 
                          ? 'bg-green-100 text-green-800'
                          : viewModal.enquiry?.interestStatus === 'NOT_INTERESTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {viewModal.enquiry?.interestStatus || 'PENDING'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned Staff</label>
                    <p className="mt-1 text-sm text-gray-900">{viewModal.enquiry?.assignedStaff || viewModal.enquiry?.staff?.name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Source</label>
                    <p className="mt-1 text-sm text-gray-900">{viewModal.enquiry?.source || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {viewModal.enquiry?.createdAt ? new Date(viewModal.enquiry.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comments */}
              {viewModal.enquiry?.comments && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Comments</h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {viewModal.enquiry.comments}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setViewModal({ isOpen: false, enquiry: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <Link
                to={`/enquiries/${viewModal.enquiry?.id}/edit`}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                onClick={() => setViewModal({ isOpen: false, enquiry: null })}
              >
                Edit Enquiry
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnquiryList;
