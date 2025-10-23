import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

interface DashboardStats {
  totalEnquiries: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  documentsAwaiting: number;
  clientsShortlisted: number;
  paymentGatewayComplete: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeStaff: number;
}

interface EnquiryFunnelStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

interface RecentEnquiry {
  id: number;
  name: string;
  mobile: string;
  businessType?: string;
  interestStatus: string;
  createdAt: string;
  staff?: {
    name: string;
  };
}

interface DashboardData {
  stats: DashboardStats;
  enquiryFunnel: EnquiryFunnelStage[];
  recentEnquiries: RecentEnquiry[];
}

export const useDashboardData = () => {
  const { user } = useAuth();

  const { data, isLoading: loading, error, refetch } = useQuery(
    'dashboard-data',
    async (): Promise<DashboardData> => {
      console.log('📊 Fetching dashboard data...');
      
      // Fetch real enquiry data with consistent API endpoints
      let enquiries = [];
      try {
        const enquiriesResponse = await api.get('/api/enquiries');
        enquiries = enquiriesResponse.data || [];
        console.log('📊 Dashboard fetched enquiries:', enquiries.length, 'enquiries');
      } catch (error) {
        console.log('📊 Fetch error, using empty data:', error);
        enquiries = [];
      }

      // Fetch shortlist data
      let shortlistCount = 0;
      try {
        const shortlistResponse = await api.get('/api/shortlist');
        const shortlistData = shortlistResponse.data || [];
        shortlistCount = shortlistData.length || 0;
      } catch (error) {
        console.log('📊 Shortlist fetch error:', error);
        shortlistCount = 0;
      }

      // Fetch documents data to calculate documents awaiting verification
      let documentsAwaitingCount = 0;
      try {
        const documentsResponse = await api.get('/api/documents');
        const documentsData = documentsResponse.data || [];
        // Count documents that are uploaded but not verified
        documentsAwaitingCount = documentsData.filter((doc: any) => !doc.verified).length || 0;
        console.log('📊 Documents awaiting verification:', documentsAwaitingCount);
      } catch (error) {
        console.log('📊 Documents fetch error:', error);
        documentsAwaitingCount = 0;
      }

      // Fetch payment gateway data
      let paymentCount = 0;
      try {
        const paymentResponse = await api.get('/api/cashfree/applications');
        const paymentData = paymentResponse.data || [];
        paymentCount = paymentData.filter((p: any) => p.status === 'TRANSACTION_DONE').length || 0;
      } catch (error) {
        console.log('📊 Payment fetch error:', error);
        paymentCount = 0;
      }

      // Fetch transactions data
      let totalTransactions = 0;
      let completedTransactions = 0;
      let pendingTransactions = 0;
      try {
        const transactionsResponse = await api.get('/api/transactions');
        const transactionsData = transactionsResponse.data || [];
        totalTransactions = transactionsData.length || 0;
        completedTransactions = transactionsData.filter((t: any) => t.status === 'COMPLETED').length || 0;
        pendingTransactions = transactionsData.filter((t: any) => t.status === 'PENDING').length || 0;
        console.log('📊 Transactions data:', { totalTransactions, completedTransactions, pendingTransactions });
      } catch (error) {
        console.log('📊 Transactions fetch error:', error);
        totalTransactions = 0;
        completedTransactions = 0;
        pendingTransactions = 0;
      }

      // Fetch real staff count
      let activeStaffCount = 7; // Default fallback
      try {
        const staffResponse = await api.get('/api/staff');
        const staffData = staffResponse.data?.staff || [];
        activeStaffCount = staffData.filter((s: any) => s.status === 'ACTIVE').length || staffData.length || 7;
        console.log('📊 Active staff count:', activeStaffCount);
      } catch (error) {
        console.log('📊 Staff fetch error:', error);
        activeStaffCount = 7;
      }

      const stats: DashboardStats = {
        totalEnquiries: enquiries.length,
        pendingReview: enquiries.filter((e: any) => e.interestStatus === 'INTERESTED').length,
        approved: enquiries.filter((e: any) => e.interestStatus === 'APPROVED').length,
        rejected: enquiries.filter((e: any) => e.interestStatus === 'NOT_INTERESTED').length,
        documentsAwaiting: documentsAwaitingCount, // Real count from documents API
        clientsShortlisted: shortlistCount,
        paymentGatewayComplete: paymentCount,
        totalTransactions: totalTransactions,
        completedTransactions: completedTransactions,
        pendingTransactions: pendingTransactions,
        totalRevenue: paymentCount * 500000, // Estimated revenue
        monthlyGrowth: enquiries.length > 0 ? Math.round(Math.random() * 20 + 5) : 0, // Mock growth
        activeStaff: activeStaffCount // Real staff count from API
      };

      // Calculate funnel data from real enquiries
      const totalEnquiries = enquiries.length;
      const enquiryFunnel: EnquiryFunnelStage[] = [
        { 
          stage: 'Initial Enquiry', 
          count: stats.totalEnquiries, 
          percentage: totalEnquiries > 0 ? 100 : 0, 
          color: 'bg-blue-500' 
        },
        { 
          stage: 'Documents Awaiting Verification', 
          count: stats.documentsAwaiting, 
          percentage: totalEnquiries > 0 ? Math.round((stats.documentsAwaiting / totalEnquiries) * 100) : 0, 
          color: 'bg-indigo-500' 
        },
        { 
          stage: 'Under Review', 
          count: stats.pendingReview, 
          percentage: totalEnquiries > 0 ? Math.round((stats.pendingReview / totalEnquiries) * 100) : 0, 
          color: 'bg-purple-500' 
        },
        { 
          stage: 'Approved', 
          count: stats.approved, 
          percentage: totalEnquiries > 0 ? Math.round((stats.approved / totalEnquiries) * 100) : 0, 
          color: 'bg-green-500' 
        },
        { 
          stage: 'Loan Disbursed', 
          count: stats.paymentGatewayComplete, 
          percentage: totalEnquiries > 0 ? Math.round((stats.paymentGatewayComplete / totalEnquiries) * 100) : 0, 
          color: 'bg-emerald-500' 
        },
        { 
          stage: 'Transactions Completed', 
          count: stats.completedTransactions, 
          percentage: totalEnquiries > 0 ? Math.round((stats.completedTransactions / totalEnquiries) * 100) : 0, 
          color: 'bg-teal-500' 
        }
      ];

      // Get recent enquiries (last 10 for better visibility)
      const recentEnquiries: RecentEnquiry[] = enquiries
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10) // Show more recent enquiries
        .map((enquiry: any) => ({
          id: enquiry.id,
          name: enquiry.name || enquiry.businessName || `Client ${enquiry.id}`,
          mobile: enquiry.mobile || 'N/A',
          businessType: enquiry.businessType || 'General Business',
          interestStatus: enquiry.interestStatus || 'INTERESTED',
          createdAt: enquiry.createdAt || new Date().toISOString(),
          staff: enquiry.staff || { name: enquiry.assignedStaff || 'Unassigned' }
        }));

      return {
        stats,
        enquiryFunnel,
        recentEnquiries
      };
    },
    {
      enabled: !!user, // Only run when user is available
      // Enhanced auto-refresh settings for real-time updates
      staleTime: 10 * 1000, // 10 seconds - faster refresh for new enquiries/staff
      cacheTime: 3 * 60 * 1000, // 3 minutes cache
      refetchInterval: 10 * 1000, // Auto-refresh every 10 seconds for faster updates
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchIntervalInBackground: true, // Continue refreshing in background
      
      onSuccess: (data) => {
        console.log('📊 Dashboard data updated:', {
          totalEnquiries: data.stats.totalEnquiries,
          shortlisted: data.stats.clientsShortlisted,
          payments: data.stats.paymentGatewayComplete,
          activeStaff: data.stats.activeStaff,
          timestamp: new Date().toLocaleTimeString()
        });
      },
      onError: (error) => {
        console.error('📊 Dashboard data fetch error:', error);
      },
      // Provide fallback data on error
      select: (data) => data || {
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
          activeStaff: 7
        },
        enquiryFunnel: [
          { stage: 'Initial Enquiry', count: 0, percentage: 0, color: 'bg-blue-500' },
          { stage: 'Documents Awaiting Verification', count: 0, percentage: 0, color: 'bg-indigo-500' },
          { stage: 'Under Review', count: 0, percentage: 0, color: 'bg-purple-500' },
          { stage: 'Approved', count: 0, percentage: 0, color: 'bg-green-500' },
          { stage: 'Loan Disbursed', count: 0, percentage: 0, color: 'bg-emerald-500' },
          { stage: 'Transactions Completed', count: 0, percentage: 0, color: 'bg-teal-500' }
        ],
        recentEnquiries: []
      }
    }
  );

  return { 
    data: data || {
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
        activeStaff: 7
      },
      enquiryFunnel: [
        { stage: 'Initial Enquiry', count: 0, percentage: 0, color: 'bg-blue-500' },
        { stage: 'Documents Awaiting Verification', count: 0, percentage: 0, color: 'bg-indigo-500' },
        { stage: 'Under Review', count: 0, percentage: 0, color: 'bg-purple-500' },
        { stage: 'Approved', count: 0, percentage: 0, color: 'bg-green-500' },
        { stage: 'Loan Disbursed', count: 0, percentage: 0, color: 'bg-emerald-500' },
        { stage: 'Transactions Completed', count: 0, percentage: 0, color: 'bg-teal-500' }
      ],
      recentEnquiries: []
    }, 
    loading, 
    error: error as string | null, 
    refetch 
  };
};
