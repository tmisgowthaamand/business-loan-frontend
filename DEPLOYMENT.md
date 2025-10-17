# 🚀 Vercel Deployment Guide

This guide will help you deploy the Business Loan Management Frontend to Vercel.

## 📋 Prerequisites

- [Vercel Account](https://vercel.com)
- [GitHub Repository](https://github.com) (recommended)
- Backend API deployed (for production)

## 🔧 Quick Deploy

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-domain.vercel.app
   VITE_APP_ENVIRONMENT=production
   VITE_APP_NAME=Business Loan Management
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Method 2: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## ⚙️ Configuration Details

### vercel.json Configuration

The `vercel.json` file includes:

- **Framework Detection:** Automatically detects Vite
- **Build Configuration:** Uses `npm run build`
- **Output Directory:** `dist` (Vite default)
- **SPA Routing:** All routes redirect to `index.html`
- **API Proxy:** Routes `/api/*` to your backend
- **Security Headers:** XSS protection, content type options
- **Caching:** Optimized caching for static assets
- **CORS:** Configured for API requests

### Environment Variables

Required environment variables for production:

```env
# API Configuration
VITE_API_URL=https://your-backend-domain.vercel.app

# Application
VITE_APP_ENVIRONMENT=production
VITE_APP_NAME=Business Loan Management

# Supabase (if using)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 🔗 Backend Integration

### Update API Base URL

Make sure your API configuration points to the production backend:

1. **In Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Set `VITE_API_URL` to your backend URL

2. **Backend CORS:**
   Ensure your backend allows requests from your Vercel domain:
   ```typescript
   // In your backend CORS configuration
   origin: [
     'http://localhost:3000',
     'https://your-frontend-domain.vercel.app'
   ]
   ```

## 📊 Performance Optimization

The deployment includes:

- **Asset Caching:** 1 year cache for static assets
- **Gzip Compression:** Automatic compression
- **CDN Distribution:** Global edge network
- **Tree Shaking:** Unused code elimination
- **Code Splitting:** Optimized bundle sizes

## 🔒 Security Features

- **Security Headers:** XSS protection, frame options
- **HTTPS:** Automatic SSL certificates
- **Content Security:** Referrer policy configuration
- **CORS:** Proper cross-origin configuration

## 🌍 Custom Domain (Optional)

1. **Add Domain in Vercel:**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. **Update Environment Variables:**
   - Update `VITE_API_URL` if needed
   - Update backend CORS settings

## 🐛 Troubleshooting

### Common Issues:

1. **Build Failures:**
   ```bash
   # Check build locally
   npm run build
   npm run preview
   ```

2. **API Connection Issues:**
   - Verify `VITE_API_URL` environment variable
   - Check backend CORS configuration
   - Ensure backend is deployed and accessible

3. **Routing Issues:**
   - Verify `vercel.json` routes configuration
   - Check that all routes redirect to `index.html`

4. **Environment Variables:**
   - Must start with `VITE_` prefix
   - Set in Vercel Dashboard → Project Settings → Environment Variables
   - Redeploy after changing environment variables

### Debug Commands:

```bash
# Check build output
npm run build

# Preview production build locally
npm run preview

# Check environment variables
vercel env ls

# View deployment logs
vercel logs
```

## 📱 Mobile Optimization

The deployment includes:

- **Responsive Design:** Works on all devices
- **PWA Ready:** Service worker configuration
- **Fast Loading:** Optimized bundle sizes
- **Touch Friendly:** Mobile-optimized interactions

## 🚀 Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Environment variables configured
- [ ] Backend deployed and accessible
- [ ] CORS configured on backend
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate active
- [ ] Performance tested
- [ ] Mobile responsiveness verified

## 📞 Support

If you encounter issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review deployment logs in Vercel Dashboard
3. Test build locally with `npm run build && npm run preview`
4. Verify environment variables are set correctly

---

**🎉 Your Business Loan Management System is now ready for production on Vercel!**
