import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { DocumentIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface Enquiry {
  id: number;
  name: string;
  mobile: string;
  businessType?: string;
}

interface Document {
  id: number;
  type: string;
  fileName: string;
  verified: boolean;
  uploadedAt: string;
  enquiry: Enquiry;
}

function DocumentUpload() {
  const [selectedEnquiry, setSelectedEnquiry] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  // Fetch enquiries
  const { data: enquiries, isLoading: enquiriesLoading } = useQuery('enquiries', async () => {
    const response = await api.get('/api/supabase/enquiries');
    return response.data;
  });

  // Fetch documents
  const { data: documents, isLoading: documentsLoading } = useQuery('documents', async () => {
    const response = await api.get('/api/supabase/documents');
    return response.data;
  });

  // Upload mutation
  const uploadMutation = useMutation(
    async (formData: FormData) => {
      const response = await api.post('/api/supabase/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Document uploaded successfully!');
        queryClient.invalidateQueries('documents');
        setFile(null);
        setSelectedEnquiry('');
        setSelectedType('');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Upload failed');
      },
    }
  );

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !selectedEnquiry || !selectedType) {
      toast.error('Please select all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('enquiryId', selectedEnquiry);
    formData.append('type', selectedType);

    uploadMutation.mutate(formData);
  };

  const documentTypes = [
    'GST_CERTIFICATE',
    'UDYAM_REGISTRATION',
    'BANK_STATEMENT',
    'OWNER_PAN_CARD',
    'AADHAR_CARD',
    'BUSINESS_PROOF',
    'FINANCIAL_STATEMENT',
    'OTHER'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Upload</h1>
          <p className="mt-2 text-gray-600">Upload and manage client documents</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload New Document</h2>
            
            <form onSubmit={handleFileUpload} className="space-y-6">
              {/* Enquiry Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client
                </label>
                <select
                  value={selectedEnquiry}
                  onChange={(e) => setSelectedEnquiry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a client...</option>
                  {enquiries?.map((enquiry: Enquiry) => (
                    <option key={enquiry.id} value={enquiry.id}>
                      {enquiry.name} - {enquiry.mobile}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select document type...</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={uploadMutation.isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadMutation.isLoading ? 'Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>

          {/* Documents List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Documents</h2>
            
            {documentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading documents...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents?.slice(0, 10).map((doc: Document) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.enquiry?.name}</p>
                        <p className="text-sm text-gray-600">{doc.type.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.verified ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`text-sm ${doc.verified ? 'text-green-600' : 'text-red-600'}`}>
                        {doc.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentUpload;
