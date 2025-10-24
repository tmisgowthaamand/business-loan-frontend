import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useIndividualDashboard } from '../../hooks/useIndividualDashboard';

interface IndividualDashboardProps {
  onSwitchToGlobal?: () => void;
}

function IndividualDashboard({ onSwitchToGlobal }: IndividualDashboardProps) {
  const { user } = useAuth();
  const { data: dashboardData, loading: isLoading, refetch } = useIndividualDashboard();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'verified':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'interested':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_interested':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ENQUIRY':
        return DocumentTextIcon;
      case 'DOCUMENT':
        return CheckCircleIcon;
      case 'SHORTLIST':
        return StarIcon;
      case 'PAYMENT':
        return CurrencyRupeeIcon;
      default:
        return DocumentTextIcon;
    }
  };

  if (isLoading) {
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
        className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  My Personal Dashboard
                </h1>
                <p className="text-blue-100 text-lg">
                  Welcome back, {user?.name}! Here's your personal performance overview.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2 mb-1">
                  <TrophyIcon className="h-5 w-5 text-yellow-300" />
                  <p className="text-blue-100 text-sm">
                    Success Rate: {dashboardData.stats.successRate}%
                  </p>
                </div>
                <p className="text-blue-200 text-xs">
                  {dashboardData.stats.totalClientsHandled} clients handled • Role: {user?.role}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {onSwitchToGlobal && (
                  <button
                    onClick={onSwitchToGlobal}
                    className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all duration-200"
                    title="Switch to Global Dashboard"
                  >
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    Global Dashboard
                  </button>
                )}
                <button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className={`inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all duration-200 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Refresh my dashboard data"
                >
                  <svg className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isLoading ? 'Updating...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-300" />
              <span className="text-sm">Growth: {dashboardData.performanceMetrics.growth}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <FireIcon className="h-5 w-5 text-orange-300" />
              <span className="text-sm">This Week: {dashboardData.performanceMetrics.thisWeek} enquiries</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          {
            title: 'My Enquiries',
            value: dashboardData.stats.myEnquiries,
            icon: DocumentTextIcon,
            color: 'from-blue-500 to-blue-600',
            change: `+${dashboardData.stats.thisWeekEnquiries} this week`,
            trend: 'up'
          },
          {
            title: 'Documents Processed',
            value: dashboardData.stats.myDocumentsProcessed,
            icon: CheckCircleIcon,
            color: 'from-green-500 to-emerald-600',
            change: 'Verified',
            trend: 'up'
          },
          {
            title: 'Clients Shortlisted',
            value: dashboardData.stats.myShortlisted,
            icon: StarIcon,
            color: 'from-yellow-500 to-orange-500',
            change: 'Active',
            trend: 'up'
          },
          {
            title: 'Payment Applications',
            value: dashboardData.stats.myPaymentApplications,
            icon: CurrencyRupeeIcon,
            color: 'from-purple-500 to-indigo-600',
            change: 'Processed',
            trend: 'up'
          },
          {
            title: 'Pending Tasks',
            value: dashboardData.stats.myPendingTasks,
            icon: ClockIcon,
            color: 'from-red-500 to-pink-600',
            change: 'To Complete',
            trend: dashboardData.stats.myPendingTasks > 0 ? 'down' : 'up'
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              My Recent Activities
            </h2>
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity: any, index: number) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600">
                        Client: {activity.clientName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activities</p>
                <p className="text-sm text-gray-400">Your activities will appear here</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* My Clients */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              My Clients ({dashboardData.myClients.length})
            </h2>
            <UserIcon className="h-6 w-6 text-gray-400" />
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {dashboardData.myClients.length > 0 ? (
              dashboardData.myClients.map((client: any, index: number) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{client.name}</h3>
                      {client.isShortlisted && (
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                      )}
                      {client.hasPaymentApplication && (
                        <CurrencyRupeeIcon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{client.mobile}</p>
                    <p className="text-xs text-gray-500">{client.businessType}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {client.documentsCount} docs
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-blue-600 hover:text-blue-800" title="View Client">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-indigo-600 hover:text-indigo-800" title="Edit Client">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No clients assigned</p>
                <p className="text-sm text-gray-400">Clients will appear here when assigned to you</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Performance Summary
          </h2>
          <TrophyIcon className="h-6 w-6 text-yellow-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {dashboardData.stats.successRate}%
            </div>
            <div className="text-sm text-blue-700 font-medium">Success Rate</div>
            <div className="text-xs text-blue-600 mt-1">
              Conversion to Payment
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {dashboardData.stats.myCompletedTasks}
            </div>
            <div className="text-sm text-green-700 font-medium">Completed Tasks</div>
            <div className="text-xs text-green-600 mt-1">
              This Month
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {dashboardData.stats.thisMonthEnquiries}
            </div>
            <div className="text-sm text-purple-700 font-medium">This Month</div>
            <div className="text-xs text-purple-600 mt-1">
              New Enquiries
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {dashboardData.performanceMetrics.growth > 0 ? '+' : ''}{dashboardData.performanceMetrics.growth}%
            </div>
            <div className="text-sm text-orange-700 font-medium">Weekly Growth</div>
            <div className="text-xs text-orange-600 mt-1">
              vs Last Week
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default IndividualDashboard;
