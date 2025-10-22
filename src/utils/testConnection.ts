// API Connection Test Utility
import { getBackendURL } from '../lib/config';

export const testApiConnection = async () => {
  const backendUrl = getBackendURL();
  
  console.log('🔗 Testing API connection...');
  console.log('📍 Backend URL:', backendUrl);
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${backendUrl}/health`);
    const healthData = await healthResponse.json();
    
    console.log('✅ Health check successful:', healthData);
    
    // Test enquiries endpoint
    const enquiriesResponse = await fetch(`${backendUrl}/api/enquiries`);
    const enquiriesData = await enquiriesResponse.json();
    
    console.log('✅ Enquiries endpoint successful:', enquiriesData?.length || 0, 'enquiries');
    
    // Test notifications endpoint
    const notificationsResponse = await fetch(`${backendUrl}/api/notifications`);
    const notificationsData = await notificationsResponse.json();
    
    console.log('✅ Notifications endpoint successful:', notificationsData?.notifications?.length || 0, 'notifications');
    
    return {
      success: true,
      backendUrl,
      health: healthData,
      enquiriesCount: enquiriesData?.length || 0,
      notificationsCount: notificationsData?.notifications?.length || 0,
    };
    
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return {
      success: false,
      backendUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  console.log('🧪 Running API connection test...');
  testApiConnection().then(result => {
    if (result.success) {
      console.log('🎉 API connection test passed!');
    } else {
      console.log('💥 API connection test failed!');
    }
  });
}
