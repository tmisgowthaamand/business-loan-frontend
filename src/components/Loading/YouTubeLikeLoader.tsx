import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';

interface YouTubeLikeLoaderProps {
  onLoadingComplete: () => void;
  duration?: number;
}

function YouTubeLikeLoader({ onLoadingComplete, duration = 4000 }: YouTubeLikeLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const phases = [
    { name: 'Connecting...', duration: 800 },
    { name: 'Loading Interface...', duration: 1000 },
    { name: 'Preparing Data...', duration: 1200 },
    { name: 'Finalizing...', duration: 1000 }
  ];

  useEffect(() => {
    let totalTime = 0;
    const phaseTimers: NodeJS.Timeout[] = [];

    phases.forEach((phase, index) => {
      const timer = setTimeout(() => {
        setCurrentPhase(index);
      }, totalTime);
      phaseTimers.push(timer);
      totalTime += phase.duration;
    });

    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setIsComplete(true);
          setTimeout(onLoadingComplete, 300);
          return 100;
        }
        return prev + (100 / (duration / 50));
      });
    }, 50);

    return () => {
      phaseTimers.forEach(clearTimeout);
      clearInterval(progressTimer);
    };
  }, [duration, onLoadingComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-white"
        >
          {/* Header Skeleton */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-4">
                <SkeletonLoader variant="circular" width={40} height={40} />
                <SkeletonLoader width={200} height={24} />
              </div>
              <div className="flex items-center space-x-4">
                <SkeletonLoader width={300} height={36} variant="rounded" />
                <SkeletonLoader variant="circular" width={32} height={32} />
                <SkeletonLoader variant="circular" width={32} height={32} />
                <SkeletonLoader variant="circular" width={40} height={40} />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex max-w-7xl mx-auto p-4">
            {/* Sidebar Skeleton */}
            <div className="w-72 pr-6 space-y-4">
              {[...Array(8)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-2"
                >
                  <SkeletonLoader variant="circular" width={24} height={24} />
                  <SkeletonLoader width={120} height={16} />
                </motion.div>
              ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 space-y-6">
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <SkeletonLoader variant="circular" width={48} height={48} />
                      <SkeletonLoader width={60} height={20} variant="rounded" />
                    </div>
                    <SkeletonLoader width="80%" height={24} className="mb-2" />
                    <SkeletonLoader width="60%" height={16} />
                  </motion.div>
                ))}
              </div>

              {/* Table Skeleton */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Table Header */}
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <SkeletonLoader width={150} height={20} />
                    <SkeletonLoader width={100} height={36} variant="rounded" />
                  </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-gray-200">
                  {[...Array(5)].map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="p-4 flex items-center space-x-4"
                    >
                      <SkeletonLoader variant="circular" width={40} height={40} />
                      <div className="flex-1 space-y-2">
                        <SkeletonLoader width="70%" height={16} />
                        <SkeletonLoader width="50%" height={14} />
                      </div>
                      <SkeletonLoader width={80} height={24} variant="rounded" />
                      <div className="flex space-x-2">
                        <SkeletonLoader variant="circular" width={32} height={32} />
                        <SkeletonLoader variant="circular" width={32} height={32} />
                        <SkeletonLoader variant="circular" width={32} height={32} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Loading Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
            >
              {/* Logo */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-2xl">🏦</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900">Business Loan System</h2>
                <p className="text-gray-600 mt-2">Loading your dashboard...</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{phases[currentPhase]?.name || 'Loading...'}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Loading Animation */}
              <div className="flex justify-center space-x-2">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-3 h-3 bg-green-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                ))}
              </div>

              {/* Features */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-1">
                    <span className="text-green-600 text-sm">🔒</span>
                  </div>
                  <span className="text-xs text-gray-600">Secure</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                    <span className="text-blue-600 text-sm">⚡</span>
                  </div>
                  <span className="text-xs text-gray-600">Fast</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                    <span className="text-purple-600 text-sm">🤖</span>
                  </div>
                  <span className="text-xs text-gray-600">AI-Powered</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default YouTubeLikeLoader;
