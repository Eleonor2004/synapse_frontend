'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
  Sparkles
} from 'lucide-react';
import { ProfileTab } from '../../../components/dashboard/ProfileTab';
import { SettingsTab } from '../../../components/dashboard/SettingsTab';
import { HistoryTab } from '../../../components/dashboard/HistoryTab';
import { StatisticsTab } from '../../../components/dashboard/StatisticsTab';
import { NotificationsTab } from '../../../components/dashboard/NotificationsTab';
import { UserManagementTab } from '../../../components/dashboard/UserManagementTab';

const sidebarVariants = {
  expanded: {
    width: "280px",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  collapsed: {
    width: "80px",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const contentVariants = {
  expanded: {
    marginLeft: "280px",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  collapsed: {
    marginLeft: "80px",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const labelVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      delay: 0.1
    }
  },
  collapsed: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.1
    }
  }
};

const tabContentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  adminOnly?: boolean;
  notification?: number;
}

export default function EnhancedDashboard() {
  const t = useTranslations('Dashboard');
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isAdmin] = useState(true); // This would come from your auth context

  const tabs: TabItem[] = [
    { 
      id: 'profile', 
      label: t('tabs.profile'), 
      icon: User, 
      content: <ProfileTab /> 
    },
    { 
      id: 'statistics', 
      label: t('tabs.statistics'), 
      icon: BarChart3, 
      content: <StatisticsTab /> 
    },
    { 
      id: 'history', 
      label: t('tabs.history'), 
      icon: Clock, 
      content: <HistoryTab /> 
    },
    { 
      id: 'notifications', 
      label: t('tabs.notifications'), 
      icon: Bell, 
      content: <NotificationsTab />,
      notification: 3
    },
    { 
      id: 'settings', 
      label: t('tabs.settings'), 
      icon: Settings, 
      content: <SettingsTab /> 
    },
    { 
      id: 'userManagement', 
      label: t('tabs.userManagement'), 
      icon: Users, 
      content: <UserManagementTab />, 
      adminOnly: true 
    },
  ];

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isExpanded ? "expanded" : "collapsed"}
        className="fixed left-0 top-0 h-full bg-card border-r border-border z-40 shadow-lg"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  variants={labelVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-accent transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isExpanded ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-muted-foreground" />
              )}
            </motion.button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {visibleTabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-gradient-primary text-white shadow-primary' 
                        : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: index * 0.1 }
                    }}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          variants={labelVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          className="flex items-center justify-between flex-1 min-w-0"
                        >
                          <span className="font-medium truncate">{tab.label}</span>
                          {tab.notification && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {tab.notification}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}

                    {/* Notification dot for collapsed state */}
                    {!isExpanded && tab.notification && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {tab.notification}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
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
                    <p className="text-sm font-medium text-foreground truncate">John Doe</p>
                    <p className="text-xs text-muted-foreground truncate">john@example.com</p>
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
              className="flex items-center gap-4 mb-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
                {activeTabData && <activeTabData.icon className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {activeTabData?.label}
                </h1>
                <p className="text-muted-foreground">
                  Welcome back! Here's what's happening today.
                </p>
              </div>
            </motion.div>

            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Home className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" />
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{activeTabData?.label}</span>
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
              className="bg-card border border-border rounded-2xl p-8 shadow-lg"
            >
              {activeTabData?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}