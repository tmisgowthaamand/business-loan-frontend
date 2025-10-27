import React from 'react';
import DocumentVerificationOffline from './DocumentVerificationOffline';

const DocumentVerificationRouter: React.FC = () => {
  // Always use offline version - the original working model
  console.log('🔄 Using original document verification model');
  return <DocumentVerificationOffline />;
};

export default DocumentVerificationRouter;
