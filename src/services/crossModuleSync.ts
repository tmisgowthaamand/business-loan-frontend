import { QueryClient } from 'react-query';
import { renderDataPersistence } from './renderDataPersistence';

/**
 * Cross-Module Data Synchronization Service
 * Ensures data consistency across all modules in Render deployment
 */

export interface SyncEvent {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  module: string;
  data: any;
  timestamp: number;
}

export interface ModuleDependencies {
  [key: string]: string[];
}

class CrossModuleSyncService {
  private queryClient: QueryClient | null = null;
  private syncQueue: SyncEvent[] = [];
  private isProcessing = false;

  // Define which modules depend on each other
  private dependencies: ModuleDependencies = {
    enquiries: ['documents', 'shortlist', 'dashboard'],
    documents: ['shortlist', 'dashboard'],
    shortlist: ['payments', 'dashboard'],
    payments: ['transactions', 'dashboard'],
    staff: ['dashboard'],
    transactions: ['dashboard'],
    notifications: []
  };

  constructor() {
    console.log('🔄 [CROSS-MODULE-SYNC] Service initialized');
  }

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
    console.log('🔄 [CROSS-MODULE-SYNC] QueryClient attached');
  }

  /**
   * Notify about data changes to trigger cross-module updates
   */
  async notifyDataChange(event: SyncEvent): Promise<void> {
    console.log(`🔄 [CROSS-MODULE-SYNC] Data change notification:`, {
      type: event.type,
      module: event.module,
      timestamp: new Date(event.timestamp).toLocaleTimeString()
    });

    // Add to sync queue
    this.syncQueue.push(event);

    // Process queue if not already processing
    if (!this.isProcessing) {
      await this.processSyncQueue();
    }
  }

  /**
   * Process the sync queue and update dependent modules
   */
  private async processSyncQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🔄 [CROSS-MODULE-SYNC] Processing ${this.syncQueue.length} sync events`);

    try {
      while (this.syncQueue.length > 0) {
        const event = this.syncQueue.shift();
        if (event) {
          await this.processEvent(event);
        }
      }
    } catch (error) {
      console.error('❌ [CROSS-MODULE-SYNC] Error processing sync queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual sync event
   */
  private async processEvent(event: SyncEvent): Promise<void> {
    const dependentModules = this.dependencies[event.module] || [];
    
    if (dependentModules.length === 0) {
      console.log(`🔄 [CROSS-MODULE-SYNC] No dependencies for ${event.module}`);
      return;
    }

    console.log(`🔄 [CROSS-MODULE-SYNC] Updating dependent modules for ${event.module}:`, dependentModules);

    // Invalidate queries for dependent modules
    if (this.queryClient) {
      const invalidationPromises = dependentModules.map(async (module) => {
        try {
          await this.queryClient!.invalidateQueries([module]);
          console.log(`✅ [CROSS-MODULE-SYNC] Invalidated ${module} queries`);
        } catch (error) {
          console.error(`❌ [CROSS-MODULE-SYNC] Failed to invalidate ${module}:`, error);
        }
      });

      await Promise.allSettled(invalidationPromises);
    }

    // Special handling for specific events
    await this.handleSpecialCases(event);
  }

  /**
   * Handle special cross-module synchronization cases
   */
  private async handleSpecialCases(event: SyncEvent): Promise<void> {
    switch (event.module) {
      case 'enquiries':
        await this.handleEnquiryChange(event);
        break;
      case 'documents':
        await this.handleDocumentChange(event);
        break;
      case 'shortlist':
        await this.handleShortlistChange(event);
        break;
      case 'payments':
        await this.handlePaymentChange(event);
        break;
    }
  }

  /**
   * Handle enquiry changes - update documents and shortlist
   */
  private async handleEnquiryChange(event: SyncEvent): Promise<void> {
    if (event.type === 'CREATE') {
      console.log('🔄 [CROSS-MODULE-SYNC] New enquiry created, preparing related modules');
      
      // Preload documents for new enquiry
      if (this.queryClient) {
        this.queryClient.setQueryData(['documents', event.data.id], []);
      }
    }
  }

  /**
   * Handle document changes - update shortlist eligibility
   */
  private async handleDocumentChange(event: SyncEvent): Promise<void> {
    if (event.type === 'CREATE' || event.type === 'UPDATE') {
      console.log('🔄 [CROSS-MODULE-SYNC] Document changed, checking shortlist eligibility');
      
      // Check if all required documents are verified for the enquiry
      const enquiryId = event.data.enquiryId;
      if (enquiryId && this.queryClient) {
        // Refresh documents for this enquiry
        await this.queryClient.invalidateQueries(['documents', enquiryId]);
      }
    }
  }

  /**
   * Handle shortlist changes - update payment gateway
   */
  private async handleShortlistChange(event: SyncEvent): Promise<void> {
    if (event.type === 'CREATE') {
      console.log('🔄 [CROSS-MODULE-SYNC] New shortlist created, updating payment gateway');
      
      // Prepare payment gateway data
      if (this.queryClient) {
        // Refresh payments to show new shortlist options
        await this.queryClient.invalidateQueries(['payments']);
      }
    }
  }

  /**
   * Handle payment changes - update transactions
   */
  private async handlePaymentChange(event: SyncEvent): Promise<void> {
    if (event.type === 'CREATE' && event.data.status === 'COMPLETED') {
      console.log('🔄 [CROSS-MODULE-SYNC] Payment completed, creating transaction');
      
      // Auto-create transaction for completed payment
      const transactionData = {
        name: `Payment for ${event.data.name}`,
        amount: event.data.loanAmount,
        status: 'COMPLETED',
        date: new Date().toISOString(),
        paymentId: event.data.id
      };

      // Notify transaction creation
      await this.notifyDataChange({
        type: 'CREATE',
        module: 'transactions',
        data: transactionData,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Force sync all modules
   */
  async forceSyncAll(): Promise<void> {
    console.log('🔄 [CROSS-MODULE-SYNC] Force syncing all modules');

    if (!this.queryClient) {
      console.warn('🔄 [CROSS-MODULE-SYNC] QueryClient not available for force sync');
      return;
    }

    const modules = Object.keys(this.dependencies);
    const syncPromises = modules.map(async (module) => {
      try {
        await this.queryClient!.invalidateQueries([module]);
        console.log(`✅ [CROSS-MODULE-SYNC] Force synced ${module}`);
      } catch (error) {
        console.error(`❌ [CROSS-MODULE-SYNC] Failed to force sync ${module}:`, error);
      }
    });

    await Promise.allSettled(syncPromises);
    console.log('✅ [CROSS-MODULE-SYNC] Force sync completed');
  }

  /**
   * Get sync status for all modules
   */
  getSyncStatus(): { module: string; lastSync: number; dependencies: string[] }[] {
    return Object.entries(this.dependencies).map(([module, deps]) => ({
      module,
      lastSync: Date.now(), // In real implementation, track actual sync times
      dependencies: deps
    }));
  }

  /**
   * Clean up sync queue
   */
  clearSyncQueue(): void {
    this.syncQueue = [];
    console.log('🔄 [CROSS-MODULE-SYNC] Sync queue cleared');
  }
}

// Export singleton instance
export const crossModuleSync = new CrossModuleSyncService();
export default crossModuleSync;
