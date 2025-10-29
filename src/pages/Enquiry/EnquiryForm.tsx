import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface EnquiryFormData {
  name: string;
  mobile: string;
  gstNumber?: string;
  businessType?: string;
  comments?: string;
  interestStatus?: string;
  assignedStaff?: string;
  enquiryDate?: string;
  followUpDate?: string;
  additionalComments?: string;
}


function EnquiryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const isViewMode = searchParams.get('view') === 'true';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryFormData>();

  // Fetch enquiry data for editing
  const { data: enquiry, isLoading: enquiryLoading } = useQuery(
    ['enquiry', id],
    async () => {
      if (!id) return null;
      console.log('🔍 Fetching enquiry data for ID:', id);
      const response = await api.get(`/api/enquiries/${id}`);
      console.log('✅ Enquiry data received:', response.data);
      return response.data;
    },
    { enabled: Boolean(id) }
  );

  // Fetch staff members for assignment dropdown
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

  // Staff assignment is now a simple text field, no need to fetch staff data

  // Create/Update mutation
  const mutation = useMutation(
    async (data: EnquiryFormData) => {
      console.log('🔄 Mutation executing with data:', data);
      const endpoint = isEdit ? `/api/enquiries/${id}` : '/api/enquiries';
      console.log('📡 Making request to:', endpoint);
      
      try {
        const response = isEdit 
          ? await api.patch(endpoint, data)
          : await api.post(endpoint, data);
        
        console.log('✅ API response received:', response.data);
        return response;
      } catch (error: any) {
        console.error('❌ API request failed:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL
          }
        });
        throw error;
      }
    },
    {
      onSuccess: (response) => {
        console.log('🎉 Mutation success:', response.data);
        const successMessage = isEdit ? 'Enquiry updated successfully!' : 'Enquiry created successfully!';
        toast.success(successMessage);
        
        if (isEdit) {
          // Invalidate enquiries cache to refresh the list
          queryClient.invalidateQueries(['enquiries']);
          queryClient.invalidateQueries(['enquiry', id]);
          
          // Optimistically update the enquiries list cache
          queryClient.setQueryData(['enquiries'], (oldData: any) => {
            if (!oldData) return oldData;
            return oldData.map((enquiry: any) => 
              enquiry.id === parseInt(id!) ? { ...enquiry, ...response.data } : enquiry
            );
          });
          
          // For updates, go back to enquiries list
          navigate('/enquiries');
        } else {
          // Invalidate enquiries cache for new enquiries
          queryClient.invalidateQueries(['enquiries']);
          
          // For new enquiries, redirect to document verification
          toast.success('Redirecting to document verification...', { duration: 2000 });
          setTimeout(() => {
            navigate('/documents/verification');
          }, 1500);
        }
      },
      onError: (error: any) => {
        console.error('💥 Mutation error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
        console.error('💥 Error message to show:', errorMessage);
        toast.error(errorMessage);
      },
    }
  );

  // Reset form with enquiry data when editing or viewing
  useEffect(() => {
    if (enquiry && (isEdit || isViewMode)) {
      console.log('🔄 Resetting form with enquiry data:', enquiry);
      const formData = {
        name: enquiry.name || '',
        mobile: enquiry.mobile || '',
        businessType: enquiry.businessType || enquiry.businessName || '',
        gstNumber: enquiry.gstNumber || enquiry.gst || '',
        comments: enquiry.comments || '',
        interestStatus: enquiry.interestStatus || '',
        assignedStaff: enquiry.assignedStaff || enquiry.staff?.name || '',
        enquiryDate: enquiry.enquiryDate ? new Date(enquiry.enquiryDate).toISOString().split('T')[0] : 
                     enquiry.createdAt ? new Date(enquiry.createdAt).toISOString().split('T')[0] : 
                     new Date().toISOString().split('T')[0],
        followUpDate: enquiry.followUpDate ? new Date(enquiry.followUpDate).toISOString().split('T')[0] : '',
        additionalComments: enquiry.additionalComments || ''
      };
      console.log('🔄 Form data being set:', formData);
      reset(formData);
    }
  }, [enquiry, isEdit, isViewMode, reset]);

  const onSubmit = (data: EnquiryFormData) => {
    console.log('📝 Submitting enquiry form with data:', data);
    console.log('🔍 Form validation - Name:', data.name, 'Mobile:', data.mobile);
    console.log('🔍 API endpoint will be:', isEdit ? `/api/enquiries/${id}` : '/api/enquiries');
    
    // Additional client-side validation
    if (!data.name?.trim()) {
      console.error('❌ Validation failed: Name is empty');
      toast.error('Please enter a valid name');
      return;
    }
    
    if (!data.mobile?.match(/^[0-9]{10}$/)) {
      console.error('❌ Validation failed: Invalid mobile number:', data.mobile);
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    
    console.log('✅ Client-side validation passed');
    
    if (data.assignedStaff) {
      console.log('👤 Enquiry assigned to staff:', data.assignedStaff);
    } else {
      console.log('👤 No staff assigned to this enquiry');
    }
    
    // Show loading toast
    const loadingToast = toast.loading(isEdit ? 'Updating enquiry...' : 'Creating enquiry...');
    
    console.log('🚀 Starting API request...');
    mutation.mutate(data, {
      onSettled: () => {
        console.log('🏁 API request completed');
        toast.dismiss(loadingToast);
      }
    });
  };

  // Show loading state while fetching enquiry data
  if ((isEdit || isViewMode) && enquiryLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/enquiries')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Enquiries
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Loading Enquiry...</h1>
                <p className="text-gray-600">Please wait while we fetch the enquiry data</p>
              </div>
            </div>
          </div>

          <div className="card space-y-6">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => navigate('/enquiries')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Enquiries
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isViewMode ? 'View Enquiry' : isEdit ? 'Edit Enquiry' : 'New Enquiry'}
              </h1>
              <p className="text-gray-600">
                {isViewMode ? 'View enquiry details' : isEdit ? 'Update enquiry information' : 'Create a new business loan enquiry'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="enquiry-name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                id="enquiry-name"
                type="text"
                autoComplete="name"
                className="input-field"
                placeholder="Enter full name"
                readOnly={isViewMode}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="enquiry-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <input
                {...register('mobile', {
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit mobile number',
                  },
                })}
                id="enquiry-mobile"
                type="tel"
                autoComplete="tel"
                className="input-field"
                placeholder="Enter mobile number"
                readOnly={isViewMode}
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="enquiry-business-type" className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <input
                {...register('businessType')}
                id="enquiry-business-type"
                type="text"
                autoComplete="organization"
                className="input-field"
                placeholder="Enter business type"
                readOnly={isViewMode}
              />
            </div>

            <div>
              <label htmlFor="enquiry-gst-number" className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <input
                {...register('gstNumber')}
                id="enquiry-gst-number"
                type="text"
                autoComplete="off"
                className="input-field"
                placeholder="Enter GST number (optional)"
                readOnly={isViewMode}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="enquiry-interest-status" className="block text-sm font-medium text-gray-700 mb-2">
                Interest Status
              </label>
              <select {...register('interestStatus')} id="enquiry-interest-status" autoComplete="off" className="input-field" disabled={isViewMode}>
                <option value="">Select status</option>
                <option value="INTERESTED">Interested</option>
                <option value="NOT_INTERESTED">Not Interested</option>
                <option value="FOLLOW_UP_REQUIRED">Follow Up Required</option>
              </select>
            </div>

            <div>
              <label htmlFor="enquiry-comments" className="block text-sm font-medium text-gray-700 mb-2">
                Comments Status
              </label>
              <select {...register('comments')} id="enquiry-comments" autoComplete="off" className="input-field" disabled={isViewMode}>
                <option value="">Select status</option>
                <option value="NO_RESPONSE">No Response</option>
                <option value="CHAT_CALL1_COMPLETED">First Call Completed</option>
                <option value="SECOND_CALL_COMPLETED">Second Call Completed</option>
                <option value="THIRD_CALL_COMPLETED">Third Call Completed</option>
                <option value="ELIGIBLE">Eligible</option>
                <option value="NOT_ELIGIBLE">Not Eligible</option>
                <option value="NO_GST">No GST</option>
              </select>
            </div>
          </div>


          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Staff Member
              </label>
              <select
                {...register('assignedStaff')}
                className="input-field"
                disabled={isViewMode}
              >
                <option value="">Select staff member (optional)</option>
                {staffMembers && staffMembers.map((staff: any) => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name} - {staff.role}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Select a staff member to assign this enquiry to
              </p>
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="enquiry-date" className="block text-sm font-medium text-gray-700 mb-2">
                Enquiry Date *
              </label>
              <input
                {...register('enquiryDate', { required: 'Enquiry date is required' })}
                id="enquiry-date"
                type="date"
                autoComplete="off"
                className="input-field"
                defaultValue={new Date().toISOString().split('T')[0]}
                readOnly={isViewMode}
              />
              {errors.enquiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.enquiryDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="enquiry-follow-up-date" className="block text-sm font-medium text-gray-700 mb-2">
                Follow Up Date
              </label>
              <input
                {...register('followUpDate')}
                id="enquiry-follow-up-date"
                type="date"
                autoComplete="off"
                className="input-field"
                placeholder="Select follow up date (optional)"
                readOnly={isViewMode}
              />
              <p className="mt-1 text-sm text-gray-500">
                Set a date for follow up if required
              </p>
            </div>
          </div>

          {/* Additional Comments */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                {...register('additionalComments')}
                rows={4}
                className="input-field resize-none"
                placeholder="Enter any additional comments or notes about this enquiry..."
                readOnly={isViewMode}
              />
              <p className="mt-1 text-sm text-gray-500">
                Add detailed notes, conversation summary, or any other relevant information
              </p>
            </div>
          </div>

          {!isViewMode && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/enquiries')}
                className="btn-secondary"
              >
                Cancel
              </button>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => navigate(`/enquiries/${id}?view=true`)}
                  className="btn-secondary"
                >
                  View Mode
                </button>
              )}
              {isViewMode && (
                <button
                  type="button"
                  onClick={() => navigate(`/enquiries/${id}/edit`)}
                  className="btn-secondary"
                >
                  Edit Mode
                </button>
              )}
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
                ? 'Update Enquiry'
                : 'Create Enquiry'}
            </motion.button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}

export default EnquiryForm;
