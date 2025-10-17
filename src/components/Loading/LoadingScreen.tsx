import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  duration?: number;
}

function LoadingScreen({ onLoadingComplete, duration = 3000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const loadingSteps = [
    { text: 'Initializing Business Loan System...', progress: 20 },
    { text: 'Loading Security Protocols...', progress: 40 },
    { text: 'Connecting to Database...', progress: 60 },
    { text: 'Preparing Dashboard...', progress: 80 },
    { text: 'Almost Ready...', progress: 95 },
    { text: 'Welcome!', progress: 100 }
  ];

  useEffect(() => {
    const stepDuration = duration / loadingSteps.length;
    
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep >= loadingSteps.length) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(() => {
            onLoadingComplete();
          }, 500);
          return prev;
        }
        return nextStep;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [duration, onLoadingComplete]);

  useEffect(() => {
    if (currentStep < loadingSteps.length) {
      const targetProgress = loadingSteps[currentStep].progress;
      const startProgress = progress;
      const progressDiff = targetProgress - startProgress;
      const steps = 20;
      const stepSize = progressDiff / steps;
      
      let currentProgress = startProgress;
      const progressInterval = setInterval(() => {
        currentProgress += stepSize;
        if (currentProgress >= targetProgress) {
          setProgress(targetProgress);
          clearInterval(progressInterval);
        } else {
          setProgress(currentProgress);
        }
      }, 50);

      return () => clearInterval(progressInterval);
    }
  }, [currentStep]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
        >
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-40 left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10 text-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 1,
                type: "spring",
                stiffness: 260,
                damping: 20 
              }}
              className="mb-8"
            >
              <div className="flex items-center justify-center mx-auto">
                <img 
                  src="/generated-image.png" 
                  alt="Company Logo" 
                  className="w-24 h-24 object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300"
                  style={{ 
                    filter: 'contrast(2.2) saturate(2.0) brightness(1.8)',
                    imageRendering: 'crisp-edges',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                />
              </div>
            </motion.div>

            {/* Company Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl font-bold text-gray-900 mb-2"
            >
              Business Loan Management
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-lg text-gray-600 mb-12"
            >
              Streamline Your Financial Operations
            </motion.p>

            {/* Loading Progress */}
            <div className="w-96 mx-auto">
              {/* Progress Bar Container */}
              <div className="relative mb-6">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                  </motion.div>
                </div>
                
                {/* Progress Percentage */}
                <motion.div
                  className="absolute -top-8 right-0 text-sm font-semibold text-green-600"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {Math.round(progress)}%
                </motion.div>
              </div>

              {/* Loading Text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <p className="text-gray-700 font-medium">
                    {currentStep < loadingSteps.length ? loadingSteps[currentStep].text : 'Loading...'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Loading Dots Animation */}
              <div className="flex justify-center items-center mt-4 space-x-1">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-12 grid grid-cols-3 gap-8 text-center"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-green-600 text-xl">🔒</span>
                </div>
                <p className="text-sm text-gray-600">Secure</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-emerald-600 text-xl">⚡</span>
                </div>
                <p className="text-sm text-gray-600">Fast</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-teal-600 text-xl">📊</span>
                </div>
                <p className="text-sm text-gray-600">Smart</p>
              </div>
            </motion.div>

            {/* Powered by AI Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
              className="mt-8 inline-flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-80 rounded-full shadow-lg backdrop-blur-sm"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✨</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Powered by Gemini AI</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingScreen;
