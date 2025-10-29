import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface TransactionFormData {
  name: string;
  date: string;
  time: string;
  transactionId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

function TransactionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>();

  // Fetch transaction data for editing
  const { data: transaction } = useQuery(
    ['transaction', id],
    async () => {
      if (!id) return null;
      const response = await api.get(`/api/transactions/${id}`);
      return response.data;
    },
    { enabled: isEdit }
  );

  // Create/Update mutation
  const mutation = useMutation(
    async (data: TransactionFormData) => {
      console.log('Submitting transaction form data:', data);
      
      if (isEdit) {
        const response = await api.patch(`/api/transactions/${id}`, data);
        console.log('PATCH response:', response.data);
        return response;
      } else {
        const response = await api.post('/api/transactions', data);
        console.log('POST response:', response.data);
        return response;
      }
    },
    {
      onSuccess: async (response) => {
        toast.success(isEdit ? 'Transaction updated successfully!' : 'Transaction created successfully!');
        console.log('Transaction update/create successful:', response.data);
        
        // Comprehensive cache invalidation to ensure immediate reflection
        queryClient.clear(); // Clear all caches
        queryClient.invalidateQueries(['transactions']);
        queryClient.invalidateQueries(['transaction']);
        
        // Force immediate refetch of transaction data
        await queryClient.refetchQueries(['transactions']);
        
        // Small delay to ensure backend has processed the update
        setTimeout(() => {
          // Navigate back to transactions page with state to force refresh
          navigate('/transactions', { 
            state: { 
              fromAdd: !isEdit, 
              fromEdit: isEdit,
              transactionName: response.data.transaction?.name || response.data.name,
              timestamp: Date.now() 
            } 
          });
        }, 100);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Something went wrong');
      },
    }
  );

  // Reset form with transaction data when editing
  useEffect(() => {
    if (transaction) {
      const transactionDate = transaction.date ? new Date(transaction.date) : new Date();
      reset({
        name: transaction.name,
        date: transactionDate.toISOString().split('T')[0],
        time: transactionDate.toTimeString().split(' ')[0].substring(0, 5), // HH:MM format
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        status: transaction.status,
      });
    }
  }, [transaction, reset]);

  const onSubmit = (data: TransactionFormData) => {
    // Combine date and time into a single datetime
    const combinedDateTime = `${data.date}T${data.time}:00.000Z`;
    const submissionData = {
      ...data,
      date: combinedDateTime
    };
    mutation.mutate(submissionData);
  };

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
              onClick={() => navigate('/transactions')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Transactions
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Transaction' : 'New Transaction'}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Update transaction information' : 'Create a new transaction record'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-8">
          {/* Transaction Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="transaction-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  id="transaction-name"
                  type="text"
                  autoComplete="name"
                  className="input-field"
                  placeholder="Enter transaction name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="transaction-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  {...register('date', { required: 'Date is required' })}
                  id="transaction-date"
                  type="date"
                  autoComplete="off"
                  className="input-field"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="transaction-time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  {...register('time', { required: 'Time is required' })}
                  id="transaction-time"
                  type="time"
                  autoComplete="off"
                  className="input-field"
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="transaction-id" className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID *
                </label>
                <input
                  {...register('transactionId', { required: 'Transaction ID is required' })}
                  id="transaction-id"
                  type="text"
                  autoComplete="off"
                  className="input-field"
                  placeholder="Enter transaction ID"
                />
                {errors.transactionId && (
                  <p className="mt-1 text-sm text-red-600">{errors.transactionId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="transaction-amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  {...register('amount', { 
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' }
                  })}
                  id="transaction-amount"
                  type="number"
                  step="0.01"
                  autoComplete="off"
                  className="input-field"
                  placeholder="Enter amount"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  {...register('status', { required: 'Status is required' })}
                  className="input-field"
                >
                  <option value="">Select status</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={mutation.isLoading}
              className="btn-primary disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {mutation.isLoading
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                ? 'Update Transaction'
                : 'Create Transaction'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default TransactionForm;
