import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from './NotificationPanel';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <>
      {/* Enhanced Bell Icon with Better Alignment */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          console.log('🔔 Notification bell clicked, opening panel...');
          setIsOpen(true);
        }}
        className="relative p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg border border-transparent hover:border-indigo-100"
        title={`View Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        {/* Enhanced Bell Icon */}
        <BellIcon className="h-6 w-6 transition-transform duration-200" />
        
        {/* Enhanced Notification Count Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 via-red-600 to-pink-600 text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center font-bold shadow-lg border-2 border-white"
            style={{ fontSize: '10px', lineHeight: '1' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}

        {/* Enhanced Animated Ring for New Notifications */}
        {unreadCount > 0 && (
          <motion.div
            animate={{ 
              scale: [1, 1.6, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2.5,
              ease: "easeInOut"
            }}
            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-400 to-pink-400 rounded-full w-[20px] h-[20px]"
          />
        )}
        
        {/* Subtle Glow Effect for Active State */}
        {unreadCount > 0 && (
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-xl blur-sm -z-10" />
        )}
      </motion.button>

      {/* Enhanced Notification Panel */}
      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default NotificationBell;
