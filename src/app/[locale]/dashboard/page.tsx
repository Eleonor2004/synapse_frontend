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

// Animation variants
const sidebarVariants = {
  expanded: {
    width: "280px",
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  collapsed: {
    width: "80px",
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const contentVariants = {
  expanded: {
    marginLeft: "280px",
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  collapsed: {
    marginLeft: "80px",
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const labelVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: 0.15
    }
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.15
    }
  }
};

const tabContentVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -30,
    scale: 0.95,
    transition: {
      duration: 0.3
    }
  }
};

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

// Profile Tab Component
const ProfileTab = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    role: 'Senior Data Analyst',
    department: 'Analytics',
    joinDate: 'January 2023'
  });

  const stats = [
    { label: 'Projects', value: '47', icon: Award, color: 'from-emerald-500 to-teal-500', bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20' },
    { label: 'Experience', value: '3.5Y', icon: Calendar, color: 'from-blue-500 to-indigo-500', bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' },
    { label: 'Team Rank', value: '#3', icon: TrendingUp, color: 'from-purple-500 to-pink-500', bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' },
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
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Profile Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your personal information and preferences</p>
        </div>
        
        <motion.button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            isEditing 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
          }`}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
            <div className="text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-6">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <User className="w-12 h-12 text-white" />
                </div>
                {isEditing && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 border-2 border-purple-500 rounded-full p-3 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera className="w-4 h-4 text-purple-600" />
                  </motion.button>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {profileData.name}
              </h3>
              <p className="text-purple-600 dark:text-purple-400 font-medium mb-6">
                {profileData.role}
              </p>

              {/* Quick Stats */}
              <div className="space-y-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: 0.3 + index * 0.1 }
                    }}
                    className={`${stat.bg} rounded-xl p-4 border border-gray-200 dark:border-gray-700`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                          <stat.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.label}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{stat.value}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-3"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4 text-purple-600" />
                  Full Name
                </label>
                <motion.input
                  type="text"
                  value={profileData.name}
                  disabled={!isEditing}
                  className={`w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 ${
                    isEditing 
                      ? 'focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white' 
                      : 'cursor-not-allowed text-gray-500 dark:text-gray-400'
                  }`}
                  whileFocus={{ scale: 1.02 }}
                />
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-purple-600" />
                  Email Address
                </label>
                <motion.input
                  type="email"
                  value={profileData.email}
                  disabled={!isEditing}
                  className={`w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 ${
                    isEditing 
                      ? 'focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white' 
                      : 'cursor-not-allowed text-gray-500 dark:text-gray-400'
                  }`}
                  whileFocus={{ scale: 1.02 }}
                />
              </div>

              {/* Phone */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-purple-600" />
                  Phone Number
                </label>
                <motion.input
                  type="tel"
                  value={profileData.phone}
                  disabled={!isEditing}
                  className={`w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 ${
                    isEditing 
                      ? 'focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white' 
                      : 'cursor-not-allowed text-gray-500 dark:text-gray-400'
                  }`}
                  whileFocus={{ scale: 1.02 }}
                />
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  Location
                </label>
                <motion.input
                  type="text"
                  value={profileData.location}
                  disabled={!isEditing}
                  className={`w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 ${
                    isEditing 
                      ? 'focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white' 
                      : 'cursor-not-allowed text-gray-500 dark:text-gray-400'
                  }`}
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 pt-8"
              >
                <motion.button
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </motion.button>

                <motion.button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                  Cancel
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
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

// History Tab Component
const HistoryTab = () => {
  const activities = [
    { icon: FileText, text: 'Data analysis completed for Q4 report', time: '2 hours ago', type: 'success' },
    { icon: Upload, text: 'Uploaded new dataset: customer_data.csv', time: '5 hours ago', type: 'info' },
    { icon: User, text: 'Profile updated successfully', time: '1 day ago', type: 'info' },
    { icon: Shield, text: 'Security scan completed', time: '2 days ago', type: 'success' },
    { icon: AlertTriangle, text: 'Data processing warning resolved', time: '3 days ago', type: 'warning' },
  ];

  const getTypeStyles = (type) => {
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

// Settings Tab Component
const SettingsTab = () => {
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);

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
          Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Customize your experience and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Settings */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Theme Preferences</h3>
          <div className="space-y-4">
            {[
              { value: 'light', label: 'Light Mode', icon: Sun },
              { value: 'dark', label: 'Dark Mode', icon: Moon },
              { value: 'system', label: 'System Default', icon: Laptop }
            ].map((option) => (
              <motion.button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                  theme === option.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`p-3 rounded-lg ${
                  theme === option.value
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <option.icon className="w-5 h-5" />
                </div>
                <span className={`font-medium ${
                  theme === option.value
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {option.label}
                </span>
                {theme === option.value && (
                  <div className="ml-auto">
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Language Settings */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Language & Region</h3>
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Globe className="w-4 h-4 text-purple-600" />
                Display Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Bell className="w-4 h-4 text-purple-600" />
                Notifications
              </label>
              <motion.button
                onClick={() => setNotifications(!notifications)}
                className={`flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                  notifications
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className={`font-medium ${
                  notifications
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Enable Push Notifications
                </span>
                                  <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  notifications ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 mt-0.5 ${
                    notifications ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
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

// User Management Tab Component
const UserManagementTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const users = [
    { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Admin', status: 'Active', avatar: 'JD' },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@company.com', role: 'Analyst', status: 'Active', avatar: 'SW' },
    { id: 3, name: 'Mike Johnson', email: 'mike@company.com', role: 'Viewer', status: 'Inactive', avatar: 'MJ' },
    { id: 4, name: 'Lisa Chen', email: 'lisa@company.com', role: 'Analyst', status: 'Active', avatar: 'LC' }
  ];

  const getStatusColor = (status) => {
    return status === 'Active' 
      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'Analyst':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
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
            User Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Manage team members and their permissions</p>
        </div>
        
        <motion.button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Add User
        </motion.button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 dark:text-white"
            />
          </div>
          <motion.button
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-5 h-5" />
            Filter
          </motion.button>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <motion.button
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Dashboard Component
export default function EnhancedDashboard() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isAdmin] = useState(true);

  const tabs = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User, 
      content: <ProfileTab /> 
    },
    { 
      id: 'statistics', 
      label: 'Statistics', 
      icon: BarChart3, 
      content: <StatisticsTab /> 
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: Clock, 
      content: <HistoryTab /> 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      content: <NotificationsTab />,
      notification: 3
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      content: <SettingsTab /> 
    },
    { 
      id: 'userManagement', 
      label: 'User Management', 
      icon: Users, 
      content: <UserManagementTab />, 
      adminOnly: true 
    },
  ];

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isExpanded ? "expanded" : "collapsed"}
        className="fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 shadow-2xl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  variants={labelVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isExpanded ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {visibleTabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group relative ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    whileHover={{ x: 4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: index * 0.1 }
                    }}
                  >
                    <Icon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          variants={labelVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          className="flex items-center justify-between flex-1 min-w-0"
                        >
                          <span className="font-semibold truncate">{tab.label}</span>
                          {tab.notification && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                              {tab.notification}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Notification dot for collapsed state */}
                    {!isExpanded && tab.notification && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {tab.notification}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <User className="w-5 h-5 text-white" />
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    variants={labelVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Alex Johnson</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">alex@company.com</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <motion.main
        variants={contentVariants}
        animate={isExpanded ? "expanded" : "collapsed"}
        className="flex-1 min-h-screen"
      >
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-6 mb-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                {activeTabData && <activeTabData.icon className="w-8 h-8 text-white" />}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {activeTabData?.label}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Welcome back! Here's what's happening today.
                </p>
              </div>
            </motion.div>

            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
            >
              <Home className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" />
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-purple-600 dark:text-purple-400 font-semibold">{activeTabData?.label}</span>
            </motion.div>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {activeTabData?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}