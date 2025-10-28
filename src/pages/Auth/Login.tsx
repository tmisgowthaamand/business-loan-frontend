import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import LoginSkeleton from '../../components/ui/LoginSkeleton';

interface LoginForm {
  email: string;
  password: string;
}

type UserRole = 'ADMIN' | 'EMPLOYEE';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>();

  // Show loading skeleton for 2 seconds on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Navigate to dashboard when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User authenticated, navigating to dashboard...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Clear any existing values when switching roles
    setValue('email', '');
    setValue('password', '');
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      console.log('🚀 [VERCEL] Attempting staff login...');
      await login(data);
      console.log('✅ [VERCEL] Login successful, authentication state should update...');
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error('❌ [VERCEL] Login failed:', error);
      // Error is handled in AuthContext with Vercel-specific fallbacks
    } finally {
      setLoading(false);
    }
  };

  // Quick login helper for Vercel deployment
  const quickLogin = async (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
    await onSubmit({ email, password });
  };


  // Show loading skeleton on initial load
  if (initialLoading) {
    return <LoginSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl w-full flex bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        {/* Left Side - Welcome Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-12 flex-col justify-center relative">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="mb-10 flex justify-center items-center">
                <img 
                  src="/generated-image.png" 
                  alt="Company Logo" 
                  className="w-48 h-48 object-contain hover:scale-120 transition-all duration-300"
                  style={{ 
                    filter: 'contrast(3.0) saturate(2.5) brightness(2.5) drop-shadow(0 6px 12px rgba(0,0,0,0.15))',
                    imageRendering: 'crisp-edges' as any,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden' as any
                  }}
                />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome Back!
              </h1>
              <p className="text-green-100 text-lg mb-8 leading-relaxed">
                Sign in to access your business loan management dashboard and streamline your financial operations.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-green-100">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-3"></div>
                  <span>Secure loan processing</span>
                </div>
                <div className="flex items-center text-green-100">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-3"></div>
                  <span>Real-time application tracking</span>
                </div>
                <div className="flex items-center text-green-100">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-3"></div>
                  <span>Comprehensive dashboard</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="text-center lg:text-left mb-8">
              <div className="lg:hidden mb-8 flex justify-center items-center">
                <img 
                  src="/generated-image.png" 
                  alt="Company Logo" 
                  className="w-44 h-44 object-contain hover:scale-120 transition-all duration-300"
                  style={{ 
                    filter: 'contrast(3.0) saturate(2.5) brightness(2.5) drop-shadow(0 6px 12px rgba(0,0,0,0.15))',
                    imageRendering: 'crisp-edges' as any,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden' as any
                  }}
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Login to your account
              </h2>
              <p className="text-gray-600">
                Choose your role and enter your credentials
              </p>
            </div>
          </motion.div>

          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            <motion.button
              type="button"
              onClick={() => handleRoleSelect('ADMIN')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedRole === 'ADMIN'
                  ? 'border-green-500 bg-green-50 shadow-lg ring-2 ring-green-200'
                  : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ShieldCheckIcon className={`h-8 w-8 mx-auto mb-2 ${
                selectedRole === 'ADMIN' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <div className={`font-semibold ${
                selectedRole === 'ADMIN' ? 'text-green-900' : 'text-gray-700'
              }`}>
                Admin
              </div>
              <div className={`text-xs ${
                selectedRole === 'ADMIN' ? 'text-green-600' : 'text-gray-500'
              }`}>
                Full Access
              </div>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleRoleSelect('EMPLOYEE')}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                selectedRole === 'EMPLOYEE'
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg ring-2 ring-emerald-200'
                  : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserIcon className={`h-8 w-8 mx-auto mb-2 ${
                selectedRole === 'EMPLOYEE' ? 'text-emerald-600' : 'text-gray-400'
              }`} />
              <div className={`font-semibold ${
                selectedRole === 'EMPLOYEE' ? 'text-emerald-900' : 'text-gray-700'
              }`}>
                Employee
              </div>
              <div className={`text-xs ${
                selectedRole === 'EMPLOYEE' ? 'text-emerald-600' : 'text-gray-500'
              }`}>
                Limited Access
              </div>
            </motion.button>
          </motion.div>

          <motion.form
            className="space-y-6"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {selectedRole && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200"
              >
                <div className="flex items-center space-x-2">
                  {selectedRole === 'ADMIN' ? (
                    <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-emerald-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    Logging in as {selectedRole === 'ADMIN' ? 'Admin' : 'Employee'}
                  </span>
                </div>
              </motion.div>
            )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="input-field"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

            <div>
              <motion.button
                type="submit"
                disabled={loading || !selectedRole}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                  selectedRole 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl' 
                    : 'bg-gray-300 cursor-not-allowed'
                } ${loading ? 'animate-pulse' : ''}`}
                whileHover={selectedRole && !loading ? { scale: 1.02 } : {}}
                whileTap={selectedRole && !loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : selectedRole ? (
                  `Sign in as ${selectedRole === 'ADMIN' ? 'Admin' : 'Employee'}`
                ) : (
                  'Select a role to continue'
                )}
              </motion.button>
            </div>

            {/* Quick Login Section for Testing */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                🚀 Quick Login (Demo Credentials)
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {/* Admin Accounts */}
                <div className="mb-2">
                  <p className="text-xs font-medium text-blue-600 mb-1">👑 Admin Accounts</p>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => quickLogin('admin@gmail.com', 'admin123')}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Admin User
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLogin('gowthaamankrishna1998@gmail.com', '12345678')}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Perivi
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLogin('newacttmis@gmail.com', '12345678')}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Harish
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLogin('govindamarketing9998@gmail.com', '12345678')}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Pankil
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLogin('tmsnunciya59@gmail.com', '12345678')}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Nunciya
                    </button>
                  </div>
                </div>
                
                {/* Employee Accounts */}
                <div>
                  <p className="text-xs font-medium text-green-600 mb-1">👤 Employee Accounts</p>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => quickLogin('dinesh@gmail.com', '12345678')}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      Dinesh
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLogin('gowthaamaneswar1998@gmail.com', '12345678')}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      Venkat
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Click any button to auto-fill credentials and login
              </p>
            </motion.div>

          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
