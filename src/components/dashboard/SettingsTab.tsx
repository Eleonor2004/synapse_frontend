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
export default SettingsTab