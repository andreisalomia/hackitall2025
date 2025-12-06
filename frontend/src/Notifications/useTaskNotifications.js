import { useState, useEffect } from 'react';
import notificationService from './NotificationService';

/**
 * Hook React pentru managementul notificărilor de taskuri
 * Returnează lista de notificări active și funcții pentru gestionarea lor
 */
export const useTaskNotifications = () => {
  const [activeNotifications, setActiveNotifications] = useState([]);

  useEffect(() => {
    // Handler pentru evenimente de notificare
    const handleNotificationEvent = (event) => {
      if (event.type === 'show') {
        setActiveNotifications(prev => {
          // Verifică dacă notificarea există deja
          if (prev.some(n => n._id === event.task._id)) {
            return prev;
          }
          return [...prev, event.task];
        });
      } else if (event.type === 'dismiss') {
        setActiveNotifications(prev => 
          prev.filter(n => n._id !== event.taskId)
        );
      }
    };

    // Înregistrează listener-ul
    const unsubscribe = notificationService.addListener(handleNotificationEvent);

    // Pornește verificarea automată (la fiecare 1 minut)
    notificationService.startChecking(1);

    // Cleanup la unmount - IMPORTANT pentru a opri toate interval-urile
    return () => {
      unsubscribe();
      notificationService.destroy(); // Oprește TOT (verificare + repeat sounds)
    };
  }, []);

  // Funcție pentru închiderea manuală a unei notificări
  const dismissNotification = (taskId) => {
    notificationService.dismissNotification(taskId);
  };

  // Funcție pentru test manual
  const testNotification = (task) => {
    notificationService.testNotification(task);
  };

  return {
    activeNotifications,
    dismissNotification,
    testNotification
  };
};