import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';

// Import the configured API instance
import api from '../lib/api';

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
    
    // Additional Data
    [key: string]: any;
  };
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading, refetch } = useQuery(
    'global-notifications',
    async () => {
      try {
        console.log('🔔 Fetching notifications from /api/notifications...');
        const response = await api.get('/api/notifications');
        console.log('🔔 Notifications response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('🔔 Failed to fetch notifications:', error);
        if (error.response) {
          console.error('🔔 Response status:', error.response.status);
          console.error('🔔 Response data:', error.response.data);
        }
        // Return empty structure to prevent UI breaking
        return { notifications: [], count: 0 };
      }
    },
    {
      refetchInterval: 10000, // Refetch every 10 seconds
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: false,
      refetchOnMount: true,
      retry: 3,
      staleTime: 0, // Always consider data stale to ensure fresh fetches
      cacheTime: 5 * 60 * 1000, // 5 minutes cache
      onError: (error) => {
        console.error('🔔 Notifications query error:', error);
      },
      onSuccess: (data) => {
        console.log('🔔 Notifications query success:', data?.notifications?.length || 0, 'notifications');
        console.log('🔔 Full response data structure:', {
          hasNotifications: !!data?.notifications,
          isArray: Array.isArray(data?.notifications),
          count: data?.count,
          message: data?.message
        });
        if (data?.notifications && data.notifications.length > 0) {
          console.log('🔔 Sample notification:', data.notifications[0]);
          console.log('🔔 All notification IDs:', data.notifications.map((n: any) => n.id));
        }
      }
    }
  );

  // Fetch unread count
  const { data: countData } = useQuery(
    'global-notification-count',
    async () => {
      try {
        console.log('🔔 Fetching notification count from /api/notifications/count...');
        const response = await api.get('/api/notifications/count');
        console.log('🔔 Count response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('🔔 Failed to fetch notification count:', error);
        // Return zero count to prevent UI breaking
        return { unreadCount: 0 };
      }
    },
    {
      refetchInterval: 10000, // Refetch every 10 seconds
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: false,
      refetchOnMount: true,
      retry: 3,
      staleTime: 0, // Always consider data stale
      cacheTime: 5 * 60 * 1000, // 5 minutes cache
      onError: (error) => {
        console.error('🔔 Notification count query error:', error);
      },
      onSuccess: (data) => {
        console.log('🔔 Notification count query success:', data?.unreadCount || 0);
        console.log('🔔 Count data structure:', data);
      }
    }
  );

  // Update state when data changes
  useEffect(() => {
    console.log('🔔 NotificationsData changed:', notificationsData);
    console.log('🔔 Type of notificationsData:', typeof notificationsData);
    console.log('🔔 Is array:', Array.isArray(notificationsData));
    
    if (notificationsData?.notifications && Array.isArray(notificationsData.notifications)) {
      console.log('🔔 Updating notifications state with', notificationsData.notifications.length, 'notifications');
      console.log('🔔 First notification:', notificationsData.notifications[0]);
      console.log('🔔 All notification IDs:', notificationsData.notifications.map((n: any) => n.id));
      setNotifications(notificationsData.notifications);
    } else if (notificationsData) {
      console.log('🔔 No notifications array in response, setting empty array');
      console.log('🔔 Response structure:', notificationsData);
      console.log('🔔 Response keys:', Object.keys(notificationsData));
      setNotifications([]);
    } else {
      console.log('🔔 No notificationsData at all');
      setNotifications([]);
    }
  }, [notificationsData]);

  useEffect(() => {
    console.log('🔔 CountData changed:', countData);
    if (countData?.unreadCount !== undefined) {
      console.log('🔔 Updating unread count to:', countData.unreadCount);
      setUnreadCount(countData.unreadCount);
    } else {
      console.log('🔔 No unreadCount in countData');
    }
  }, [countData]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      
      // Update local state optimistically
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries('global-notifications');
      queryClient.invalidateQueries('global-notification-count');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/mark-all-read');
      
      // Update local state optimistically
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries('global-notifications');
      queryClient.invalidateQueries('global-notification-count');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const refreshNotifications = () => {
    console.log('🔔 Manual refresh triggered - invalidating queries');
    queryClient.invalidateQueries('global-notifications');
    queryClient.invalidateQueries('global-notification-count');
    refetch();
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    isLoading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
