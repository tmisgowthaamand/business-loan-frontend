import React from 'react';
import DocumentVerificationOffline from './DocumentVerificationOffline';
import DocumentVerificationSmart from './DocumentVerificationSmart';
import DocumentVerificationSimple from './DocumentVerificationSimple';

const DocumentVerificationRouter: React.FC = () => {
  // Always use simple version for guaranteed compatibility
  console.log('🔄 Using simple document verification for guaranteed compatibility');
  return <DocumentVerificationSimple />;
};

export default DocumentVerificationRouter;
