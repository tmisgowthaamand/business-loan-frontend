import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

function Skeleton({ 
  className = '', 
  variant = 'text', 
  width = '100%', 
  height = variant === 'text' ? '1rem' : '2rem' 
}: SkeletonProps) {
  const baseClasses = "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse";
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    >
      <motion.div
        className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <Skeleton width="200px" height="24px" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton variant="circular" width="40px" height="40px" />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height="16px" />
              <Skeleton width="40%" height="14px" />
            </div>
            <Skeleton width="80px" height="32px" className="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton width="120px" height="20px" />
        <Skeleton variant="circular" width="48px" height="48px" />
      </div>
      <Skeleton width="80px" height="32px" className="mb-2" />
      <Skeleton width="60%" height="14px" />
    </div>
  );
}

export default Skeleton;
