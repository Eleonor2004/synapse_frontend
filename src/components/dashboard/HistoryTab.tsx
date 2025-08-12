'use client';

import { motion, Variants } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Upload, User, Shield, AlertTriangle, List, Clock, Trash2, Edit, Eye, Loader2, ServerCrash
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getMyAnalyses, updateAnalysis, deleteAnalysis, getActivityHistory } from '../../services/historyService';
import { useNotifications } from '../../components/ui/Notification';
import { ListingSet, AuditEvent } from '../../types/api';
import { useState } from 'react';

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1
      }
    },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

// Helper to format time difference
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

// Helper to map action types to icons and text
const getActivityDetails = (event: AuditEvent) => {
  switch (event.action_type) {
    case 'LOGIN_SUCCESS':
      return { icon: User, text: `Successfully logged in from IP: ${event.details.client_ip}`, type: 'info' };
    case 'CREATE_ANALYSIS':
      return { icon: Upload, text: `Created new analysis: "${event.details.name}"`, type: 'success' };
    case 'DELETE_ANALYSIS':
      return { icon: Trash2, text: `Deleted analysis ID: ${event.details.analysis_id}`, type: 'warning' };
    case 'UPDATE_ANALYSIS':
      return { icon: Edit, text: `Updated analysis: "${event.details.new_name}"`, type: 'info' };
    default:
      return { icon: FileText, text: `Performed action: ${event.action_type}`, type: 'info' };
  }
};

// History Tab Component
export default function HistoryTab() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const locale = useLocale();
    const { addNotification } = useNotifications();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [newName, setNewName] = useState("");

    // --- DATA FETCHING ---
    const { data: analyses, isLoading: isLoadingAnalyses } = useQuery<ListingSet[]>({
      queryKey: ['myAnalyses'],
      queryFn: getMyAnalyses,
    });

    const { data: activities, isLoading: isLoadingActivities } = useQuery<AuditEvent[]>({
      queryKey: ['activityHistory'],
      queryFn: getActivityHistory,
    });

    // --- DATA MUTATIONS ---
    const deleteMutation = useMutation({
      mutationFn: deleteAnalysis,
      onSuccess: () => {
        addNotification('success', 'Analysis Deleted', 'The analysis and its data have been removed.');
        queryClient.invalidateQueries({ queryKey: ['myAnalyses'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardStats'] }); // Also update stats
      },
      onError: (error: any) => {
        addNotification('error', 'Delete Failed', error.response?.data?.detail || 'Could not delete the analysis.');
      }
    });

    const updateMutation = useMutation({
        mutationFn: updateAnalysis,
        onSuccess: () => {
            addNotification('success', 'Analysis Updated', 'The analysis has been renamed.');
            queryClient.invalidateQueries({ queryKey: ['myAnalyses'] });
            setIsEditing(null);
            setNewName("");
        },
        onError: (error: any) => {
            addNotification('error', 'Update Failed', error.response?.data?.detail || 'Could not update the analysis.');
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (analysis: ListingSet) => {
        setIsEditing(analysis.id);
        setNewName(analysis.name);
    };

    const handleSave = (id: string) => {
        if (newName.trim()) {
            updateMutation.mutate({ id, name: newName.trim() });
        }
    };

    const handleView = (analysis: ListingSet) => {
        // This would navigate to the workbench and set this as the selected analysis
        // This logic would typically live in a shared state (like Zustand or Context)
        // For now, we'll just log it and redirect.
        console.log("Viewing analysis:", analysis.id);
        router.push(`/${locale}/workbench`); // Navigate to workbench
    };

    const getTypeStyles = (type: string) => {
      switch (type) {
        case 'success': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600';
        case 'warning': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600';
        default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600';
      }
    };
  
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-12"
      >
        {/* Past Analyses Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            My Analyses
          </h2>
          <p className="text-gray-600 dark:text-gray-400">View, manage, and delete your past analysis projects.</p>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {isLoadingAnalyses && <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin" /></div>}
            {analyses && analyses.length === 0 && <p className="text-center text-gray-500">No analyses found.</p>}
            {analyses?.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                variants={itemVariants}
                className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="p-3 rounded-xl mr-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-grow">
                  {isEditing === analysis.id ? (
                    <input 
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="font-medium text-gray-900 dark:text-white bg-transparent border-b-2 border-primary focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">{analysis.name}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created: {new Date(analysis.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing === analysis.id ? (
                    <>
                      <button onClick={() => handleSave(analysis.id)} className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Save"}
                      </button>
                      <button onClick={() => setIsEditing(null)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleView(analysis)} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg" title="View Analysis"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(analysis)} className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded-lg" title="Rename Analysis"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(analysis.id)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg" title="Delete Analysis" disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending && deleteMutation.variables === analysis.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
  
        {/* Activity List Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Activity History
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Track your recent activities and system events</p>
        </motion.div>
  
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="space-y-4">
            {isLoadingActivities && <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin" /></div>}
            {activities && activities.length === 0 && <p className="text-center text-gray-500">No recent activity found.</p>}
            {activities?.map((activity) => {
              const details = getActivityDetails(activity);
              return (
                <motion.div
                  key={activity.id}
                  variants={itemVariants}
                  className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className={`p-3 rounded-xl mr-4 ${getTypeStyles(details.type)}`}>
                    <details.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-gray-900 dark:text-white">{details.text}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    );
};