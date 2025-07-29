// src/components/ui/Notification.tsx
"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Notification({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Auto-close timer
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
      case "error":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
      case "warning":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950";
      case "info":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]
        transition-all duration-300 ease-in-out
        ${isVisible && !isExiting 
          ? "transform translate-x-0 opacity-100" 
          : "transform translate-x-full opacity-0"
        }
      `}
    >
      <div
        className={`
          rounded-lg border shadow-lg backdrop-blur-sm p-4
          ${getColorClasses()}
          hover:shadow-xl transition-shadow duration-200
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {title}
            </h4>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 text-muted-foreground hover:text-foreground transition-colors duration-200"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-primary/30 rounded-b-lg"
          style={{
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

// Notification Container Component
export function NotificationContainer({ 
  notifications 
}: { 
  notifications: NotificationProps[] 
}) {
  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col space-y-2 p-4">
        {notifications.map((notification, index) => (
          <div 
            key={notification.id}
            className="pointer-events-auto"
            style={{ 
              marginTop: `${index * 10}px`,
              zIndex: 1000 - index 
            }}
          >
            <Notification {...notification} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = (
    type: NotificationType,
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = Date.now().toString();
    const notification: NotificationProps = {
      id,
      type,
      title,
      message,
      duration,
      onClose: removeNotification
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
}