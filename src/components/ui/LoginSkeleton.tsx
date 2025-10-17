import { motion } from 'framer-motion';

const LoginSkeleton = () => {
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
        {/* Left Side - Welcome Section Skeleton */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-12 flex-col justify-center relative">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {/* Logo skeleton */}
              <div className="w-16 h-16 bg-white bg-opacity-30 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm animate-pulse">
                <div className="w-8 h-8 bg-white bg-opacity-50 rounded"></div>
              </div>
              
              {/* Title skeleton */}
              <div className="mb-4">
                <div className="h-10 bg-white bg-opacity-30 rounded-lg mb-2 animate-pulse"></div>
                <div className="h-6 bg-white bg-opacity-20 rounded-lg w-3/4 animate-pulse"></div>
              </div>
              
              {/* Description skeleton */}
              <div className="mb-8">
                <div className="h-4 bg-white bg-opacity-20 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-white bg-opacity-20 rounded mb-2 w-5/6 animate-pulse"></div>
                <div className="h-4 bg-white bg-opacity-20 rounded w-4/5 animate-pulse"></div>
              </div>
              
              {/* Features skeleton */}
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center animate-pulse">
                    <div className="w-2 h-2 bg-white bg-opacity-40 rounded-full mr-3"></div>
                    <div className="h-4 bg-white bg-opacity-20 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form Skeleton */}
        <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {/* Header skeleton */}
            <div className="text-center lg:text-left mb-8">
              <div className="lg:hidden w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg animate-pulse">
                <div className="w-8 h-8 bg-white bg-opacity-50 rounded"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
              <div className="h-5 bg-gray-100 rounded-lg w-3/4 animate-pulse"></div>
            </div>
          </motion.div>

          {/* Role Selection Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            {[1, 2].map((item) => (
              <div
                key={item}
                className="p-4 rounded-xl border-2 border-gray-200 bg-white animate-pulse"
              >
                <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </motion.div>

          {/* Form Skeleton */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {/* Role info skeleton */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-pulse">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>

            {/* Form fields skeleton */}
            <div className="space-y-4">
              {/* Email field */}
              <div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/4 animate-pulse"></div>
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
              </div>

              {/* Password field */}
              <div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/4 animate-pulse"></div>
                <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
              </div>
            </div>

            {/* Submit button skeleton */}
            <div>
              <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            {/* Footer text skeleton */}
            <div className="text-center">
              <div className="h-3 bg-gray-100 rounded w-2/3 mx-auto animate-pulse"></div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSkeleton;
