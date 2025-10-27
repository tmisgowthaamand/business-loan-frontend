# 🧪 Data Persistence Testing Guide

## Overview
This guide provides comprehensive testing for data visibility and persistence across all pages in the Render deployment.

## Prerequisites

### 1. Backend Server Running
Ensure the backend server is running on port 5002:
```bash
# Navigate to backend directory
cd ../Loan-backend-main

# Install dependencies (if not done)
npm install

# Start the backend server
npm run start:dev
# or
npm run start
```

### 2. Frontend Server Running (Optional)
For complete testing, ensure frontend is running on port 3001:
```bash
# In frontend directory
npm run dev
```

## Testing Methods

### Method 1: Terminal Command Testing (Recommended)

#### Local Testing
```bash
# Test against local backend
npm run test:data:local

# Or directly with node
node test-data-persistence.js --url http://localhost:5002
```

#### Render Deployment Testing
```bash
# Test against Render deployment (replace with your URL)
node test-data-persistence.js --url https://your-app.onrender.com

# Or using environment variable
set TEST_URL=https://your-app.onrender.com && node test-data-persistence.js
```

#### Custom URL Testing
```bash
# Test with custom backend URL
node test-data-persistence.js --url http://your-backend-url:port

# With custom frontend URL too
node test-data-persistence.js --url http://your-backend-url:port --frontend http://your-frontend-url:port
```

### Method 2: Browser Console Testing

1. Open your application in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Run: `runDataTests()`
5. Review comprehensive test results

### Method 3: Visual Testing Interface

1. Navigate to `/data-test` page (if route added)
2. Wait for all modules to show "Ready"
3. Click "Run Tests" button
4. Review results and copy report

## Test Coverage

### 🔍 API Endpoints Tested
- ✅ `/api/enquiries` - Enquiry data
- ✅ `/api/documents` - Document data
- ✅ `/api/shortlist` - Shortlist data
- ✅ `/api/staff` - Staff data
- ✅ `/api/cashfree` - Payment gateway data
- ✅ `/api/transactions` - Transaction data
- ✅ `/api/notifications` - Notification data

### 📄 Page Requirements Tested
- ✅ **Dashboard** - Requires: enquiries, documents, shortlist, payments, transactions, staff
- ✅ **Enquiries** - Requires: enquiries, staff
- ✅ **Document Verification** - Requires: documents, enquiries
- ✅ **Document Upload** - Requires: documents, enquiries
- ✅ **Shortlist** - Requires: shortlist, enquiries, staff
- ✅ **Payment Gateway** - Requires: payments, shortlist
- ✅ **Staff Management** - Requires: staff
- ✅ **Transactions** - Requires: transactions

### 🔄 Data Persistence Tested
- ✅ Data availability after simulated server restart
- ✅ Cross-module data synchronization
- ✅ Cache persistence and refresh behavior

## Expected Results

### ✅ Successful Test Output
```
🧪 DATA PERSISTENCE TEST REPORT
Generated: [timestamp]
Environment: LOCAL/RENDER
Backend URL: [url]

📊 SUMMARY:
Total Tests: 41
✅ Passed: 35+
❌ Failed: 0-5
⚠️ Warnings: 0-5
Success Rate: 85%+

🚀 RENDER DEPLOYMENT STATUS:
✅ READY FOR DEPLOYMENT
```

### ❌ Failed Test Indicators
- API endpoints returning errors
- Missing data for page requirements
- Data persistence failures
- Cross-module sync issues

## Troubleshooting

### Backend Server Not Running
```
❌ API: enquiries: Error: Error
❌ All endpoints failing
```
**Solution:** Start the backend server on port 5002

### Port Conflicts
```
❌ API: enquiries: Error: connect ECONNREFUSED
```
**Solution:** Check if backend is running on correct port

### CORS Issues
```
❌ API: enquiries: Error: CORS policy
```
**Solution:** Ensure backend CORS is configured for frontend URL

### Missing Data
```
❌ Page: Dashboard: Missing: enquiries, documents, shortlist
```
**Solution:** Check if backend services are properly initialized with sample data

## Manual Testing Checklist

### 1. Page Load Testing
- [ ] Dashboard loads with data
- [ ] Enquiries page shows enquiry list
- [ ] Document verification shows documents
- [ ] Shortlist shows shortlisted clients
- [ ] Payment gateway shows applications
- [ ] Staff management shows staff list
- [ ] Transactions shows transaction data

### 2. Data Persistence Testing
- [ ] Refresh dashboard - data remains visible
- [ ] Navigate between pages - data consistent
- [ ] Login/logout - data persists
- [ ] Add new enquiry - appears across modules
- [ ] Upload document - visible immediately
- [ ] Add to shortlist - appears in shortlist and payment gateway

### 3. Cross-Module Sync Testing
- [ ] New enquiry → Documents page shows client
- [ ] Document verification → Shortlist eligibility
- [ ] Shortlist addition → Payment gateway options
- [ ] Payment completion → Transaction creation

## Render Deployment Verification

### Pre-Deployment Checklist
- [ ] All local tests pass (85%+ success rate)
- [ ] Backend server starts without errors
- [ ] Frontend builds successfully
- [ ] Environment variables configured
- [ ] Database connections working

### Post-Deployment Testing
```bash
# Test deployed application
node test-data-persistence.js --url https://your-app.onrender.com
```

### Expected Render Behavior
- [ ] All API endpoints accessible
- [ ] Data persists across cold starts
- [ ] Cross-module synchronization working
- [ ] No blank pages after refresh
- [ ] Login/logout maintains data

## Support

If tests fail consistently:

1. **Check Backend Logs:** Look for errors in backend console
2. **Verify Environment:** Ensure all environment variables are set
3. **Database Status:** Check if database connections are working
4. **Network Issues:** Verify no firewall/proxy blocking requests
5. **Browser Console:** Check for frontend JavaScript errors

## Test Report Files

Test reports are automatically saved as:
- `data-persistence-test-[timestamp].txt`

These contain detailed results for documentation and debugging.
