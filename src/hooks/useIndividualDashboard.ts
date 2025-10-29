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
      console.log('🚀 [RENDER] Fetching individual dashboard for staff:', user?.name, '(', user?.email, ')');
      console.log('🚀 [RENDER] User role:', user?.role, 'ID:', user?.id);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch enquiries assigned to this user with enhanced filtering
      let myEnquiries = [];
      try {
        console.log('🚀 [RENDER] Fetching enquiries for staff assignment filtering...');
        const enquiriesResponse = await api.get('/api/enquiries');
        const allEnquiries = enquiriesResponse.data || [];
        console.log('🚀 [RENDER] Total enquiries fetched:', allEnquiries.length);
        
        // Enhanced filtering for staff assignments with better logging
        myEnquiries = allEnquiries.filter((e: any) => {
          // Check multiple assignment fields
          const isAssignedByStaffId = e.staffId === user.id;
          const isAssignedByName = e.assignedStaff === user.name || e.staff?.name === user.name;
          const isAssignedByEmail = e.staff?.email === user.email;
          
          // For admin users, show all enquiries
          if (user.role === 'ADMIN' || user.email === 'admin@gmail.com' || user.email === 'admin@businessloan.com') {
            return true;
          }
          
          // For specific admin emails, show all
          const adminEmails = [
            'gowthaamankrishna1998@gmail.com', // Perivi
            'newacttmis@gmail.com', // Harish
            'tmsnunciya59@gmail.com' // Nunciya
          ];
          if (adminEmails.includes(user.email)) {
            return true;
          }
          
          const isAssigned = isAssignedByStaffId || isAssignedByName || isAssignedByEmail;
          if (isAssigned) {
            console.log('🚀 [RENDER] Enquiry assigned to', user.name, ':', e.name);
          }
          
          return isAssigned;
        });
        
        console.log('🚀 [RENDER] Staff', user.name, 'assigned enquiries:', myEnquiries.length);
        if (myEnquiries.length > 0) {
          console.log('🚀 [RENDER] Sample assigned enquiry:', myEnquiries[0]);
        }
      } catch (error: any) {
        console.error('❌ [RENDER] Enquiries fetch error:', error.message);
        myEnquiries = [];
      }

      // Fetch documents processed by this user
      let myDocuments = [];
      try {
        console.log('🚀 [RENDER] Fetching documents for staff processing...');
        const documentsResponse = await api.get('/api/documents');
        const allDocuments = documentsResponse.data || [];
        console.log('🚀 [RENDER] Total documents fetched:', allDocuments.length);
        
        // Filter documents by staff assignment with enhanced logic
        myDocuments = allDocuments.filter((d: any) => {
          const isMyDocument = d.verifiedBy === user.name || 
                              d.uploadedBy?.name === user.name ||
                              d.staffId === user.id;
          
          // For admin users, show all documents
          if (user.role === 'ADMIN' || user.email === 'admin@gmail.com' || user.email === 'admin@businessloan.com') {
            return true;
          }
          
          // For specific admin emails, show all
          const adminEmails = [
            'gowthaamankrishna1998@gmail.com', // Perivi
            'newacttmis@gmail.com', // Harish
            'tmsnunciya59@gmail.com' // Nunciya
          ];
          if (adminEmails.includes(user.email)) {
            return true;
          }
          
          return isMyDocument;
        });
        
        console.log('🚀 [RENDER] Staff', user.name, 'processed documents:', myDocuments.length);
      } catch (error: any) {
        console.error('❌ [RENDER] Documents fetch error:', error.message);
        myDocuments = [];
      }

      // Fetch shortlists created by this user
      let myShortlists = [];
      try {
        console.log('🚀 [RENDER] Fetching shortlists for staff management...');
        const shortlistResponse = await api.get('/api/shortlist');
        const allShortlists = shortlistResponse.data || [];
        console.log('🚀 [RENDER] Total shortlists fetched:', allShortlists.length);
        
        // Filter shortlists by staff assignment with enhanced logic
        myShortlists = allShortlists.filter((s: any) => {
          const isMyShortlist = s.createdBy === user.name || 
                               s.staffId === user.id ||
                               s.staff === user.name;
          
          // For admin users, show all shortlists
          if (user.role === 'ADMIN' || user.email === 'admin@gmail.com' || user.email === 'admin@businessloan.com') {
            return true;
          }
          
          // For specific admin emails, show all
          const adminEmails = [
            'gowthaamankrishna1998@gmail.com', // Perivi
            'newacttmis@gmail.com', // Harish
            'tmsnunciya59@gmail.com' // Nunciya
          ];
          if (adminEmails.includes(user.email)) {
            return true;
          }
          
          return isMyShortlist;
        });
        
        console.log('🚀 [RENDER] Staff', user.name, 'managed shortlists:', myShortlists.length);
      } catch (error: any) {
        console.error('❌ [RENDER] Shortlists fetch error:', error.message);
        myShortlists = [];
      }

      // Fetch payment applications handled by this user
      let myPayments = [];
      try {
        console.log('🚀 [RENDER] Fetching payment applications for staff processing...');
        const paymentResponse = await api.get('/api/cashfree/applications');
        const allPayments = paymentResponse.data || [];
        console.log('🚀 [RENDER] Total payment applications fetched:', allPayments.length);
        
        // Filter payments by staff assignment with enhanced logic
        myPayments = allPayments.filter((p: any) => {
          const isMyPayment = p.submittedBy?.name === user.name ||
                             p.submittedBy?.email === user.email ||
                             p.staffId === user.id;
          
          // For admin users, show all payments
          if (user.role === 'ADMIN' || user.email === 'admin@gmail.com' || user.email === 'admin@businessloan.com') {
            return true;
          }
          
          // For specific admin emails, show all
          const adminEmails = [
            'gowthaamankrishna1998@gmail.com', // Perivi
            'newacttmis@gmail.com', // Harish
            'tmsnunciya59@gmail.com' // Nunciya
          ];
          if (adminEmails.includes(user.email)) {
            return true;
          }
          
          return isMyPayment;
        });
        
        console.log('🚀 [RENDER] Staff', user.name, 'handled payments:', myPayments.length);
      } catch (error: any) {
        console.error('❌ [RENDER] Payments fetch error:', error.message);
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

      // Calculate comprehensive individual dashboard statistics
      const verifiedDocuments = myDocuments.filter((d: any) => d.verified).length;
      const unverifiedDocuments = myDocuments.filter((d: any) => !d.verified).length;
      const completedPayments = myPayments.filter((p: any) => 
        p.status === 'COMPLETED' || p.status === 'TRANSACTION_DONE'
      ).length;
      const pendingPayments = myPayments.filter((p: any) => 
        p.status === 'PENDING' || p.status === 'PROCESSING'
      ).length;
      
      const stats: IndividualDashboardStats = {
        myEnquiries: myEnquiries.length,
        myDocumentsProcessed: verifiedDocuments,
        myShortlisted: myShortlists.length,
        myPaymentApplications: myPayments.length,
        myCompletedTasks: verifiedDocuments + myShortlists.length + completedPayments,
        myPendingTasks: unverifiedDocuments + pendingPayments,
        totalClientsHandled: myEnquiries.length,
        successRate: myEnquiries.length > 0 ? Math.round((completedPayments / myEnquiries.length) * 100) : 0,
        thisMonthEnquiries,
        thisWeekEnquiries
      };
      
      console.log('🚀 [RENDER] Individual dashboard stats for', user.name, ':', stats);

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
      // Render-optimized settings for individual dashboard
      staleTime: 2 * 60 * 1000, // 2 minutes for Render performance
      cacheTime: 15 * 60 * 1000, // 15 minutes cache for persistence
      refetchInterval: 90 * 1000, // Auto-refresh every 90 seconds for Render (less frequent than global)
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchIntervalInBackground: false, // Disable for Render performance
      
      // Enhanced retry configuration for Render
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for network errors and 5xx errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
      
      onSuccess: (data) => {
        console.log('🚀 [RENDER] Individual dashboard updated successfully for', user?.name, ':', {
          myEnquiries: data.stats.myEnquiries,
          documentsProcessed: data.stats.myDocumentsProcessed,
          myShortlisted: data.stats.myShortlisted,
          myPayments: data.stats.myPaymentApplications,
          completedTasks: data.stats.myCompletedTasks,
          pendingTasks: data.stats.myPendingTasks,
          successRate: data.stats.successRate,
          totalClients: data.stats.totalClientsHandled,
          role: user?.role,
          isAdmin: user?.role === 'ADMIN',
          timestamp: new Date().toLocaleTimeString(),
          environment: 'RENDER'
        });
      },
      onError: (error: any) => {
        console.error('❌ [RENDER] Individual dashboard fetch error for', user?.name, ':', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url
        });
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
