'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Save, 
  Edit3,
  Check,
  X,
  Upload,
  Badge,
  Calendar,
  Shield
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const cardVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export const ProfileTab = () => {
  const t = useTranslations('Dashboard.Profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Analyst User',
    email: 'analyst@synapse.app',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    role: 'Senior Data Analyst',
    joinDate: 'January 2023'
  });

  const [tempData, setTempData] = useState(profileData);

  const handleSave = () => {
    setProfileData(tempData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const stats = [
    { label: 'Projects Completed', value: '47', icon: Badge, color: 'text-green-500' },
    { label: 'Years Active', value: '2.5', icon: Calendar, color: 'text-blue-500' },
    { label: 'Team Size', value: '12', icon: Shield, color: 'text-purple-500' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('title')}</h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        
        <motion.button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isEditing 
              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
              : 'bg-gradient-primary text-white hover:scale-105 shadow-primary'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </>
          )}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-1"
        >
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            initial="rest"
            className="bg-gradient-secondary rounded-2xl p-6 border border-border/50 glass-effect"
          >
            <div className="text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-primary">
                  <User className="w-10 h-10 text-white" />
                </div>
                {isEditing && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-2 -right-2 bg-accent border border-border rounded-full p-2 hover:bg-accent/80 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera className="w-4 h-4 text-foreground" />
                  </motion.button>
                )}
              </div>

              {/* Name and Role */}
              <h3 className="text-xl font-bold text-foreground mb-1">
                {profileData.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {profileData.role}
              </p>

              {/* Quick Stats */}
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: 0.3 + index * 0.1 }
                    }}
                    className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/30"
                  >
                    <div className="flex items-center gap-3">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-foreground">{stat.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2"
        >
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="w-4 h-4 text-primary" />
                    {t('nameLabel')}
                  </label>
                  <motion.input
                    type="text"
                    value={isEditing ? tempData.name : profileData.name}
                    onChange={(e) => setTempData({...tempData, name: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-input border border-border rounded-lg transition-all duration-200 ${
                      isEditing 
                        ? 'focus:ring-2 focus:ring-primary focus:border-primary' 
                        : 'cursor-not-allowed opacity-70'
                    }`}
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Mail className="w-4 h-4 text-primary" />
                    {t('emailLabel')}
                  </label>
                  <motion.input
                    type="email"
                    value={isEditing ? tempData.email : profileData.email}
                    onChange={(e) => setTempData({...tempData, email: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-input border border-border rounded-lg transition-all duration-200 ${
                      isEditing 
                        ? 'focus:ring-2 focus:ring-primary focus:border-primary' 
                        : 'cursor-not-allowed opacity-70'
                    }`}
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    Phone Number
                  </label>
                  <motion.input
                    type="tel"
                    value={isEditing ? tempData.phone : profileData.phone}
                    onChange={(e) => setTempData({...tempData, phone: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-input border border-border rounded-lg transition-all duration-200 ${
                      isEditing 
                        ? 'focus:ring-2 focus:ring-primary focus:border-primary' 
                        : 'cursor-not-allowed opacity-70'
                    }`}
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    Location
                  </label>
                  <motion.input
                    type="text"
                    value={isEditing ? tempData.location : profileData.location}
                    onChange={(e) => setTempData({...tempData, location: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-input border border-border rounded-lg transition-all duration-200 ${
                      isEditing 
                        ? 'focus:ring-2 focus:ring-primary focus:border-primary' 
                        : 'cursor-not-allowed opacity-70'
                    }`}
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </div>

              {/* Role and Join Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Badge className="w-4 h-4 text-primary" />
                    Role
                  </label>
                  <motion.input
                    type="text"
                    value={isEditing ? tempData.role : profileData.role}
                    onChange={(e) => setTempData({...tempData, role: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-input border border-border rounded-lg transition-all duration-200 ${
                      isEditing 
                        ? 'focus:ring-2 focus:ring-primary focus:border-primary' 
                        : 'cursor-not-allowed opacity-70'
                    }`}
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    Member Since
                  </label>
                  <div className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed">
                    {profileData.joinDate}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 pt-4"
                >
                  <motion.button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white font-semibold rounded-lg shadow-primary hover:scale-105 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check className="w-4 h-4" />
                    {t('saveButton')}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg border border-border hover:bg-accent transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>
      </div>

      {/* Additional Information Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Activity Summary */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-200/20 dark:border-blue-800/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <h3 className="font-semibold text-foreground">Activity</h3>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">95%</p>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
        </motion.div>

        {/* Performance */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200/20 dark:border-green-800/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-500" />
            <h3 className="font-semibold text-foreground">Performance</h3>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">Excellent</p>
          <p className="text-sm text-muted-foreground">Current Rating</p>
        </motion.div>

        {/* Storage */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-200/20 dark:border-orange-800/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-orange-500" />
            <h3 className="font-semibold text-foreground">Storage</h3>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">2.4 GB</p>
          <p className="text-sm text-muted-foreground">of 10 GB used</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};