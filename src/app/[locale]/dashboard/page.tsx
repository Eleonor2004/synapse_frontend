// src/app/[locale]/dashboard/page.tsx

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
} from 'lucide-react';

import ProfileTab from '../../../components/dashboard/ProfileTab';
import StatisticsTab from '../../../components/dashboard/StatisticsTab';
import HistoryTab from '../../../components/dashboard/HistoryTab';
import NotificationsTab from '../../../components/dashboard/NotificationsTab';
import SettingsTab from '../../../components/dashboard/SettingsTab';
import UserManagementTab from '../../../components/dashboard/UserManagementTab';

const sidebarVariants = {
  expanded: { width: "280px", transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  collapsed: { width: "80px", transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
};

const labelVariants = {
  expanded: { opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.15 } },
  collapsed: { opacity: 0, x: -10, transition: { duration: 0.15 } }
};

const tabContentVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -30, scale: 0.95, transition: { duration: 0.3 } }
};

export default function EnhancedDashboard() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isAdmin] = useState(true);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, content: <ProfileTab /> },
    { id: 'statistics', label: 'Statistics', icon: BarChart3, content: <StatisticsTab /> },
    { id: 'history', label: 'History', icon: Clock, content: <HistoryTab /> },
    { id: 'notifications', label: 'Notifications', icon: Bell, content: <NotificationsTab />, notification: 3 },
    { id: 'settings', label: 'Settings', icon: Settings, content: <SettingsTab /> },
    { id: 'userManagement', label: 'User Management', icon: Users, content: <UserManagementTab />, adminOnly: true },
  ];

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="flex h-full w-full bg-gray-50 dark:bg-gray-950">
      <motion.aside
        variants={sidebarVariants}
        animate={isExpanded ? "expanded" : "collapsed"}
        className="flex-shrink-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 h-16 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
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
              {isExpanded ? <X className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            </motion.button>
          </div>

          <nav className="flex-1 p-6 overflow-y-auto">
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
                    animate={{ opacity: 1, x: 0, transition: { delay: index * 0.1 } }}
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
                    {!isExpanded && tab.notification && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
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
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
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
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{activeTabData?.label}</h1>
                {/* FIX: Replaced ' with ' */}
                <p className="text-gray-600 dark:text-gray-400 text-lg">Welcome back! </p>
              </div>
            </motion.div>

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
      </main>
    </div>
  );
}