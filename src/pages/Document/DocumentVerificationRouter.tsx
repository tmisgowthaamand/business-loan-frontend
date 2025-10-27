import React from 'react';
import DocumentVerificationOffline from './DocumentVerificationOffline';
import DocumentVerificationSmart from './DocumentVerificationSmart';
import DocumentVerificationSimple from './DocumentVerificationSimple';

const DocumentVerificationRouter: React.FC = () => {
  // Check if we're in production or Vercel deployment
  const isProduction = import.meta.env.PROD;
  const isVercelDeployment = typeof window !== 'undefined' && 
    (window.location.hostname.includes('vercel.app') || 
     window.location.hostname.includes('.netlify.app') ||
     window.location.hostname.includes('render.com'));
  
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  
  // Log environment detection
  console.log('📄 DocumentVerificationRouter - Environment Detection:', {
    isProduction,
    isVercelDeployment,
    useMockData,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
    env: import.meta.env.MODE
  });

  // Use simple version for guaranteed compatibility in production
  if (isProduction || isVercelDeployment || useMockData) {
    console.log('🔄 Using simple document verification for production deployment');
    return <DocumentVerificationSimple />;
  }

  // Use smart component for development
  console.log('🔄 Using smart document verification for development');
  return <DocumentVerificationSmart />;
};

export default DocumentVerificationRouter;
