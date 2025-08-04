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
// Statistics Tab Component
const StatisticsTab = () => {
    const stats = [
      { label: 'Total Analyses', value: '2,847', change: '+12%', icon: BarChart3, color: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20' },
      { label: 'Data Processed', value: '4.2TB', change: '+8%', icon: Activity, color: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20' },
      { label: 'Success Rate', value: '99.2%', change: '+0.5%', icon: TrendingUp, color: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' },
      { label: 'Active Projects', value: '18', change: '+3', icon: FileText, color: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20' }
    ];
  
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
            Analytics Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Track your performance and key metrics</p>
        </motion.div>
  
        {/* Stats Grid */}
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
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
  
        {/* Chart Placeholder */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
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

  export default StatisticsTab;