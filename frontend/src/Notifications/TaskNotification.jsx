import React, { useEffect, useState } from 'react';
import './TaskNotification.css';

const TaskNotification = ({ task, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animație de intrare
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(), 300); // Așteaptă animația de ieșire
  };

  const handleMarkComplete = async () => {
    try {
      // Marcăm taskul ca done
      await fetch(`http://localhost:5000/todos/${task._id}/complete`, {
        method: 'PUT'
      });
      
      // Dispare notificarea
      handleDismiss();
      
      // Notifică TodoList să se reîncarce (dacă e deschis)
      window.dispatchEvent(new Event('todoAdded'));
    } catch (error) {
      console.error('Eroare la marcarea taskului:', error);
    }
  };

  const getPrioritySymbol = (priority) => {
    switch(priority) {
      case 'ridicata': return '⚠⚠⚠';
      case 'medie': return '◆◆';
      case 'scazuta': return '○';
      default: return '◆';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'ridicata': return 'priority-high';
      case 'medie': return 'priority-medium';
      case 'scazuta': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'ACUM';
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`task-notification-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`task-notification ${getPriorityClass(task.priority)} ${isVisible ? 'slide-in' : ''}`}>
        {/* Header cu efect terminal */}
        <div className="notification-header">
          <div className="header-left">
            <span className="blink-fast">█</span>
            <span className="header-text">SYSTEM ALERT</span>
            <span className="blink-fast">█</span>
          </div>
          <button className="dismiss-btn" onClick={handleDismiss}>
            [ESC]
          </button>
        </div>

        {/* Border animat */}
        <div className="notification-border-top"></div>

        {/* Conținut principal */}
        <div className="notification-body">
          {/* Simbol prioritate mare */}
          <div className="priority-icon">
            <div className="pulse-ring"></div>
            <div className="priority-symbol-large">
              {getPrioritySymbol(task.priority)}
            </div>
          </div>

          {/* Informații task */}
          <div className="task-info">
            <div className="info-label">TASK PRIORITATE {task.priority?.toUpperCase() || 'MEDIE'}</div>
            <div className="task-title">{task.task}</div>
            
            <div className="task-metadata">
              <div className="meta-row">
                <span className="meta-label">&gt; CATEGORIE:</span>
                <span className="meta-value">[{task.category || 'GENERAL'}]</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">&gt; DEADLINE:</span>
                <span className="meta-value">{formatDateTime(task.due_datetime)}</span>
              </div>
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="meta-row">
                  <span className="meta-label">&gt; SUBTASKS:</span>
                  <span className="meta-value">{task.subtasks.length} ITEM(S)</span>
                </div>
              )}
            </div>

            {/* Subtasks dacă există */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="subtasks-preview">
                {task.subtasks.slice(0, 3).map((subtask, idx) => (
                  <div key={idx} className="subtask-line">
                    <span className="subtask-bullet">└─&gt;</span> {subtask}
                  </div>
                ))}
                {task.subtasks.length > 3 && (
                  <div className="subtask-line more">
                    ... +{task.subtasks.length - 3} mai multe
                  </div>
                )}
              </div>
            )}

            {/* Buton MARCARE DONE - mare și vizibil */}
            <button className="mark-done-btn" onClick={handleMarkComplete}>
              <span className="done-icon">✓</span>
              <span className="done-text">AM TERMINAT TASKUL</span>
            </button>
          </div>
        </div>

        {/* Footer cu instrucțiuni */}
        <div className="notification-footer">
          <div className="footer-text">
            <span className="blink">▶</span> CLICK [AM TERMINAT] SAU [ESC] PENTRU ÎNCHIDERE
          </div>
        </div>

        {/* Border animat jos */}
        <div className="notification-border-bottom"></div>

        {/* Efecte vizuale */}
        <div className="scan-line"></div>
        <div className="noise"></div>
      </div>
    </div>
  );
};

export default TaskNotification;