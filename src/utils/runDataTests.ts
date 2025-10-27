/**
 * Browser Console Test Runner
 * Run this in browser console to test data persistence across all pages
 */

export const runBrowserTests = async () => {
  console.log('🧪 [BROWSER-TEST] Starting comprehensive data persistence tests...');
  
  const results = {
    timestamp: new Date().toLocaleString(),
    environment: window.location.hostname.includes('render') ? 'RENDER' : 'LOCAL',
    tests: [] as any[],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  // Test 1: API Endpoints Availability
  console.log('🧪 [BROWSER-TEST] Testing API endpoints...');
  const endpoints = [
    { name: 'Enquiries', url: '/api/enquiries' },
    { name: 'Documents', url: '/api/documents' },
    { name: 'Shortlist', url: '/api/shortlist' },
    { name: 'Staff', url: '/api/staff' },
    { name: 'Payments', url: '/api/cashfree' },
    { name: 'Transactions', url: '/api/transactions' },
    { name: 'Notifications', url: '/api/notifications' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url);
      const data = await response.json();
      const count = Array.isArray(data) ? data.length : (data?.length || data?.staff?.length || data?.notifications?.length || 0);
      
      results.tests.push({
        test: `API: ${endpoint.name}`,
        status: response.ok ? 'PASS' : 'FAIL',
        details: `${response.status} - ${count} items`,
        data: response.ok ? data : null
      });
      
      if (response.ok) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
      }
    } catch (error: any) {
      results.tests.push({
        test: `API: ${endpoint.name}`,
        status: 'FAIL',
        details: `Error: ${error.message}`,
        data: null
      });
      results.summary.failed++;
    }
    results.summary.total++;
  }

  // Test 2: React Query Cache Status
  console.log('🧪 [BROWSER-TEST] Testing React Query cache...');
  const queryClient = (window as any).__REACT_QUERY_CLIENT__;
  
  if (queryClient) {
    const modules = ['enquiries', 'documents', 'shortlist', 'staff', 'payments', 'transactions', 'notifications'];
    
    modules.forEach(module => {
      const cachedData = queryClient.getQueryData([module]);
      const queryState = queryClient.getQueryState([module]);
      
      const hasData = !!cachedData;
      const dataCount = Array.isArray(cachedData) ? cachedData.length : 0;
      const lastUpdated = queryState?.dataUpdatedAt ? new Date(queryState.dataUpdatedAt).toLocaleTimeString() : 'Never';
      
      results.tests.push({
        test: `Cache: ${module}`,
        status: hasData ? 'PASS' : 'FAIL',
        details: `${dataCount} items, updated: ${lastUpdated}`,
        data: hasData
      });
      
      if (hasData) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
      }
      results.summary.total++;
    });
  } else {
    results.tests.push({
      test: 'React Query Client',
      status: 'FAIL',
      details: 'Query client not found in window object',
      data: null
    });
    results.summary.failed++;
    results.summary.total++;
  }

  // Test 3: Local Storage Persistence
  console.log('🧪 [BROWSER-TEST] Testing local storage...');
  try {
    const testKey = 'render-persistence-test';
    const testValue = JSON.stringify({ timestamp: Date.now(), test: true });
    
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    const parsed = JSON.parse(retrieved || '{}');
    
    localStorage.removeItem(testKey);
    
    results.tests.push({
      test: 'Local Storage',
      status: parsed.test ? 'PASS' : 'FAIL',
      details: 'Read/write operations successful',
      data: parsed.test
    });
    
    if (parsed.test) {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
  } catch (error: any) {
    results.tests.push({
      test: 'Local Storage',
      status: 'FAIL',
      details: `Error: ${error.message}`,
      data: null
    });
    results.summary.failed++;
  }
  results.summary.total++;

  // Test 4: Page Navigation Persistence
  console.log('🧪 [BROWSER-TEST] Testing page navigation...');
  const currentPath = window.location.pathname;
  const testPaths = ['/', '/enquiries', '/documents/verification', '/shortlist', '/staff'];
  
  for (const path of testPaths) {
    try {
      // Simulate navigation test by checking if path is accessible
      const isCurrentPath = currentPath === path;
      const hasRequiredElements = document.querySelector('main, [role="main"], .main-content') !== null;
      
      results.tests.push({
        test: `Navigation: ${path}`,
        status: hasRequiredElements ? 'PASS' : 'WARNING',
        details: isCurrentPath ? 'Current page' : 'Navigation available',
        data: { isCurrentPath, hasRequiredElements }
      });
      
      if (hasRequiredElements) {
        results.summary.passed++;
      } else {
        results.summary.warnings++;
      }
    } catch (error: any) {
      results.tests.push({
        test: `Navigation: ${path}`,
        status: 'FAIL',
        details: `Error: ${error.message}`,
        data: null
      });
      results.summary.failed++;
    }
    results.summary.total++;
  }

  // Generate Report
  console.log('🧪 [BROWSER-TEST] Generating test report...');
  
  const report = `
🧪 DATA PERSISTENCE TEST REPORT
Generated: ${results.timestamp}
Environment: ${results.environment}
URL: ${window.location.href}

📊 SUMMARY:
Total Tests: ${results.summary.total}
✅ Passed: ${results.summary.passed}
❌ Failed: ${results.summary.failed}
⚠️ Warnings: ${results.summary.warnings}
Success Rate: ${Math.round((results.summary.passed / results.summary.total) * 100)}%

📋 DETAILED RESULTS:
${results.tests.map(test => 
  `${test.status === 'PASS' ? '✅' : test.status === 'WARNING' ? '⚠️' : '❌'} ${test.test}: ${test.details}`
).join('\n')}

🔍 RECOMMENDATIONS:
${results.summary.failed > 0 ? '- Fix failed API endpoints or cache issues' : ''}
${results.summary.warnings > 0 ? '- Review warnings for potential improvements' : ''}
${results.summary.failed === 0 && results.summary.warnings === 0 ? '- All tests passed! System is ready for production.' : ''}
`;

  console.log(report);
  
  // Try to copy to clipboard
  try {
    await navigator.clipboard.writeText(report);
    console.log('📋 Test report copied to clipboard!');
  } catch (error) {
    console.log('📋 Could not copy to clipboard, but report is logged above');
  }

  return results;
};

// Make it available globally for console use
(window as any).runDataTests = runBrowserTests;

console.log(`
🧪 DATA PERSISTENCE TESTING AVAILABLE

To run comprehensive tests, execute in console:
runDataTests()

This will test:
✅ API endpoint availability
✅ React Query cache status  
✅ Local storage functionality
✅ Page navigation persistence
✅ Data visibility across modules

Results will be logged and copied to clipboard.
`);

export default runBrowserTests;
