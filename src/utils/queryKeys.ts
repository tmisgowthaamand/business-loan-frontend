/**
 * Centralized query keys for React Query
 * This ensures consistent caching and invalidation across all components
 */

export const QUERY_KEYS = {
  // Dashboard
  DASHBOARD_DATA: 'dashboard-data',
  
  // Enquiries
  ENQUIRIES: 'enquiries',
  ENQUIRY_DETAILS: (id: number) => ['enquiry', id],
  
  // Documents
  DOCUMENTS: 'documents',
  DOCUMENTS_VERIFICATION: 'documents-verification',
  DOCUMENT_STATUS: (enquiryId: string) => ['documentStatus', enquiryId],
  DOCUMENT_BY_ENQUIRY: (enquiryId: number) => ['documents', 'enquiry', enquiryId],
  
  // Shortlist
  SHORTLISTS: 'shortlists',
  SHORTLIST_DETAILS: (id: number) => ['shortlist', id],
  
  // Payment Gateway / Cashfree
  CASHFREE_APPLICATIONS: 'cashfree-applications',
  CASHFREE_DETAILS: (id: number) => ['cashfree', id],
  
  // Staff
  STAFF: 'staff',
  STAFF_MEMBERS: 'staff-members',
  STAFF_STATS: 'staff-stats',
  
  // Notifications
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_COUNT: 'notification-count',
} as const;

/**
 * Query invalidation patterns for related data
 * When one piece of data changes, these define what else should be refreshed
 */
export const INVALIDATION_PATTERNS = {
  // When enquiry changes, refresh dashboard and related data
  ENQUIRY_CHANGED: [
    QUERY_KEYS.ENQUIRIES,
    QUERY_KEYS.DASHBOARD_DATA,
    QUERY_KEYS.NOTIFICATIONS,
  ],
  
  // When document changes, refresh documents and related data
  DOCUMENT_CHANGED: [
    QUERY_KEYS.DOCUMENTS,
    QUERY_KEYS.DOCUMENTS_VERIFICATION,
    QUERY_KEYS.DASHBOARD_DATA,
    QUERY_KEYS.NOTIFICATIONS,
  ],
  
  // When shortlist changes, refresh shortlist and related data
  SHORTLIST_CHANGED: [
    QUERY_KEYS.SHORTLISTS,
    QUERY_KEYS.DASHBOARD_DATA,
    QUERY_KEYS.NOTIFICATIONS,
  ],
  
  // When payment gateway changes, refresh payments and related data
  PAYMENT_CHANGED: [
    QUERY_KEYS.CASHFREE_APPLICATIONS,
    QUERY_KEYS.DASHBOARD_DATA,
    QUERY_KEYS.NOTIFICATIONS,
  ],
  
  // When staff changes, refresh staff and related data
  STAFF_CHANGED: [
    QUERY_KEYS.STAFF,
    QUERY_KEYS.STAFF_MEMBERS,
    QUERY_KEYS.STAFF_STATS,
    QUERY_KEYS.NOTIFICATIONS,
  ],
} as const;

/**
 * Utility function to invalidate related queries
 */
export const invalidateRelatedQueries = (
  queryClient: any,
  pattern: keyof typeof INVALIDATION_PATTERNS
) => {
  const keysToInvalidate = INVALIDATION_PATTERNS[pattern];
  
  keysToInvalidate.forEach(key => {
    queryClient.invalidateQueries(key);
  });
  
  console.log(`🔄 Invalidated queries for pattern: ${pattern}`, keysToInvalidate);
};
