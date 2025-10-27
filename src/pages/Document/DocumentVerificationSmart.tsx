import React, { useState, useEffect } from 'react';
import DocumentVerification from './DocumentVerification';
import DocumentVerificationOffline from './DocumentVerificationOffline';

const DocumentVerificationSmart: React.FC = () => {
  const [useOfflineMode, setUseOfflineMode] = useState(false);
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      // In production with mock data enabled, use offline mode immediately
      if (import.meta.env.PROD && import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        console.log('🔄 Production mode with mock data - using offline version');
        setUseOfflineMode(true);
        setHasCheckedConnection(true);
        return;
      }

      // For development, try a quick connection test
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        const response = await fetch('/api/health', {
          signal: controller.signal,
          method: 'GET',
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log('✅ Backend connection successful - using online version');
          setUseOfflineMode(false);
        } else {
          console.log('⚠️ Backend responded with error - using offline version');
          setUseOfflineMode(true);
        }
      } catch (error) {
        console.log('❌ Backend connection failed - using offline version');
        setUseOfflineMode(true);
      }

      setHasCheckedConnection(true);
    };

    checkConnection();
  }, []);

  // Show loading while checking connection
  if (!hasCheckedConnection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing document verification...</p>
          <p className="text-sm text-gray-500 mt-2">Checking connection status</p>
        </div>
      </div>
    );
  }

  // Return appropriate component based on connection status
  if (useOfflineMode) {
    return <DocumentVerificationOffline />;
  } else {
    return <DocumentVerification />;
  }
};

export default DocumentVerificationSmart;
