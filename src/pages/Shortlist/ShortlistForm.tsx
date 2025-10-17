import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api.ts';
import toast from 'react-hot-toast';

interface ShortlistFormData {
  name: string;
  mobile: string;
  businessName?: string;
  businessNature?: string;
  district?: string;
  propPvt?: string;
  hasGst?: string;
  gst?: string;
  hasBusinessPan?: string;
  businessPan?: string;
  hasIec?: string;
  iec?: string;
  hasNewCurrentAccount?: string;
  newCurrentAccount?: boolean;
  hasWebsite?: string;
  website?: string;
  hasGateway?: string;
  gateway?: string;
  transaction?: string;
  bankStatementDuration?: string;
  loanAmount?: number;
  cap?: number;
  bankAccount?: string;
  comments?: string;
  staff?: string;
  gstStatus?: string;
  date?: string;
}

function ShortlistForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ShortlistFormData>();

  // Watch conditional fields
  const hasGst = useWatch({ control, name: 'hasGst' });
  const hasBusinessPan = useWatch({ control, name: 'hasBusinessPan' });
  const hasIec = useWatch({ control, name: 'hasIec' });
  const hasWebsite = useWatch({ control, name: 'hasWebsite' });
  const hasGateway = useWatch({ control, name: 'hasGateway' });


  // Fetch staff members for dropdown
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
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch shortlist data for editing
  const { data: shortlist } = useQuery(
    ['shortlist', id],
    async () => {
      if (!id) return null;
      const response = await api.get(`/api/shortlist/${id}`);
      return response.data;
    },
    { enabled: isEdit }
  );

  // Create/Update mutation
  const mutation = useMutation(
    async (data: ShortlistFormData) => {
      console.log('Submitting shortlist form data:', data);
      console.log('Key fields being sent - loanAmount:', data.loanAmount, 'district:', data.district, 'staff:', data.staff);
      
      if (isEdit) {
        const response = await api.patch(`/api/shortlist/${id}`, data);
        console.log('PATCH response:', response.data);
        return response;
      } else {
        const response = await api.post('/api/shortlist', data);
        console.log('POST response:', response.data);
        return response;
      }
    },
    {
      onSuccess: async (response) => {
        toast.success(isEdit ? 'Shortlist updated successfully!' : 'Shortlist created successfully!');
        console.log('Shortlist update/create successful:', response.data);
        
        // Comprehensive cache invalidation to ensure immediate reflection
        queryClient.clear(); // Clear all caches
        queryClient.invalidateQueries(['shortlists']);
        queryClient.invalidateQueries(['shortlist']);
        queryClient.invalidateQueries(['cashfree-applications']);
        
        // Force immediate refetch of shortlist data
        await queryClient.refetchQueries(['shortlists']);
        
        // Small delay to ensure backend has processed the update
        setTimeout(() => {
          // Navigate back to shortlist page with state to force refresh
          navigate('/shortlist', { state: { fromEdit: true, timestamp: Date.now() } });
        }, 100);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Something went wrong');
      },
    }
  );

  // Reset form with shortlist data when editing
  useEffect(() => {
    if (shortlist) {
      reset({
        name: shortlist.name,
        mobile: shortlist.mobile,
        businessName: shortlist.businessName || '',
        businessNature: shortlist.businessNature || '',
        district: shortlist.district || '',
        propPvt: shortlist.propPvt || '',
        hasGst: shortlist.hasGst || '',
        gst: shortlist.gst || '',
        hasBusinessPan: shortlist.hasBusinessPan || '',
        businessPan: shortlist.businessPan || '',
        hasIec: shortlist.hasIec || '',
        iec: shortlist.iec || '',
        hasNewCurrentAccount: shortlist.hasNewCurrentAccount || '',
        newCurrentAccount: shortlist.newCurrentAccount || false,
        hasWebsite: shortlist.hasWebsite || '',
        website: shortlist.website || '',
        hasGateway: shortlist.hasGateway || '',
        gateway: shortlist.gateway || '',
        transaction: shortlist.transaction || '',
        bankStatementDuration: shortlist.bankStatementDuration || '',
        loanAmount: shortlist.loanAmount || 0,
        cap: shortlist.cap || 0,
        bankAccount: shortlist.bankAccount || '',
        comments: shortlist.comments || '',
        staff: shortlist.staff || '',
        gstStatus: shortlist.gstStatus || '',
        date: shortlist.date || new Date().toISOString().split('T')[0],
      });
    }
  }, [shortlist, reset]);

  const onSubmit = (data: ShortlistFormData) => {
    mutation.mutate(data);
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
              onClick={() => navigate('/shortlist')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Shortlist
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Shortlist' : 'New Shortlist'}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Update shortlist information' : 'Create a new shortlisted application'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className="input-field"
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  {...register('mobile', { required: 'Mobile number is required' })}
                  type="tel"
                  className="input-field"
                  placeholder="Enter mobile number"
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District
                </label>
                <input
                  {...register('district')}
                  type="text"
                  className="input-field"
                  placeholder="Enter district"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  {...register('date')}
                  type="date"
                  className="input-field"
                />
              </div>

            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  {...register('businessName')}
                  type="text"
                  className="input-field"
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Nature
                </label>
                <input
                  {...register('businessNature')}
                  type="text"
                  className="input-field"
                  placeholder="Enter business nature"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constitution of Business (Prop/PVT)
                </label>
                <select {...register('propPvt')} className="input-field">
                  <option value="">Select type</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Private Limited">Private Limited</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLP">LLP</option>
                  <option value="Public Limited">Public Limited</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST
                </label>
                <select {...register('hasGst')} className="input-field">
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {hasGst === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    {...register('gst')}
                    type="text"
                    className="input-field"
                    placeholder="Enter GST number"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business PAN Card
                </label>
                <select {...register('hasBusinessPan')} className="input-field">
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {hasBusinessPan === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business PAN Card Number
                  </label>
                  <input
                    {...register('businessPan')}
                    type="text"
                    className="input-field"
                    placeholder="Enter business PAN card number"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IEC Code
                </label>
                <select {...register('hasIec')} className="input-field">
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {hasIec === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IEC Code Number
                  </label>
                  <input
                    {...register('iec')}
                    type="text"
                    className="input-field"
                    placeholder="Enter IEC code number"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount
                </label>
                <input
                  {...register('loanAmount', { valueAsNumber: true })}
                  type="number"
                  className="input-field"
                  placeholder="Enter loan amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CAP Amount
                </label>
                <input
                  {...register('cap', { valueAsNumber: true })}
                  type="number"
                  className="input-field"
                  placeholder="Enter CAP amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account
                </label>
                <input
                  {...register('bankAccount')}
                  type="text"
                  className="input-field"
                  placeholder="Enter bank account details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Statement Duration
                </label>
                <select {...register('bankStatementDuration')} className="input-field">
                  <option value="">Select duration</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                  <option value="18 months">18 months</option>
                  <option value="24 months">24 months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Current Account
                </label>
                <select {...register('hasNewCurrentAccount')} className="input-field">
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Online Presence */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Online Presence</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <select {...register('hasWebsite')} className="input-field">
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {hasWebsite === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    {...register('website')}
                    type="url"
                    className="input-field"
                    placeholder="Enter website URL"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gateway
                </label>
                <select {...register('hasGateway')} className="input-field">
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {hasGateway === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Gateway Details
                  </label>
                  <input
                    {...register('gateway')}
                    type="text"
                    className="input-field"
                    placeholder="Enter payment gateway details"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Details
                </label>
                <input
                  {...register('transaction')}
                  type="text"
                  className="input-field"
                  placeholder="Enter transaction details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Status
                </label>
                <select {...register('gstStatus')} className="input-field">
                  <option value="">Select status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Staff Assignment */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Staff Member *
                </label>
                <select
                  {...register('staff', { required: 'Staff assignment is required' })}
                  className="input-field"
                >
                  <option value="">Select staff member...</option>
                  {staffMembers && staffMembers.map((staff: any) => (
                    <option key={staff.id} value={staff.name}>
                      {staff.name} - {staff.role} ({staff.department})
                    </option>
                  ))}
                </select>
                {errors.staff && (
                  <p className="mt-1 text-sm text-red-600">{errors.staff.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Select the staff member responsible for this shortlisted application
                </p>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments
            </label>
            <textarea
              {...register('comments')}
              rows={4}
              className="input-field"
              placeholder="Enter any additional comments..."
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
                ? 'Update Shortlist'
                : 'Create Shortlist'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default ShortlistForm;
