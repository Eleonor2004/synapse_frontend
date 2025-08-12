'use client';

import { motion, Variants } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp,
  Activity,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getDashboardStats } from '../../services/dashboardService';
import { UserDashboardStats } from '../../types/api';

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

// Helper function to format large numbers (e.g., 12345 -> "12.3k")
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// Statistics Tab Component
export default function StatisticsTab() {
    // --- DATA FETCHING with TanStack Query ---
    const { data: statsData, isLoading, isError } = useQuery<UserDashboardStats>({
      queryKey: ['dashboardStats'], // A unique key for this query
      queryFn: getDashboardStats,    // The service function to call
    });

    // --- DYNAMIC STATS from fetched data ---
    const stats = [
      { label: 'Total Analyses', value: statsData ? formatNumber(statsData.total_analyses) : '0', change: '', icon: BarChart3, color: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
      { label: 'Records Processed', value: statsData ? formatNumber(statsData.total_records_processed) : '0', change: '', icon: Activity, color: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20' },
      { label: 'Success Rate', value: '99.2%', change: '', icon: TrendingUp, color: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' },
      { label: 'Active Projects', value: '18', change: '', icon: FileText, color: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20' }
    ];

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center h-96 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-700 dark:text-red-300">Error Fetching Statistics</h3>
          <p className="text-red-600 dark:text-red-400">Could not load your dashboard data. Please try again later.</p>
        </div>
      );
    }
  
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Analytics Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Track your performance and key metrics</p>
        </motion.div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
  
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Performance Trends</h3>
          <div className="h-80 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Interactive Chart Coming Soon</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
};