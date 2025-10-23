import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';

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
    ['individual-dashboard', user?.id],
    async (): Promise<IndividualDashboardData> => {
      console.log('👤 Fetching individual dashboard data for user:', user?.name);
      
      // Fetch enquiries assigned to this user
      let myEnquiries = [];
      try {
        const enquiriesResponse = await fetch('/api/enquiries');
        if (enquiriesResponse.ok) {
          const allEnquiries = await enquiriesResponse.json();
          // Filter enquiries assigned to current user
          myEnquiries = allEnquiries.filter((e: any) => 
            e.assignedStaff === user?.name || 
            e.staff?.name === user?.name ||
            e.staffId === user?.id
          );
          console.log('👤 My enquiries:', myEnquiries.length);
        }
      } catch (error) {
        console.log('👤 Enquiries fetch error:', error);
        myEnquiries = [];
      }

      // Fetch documents processed by this user
      let myDocuments = [];
      try {
        const documentsResponse = await fetch('/api/documents');
        if (documentsResponse.ok) {
          const allDocuments = await documentsResponse.json();
          // Filter documents processed by current user
          myDocuments = allDocuments.filter((d: any) => 
            d.verifiedBy === user?.name || 
            d.uploadedBy === user?.name ||
            d.staffId === user?.id
          );
          console.log('👤 My documents:', myDocuments.length);
        }
      } catch (error) {
        console.log('👤 Documents fetch error:', error);
        myDocuments = [];
      }

      // Fetch shortlists created by this user
      let myShortlists = [];
      try {
        const shortlistResponse = await fetch('/api/shortlist');
        if (shortlistResponse.ok) {
          const allShortlists = await shortlistResponse.json();
          // Filter shortlists created by current user
          myShortlists = allShortlists.filter((s: any) => 
            s.createdBy === user?.name || 
            s.staffId === user?.id ||
            s.assignedStaff === user?.name
          );
          console.log('👤 My shortlists:', myShortlists.length);
        }
      } catch (error) {
        console.log('👤 Shortlists fetch error:', error);
        myShortlists = [];
      }

      // Fetch payment applications handled by this user
      let myPayments = [];
      try {
        const paymentResponse = await fetch('/api/cashfree');
        if (paymentResponse.ok) {
          const allPayments = await paymentResponse.json();
          // Filter payments handled by current user
          myPayments = allPayments.filter((p: any) => 
            p.submittedBy?.name === user?.name ||
            p.handledBy === user?.name ||
            p.staffId === user?.id
          );
          console.log('👤 My payments:', myPayments.length);
        }
      } catch (error) {
        console.log('👤 Payments fetch error:', error);
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

      // Generate recent activities
      const recentActivities: MyRecentActivity[] = [
        ...myEnquiries.slice(0, 3).map((e: any) => ({
          id: e.id,
          type: 'ENQUIRY' as const,
          clientName: e.name || 'Unknown Client',
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

      // Get my clients (unique clients from enquiries)
      const myClients = myEnquiries.map((e: any) => ({
        id: e.id,
        name: e.name || 'Unknown Client',
        mobile: e.mobile,
        businessType: e.businessType,
        status: e.interestStatus,
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
      staleTime: 15 * 1000, // 15 seconds - faster refresh for individual dashboard
      cacheTime: 3 * 60 * 1000, // 3 minutes cache
      refetchInterval: 15 * 1000, // Auto-refresh every 15 seconds for faster updates
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchIntervalInBackground: true, // Continue refreshing in background
      
      onSuccess: (data) => {
        console.log('👤 Individual dashboard data updated:', {
          myEnquiries: data.stats.myEnquiries,
          myShortlisted: data.stats.myShortlisted,
          myPayments: data.stats.myPaymentApplications,
          successRate: data.stats.successRate,
          totalClients: data.stats.totalClientsHandled,
          timestamp: new Date().toLocaleTimeString()
        });
      },
      onError: (error) => {
        console.error('👤 Individual dashboard data fetch error:', error);
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
