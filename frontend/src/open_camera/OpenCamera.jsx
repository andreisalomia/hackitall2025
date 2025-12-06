import React from 'react';
import './OpenCamera.css';
// Importăm imaginea din același folder
import monitorImage from './monitor.png'; 

const OpenCamera = ({ onStart }) => {
  
  return (
    <div className="open-camera-container">
      {/* Am șters titlul și butoanele */}
      
      {/* Afișăm imaginea. 
          Dacă vrei ca imaginea să fie "butonul" de start, 
          poți adăuga onClick={onStart} pe ea. */}
      <img 
        src={monitorImage} 
        alt="Logo Aplicatie" 
        className="center-image" 
        // onClick={onStart} // Opțional: click pe poză pentru a începe
      />
    </div>
  );
};

export default OpenCamera;