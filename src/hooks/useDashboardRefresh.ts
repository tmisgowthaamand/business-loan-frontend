import { useQueryClient } from 'react-query';
import { useCallback } from 'react';

/**
 * Hook for triggering immediate dashboard refreshes when new data is added
 * This ensures dashboards update instantly when enquiries or staff are added
 */
export const useDashboardRefresh = () => {
  const queryClient = useQueryClient();

  // Refresh all dashboard-related queries
  const refreshDashboards = useCallback(async () => {
    console.log('🔄 Triggering dashboard refresh...');
    
    // Invalidate all dashboard queries to force immediate refresh
    await Promise.all([
      queryClient.invalidateQueries('dashboard-data'),
      queryClient.invalidateQueries(['individual-dashboard']),
      queryClient.invalidateQueries('enquiries'),
      queryClient.invalidateQueries('staff'),
      queryClient.invalidateQueries('shortlist'),
      queryClient.invalidateQueries('documents'),
      queryClient.invalidateQueries('transactions'),
      queryClient.invalidateQueries('notifications')
    ]);
    
    console.log('✅ Dashboard refresh completed');
  }, [queryClient]);

  // Refresh after enquiry is added
  const refreshAfterEnquiry = useCallback(async () => {
    console.log('📋 Refreshing dashboards after new enquiry...');
    await refreshDashboards();
  }, [refreshDashboards]);

  // Refresh after staff member is added
  const refreshAfterStaff = useCallback(async () => {
    console.log('👥 Refreshing dashboards after staff change...');
    await refreshDashboards();
  }, [refreshDashboards]);

  // Refresh after document is uploaded/verified
  const refreshAfterDocument = useCallback(async () => {
    console.log('📄 Refreshing dashboards after document change...');
    await refreshDashboards();
  }, [refreshDashboards]);

  // Refresh after shortlist is updated
  const refreshAfterShortlist = useCallback(async () => {
    console.log('⭐ Refreshing dashboards after shortlist change...');
    await refreshDashboards();
  }, [refreshDashboards]);

  // Refresh after payment gateway application
  const refreshAfterPayment = useCallback(async () => {
    console.log('💳 Refreshing dashboards after payment application...');
    await refreshDashboards();
  }, [refreshDashboards]);

  // Refresh after transaction is added
  const refreshAfterTransaction = useCallback(async () => {
    console.log('💰 Refreshing dashboards after transaction...');
    await refreshDashboards();
  }, [refreshDashboards]);

  return {
    refreshDashboards,
    refreshAfterEnquiry,
    refreshAfterStaff,
    refreshAfterDocument,
    refreshAfterShortlist,
    refreshAfterPayment,
    refreshAfterTransaction
  };
};

export default useDashboardRefresh;
