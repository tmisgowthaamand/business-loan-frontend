import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from 'react-query';
import { renderDataPersistence } from '../services/renderDataPersistence';
import { crossModuleSync } from '../services/crossModuleSync';
import api from '../lib/api';
import toast from 'react-hot-toast';

/**
 * Enhanced React Query hooks for Render deployment
 * Ensures data persistence across page refreshes, login/logout, and server restarts
 */

// Enhanced Enquiries Hook
export const useEnquiries = (options?: Partial<UseQueryOptions>) => {
  return useQuery(
    ['enquiries'],
    async () => {
      return renderDataPersistence.fetchModuleData('/api/enquiries', 'enquiries', []);
    },
    {
      ...renderDataPersistence.getQueryConfig('enquiries'),
      ...options,
      select: (data) => data || renderDataPersistence.getFallbackData('enquiries')
    }
  );
};

// Enhanced Documents Hook
export const useDocuments = (enquiryId?: number, options?: Partial<UseQueryOptions>) => {
  const queryKey = enquiryId ? ['documents', enquiryId] : ['documents'];
  const endpoint = enquiryId ? `/api/documents?enquiryId=${enquiryId}` : '/api/documents';
  
  return useQuery(
    queryKey,
    async () => {
      return renderDataPersistence.fetchModuleData(endpoint, 'documents', []);
    },
    {
      ...renderDataPersistence.getQueryConfig('documents'),
      ...options,
      select: (data) => data || renderDataPersistence.getFallbackData('documents')
    }
  );
};

// Enhanced Shortlist Hook
export const useShortlist = (options?: Partial<UseQueryOptions>) => {
  return useQuery(
    ['shortlist'],
    async () => {
      return renderDataPersistence.fetchModuleData('/api/shortlist', 'shortlist', []);
    },
    {
      ...renderDataPersistence.getQueryConfig('shortlist'),
      ...options,
      select: (data) => data || renderDataPersistence.getFallbackData('shortlist')
    }
  );
};

// Enhanced Staff Hook
export const useStaff = (options?: Partial<UseQueryOptions>) => {
  return useQuery(
    ['staff'],
    async () => {
      const data = await renderDataPersistence.fetchModuleData('/api/staff', 'staff', []);
      // Handle both array and object responses from staff API
      if (Array.isArray(data)) {
        return data;
      }
      return (data as any)?.staff || data || renderDataPersistence.getFallbackData('staff');
    },
    {
      ...renderDataPersistence.getQueryConfig('staff'),
      ...options,
      select: (data) => data || renderDataPersistence.getFallbackData('staff')
    }
  );
};

// Enhanced Payment Gateway Hook
export const usePayments = (options?: Partial<UseQueryOptions>) => {
  return useQuery(
    ['payments'],
    async () => {
      // Try multiple endpoints for payment gateway
      try {
        return await renderDataPersistence.fetchModuleData('/api/cashfree/applications', 'payments', []);
      } catch (error) {
        return await renderDataPersistence.fetchModuleData('/api/cashfree', 'payments', []);
      }
    },
    {
      ...renderDataPersistence.getQueryConfig('payments'),
      ...options,
      select: (data) => data || renderDataPersistence.getFallbackData('payments')
    }
  );
};

// Enhanced Transactions Hook
export const useTransactions = (options?: Partial<UseQueryOptions>) => {
  return useQuery(
    ['transactions'],
    async () => {
      return renderDataPersistence.fetchModuleData('/api/transactions', 'transactions', []);
    },
    {
      ...renderDataPersistence.getQueryConfig('transactions'),
      ...options,
      select: (data) => data || renderDataPersistence.getFallbackData('transactions')
    }
  );
};

// Enhanced Notifications Hook
export const useEnhancedNotifications = (options?: Partial<UseQueryOptions>) => {
  return useQuery(
    ['notifications'],
    async () => {
      const data = await renderDataPersistence.fetchModuleData('/api/notifications', 'notifications', []);
      // Handle both array and object responses from notifications API
      if (Array.isArray(data)) {
        return data;
      }
      return (data as any)?.notifications || data || renderDataPersistence.getFallbackData('notifications');
    },
    {
      ...renderDataPersistence.getQueryConfig('notifications'),
      ...options,
      select: (data) => data || renderDataPersistence.getFallbackData('notifications')
    }
  );
};

// Enhanced Notification Count Hook
export const useNotificationCount = (options?: Partial<UseQueryOptions>) => {
  return useQuery(
    ['notification-count'],
    async () => {
      try {
        const response = await api.get('/api/notifications/count');
        return response.data?.unreadCount || 0;
      } catch (error) {
        console.error('❌ [NOTIFICATIONS] Count fetch error:', error);
        return 0;
      }
    },
    {
      ...renderDataPersistence.getQueryConfig('notification-count', { 
        refetchInterval: 30 * 1000, // Check count every 30 seconds
        staleTime: 30 * 1000 
      }),
      ...options
    }
  );
};

// Enhanced Mutation Hooks with Optimistic Updates

