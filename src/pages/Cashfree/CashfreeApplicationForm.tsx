import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import the configured API instance
import api from '../../lib/api';

interface CashfreeApplicationData {
  shortlistId: number;
  loanAmount: number;
  tenure: number;
  interestRate: number;
  processingFee: number;
  purpose: string;
  collateral: string;
  guarantor: string;
  bankAccount: string;
  ifscCode: string;
  panCard: string;
  aadharCard: string;
  salarySlips: boolean;
  itrReturns: boolean;
  businessProof: boolean;
  addressProof: boolean;
  remarks: string;
}

function CashfreeApplicationForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // shortlist ID
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CashfreeApplicationData>();

  // Fetch shortlist data
  const { data: shortlist, isLoading } = useQuery(
    ['shortlist', id],
    async () => {
      const response = await api.get(`/api/shortlist/${id}`);
      console.log('Fetched shortlist data for payment gateway form:', response.data);
      return response.data;
    },
    { 
      enabled: !!id,
      staleTime: 0, // Always fetch fresh data
      cacheTime: 0, // Don't cache
    }
  );

  // Submit application mutation
  const applicationMutation = useMutation(
    async (data: CashfreeApplicationData) => {
      console.log('Submitting payment gateway application with data:', data);
      return api.post('/api/cashfree/apply', {
        ...data,
        shortlistId: parseInt(id!),
        status: 'PENDING',
        appliedAt: new Date()
      });
    },
    {
      onSuccess: async (response) => {
        toast.success('Payment gateway application submitted successfully!');
        
        // Mark the shortlist as having a payment gateway application
        try {
          await api.post(`/api/shortlist/${id}/payment-gateway-applied`, response.data.application);
        } catch (error) {
          console.log('Failed to mark shortlist as having payment gateway application:', error);
        }
        
        // Add optimistic update to payment gateway applications cache
        if (response.data.application) {
          queryClient.setQueryData(['cashfree-applications'], (oldData: any) => {
            if (!oldData) return [response.data.application];
            return [response.data.application, ...oldData];
          });
        }
        
        // Invalidate and refetch all related data
        queryClient.invalidateQueries(['cashfree-applications']);
        queryClient.invalidateQueries(['shortlists']);
        queryClient.invalidateQueries(['shortlist']);
        
        // Navigate to payment gateway page to show the submitted application
        navigate('/payment-gateway', { 
          state: { 
            message: 'Payment gateway application submitted successfully!',
            type: 'success' 
          } 
        });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Application submission failed');
      },
    }
  );

  // Pre-fill form with shortlist data
  useEffect(() => {
    if (shortlist) {
      console.log('Pre-filling payment gateway form with shortlist data:', shortlist);
      console.log('Loan amount from shortlist:', shortlist.loanAmount);
      
      reset({
        loanAmount: shortlist.loanAmount || 0,
        tenure: 12,
        interestRate: 12.5,
        processingFee: 2.5,
        purpose: 'Business Expansion',
        bankAccount: shortlist.bankAccount || '',
        panCard: shortlist.businessPan || '',
        salarySlips: false,
        itrReturns: true,
        businessProof: true,
        addressProof: true,
      });
    }
  }, [shortlist, reset]);

  const onSubmit = (data: CashfreeApplicationData) => {
    applicationMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => navigate('/shortlist')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Shortlist
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Gateway Loan Application</h1>
              <p className="text-gray-600">
                Apply for loan through payment gateway for: <span className="font-semibold">{shortlist?.enquiry?.name}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-8">
          {/* Loan Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (₹) *
                </label>
                <input
                  {...register('loanAmount', { required: 'Loan amount is required', min: 50000 })}
                  type="number"
                  className="input-field"
                  placeholder="Enter loan amount"
                />
                {errors.loanAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.loanAmount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenure (Months) *
                </label>
                <select {...register('tenure', { required: 'Tenure is required' })} className="input-field">
                  <option value="">Select tenure</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                </select>
                {errors.tenure && (
                  <p className="mt-1 text-sm text-red-600">{errors.tenure.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (%)
                </label>
                <input
                  {...register('interestRate', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="12.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Fee (%)
                </label>
                <input
                  {...register('processingFee', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose *
                </label>
                <select {...register('purpose', { required: 'Purpose is required' })} className="input-field">
                  <option value="">Select purpose</option>
                  <option value="Business Expansion">Business Expansion</option>
                  <option value="Working Capital">Working Capital</option>
                  <option value="Equipment Purchase">Equipment Purchase</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Other">Other</option>
                </select>
                {errors.purpose && (
                  <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collateral
                </label>
                <input
                  {...register('collateral')}
                  type="text"
                  className="input-field"
                  placeholder="Property, Gold, etc."
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account Number *
                </label>
                <input
                  {...register('bankAccount', { required: 'Bank account is required' })}
                  type="text"
                  className="input-field"
                  placeholder="Enter bank account number"
                />
                {errors.bankAccount && (
                  <p className="mt-1 text-sm text-red-600">{errors.bankAccount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code *
                </label>
                <input
                  {...register('ifscCode', { required: 'IFSC code is required' })}
                  type="text"
                  className="input-field"
                  placeholder="Enter IFSC code"
                />
                {errors.ifscCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.ifscCode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Document Verification */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Document Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  {...register('salarySlips')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Salary Slips (Last 3 months)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('itrReturns')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  ITR Returns (Last 2 years)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('businessProof')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Business Registration Proof
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('addressProof')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Address Proof
                </label>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              {...register('remarks')}
              rows={4}
              className="input-field"
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/shortlist')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={applicationMutation.isLoading}
              className="btn-primary disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {applicationMutation.isLoading ? 'Submitting...' : 'Submit Application'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default CashfreeApplicationForm;
