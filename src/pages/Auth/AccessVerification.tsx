import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '../../lib/api.ts';
import toast from 'react-hot-toast';

interface VerificationResult {
  success: boolean;
  staff?: {
    id: number;
    name: string;
    email: string;
    role: string;
    department?: string;
    position?: string;
  };
  authToken?: string;
  message: string;
}

function AccessVerification() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (token) {
      verifyAccessToken();
    } else {
      setVerificationResult({
        success: false,
        message: 'Invalid access link. No token provided.'
      });
      setIsVerifying(false);
    }
  }, [token]);

  const verifyAccessToken = async () => {
    try {
      setIsVerifying(true);
      console.log('Verifying access token:', token);

      const response = await api.post(`/api/staff/verify-access/${token}`);
      
      if (response.data.staff && response.data.authToken) {
        // Store authentication token
        localStorage.setItem('authToken', response.data.authToken);
        localStorage.setItem('user', JSON.stringify(response.data.staff));
        
        setVerificationResult({
          success: true,
          staff: response.data.staff,
          authToken: response.data.authToken,
          message: 'Access verified successfully! Welcome to the Business Loan Management System.'
        });

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

        toast.success('Access verified! Redirecting to dashboard...');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Access verification failed:', error);
      
      setVerificationResult({
        success: false,
        message: error.response?.data?.message || 'Access verification failed. The link may be invalid or expired.'
      });

      toast.error('Access verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRetry = () => {
    if (token) {
      verifyAccessToken();
    }
  };

  const handleContactAdmin = () => {
    window.location.href = 'mailto:admin@businessloan.com?subject=Access Verification Issue&body=I am having trouble accessing my account. Please help.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-xl shadow-xl p-8"
      >
        <div className="text-center">
          {/* Logo/Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Business Loan Management
            </h1>
            <p className="text-gray-600">Access Verification</p>
          </div>

          {/* Loading State */}
          {isVerifying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <ArrowPathIcon className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Verifying Access...
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your access token.
              </p>
            </motion.div>
          )}

          {/* Success State */}
          {!isVerifying && verificationResult?.success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-green-900 mb-2">
                Access Verified Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                {verificationResult.message}
              </p>

              {verificationResult.staff && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-900 mb-2">Welcome!</h3>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Name:</strong> {verificationResult.staff.name}</p>
                    <p><strong>Email:</strong> {verificationResult.staff.email}</p>
                    <p><strong>Role:</strong> {verificationResult.staff.role}</p>
                    {verificationResult.staff.department && (
                      <p><strong>Department:</strong> {verificationResult.staff.department}</p>
                    )}
                    {verificationResult.staff.position && (
                      <p><strong>Position:</strong> {verificationResult.staff.position}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600">
                Redirecting to dashboard in 3 seconds...
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {!isVerifying && verificationResult && !verificationResult.success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-900 mb-2">
                Access Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {verificationResult.message}
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-900 mb-2">Possible Reasons:</h3>
                <ul className="text-sm text-red-800 text-left space-y-1">
                  <li>• The access link has expired (24-hour limit)</li>
                  <li>• The link has already been used</li>
                  <li>• The link is invalid or corrupted</li>
                  <li>• Your access has been revoked</li>
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full btn-primary"
                >
                  Try Again
                </button>
                
                <button
                  onClick={handleContactAdmin}
                  className="w-full btn-secondary"
                >
                  Contact Administrator
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full btn-outline"
                >
                  Go to Home
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default AccessVerification;
