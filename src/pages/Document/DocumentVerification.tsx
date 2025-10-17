import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
import api from '../../lib/api';

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
    businessType?: string;
    shortlist?: {
      id: number;
      createdAt: string;
    };
  };
  uploadedBy: {
    name: string;
  };
}

const DocumentVerification: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [assignedStaff, setAssignedStaff] = useState<{ [key: number]: string }>({});

  // Fetch all documents that need verification
  const { data: documents, isLoading } = useQuery(
    'documents-verification',
    async () => {
      const response = await api.get('/api/documents');
      return response.data;
    },
    {
      // Use global settings - documents need to persist well
      staleTime: 3 * 60 * 1000, // 3 minutes
      keepPreviousData: true, // Prevent blank pages during refresh
    }
  );

  // Fetch staff members for assignment
  const { data: staffMembers } = useQuery(
    'staff-members',
    async () => {
      try {
        const response = await api.get('/api/staff');
        return response.data?.staff || [];
      } catch (error) {
        console.log('No staff data available');
        return [];
      }
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  // Verify document mutation
  const verifyDocumentMutation = useMutation(
    async ({ documentId, verified, enquiryId }: { documentId: number; verified: boolean; enquiryId?: number }) => {
      const response = await api.patch(`/api/documents/${documentId}/verify`, { verified });
      return { ...response, enquiryId };
    },
    {
      onSuccess: async (response) => {
        toast.success('Document verification updated successfully!');
        queryClient.invalidateQueries('documents-verification');
        
        // Check if all documents for this enquiry are now verified
        if (response.enquiryId) {
          const updatedDocuments = await queryClient.fetchQuery('documents-verification', async () => {
            const res = await api.get('/api/documents');
            return res.data;
          });
          
          // Group documents by enquiry
          const documentsByEnquiry = updatedDocuments.reduce((acc: any, doc: Document) => {
            const enquiryId = doc.enquiry.id;
            if (!acc[enquiryId]) {
              acc[enquiryId] = { enquiry: doc.enquiry, documents: [] };
            }
            acc[enquiryId].documents.push(doc);
            return acc;
          }, {});
          
          const enquiryGroup = documentsByEnquiry[response.enquiryId];
          if (enquiryGroup) {
            const allVerified = enquiryGroup.documents.every((doc: Document) => doc.verified);
            const hasShortlist = enquiryGroup.documents.some((doc: Document) => doc.enquiry.shortlist);
            
            // Auto-add to shortlist if all documents are verified and not already in shortlist
            if (allVerified && !hasShortlist) {
              try {
                await api.post('/api/shortlist', { enquiryId: response.enquiryId });
                toast.success(`🎉 All documents verified! ${enquiryGroup.enquiry.name} automatically added to shortlist!`);
                queryClient.invalidateQueries('documents-verification');
                queryClient.invalidateQueries(['shortlists']);
              } catch (error) {
                console.error('Failed to auto-add to shortlist:', error);
              }
            }
          }
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update verification');
      },
    }
  );

  // Add to shortlist mutation
  const addToShortlistMutation = useMutation(
    async ({ enquiryId, enquiryData }: { enquiryId: number; enquiryData: any }) => {
      return api.post('/api/shortlist', {
        enquiryId: enquiryId,
        name: enquiryData.name,
        mobile: enquiryData.mobile,
        businessName: enquiryData.businessName || enquiryData.name,
        businessNature: enquiryData.businessType,
        loanAmount: enquiryData.loanAmount || 500000,
        comments: 'Added from document verification - all documents verified'
      });
    },
    {
      onSuccess: (response) => {
        const clientName = response.data?.name || 'Client';
        toast.success(`${clientName} added to shortlist successfully!`);
        // Invalidate shortlist cache before navigating
        queryClient.invalidateQueries(['shortlists']);
        queryClient.invalidateQueries('documents-verification');
        
        // Navigate to shortlist page after a short delay
        setTimeout(() => {
          navigate('/shortlist');
        }, 1000);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add to shortlist');
      },
    }
  );

  // Staff assignment mutation
  const assignStaffMutation = useMutation(
    async ({ enquiryId, staffName }: { enquiryId: number; staffName: string }) => {
      return api.patch(`/api/supabase/enquiries/${enquiryId}`, {
        assignedStaff: staffName
      });
    },
    {
      onSuccess: (_, { staffName }) => {
        toast.success(`Staff assigned to ${staffName} successfully!`);
        queryClient.invalidateQueries('documents-verification');
      },
      onError: (error: any) => {
        console.error('Assignment error:', error);
        toast.error('Failed to assign staff member');
      },
    }
  );

  const handleVerifyDocument = (documentId: number, verified: boolean, enquiryId: number) => {
    verifyDocumentMutation.mutate({ documentId, verified, enquiryId });
  };

  const handleAddToShortlist = (enquiryId: number) => {
    // Check if staff is assigned
    const staffAssigned = assignedStaff[enquiryId];
    if (!staffAssigned) {
      toast.error('Please assign a staff member before adding to shortlist');
      return;
    }

    // Check if all documents for this enquiry are verified
    const enquiryDocuments = documents?.filter((doc: Document) => doc.enquiry.id === enquiryId);
    const allVerified = enquiryDocuments?.every((doc: Document) => doc.verified);

    if (!allVerified) {
      toast.error('All documents must be verified before adding to shortlist');
      return;
    }

    // Check if all mandatory document types are present
    const missingTypes = getMissingDocumentTypes(enquiryDocuments || []);
    if (missingTypes.length > 0) {
      const missingTypeNames = missingTypes.map(type => type.label).join(', ');
      toast.error(`Missing mandatory document types: ${missingTypeNames}. Please upload all required documents.`);
      return;
    }

    // Get enquiry data from the first document (they all have the same enquiry info)
    const enquiryData = enquiryDocuments?.[0]?.enquiry;
    if (!enquiryData) {
      toast.error('Enquiry data not found');
      return;
    }

    addToShortlistMutation.mutate({ enquiryId, enquiryData });
  };

  const handleStaffAssignment = (enquiryId: number, staffName: string) => {
    if (staffName) {
      setAssignedStaff(prev => ({ ...prev, [enquiryId]: staffName }));
      assignStaffMutation.mutate({ enquiryId, staffName });
    }
  };

  const getDocumentTypeIcon = () => {
    return <DocumentCheckIcon className="h-5 w-5" />;
  };

  const getVerificationStatus = (verified: boolean) => {
    if (verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <ClockIcon className="h-4 w-4 mr-1" />
        Pending
      </span>
    );
  };

  // Define mandatory document types
  const mandatoryDocumentTypes = [
    { type: 'GST', label: 'GST Certificate', icon: '📄' },
    { type: 'UDYAM', label: 'UDYAM Registration', icon: '🏭' },
    { type: 'BANK_STATEMENT', label: 'Bank Statement', icon: '🏦' },
    { type: 'OWNER_PAN', label: 'Owner PAN Card', icon: '🆔' },
    { type: 'AADHAR', label: 'Aadhar Card', icon: '📋' },
    { type: 'WEBSITE_GATEWAY', label: 'Website & Gateway', icon: '🌐' },
    { type: 'IE_CODE', label: 'IE Code', icon: '🏷️' }
  ];

  // Function to get missing document types for an enquiry
  const getMissingDocumentTypes = (documents: Document[]) => {
    const uploadedTypes = documents.map(doc => doc.type);
    return mandatoryDocumentTypes.filter(mandatoryType => 
      !uploadedTypes.includes(mandatoryType.type)
    );
  };

  // Group documents by enquiry
  const documentsByEnquiry = documents?.reduce((acc: any, doc: Document) => {
    const enquiryId = doc.enquiry.id;
    if (!acc[enquiryId]) {
      acc[enquiryId] = {
        enquiry: doc.enquiry,
        documents: []
      };
    }
    acc[enquiryId].documents.push(doc);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Document Verification</h1>
        <div className="text-sm text-gray-500">
          {documents?.length || 0} documents to review
        </div>
      </div>

      {/* Mandatory Document Types Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <DocumentCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Mandatory Document Types for Verification
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
              <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                📄 GST Certificate
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                🏭 UDYAM Registration
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                🏦 Bank Statement
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                🆔 Owner PAN Card
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                📋 Aadhar Card
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-800 font-medium">
                🌐 Website & Gateway
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-800 font-medium">
                🏷️ IE Code
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              <span className="font-semibold">Note:</span> All 7 document types must be verified before a client can be added to the shortlist. 
              <span className="text-red-700 font-semibold">Website & Gateway and IE Code are now mandatory requirements</span> along with the standard documents.
            </p>
          </div>
        </div>
      </div>

      {documentsByEnquiry && Object.keys(documentsByEnquiry).length > 0 ? (
        <div className="space-y-6">
          {Object.values(documentsByEnquiry).map((group: any) => {
            const allVerified = group.documents.every((doc: Document) => doc.verified);
            const hasShortlist = group.documents.some((doc: Document) => doc.enquiry.shortlist);
            const missingMandatoryTypes = getMissingDocumentTypes(group.documents);
            const hasAllMandatoryTypes = missingMandatoryTypes.length === 0;
            
            return (
              <motion.div
                key={group.enquiry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md border border-gray-200"
              >
                {/* Client Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {group.enquiry.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📱 {group.enquiry.mobile} • {group.enquiry.businessType || 'Business Type Not Specified'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {allVerified && hasAllMandatoryTypes && !hasShortlist && (
                        <button
                          onClick={() => handleAddToShortlist(group.enquiry.id)}
                          disabled={addToShortlistMutation.isLoading}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <UserPlusIcon className="h-4 w-4 mr-2" />
                          Add to Shortlist
                        </button>
                      )}
                      {allVerified && !hasAllMandatoryTypes && !hasShortlist && (
                        <button
                          disabled
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-400 cursor-not-allowed"
                          title="Missing mandatory document types"
                        >
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          Missing Documents
                        </button>
                      )}
                      {hasShortlist && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          ✅ In Shortlist
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Staff Assignment Section */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assign Staff Member <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={assignedStaff[group.enquiry.id] || ''}
                          onChange={(e) => handleStaffAssignment(group.enquiry.id, e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          disabled={assignStaffMutation.isLoading}
                          required
                        >
                          <option value="">Select staff member...</option>
                          {staffMembers && staffMembers.map((staff: any) => (
                            <option key={staff.id} value={staff.name}>
                              {staff.name} - {staff.role}
                            </option>
                          ))}
                        </select>
                        {!assignedStaff[group.enquiry.id] && (
                          <p className="mt-1 text-sm text-red-600">
                            Staff assignment is required before adding to shortlist
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.documents.map((document: Document) => (
                      <div
                        key={document.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            {getDocumentTypeIcon()}
                            <div className="ml-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {document.type.replace(/_/g, ' ')}
                                </h4>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Required
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Document Type: <span className="font-semibold text-gray-700">{document.type}</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getVerificationStatus(document.verified)}
                        </div>

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => window.open(document.s3Url, '_blank')}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            View
                          </button>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleVerifyDocument(document.id, true, document.enquiry.id)}
                              disabled={verifyDocumentMutation.isLoading}
                              className={`p-1 rounded ${
                                document.verified
                                  ? 'text-green-600 bg-green-100'
                                  : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                              } transition-colors`}
                              title="Approve"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleVerifyDocument(document.id, false, document.enquiry.id)}
                              disabled={verifyDocumentMutation.isLoading}
                              className={`p-1 rounded ${
                                !document.verified
                                  ? 'text-red-600 bg-red-100'
                                  : 'text-gray-400 hover:text-red-600 hover:bg-red-100'
                              } transition-colors`}
                              title="Reject"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Missing Document Types Alert */}
                  {(() => {
                    const missingTypes = getMissingDocumentTypes(group.documents);
                    return missingTypes.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start">
                          <XCircleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                          <div>
                            <h4 className="text-sm font-medium text-red-900 mb-2">
                              Missing Mandatory Document Types
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {missingTypes.map((missingType) => (
                                <span
                                  key={missingType.type}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800"
                                >
                                  {missingType.icon} {missingType.label}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-red-700 mt-2">
                              <span className="font-semibold">Action Required:</span> These document types must be uploaded before the client can be added to shortlist.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Verification Summary */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        Verification Progress: {group.documents.filter((d: Document) => d.verified).length} / {group.documents.length} documents verified
                      </span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(group.documents.filter((d: Document) => d.verified).length / group.documents.length) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Document Types: {group.documents.length} / {mandatoryDocumentTypes.length} mandatory types uploaded
                      </span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(group.documents.length / mandatoryDocumentTypes.length) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents to verify</h3>
          <p className="mt-1 text-sm text-gray-500">
            All documents have been processed or no documents have been uploaded yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;
