import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  CurrencyRupeeIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface FormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  loanAmount: string;
  loanPurpose: string;
  annualRevenue: string;
}


const LoanApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    loanAmount: '',
    loanPurpose: '',
    annualRevenue: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.ownerName || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    
    try {
      console.log('🚀 Submitting loan enquiry:', formData);
      
      const response = await api.post('/api/enquiries', {
        name: formData.ownerName,
        mobile: formData.phone,
        email: formData.email,
        businessName: formData.businessName,
        businessType: formData.loanPurpose || 'General Business',
        loanAmount: formData.loanAmount ? parseInt(formData.loanAmount.replace(/[^0-9]/g, '')) : null,
        source: 'LANDING_PAGE',
        interestStatus: 'INTERESTED',
        additionalData: {
          annualRevenue: formData.annualRevenue,
          loanPurpose: formData.loanPurpose
        }
      });
      
      console.log('✅ Enquiry submitted successfully:', response.data);
      
      toast.success('Application submitted successfully! Our specialists will reach out within 24 hours.');
      
      // Reset form
      setFormData({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        loanAmount: '',
        loanPurpose: '',
        annualRevenue: ''
      });
      
      // Navigate to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          
          {/* Left Side - Content */}
          <div className="text-white space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm">₹</span>
              </div>
              <span className="text-xl font-bold">FinGrowth</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Power Your Business
                <br />
                with
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                  Tailored Financial
                  <br />
                  Solutions
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                Get the capital you need with same-day approvals and competitive rates. 
                Designed for ambitious businesses looking to expand, upgrade, or optimize their operations.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="text-3xl font-bold text-white">24h</div>
                <div className="text-sm text-slate-400">Fast Track Approval</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="text-3xl font-bold text-white">8%*</div>
                <div className="text-sm text-slate-400">Competitive Rates</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="text-3xl font-bold text-white">₹5 Crore</div>
                <div className="text-sm text-slate-400">Maximum Funding</div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-teal-400" />
                <span className="text-slate-300">Secure & Encrypted</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-teal-400" />
                <span className="text-slate-300">No Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-teal-400" />
                <span className="text-slate-300">Pre-approved Offers</span>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-teal-400" />
                <span className="text-slate-300">Dedicated Manager</span>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Business Loan Enquiry</h2>
                <p className="text-slate-400">Submit your details. Our specialists will reach out within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Business Name & Owner Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Business Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="Your Company Ltd."
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@company.com"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Loan Amount & Purpose */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Loan Amount</label>
                    <select
                      name="loanAmount"
                      value={formData.loanAmount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                    >
                      <option value="">Select amount</option>
                      <option value="500000">₹5 Lakh</option>
                      <option value="1000000">₹10 Lakh</option>
                      <option value="2500000">₹25 Lakh</option>
                      <option value="5000000">₹50 Lakh</option>
                      <option value="10000000">₹1 Crore</option>
                      <option value="50000000">₹5 Crore</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Loan Purpose</label>
                    <select
                      name="loanPurpose"
                      value={formData.loanPurpose}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                    >
                      <option value="">Select purpose</option>
                      <option value="Working Capital">Working Capital</option>
                      <option value="Equipment Purchase">Equipment Purchase</option>
                      <option value="Business Expansion">Business Expansion</option>
                      <option value="Inventory">Inventory</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Annual Revenue */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Annual Revenue</label>
                  <select
                    name="annualRevenue"
                    value={formData.annualRevenue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  >
                    <option value="">Select revenue range</option>
                    <option value="Below 10 Lakh">Below ₹10 Lakh</option>
                    <option value="10-25 Lakh">₹10-25 Lakh</option>
                    <option value="25-50 Lakh">₹25-50 Lakh</option>
                    <option value="50 Lakh - 1 Crore">₹50 Lakh - 1 Crore</option>
                    <option value="1-5 Crore">₹1-5 Crore</option>
                    <option value="Above 5 Crore">Above ₹5 Crore</option>
                  </select>
                </div>

                {/* Document Upload (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Business Documents (Optional)</label>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-teal-400 transition-colors cursor-pointer">
                    <DocumentArrowUpIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-slate-400">Upload financial documents</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRightIcon className="h-5 w-5" />
                    </>
                  )}
                </button>

                {/* Terms */}
                <p className="text-xs text-slate-400 text-center">
                  By submitting this form, you agree to our terms and privacy policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationForm;
