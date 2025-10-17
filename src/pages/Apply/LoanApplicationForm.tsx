import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface LoanApplicationFormData {
  name: string;
  mobile: string;
  businessType?: string;
  businessName?: string;
}

const businessTypes = [
  'Manufacturing',
  'Trading',
  'Service',
  'Retail',
  'Wholesale',
  'Construction',
  'Transportation',
  'Agriculture',
  'Technology',
  'Healthcare',
  'Education',
  'Hospitality',
  'Other'
];

const LoanApplicationForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoanApplicationFormData>();

  const onSubmit = async (data: LoanApplicationFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log('🚀 Submitting loan application:', data);
      
      const response = await axios.post('/api/enquiries', {
        name: data.name,
        mobile: data.mobile,
        businessType: data.businessType || null,
        businessName: data.businessName || null,
        source: 'ONLINE_APPLICATION',
        interestStatus: 'INTERESTED'
      });

      console.log('✅ Application submitted successfully:', response.data);
      
      if (response.data) {
        toast.success('Application submitted successfully! We will contact you soon.');
        reset();
        
        // Redirect to a thank you page or back to home
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Error submitting application:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Service not available. Please try again later.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Logo */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center">
                <img 
                  src="/generated-image.png" 
                  alt="Company Logo" 
                  className="h-20 w-20 object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300"
                  style={{ 
                    filter: 'contrast(2.2) saturate(2.0) brightness(1.8)',
                    imageRendering: 'crisp-edges',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Business Loan Portal</h1>
                <p className="text-sm text-gray-600 font-medium">Apply for Business Loans Online</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Need help? Call us at +91-XXXXXXXXXX
            </div>
          </div>
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Loan Application
              </h1>
              <p className="text-gray-600">
                Apply for a business loan in just a few steps
              </p>
            </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Mobile Number Field */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="mobile"
                {...register('mobile', {
                  required: 'Mobile number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Please enter a valid 10-digit mobile number'
                  }
                })}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.mobile ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your mobile number"
                maxLength={10}
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
              )}
            </div>

            {/* Business Type Field */}
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                Business Type <span className="text-gray-400">(Optional)</span>
              </label>
              <select
                id="businessType"
                {...register('businessType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select business type</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Name Field */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                id="businessName"
                {...register('businessName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your business name"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              By submitting this form, you agree to our terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default LoanApplicationForm;
