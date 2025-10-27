import React from 'react';
import DocumentVerificationSimple from './DocumentVerificationSimple';

const DocumentVerificationRouter: React.FC = () => {
  // Use simple version for better reliability
  console.log('🔄 Using simple document verification model');
  return <DocumentVerificationSimple />;
};

export default DocumentVerificationRouter;
