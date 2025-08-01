import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Shield,
  BarChart3,
  Trophy,
  Star,
  Activity,
  Zap
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

export const ProfileTab = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Analyst User',
    email: 'analyst@synapse.app',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    role: 'Senior Data Analyst',
    joinDate: 'January 2023',
    bio: 'Passionate data analyst with expertise in machine learning and statistical modeling.'
  });

  const [tempData, setTempData] = useState(profileData);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSave = () => {
    // Simulate save animation
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setProfileData(tempData);
          setIsEditing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const stats = [
    { label: 'Projects Completed', value: '47', icon: Trophy, color: 'from-yellow-400 to-orange-500', bgColor: 'from-yellow-500/10 to-orange-500/10' },
    { label: 'Years Active', value: '2.5', icon: Calendar, color: 'from-blue-400 to-purple-500', bgColor: 'from-blue-500/10 to-purple-500/10' },
    { label: 'Team Rating', value: '4.9', icon: Star, color: 'from-green-400 to-teal-500', bgColor: 'from-green-500/10 to-teal-500/10' },
    { label: 'Active Projects', value: '8', icon: Activity, color: 'from-pink-400 to-red-500', bgColor: 'from-pink-500/10 to-red-500/10' },
  ];

  const achievements = [
    { title: 'Data Wizard', description: 'Completed 50+ analyses', icon: Zap, color: 'text-yellow-500' },
    { title: 'Team Player', description: 'Collaborated on 25+ projects', icon: Shield, color: 'text-blue-500' },
    { title: 'Innovation Leader', description: 'Introduced 3 new methodologies', icon: Trophy, color: 'text-purple-500' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header with Action Button */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold brand-gradient-text mb-2">Profile Overview</h2>
          <p className="text-muted-foreground text-lg">Manage your personal information and preferences.</p>
        </div>
        
        <motion.button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
            isEditing 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30'
              : 'bg-gradient-primary text-white shadow-primary hover:shadow-xl hover:scale-105'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isEditing ? (
            <>
              <X className="w-5 h-5" />
              Cancel Changes
            </>
          ) : (
            <>
              <Edit3 className="w-5 h-5" />
              Edit Profile
            </>
          )}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Profile Summary Card */}
        <motion.div
          variants={itemVariants}
          className="xl:col-span-1"
        >
          <div className="glass-card hover-lift h-fit sticky top-8">
            <div className="text-center">
              {/* Avatar with Upload */}
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-2xl shadow-primary/30 relative overflow-hidden">
                  <User className="w-16 h-16 text-white" />
                  {/* Animated ring */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl border-4 border-white/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                {isEditing && (
                  <motion.button
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -bottom-2 -right-2 bg-accent border-2 border-primary rounded-2xl p-3 hover:bg-primary hover:text-white transition-all duration-200 shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera className="w-5 h-5" />
                  </motion.button>
                )}
              </div>

              {/* User Info */}
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {profileData.name}
              </h3>
              <p className="text-muted-foreground mb-2">
                {profileData.role}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                <MapPin className="w-4 h-4" />
                {profileData.location}
              </div>

              {/* Bio */}
              <div className="text-left bg-accent/20 rounded-2xl p-4 mb-6">
                <h4 className="font-semibold text-foreground mb-2">About</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profileData.bio}
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { delay: 0.4 + index * 0.1 }
                    }}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bgColor} border border-white/10 text-center hover-lift`}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          variants={itemVariants}
          className="xl:col-span-3 space-y-8"
        >
          {/* Personal Information Form */}
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Full Name */}
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.01 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className="w-4 h-4 text-primary" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.name : profileData.name}
                    onChange={(e) => setTempData({...tempData, name: e.target.value})}
                    disabled={!isEditing}
                    className={`input-modern ${isEditing ? 'ring-2 ring-primary/20' : 'opacity-70'}`}
                  />
                </motion.div>

                {/* Email */}
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.01 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Mail className="w-4 h-4 text-primary" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={isEditing ? tempData.email : profileData.email}
                    onChange={(e) => setTempData({...tempData, email: e.target.value})}
                    disabled={!isEditing}
                    className={`input-modern ${isEditing ? 'ring-2 ring-primary/20' : 'opacity-70'}`}
                  />
                </motion.div>

                {/* Phone */}
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.01 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? tempData.phone : profileData.phone}
                    onChange={(e) => setTempData({...tempData, phone: e.target.value})}
                    disabled={!isEditing}
                    className={`input-modern ${isEditing ? 'ring-2 ring-primary/20' : 'opacity-70'}`}
                  />
                </motion.div>

                {/* Location */}
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.01 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.location : profileData.location}
                    onChange={(e) => setTempData({...tempData, location: e.target.value})}
                    disabled={!isEditing}
                    className={`input-modern ${isEditing ? 'ring-2 ring-primary/20' : 'opacity-70'}`}
                  />
                </motion.div>
              </div>

              {/* Role and Bio */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.01 }}
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Badge className="w-4 h-4 text-primary" />
                    Role
                  </label>
                  <input
                    type="text"
                    value={isEditing ? tempData.role : profileData.role}
                    onChange={(e) => setTempData({...tempData, role: e.target.value})}
                    disabled={!isEditing}
                    className={`input-modern ${isEditing ? 'ring-2 ring-primary/20' : 'opacity-70'}`}
                  />
                </motion.div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    Member Since
                  </label>
                  <div className="input-modern bg-muted/50 text-muted-foreground cursor-not-allowed">
                    {profileData.joinDate}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <motion.div 
                className="space-y-2"
                whileHover={{ scale: 1.01 }}
              >
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Edit3 className="w-4 h-4 text-primary" />
                  Bio
                </label>
                <textarea
                  value={isEditing ? tempData.bio : profileData.bio}
                  onChange={(e) => setTempData({...tempData, bio: e.target.value})}
                  disabled={!isEditing}
                  rows={3}
                  className={`input-modern resize-none ${isEditing ? 'ring-2 ring-primary/20' : 'opacity-70'}`}
                />
              </motion.div>

              {/* Action Buttons */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex gap-4 pt-6 border-t border-border/50"
                  >
                    <motion.button
                      type="button"
                      onClick={handleSave}
                      className="btn-primary flex-1 relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        Save Changes
                      </div>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <motion.div
                          className="absolute bottom-0 left-0 h-1 bg-white/30"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={handleCancel}
                      className="btn-ghost"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Achievements</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.6 + index * 0.1 }
                  }}
                  className="relative p-6 rounded-2xl bg-gradient-to-br from-card/50 to-accent/20 border border-border/30 hover-lift group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-background to-accent flex items-center justify-center shadow-lg`}>
                      <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  
                  {/* Sparkle effect */}
                  <motion.div
                    className="absolute top-2 right-2"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    <Star className="w-4 h-4 text-yellow-400 opacity-60" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};