import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import IndividualDashboard from './IndividualDashboard';

// Mock data that simulates real backend data
const mockDashboardData = {
  stats: {
    totalEnquiries: 156,
    pendingReview: 23,
    approved: 89,
    rejected: 44,
    documentsAwaiting: 31,
    clientsShortlisted: 12,
    paymentGatewayComplete: 8,
    totalRevenue: 2450000,
    monthlyGrowth: 12.5,
    activeStaff: 15
  },
  enquiryFunnel: [
    { stage: 'Initial Enquiry', count: 156, percentage: 100, color: 'bg-blue-500' },
    { stage: 'Documents Submitted', count: 98, percentage: 62.8, color: 'bg-indigo-500' },
    { stage: 'Under Review', count: 67, percentage: 42.9, color: 'bg-purple-500' },
    { stage: 'Approved', count: 45, percentage: 28.8, color: 'bg-green-500' },
    { stage: 'Loan Disbursed', count: 23, percentage: 14.7, color: 'bg-emerald-500' }
  ],
  recentEnquiries: [
    {
      id: 1,
      name: 'TechCorp Solutions',
      contact: 'Rajesh Kumar',
      amount: '₹50,00,000',
      status: 'Under Review',
      date: '2 hours ago',
      priority: 'high'
    },
    {
      id: 2,
      name: 'Global Enterprises',
      contact: 'Priya Sharma',
      amount: '₹75,00,000',
      status: 'Approved',
      date: '5 hours ago',
      priority: 'medium'
    },
    {
      id: 3,
      name: 'StartupCorp',
      contact: 'Amit Patel',
      amount: '₹25,00,000',
      status: 'Pending Documents',
      date: '1 day ago',
      priority: 'low'
    },
    {
      id: 4,
      name: 'InnovateTech',
      contact: 'Sneha Reddy',
      amount: '₹1,20,00,000',
      status: 'Under Review',
      date: '2 days ago',
      priority: 'high'
    },
    {
      id: 5,
      name: 'BusinessHub',
      contact: 'Vikram Singh',
      amount: '₹35,00,000',
      status: 'Rejected',
      date: '3 days ago',
      priority: 'low'
    }
  ],
  rolePermissions: {
    employee: [
      { feature: 'Enquiry & Doc Verification', access: 'Active', color: 'text-green-600' },
      { feature: 'Basic Analytics View', access: 'Active', color: 'text-green-600' }
    ],
    admin: [
      { feature: 'Full Access - All Features', access: 'Full Access', color: 'text-blue-600' },
      { feature: 'Staff Management & System Control', access: 'Full Access', color: 'text-blue-600' }
    ]
  }
};

function ModernDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('overview');
  const { data: currentData, loading, error, refetch } = useDashboardData();

  // Handle enquiry actions
  const handleViewEnquiry = (enquiry: any) => {
    console.log('👁️ Viewing enquiry:', enquiry.name);
    navigate(`/enquiries?view=${enquiry.id}`);
  };

  const handleEditEnquiry = (enquiry: any) => {
    console.log('✏️ Editing enquiry:', enquiry.name);
    navigate(`/enquiries?edit=${enquiry.id}`);
  };

  const handleDeleteEnquiry = (enquiry: any) => {
    console.log('🗑️ Deleting enquiry:', enquiry.name);
    if (window.confirm(`Are you sure you want to delete enquiry for ${enquiry.name}?`)) {
      toast.success(`Enquiry for ${enquiry.name} deleted successfully`);
      // Here you would typically call an API to delete the enquiry
    }
  };

  const handleViewAllEnquiries = () => {
    console.log('📋 Navigating to all enquiries');
    navigate('/enquiries');
  };

  const [showIndividualDashboard, setShowIndividualDashboard] = useState(false);

  // Use real data with fallback to prevent crashes
  const dashboardData = currentData || {
    stats: {
      totalEnquiries: 0,
      pendingReview: 0,
      approved: 0,
      rejected: 0,
      documentsAwaiting: 0,
      clientsShortlisted: 0,
      paymentGatewayComplete: 0,
      totalTransactions: 0,
      completedTransactions: 0,
      pendingTransactions: 0,
      totalRevenue: 0,
      monthlyGrowth: 0,
      activeStaff: 0
    },
    enquiryFunnel: [],
    recentEnquiries: []
  };

  // If showing individual dashboard, render it instead
  if (showIndividualDashboard) {
    return <IndividualDashboard onSwitchToGlobal={() => setShowIndividualDashboard(false)} />;
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'interested':
        return 'bg-blue-100 text-blue-800';
      case 'not_interested':
        return 'bg-red-100 text-red-800';
      case 'under review':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending documents':
        return 'bg-orange-100 text-orange-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome Back, {user?.name || 'User'}!
              </h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening with your business today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-300 animate-pulse' : 'bg-green-300'}`}></div>
                  <p className="text-blue-100 text-sm">
                  {loading ? 'Updating...' : 'Auto-refreshes every 10 seconds'}
                </p>
                </div>
                <p className="text-blue-200 text-xs">
                  {currentData?.stats ? 
                    `${currentData.stats.totalEnquiries} enquiries • ${currentData.stats.activeStaff} staff • Last updated: ${new Date().toLocaleTimeString()}` :
                    'Loading data...'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowIndividualDashboard(true)}
                  className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all duration-200"
                  title="Switch to My Personal Dashboard"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  My Dashboard
                </button>
                <button
                  onClick={() => refetch()}
                  disabled={loading}
                  className={`inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all duration-200 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Refresh dashboard data"
                >
                  <svg className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? 'Updating...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-300" />
              <span className="text-sm">Revenue up {currentData?.stats?.monthlyGrowth || 0}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="h-5 w-5 text-blue-300" />
              <span className="text-sm">{currentData?.stats?.activeStaff || 0} Active Staff</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          {
            title: 'Total Enquiries',
            value: currentData.stats.totalEnquiries,
            icon: DocumentTextIcon,
            color: 'from-blue-500 to-blue-600',
            change: '+12%',
            trend: 'up'
          },
          {
            title: 'Documents Awaiting',
            value: currentData.stats.documentsAwaiting,
            icon: ClockIcon,
            color: 'from-orange-500 to-red-500',
            change: '+5%',
            trend: 'up'
          },
          {
            title: 'Clients Shortlisted',
            value: currentData.stats.clientsShortlisted,
            icon: CheckCircleIcon,
            color: 'from-green-500 to-emerald-600',
            change: '+8%',
            trend: 'up'
          },
          {
            title: 'Payment Gateway Complete',
            value: currentData.stats.paymentGatewayComplete,
            icon: CurrencyRupeeIcon,
            color: 'from-purple-500 to-indigo-600',
            change: '+15%',
            trend: 'up'
          },
          {
            title: 'Total Transactions',
            value: currentData.stats.totalTransactions,
            icon: ChartBarIcon,
            color: 'from-teal-500 to-cyan-600',
            change: '+10%',
            trend: 'up'
          }
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                  <span className="font-medium">{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enquiry Funnel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Enquiry Funnel
            </h2>
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {currentData.enquiryFunnel.map((stage: any, index: number) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">{stage.count}</span>
                    <span className="text-xs text-gray-500">({stage.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.percentage}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    className={`h-3 rounded-full ${stage.color} relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Conversion Rate</p>
                <p className="text-xs text-blue-700">
                  {((currentData.enquiryFunnel[4].count / currentData.enquiryFunnel[0].count) * 100).toFixed(1)}% 
                  of enquiries result in loan disbursement
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Role Permissions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Role Permissions
          </h2>
          
          <div className="space-y-4">
            {(user?.role === 'ADMIN' ? mockDashboardData.rolePermissions.admin : mockDashboardData.rolePermissions.employee).map((permission: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{permission.feature}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${permission.color} bg-current bg-opacity-10`}>
                  {permission.access}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Access Level</p>
                <p className="text-xs text-green-700">
                  {user?.role === 'ADMIN' ? 'Full administrative access' : 'Employee level access'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Enquiries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Enquiries
          </h2>
          <button 
            onClick={handleViewAllEnquiries}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">NAME</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">CONTACT</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">BUSINESS TYPE</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">STATUS</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">DATE</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {(currentData?.recentEnquiries || []).length > 0 ? (
                (currentData?.recentEnquiries || []).map((enquiry: any, index: number) => (
                  <motion.tr
                    key={enquiry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`border-b border-gray-100 hover:bg-gray-50 border-l-4 border-l-blue-500`}
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{enquiry.name || enquiry.businessName || 'N/A'}</div>
                      <div className="text-sm text-gray-600">{enquiry.mobile}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{enquiry.staff?.name || 'Unassigned'}</td>
                    <td className="py-4 px-4 text-gray-700">{enquiry.businessType || 'Not specified'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(enquiry.interestStatus)}`}>
                        {enquiry.interestStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewEnquiry(enquiry)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors duration-200" 
                          title="View Enquiry"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditEnquiry(enquiry)}
                          className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors duration-200" 
                          title="Edit Enquiry"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEnquiry(enquiry)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-200" 
                          title="Delete Enquiry"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <DocumentTextIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium">No enquiries yet</p>
                      <p className="text-sm">New enquiries will appear here automatically</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default ModernDashboard;