// Create Enquiry Mutation
export const useCreateEnquiry = (options?: UseMutationOptions<any, any, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (enquiryData: any) => {
      const response = await api.post('/api/enquiries', enquiryData);
      return response.data;
    },
    {
      onMutate: async (newEnquiry) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(['enquiries']);
        
        // Snapshot previous value
        const previousEnquiries = queryClient.getQueryData(['enquiries']);
        
        // Optimistically update
        queryClient.setQueryData(['enquiries'], (old: any[]) => {
          const optimisticEnquiry = {
            id: Date.now(),
            ...newEnquiry,
            createdAt: new Date().toISOString(),
            interestStatus: 'INTERESTED'
          };
          return [optimisticEnquiry, ...(old || [])];
        });
        
        return { previousEnquiries };
      },
      onError: (err, newEnquiry, context: any) => {
        // Rollback on error
        if (context?.previousEnquiries) {
          queryClient.setQueryData(['enquiries'], context.previousEnquiries);
        }
        toast.error('Failed to create enquiry');
      },
      onSuccess: (data) => {
        toast.success('Enquiry created successfully!');
        queryClient.invalidateQueries(['enquiries']);
        queryClient.invalidateQueries(['dashboard-data']);
        
        // Notify cross-module sync
        crossModuleSync.notifyDataChange({
          type: 'CREATE',
          module: 'enquiries',
          data: data,
          timestamp: Date.now()
        });
      },
      ...options
    }
  );
};

// Upload Document Mutation
export const useUploadDocument = (options?: UseMutationOptions<any, any, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (formData: FormData) => {
      const response = await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Optimistically add document to cache
        if (data?.document) {
          queryClient.setQueryData(['documents'], (old: any[]) => {
            return [data.document, ...(old || [])];
          });
        }
        queryClient.invalidateQueries(['documents']);
        queryClient.invalidateQueries(['dashboard-data']);
        toast.success('Document uploaded successfully!');
        
        // Notify cross-module sync
        crossModuleSync.notifyDataChange({
          type: 'CREATE',
          module: 'documents',
          data: data?.document,
          timestamp: Date.now()
        });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to upload document');
      },
      ...options
    }
  );
};

// Add to Shortlist Mutation
export const useAddToShortlist = (options?: UseMutationOptions<any, any, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (shortlistData: any) => {
      const response = await api.post('/api/shortlist', shortlistData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Optimistically add to shortlist cache
        if (data?.shortlist) {
          queryClient.setQueryData(['shortlist'], (old: any[]) => {
            return [data.shortlist, ...(old || [])];
          });
        }
        queryClient.invalidateQueries(['shortlist']);
        queryClient.invalidateQueries(['dashboard-data']);
        toast.success('Added to shortlist successfully!');
        
        // Notify cross-module sync
        crossModuleSync.notifyDataChange({
          type: 'CREATE',
          module: 'shortlist',
          data: data?.shortlist,
          timestamp: Date.now()
        });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add to shortlist');
      },
      ...options
    }
  );
};

// Create Payment Application Mutation
export const useCreatePaymentApplication = (options?: UseMutationOptions<any, any, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (paymentData: any) => {
      const response = await api.post('/api/cashfree/apply', paymentData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Optimistically add to payments cache
        if (data?.application) {
          queryClient.setQueryData(['payments'], (old: any[]) => {
            return [data.application, ...(old || [])];
          });
        }
        queryClient.invalidateQueries(['payments']);
        queryClient.invalidateQueries(['dashboard-data']);
        toast.success('Payment application submitted successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to submit payment application');
      },
      ...options
    }
  );
};

// Create Staff Member Mutation
export const useCreateStaff = (options?: UseMutationOptions<any, any, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (staffData: any) => {
      const response = await api.post('/api/staff', staffData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Optimistically add to staff cache
        if (data?.staff) {
          queryClient.setQueryData(['staff'], (old: any[]) => {
            return [data.staff, ...(old || [])];
          });
        }
        queryClient.invalidateQueries(['staff']);
        queryClient.invalidateQueries(['dashboard-data']);
        toast.success('Staff member created successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create staff member');
      },
      ...options
    }
  );
};

// Create Transaction Mutation
export const useCreateTransaction = (options?: UseMutationOptions<any, any, any>) => {
  const queryClient = useQueryClient();
  
  return useMutation(
    async (transactionData: any) => {
      const response = await api.post('/api/transactions', transactionData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Optimistically add to transactions cache
        if (data?.transaction) {
          queryClient.setQueryData(['transactions'], (old: any[]) => {
            return [data.transaction, ...(old || [])];
          });
        }
        queryClient.invalidateQueries(['transactions']);
        queryClient.invalidateQueries(['dashboard-data']);
        toast.success('Transaction created successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create transaction');
      },
      ...options
    }
  );
};

// Utility hook for refreshing all data
export const useRefreshAllData = () => {
  const queryClient = useQueryClient();
  
  return async () => {
    console.log('🔄 [REFRESH] Refreshing all module data...');
    await renderDataPersistence.refreshAllModules();
    toast.success('All data refreshed!');
  };
};
