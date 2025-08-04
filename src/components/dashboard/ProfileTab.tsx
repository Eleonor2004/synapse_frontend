'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  export default ProfileTab;