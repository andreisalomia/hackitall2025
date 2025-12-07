import { useState, useEffect } from 'react';
import notificationService from './NotificationService';

export const useTaskNotifications = () => {
  const [activeNotifications, setActiveNotifications] = useState([]);

  useEffect(() => {
    const handleNotificationEvent = (event) => {
      if (event.type === 'show') {
        setActiveNotifications(prev => {
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

    const unsubscribe = notificationService.addListener(handleNotificationEvent);

    notificationService.startChecking(1);

    return () => {
      unsubscribe();
      notificationService.destroy();
    };
  }, []);

  const dismissNotification = (taskId) => {
    notificationService.dismissNotification(taskId);
  };

  const testNotification = (task) => {
    notificationService.testNotification(task);
  };

  return {
    activeNotifications,
    dismissNotification,
    testNotification
  };
};