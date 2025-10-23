import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, UserPlusIcon, TrashIcon, CheckIcon, XMarkIcon, EnvelopeIcon, ArrowPathIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useDashboardRefresh } from '../../hooks/useDashboardRefresh';
import { useStaffPermissions } from '../../hooks/useStaffPermissions';
import { useAuth } from '../../context/AuthContext';

interface StaffFormData {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'EMPLOYEE';
  department?: string;
  position?: string;
  clientName?: string;
}

interface StaffMember {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'EMPLOYEE';
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  hasAccess: boolean;
  department?: string;
  position?: string;
  verified?: boolean;
  clientName?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

function StaffManagement() {
  const { user } = useAuth();
  const permissions = useStaffPermissions();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'EMPLOYEE' | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<{[key: number]: boolean}>({});
  const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const { refreshAfterStaff } = useDashboardRefresh();

  // Check permissions - only admin@gmail.com can access staff management
  if (!permissions.canManageStaff) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Only <strong>admin@gmail.com</strong> has permission to manage staff members.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              Current user: <strong>{user?.email}</strong><br/>
              Role: <strong>{user?.role}</strong>
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Please contact the administrator if you need access to staff management.
          </p>
        </motion.div>
      </div>
    );
  }
  const [staffAvailability, setStaffAvailability] = useState<{[key: number]: 'Active' | 'Inactive'}>({
    1: 'Active',
    2: 'Active', 
    3: 'Active',
    4: 'Inactive',
    5: 'Active',
    6: 'Active',
    7: 'Active'
  });
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StaffFormData>();

  // Fetch staff members with optimized caching
  const { data: staffResponse, isLoading, refetch } = useQuery('staff', async () => {
    const response = await api.get('/api/staff');
    return response.data;
  }, {
    // Use global settings with staff-specific overrides
    staleTime: 4 * 60 * 1000, // 4 minutes for staff data
    keepPreviousData: true, // Prevent blank pages
  });

  // Fetch staff stats with optimized caching
  const { data: statsResponse } = useQuery('staff-stats', async () => {
    const response = await api.get('/api/staff/stats/summary');
    return response.data;
  }, {
    // Use global settings for staff stats
    staleTime: 5 * 60 * 1000, // 5 minutes for stats
    keepPreviousData: true,
  });

  const staff: StaffMember[] = staffResponse?.staff || [];
  const stats = statsResponse?.stats || {};

  // Create staff mutation with optimistic updates
  const createStaffMutation = useMutation(
    async (data: StaffFormData) => {
      return api.post('/api/staff', data);
    },
    {
      onMutate: async (newStaff) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries('staff');
        await queryClient.cancelQueries('staff-stats');

        // Snapshot the previous value
        const previousStaff = queryClient.getQueryData('staff');
        const previousStats = queryClient.getQueryData('staff-stats');

        // Optimistically update staff list
        const optimisticStaffMember = {
          id: Date.now(), // Temporary ID
          name: newStaff.name,
          email: newStaff.email,
          role: newStaff.role,
          status: 'PENDING' as const,
          hasAccess: false,
          department: newStaff.department || '',
          position: newStaff.position || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData('staff', (old: any) => ({
          ...old,
          staff: [...(old?.staff || []), optimisticStaffMember],
        }));

        // Optimistically update stats
        queryClient.setQueryData('staff-stats', (old: any) => ({
          ...old,
          stats: {
            ...old?.stats,
            totalStaff: (old?.stats?.totalStaff || 0) + 1,
            employeeCount: newStaff.role === 'EMPLOYEE' ? (old?.stats?.employeeCount || 0) + 1 : (old?.stats?.employeeCount || 0),
            adminCount: newStaff.role === 'ADMIN' ? (old?.stats?.adminCount || 0) + 1 : (old?.stats?.adminCount || 0),
          },
        }));

        return { previousStaff, previousStats };
      },
      onSuccess: (response) => {
        const emailStatus = response.data.emailSent ? 
          '✅ Verification email sent successfully!' : 
          '❌ Failed to send verification email - check SMTP settings';
        
        // Show enhanced success message prominently in screen
        toast.success(
          `🎉 Staff member created successfully!\n${emailStatus}\n📋 Check notification panel for staff notification!`, 
          {
            duration: 8000,
            position: 'top-center',
            style: {
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '16px',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              border: '2px solid #34D399',
              maxWidth: '500px',
              textAlign: 'center',
              whiteSpace: 'pre-line'
            }
          }
        );
        
        // Also show a secondary notification about the notification panel
        setTimeout(() => {
          toast.success('🔔 New staff notification created! Check the notification bell.', {
            duration: 6000,
            position: 'top-right',
            style: {
              background: '#3B82F6',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px'
            }
          });
        }, 1000);
        
        setShowInviteForm(false);
        reset();
        
        // Immediate refresh of notifications (no delay)
        queryClient.invalidateQueries('staff');
        queryClient.invalidateQueries('staff-stats');
        // Force refresh notifications immediately for better UX
        queryClient.invalidateQueries('global-notifications');
        queryClient.invalidateQueries('global-notification-count');
        
        // Trigger dashboard refresh immediately
        refreshAfterStaff();
        
        // Also trigger a second refresh after 2 seconds to ensure notification appears
        setTimeout(() => {
          console.log('🔔 Force refreshing notifications after staff creation...');
          queryClient.invalidateQueries('global-notifications');
          queryClient.invalidateQueries('global-notification-count');
        }, 2000);
      },
      onError: (error: any, _, context) => {
        // Rollback optimistic updates
        if (context?.previousStaff) {
          queryClient.setQueryData('staff', context.previousStaff);
        }
        if (context?.previousStats) {
          queryClient.setQueryData('staff-stats', context.previousStats);
        }
        
        toast.error(error.response?.data?.message || 'Failed to create staff member');
      },
    }
  );

  // Delete staff mutation with optimistic updates
  const deleteMutation = useMutation(
    async (userId: number) => {
      return api.delete(`/api/staff/${userId}`);
    },
    {
      onMutate: async (userId) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries('staff');
        await queryClient.cancelQueries('staff-stats');

        // Snapshot the previous values
        const previousStaff = queryClient.getQueryData('staff');
        const previousStats = queryClient.getQueryData('staff-stats');

        // Find the staff member to delete
        const staffToDelete = staff.find(member => member.id === userId);

        // Optimistically remove from staff list
        queryClient.setQueryData('staff', (old: any) => ({
          ...old,
          staff: old?.staff?.filter((member: any) => member.id !== userId) || [],
        }));

        // Optimistically update stats
        if (staffToDelete) {
          queryClient.setQueryData('staff-stats', (old: any) => ({
            ...old,
            stats: {
              ...old?.stats,
              totalStaff: Math.max(0, (old?.stats?.totalStaff || 0) - 1),
              employeeCount: staffToDelete.role === 'EMPLOYEE' ? Math.max(0, (old?.stats?.employeeCount || 0) - 1) : (old?.stats?.employeeCount || 0),
              adminCount: staffToDelete.role === 'ADMIN' ? Math.max(0, (old?.stats?.adminCount || 0) - 1) : (old?.stats?.adminCount || 0),
              activeStaff: staffToDelete.status === 'ACTIVE' ? Math.max(0, (old?.stats?.activeStaff || 0) - 1) : (old?.stats?.activeStaff || 0),
            },
          }));
        }

        return { previousStaff, previousStats };
      },
      onSuccess: () => {
        toast.success('🗑️ Staff member deleted successfully!', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            fontWeight: 'bold'
          }
        });
        
        // Background sync after 100ms
        setTimeout(() => {
          queryClient.invalidateQueries('staff');
          queryClient.invalidateQueries('staff-stats');
          // Invalidate notifications to refresh notification panel
          queryClient.invalidateQueries('global-notifications');
          queryClient.invalidateQueries('global-notification-count');
        }, 100);
      },
      onError: (error: any, _, context) => {
        // Rollback optimistic updates
        if (context?.previousStaff) {
          queryClient.setQueryData('staff', context.previousStaff);
        }
        if (context?.previousStats) {
          queryClient.setQueryData('staff-stats', context.previousStats);
        }
        
        toast.error(error.response?.data?.message || 'Failed to delete staff member');
      },
    }
  );

  // Revoke access mutation with optimistic updates
  const revokeAccessMutation = useMutation(
    async (userId: number) => {
      return api.post(`/api/staff/${userId}/revoke-access`);
    },
    {
      onMutate: async (userId) => {
        await queryClient.cancelQueries('staff');
        const previousStaff = queryClient.getQueryData('staff');

        // Optimistically update access status
        queryClient.setQueryData('staff', (old: any) => ({
          ...old,
          staff: old?.staff?.map((member: any) => 
            member.id === userId 
              ? { ...member, hasAccess: false, status: 'INACTIVE' }
              : member
          ) || [],
        }));

        return { previousStaff };
      },
      onSuccess: () => {
        toast.success('🚫 Access revoked successfully! Notification sent via email.', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#F59E0B',
            color: '#fff',
            fontWeight: 'bold'
          }
        });
        
        setTimeout(() => {
          queryClient.invalidateQueries('staff');
          queryClient.invalidateQueries('staff-stats');
        }, 100);
      },
      onError: (error: any, _, context) => {
        if (context?.previousStaff) {
          queryClient.setQueryData('staff', context.previousStaff);
        }
        toast.error(error.response?.data?.message || 'Failed to revoke access');
      },
    }
  );

  // Grant access mutation with optimistic updates
  const grantAccessMutation = useMutation(
    async (userId: number) => {
      return api.post(`/api/staff/${userId}/grant-access`);
    },
    {
      onMutate: async (userId) => {
        await queryClient.cancelQueries('staff');
        const previousStaff = queryClient.getQueryData('staff');

        // Optimistically update access status
        queryClient.setQueryData('staff', (old: any) => ({
          ...old,
          staff: old?.staff?.map((member: any) => 
            member.id === userId 
              ? { ...member, hasAccess: true, status: 'ACTIVE' }
              : member
          ) || [],
        }));

        return { previousStaff };
      },
      onSuccess: (response) => {
        toast.success(`✅ Access granted! ${response.data.newAccessLinkSent ? 'New access link sent via email.' : 'Failed to send email.'}`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: '#fff',
            fontWeight: 'bold'
          }
        });
        
        setTimeout(() => {
          queryClient.invalidateQueries('staff');
          queryClient.invalidateQueries('staff-stats');
        }, 100);
      },
      onError: (error: any, _, context) => {
        if (context?.previousStaff) {
          queryClient.setQueryData('staff', context.previousStaff);
        }
        toast.error(error.response?.data?.message || 'Failed to grant access');
      },
    }
  );

  // Resend verification email mutation with optimistic updates
  const resendVerificationMutation = useMutation(
    async (userId: number) => {
      return api.post(`/api/staff/resend-verification/${userId}`);
    },
    {
      onSuccess: (response) => {
        toast.success(`📧 Verification email ${response.data.emailSent ? 'sent successfully!' : 'failed to send.'}`, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: response.data.emailSent ? '#10B981' : '#EF4444',
            color: '#fff',
            fontWeight: 'bold'
          }
        });
        
        setTimeout(() => {
          queryClient.invalidateQueries('staff');
        }, 100);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to resend verification email');
      },
    }
  );

  const onCreateSubmit = (data: StaffFormData) => {
    createStaffMutation.mutate(data);
  };

  const togglePasswordVisibility = (staffId: number) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [staffId]: !prev[staffId]
    }));
  };

  const handleDeleteStaff = (userId: number) => {
    // Direct delete without confirmation dialog
    deleteMutation.mutate(userId);
  };

  const handleViewStaff = (member: StaffMember) => {
    setViewingStaff(member);
    setShowViewModal(true);
  };

  const toggleStaffAvailability = (staffId: number) => {
    setStaffAvailability(prev => ({
      ...prev,
      [staffId]: prev[staffId] === 'Active' ? 'Inactive' : 'Active'
    }));
  };

  const filteredStaff = staff?.filter((member: any) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'EMPLOYEE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get client count for each staff member - UPDATED TO MATCH MOCK DATA
  const getClientCount = (staffId: number) => {
    const clientCounts: {[key: number]: number} = {
      1: 3, // Perivi - 3 clients
      2: 2, // Venkat - 2 clients
      3: 3, // Harish - 3 clients (corrected from 4)
      4: 0, // Dinesh - 0 clients (Available for Assignment - Ready for New Clients)
      5: 1, // Nunciya - 1 client
      6: 2, // Admin User (business) - 2 clients
      7: 1  // Admin User (gmail) - 1 client
    };
    return clientCounts[staffId] || 0;
  };

  // Function to get assigned client names for each staff member - UPDATED TO MATCH MOCK DATA
  const getAssignedClientName = (staffId: number) => {
    const clientAssignments: {[key: number]: string | null} = {
      1: 'Rajesh Kumar, Priya Sharma, Amit Patel', // Perivi - 3 clients
      2: 'Sunita Gupta, Vikram Singh', // Venkat - 2 clients  
      3: 'Anita Desai, Ravi Mehta, Sanjay Joshi', // Harish - 3 clients
      4: null, // Dinesh - Available for Assignment - Ready for New Clients
      5: 'Deepak Verma', // Nunciya - 1 client
      6: 'Neha Agarwal, Rohit Sharma', // Admin User (business) - 2 clients
      7: 'Manish Gupta'  // Admin User (gmail) - 1 client
    };
    return clientAssignments[staffId] || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Staff Client Count Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        {staff && staff.slice(0, 7).map((member: any) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {member.role}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Clients Taken</span>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                  staffAvailability[member.id] === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {staffAvailability[member.id] === 'Active' ? '🟢' : '🔴'}
                </span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold text-blue-600">
                  {getClientCount(member.id)}
                </div>
                <div className="text-xs text-gray-500">
                  {getClientCount(member.id) === 1 ? 'Client' : 'Clients'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage team members and their roles</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => refetch()}
            className="btn-secondary inline-flex items-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSelectedRole('ADMIN');
                setShowInviteForm(true);
                // Pre-select ADMIN role
                setTimeout(() => setValue('role', 'ADMIN'), 100);
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Add Admin
            </button>
            <button
              onClick={() => {
                setSelectedRole('EMPLOYEE');
                setShowInviteForm(true);
                // Pre-select EMPLOYEE role
                setTimeout(() => setValue('role', 'EMPLOYEE'), 100);
              }}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center shadow-md hover:shadow-lg transition-all duration-200"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setShowInviteForm(false);
                    setSelectedRole(null);
                    setEditingStaff(null);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  title="Back to Staff Management"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingStaff ? 
                      `Edit ${editingStaff.name}` :
                      selectedRole === 'ADMIN' ? 'Add New Admin' : 
                      selectedRole === 'EMPLOYEE' ? 'Add New Employee' : 
                      'Add New Staff Member'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {editingStaff ?
                      `Update ${editingStaff.role.toLowerCase()} account details` :
                      selectedRole === 'ADMIN' ? 'Create admin account with full access' :
                      selectedRole === 'EMPLOYEE' ? 'Create employee account with limited access' :
                      'Fill details and send verification email'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowInviteForm(false);
                  setSelectedRole(null);
                  setEditingStaff(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    type="text"
                    className="input-field"
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    className="input-field"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {editingStaff ? '(leave blank to keep current)' : '*'}
                  </label>
                  <input
                    {...register('password', {
                      required: editingStaff ? false : 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type="password"
                    className="input-field"
                    placeholder={editingStaff ? "Leave blank to keep current password" : "Enter password"}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className={`input-field ${selectedRole ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={!!selectedRole}
                  >
                    <option value="">Select Role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="EMPLOYEE">Employee</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>
              </div>


              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteForm(false);
                    setSelectedRole(null);
                    setEditingStaff(null);
                    reset();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createStaffMutation.isLoading}
                  className="btn-primary disabled:opacity-50"
                >
                  {createStaffMutation.isLoading ? 
                    (editingStaff ? 'Updating...' : 'Creating...') : 
                    (editingStaff ? 'Update Staff' : 'Create Staff & Send Access Link')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Search */}
      <div className="card">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Staff List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {filteredStaff && filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Sl No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Password
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((member: any, index: number) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-50 transition-all duration-200 border-b border-gray-100"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 text-center">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 font-mono">
                          {visiblePasswords[member.id] ? (member.password || '12345678') : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(member.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title={visiblePasswords[member.id] ? 'Hide password' : 'Show password'}
                        >
                          {visiblePasswords[member.id] ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        member.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border border-green-200' :
                        member.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(member.clientName || getAssignedClientName(member.id)) ? (
                          <div className="max-w-xs">
                            <div className="truncate font-medium" title={member.clientName || getAssignedClientName(member.id) || ''}>
                              {member.clientName || getAssignedClientName(member.id)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getClientCount(member.id)} {getClientCount(member.id) === 1 ? 'client' : 'clients'}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-medium">Available for Assignment</span>
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Ready for New Clients
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStaffAvailability(member.id)}
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-all duration-200 hover:shadow-md ${
                          staffAvailability[member.id] === 'Active' 
                            ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                        }`}
                        title={`Click to toggle to ${staffAvailability[member.id] === 'Active' ? 'Inactive' : 'Active'}`}
                      >
                        {staffAvailability[member.id] === 'Active' ? (
                          <>🟢 Active</>
                        ) : (
                          <>🔴 Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.lastLogin ? new Date(member.lastLogin).toLocaleTimeString() : 'No login yet'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        {/* View Staff Member Details */}
                        <button
                          onClick={() => handleViewStaff(member)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                          title="View Staff Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        {member.status === 'PENDING' && (
                          <button
                            onClick={() => resendVerificationMutation.mutate(member.id)}
                            disabled={resendVerificationMutation.isLoading}
                            className="inline-flex items-center px-2 py-1 border border-orange-300 rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 transition-colors"
                            title="Resend Verification Email"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingStaff(member);
                            setSelectedRole(member.role);
                            setShowInviteForm(true);
                            // Pre-fill form with existing data
                            setTimeout(() => {
                              setValue('name', member.name);
                              setValue('email', member.email);
                              setValue('role', member.role);
                            }, 100);
                          }}
                          className="inline-flex items-center px-2 py-1 border border-blue-300 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Edit Staff Member"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {member.hasAccess ? (
                          <button
                            onClick={() => revokeAccessMutation.mutate(member.id)}
                            disabled={revokeAccessMutation.isLoading}
                            className="inline-flex items-center px-2 py-1 border border-red-300 rounded-md text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
                            title="Revoke Access"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => grantAccessMutation.mutate(member.id)}
                            disabled={grantAccessMutation.isLoading}
                            className="inline-flex items-center px-2 py-1 border border-green-300 rounded-md text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 transition-colors"
                            title="Grant Access"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          disabled={deleteMutation.isLoading}
                          className="inline-flex items-center px-2 py-1 border border-red-300 rounded-md text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
                          title="Delete Staff"
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
            <UserPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No staff members found.</p>
            <button
              onClick={() => setShowInviteForm(true)}
              className="btn-primary inline-flex items-center mt-4"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Invite First Staff Member
            </button>
          </div>
        )}
      </motion.div>

      {/* Staff Statistics */}
      {staff && staff.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalStaff || 0}
            </div>
            <div className="text-sm text-gray-600">Total Staff</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.activeStaff || 0}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.adminCount || 0}
            </div>
            <div className="text-sm text-gray-600">Admins</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.employeeCount || 0}
            </div>
            <div className="text-sm text-gray-600">Employees</div>
          </div>
        </motion.div>
      )}

      {/* View Staff Modal */}
      {showViewModal && viewingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Staff Member Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-xl font-medium text-white">
                    {viewingStaff.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-gray-900">{viewingStaff.name}</h4>
                  <p className="text-gray-600">{viewingStaff.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(viewingStaff.role)}`}>
                      {viewingStaff.role}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      viewingStaff.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border border-green-200' :
                      viewingStaff.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {viewingStaff.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded">
                        {visiblePasswords[viewingStaff.id] ? (viewingStaff.password || '12345678') : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(viewingStaff.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title={visiblePasswords[viewingStaff.id] ? 'Hide password' : 'Show password'}
                      >
                        {visiblePasswords[viewingStaff.id] ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available</label>
                    <button
                      onClick={() => toggleStaffAvailability(viewingStaff.id)}
                      className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full cursor-pointer transition-all duration-200 hover:shadow-md ${
                        staffAvailability[viewingStaff.id] === 'Active' 
                          ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                      }`}
                      title={`Click to toggle to ${staffAvailability[viewingStaff.id] === 'Active' ? 'Inactive' : 'Active'}`}
                    >
                      {staffAvailability[viewingStaff.id] === 'Active' ? (
                        <>🟢 Active</>
                      ) : (
                        <>🔴 Inactive</>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                    <div className="text-sm text-gray-900">
                      {viewingStaff.lastLogin ? new Date(viewingStaff.lastLogin).toLocaleDateString() : 'Never'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {viewingStaff.lastLogin ? new Date(viewingStaff.lastLogin).toLocaleTimeString() : 'No login yet'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(viewingStaff.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Updated:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(viewingStaff.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEditingStaff(viewingStaff);
                  setSelectedRole(viewingStaff.role);
                  setShowViewModal(false);
                  setShowInviteForm(true);
                  setTimeout(() => {
                    setValue('name', viewingStaff.name);
                    setValue('email', viewingStaff.email);
                    setValue('role', viewingStaff.role);
                  }, 100);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Edit Staff
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default StaffManagement;
