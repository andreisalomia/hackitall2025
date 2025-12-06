import React from 'react';
import { useTaskNotifications } from './useTaskNotifications';
import TaskNotification from './TaskNotification';

/**
 * Container pentru afișarea notificărilor de taskuri
 * Trebuie adăugat la nivelul principal al aplicației (în App.jsx sau TapeRecorder.jsx)
 */
const TaskNotificationsContainer = () => {
  const { activeNotifications, dismissNotification } = useTaskNotifications();

  return (
    <>
      {activeNotifications.map((task) => (
        <TaskNotification
          key={task._id}
          task={task}
          onDismiss={() => dismissNotification(task._id)}
        />
      ))}
    </>
  );
};

export default TaskNotificationsContainer;