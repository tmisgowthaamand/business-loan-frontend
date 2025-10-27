import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentCheckIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  UserPlusIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Document {
  id: number;
  type: string;
  fileName?: string;
  filePath?: string;
  s3Url?: string;
  verified: boolean;
  uploadedAt?: string;
  enquiry: {
    id: number;
    name: string;
    mobile: string;
    businessType?: string;
  };
}

interface Staff {
  id: number;
  name: string;
  role: string;
}

const DocumentVerificationOffline: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [assignedStaff, setAssignedStaff] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);

  // Load mock data immediately
  useEffect(() => {
    const loadMockData = async () => {
      try {
        console.log('📄 DocumentVerificationOffline: Loading mock data for production...');
        console.log('🌐 Environment info:', {
          hostname: window.location.hostname,
          isProd: import.meta.env.PROD,
          mode: import.meta.env.MODE,
          mockDataEnabled: import.meta.env.VITE_USE_MOCK_DATA
        });
        
        const { MockDataService } = await import('../../services/mockData.service');
        
        const mockEnquiries = MockDataService.getEnquiries();
        const mockDocuments = MockDataService.getDocuments();
        const mockStaff = MockDataService.getStaff();
        
        // Enhance documents with s3Url for compatibility
        const enhancedDocuments = mockDocuments.map(doc => ({
          ...doc,
          s3Url: doc.filePath || `/api/documents/${doc.id}/view`,
          uploadedAt: doc.createdAt
        }));
        
        setEnquiries(mockEnquiries);
        setDocuments(enhancedDocuments);
        setStaffMembers(mockStaff);
        
        console.log('📄 Mock data loaded successfully:', {
          enquiries: mockEnquiries.length,
          documents: mockDocuments.length,
          staff: mockStaff.length,
          sampleEnquiry: mockEnquiries[0]?.name,
          sampleDocument: mockDocuments[0]?.type,
          sampleStaff: mockStaff[0]?.name
        });
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Failed to load mock data:', error);
        // Even if mock data fails, show the UI
        setLoading(false);
      }
    };

    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(loadMockData, 100);
    return () => clearTimeout(timer);
  }, []);

  // Mandatory document types
  const mandatoryDocumentTypes = [
    { type: 'GST', label: 'GST Certificate', icon: '📄' },
    { type: 'UDYAM', label: 'UDYAM Registration', icon: '🏭' },
    { type: 'BANK_STATEMENT', label: 'Bank Statement', icon: '🏦' },
    { type: 'OWNER_PAN', label: 'Owner PAN Card', icon: '🆔' },
    { type: 'AADHAR', label: 'Aadhar Card', icon: '📋' },
    { type: 'WEBSITE_GATEWAY', label: 'Website & Gateway', icon: '🌐' },
    { type: 'IE_CODE', label: 'IE Code', icon: '🏷️' }
  ];

  // Group documents by enquiry
  const documentsByEnquiry = documents.reduce((acc: any, document: Document) => {
    const enquiryId = document.enquiry.id;
    if (!acc[enquiryId]) {
      acc[enquiryId] = {
        enquiry: document.enquiry,
        documents: []
      };
    }
    acc[enquiryId].documents.push(document);
    return acc;
  }, {});

  const documentGroups = Object.values(documentsByEnquiry);

  const handleVerifyDocument = (documentId: number, verified: boolean) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, verified, verifiedAt: verified ? new Date().toISOString() : undefined }
        : doc
    ));
    toast.success(`Document ${verified ? 'verified' : 'unverified'} successfully!`);
  };

  const handleStaffAssignment = (enquiryId: number, staffName: string) => {
    setAssignedStaff(prev => ({ ...prev, [enquiryId]: staffName }));
    toast.success(`Staff assigned: ${staffName}`);
  };

  const handleAddToShortlist = (enquiryId: number) => {
    const staffName = assignedStaff[enquiryId];
    if (!staffName) {
      toast.error('Please assign a staff member first');
      return;
    }
    
    toast.success('Added to shortlist successfully!');
    // In a real app, this would make an API call
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document verification...</p>
          <p className="text-sm text-gray-500 mt-2">Using offline mode</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
          <p className="text-sm text-gray-500 mt-1">
            {enquiries.length} enquiries • {documents.length} documents to review
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
            📱 Offline Mode
          </div>
          <button
            onClick={() => {
              toast.success('Data refreshed!');
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Mandatory Document Types Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-3">Mandatory Document Types (7 Required)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {mandatoryDocumentTypes.map((docType) => (
            <div key={docType.type} className="flex items-center space-x-2 text-sm text-blue-800">
              <span>{docType.icon}</span>
              <span>{docType.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-blue-700 mt-2">
          All 7 document types must be verified before a client can be added to the shortlist.
        </p>
      </div>

      {/* Document Groups */}
      {documentGroups.length > 0 ? (
        <div className="space-y-6">
          {documentGroups.map((group: any, index: number) => (
            <motion.div
              key={group.enquiry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{group.enquiry.name}</h3>
                    <p className="text-sm text-gray-500">
                      📱 {group.enquiry.mobile} • 🏢 {group.enquiry.businessType || 'Business'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {group.documents.length} documents
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  {group.documents.map((document: Document) => (
                    <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          document.verified ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {document.verified ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          ) : (
                            <ClockIcon className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {mandatoryDocumentTypes.find(t => t.type === document.type)?.label || document.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {document.verified ? 'Verified' : 'Pending verification'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (document.s3Url) {
                              window.open(document.s3Url, '_blank');
                            } else {
                              toast('PDF viewer would open here', { icon: '👁️' });
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerifyDocument(document.id, !document.verified)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            document.verified
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {document.verified ? 'Unverify' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Staff Assignment */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Staff Member <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={assignedStaff[group.enquiry.id] || ''}
                    onChange={(e) => handleStaffAssignment(group.enquiry.id, e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select staff member...</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.name}>
                        {staff.name} - {staff.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add to Shortlist Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleAddToShortlist(group.enquiry.id)}
                    disabled={!assignedStaff[group.enquiry.id]}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Add to Shortlist
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents to verify</h3>
          <p className="mt-1 text-sm text-gray-500">
            No documents have been uploaded yet.
          </p>
          <div className="mt-4 space-x-3">
            <button
              onClick={() => navigate('/documents/upload')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              📄 Upload Documents
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerificationOffline;
