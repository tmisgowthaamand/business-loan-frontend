import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
  DocumentCheckIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  UserPlusIcon,
  ClockIcon,
  UserIcon,
  FunnelIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useDocumentsData, useEnquiriesData, useStaffData } from '../../hooks/useDataPersistence';
import api from '../../config/api';

interface Document {
  id: number;
  type: string;
  fileName: string;
  filePath: string;
  verified: boolean;
  uploadedAt: string;
  enquiryId: number;
  enquiry: {
    id: number;
    name: string;
    mobile: string;
    businessType?: string;
    businessName?: string;
  };
}

interface Enquiry {
  id: number;
  name: string;
  mobile: string;
  businessType: string;
  businessName: string;
  loanAmount: number;
  assignedStaff?: string;
  status: string;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
}

const DOCUMENT_TYPES = [
  { value: 'GST', label: 'GST Certificate', required: true },
  { value: 'UDYAM', label: 'Udyam Registration', required: true },
  { value: 'BANK_STATEMENT', label: 'Bank Statement', required: true },
  { value: 'OWNER_PAN', label: 'Owner PAN Card', required: true },
  { value: 'AADHAR', label: 'Aadhar Card', required: true },
  { value: 'BUSINESS_PAN', label: 'Business PAN Card', required: false },
  { value: 'PARTNERSHIP_DEED', label: 'Partnership Deed', required: false },
  { value: 'MOA', label: 'Memorandum of Association', required: false },
  { value: 'RENT_AGREEMENT', label: 'Rent Agreement', required: false },
  { value: 'ELECTRICITY_BILL', label: 'Electricity Bill', required: false },
];

