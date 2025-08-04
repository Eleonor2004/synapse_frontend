'use client';

// FIX: Import the 'Variants' type from framer-motion
import { motion, Variants } from 'framer-motion';

// FIX: Removed all unused icon imports to clean up the code
import { 
  FileText,
  Upload,
  User, 
  Shield,
  AlertTriangle,
} from 'lucide-react';

// FIX: Explicitly type the constant with the 'Variants' type
const cardVariants: Variants = {
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

// Define a specific type for the activity type string
type ActivityType = 'success' | 'warning' | 'info';

// History Tab Component
const HistoryTab = () => {
    const activities = [
      { icon: FileText, text: 'Data analysis completed for Q4 report', time: '2 hours ago', type: 'success' as ActivityType },
      { icon: Upload, text: 'Uploaded new dataset: customer_data.csv', time: '5 hours ago', type: 'info' as ActivityType },
      { icon: User, text: 'Profile updated successfully', time: '1 day ago', type: 'info' as ActivityType },
      { icon: Shield, text: 'Security scan completed', time: '2 days ago', type: 'success' as ActivityType },
      { icon: AlertTriangle, text: 'Data processing warning resolved', time: '3 days ago', type: 'warning' as ActivityType },
    ];
  
    // Add a type for the 'type' parameter
    const getTypeStyles = (type: ActivityType) => {
      switch (type) {
        case 'success':
          return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600';
        case 'warning':
          return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600';
        default:
          return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600';
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
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Activity History
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Track your recent activities and system events</p>
        </motion.div>
  
        {/* Activity List */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: index * 0.1 }
                }}
                className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
              >
                <div className={`p-3 rounded-xl mr-4 ${getTypeStyles(activity.type)}`}>
                  <activity.icon className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  <p className="font-medium text-gray-900 dark:text-white">{activity.text}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  };

export default HistoryTab;