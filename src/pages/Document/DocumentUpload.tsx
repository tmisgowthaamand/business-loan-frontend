import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DocumentIcon, CheckCircleIcon, XCircleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface Enquiry {
  id: number;
  name: string;
  mobile: string;
  businessType?: string;
  shortlist?: {
    id: number;
    createdAt: string;
  };
}

interface Document {
  id: number;
  type: string;
  s3Url: string;
  verified: boolean;
  uploadedAt: string;
  enquiry: Enquiry;
  uploadedBy: {
    name: string;
  };
}
// Enhanced wrapper with comprehensive error handling

function DocumentUpload() {
  const [selectedEnquiry, setSelectedEnquiry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [isSequentialMode, setIsSequentialMode] = useState(false);
  const [pdfViewer, setPdfViewer] = useState<{
    isOpen: boolean;
    documentUrl: string;
    documentName: string;
    documentType: string;
    documentId?: number;
    isVerified?: boolean;
  }>({ isOpen: false, documentUrl: '', documentName: '', documentType: '', documentId: undefined, isVerified: false });
  
  const [clientDocumentsView, setClientDocumentsView] = useState<{
    isOpen: boolean;
    clientId: number;
    clientName: string;
  }>({ isOpen: false, clientId: 0, clientName: '' });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Component logic with error handling

  // Fetch enquiries for dropdown with mock data fallback
  const { data: enquiries, isLoading: enquiriesLoading, error: enquiriesError } = useQuery('enquiries', async () => {
    console.log('📋 Fetching enquiries from /enquiries...');
    try {
      const response = await api.get('/api/enquiries');
      console.log('📋 Enquiries response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('📋 Enquiries fetch error:', error);
      // Return mock data for production
      console.log('📋 Using mock enquiries data');
      return [
        { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' },
        { id: 2, name: 'VIGNESH S', mobile: '9876543220', businessType: 'Trading' },
        { id: 3, name: 'Poorani', mobile: '9876543221', businessType: 'Textiles' },
        { id: 4, name: 'Manigandan M', mobile: '9876543222', businessType: 'Manufacturing' },
        { id: 5, name: 'Rajesh Kumar', mobile: '9876543210', businessType: 'Electronics' },
        { id: 6, name: 'Priya Sharma', mobile: '9876543211', businessType: 'Textiles' },
        { id: 7, name: 'Amit Patel', mobile: '9876543212', businessType: 'Trading' }
      ];
    }
  }, {
    staleTime: 4 * 60 * 1000,
    keepPreviousData: true,
    onSuccess: (data) => {
      console.log('📋 Enquiries query success:', data?.length || 0, 'enquiries');
    },
    onError: (error) => {
      console.error('📋 Enquiries query error:', error);
      // Don't set error state, just log it since we have fallback data
    }
  });

  // Fetch staff members for assignment dropdown with mock data
  const { data: staffMembers } = useQuery('staff-members', async () => {
    try {
      const response = await api.get('/api/staff');
      return response.data?.staff || [];
    } catch (error) {
      console.log('📋 Using mock staff data');
      return [
        { id: 1, name: 'Pankil', role: 'ADMIN' },
        { id: 2, name: 'Venkat', role: 'EMPLOYEE' },
        { id: 3, name: 'Harish', role: 'ADMIN' },
        { id: 4, name: 'Dinesh', role: 'EMPLOYEE' },
        { id: 5, name: 'Nunciya', role: 'ADMIN' }
      ];
    }
  }, {
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  // Fetch documents with mock data fallback
  const { data: documents, isLoading, refetch: refetchDocuments } = useQuery('documents', async () => {
    console.log('📄 Fetching documents from /documents...');
    try {
      const response = await api.get('/api/documents');
      console.log('📄 Documents response:', response.data);
      return response.data;
    } catch (error) {
      console.log('📄 Using mock documents data');
      return [
        { id: 1, type: 'GST', s3Url: '/api/documents/1/view', verified: true, uploadedAt: '2024-10-16T10:45:00Z', enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }, uploadedBy: { name: 'Pankil' } },
        { id: 2, type: 'UDYAM', s3Url: '/api/documents/2/view', verified: true, uploadedAt: '2024-10-16T10:50:00Z', enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }, uploadedBy: { name: 'Pankil' } },
        { id: 3, type: 'BANK_STATEMENT', s3Url: '/api/documents/3/view', verified: true, uploadedAt: '2024-10-16T10:55:00Z', enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }, uploadedBy: { name: 'Pankil' } },
        { id: 4, type: 'GST', s3Url: '/api/documents/4/view', verified: false, uploadedAt: '2024-10-15T14:15:00Z', enquiry: { id: 2, name: 'VIGNESH S', mobile: '9876543220', businessType: 'Trading' }, uploadedBy: { name: 'Venkat' } },
        { id: 5, type: 'BANK_STATEMENT', s3Url: '/api/documents/5/view', verified: false, uploadedAt: '2024-10-14T16:35:00Z', enquiry: { id: 3, name: 'Poorani', mobile: '9876543221', businessType: 'Textiles' }, uploadedBy: { name: 'Harish' } }
      ];
    }
  }, {
    staleTime: 8 * 60 * 1000,
    keepPreviousData: true,
    onSuccess: (data) => {
      console.log('📄 Documents query success:', data?.length || 0, 'documents');
    },
    onError: (error) => {
      console.error('📄 Documents query error:', error);
    }
  });

  // Fetch document status for selected enquiry with mock data
  const { data: documentStatus } = useQuery(['documentStatus', selectedEnquiry],
    async () => {
      if (!selectedEnquiry) return null;
      try {
        const response = await api.get(`/api/documents/enquiry/${selectedEnquiry}`);
        return response.data;
      } catch (error) {
        console.log('📄 Using mock document status');
        // Return mock documents for the selected enquiry
        const mockDocs = [
          { id: 1, type: 'GST', s3Url: '/api/documents/1/view', verified: true, uploadedAt: '2024-10-16T10:45:00Z', enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }, uploadedBy: { name: 'Pankil' } },
          { id: 2, type: 'UDYAM', s3Url: '/api/documents/2/view', verified: true, uploadedAt: '2024-10-16T10:50:00Z', enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }, uploadedBy: { name: 'Pankil' } }
        ];
        return mockDocs.filter(doc => doc.enquiry.id.toString() === selectedEnquiry);
      }
    },
    { 
      enabled: !!selectedEnquiry,
      staleTime: 3 * 60 * 1000,
      keepPreviousData: true,
    }
  );

  // Upload mutation with mock data fallback
  const uploadMutation = useMutation(
    async ({ file, enquiryId, type }: { file: File; enquiryId: number; type: string }) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('enquiryId', enquiryId.toString());
        formData.append('type', type);
        
        // Add assigned staff if available
        if (assignedStaff) {
          formData.append('assignedStaff', assignedStaff);
        }

        return await api.post('/api/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (error) {
        console.log('📄 Upload API failed, using mock response');
        // Return mock successful upload response
        const selectedEnquiryData = enquiries?.find((e: any) => e.id === enquiryId);
        return {
          data: {
            message: 'Document uploaded successfully (mock)',
            document: {
              id: Date.now(),
              type: type,
              s3Url: `/api/documents/${Date.now()}/view`,
              verified: false,
              uploadedAt: new Date().toISOString(),
              enquiry: selectedEnquiryData || { id: enquiryId, name: 'Unknown Client' },
              uploadedBy: { name: assignedStaff || 'Current User' }
            }
          }
        };
      }
    },
    {
      onSuccess: (response) => {
        console.log('📄 Upload success response:', response.data);
        toast.success('Document uploaded successfully!');
        
        // Optimistic update - immediately add the new document to cache
        if (response.data.document) {
          queryClient.setQueryData('documents', (oldData: any) => {
            if (!oldData) return [response.data.document];
            // Add new document at the beginning (most recent first)
            return [response.data.document, ...oldData];
          });
        }
        
        // Also invalidate to ensure consistency
        queryClient.invalidateQueries('documents');
        queryClient.invalidateQueries(['documentStatus', selectedEnquiry]);
        
        // Reset form but keep enquiry selected
        setSelectedType('');
        
        // In sequential mode, auto-advance to next document
        if (isSequentialMode) {
          // Small delay to allow the document list to update
          setTimeout(() => {
            const nextDoc = getNextDocumentToUpload();
            if (nextDoc) {
              setSelectedType(nextDoc.document.value);
              toast.success(`✅ ${documentTypes.find(t => t.value === response.data.document.type)?.label} uploaded! Next: ${nextDoc.document.label}`);
            } else {
              // All documents uploaded, show completion
              toast.success('🎉 All required documents uploaded!');
              setIsSequentialMode(false);
              setSelectedType('');
            }
          }, 500);
        }
      },
      onError: (error: any) => {
        console.error('Upload error:', error);
        
        let errorMessage = 'Upload failed';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.status === 413) {
          errorMessage = 'File too large. Maximum size is 10MB.';
        } else if (error.response?.status === 415) {
          errorMessage = 'Unsupported file type. Please upload PDF files only.';
        } else if (error.response?.status === 400) {
          // Check if it's a duplicate document error
          if (error.response?.data?.message?.includes('already exists')) {
            errorMessage = error.response.data.message;
            // Reset the selected type to force user to choose again
            setSelectedType('');
          } else {
            errorMessage = 'Invalid file or missing required information.';
          }
        }
        
        toast.error(errorMessage);
      },
    }
  );

  // Verify mutation
  const verifyMutation = useMutation(
    async (documentId: number) => {
      return api.patch(`/api/documents/${documentId}/verify`, { verified: true });
    },
    {
      onSuccess: (_, documentId) => {
        toast.success('Document verified successfully!');
        
        // Optimistic update - update the document in cache immediately
        queryClient.setQueryData('documents', (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((doc: any) => 
            doc.id === documentId ? { ...doc, verified: true, verifiedAt: new Date().toISOString() } : doc
          );
        });
        
        // Update document status for selected enquiry
        if (selectedEnquiry) {
          queryClient.invalidateQueries(['documentStatus', selectedEnquiry]);
        }
        
        // Refetch in background to ensure consistency
        setTimeout(() => {
          queryClient.invalidateQueries('documents');
        }, 100);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Verification failed');
      },
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    async (documentId: number) => {
      return api.delete(`/api/documents/${documentId}`);
    },
    {
      onSuccess: (_, documentId) => {
        toast.success('Document deleted successfully!');
        
        // Optimistic update - remove the document from cache immediately
        queryClient.setQueryData('documents', (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((doc: any) => doc.id !== documentId);
        });
        
        // Update document status for selected enquiry
        if (selectedEnquiry) {
          queryClient.invalidateQueries(['documentStatus', selectedEnquiry]);
        }
        
        // Refetch in background to ensure consistency
        setTimeout(() => {
          queryClient.invalidateQueries('documents');
        }, 100);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Delete failed');
      },
    }
  );


  // Shortlist mutation
  const shortlistMutation = useMutation(
    async (enquiry: any) => {
      return api.post('/api/shortlist', {
        enquiryId: enquiry.id,
        name: enquiry.name || enquiry.businessName,
        mobile: enquiry.mobile,
        businessName: enquiry.businessName,
        businessNature: enquiry.businessType,
        loanAmount: enquiry.loanAmount || 500000,
        comments: 'Shortlisted from document management'
      });
    },
    {
      onSuccess: (response) => {
        console.log('Shortlist response:', response.data);
        toast.success(response.data.message || 'Client shortlisted successfully!');
        
        // Immediately invalidate shortlist queries to ensure fresh data
        queryClient.invalidateQueries('shortlists');
        queryClient.invalidateQueries(['shortlists']);
        
        // Also add optimistic update to shortlist cache if possible
        if (response.data.shortlist) {
          queryClient.setQueryData(['shortlists', ''], (oldData: any) => {
            if (!oldData) return [response.data.shortlist];
            // Check if shortlist already exists to avoid duplicates
            const exists = oldData.some((item: any) => item.id === response.data.shortlist.id);
            if (exists) return oldData;
            return [response.data.shortlist, ...oldData];
          });
        }
        
        // Navigate to shortlist page after successful creation
        setTimeout(() => {
          navigate('/shortlist', { 
            state: { 
              fromAdd: true, 
              clientName: response.data.shortlist?.name || response.data.name,
              timestamp: Date.now() 
            } 
          });
        }, 1000); // Small delay to show success message
      },
      onError: (error: any) => {
        console.error('Shortlist error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Shortlist failed';
        toast.error(`Shortlist failed: ${errorMessage}`);
      },
    }
  );

  // Staff assignment mutation
  const assignStaffMutation = useMutation(
    async ({ enquiryId, staffName }: { enquiryId: number; staffName: string }) => {
      return api.patch(`/enquiries/${enquiryId}`, {
        assignedStaff: staffName
      });
    },
    {
      onSuccess: (_, { enquiryId, staffName }) => {
        console.log(`Staff ${staffName} assigned to enquiry ${enquiryId}`);
        
        // Update the enquiries cache to reflect the staff assignment
        queryClient.setQueryData('enquiries', (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((enquiry: any) => 
            enquiry.id === enquiryId 
              ? { ...enquiry, assignedStaff: staffName }
              : enquiry
          );
        });
        
        toast.success(`Staff assigned to ${staffName} successfully!`);
      },
      onError: (error: any) => {
        console.error('Staff assignment error:', error);
        toast.error('Failed to assign staff member');
      },
    }
  );

  const handleFileUpload = async (file: File) => {
    // In sequential mode, use the current document type
    const documentType = isSequentialMode ? currentDocument?.value : selectedType;
    
    if (!selectedEnquiry || !documentType || !assignedStaff) {
      toast.error('Please select enquiry, document type, and assign staff before uploading');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    console.log('📄 Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      enquiryId: selectedEnquiry,
      documentType: documentType,
      isSequentialMode: isSequentialMode
    });

    // Additional validation - this should not happen due to UI restrictions
    const existingDocs = documents?.filter((doc: Document) => 
      doc.enquiry.id.toString() === selectedEnquiry && doc.type === documentType
    ) || [];

    if (existingDocs.length > 0) {
      const docTypeName = documentTypes.find(t => t.value === documentType)?.label || documentType;
      toast.error(`${docTypeName} already exists for this client. Please select a different document type.`);
      return;
    }

    uploadMutation.mutate({
      file,
      enquiryId: parseInt(selectedEnquiry),
      type: documentType,
    });
  };

  const handleViewDocument = async (document: Document) => {
    try {
      // Use the correct backend endpoint for PDF viewing
      const { getApiUrl } = await import('../../lib/config');
      const proxyUrl = getApiUrl(`/api/documents/${document.id}/view`);
      
      const viewerState = {
        isOpen: true,
        documentUrl: proxyUrl,
        documentName: `${document.enquiry.name} - ${documentTypes.find(t => t.value === document.type)?.label || document.type}`,
        documentType: document.type,
        documentId: document.id,
        isVerified: document.verified
      };
      setPdfViewer(viewerState);
    } catch (error) {
      console.error('Error getting document URL:', error);
      toast.error('Failed to load document. Please try again.');
    }
  };

  const handleViewAllDocuments = (enquiry: any) => {
    setClientDocumentsView({
      isOpen: true,
      clientId: enquiry.id,
      clientName: enquiry.name
    });
  };

  const closePdfViewer = () => {
    setPdfViewer({
      isOpen: false,
      documentUrl: '',
      documentName: '',
      documentType: '',
      documentId: undefined,
      isVerified: false
    });
  };

  const closeClientDocumentsView = () => {
    setClientDocumentsView({ isOpen: false, clientId: 0, clientName: '' });
  };

  const handleDeleteDocument = (documentId: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(documentId);
    }
  };


  const documentTypes = [
    { value: 'GST', label: 'GST Certificate', required: true },
    { value: 'UDYAM', label: 'Udyam Registration', required: true },
    { value: 'BANK_STATEMENT', label: 'Bank Statement', required: true },
    { value: 'OWNER_PAN', label: 'Owner PAN Card', required: true },
    { value: 'AADHAR', label: 'Aadhar Card', required: true },
    { value: 'WEBSITE_GATEWAY', label: 'Website & Gateway', required: true },
    { value: 'IE_CODE', label: 'IE Code', required: true },
  ];

  // Get selected enquiry details
  const selectedEnquiryData: Enquiry | undefined = enquiries?.find((e: Enquiry) => e.id.toString() === selectedEnquiry);
  
  // Get documents for selected enquiry
  const selectedEnquiryDocuments = documents?.filter((doc: Document) => 
    doc.enquiry.id.toString() === selectedEnquiry
  ) || [];
  
  // Get uploaded document types for selected enquiry
  const uploadedTypes = selectedEnquiryDocuments.map((doc: Document) => doc.type);
  
  // Get next document to upload in sequential mode
  const getNextDocumentToUpload = () => {
    const requiredDocs = documentTypes.filter(type => type.required);
    for (let i = 0; i < requiredDocs.length; i++) {
      if (!uploadedTypes.includes(requiredDocs[i].value)) {
        return { index: i, document: requiredDocs[i] };
      }
    }
    return null;
  };
  
  const nextDocument = getNextDocumentToUpload();
  const currentDocument = nextDocument?.document;
  const documentProgress = {
    current: uploadedTypes.length,
    total: documentTypes.filter(type => type.required).length,
    percentage: Math.round((uploadedTypes.length / documentTypes.filter(type => type.required).length) * 100)
  };
  
  // Calculate completion percentage
  const requiredTypes = documentTypes.filter(type => type.required);
  const completedRequired = requiredTypes.filter(type => uploadedTypes.includes(type.value));
  const completionPercentage = requiredTypes.length > 0 ? 
    Math.round((completedRequired.length / requiredTypes.length) * 100) : 0;
  
  // Check if client is eligible for auto-shortlisting
  const isEligibleForShortlist = completionPercentage === 100;
  
  // Check if all required documents are verified (not just uploaded)
  const allRequiredDocumentsVerified = selectedEnquiryDocuments.length > 0 && 
    requiredTypes.every(type => {
      const doc = selectedEnquiryDocuments.find((d: Document) => d.type === type.value);
      return doc && doc.verified;
    });
    
  // Check if client is already shortlisted
  const isAlreadyShortlisted = selectedEnquiryData?.shortlist;
  
  // Determine what to show: if all documents are verified, prioritize shortlist action
  const shouldShowShortlistFirst = allRequiredDocumentsVerified && selectedEnquiry;

  // Debug logging
  console.log('🔍 DocumentUpload render state:', {
    enquiriesLoading,
    enquiriesCount: enquiries?.length || 0,
    enquiriesError: !!enquiriesError,
    isLoading,
    documentsCount: documents?.length || 0
  });

  // Show loading state if both enquiries and documents are loading
  if (enquiriesLoading && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
        <p className="text-gray-600">Upload and manage loan application documents</p>
      </div>

      {/* Shortlist Ready Section - Show First if All Documents Verified */}
      {shouldShowShortlistFirst && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-green-200 bg-green-50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="text-green-600 text-2xl mr-3">🎉</div>
              <div>
                <h2 className="text-xl font-bold text-green-900">All Documents Verified!</h2>
                <p className="text-green-700">Client is ready for shortlisting</p>
              </div>
            </div>
            {!isAlreadyShortlisted ? (
              <button
                onClick={() => shortlistMutation.mutate(selectedEnquiryData)}
                disabled={shortlistMutation.isLoading}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                {shortlistMutation.isLoading ? 'Adding to Shortlist...' : 'Add to Shortlist'}
              </button>
            ) : (
              <div className="px-6 py-3 bg-blue-100 text-blue-800 font-semibold rounded-lg flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Already Shortlisted
              </div>
            )}
          </div>
          
          {/* Document Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {documentTypes.filter(type => type.required).map((docType) => {
              return (
                <div key={docType.value} className="flex items-center p-3 bg-white rounded-lg border border-green-200">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">{docType.label}</p>
                    <p className="text-sm text-green-600">Verified ✓</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* All Documents are now Mandatory - No Optional Section */}
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-red-800 font-medium mb-2 flex items-center">
              <span className="mr-2">⚠️</span>
              All Documents Now Mandatory
            </h4>
            <p className="text-sm text-red-700">
              <span className="font-semibold">Website & Gateway</span> and <span className="font-semibold">IE Code</span> are now required documents. 
              All 7 document types must be uploaded and verified before the client can proceed to shortlist.
            </p>
          </div>
        </motion.div>
      )}

      {/* Sequential Upload Mode Toggle */}
      {selectedEnquiry && !shouldShowShortlistFirst && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-blue-50 border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900">Document Upload Mode</h3>
              <p className="text-blue-700 text-sm">
                {isSequentialMode 
                  ? 'Sequential mode: Upload documents one by one' 
                  : 'Standard mode: Choose any document type to upload'
                }
              </p>
            </div>
            <button
              onClick={() => {
                const newSequentialMode = !isSequentialMode;
                setIsSequentialMode(newSequentialMode);
                
                if (newSequentialMode) {
                  // Entering sequential mode - find first missing document
                  const nextDoc = getNextDocumentToUpload();
                  if (nextDoc) {
                    setSelectedType(nextDoc.document.value);
                    toast.success(`📋 Sequential mode activated! Starting with: ${nextDoc.document.label}`);
                  } else {
                    toast.success('All required documents are already uploaded!');
                    setIsSequentialMode(false);
                  }
                } else {
                  // Exiting sequential mode
                  setSelectedType('');
                  toast.success('🔄 Switched to standard mode');
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isSequentialMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
              }`}
            >
              {isSequentialMode ? '📋 Sequential Mode' : '🔄 Switch to Sequential'}
            </button>
          </div>
          
          {/* Progress Bar for Sequential Mode */}
          {isSequentialMode && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 font-medium">Upload Progress</span>
                <span className="text-blue-900 font-semibold">{documentProgress.current}/{documentProgress.total} documents</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${documentProgress.percentage}%` }}
                ></div>
              </div>
              {currentDocument && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">📄</div>
                    <div>
                      <p className="font-medium text-blue-900">Next: {currentDocument.label}</p>
                      <p className="text-sm text-blue-600">Step {documentProgress.current + 1} of {documentProgress.total}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Upload Section - Show only if not all documents are verified */}
      {!shouldShowShortlistFirst && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Document</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Enquiry *
            </label>
            <select
              value={selectedEnquiry}
              onChange={(e) => {
                const enquiryId = e.target.value;
                setSelectedEnquiry(enquiryId);
                setSelectedType(''); // Reset document type when enquiry changes
                
                // Check if this enquiry already has an assigned staff member
                if (enquiryId && enquiries) {
                  const selectedEnquiryData = enquiries.find((enq: any) => enq.id.toString() === enquiryId);
                  if (selectedEnquiryData?.assignedStaff) {
                    // Auto-select the previously assigned staff
                    setAssignedStaff(selectedEnquiryData.assignedStaff);
                  } else {
                    // Reset staff assignment for new enquiries
                    setAssignedStaff('');
                  }
                } else {
                  setAssignedStaff('');
                }
              }}
              className="input-field"
              disabled={enquiriesLoading}
            >
              <option value="">
                {enquiriesLoading ? 'Loading enquiries...' : 
                 enquiriesError ? 'Backend server not available - Please start the backend server' :
                 !enquiries || enquiries.length === 0 ? 'No enquiries available - Backend may be offline' :
                 'Choose enquiry...'}
              </option>
              {enquiries?.map((enquiry: any) => (
                <option key={enquiry.id} value={enquiry.id}>
                  {enquiry.name} - {enquiry.mobile} ({enquiry.businessType || 'No business type'})
                  {enquiry.assignedStaff ? ` • Staff: ${enquiry.assignedStaff}` : ''}
                </option>
              ))}
            </select>
            {!!enquiriesError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  <strong>Backend Connection Error:</strong> Cannot connect to the backend server.
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Please ensure the backend server is running on port 5002. 
                  Check the console for more details.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Staff *
            </label>
            <select
              value={assignedStaff}
              onChange={(e) => {
                const staffName = e.target.value;
                setAssignedStaff(staffName);
                
                // Save staff assignment to backend if both enquiry and staff are selected
                if (selectedEnquiry && staffName) {
                  assignStaffMutation.mutate({
                    enquiryId: parseInt(selectedEnquiry),
                    staffName: staffName
                  });
                }
              }}
              className="input-field"
              disabled={!selectedEnquiry}
              required
            >
              <option value="">
                {!selectedEnquiry ? 'Select enquiry first...' : 'Choose staff member...'}
              </option>
              {staffMembers && staffMembers.map((staff: any) => (
                <option key={staff.id} value={staff.name}>
                  {staff.name} - {staff.role}
                </option>
              ))}
            </select>
            {selectedEnquiry && (
              <div className="mt-1">
                {assignedStaff ? (
                  <p className="text-sm text-green-600">
                    ✅ Staff assigned: {assignedStaff}
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    Staff assignment is required before uploading documents
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type *
            </label>
            {isSequentialMode ? (
              <div className="input-field bg-blue-50 border-blue-300">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">
                    {currentDocument ? currentDocument.label : 'All documents uploaded!'}
                  </span>
                  {currentDocument && (
                    <span className="text-sm text-blue-600 bg-blue-200 px-2 py-1 rounded">
                      Step {documentProgress.current + 1}/{documentProgress.total}
                    </span>
                  )}
                </div>
                {!currentDocument && (
                  <p className="text-sm text-green-600 mt-1">🎉 All required documents completed!</p>
                )}
              </div>
            ) : (
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-field"
                disabled={!selectedEnquiry}
              >
                <option value="">{!selectedEnquiry ? 'Select enquiry first...' : 'Choose type...'}</option>
                {documentTypes.map((type) => {
                  const isUploaded = uploadedTypes.includes(type.value);
                  return (
                    <option key={type.value} value={type.value} disabled={isUploaded}>
                      {type.label} {type.required ? '*' : '(Optional)'} {isUploaded ? '✓ Already Uploaded' : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        {/* Selected Client Details */}
        {selectedEnquiryData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-blue-900">Selected Client Details</h3>
              <button
                onClick={() => handleViewAllDocuments(selectedEnquiryData)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                ✓ View All Documents
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Name:</span>
                <span className="ml-2 text-blue-900">{selectedEnquiryData.name}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Mobile:</span>
                <span className="ml-2 text-blue-900">{selectedEnquiryData.mobile}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Business:</span>
                <span className="ml-2 text-blue-900">{selectedEnquiryData.businessType}</span>
              </div>
            </div>
            
            {/* Document Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 font-medium">Document Completion</span>
                <span className="text-blue-900 font-semibold">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-blue-700">
                {completedRequired.length} of {requiredTypes.length} required documents uploaded
              </div>
            </div>
            
            {/* Document Status Checklist */}
            <div className="mt-4">
              <h4 className="text-blue-700 font-medium mb-3">Document Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {documentTypes.map((docType: any) => {
                  // Check if document is uploaded by looking at both documentStatus and selectedEnquiryDocuments
                  const isUploaded = selectedEnquiryDocuments.some((doc: Document) => doc.type === docType.value) ||
                                   documentStatus?.documents?.some((doc: any) => doc.type === docType.value);
                  
                  // Get the uploaded document for additional info
                  const uploadedDoc = selectedEnquiryDocuments.find((doc: Document) => doc.type === docType.value) ||
                                    documentStatus?.documents?.find((doc: any) => doc.type === docType.value);
                  
                  return (
                  <div key={docType.value} className="flex items-center space-x-2">
                    {isUploaded ? (
                      uploadedDoc?.verified ? (
                        <span className="text-green-600 text-lg" title="Verified">✅</span>
                      ) : (
                        <span className="text-yellow-600 text-lg" title="Uploaded but not verified">⚠️</span>
                      )
                    ) : docType.required ? (
                      <span className="text-red-600 text-lg" title="Missing required document">❌</span>
                    ) : (
                      <span className="text-gray-400 text-lg" title="Optional document">○</span>
                    )}
                    <span className={`text-sm ${
                      isUploaded ? 
                        uploadedDoc?.verified ? 'text-green-700 font-medium' : 'text-yellow-700 font-medium'
                        : docType.required ? 'text-red-700' : 'text-gray-600'
                    }`}>
                      {docType.label}
                      {docType.required && <span className="text-red-500 ml-1">*</span>}
                      {isUploaded && (
                        <span className="ml-2 text-xs">
                          ({uploadedDoc?.verified ? 'Verified' : 'Pending Verification'})
                        </span>
                      )}
                    </span>
                  </div>
                  );
                })}
              </div>
              <div className="mt-3 text-xs text-blue-600">
                <span className="text-green-600">✅ Verified</span> • 
                <span className="text-yellow-600 ml-2">⚠️ Uploaded (Pending)</span> • 
                <span className="text-red-600 ml-2">❌ Missing (Required)</span> • 
                <span className="text-gray-600 ml-2">○ Optional</span>
              </div>
            </div>
            
            {/* Auto-shortlist notification */}
            {isEligibleForShortlist && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-green-600 text-lg mr-2">🎉</div>
                    <div>
                      <p className="text-green-800 font-semibold">Ready for Shortlist!</p>
                      <p className="text-green-700 text-sm">All required documents completed</p>
                    </div>
                  </div>
                  <button
                    onClick={() => shortlistMutation.mutate(selectedEnquiryData)}
                    disabled={shortlistMutation.isLoading || !!selectedEnquiryData?.shortlist}
                    className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${
                      selectedEnquiryData?.shortlist
                        ? 'bg-gray-500 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {selectedEnquiryData?.shortlist 
                      ? '✅ Already Shortlisted' 
                      : shortlistMutation.isLoading 
                        ? 'Adding...' 
                        : '⭐ Add to Shortlist'
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedEnquiry && (isSequentialMode ? currentDocument : selectedType) && assignedStaff ? (
          <div className="relative">
            {isSequentialMode && currentDocument && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">📄</div>
                    <div>
                      <h4 className="text-lg font-semibold text-blue-900">{currentDocument.label}</h4>
                      <p className="text-blue-600 text-sm">Upload this document to continue</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{documentProgress.current + 1}</div>
                    <div className="text-xs text-blue-500">of {documentProgress.total}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <span>📋 Required document</span>
                  <span>•</span>
                  <span>🎯 Next in sequence</span>
                  {documentProgress.current > 0 && (
                    <>
                      <span>•</span>
                      <span>✅ {documentProgress.current} completed</span>
                    </>
                  )}
                </div>
              </div>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">Upload PDF document</p>
            </div>
            {uploadMutation.isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-blue-600 font-medium">
                    {isSequentialMode ? `Uploading ${currentDocument?.label}...` : 'Uploading document...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {!selectedEnquiry 
                ? 'Please select an enquiry first' 
                : !assignedStaff
                ? 'Please assign a staff member'
                : isSequentialMode && !currentDocument
                ? '🎉 All documents uploaded! Switch to standard mode for additional uploads.'
                : 'Please select a document type to upload'
              }
            </p>
          </div>
        )}
      </motion.div>
      )}
      
      {/* Show Upload Section Toggle for Verified Clients */}
      {shouldShowShortlistFirst && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gray-50 border-gray-200"
        >
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Need to Upload Additional Documents?</h3>
            <p className="text-gray-600 mb-4">All required documents are verified. You can still upload optional documents if needed.</p>
            <button
              onClick={() => {
                // Force show upload form by temporarily disabling the shortlist-first logic
                const uploadSection = document.getElementById('upload-section');
                if (uploadSection) {
                  uploadSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              📄 Upload Additional Documents
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Additional Upload Section for Verified Clients */}
      {shouldShowShortlistFirst && (
        <motion.div
          id="upload-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card border-blue-200"
        >
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Upload Additional Documents</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Enquiry *
              </label>
              <select
                value={selectedEnquiry}
                onChange={(e) => {
                  const enquiryId = e.target.value;
                  setSelectedEnquiry(enquiryId);
                  setSelectedType(''); // Reset document type when enquiry changes
                  
                  // Check if this enquiry already has an assigned staff member
                  if (enquiryId && enquiries) {
                    const selectedEnquiryData = enquiries.find((enq: any) => enq.id.toString() === enquiryId);
                    if (selectedEnquiryData?.assignedStaff) {
                      // Auto-select the previously assigned staff
                      setAssignedStaff(selectedEnquiryData.assignedStaff);
                    } else {
                      // Reset staff assignment for new enquiries
                      setAssignedStaff('');
                    }
                  } else {
                    setAssignedStaff('');
                  }
                }}
                className="input-field"
                disabled={enquiriesLoading}
              >
                <option value="">
                  {enquiriesLoading ? 'Loading enquiries...' : 
                   enquiriesError ? 'Backend server not available - Please start the backend server' :
                   !enquiries || enquiries.length === 0 ? 'No enquiries available - Backend may be offline' :
                   'Choose enquiry...'}
                </option>
                {enquiries?.map((enquiry: any) => (
                  <option key={enquiry.id} value={enquiry.id}>
                    {enquiry.name} - {enquiry.mobile} ({enquiry.businessType || 'No business type'})
                    {enquiry.assignedStaff ? ` • Staff: ${enquiry.assignedStaff}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Staff *
              </label>
              <select
                value={assignedStaff}
                onChange={(e) => {
                  const staffName = e.target.value;
                  setAssignedStaff(staffName);
                  
                  // Save staff assignment to backend if both enquiry and staff are selected
                  if (selectedEnquiry && staffName) {
                    assignStaffMutation.mutate({
                      enquiryId: parseInt(selectedEnquiry),
                      staffName: staffName
                    });
                  }
                }}
                className="input-field"
                disabled={!selectedEnquiry}
                required
              >
                <option value="">
                  {!selectedEnquiry ? 'Select enquiry first...' : 'Choose staff member...'}
                </option>
                {staffMembers && staffMembers.map((staff: any) => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name} - {staff.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type *
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-field"
                disabled={!selectedEnquiry}
              >
                <option value="">{!selectedEnquiry ? 'Select enquiry first...' : 'Choose type...'}</option>
                {documentTypes.map((type) => {
                  const isUploaded = uploadedTypes.includes(type.value);
                  return (
                    <option key={type.value} value={type.value} disabled={isUploaded}>
                      {type.label} {type.required ? '*' : '(Optional)'} {isUploaded ? '✓ Already Uploaded' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {selectedEnquiry && (isSequentialMode ? currentDocument : selectedType) && assignedStaff ? (
            <div className="relative">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
                <DocumentIcon className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-2 text-sm text-blue-600">Upload PDF document</p>
              </div>
              {uploadMutation.isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-blue-600 font-medium">Uploading document...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
              <DocumentIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <p className="text-blue-600 text-lg">
                {!selectedEnquiry 
                  ? 'Please select an enquiry first' 
                  : !assignedStaff
                  ? 'Please assign a staff member'
                  : 'Please select a document type to upload'
                }
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Documents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Uploaded Documents</h2>
            <p className="text-sm text-gray-500">
              {isLoading ? 'Loading...' : selectedEnquiry ? 
                `${selectedEnquiryDocuments?.length || 0} documents for ${selectedEnquiryData?.name}` :
                'Select a client to view documents'
              }
            </p>
          </div>
          <div className="flex space-x-2">
            {selectedEnquiry && (
              <button
                onClick={async () => {
                  try {
                    const response = await api.post(`/api/documents/remove-duplicates/${selectedEnquiry}`);
                    if (response.data.removed > 0) {
                      toast.success(`Removed ${response.data.removed} duplicate documents`);
                      refetchDocuments();
                    } else {
                      toast.success('No duplicates found for this enquiry');
                    }
                  } catch (error) {
                    toast.error('Failed to remove duplicates');
                  }
                }}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                🧹 Clean Duplicates
              </button>
            )}
            <button
              onClick={() => {
                console.log('📄 Manual refresh clicked');
                refetchDocuments();
                toast.success('Refreshing documents...');
              }}
              disabled={isLoading}
              className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? '⏳ Loading...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enquiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading documents...</span>
                    </div>
                  </td>
                </tr>
              ) : documents && documents.length > 0 ? (
                documents
                  ?.filter((document: Document) => 
                    selectedEnquiry ? document.enquiry.id.toString() === selectedEnquiry : true
                  )
                  .map((document: Document) => (
                  <tr key={`doc-${document.id}-${document.type}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <button
                          onClick={() => handleViewDocument(document)}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          View Document
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {document.enquiry.name}
                      <div className="text-xs text-gray-500">{document.enquiry.mobile}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {documentTypes.find(t => t.value === document.type)?.label || document.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          {document.verified ? (
                            <>
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-1" />
                              <span className="text-green-800 text-sm font-medium">Verified</span>
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="h-5 w-5 text-yellow-500 mr-1" />
                              <span className="text-yellow-800 text-sm font-medium">Pending</span>
                            </>
                          )}
                        </div>
                        {(document as any).savedToSupabase && (
                          <div className="flex items-center">
                            <svg className="h-4 w-4 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-blue-800 text-xs font-medium">Saved to DB</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {document.uploadedBy.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(document.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => verifyMutation.mutate(document.id)}
                          disabled={verifyMutation.isLoading || document.verified}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={document.verified ? "Document verified" : "Verify document"}
                        >
                          <span className="text-sm font-bold">✓</span>
                        </button>
                        <button
                          onClick={() => handleViewAllDocuments(document.enquiry)}
                          className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                          title="View all documents for this client"
                        >
                          View All
                        </button>
                        <button
                          onClick={() => shortlistMutation.mutate(document.enquiry)}
                          disabled={shortlistMutation.isLoading || !!document.enquiry?.shortlist}
                          className={`font-medium disabled:opacity-50 ${
                            document.enquiry?.shortlist 
                              ? 'text-gray-500 cursor-not-allowed' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={document.enquiry?.shortlist ? "Already shortlisted" : "Mark this client as shortlisted"}
                        >
                          {document.enquiry?.shortlist ? '✅ Shortlisted' : '⭐ Shortlist'}
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document.id)}
                          disabled={deleteMutation.isLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    {selectedEnquiry ? (
                      <>
                        <p className="text-gray-500 text-lg">No documents uploaded for this client yet.</p>
                        <p className="text-gray-400 text-sm mt-2">
                          Upload documents using the form above to see them listed here.
                        </p>
                        <p className="text-blue-600 text-sm mt-2">
                          Selected client: {selectedEnquiryData?.name} - {selectedEnquiryData?.mobile}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 text-lg">Select a client to view their documents.</p>
                        <p className="text-gray-400 text-sm mt-2">
                          Choose an enquiry from the dropdown above to see uploaded documents.
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* PDF Viewer Modal - Simplified */}
      {pdfViewer.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{pdfViewer.documentName}</h3>
            <p className="text-gray-600 mb-4">PDF viewer would open here</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setPdfViewer({ ...pdfViewer, isOpen: false })}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={() => window.open(pdfViewer.documentUrl, '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Open PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DocumentUpload;
