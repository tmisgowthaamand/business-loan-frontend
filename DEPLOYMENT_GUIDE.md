# Frontend-Backend API Connection Guide

## 🔗 **Deployment URLs**
- **Frontend (Vercel):** https://business-loan-frontend.vercel.app/
- **Backend (Render):** https://business-loan-backend.onrender.com

## ✅ **API Configuration Complete**

### **Automatic Environment Detection:**
The frontend now automatically detects the deployment environment:

- **Production (Vercel):** Uses `https://business-loan-backend.onrender.com`
- **Development:** Uses `http://localhost:5002`
- **Custom:** Uses `VITE_BACKEND_URL` environment variable

### **Files Updated:**

#### **1. API Configuration (`src/lib/api.ts`):**
```typescript
const getBackendURL = () => {
  // Check if we're in production (Vercel deployment)
  if (import.meta.env.PROD) {
    return 'https://business-loan-backend.onrender.com';
  }
  
  // Check for environment variable
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:5002';
};
```

#### **2. Environment Variables:**
- **`.env.production`:** `VITE_BACKEND_URL=https://business-loan-backend.onrender.com`
- **`.env.development`:** `VITE_BACKEND_URL=http://localhost:5002`
- **`.env`:** `VITE_BACKEND_URL=http://localhost:5002`

#### **3. Component Updates:**
- **ShortlistList.tsx:** Now uses shared API instance
- **CashfreeApplicationForm.tsx:** Now uses shared API instance
- **NotificationContext.tsx:** Now uses shared API instance
- **DocumentUpload.tsx:** Uses dynamic URL for PDF viewing
- **ClientDocumentsView.tsx:** Uses dynamic URL for PDF viewing

## 🚀 **Deployment Steps**

### **For Vercel (Frontend):**
1. **Push Changes to Git:**
   ```bash
   git add .
   git commit -m "Connect frontend to Render backend"
   git push origin main
   ```

2. **Vercel will automatically:**
   - Detect production environment
   - Use `https://business-loan-backend.onrender.com` as backend URL
   - Build and deploy the frontend

3. **Environment Variables in Vercel Dashboard:**
   - Go to Vercel project settings
   - Add: `VITE_BACKEND_URL=https://business-loan-backend.onrender.com`

### **For Render (Backend):**
- Backend should already be deployed
- Ensure it's accessible at: `https://business-loan-backend.onrender.com`

## 🔧 **API Endpoints Connected**

All frontend API calls will now route to the Render backend:

### **Core APIs:**
- **Enquiries:** `GET/POST/PUT/DELETE /api/enquiries`
- **Documents:** `GET/POST/PUT/DELETE /api/documents`
- **Shortlist:** `GET/POST/PUT/DELETE /api/shortlist`
- **Payment Gateway:** `GET/POST/PUT/DELETE /api/cashfree`
- **Staff Management:** `GET/POST/PUT/DELETE /api/staff`
- **Notifications:** `GET/POST/PUT/DELETE /api/notifications`
- **Transactions:** `GET/POST/PUT/DELETE /api/transactions`

### **Special Endpoints:**
- **Health Check:** `GET /health`
- **PDF Viewing:** `GET /api/documents/{id}/view`
- **File Upload:** `POST /api/documents/upload`

## 🌐 **CORS Configuration**

Ensure your Render backend allows requests from Vercel:

```typescript
// In your backend main.ts
app.enableCors({
  origin: [
    'http://localhost:3001',
    'https://business-loan-frontend.vercel.app',
    'https://*.vercel.app' // Allow all Vercel preview deployments
  ],
  credentials: true,
});
```

## 📊 **Testing the Connection**

### **1. Check Frontend Console:**
- Open browser dev tools on Vercel deployment
- Look for: `🔗 Backend URL configured: https://business-loan-backend.onrender.com`

### **2. Test API Calls:**
- Navigate to dashboard
- Check if data loads from Render backend
- Verify network tab shows requests to `business-loan-backend.onrender.com`

### **3. Test Key Features:**
- **Login/Authentication**
- **Dashboard Statistics**
- **Enquiry Management**
- **Document Upload/Viewing**
- **Shortlist Operations**
- **Payment Gateway**
- **Notifications**

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **1. CORS Errors:**
- Update backend CORS settings to include Vercel domain
- Check browser console for CORS error messages

#### **2. API Timeout:**
- Render free tier may have cold starts
- First request might take 30+ seconds

#### **3. Environment Variables:**
- Verify `VITE_BACKEND_URL` is set correctly in Vercel
- Check that environment variables start with `VITE_`

#### **4. Build Issues:**
- Ensure all imports are correct
- Check TypeScript compilation errors

### **Debug Commands:**
```bash
# Check environment variables
console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);

# Test API connection
fetch('https://business-loan-backend.onrender.com/health')
  .then(res => res.json())
  .then(data => console.log('Backend health:', data));
```

## ✅ **Success Indicators**

When everything is working correctly:

1. **Frontend loads without errors**
2. **Dashboard shows real data from backend**
3. **All CRUD operations work**
4. **File uploads and PDF viewing work**
5. **Notifications display properly**
6. **No CORS errors in console**

## 🎯 **Next Steps**

1. **Deploy to Vercel:** Push changes and verify deployment
2. **Test All Features:** Go through each page and functionality
3. **Monitor Performance:** Check API response times
4. **Set up Monitoring:** Add error tracking and analytics

**Your frontend and backend are now fully connected! 🎉**
