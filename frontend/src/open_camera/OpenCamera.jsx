import React, { useRef, useEffect, useState } from 'react';
import './OpenCamera.css';
import monitorImage from './monitor.png'; 

const OpenCamera = ({ onNext }) => {
  // Referință către elementul HTML <video>
  const videoRef = useRef(null);
  // Stare pentru erori (ex: utilizatorul nu dă voie la cameră)
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    let currentStream = null;

    // Funcția care cere acces la cameră
    const enableVideoStream = async () => {
      try {
        // Cerem doar video, fără audio
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        currentStream = stream;
        
        // Atribuim fluxul video elementului <video>
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Eroare la accesarea camerei:", err);
        setHasPermission(false);
      }
    };

    enableVideoStream();

    // --- Funcție de CURĂȚARE ---
    // Foarte important: Când componenta dispare de pe ecran (când mergem la pasul următor),
    // trebuie să oprim camera (să se stingă beculețul de la laptop).
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // [] înseamnă că se execută doar o dată, la montarea componentei

  return (
    <div className="desktop">
      {/* Chenar principal pentru OpenCamera */}
      <div className="welcome-content-camera">
        <h1 className="welcome-title-static">TIME CAPSULE 95</h1>
        {/* Wrapper pentru a suprapune video peste imagine */}
        <div className="monitor-wrapper">
          {/* 1. Imaginea de fundal a monitorului */}
          <img 
            src={monitorImage} 
            alt="Monitor Frame" 
            className="monitor-frame" 
          />
          
          {/* 2. Elementul video care arată camera web */}
          {/* playsInline, muted, autoPlay sunt necesare pentru a porni automat */}
          <video 
            ref={videoRef}
            className="webcam-feed"
            playsInline 
            muted 
            autoPlay 
          />
          
          {!hasPermission && <div className="error-message">Te rugăm să permiți accesul la cameră.</div>}
        </div>
        <p className="finding-user">Finding user...</p>
        <p className="auth">Authenticating...</p>
        <p className="complete">Complete!</p>
        <div className="camera-controls">
          {/* Butonul e activ doar dacă avem permisiune */}
          <button className="continue-button" onClick={onNext} disabled={!hasPermission}>
            MERGI MAI DEPARTE
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenCamera;