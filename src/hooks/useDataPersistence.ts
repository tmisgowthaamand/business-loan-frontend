import { useQuery, useQueryClient } from 'react-query';
import { QUERY_KEYS } from '../utils/queryKeys';
import api from '../config/api';

/**
 * Enhanced data persistence hook for all pages
 * Ensures data loads from Supabase and persists across refresh/navigation
 */

// Dashboard data persistence
export const useDashboardData = () => {
  return useQuery(
    QUERY_KEYS.DASHBOARD_DATA,
    async () => {
      console.log('📊 Fetching dashboard data...');
      
      // Fetch all required data for dashboard
      const [enquiriesRes, shortlistRes, paymentsRes, staffRes] = await Promise.all([
        api.get('/api/enquiries'),
        api.get('/api/shortlist'),
        api.get('/api/cashfree'),
        api.get('/api/staff')
      ]);

      const enquiries = enquiriesRes.data || [];
      const shortlists = shortlistRes.data || [];
      const payments = paymentsRes.data || [];
      const staff = staffRes.data?.staff || [];

      // Calculate dashboard statistics
      const stats = {
        totalEnquiries: enquiries.length,
        documentsAwaiting: enquiries.filter((e: any) => e.status === 'DOCUMENT_VERIFICATION').length,
        clientsShortlisted: shortlists.length,
        paymentGatewayComplete: payments.filter((p: any) => p.status === 'APPROVED').length,
        staffCount: staff.length
      };

      // Calculate funnel data
      const totalEnquiries = enquiries.length;
      const funnelData = [
        { 
          stage: 'Total Enquiries', 
          count: stats.totalEnquiries, 
          percentage: 100, 
          color: 'bg-blue-500' 
        },
        { 
          stage: 'Documents Awaiting', 
          count: stats.documentsAwaiting, 
          percentage: totalEnquiries > 0 ? Math.round((stats.documentsAwaiting / totalEnquiries) * 100) : 0, 
          color: 'bg-indigo-500' 
        },
        { 
          stage: 'Clients Shortlisted', 
          count: stats.clientsShortlisted, 
          percentage: totalEnquiries > 0 ? Math.round((stats.clientsShortlisted / totalEnquiries) * 100) : 0, 
          color: 'bg-purple-500' 
        },
        { 
          stage: 'Payment Gateway Complete', 
          count: stats.paymentGatewayComplete, 
          percentage: totalEnquiries > 0 ? Math.round((stats.paymentGatewayComplete / totalEnquiries) * 100) : 0, 
          color: 'bg-green-500' 
        }
      ];

      // Recent enquiries (last 5)
      const recentEnquiries = enquiries
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      console.log('📊 Dashboard data loaded:', { stats, funnelData, recentEnquiries: recentEnquiries.length });

      return {
        stats,
        funnelData,
        recentEnquiries
      };
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      keepPreviousData: true,
      refetchOnMount: true,
      retry: 3,
      onError: (error) => {
        console.error('❌ Dashboard data fetch error:', error);
      }
    }
  );
};

// Enquiries data persistence
export const useEnquiriesData = () => {
  return useQuery(
    QUERY_KEYS.ENQUIRIES,
    async () => {
      console.log('📋 Fetching enquiries data...');
      const response = await api.get('/api/enquiries');
      const enquiries = response.data || [];
      console.log('📋 Enquiries loaded:', enquiries.length);
      return enquiries;
    },
    {
      staleTime: 8 * 60 * 1000, // 8 minutes
      cacheTime: 45 * 60 * 1000, // 45 minutes
      keepPreviousData: true,
      refetchOnMount: true,
      retry: 3,
      onError: (error) => {
        console.error('❌ Enquiries fetch error:', error);
      }
    }
  );
};

// Documents data persistence
export const useDocumentsData = () => {
  return useQuery(
    QUERY_KEYS.DOCUMENTS,
    async () => {
      console.log('📄 Fetching documents data...');
      const response = await api.get('/api/documents');
      const documents = response.data || [];
      console.log('📄 Documents loaded:', documents.length);
      return documents;
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 60 * 60 * 1000, // 60 minutes
      keepPreviousData: true,
      refetchOnMount: true,
      retry: 3,
      onError: (error) => {
        console.error('❌ Documents fetch error:', error);
      }
    }
  );
};

// Shortlist data persistence
export const useShortlistData = () => {
  return useQuery(
    QUERY_KEYS.SHORTLISTS,
    async () => {
      console.log('⭐ Fetching shortlist data...');
      const response = await api.get('/api/shortlist');
      const shortlists = response.data || [];
      console.log('⭐ Shortlists loaded:', shortlists.length);
      return shortlists;
    },
    {
      staleTime: 6 * 60 * 1000, // 6 minutes
      cacheTime: 40 * 60 * 1000, // 40 minutes
      keepPreviousData: true,
      refetchOnMount: true,
      retry: 3,
      onError: (error) => {
        console.error('❌ Shortlist fetch error:', error);
      }
    }
  );
};

// Payment gateway data persistence
export const usePaymentGatewayData = () => {
  return useQuery(
    QUERY_KEYS.CASHFREE_APPLICATIONS,
    async () => {
      console.log('💳 Fetching payment gateway data...');
      const response = await api.get('/api/cashfree');
      const payments = response.data || [];
      console.log('💳 Payment applications loaded:', payments.length);
      return payments;
    },
    {
      staleTime: 7 * 60 * 1000, // 7 minutes
      cacheTime: 50 * 60 * 1000, // 50 minutes
      keepPreviousData: true,
      refetchOnMount: true,
      retry: 3,
      onError: (error) => {
        console.error('❌ Payment gateway fetch error:', error);
      }
    }
  );
};

// Staff data persistence
export const useStaffData = () => {
  return useQuery(
    QUERY_KEYS.STAFF,
    async () => {
      console.log('👥 Fetching staff data...');
      const response = await api.get('/api/staff');
      const staff = response.data?.staff || [];
      console.log('👥 Staff loaded:', staff.length);
      return staff;
    },
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
      cacheTime: 60 * 60 * 1000, // 60 minutes
      keepPreviousData: true,
      refetchOnMount: true,
      retry: 3,
      onError: (error) => {
        console.error('❌ Staff fetch error:', error);
      }
    }
  );
};

// Transactions data persistence (if transactions module exists)
export const useTransactionsData = () => {
  return useQuery(
    'transactions',
    async () => {
      console.log('💰 Fetching transactions data...');
      try {
        const response = await api.get('/api/transactions');
        const transactions = response.data || [];
        console.log('💰 Transactions loaded:', transactions.length);
        return transactions;
      } catch (error) {
        console.log('💰 Transactions endpoint not available, using empty array');
        return [];
      }
    },
    {
      staleTime: 12 * 60 * 1000, // 12 minutes
      cacheTime: 60 * 60 * 1000, // 60 minutes
      keepPreviousData: true,
      refetchOnMount: true,
      retry: 1, // Less retries for optional endpoint
      onError: (error) => {
        console.log('💰 Transactions not available:', error);
      }
    }
  );
};

// Utility hook to refresh all data
export const useRefreshAllData = () => {
  const queryClient = useQueryClient();

  const refreshAllData = async () => {
    console.log('🔄 Refreshing all data...');
    
    // Invalidate all queries to force refresh
    await Promise.all([
      queryClient.invalidateQueries(QUERY_KEYS.DASHBOARD_DATA),
      queryClient.invalidateQueries(QUERY_KEYS.ENQUIRIES),
      queryClient.invalidateQueries(QUERY_KEYS.DOCUMENTS),
      queryClient.invalidateQueries(QUERY_KEYS.SHORTLISTS),
      queryClient.invalidateQueries(QUERY_KEYS.CASHFREE_APPLICATIONS),
      queryClient.invalidateQueries(QUERY_KEYS.STAFF),
      queryClient.invalidateQueries('transactions'),
    ]);

    console.log('✅ All data refreshed');
  };

  return { refreshAllData };
};

// Hook to preload all data for better performance
export const usePreloadData = () => {
  const queryClient = useQueryClient();

  const preloadAllData = async () => {
    console.log('⚡ Preloading all data...');
    
    // Prefetch all data
    await Promise.all([
      queryClient.prefetchQuery(QUERY_KEYS.ENQUIRIES, () => api.get('/api/enquiries').then(res => res.data)),
      queryClient.prefetchQuery(QUERY_KEYS.DOCUMENTS, () => api.get('/api/documents').then(res => res.data)),
      queryClient.prefetchQuery(QUERY_KEYS.SHORTLISTS, () => api.get('/api/shortlist').then(res => res.data)),
      queryClient.prefetchQuery(QUERY_KEYS.CASHFREE_APPLICATIONS, () => api.get('/api/cashfree').then(res => res.data)),
      queryClient.prefetchQuery(QUERY_KEYS.STAFF, () => api.get('/api/staff').then(res => res.data?.staff)),
    ]);

    console.log('✅ All data preloaded');
  };

  return { preloadAllData };
};
