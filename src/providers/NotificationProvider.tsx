// src/providers/NotificationProvider.tsx

'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { NotificationContainer, NotificationData, NotificationType } from '../components/ui/Notification'; // We will create this next

// --- CONTEXT DEFINITION ---
interface NotificationContextType {
  addNotification: (type: NotificationType, title: string, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// --- PROVIDER COMPONENT (THIS IS THE EXPORT THAT WAS MISSING) ---
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    duration: number = 30000
  ) => {
    const id = Date.now().toString() + Math.random();
    setNotifications(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
    </NotificationContext.Provider>
  );
}

// --- CUSTOM HOOK (ALSO EXPORTED) ---
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}