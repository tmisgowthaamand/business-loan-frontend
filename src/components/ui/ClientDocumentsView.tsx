import { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, DocumentIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import api from '../../lib/api.ts';
import PDFViewer from './PDFViewer';

interface Document {
  id: number;
  type: string;
  s3Url: string;
  verified: boolean;
  uploadedAt: string;
  enquiry: {
    id: number;
    name: string;
    mobile: string;
  };
  uploadedBy: {
    name: string;
  };
}

interface ClientDocumentsViewProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  clientName: string;
  documents?: Document[];
}

const documentTypes = [
  { value: 'GST', label: 'GST Certificate', required: true },
  { value: 'UDYAM', label: 'Udyam Registration', required: true },
  { value: 'BANK_STATEMENT', label: 'Bank Statement', required: true },
  { value: 'OWNER_PAN', label: 'Owner PAN Card', required: true },
  { value: 'AADHAR', label: 'Aadhar Card', required: true },
  { value: 'WEBSITE_GATEWAY', label: 'Website & Gateway', required: false },
  { value: 'IE_CODE', label: 'IE Code', required: false },
];

function ClientDocumentsView({ isOpen, onClose, clientId, clientName, documents: _ }: ClientDocumentsViewProps) {
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean;
    documentUrl: string;
    documentName: string;
    documentType: string;
  }>({ isOpen: false, documentUrl: '', documentName: '', documentType: '' });

  // Fetch documents for this specific enquiry
  const { data: documentData, isLoading, error } = useQuery(
    ['documents', clientId],
    async () => {
      if (!clientId) return null;
      console.log('📄 Fetching documents for client ID:', clientId);
      const response = await api.get(`/api/documents/enquiry/${clientId}`);
      console.log('📄 Documents response:', response.data);
      return response.data;
    },
    { 
      enabled: isOpen && !!clientId,
      refetchOnWindowFocus: false
    }
  );

  if (!isOpen) return null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-red-500 text-center mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Documents</h3>
          <p className="text-gray-600 mb-4">Failed to load documents for this client.</p>
          <button onClick={onClose} className="w-full btn-primary">Close</button>
        </div>
      </div>
    );
  }

  const clientDocuments = documentData || [];
  const enquiryDetails = clientDocuments.length > 0 ? clientDocuments[0].enquiry : { name: clientName, mobile: '', businessType: '' };
  
  // Create a map of uploaded document types
  const uploadedTypes = new Set(clientDocuments.map((doc: Document) => doc.type));
  
  // Calculate completion stats
  const requiredTypes = documentTypes.filter(type => type.required);
  const completedRequired = requiredTypes.filter(type => uploadedTypes.has(type.value));
  const completionPercentage = requiredTypes.length > 0 ? Math.round((completedRequired.length / requiredTypes.length) * 100) : 0;

  const handleViewDocument = (document: Document) => {
    setPdfViewer({
      isOpen: true,
      documentUrl: `http://localhost:5002/api/documents/${document.id}/view`,
      documentName: `${document.enquiry.name} - ${documentTypes.find(t => t.value === document.type)?.label || document.type}`,
      documentType: document.type
    });
  };

  const closePdfViewer = () => {
    setPdfViewer({ isOpen: false, documentUrl: '', documentName: '', documentType: '' });
  };

  const getDocumentStatus = (docType: string) => {
    const doc = clientDocuments.find((d: Document) => d.type === docType);
    if (doc) {
      return {
        status: 'uploaded',
        document: doc,
        verified: doc.verified
      };
    }
    const typeInfo = documentTypes.find(t => t.value === docType);
    return {
      status: typeInfo?.required ? 'missing' : 'optional',
      document: null,
      verified: false
    };
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{enquiryDetails.name}</h2>
              <p className="text-gray-600">📱 {enquiryDetails.mobile} • {enquiryDetails.businessType}</p>
              <p className="text-sm text-gray-500">Document Portfolio</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Completion Stats */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Document Completion Status</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">{completionPercentage}%</div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{completedRequired.length}/{requiredTypes.length}</div>
                <div className="text-gray-600">Required Documents</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{clientDocuments.filter((d: Document) => d.verified).length}</div>
                <div className="text-gray-600">Verified Documents</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{clientDocuments.length}</div>
                <div className="text-gray-600">Total Uploaded</div>
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentTypes.map((docType) => {
                const docStatus = getDocumentStatus(docType.value);
                
                return (
                  <motion.div
                    key={docType.value}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                      docStatus.status === 'uploaded' 
                        ? docStatus.verified 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-yellow-200 bg-yellow-50'
                        : docStatus.status === 'missing'
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {/* Document Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <DocumentIcon className={`h-6 w-6 mr-2 ${
                          docStatus.status === 'uploaded' 
                            ? docStatus.verified ? 'text-green-600' : 'text-yellow-600'
                            : docStatus.status === 'missing' ? 'text-red-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{docType.label}</h4>
                          <p className="text-xs text-gray-500">
                            {docType.required ? 'Required' : 'Optional'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Icon */}
                      <div className="flex items-center">
                        {docStatus.status === 'uploaded' ? (
                          docStatus.verified ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-yellow-600" />
                          )
                        ) : docStatus.status === 'missing' ? (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                        )}
                      </div>
                    </div>

                    {/* Document Details */}
                    {docStatus.document ? (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Status: </span>
                          <span className={`font-medium ${
                            docStatus.verified ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {docStatus.verified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Uploaded: </span>
                          {new Date(docStatus.document.uploadedAt).toLocaleDateString()}
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">By: </span>
                          {docStatus.document.uploadedBy.name}
                        </div>

                        {/* View Button */}
                        <button
                          onClick={() => handleViewDocument(docStatus.document!)}
                          className="w-full mt-3 flex items-center justify-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Document
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className={`text-sm font-medium ${
                          docStatus.status === 'missing' ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {docStatus.status === 'missing' ? 'Missing Document' : 'Not Required'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {docStatus.status === 'missing' 
                            ? 'This document needs to be uploaded' 
                            : 'This document is optional'
                          }
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* PDF Viewer Modal */}
      <PDFViewer
        isOpen={pdfViewer.isOpen}
        onClose={closePdfViewer}
        documentName={pdfViewer.documentName}
        documentType={pdfViewer.documentType}
        documentUrl={pdfViewer.documentUrl}
      />
    </>
  );
}

export default ClientDocumentsView;
