import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import api from '../config/api';
import toast from 'react-hot-toast';

interface NotificationData {
  // Client Information
  enquiryId?: number;
  clientName?: string;
  name?: string;
  mobile?: string;
  businessType?: string;
  businessName?: string;
  
  // Document Information
  documentId?: number;
  documentType?: string;
  fileName?: string;
  verified?: boolean;
  verifiedBy?: string;
  uploadDate?: string;
  
  // Staff Information
  staffId?: number;
  staffName?: string;
  assignedBy?: string;
  
  // Status Information
  currentStatus?: string;
  previousStatus?: string;
  
  // Additional data
  [key: string]: any;
}

interface Notification {
  id: string;
  type: 'NEW_ENQUIRY' | 'DOCUMENT_UPLOADED' | 'DOCUMENT_VERIFIED' | 'DOCUMENT_PENDING' | 'DOCUMENT_REJECTED' | 'SHORTLISTED' | 'PAYMENT_APPLIED' | 'STAFF_ADDED' | 'STATUS_UPDATED';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  data?: NotificationData;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const EnhancedNotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const queryClient = useQueryClient();

  // Fetch notifications with enhanced error handling
  const { data: notificationsData, isLoading, refetch } = useQuery(
    'notifications',
    async () => {
      try {
        console.log('🔔 Fetching notifications from /api/notifications...');
        const response = await api.get('/api/notifications');
        console.log('🔔 Notifications response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('🔔 Failed to fetch notifications:', error);
        // Return sample notifications for demo
        return {
          notifications: getSampleNotifications(),
          count: getSampleNotifications().filter(n => !n.read).length
        };
      }
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: false,
      refetchOnMount: true,
      retry: 2,
      onSuccess: (data) => {
        console.log('🔔 Notifications query success:', data?.notifications?.length || 0, 'notifications');
        if (data?.notifications) {
          setNotifications(data.notifications);
        }
      },
      onError: (error) => {
        console.error('🔔 Notifications query error:', error);
        setNotifications(getSampleNotifications());
      }
    }
  );

  // Update notifications state when data changes
  useEffect(() => {
    if (notificationsData?.notifications) {
      console.log('🔔 Updating notifications state with', notificationsData.notifications.length, 'notifications');
      setNotifications(notificationsData.notifications);
    }
  }, [notificationsData]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      await refetch();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [refetch]);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await refetch();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }, [refetch]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      await refetch();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [refetch]);

  const refreshNotifications = useCallback(async () => {
    console.log('🔄 Refreshing notifications...');
    await refetch();
  }, [refetch]);

  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const response = await api.post('/api/notifications/system', {
        ...notification,
        userId: 1 // Default user for demo
      });
      
      if (response.data) {
        setNotifications(prev => [response.data, ...prev]);
        await refetch();
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }, [refetch]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    createNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Sample notifications for demo/fallback
function getSampleNotifications(): Notification[] {
  return [
    {
      id: 'doc_verify_1',
      type: 'DOCUMENT_VERIFIED',
      title: 'Document Verified',
      message: 'GST Certificate verified for BALAMURUGAN - ready for next step',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      read: false,
      priority: 'HIGH',
      data: {
        enquiryId: 1,
        clientName: 'BALAMURUGAN',
        documentType: 'GST Certificate',
        documentId: 1,
        verified: true,
        verifiedBy: 'Admin User'
      }
    },
    {
      id: 'doc_pending_1',
      type: 'DOCUMENT_PENDING',
      title: 'Document Awaiting Verification',
      message: 'Bank Statement uploaded by VIGNESH S - awaiting verification',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      read: false,
      priority: 'MEDIUM',
      data: {
        enquiryId: 2,
        clientName: 'VIGNESH S',
        documentType: 'Bank Statement',
        documentId: 2,
        verified: false,
        uploadDate: new Date().toISOString()
      }
    },
    {
      id: 'doc_uploaded_1',
      type: 'DOCUMENT_UPLOADED',
      title: 'New Document Uploaded',
      message: 'UDYAM Registration uploaded by Poorani - requires verification',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      read: false,
      priority: 'MEDIUM',
      data: {
        enquiryId: 3,
        clientName: 'Poorani',
        documentType: 'UDYAM Registration',
        documentId: 3,
        verified: false,
        uploadDate: new Date().toISOString()
      }
    },
    {
      id: 'enquiry_1',
      type: 'NEW_ENQUIRY',
      title: 'New Enquiry Received',
      message: 'New enquiry from Manigandan M for ₹10,00,000 manufacturing business loan',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      read: false,
      priority: 'HIGH',
      data: {
        enquiryId: 4,
        clientName: 'Manigandan M',
        businessType: 'Manufacturing',
        loanAmount: 1000000
      }
    },
    {
      id: 'shortlist_1',
      type: 'SHORTLISTED',
      title: 'Client Added to Shortlist',
      message: 'Rajesh Kumar has been added to shortlist - all documents verified',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      read: true,
      priority: 'HIGH',
      data: {
        enquiryId: 5,
        clientName: 'Rajesh Kumar',
        currentStatus: 'SHORTLISTED',
        previousStatus: 'DOCUMENT_VERIFICATION'
      }
    }
  ];
}
