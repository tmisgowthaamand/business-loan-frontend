import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import api from '../../lib';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'NEW_ENQUIRY' | 'DOCUMENT_UPLOADED' | 'DOCUMENT_VERIFIED' | 'SHORTLISTED' | 'PAYMENT_APPLIED' | 'STAFF_ADDED' | 'STATUS_UPDATED' | 'ENQUIRY_ASSIGNED' | 'ENQUIRY_COMPLETED';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  data?: {
    enquiryId?: number;
    clientName?: string;
    currentStatus?: string;
    previousStatus?: string;
    assignedStaff?: string;
    loanAmount?: number;
    businessType?: string;
    mobile?: string;
    updatedBy?: string;
    statusHistory?: Array<{
      status: string;
      timestamp: string;
      updatedBy?: string;
      notes?: string;
    }>;
    dateTime?: {
      date: string;
      time: string;
      dayOfWeek: string;
      timestamp: number;
    };
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
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={onClose}
          />

          {/* Enhanced Notification Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed right-4 top-4 bottom-4 w-[420px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden rounded-2xl border border-gray-200"
            style={{
              maxHeight: 'calc(100vh - 32px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20"></div>
              
              <div className="flex items-center space-x-4 relative z-10">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BellIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Notifications</h2>
                  <p className="text-indigo-100 text-sm font-medium">
                    {displayNotifications.length} total • 
                    <span className="text-yellow-200 font-semibold">{unreadCount} unread</span>
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-white hover:text-indigo-200 p-2 rounded-xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm relative z-10"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Status Bar */}
            <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">
                      {notifications && notifications.length > 0 ? 'Live Updates' : 'Demo Mode'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered');
                    refreshNotifications();
                    toast.success('Refreshing notifications...');
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-white text-gray-700 text-xs rounded-lg hover:bg-gray-50 border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span>🔄</span>
                  <span className="font-medium">Refresh</span>
                </button>
              </div>
            </div>


            {/* Enhanced Notification List */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {displayNotifications && displayNotifications.length > 0 ? (
                <div className="p-4 space-y-3">
                  {displayNotifications.map((notification, index) => {
                    const timeInfo = formatNotificationTime(notification.createdAt);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white border-l-4 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group ${
                          !notification.read ? 'border-l-blue-500 bg-blue-50/30' : 'border-l-gray-300'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {/* Header with Type and Priority */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm ${
                            getNotificationTypeColor(notification.type)
                          }`}>
                            {notification.type.replace('_', ' ')}
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            notification.priority === 'HIGH' ? 'text-red-700 bg-red-50 border-red-200' :
                            notification.priority === 'MEDIUM' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                            'text-green-700 bg-green-50 border-green-200'
                          }`}>
                            {notification.priority}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {notification.title}
                        </h3>
                        
                        {/* Message */}
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        {/* Enhanced Timestamp Section */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs font-semibold text-blue-600">⏰</span>
                                <span className="text-sm font-bold text-blue-600">{timeInfo.relativeTime}</span>
                              </div>
                              {!notification.read && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-medium text-blue-600">New</span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              📅 {timeInfo.fullTime}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <div className="mt-4 flex items-center justify-between">
                          <button className="flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                            <span>View Details</span>
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                          
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
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
                </div>
              )}
            </div>

            {/* Enhanced Footer */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={async () => {
                      try {
                        console.log('🔔 Creating test notification...');
                        await api.post('/api/notifications/test/create-sample');
                        toast.success('Test notification created!');
                        setTimeout(() => refreshNotifications(), 1000);
                      } catch (error) {
                        console.error('Failed to create test notification:', error);
                        toast.error('Failed to create test notification');
                      }
                    }}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors rounded-lg hover:bg-gray-50"
                  >
                    <span>⚡</span>
                    <span>Test</span>
                  </button>
                  
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center space-x-1 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span>✓</span>
                      <span>Mark all read ({unreadCount})</span>
                    </button>
                  )}
                </div>
                
                <button
                  onClick={onClose}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-lg hover:bg-gray-50"
                >
                  <span>✕</span>
                  <span>Close</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
