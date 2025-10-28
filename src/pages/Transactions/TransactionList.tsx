import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TrashIcon, 
  EyeIcon, 
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import api from '../../lib/api';
import toast from 'react-hot-toast';

// Inline responsive hook for build compatibility
type Device = 'mobile' | 'tablet' | 'desktop';
const useResponsive = (): Device => {
  const [device, setDevice] = useState<Device>('desktop');
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setDevice('mobile');
      else if (width < 1024) setDevice('tablet');
      else setDevice('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return device;
};

function TransactionList() {
  const device = useResponsive();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    transaction: any;
  }>({ isOpen: false, transaction: null });
  const queryClient = useQueryClient();
  const location = useLocation();

  // Mutation for deleting transaction
  const deleteTransactionMutation = useMutation(
    async (id: number) => {
      console.log('🗑️ Executing DELETE request for transaction ID:', id);
      const response = await api.delete(`/api/transactions/${id}`);
      console.log('✅ DELETE response received:', response.data);
      return response;
    },
    {
      onSuccess: (response, deletedId) => {
        console.log('✅ Delete mutation successful:', response.data);
        toast.success('Transaction deleted successfully!');
        
        // Optimistic update - remove the item from cache immediately
        queryClient.setQueryData(['transactions', searchTerm], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((transaction: any) => transaction.id !== deletedId);
        });
        
        // Refetch in background to ensure consistency
        setTimeout(() => {
          queryClient.invalidateQueries(['transactions']);
        }, 100);
      },
      onError: (error: any) => {
        console.error('❌ Delete mutation failed:', error);
        toast.error(error.response?.data?.message || 'Failed to delete transaction');
      },
    }
  );

  const handleDeleteTransaction = (transactionId: number, transactionName: string) => {
    if (window.confirm(`Are you sure you want to delete the transaction "${transactionName}"? This action cannot be undone.`)) {
      console.log('🗑️ Attempting to delete transaction ID:', transactionId);
      deleteTransactionMutation.mutate(transactionId);
    }
  };

  const handleViewTransaction = (transaction: any) => {
    console.log('👁️ Viewing transaction:', transaction.name);
    setViewModal({
      isOpen: true,
      transaction: transaction
    });
  };

  const closeViewModal = () => {
    setViewModal({ isOpen: false, transaction: null });
  };

  const { data: transactions, isLoading, refetch } = useQuery(
    ['transactions', searchTerm],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('name', searchTerm);
      
      const response = await api.get(`/api/transactions?${params}`);
      console.log('Transaction data received:', response.data);
      return response.data;
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      keepPreviousData: true, // Prevent blank pages
    }
  );

  // Helper function to format time in 12-hour format with AM/PM
  const formatTime12Hour = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate transaction statistics
  const transactionStats = {
    total: transactions?.length || 0,
    completed: transactions?.filter((t: any) => t.status === 'COMPLETED').length || 0,
    pending: transactions?.filter((t: any) => t.status === 'PENDING').length || 0,
    failed: transactions?.filter((t: any) => t.status === 'FAILED').length || 0,
    totalAmount: transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0,
    completedAmount: transactions?.filter((t: any) => t.status === 'COMPLETED').reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0
  };

  // Force refresh when returning from add/edit page
  useEffect(() => {
    if (location.state?.fromAdd && location.state?.transactionName) {
      toast.success(`🎉 ${location.state.transactionName} transaction has been successfully added!`);
      // Clear the state to prevent repeated messages
      window.history.replaceState({}, document.title);
    }
    
    if (location.state?.fromEdit) {
      console.log('Returning from edit page, forcing refresh...', location.state);
      setIsRefreshing(true);
      
      queryClient.clear();
      queryClient.invalidateQueries(['transactions']);
      
      setTimeout(() => {
        queryClient.refetchQueries(['transactions']);
        refetch().finally(() => {
          setIsRefreshing(false);
        });
      }, 50);
    }
  }, [location.state, queryClient, refetch, setIsRefreshing]);

  const isMobile = device === 'mobile';

  if (isLoading || isRefreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isRefreshing ? 'Refreshing data...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all financial transactions</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              refetch();
              toast.success('Refreshing transaction data...');
            }}
            className="btn-outline inline-flex items-center"
          >
            🔄 Refresh
          </button>
          <Link
            to="/transactions/new"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Transaction
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Transactions</p>
              <p className="text-3xl font-bold">{transactionStats.total}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <ChartBarIcon className="h-8 w-8" />
            </div>
          </div>
        </motion.div>

        {/* Completed Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold">{transactionStats.completed}</p>
              <p className="text-green-100 text-xs mt-1">
                ₹{transactionStats.completedAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">
              <CheckCircleIcon className="h-8 w-8" />
            </div>
          </div>
        </motion.div>

        {/* Pending Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold">{transactionStats.pending}</p>
            </div>
            <div className="bg-yellow-400 bg-opacity-30 rounded-lg p-3">
              <ClockIcon className="h-8 w-8" />
            </div>
          </div>
        </motion.div>

        {/* Total Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Amount</p>
              <p className="text-2xl font-bold">₹{transactionStats.totalAmount.toLocaleString()}</p>
              {transactionStats.failed > 0 && (
                <p className="text-purple-100 text-xs mt-1">
                  {transactionStats.failed} failed
                </p>
              )}
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">
              <span className="text-2xl font-bold">₹</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              refetch();
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Transactions Table/Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {transactions && transactions.length > 0 ? (
          <div className={`${isMobile ? 'space-y-4' : 'overflow-x-auto'}`}>
            {isMobile ? (
              // Mobile Card View
              <div className="space-y-4">
                {transactions.map((transaction: any) => (
                  <motion.div
                    key={transaction.id}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{transaction.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">📅 {new Date(transaction.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600 mb-1">🕐 {formatTime12Hour(transaction.date)}</p>
                    <p className="text-sm text-gray-600 mb-1">🆔 {transaction.transactionId}</p>
                    <p className="text-sm text-gray-600 mb-2">💰 ₹{transaction.amount.toLocaleString()}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <Link
                        to={`/transactions/${transaction.id}/edit`}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id, transaction.name)}
                        disabled={deleteTransactionMutation.isLoading}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // Desktop Table View
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-indigo-600">
                    <tr>
                      <th className="w-16 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        S.No
                      </th>
                      <th className="w-48 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Name
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Date
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Time
                      </th>
                      <th className="w-40 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="w-24 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction: any, index: number) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="w-16 px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {index + 1}
                        </td>
                        <td className="w-48 px-4 py-4 text-sm font-medium text-gray-900">
                          <div className="truncate" title={transaction.name}>
                            {transaction.name}
                          </div>
                        </td>
                        <td className="w-32 px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="w-32 px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime12Hour(transaction.date)}
                        </td>
                        <td className="w-40 px-4 py-4 text-sm text-gray-500">
                          <div className="truncate" title={transaction.transactionId}>
                            {transaction.transactionId}
                          </div>
                        </td>
                        <td className="w-32 px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                          ₹{transaction.amount.toLocaleString()}
                        </td>
                        <td className="w-24 px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="w-32 px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewTransaction(transaction)}
                              className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                              title="View Transaction Details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <Link
                              to={`/transactions/${transaction.id}/edit`}
                              className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                              title="Edit Transaction"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id, transaction.name)}
                              disabled={deleteTransactionMutation.isLoading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                              title="Delete Transaction"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No transactions found.</p>
            <Link
              to="/transactions/new"
              className="btn-primary inline-flex items-center mt-4"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Transaction
            </Link>
          </div>
        )}
      </motion.div>

      {/* View Transaction Modal */}
      {viewModal.isOpen && viewModal.transaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction Details - {viewModal.transaction.name}
                </h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{viewModal.transaction.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(viewModal.transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatTime12Hour(viewModal.transaction.date)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{viewModal.transaction.transactionId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <p className="mt-1 text-sm text-gray-900 font-semibold">
                      ₹{viewModal.transaction.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      viewModal.transaction.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800'
                        : viewModal.transaction.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {viewModal.transaction.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end pt-6 border-t border-gray-200 space-x-3">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
                <Link
                  to={`/transactions/${viewModal.transaction.id}/edit`}
                  onClick={closeViewModal}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 inline-flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Transaction
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
