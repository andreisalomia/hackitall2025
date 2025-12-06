import React from 'react';
import './LandingPage.css';

// Observă că am adăugat { onStart } aici la argumente
const LandingPage = ({ onStart }) => {
  
  return (
    <div className="landing-container">
      <h1 className="app-title">NUME APLICAȚIE</h1>

      <div className="button-group">
        <p className="press-text">APASĂ AICI</p>
        
        {/* Când dai click, apelează funcția primită din App.jsx */}
        <button className="retro-btn" onClick={onStart}>
          START
        </button>
      </div>
    </div>
  );
};

export default LandingPage;