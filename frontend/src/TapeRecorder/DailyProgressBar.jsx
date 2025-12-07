import React, { useState, useEffect } from 'react';
import './DailyProgressBar.css';

const DailyProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Funcție pentru a calcula progresul zilnic
  const fetchDailyProgress = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch toate task-urile din ziua curentă
      const response = await fetch(`http://localhost:5000/todos/daily-progress?date=${today}`);
      const data = await response.json();
      
      if (data.success) {
        const total = data.total || 0;
        const completed = data.completed || 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        setTotalCount(total);
        setCompletedCount(completed);
        setProgress(percentage);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Eroare la încărcarea progresului zilnic:', error);
      setLoading(false);
    }
  };

  // Încărcăm progresul la montarea componentei
  useEffect(() => {
    fetchDailyProgress();
    
    // Listener pentru update-uri de task-uri
    const handleTaskUpdate = () => {
      fetchDailyProgress();
    };
    
    window.addEventListener('todoCompleted', handleTaskUpdate);
    window.addEventListener('todoAdded', handleTaskUpdate);
    
    return () => {
      window.removeEventListener('todoCompleted', handleTaskUpdate);
      window.removeEventListener('todoAdded', handleTaskUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="progress-bar-container">
        <div className="progress-loading">
          <span className="blink">●</span>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-bar-container">
      <div className="progress-header">
        <div className="progress-title">PROGRES</div>
        <div className="progress-date">{new Date().toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })}</div>
      </div>
      
      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill" 
            style={{ height: `${progress}%` }}
          >
            <div className="progress-bar-glow"></div>
          </div>
          
          {/* Markeri pentru 25%, 50%, 75% */}
          <div className="progress-marker" style={{ bottom: '25%' }}>
            <span className="marker-line"></span>
          </div>
          <div className="progress-marker" style={{ bottom: '50%' }}>
            <span className="marker-line"></span>
          </div>
          <div className="progress-marker" style={{ bottom: '75%' }}>
            <span className="marker-line"></span>
          </div>
        </div>
      </div>
      
      <div className="progress-stats">
        <div className="progress-percentage">{progress}%</div>
        <div className="progress-count">
          {completedCount}/{totalCount}
        </div>
        <div className="progress-label">TASKURI</div>
      </div>
    </div>
  );
};

export default DailyProgressBar;