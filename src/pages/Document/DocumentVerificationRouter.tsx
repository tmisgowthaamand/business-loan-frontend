import React from 'react';
import DocumentVerificationDirect from './DocumentVerificationDirect';

const DocumentVerificationRouter: React.FC = () => {
  // Always use direct version for guaranteed compatibility
  console.log('🔄 Using direct document verification - guaranteed to work');
  return <DocumentVerificationDirect />;
};

export default DocumentVerificationRouter;
