'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  Clock, 
  BarChart3, 
  Bell, 
  Users, 
  Menu, 
  X,
  ChevronRight,
  Home,
  Sparkles,
  Calendar,
  Shield,
  Award,
  TrendingUp,
  Activity,
  FileText,
  Camera,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  Upload,
  Download,
  Eye,
  EyeOff,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Check,
  AlertTriangle,
  Info,
  Sun,
  Moon,
  Laptop,
  Globe
} from 'lucide-react';
const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };
// Notifications Tab Component
const NotificationsTab = () => {
    const notifications = [
      { 
        icon: Info, 
        title: 'System Update Available', 
        message: 'A new version of the dashboard is ready to install',
        time: '2 hours ago',
        type: 'info',
        unread: true
      },
      { 
        icon: Check, 
        title: 'Data Backup Completed', 
        message: 'Your monthly data backup has been successfully completed',
        time: '1 day ago',
        type: 'success',
        unread: true
      },
      { 
        icon: AlertTriangle, 
        title: 'Storage Warning', 
        message: 'You are approaching your storage limit (85% used)',
        time: '2 days ago',
        type: 'warning',
        unread: false
      },
      { 
        icon: User, 
        title: 'New Team Member Added', 
        message: 'Sarah Johnson has joined your analytics team',
        time: '3 days ago',
        type: 'info',
        unread: false
      }
    ];
  
    const getTypeStyles = (type) => {
      switch (type) {
        case 'success':
          return {
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: 'text-emerald-600',
            dot: 'bg-emerald-500'
          };
        case 'warning':
          return {
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-200 dark:border-orange-800',
            icon: 'text-orange-600',
            dot: 'bg-orange-500'
          };
        default:
          return {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            icon: 'text-blue-600',
            dot: 'bg-blue-500'
          };
      }
    };
  
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Notifications
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Stay updated with the latest system alerts and messages</p>
          </div>
          <motion.button
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Mark All Read
          </motion.button>
        </motion.div>
  
        {/* Notifications List */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="space-y-4">
            {notifications.map((notification, index) => {
              const styles = getTypeStyles(notification.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  className={`relative flex items-start p-6 rounded-xl border transition-all duration-300 hover:shadow-md ${
                    notification.unread 
                      ? `${styles.bg} ${styles.border}` 
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {notification.unread && (
                    <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${styles.dot}`} />
                  )}
                  
                  <div className={`p-3 rounded-xl mr-4 ${styles.bg} ${styles.border} border`}>
                    <notification.icon className={`w-5 h-5 ${styles.icon}`} />
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className={`font-semibold mb-1 ${
                      notification.unread 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {notification.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {notification.time}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    );
  };
export default NotificationsTab;