import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

interface IndividualDashboardStats {
  myEnquiries: number;
  myDocumentsProcessed: number;
  myShortlisted: number;
  myPaymentApplications: number;
  myCompletedTasks: number;
  myPendingTasks: number;
  totalClientsHandled: number;
  successRate: number;
  thisMonthEnquiries: number;
  thisWeekEnquiries: number;
}

interface MyRecentActivity {
  id: number;
  type: 'ENQUIRY' | 'DOCUMENT' | 'SHORTLIST' | 'PAYMENT';
  clientName: string;
  action: string;
  timestamp: string;
  status: string;
}

interface IndividualDashboardData {
  stats: IndividualDashboardStats;
  recentActivities: MyRecentActivity[];
  myClients: any[];
  performanceMetrics: {
    thisWeek: number;
    lastWeek: number;
    growth: number;
  };
}

export const useIndividualDashboard = () => {
  const { user } = useAuth();

  const { data, isLoading: loading, error, refetch } = useQuery(
    ['individual-dashboard', user?.id, user?.email], // Include email for better caching
    async (): Promise<IndividualDashboardData> => {
      console.log('🚀 [VERCEL] Fetching individual dashboard for staff:', user?.name, '(', user?.email, ')');
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch enquiries assigned to this user with enhanced filtering
      let myEnquiries = [];
      try {
        const enquiriesResponse = await api.get('/api/enquiries');
        const allEnquiries = enquiriesResponse.data || [];
        
        // Enhanced filtering for staff assignments
        myEnquiries = allEnquiries.filter((e: any) => {
          // Check multiple assignment fields
          const isAssignedByStaffId = e.staffId === user.id;
          const isAssignedByName = e.assignedStaff === user.name || e.staff?.name === user.name;
          const isAssignedByEmail = e.staff?.email === user.email;
          
          // For admin@gmail.com, show all enquiries
          if (user.email === 'admin@gmail.com') {
            return true;
          }
          
          return isAssignedByStaffId || isAssignedByName || isAssignedByEmail;
        });
        
        console.log('🚀 [VERCEL] Staff', user.name, 'enquiries:', myEnquiries.length);
      } catch (error) {
        console.log('❌ [VERCEL] Enquiries fetch error:', error);
        myEnquiries = [];
      }

      // Fetch documents processed by this user
      let myDocuments = [];
      try {
        const documentsResponse = await api.get('/api/documents');
        const allDocuments = documentsResponse.data || [];
        
        // Filter documents by staff assignment
        myDocuments = allDocuments.filter((d: any) => {
          const isMyDocument = d.verifiedBy === user.name || 
                              d.uploadedBy?.name === user.name ||
                              d.staffId === user.id;
          
          // For admin@gmail.com, show all documents
          if (user.email === 'admin@gmail.com') {
            return true;
          }
          
          return isMyDocument;
        });
        
        console.log('🚀 [VERCEL] Staff', user.name, 'documents:', myDocuments.length);
      } catch (error) {
        console.log('❌ [VERCEL] Documents fetch error:', error);
        myDocuments = [];
      }

      // Fetch shortlists created by this user
      let myShortlists = [];
      try {
        const shortlistResponse = await api.get('/api/shortlist');
        const allShortlists = shortlistResponse.data || [];
        
        // Filter shortlists by staff assignment
        myShortlists = allShortlists.filter((s: any) => {
          const isMyShortlist = s.createdBy === user.name || 
                               s.staffId === user.id ||
                               s.staff === user.name;
          
          // For admin@gmail.com, show all shortlists
          if (user.email === 'admin@gmail.com') {
            return true;
          }
          
          return isMyShortlist;
        });
        
        console.log('🚀 [VERCEL] Staff', user.name, 'shortlists:', myShortlists.length);
      } catch (error) {
        console.log('❌ [VERCEL] Shortlists fetch error:', error);
        myShortlists = [];
      }

      // Fetch payment applications handled by this user
      let myPayments = [];
      try {
        const paymentResponse = await api.get('/api/cashfree/applications');
        const allPayments = paymentResponse.data || [];
        
        // Filter payments by staff assignment
        myPayments = allPayments.filter((p: any) => {
          const isMyPayment = p.submittedBy?.name === user.name ||
                             p.submittedBy?.email === user.email ||
                             p.staffId === user.id;
          
          // For admin@gmail.com, show all payments
          if (user.email === 'admin@gmail.com') {
            return true;
          }
          
          return isMyPayment;
        });
        
        console.log('🚀 [VERCEL] Staff', user.name, 'payments:', myPayments.length);
      } catch (error) {
        console.log('❌ [VERCEL] Payments fetch error:', error);
        myPayments = [];
      }

      // Calculate time-based metrics
      const now = new Date();
      const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const thisWeekEnquiries = myEnquiries.filter((e: any) => 
        new Date(e.createdAt) >= thisWeekStart
      ).length;

      const lastWeekEnquiries = myEnquiries.filter((e: any) => {
        const date = new Date(e.createdAt);
        return date >= lastWeekStart && date < thisWeekStart;
      }).length;

      const thisMonthEnquiries = myEnquiries.filter((e: any) => 
        new Date(e.createdAt) >= thisMonthStart
      ).length;

      const stats: IndividualDashboardStats = {
        myEnquiries: myEnquiries.length,
        myDocumentsProcessed: myDocuments.filter((d: any) => d.verified).length,
        myShortlisted: myShortlists.length,
        myPaymentApplications: myPayments.length,
        myCompletedTasks: myDocuments.filter((d: any) => d.verified).length + myShortlists.length + myPayments.filter((p: any) => p.status === 'COMPLETED').length,
        myPendingTasks: myDocuments.filter((d: any) => !d.verified).length + myPayments.filter((p: any) => p.status === 'PENDING').length,
        totalClientsHandled: myEnquiries.length,
        successRate: myEnquiries.length > 0 ? Math.round((myPayments.filter((p: any) => p.status === 'COMPLETED').length / myEnquiries.length) * 100) : 0,
        thisMonthEnquiries,
        thisWeekEnquiries
      };

      // Generate recent activities for individual staff member
      const recentActivities: MyRecentActivity[] = [
        ...myEnquiries.slice(0, 3).map((e: any) => ({
          id: e.id,
          type: 'ENQUIRY' as const,
          clientName: e.name || e.businessName || 'Unknown Client',
          action: 'New enquiry received',
          timestamp: e.createdAt,
          status: e.interestStatus || 'PENDING'
        })),
        ...myDocuments.slice(0, 2).map((d: any) => ({
          id: d.id,
          type: 'DOCUMENT' as const,
          clientName: d.enquiry?.name || 'Unknown Client',
          action: d.verified ? 'Document verified' : 'Document uploaded',
          timestamp: d.createdAt,
          status: d.verified ? 'VERIFIED' : 'PENDING'
        })),
        ...myShortlists.slice(0, 2).map((s: any) => ({
          id: s.id,
          type: 'SHORTLIST' as const,
          clientName: s.name || 'Unknown Client',
          action: 'Added to shortlist',
          timestamp: s.createdAt,
          status: s.interestStatus || 'ACTIVE'
        })),
        ...myPayments.slice(0, 2).map((p: any) => ({
          id: p.id,
          type: 'PAYMENT' as const,
          clientName: p.shortlist?.name || 'Unknown Client',
          action: 'Payment application processed',
          timestamp: p.createdAt,
          status: p.status || 'PENDING'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

      // Get my clients (unique clients from enquiries) for individual staff
      const myClients = myEnquiries.map((e: any) => ({
        id: e.id,
        name: e.name || e.businessName || 'Unknown Client',
        mobile: e.mobile || 'N/A',
        businessType: e.businessType || 'General Business',
        status: e.interestStatus || 'INTERESTED',
        lastActivity: e.createdAt,
        documentsCount: myDocuments.filter((d: any) => d.enquiryId === e.id).length,
        isShortlisted: myShortlists.some((s: any) => s.enquiryId === e.id),
        hasPaymentApplication: myPayments.some((p: any) => p.shortlist?.enquiry?.id === e.id)
      }));


      const performanceMetrics = {
        thisWeek: thisWeekEnquiries,
        lastWeek: lastWeekEnquiries,
        growth: lastWeekEnquiries > 0 ? Math.round(((thisWeekEnquiries - lastWeekEnquiries) / lastWeekEnquiries) * 100) : 0
      };

      return {
        stats,
        recentActivities,
        myClients,
        performanceMetrics
      };
    },
    {
      enabled: !!user, // Only run when user is available
      // Vercel-optimized settings for individual dashboard
      staleTime: 30 * 1000, // 30 seconds for Vercel performance
      cacheTime: 10 * 60 * 1000, // 10 minutes cache for persistence
      refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds for Vercel
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchIntervalInBackground: false, // Disable for Vercel performance
      
      // Retry configuration for Vercel
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      
      onSuccess: (data) => {
        console.log('🚀 [VERCEL] Individual dashboard updated for', user?.name, ':', {
          myEnquiries: data.stats.myEnquiries,
          myShortlisted: data.stats.myShortlisted,
          myPayments: data.stats.myPaymentApplications,
          successRate: data.stats.successRate,
          totalClients: data.stats.totalClientsHandled,
          isAdmin: user?.email === 'admin@gmail.com',
          timestamp: new Date().toLocaleTimeString()
        });
      },
      onError: (error) => {
        console.error('❌ [VERCEL] Individual dashboard fetch error for', user?.name, ':', error);
      }
    }
  );

  return { 
    data: data || {
      stats: {
        myEnquiries: 0,
        myDocumentsProcessed: 0,
        myShortlisted: 0,
        myPaymentApplications: 0,
        myCompletedTasks: 0,
        myPendingTasks: 0,
        totalClientsHandled: 0,
        successRate: 0,
        thisMonthEnquiries: 0,
        thisWeekEnquiries: 0
      },
      recentActivities: [],
      myClients: [],
      performanceMetrics: {
        thisWeek: 0,
        lastWeek: 0,
        growth: 0
      }
    }, 
    loading, 
    error: error as string | null, 
    refetch 
  };
};
