/**
 * Data Testing Utilities for Render Deployment
 * Comprehensive testing of data visibility and persistence across all pages
 */

import { QueryClient } from 'react-query';

export interface ModuleTestResult {
  module: string;
  endpoint: string;
  dataLoaded: boolean;
  dataCount: number;
  cacheStatus: 'fresh' | 'stale' | 'empty';
  lastUpdated: string;
  errors: string[];
}

export interface PageTestResult {
  page: string;
  route: string;
  modules: string[];
  allModulesLoaded: boolean;
  testResults: ModuleTestResult[];
  overallStatus: 'pass' | 'fail' | 'warning';
  timestamp: string;
}

class DataTestingService {
  private queryClient: QueryClient | null = null;

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  /**
   * Test data visibility for a specific module
   */
  async testModule(module: string, endpoint: string): Promise<ModuleTestResult> {
    const errors: string[] = [];
    let dataLoaded = false;
    let dataCount = 0;
    let cacheStatus: 'fresh' | 'stale' | 'empty' = 'empty';
    let lastUpdated = 'Never';

    try {
      // Check cache first
      if (this.queryClient) {
        const cachedData = this.queryClient.getQueryData([module]);
        const queryState = this.queryClient.getQueryState([module]);

        if (cachedData) {
          dataLoaded = true;
          dataCount = Array.isArray(cachedData) ? cachedData.length : 1;
          
          if (queryState?.dataUpdatedAt) {
            lastUpdated = new Date(queryState.dataUpdatedAt).toLocaleTimeString();
            const timeSinceUpdate = Date.now() - queryState.dataUpdatedAt;
            cacheStatus = timeSinceUpdate < 5 * 60 * 1000 ? 'fresh' : 'stale'; // 5 minutes
          }
        }
      }

      // Test API endpoint
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          errors.push(`API Error: ${response.status} ${response.statusText}`);
        } else {
          const data = await response.json();
          if (!dataLoaded) {
            dataLoaded = true;
            dataCount = Array.isArray(data) ? data.length : (data?.length || 1);
          }
        }
      } catch (apiError: any) {
        errors.push(`Network Error: ${apiError.message}`);
      }

    } catch (error: any) {
      errors.push(`Test Error: ${error.message}`);
    }

    return {
      module,
      endpoint,
      dataLoaded,
      dataCount,
      cacheStatus,
      lastUpdated,
      errors
    };
  }

  /**
   * Test all modules for a specific page
   */
  async testPage(page: string, route: string, modules: string[]): Promise<PageTestResult> {
    console.log(`🧪 [DATA-TEST] Testing page: ${page} (${route})`);

    const moduleEndpoints: Record<string, string> = {
      enquiries: '/api/enquiries',
      documents: '/api/documents',
      shortlist: '/api/shortlist',
      staff: '/api/staff',
      payments: '/api/cashfree',
      transactions: '/api/transactions',
      notifications: '/api/notifications'
    };

    const testPromises = modules.map(module => 
      this.testModule(module, moduleEndpoints[module] || `/api/${module}`)
    );

    const testResults = await Promise.all(testPromises);
    const allModulesLoaded = testResults.every(result => result.dataLoaded);
    const hasErrors = testResults.some(result => result.errors.length > 0);
    
    let overallStatus: 'pass' | 'fail' | 'warning' = 'pass';
    if (!allModulesLoaded) {
      overallStatus = 'fail';
    } else if (hasErrors) {
      overallStatus = 'warning';
    }

    return {
      page,
      route,
      modules,
      allModulesLoaded,
      testResults,
      overallStatus,
      timestamp: new Date().toLocaleTimeString()
    };
  }

  /**
   * Test data persistence by simulating page refresh
   */
  async testDataPersistence(modules: string[]): Promise<{ 
    beforeRefresh: Record<string, number>;
    afterRefresh: Record<string, number>;
    persistenceStatus: 'pass' | 'fail';
  }> {
    console.log('🧪 [DATA-TEST] Testing data persistence...');

    const beforeRefresh: Record<string, number> = {};
    const afterRefresh: Record<string, number> = {};

    // Capture data counts before simulated refresh
    if (this.queryClient) {
      modules.forEach(module => {
        const data = this.queryClient!.getQueryData([module]);
        beforeRefresh[module] = Array.isArray(data) ? data.length : 0;
      });
    }

    // Simulate data refresh (invalidate and refetch)
    if (this.queryClient) {
      await Promise.all(modules.map(module => 
        this.queryClient!.invalidateQueries([module])
      ));

      // Wait a moment for refetch
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Capture data counts after refresh
      modules.forEach(module => {
        const data = this.queryClient!.getQueryData([module]);
        afterRefresh[module] = Array.isArray(data) ? data.length : 0;
      });
    }

    const persistenceStatus = modules.every(module => 
      beforeRefresh[module] === afterRefresh[module] && beforeRefresh[module] > 0
    ) ? 'pass' : 'fail';

    return { beforeRefresh, afterRefresh, persistenceStatus };
  }

  /**
   * Run comprehensive test suite for all pages
   */
  async runFullTestSuite(): Promise<{
    pageTests: PageTestResult[];
    persistenceTest: any;
    overallStatus: 'pass' | 'fail' | 'warning';
    summary: string;
  }> {
    console.log('🧪 [DATA-TEST] Starting comprehensive test suite...');

    const pageConfigs = [
      { page: 'Dashboard', route: '/', modules: ['enquiries', 'documents', 'shortlist', 'payments', 'transactions', 'staff'] },
      { page: 'Enquiries', route: '/enquiries', modules: ['enquiries', 'staff'] },
      { page: 'Document Verification', route: '/documents/verification', modules: ['documents', 'enquiries'] },
      { page: 'Document Upload', route: '/documents/upload', modules: ['documents', 'enquiries'] },
      { page: 'Shortlist', route: '/shortlist', modules: ['shortlist', 'enquiries', 'staff'] },
      { page: 'Payment Gateway', route: '/payment-gateway', modules: ['payments', 'shortlist'] },
      { page: 'Staff Management', route: '/staff', modules: ['staff'] },
      { page: 'Transactions', route: '/transactions', modules: ['transactions'] }
    ];

    // Test all pages
    const pageTests = await Promise.all(
      pageConfigs.map(config => 
        this.testPage(config.page, config.route, config.modules)
      )
    );

    // Test data persistence
    const allModules = ['enquiries', 'documents', 'shortlist', 'payments', 'transactions', 'staff', 'notifications'];
    const persistenceTest = await this.testDataPersistence(allModules);

    // Calculate overall status
    const pageFailures = pageTests.filter(test => test.overallStatus === 'fail').length;
    const pageWarnings = pageTests.filter(test => test.overallStatus === 'warning').length;
    const persistenceFailed = persistenceTest.persistenceStatus === 'fail';

    let overallStatus: 'pass' | 'fail' | 'warning' = 'pass';
    if (pageFailures > 0 || persistenceFailed) {
      overallStatus = 'fail';
    } else if (pageWarnings > 0) {
      overallStatus = 'warning';
    }

    const summary = `Pages: ${pageTests.length - pageFailures}/${pageTests.length} passing, Persistence: ${persistenceTest.persistenceStatus}`;

    return {
      pageTests,
      persistenceTest,
      overallStatus,
      summary
    };
  }

  /**
   * Generate test report
   */
  generateReport(testResults: any): string {
    const { pageTests, persistenceTest, overallStatus, summary } = testResults;
    
    let report = `
🧪 DATA PERSISTENCE TEST REPORT
Generated: ${new Date().toLocaleString()}
Overall Status: ${overallStatus.toUpperCase()}
Summary: ${summary}

📊 PAGE TESTS:
`;

    pageTests.forEach((pageTest: PageTestResult) => {
      report += `
${pageTest.overallStatus === 'pass' ? '✅' : pageTest.overallStatus === 'warning' ? '⚠️' : '❌'} ${pageTest.page} (${pageTest.route})
  Modules: ${pageTest.modules.join(', ')}
  All Data Loaded: ${pageTest.allModulesLoaded ? 'Yes' : 'No'}
`;

      pageTest.testResults.forEach(result => {
        const status = result.dataLoaded ? '✅' : '❌';
        report += `    ${status} ${result.module}: ${result.dataCount} items (${result.cacheStatus}, updated: ${result.lastUpdated})\n`;
        
        if (result.errors.length > 0) {
          result.errors.forEach(error => {
            report += `      ⚠️ ${error}\n`;
          });
        }
      });
    });

    report += `
🔄 PERSISTENCE TEST:
Status: ${persistenceTest.persistenceStatus === 'pass' ? '✅ PASS' : '❌ FAIL'}

Before Refresh: ${Object.entries(persistenceTest.beforeRefresh).map(([k, v]) => `${k}:${v}`).join(', ')}
After Refresh:  ${Object.entries(persistenceTest.afterRefresh).map(([k, v]) => `${k}:${v}`).join(', ')}
`;

    return report;
  }
}

export const dataTestingService = new DataTestingService();
export default dataTestingService;
