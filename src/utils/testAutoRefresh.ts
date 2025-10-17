/**
 * Automatic Refresh Functionality Test
 * This utility helps test the data persistence and auto-refresh across all pages
 */

import { QueryClient } from 'react-query';

export interface RefreshTestResult {
  page: string;
  endpoint: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  dataCount?: number;
}

export class AutoRefreshTester {
  public results: RefreshTestResult[] = [];
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Test all API endpoints for data persistence
   */
  async testAllEndpoints(): Promise<RefreshTestResult[]> {
    console.log('🧪 Starting comprehensive auto-refresh test...');
    
    const endpoints = [
      { page: 'Dashboard', endpoint: '/api/enquiries', queryKey: 'dashboard-data' },
      { page: 'Enquiry List', endpoint: '/api/enquiries', queryKey: 'enquiries' },
      { page: 'Document Verification', endpoint: '/api/documents', queryKey: 'documents-verification' },
      { page: 'Document Upload', endpoint: '/api/documents', queryKey: 'documents' },
      { page: 'Shortlist', endpoint: '/api/shortlist', queryKey: 'shortlists' },
      { page: 'Payment Gateway', endpoint: '/api/cashfree', queryKey: 'cashfree-applications' },
      { page: 'Staff Management', endpoint: '/api/staff', queryKey: 'staff' },
    ];

    for (const test of endpoints) {
      await this.testEndpoint(test.page, test.endpoint, test.queryKey);
    }

    return this.results;
  }

  /**
   * Test individual endpoint
   */
  private async testEndpoint(page: string, endpoint: string, queryKey: string): Promise<void> {
    try {
      console.log(`🔍 Testing ${page} - ${endpoint}`);
      
      // Test API endpoint directly
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        // Test React Query cache
        const cachedData = this.queryClient.getQueryData(queryKey);
        
        this.results.push({
          page,
          endpoint,
          status: 'success',
          message: `✅ API working, data count: ${Array.isArray(data) ? data.length : 'N/A'}${cachedData ? ', cached data exists' : ', no cached data'}`,
          timestamp: new Date().toISOString(),
          dataCount: Array.isArray(data) ? data.length : undefined
        });
        
        console.log(`✅ ${page} test passed`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      this.results.push({
        page,
        endpoint,
        status: 'error',
        message: `❌ ${error.message}`,
        timestamp: new Date().toISOString()
      });
      
      console.error(`❌ ${page} test failed:`, error.message);
    }
  }

  /**
   * Test cache invalidation and refresh
   */
  async testCacheInvalidation(): Promise<void> {
    console.log('🔄 Testing cache invalidation...');
    
    const queryKeys = [
      'dashboard-data',
      'enquiries', 
      'documents',
      'documents-verification',
      'shortlists',
      'cashfree-applications',
      'staff'
    ];

    for (const key of queryKeys) {
      try {
        // Get current cache state
        const beforeInvalidation = this.queryClient.getQueryData(key);
        
        // Invalidate query
        await this.queryClient.invalidateQueries(key);
        
        // Wait a bit for potential refetch
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const afterInvalidation = this.queryClient.getQueryData(key);
        
        this.results.push({
          page: `Cache Test - ${key}`,
          endpoint: 'cache-invalidation',
          status: 'success',
          message: `✅ Cache invalidated successfully. Before: ${beforeInvalidation ? 'exists' : 'empty'}, After: ${afterInvalidation ? 'exists' : 'empty'}`,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Cache invalidation test passed for ${key}`);
      } catch (error: any) {
        this.results.push({
          page: `Cache Test - ${key}`,
          endpoint: 'cache-invalidation',
          status: 'error',
          message: `❌ Cache invalidation failed: ${error.message}`,
          timestamp: new Date().toISOString()
        });
        
        console.error(`❌ Cache invalidation test failed for ${key}:`, error.message);
      }
    }
  }

  /**
   * Test automatic refresh intervals
   */
  async testAutoRefreshIntervals(): Promise<void> {
    console.log('⏰ Testing auto-refresh intervals...');
    
    // Monitor query cache for automatic updates
    const monitorDuration = 35000; // 35 seconds to catch 30-second interval
    const startTime = Date.now();
    
    const initialCacheState = {
      'dashboard-data': this.queryClient.getQueryData('dashboard-data'),
      'enquiries': this.queryClient.getQueryData('enquiries'),
      'shortlists': this.queryClient.getQueryData('shortlists')
    };
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed >= monitorDuration) {
          clearInterval(checkInterval);
          
          const finalCacheState = {
            'dashboard-data': this.queryClient.getQueryData('dashboard-data'),
            'enquiries': this.queryClient.getQueryData('enquiries'),
            'shortlists': this.queryClient.getQueryData('shortlists')
          };
          
          // Check if any cache has been updated
          let refreshDetected = false;
          for (const [key, initialData] of Object.entries(initialCacheState)) {
            const finalData = finalCacheState[key as keyof typeof finalCacheState];
            if (initialData !== finalData) {
              refreshDetected = true;
              break;
            }
          }
          
          this.results.push({
            page: 'Auto-refresh Monitor',
            endpoint: 'interval-refresh',
            status: refreshDetected ? 'success' : 'error',
            message: refreshDetected 
              ? `✅ Auto-refresh detected within ${monitorDuration/1000}s` 
              : `❌ No auto-refresh detected within ${monitorDuration/1000}s`,
            timestamp: new Date().toISOString()
          });
          
          console.log(refreshDetected 
            ? `✅ Auto-refresh test passed` 
            : `❌ Auto-refresh test failed - no refresh detected`
          );
          
          resolve();
        }
      }, 5000); // Check every 5 seconds
    });
  }

  /**
   * Generate test report
   */
  generateReport(): string {
    const successCount = this.results.filter(r => r.status === 'success').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    
    let report = `
🧪 AUTO-REFRESH FUNCTIONALITY TEST REPORT
==========================================

📊 Summary:
- Total Tests: ${this.results.length}
- Passed: ${successCount} ✅
- Failed: ${errorCount} ❌
- Success Rate: ${((successCount / this.results.length) * 100).toFixed(1)}%

📋 Detailed Results:
`;

    this.results.forEach((result, index) => {
      report += `
${index + 1}. ${result.page}
   Endpoint: ${result.endpoint}
   Status: ${result.status === 'success' ? '✅ PASS' : '❌ FAIL'}
   Message: ${result.message}
   Time: ${new Date(result.timestamp).toLocaleTimeString()}
   ${result.dataCount !== undefined ? `Data Count: ${result.dataCount}` : ''}
`;
    });

    report += `
==========================================
Test completed at: ${new Date().toLocaleString()}
`;

    return report;
  }

  /**
   * Clear test results
   */
  clearResults(): void {
    this.results = [];
  }
}

/**
 * Quick test function for console usage
 */
export const runQuickRefreshTest = async (queryClient: QueryClient): Promise<void> => {
  const tester = new AutoRefreshTester(queryClient);
  
  console.log('🚀 Starting quick auto-refresh test...');
  
  // Test all endpoints
  await tester.testAllEndpoints();
  
  // Test cache invalidation
  await tester.testCacheInvalidation();
  
  // Generate and display report
  const report = tester.generateReport();
  console.log(report);
  
  // Also log to help with debugging
  console.table(tester.results);
};
