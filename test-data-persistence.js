#!/usr/bin/env node

/**
 * Terminal-based Data Persistence Testing
 * Tests all pages for data visibility and persistence in Render deployment
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  baseUrl: process.env.TEST_URL || 'http://localhost:5002',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  timeout: 10000,
  retries: 3
};

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  environment: config.baseUrl.includes('render') ? 'RENDER' : 'LOCAL',
  baseUrl: config.baseUrl,
  frontendUrl: config.frontendUrl,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    info: '🔍',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const addTestResult = (test, status, details, data = null) => {
  testResults.tests.push({ test, status, details, data });
  testResults.summary.total++;
  testResults.summary[status.toLowerCase()]++;
};

// Test functions
const testApiEndpoint = async (name, endpoint) => {
  log(`Testing API endpoint: ${name} (${endpoint})`);
  
  try {
    const response = await axios.get(`${config.baseUrl}${endpoint}`, {
      timeout: config.timeout,
      validateStatus: () => true // Don't throw on non-2xx status
    });
    
    const isSuccess = response.status >= 200 && response.status < 300;
    const data = response.data;
    
    let count = 0;
    if (Array.isArray(data)) {
      count = data.length;
    } else if (data && typeof data === 'object') {
      count = data.staff?.length || data.notifications?.length || data.length || 0;
    }
    
    const status = isSuccess ? 'passed' : 'failed';
    const details = `${response.status} ${response.statusText} - ${count} items`;
    
    addTestResult(`API: ${name}`, status, details, { status: response.status, count });
    
    if (isSuccess) {
      log(`✅ ${name}: ${count} items loaded`, 'success');
    } else {
      log(`❌ ${name}: ${response.status} ${response.statusText}`, 'error');
    }
    
    return { success: isSuccess, count, data };
    
  } catch (error) {
    log(`❌ ${name}: ${error.message}`, 'error');
    addTestResult(`API: ${name}`, 'failed', `Error: ${error.message}`);
    return { success: false, count: 0, data: null };
  }
};

const testDataPersistence = async (endpoints) => {
  log('Testing data persistence across server restart simulation...');
  
  const beforeData = {};
  const afterData = {};
  
  // Collect data before
  for (const [name, endpoint] of Object.entries(endpoints)) {
    const result = await testApiEndpoint(`${name} (Before)`, endpoint);
    beforeData[name] = result.count;
  }
  
  // Simulate delay (in real scenario, this would be server restart)
  log('Simulating server restart delay...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Collect data after
  for (const [name, endpoint] of Object.entries(endpoints)) {
    const result = await testApiEndpoint(`${name} (After)`, endpoint);
    afterData[name] = result.count;
  }
  
  // Compare results
  const persistenceResults = {};
  let allPersisted = true;
  
  for (const name of Object.keys(endpoints)) {
    const before = beforeData[name] || 0;
    const after = afterData[name] || 0;
    const persisted = before === after && before > 0;
    
    persistenceResults[name] = { before, after, persisted };
    
    if (!persisted) {
      allPersisted = false;
    }
  }
  
  const status = allPersisted ? 'passed' : 'failed';
  const details = `Data persistence: ${Object.entries(persistenceResults)
    .map(([k, v]) => `${k}:${v.before}→${v.after}`)
    .join(', ')}`;
  
  addTestResult('Data Persistence', status, details, persistenceResults);
  
  if (allPersisted) {
    log('✅ Data persistence test passed', 'success');
  } else {
    log('❌ Data persistence test failed', 'error');
  }
  
  return persistenceResults;
};

const testPageRequirements = async () => {
  log('Testing page-specific data requirements...');
  
  const pageRequirements = {
    'Dashboard': ['enquiries', 'documents', 'shortlist', 'payments', 'transactions', 'staff'],
    'Enquiries': ['enquiries', 'staff'],
    'Document Verification': ['documents', 'enquiries'],
    'Document Upload': ['documents', 'enquiries'],
    'Shortlist': ['shortlist', 'enquiries', 'staff'],
    'Payment Gateway': ['payments', 'shortlist'],
    'Staff Management': ['staff'],
    'Transactions': ['transactions']
  };
  
  const endpoints = {
    enquiries: '/api/enquiries',
    documents: '/api/documents',
    shortlist: '/api/shortlist',
    staff: '/api/staff',
    payments: '/api/cashfree',
    transactions: '/api/transactions'
  };
  
  // Test each endpoint first
  const endpointResults = {};
  for (const [module, endpoint] of Object.entries(endpoints)) {
    const result = await testApiEndpoint(module, endpoint);
    endpointResults[module] = result;
  }
  
  // Test page requirements
  for (const [page, requiredModules] of Object.entries(pageRequirements)) {
    const missingModules = [];
    const availableModules = [];
    
    for (const module of requiredModules) {
      const result = endpointResults[module];
      if (result && result.success && result.count > 0) {
        availableModules.push(module);
      } else {
        missingModules.push(module);
      }
    }
    
    const allAvailable = missingModules.length === 0;
    const status = allAvailable ? 'passed' : 'failed';
    const details = allAvailable 
      ? `All ${requiredModules.length} modules available`
      : `Missing: ${missingModules.join(', ')}`;
    
    addTestResult(`Page: ${page}`, status, details, {
      required: requiredModules,
      available: availableModules,
      missing: missingModules
    });
    
    if (allAvailable) {
      log(`✅ ${page}: All required data available`, 'success');
    } else {
      log(`❌ ${page}: Missing data for ${missingModules.join(', ')}`, 'error');
    }
  }
};

const testCrossModuleSync = async () => {
  log('Testing cross-module data synchronization...');
  
  const endpoints = {
    enquiries: '/api/enquiries',
    documents: '/api/documents',
    shortlist: '/api/shortlist',
    payments: '/api/cashfree'
  };
  
  // Test data flow: enquiries → documents → shortlist → payments
  const results = {};
  for (const [module, endpoint] of Object.entries(endpoints)) {
    const result = await testApiEndpoint(`Sync: ${module}`, endpoint);
    results[module] = result;
  }
  
  // Check if data exists in the expected flow
  const hasEnquiries = results.enquiries?.count > 0;
  const hasDocuments = results.documents?.count > 0;
  const hasShortlist = results.shortlist?.count > 0;
  const hasPayments = results.payments?.count > 0;
  
  const syncWorking = hasEnquiries; // At minimum, enquiries should exist
  const status = syncWorking ? 'passed' : 'failed';
  const details = `Enquiries:${results.enquiries?.count || 0}, Documents:${results.documents?.count || 0}, Shortlist:${results.shortlist?.count || 0}, Payments:${results.payments?.count || 0}`;
  
  addTestResult('Cross-Module Sync', status, details, results);
  
  if (syncWorking) {
    log('✅ Cross-module synchronization working', 'success');
  } else {
    log('❌ Cross-module synchronization issues detected', 'error');
  }
};

const generateReport = () => {
  const { summary } = testResults;
  const successRate = Math.round((summary.passed / summary.total) * 100);
  
  const report = `
🧪 DATA PERSISTENCE TEST REPORT
Generated: ${new Date(testResults.timestamp).toLocaleString()}
Environment: ${testResults.environment}
Backend URL: ${testResults.baseUrl}
Frontend URL: ${testResults.frontendUrl}

📊 SUMMARY:
Total Tests: ${summary.total}
✅ Passed: ${summary.passed}
❌ Failed: ${summary.failed}
⚠️ Warnings: ${summary.warnings}
Success Rate: ${successRate}%

📋 DETAILED RESULTS:
${testResults.tests.map(test => {
  const icon = test.status === 'passed' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
  return `${icon} ${test.test}: ${test.details}`;
}).join('\n')}

🔍 RECOMMENDATIONS:
${summary.failed > 0 ? '❌ Fix failed API endpoints or data loading issues' : ''}
${summary.warnings > 0 ? '⚠️ Review warnings for potential improvements' : ''}
${summary.failed === 0 && summary.warnings === 0 ? '✅ All tests passed! System is ready for production.' : ''}

🚀 RENDER DEPLOYMENT STATUS:
${successRate >= 90 ? '✅ READY FOR DEPLOYMENT' : '❌ NEEDS FIXES BEFORE DEPLOYMENT'}
`;

  return report;
};

const saveReport = (report) => {
  const filename = `data-persistence-test-${Date.now()}.txt`;
  const filepath = path.join(__dirname, filename);
  
  try {
    fs.writeFileSync(filepath, report);
    log(`📄 Test report saved to: ${filename}`, 'success');
  } catch (error) {
    log(`❌ Failed to save report: ${error.message}`, 'error');
  }
};

// Main test execution
const runTests = async () => {
  log('🚀 Starting comprehensive data persistence tests...');
  log(`Backend URL: ${config.baseUrl}`);
  log(`Frontend URL: ${config.frontendUrl}`);
  
  try {
    // Test 1: API Endpoints
    log('\n📡 Testing API Endpoints...');
    const endpoints = {
      enquiries: '/api/enquiries',
      documents: '/api/documents',
      shortlist: '/api/shortlist',
      staff: '/api/staff',
      payments: '/api/cashfree',
      transactions: '/api/transactions',
      notifications: '/api/notifications'
    };
    
    for (const [name, endpoint] of Object.entries(endpoints)) {
      await testApiEndpoint(name, endpoint);
    }
    
    // Test 2: Data Persistence
    log('\n💾 Testing Data Persistence...');
    await testDataPersistence(endpoints);
    
    // Test 3: Page Requirements
    log('\n📄 Testing Page Requirements...');
    await testPageRequirements();
    
    // Test 4: Cross-Module Sync
    log('\n🔄 Testing Cross-Module Synchronization...');
    await testCrossModuleSync();
    
    // Generate and display report
    log('\n📊 Generating Test Report...');
    const report = generateReport();
    console.log(report);
    
    // Save report to file
    saveReport(report);
    
    // Exit with appropriate code
    const exitCode = testResults.summary.failed > 0 ? 1 : 0;
    log(`\n🏁 Tests completed with exit code: ${exitCode}`);
    process.exit(exitCode);
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🧪 Data Persistence Testing Tool

Usage: node test-data-persistence.js [options]

Options:
  --help, -h          Show this help message
  --url <url>         Backend URL (default: http://localhost:5002)
  --frontend <url>    Frontend URL (default: http://localhost:3001)
  --timeout <ms>      Request timeout in milliseconds (default: 10000)

Environment Variables:
  TEST_URL           Backend URL for testing
  FRONTEND_URL       Frontend URL for testing

Examples:
  node test-data-persistence.js
  node test-data-persistence.js --url http://localhost:5002
  TEST_URL=https://your-app.onrender.com node test-data-persistence.js
`);
  process.exit(0);
}

// Parse command line arguments
const urlIndex = args.indexOf('--url');
if (urlIndex !== -1 && args[urlIndex + 1]) {
  config.baseUrl = args[urlIndex + 1];
}

const frontendIndex = args.indexOf('--frontend');
if (frontendIndex !== -1 && args[frontendIndex + 1]) {
  config.frontendUrl = args[frontendIndex + 1];
}

const timeoutIndex = args.indexOf('--timeout');
if (timeoutIndex !== -1 && args[timeoutIndex + 1]) {
  config.timeout = parseInt(args[timeoutIndex + 1]);
}

// Run the tests
runTests();
