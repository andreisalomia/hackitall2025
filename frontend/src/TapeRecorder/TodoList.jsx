import React, { useState, useEffect } from 'react';
import './TodoList.css';
import notificationService from '../Notifications/NotificationService';

const TodoList = ({ onClose }) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [undoTimeout, setUndoTimeout] = useState(null);

  const loadTodos = async () => {
    try {
      const response = await fetch('http://localhost:5000/todos/active');
      const data = await response.json();
      
      if (data.success) {
        const priorityOrder = { 'ridicata': 1, 'medie': 2, 'scazuta': 3 };
        const sorted = data.todos.sort((a, b) => {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        setTodos(sorted);
      }
      setLoading(false);
    } catch (error) {
      console.error('Eroare la incarcarea TODO-urilor:', error);
      setLoading(false);
    }
  };

  const markAsDone = async (todoId, todoTask) => {
    setPendingDelete({ id: todoId, task: todoTask });
    
    const todoToDelete = todos.find(t => t._id === todoId);
    
    try {
      await fetch(`http://localhost:5000/todos/${todoId}/complete`, {
        method: 'PUT'
      });

      window.dispatchEvent(new Event('todoCompleted'));
    } catch (error) {
      console.error('Eroare:', error);
    }
    
    setTodos(prevTodos => prevTodos.filter(todo => todo._id !== todoId));
    
    const timeout = setTimeout(() => {
      setPendingDelete(null);
    }, 5000);
    
    setUndoTimeout(timeout);
  };

  // Functie pentru UNDO
  const undoDelete = async () => {
    if (!pendingDelete) return;
    
    // Oprim timeout-ul
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setUndoTimeout(null);
    }
    
    try {
      const response = await fetch(`http://localhost:5000/todos/${pendingDelete.id}/uncomplete`, {
        method: 'PUT'
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.dispatchEvent(new Event('todoCompleted'));
        
        await loadTodos();
        
        notificationService.show({
          type: 'info',
          title: 'Actiune anulata',
          message: `Task-ul "${pendingDelete.task}" a fost restaurat`,
          duration: 3000
        });
      } else {
        throw new Error(data.error || 'Eroare la restaurarea task-ului');
      }
      
    } catch (error) {
      console.error('Eroare la undo:', error);
      
      // Notificare de eroare
      notificationService.show({
        type: 'error',
        title: 'Eroare',
        message: `Nu s-a putut restaura task-ul: ${error.message}`,
        duration: 4000
      });
    } finally {
      // Curatam starea pending delete
      setPendingDelete(null);
    }
  };

  // Functie pentru testarea notificarii
  const testNotification = (todo) => {
    console.log('Test notificare pentru:', todo);
    notificationService.testNotification(todo);
  };

  // Incarcam TODO-urile la mount
  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    return () => {
      if (undoTimeout) {
        clearTimeout(undoTimeout);
      }
    };
  }, [undoTimeout]);

  useEffect(() => {
    const handleTodoAdded = () => {
      loadTodos();
    };
    
    window.addEventListener('todoAdded', handleTodoAdded);
    
    return () => {
      window.removeEventListener('todoAdded', handleTodoAdded);
    };
  }, []);

  // Functie pentru formatarea datei
  const formatDate = (dateString) => {
    if (!dateString) return 'Fara deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Functie pentru determinarea clasei de prioritate
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'ridicata': return 'priority-high';
      case 'medie': return 'priority-medium';
      case 'scazuta': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  // Functie pentru simbolul de prioritate
  const getPrioritySymbol = (priority) => {
    switch(priority) {
      case 'ridicata': return '⚠';
      case 'medie': return '◆';
      case 'scazuta': return '○';
      default: return '◆';
    }
  };

  if (loading) {
    return (
      <div className="todo-panel">
        <div className="todo-header">
          <span className="blink">▶</span> LOADING TODO LIST...
          <button className="close-todo-btn" onClick={onClose}>✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="todo-panel">
      <div className="todo-header">
        <span className="terminal-prompt">&gt;</span> ACTIVE TASKS [{todos.length}]
        <button className="close-todo-btn" onClick={onClose}>✕</button>
      </div>
      
      {/* UNDO NOTIFICATION */}
      {pendingDelete && (
        <div className="undo-notification">
          <div className="undo-content">
            <span className="undo-icon">⚠</span>
            <span className="undo-text">Task marcat ca efectuat!</span>
            <button className="undo-btn" onClick={undoDelete}>
              ↶ UNDO
            </button>
          </div>
          <div className="undo-progress"></div>
        </div>
      )}
      
      <div className="todo-list">
        {todos.length === 0 ? (
          <div className="no-todos">
            <div className="blink">█</div>
            <p>NO ACTIVE TASKS</p>
            <p className="subtitle">ALL CLEAR ✓</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div key={todo._id} className={`todo-item ${getPriorityClass(todo.priority)}`}>
              <div className="todo-checkbox-container">
                <label className="matrix-checkbox">
                  <input 
                    type="checkbox" 
                    onChange={() => markAsDone(todo._id, todo.task)}
                  />
                  <span className="checkmark"></span>
                </label>
              </div>
              
              <div className="todo-content">
                <div className="todo-task">
                  <span className="priority-symbol">{getPrioritySymbol(todo.priority)}</span>
                  <span className="task-text">{todo.task}</span>
                </div>
                
                <div className="todo-meta">
                  <span className="todo-category">[{todo.category}]</span>
                  <span className="todo-deadline">{formatDate(todo.due_datetime)}</span>
                </div>
                
                {todo.subtasks && todo.subtasks.length > 0 && (
                  <div className="todo-subtasks">
                    {todo.subtasks.map((subtask, idx) => (
                      <div key={idx} className="subtask">
                        <span className="subtask-bullet">└─</span> {subtask}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BUTON TEST NOTIFICARE */}
              <div className="todo-actions">
                <button 
                  className="test-notification-btn"
                  onClick={() => testNotification(todo)}
                  title="Testeaza notificarea pentru acest task"
                >
                  <span className="bell-icon">🔔</span>
                  <span className="test-label">TEST</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="todo-footer">
        <button className="refresh-btn" onClick={loadTodos}>
          <span className="spin-slow">⟳</span> REFRESH
        </button>
      </div>
    </div>
  );
};

export default TodoList;