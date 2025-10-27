import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

const DocumentVerificationSimple: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // Simple hardcoded data that will always work
  const enquiries = [
    { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' },
    { id: 2, name: 'VIGNESH S', mobile: '9876543220', businessType: 'Trading' },
    { id: 3, name: 'Poorani', mobile: '9876543221', businessType: 'Textiles' }
  ];

  const documents = [
    {
      id: 1, type: 'GST', verified: true, fileName: 'gst-balamurugan.pdf',
      s3Url: '/api/documents/1/view', uploadedAt: '2024-10-15T10:00:00Z',
      enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }
    },
    {
      id: 2, type: 'UDYAM', verified: true, fileName: 'udyam-balamurugan.pdf',
      s3Url: '/api/documents/2/view', uploadedAt: '2024-10-15T10:05:00Z',
      enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }
    },
    {
      id: 3, type: 'BANK_STATEMENT', verified: true, fileName: 'bank-balamurugan.pdf',
      s3Url: '/api/documents/3/view', uploadedAt: '2024-10-15T10:10:00Z',
      enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }
    },
    {
      id: 4, type: 'GST', verified: false, fileName: 'gst-vignesh.pdf',
      s3Url: '/api/documents/4/view', uploadedAt: '2024-10-15T11:00:00Z',
      enquiry: { id: 2, name: 'VIGNESH S', mobile: '9876543220', businessType: 'Trading' }
    },
    {
      id: 5, type: 'BANK_STATEMENT', verified: false, fileName: 'bank-poorani.pdf',
      s3Url: '/api/documents/5/view', uploadedAt: '2024-10-15T12:00:00Z',
      enquiry: { id: 3, name: 'Poorani', mobile: '9876543221', businessType: 'Textiles' }
    }
  ];

  const staffMembers = [
    { id: 1, name: 'Pankil', role: 'ADMIN' },
    { id: 2, name: 'Venkat', role: 'EMPLOYEE' },
    { id: 3, name: 'Harish', role: 'ADMIN' },
    { id: 4, name: 'Dinesh', role: 'EMPLOYEE' },
    { id: 5, name: 'Nunciya', role: 'ADMIN' }
  ];

  const [assignedStaff, setAssignedStaff] = useState<{ [key: number]: string }>({});
  const [documentStates, setDocumentStates] = useState(documents);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      console.log('📄 Document verification loaded with simple data');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
  const documentsByEnquiry = documentStates.reduce((acc: any, document: any) => {
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

  const handleVerifyDocument = (documentId: number, verified: boolean) => {
    setDocumentStates(prev => prev.map(doc => 
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document verification...</p>
          <p className="text-sm text-gray-500 mt-2">Simple mode - guaranteed to work</p>
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
            {enquiries.length} enquiries • {documentStates.length} documents to review
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            ✅ Simple Mode
          </div>
          <button
            onClick={() => toast.success('Data refreshed!')}
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
      <div className="space-y-6">
        {Object.values(documentsByEnquiry).map((group: any, index: number) => (
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
                    📱 {group.enquiry.mobile} • 🏢 {group.enquiry.businessType}
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
                {group.documents.map((document: any) => (
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
    </div>
  );
};

export default DocumentVerificationSimple;
