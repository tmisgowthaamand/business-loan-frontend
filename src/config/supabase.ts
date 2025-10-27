import { createClient } from '@supabase/supabase-js';

// Supabase configuration for frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database table names
export const TABLES = {
  USERS: 'users',
  STAFF: 'staff',
  ENQUIRIES: 'enquiries',
  DOCUMENTS: 'documents',
  SHORTLISTS: 'shortlists',
  PAYMENTS: 'payments',
  TRANSACTIONS: 'transactions',
} as const;

// Realtime subscription helpers
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const subscription = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter
      },
      callback
    )
    .subscribe();

  return subscription;
};

// Helper functions for common operations
export const supabaseHelpers = {
  // Check if Supabase is configured
  isConfigured: () => {
    return !!(supabaseUrl && supabaseAnonKey);
  },

  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from(TABLES.ENQUIRIES)
        .select('count', { count: 'exact', head: true });
      
      return { success: !error, error };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Get real-time count for a table
  async getTableCount(table: string) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      return { count: count || 0, error };
    } catch (error) {
      return { count: 0, error };
    }
  },

  // Subscribe to all table changes for dashboard
  subscribeToDashboard(callback: (table: string, payload: any) => void) {
    const subscriptions = Object.values(TABLES).map(table => 
      subscribeToTable(table, (payload) => callback(table, payload))
    );

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }
};

export default supabase;
