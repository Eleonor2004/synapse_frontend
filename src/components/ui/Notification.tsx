'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// --- TYPE DEFINITIONS ---

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

// --- USE NOTIFICATIONS HOOK (No changes needed here, it's correct) ---

/**
 * A custom hook to manage and display toast notifications.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    duration: number = 30000 // Default duration 30 seconds
  ) => {
    const id = Date.now().toString() + Math.random();
    setNotifications(prev => [...prev, { id, type, title, message, duration }]);
    return id;
  }, []);

  return { notifications, addNotification, removeNotification };
}


// --- NOTIFICATION COMPONENT (The visual toast) ---

interface NotificationProps {
  notification: NotificationData;
  onClose: (id: string) => void;
}

function Notification({ notification, onClose }: NotificationProps) {
  const { id, type, title, message, duration = 30000 } = notification;

  // This useEffect handles the automatic dismissal.
  // It failed because the 'onClose' it received was not a function.
  useEffect(() => {
    // Ensure we have a valid duration and a function to call
    if (duration && typeof onClose === 'function') {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      
      // This cleanup is crucial: it clears the timer if the user closes the notification manually.
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const iconMap = {
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    error: <AlertCircle className="w-6 h-6 text-red-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    info: <Info className="w-6 h-6 text-blue-500" />,
  };

  const colorMap = {
    success: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300',
    error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8, transition: { duration: 0.3, ease: 'easeIn' } }}
      className={`relative w-full max-w-md p-4 overflow-hidden border rounded-2xl shadow-2xl backdrop-blur-xl ${colorMap[type]}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{iconMap[type]}</div>
        <div className="ml-4 w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            // This button failed for the same reason: 'onClose' was not a function.
            onClick={() => typeof onClose === 'function' && onClose(id)}
            className="inline-flex text-muted-foreground rounded-md hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-primary/50"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }} // Animate to 0% width
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}


// --- NOTIFICATION CONTAINER (Renders all active toasts) ---

interface NotificationContainerProps {
  notifications: NotificationData[];
  removeNotification: (id: string) => void;
}

/**
 * Renders a container for notifications in a fixed position on the screen.
 * Place this at the root of your layout.
 */
export function NotificationContainer({ notifications, removeNotification }: NotificationContainerProps) {
  return (
    // MODIFICATION: Increased z-index to a very high value to ensure it's on top.
    <div className="fixed top-0 right-0 p-4 sm:p-6 space-y-4 z-[99999]">
      <AnimatePresence>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            // CRITICAL FIX: Pass the 'removeNotification' function as the 'onClose' prop.
            // The error you saw means this was likely not being passed correctly from your page.
            onClose={removeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}