const EnhancedDocumentVerification: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State for filters and selections
  const [selectedEnquiry, setSelectedEnquiry] = useState<number | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<{ [key: number]: string }>({});
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [showOnlyUnverified, setShowOnlyUnverified] = useState(false);

  // Use data persistence hooks
  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = useDocumentsData();
  const { data: enquiries, isLoading: enquiriesLoading } = useEnquiriesData();
  const { data: staff, isLoading: staffLoading } = useStaffData();

  // Filter documents based on selections
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    
    let filtered = documents;

    // Filter by selected enquiry
    if (selectedEnquiry) {
      filtered = filtered.filter((doc: Document) => doc.enquiryId === selectedEnquiry);
    }

    // Filter by document type
    if (selectedDocumentType) {
      filtered = filtered.filter((doc: Document) => doc.type === selectedDocumentType);
    }

    // Filter by verification status
    if (showOnlyUnverified) {
      filtered = filtered.filter((doc: Document) => !doc.verified);
    }

    return filtered;
  }, [documents, selectedEnquiry, selectedDocumentType, showOnlyUnverified]);

  // Group documents by enquiry
  const documentsByEnquiry = useMemo(() => {
    if (!filteredDocuments) return {};
    
    return filteredDocuments.reduce((acc: any, doc: Document) => {
      const enquiryId = doc.enquiryId;
      if (!acc[enquiryId]) {
        acc[enquiryId] = {
          enquiry: doc.enquiry,
          documents: []
        };
      }
      acc[enquiryId].documents.push(doc);
      return acc;
    }, {});
  }, [filteredDocuments]);

  // Verify document mutation
  const verifyDocumentMutation = useMutation(
    async ({ documentId, verified }: { documentId: number; verified: boolean }) => {
      const response = await api.patch(`/api/documents/${documentId}/verify`, { verified });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Document verification updated successfully!');
        refetchDocuments();
        queryClient.invalidateQueries('documents');
        queryClient.invalidateQueries('dashboard-data');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update verification');
      },
    }
  );

  // Staff assignment mutation
  const assignStaffMutation = useMutation(
    async ({ enquiryId, staffName }: { enquiryId: number; staffName: string }) => {
      const response = await api.patch(`/api/enquiries/${enquiryId}`, {
        assignedStaff: staffName
      });
      return response.data;
    },
    {
      onSuccess: (_, { staffName }) => {
        toast.success(`Staff assigned to ${staffName} successfully!`);
        queryClient.invalidateQueries('enquiries');
      },
      onError: (error: any) => {
        toast.error('Failed to assign staff member');
      },
    }
  );

  // Add to shortlist mutation
  const addToShortlistMutation = useMutation(
    async ({ enquiryId }: { enquiryId: number }) => {
      const response = await api.post('/api/shortlist', { enquiryId });
      return response.data;
    },
    {
      onSuccess: (response) => {
        const clientName = response.shortlist?.name || response.name || 'Client';
        toast.success(`🎉 ${clientName} added to shortlist successfully!`);
        queryClient.invalidateQueries('shortlists');
        queryClient.invalidateQueries('dashboard-data');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add to shortlist');
      },
    }
  );

  const handleVerifyDocument = (documentId: number, verified: boolean) => {
    verifyDocumentMutation.mutate({ documentId, verified });
  };

  const handleStaffAssignment = (enquiryId: number, staffName: string) => {
    setSelectedStaff(prev => ({ ...prev, [enquiryId]: staffName }));
    assignStaffMutation.mutate({ enquiryId, staffName });
  };

  const handleAddToShortlist = (enquiryId: number) => {
    const enquiryGroup = documentsByEnquiry[enquiryId];
    if (!enquiryGroup) return;

    // Check if staff is assigned
    const assignedStaff = selectedStaff[enquiryId] || enquiryGroup.enquiry.assignedStaff;
    if (!assignedStaff) {
      toast.error('Please assign a staff member before adding to shortlist');
      return;
    }

    // Check if all required documents are verified
    const requiredTypes = DOCUMENT_TYPES.filter(type => type.required).map(type => type.value);
    const enquiryDocs = enquiryGroup.documents;
    const verifiedTypes = enquiryDocs.filter((doc: Document) => doc.verified).map((doc: Document) => doc.type);
    const missingTypes = requiredTypes.filter(type => !verifiedTypes.includes(type));

    if (missingTypes.length > 0) {
      const missingLabels = missingTypes.map(type => 
        DOCUMENT_TYPES.find(dt => dt.value === type)?.label || type
      ).join(', ');
      toast.error(`Missing verified documents: ${missingLabels}`);
      return;
    }

    addToShortlistMutation.mutate({ enquiryId });
  };

  const handleViewDocument = (document: Document) => {
    setViewingDocument(document);
  };

  const getDocumentProgress = (enquiryId: number) => {
    const enquiryGroup = documentsByEnquiry[enquiryId];
    if (!enquiryGroup) return { verified: 0, total: 0, percentage: 0 };

    const verified = enquiryGroup.documents.filter((doc: Document) => doc.verified).length;
    const total = enquiryGroup.documents.length;
    const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;

    return { verified, total, percentage };
  };

  if (documentsLoading || enquiriesLoading || staffLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
          <p className="text-gray-600">Verify uploaded documents and manage enquiry assignments</p>
        </div>
        <button
          onClick={() => refetchDocuments()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Enquiry Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Enquiry
            </label>
            <select
              value={selectedEnquiry || ''}
              onChange={(e) => setSelectedEnquiry(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Enquiries</option>
              {enquiries?.map((enquiry: Enquiry) => (
                <option key={enquiry.id} value={enquiry.id}>
                  {enquiry.name} - {enquiry.businessType}
                </option>
              ))}
            </select>
          </div>

          {/* Document Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Types</option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} {type.required && '*'}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="unverified-only"
                checked={showOnlyUnverified}
                onChange={(e) => setShowOnlyUnverified(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="unverified-only" className="ml-2 text-sm text-gray-700">
                Show only unverified
              </label>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary
            </label>
            <div className="text-sm text-gray-600">
              <p>{filteredDocuments?.length || 0} documents</p>
              <p>{Object.keys(documentsByEnquiry).length} enquiries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents by Enquiry */}
      <div className="space-y-6">
        {Object.entries(documentsByEnquiry).map(([enquiryId, group]: [string, any]) => {
          const progress = getDocumentProgress(Number(enquiryId));
          const assignedStaff = selectedStaff[Number(enquiryId)] || group.enquiry.assignedStaff;
          
          return (
            <motion.div
              key={enquiryId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {/* Enquiry Header */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{group.enquiry.name}</h3>
                    <p className="text-sm text-gray-600">
                      {group.enquiry.businessType} • {group.enquiry.mobile}
                    </p>
                    <p className="text-sm text-gray-500">
                      Business: {group.enquiry.businessName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            progress.percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {progress.verified}/{progress.total} ({progress.percentage}%)
                      </span>
                    </div>
                    
                    {/* Staff Assignment */}
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <select
                        value={assignedStaff || ''}
                        onChange={(e) => handleStaffAssignment(Number(enquiryId), e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="">Assign Staff</option>
                        {staff?.map((member: Staff) => (
                          <option key={member.id} value={member.name}>
                            {member.name} - {member.role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.documents.map((document: Document) => (
                    <div
                      key={document.id}
                      className={`border rounded-lg p-4 ${
                        document.verified ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {DOCUMENT_TYPES.find(type => type.value === document.type)?.label || document.type}
                          </h4>
                          <p className="text-sm text-gray-600">{document.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(document.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {document.verified ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <ClockIcon className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDocument(document)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View PDF
                        </button>
                        
                        {!document.verified ? (
                          <button
                            onClick={() => handleVerifyDocument(document.id, true)}
                            disabled={verifyDocumentMutation.isLoading}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Verify
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyDocument(document.id, false)}
                            disabled={verifyDocumentMutation.isLoading}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Unverify
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add to Shortlist Button */}
                {progress.percentage === 100 && (
                  <div className="mt-6 pt-4 border-t">
                    <button
                      onClick={() => handleAddToShortlist(Number(enquiryId))}
                      disabled={addToShortlistMutation.isLoading || !assignedStaff}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                    >
                      <UserPlusIcon className="h-4 w-4 mr-2" />
                      {addToShortlistMutation.isLoading ? 'Adding to Shortlist...' : 'Add to Shortlist'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* PDF Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">
                {DOCUMENT_TYPES.find(type => type.value === viewingDocument.type)?.label || viewingDocument.type}
              </h3>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 h-96">
              <iframe
                src={`http://localhost:5002/api/documents/${viewingDocument.id}/view`}
                className="w-full h-full border rounded"
                title="Document Preview"
              />
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Client: {viewingDocument.enquiry.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(viewingDocument.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!viewingDocument.verified ? (
                    <button
                      onClick={() => {
                        handleVerifyDocument(viewingDocument.id, true);
                        setViewingDocument(null);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Verify Document
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleVerifyDocument(viewingDocument.id, false);
                        setViewingDocument(null);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Unverify Document
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {Object.keys(documentsByEnquiry).length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedEnquiry || selectedDocumentType || showOnlyUnverified
              ? 'Try adjusting your filters to see more documents.'
              : 'No documents have been uploaded yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedDocumentVerification;
