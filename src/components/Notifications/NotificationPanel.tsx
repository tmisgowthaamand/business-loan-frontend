import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'NEW_ENQUIRY' | 'DOCUMENT_UPLOADED' | 'DOCUMENT_VERIFIED' | 'SHORTLISTED' | 'PAYMENT_APPLIED' | 'STAFF_ADDED' | 'STATUS_UPDATED' | 'ENQUIRY_ASSIGNED' | 'ENQUIRY_COMPLETED' | 'LOAN_APPROVED' | 'LOAN_REJECTED' | 'TRANSACTION_COMPLETED';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  data?: {
    // Client Information
    enquiryId?: number;
    clientName?: string;
    name?: string;
    mobile?: string;
    email?: string;
    source?: string;
    
    // Business Information
    businessType?: string;
    businessName?: string;
    annualRevenue?: string;
    gstStatus?: string;
    
    // Loan Information
    loanAmount?: number;
    loanPurpose?: string;
    interestRate?: string;
    tenure?: string;
    
    // Status & Assignment
    currentStatus?: string;
    previousStatus?: string;
    interestStatus?: string;
    assignedStaff?: string;
    updatedBy?: string;
    
    // Document Information
    documentType?: string;
    verified?: boolean;
    uploadDate?: string;
    fileSize?: string;
    
    // Payment Information
    applicationId?: string;
    paymentStatus?: string;
    paymentGateway?: string;
    transactionId?: string;
    
    // Activity Timeline
    statusHistory?: Array<{
      status: string;
      timestamp: string;
      updatedBy?: string;
      notes?: string;
    }>;
    
    // Date/Time Information
    dateTime?: {
      date: string;
      time: string;
      dayOfWeek: string;
      timestamp: number;
    };
    
    // Additional Data
    [key: string]: any;
  };
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  
  // Sample notifications for fallback
  const sampleNotifications: Notification[] = [
    {
      id: 'sample_1',
      type: 'NEW_ENQUIRY',
      title: 'New Client Application',
      message: 'New loan application from BALAMURUGAN (BALAMURUGAN)',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      read: false,
      priority: 'HIGH'
    },
    {
      id: 'sample_2', 
      type: 'DOCUMENT_VERIFIED',
      title: 'Document Verified',
      message: 'UDYAM REGISTRATION verified for priyakamaldkp',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      read: false,
      priority: 'MEDIUM'
    },
    {
      id: 'sample_3',
      type: 'DOCUMENT_VERIFIED', 
      title: 'Document Verified',
      message: 'BANK STATEMENT verified for priyakamaldkp',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      read: false,
      priority: 'MEDIUM'
    }
  ];
  
  // Debug logging for notifications
  console.log('🔔 NotificationPanel - notifications from context:', notifications);
  console.log('🔔 NotificationPanel - notifications length:', notifications?.length);
  console.log('🔔 NotificationPanel - unreadCount:', unreadCount);
  
  // Use real notifications if available, otherwise use sample notifications
  const displayNotifications = notifications && notifications.length > 0 ? notifications : sampleNotifications;
  
  console.log('🔔 NotificationPanel - displayNotifications:', displayNotifications);
  console.log('🔔 NotificationPanel - displayNotifications length:', displayNotifications?.length);
  
  // Force refresh when panel opens
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔔 Notification panel opened, refreshing...');
      console.log('🔔 Current notifications in context:', notifications);
      refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);


  // Enhanced timestamp formatting with full date/time
  const formatNotificationTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    // Relative time
    let relativeTime = '';
    if (diffInMinutes < 1) {
      relativeTime = 'Just now';
    } else if (diffInMinutes < 60) {
      relativeTime = `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      relativeTime = `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      if (days === 1) {
        relativeTime = '1d ago';
      } else if (days < 7) {
        relativeTime = `${days}d ago`;
      } else {
        relativeTime = notificationTime.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short'
        });
      }
    }
    
    // Full timestamp
    const fullTime = notificationTime.toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
    
    return { relativeTime, fullTime };
  };



  // Get notification type color
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'NEW_ENQUIRY': return 'bg-blue-500';
      case 'DOCUMENT_UPLOADED': return 'bg-yellow-500';
      case 'DOCUMENT_VERIFIED': return 'bg-green-500';
      case 'SHORTLISTED': return 'bg-purple-500';
      case 'PAYMENT_APPLIED': return 'bg-indigo-500';
      case 'STAFF_ADDED': return 'bg-gray-500';
      case 'STATUS_UPDATED': return 'bg-orange-500';
      case 'ENQUIRY_ASSIGNED': return 'bg-teal-500';
      case 'ENQUIRY_COMPLETED': return 'bg-emerald-500';
      case 'LOAN_APPROVED': return 'bg-green-600';
      case 'LOAN_REJECTED': return 'bg-red-500';
      case 'TRANSACTION_COMPLETED': return 'bg-teal-600';
      default: return 'bg-blue-500';
    }
  };




  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read using global context
    await markAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'NEW_ENQUIRY':
      case 'STATUS_UPDATED':
      case 'ENQUIRY_ASSIGNED':
      case 'ENQUIRY_COMPLETED':
      case 'LOAN_APPROVED':
      case 'LOAN_REJECTED':
        navigate('/enquiries');
        break;
      case 'DOCUMENT_UPLOADED':
      case 'DOCUMENT_VERIFIED':
        navigate('/documents');
        break;
      case 'SHORTLISTED':
        navigate('/shortlist');
        break;
      case 'PAYMENT_APPLIED':
        navigate('/payment-gateway');
        break;
      case 'STAFF_ADDED':
        navigate('/staff');
        break;
      case 'TRANSACTION_COMPLETED':
        navigate('/transactions');
        break;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-[9998]"
            onClick={onClose}
          />

          {/* Modern Notification Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed right-4 top-16 w-[400px] bg-white shadow-2xl z-[9999] rounded-2xl border border-gray-200 overflow-hidden"
            style={{
              maxHeight: 'calc(100vh - 80px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Clean Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50">
              <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-900 bg-white border-b-2 border-blue-500 relative">
                All
                {unreadCount > 0 && (
                  <span className="ml-2 bg-gray-900 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                Archived
              </button>
              <button className="p-3 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto bg-white">
              {displayNotifications && displayNotifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {displayNotifications.map((notification, index) => {
                    const timeInfo = formatNotificationTime(notification.createdAt);
                    
                    // Get notification icon and color based on type
                    const getNotificationIcon = (type: string) => {
                      switch (type) {
                        case 'NEW_ENQUIRY':
                          return { icon: '⚠️', color: 'text-red-500', bgColor: 'bg-red-50' };
                        case 'DOCUMENT_UPLOADED':
                        case 'DOCUMENT_VERIFIED':
                          return { icon: '👤', color: 'text-blue-500', bgColor: 'bg-blue-50' };
                        case 'SHORTLISTED':
                          return { icon: '$', color: 'text-green-500', bgColor: 'bg-green-50' };
                        case 'PAYMENT_APPLIED':
                          return { icon: '👤', color: 'text-purple-500', bgColor: 'bg-purple-50' };
                        case 'STAFF_ADDED':
                          return { icon: '🔄', color: 'text-blue-500', bgColor: 'bg-blue-50' };
                        case 'LOAN_APPROVED':
                          return { icon: '✅', color: 'text-green-500', bgColor: 'bg-green-50' };
                        case 'LOAN_REJECTED':
                          return { icon: '❌', color: 'text-red-500', bgColor: 'bg-red-50' };
                        default:
                          return { icon: '👤', color: 'text-gray-500', bgColor: 'bg-gray-50' };
                      }
                    };

                    const iconInfo = getNotificationIcon(notification.type);
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                          !notification.read ? 'bg-blue-50/30' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-10 h-10 ${iconInfo.bgColor} rounded-full flex items-center justify-center`}>
                            <span className="text-lg">{iconInfo.icon}</span>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <span className="text-xs text-gray-500">
                                    {timeInfo.relativeTime}
                                  </span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className={`text-xs font-medium ${
                                    notification.type === 'NEW_ENQUIRY' ? 'text-red-600' :
                                    notification.type === 'DOCUMENT_UPLOADED' ? 'text-blue-600' :
                                    notification.type === 'SHORTLISTED' ? 'text-green-600' :
                                    notification.type === 'PAYMENT_APPLIED' ? 'text-purple-600' :
                                    'text-gray-600'
                                  }`}>
                                    {notification.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex items-center space-x-2 ml-4">
                                {notification.type === 'DOCUMENT_UPLOADED' && (
                                  <>
                                    <button className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                      View
                                    </button>
                                    <button className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors">
                                      Download
                                    </button>
                                  </>
                                )}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                  <div className="bg-gray-100 rounded-full p-6 mb-6">
                    <BellIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">All caught up!</h3>
                  <p className="text-sm text-center text-gray-500 mb-6 max-w-xs">
                    No new notifications right now. We'll let you know when something important happens.
                  </p>
                  {unreadCount > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                      <p className="text-sm text-orange-700 font-medium mb-3">
                        🔍 {unreadCount} unread notifications detected but not loaded
                      </p>
                      <button
                        onClick={() => refreshNotifications()}
                        className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        🔄 Refresh Notifications
                      </button>
                    </div>
                  )}
                  
                  {/* Test buttons for development */}
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={async () => {
                        try {
                          await api.post('/api/notifications/test/staff-added');
                          toast.success('Test staff notification created!');
                          refreshNotifications();
                        } catch (error) {
                          toast.error('Failed to create test notification');
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      👤 Test Staff Notification
                    </button>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
