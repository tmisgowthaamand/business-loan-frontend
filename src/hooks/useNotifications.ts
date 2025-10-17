import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api.ts';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'loan' | 'document' | 'payment' | 'staff' | 'system';
  userId?: string;
  userRole?: 'ADMIN' | 'EMPLOYEE';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
  metadata?: {
    entityId?: string;
    entityType?: string;
    actionType?: string;
    [key: string]: any;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export function useNotifications(autoRefresh: boolean = true) {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
  });

  const fetchNotifications = useCallback(async (options?: {
    category?: string;
    isRead?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.isRead !== undefined) params.append('isRead', options.isRead.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const response = await api.get(`/api/notifications?${params.toString()}`);
      
      setState(prev => ({
        ...prev,
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount,
        loading: false
      }));
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || 'Failed to fetch notifications',
        loading: false
      }));
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/api/notifications/unread-count');
      setState(prev => ({
        ...prev,
        unreadCount: response.data.count
      }));
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1)
      }));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await api.put('/api/notifications/mark-all-read');
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif => ({ ...notif, isRead: true })),
        unreadCount: 0
      }));

      toast.success(`Marked ${response.data.markedCount} notifications as read`);
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      
      setState(prev => {
        const notification = prev.notifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.isRead;
        
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
        };
      });

      toast.success('Notification deleted');
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  }, []);

  const createTestNotification = useCallback(async () => {
    try {
      const response = await api.post('/api/notifications/test');
      
      // Add the new notification to the beginning of the list
      setState(prev => ({
        ...prev,
        notifications: [response.data, ...prev.notifications],
        unreadCount: prev.unreadCount + 1
      }));

      toast.success('Test notification created!');
    } catch (error: any) {
      console.error('Error creating test notification:', error);
      toast.error('Failed to create test notification');
    }
  }, []);

  // Auto-refresh notifications
  useEffect(() => {
    fetchNotifications();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000); // Check for new notifications every 30 seconds

      return () => clearInterval(interval);
    }
  }, [fetchNotifications, fetchUnreadCount, autoRefresh]);

  // Simulate real-time updates (in a real app, you'd use WebSocket)
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Randomly add a new notification for demo purposes
        if (Math.random() < 0.1) { // 10% chance every 30 seconds
          fetchNotifications();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchNotifications]);

  return {
    ...state,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createTestNotification,
    refresh: fetchNotifications
  };
}
