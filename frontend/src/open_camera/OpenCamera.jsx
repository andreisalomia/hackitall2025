import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import './OpenCamera.css';
import monitorImage from './monitor.png'; 

const OpenCamera = ({ onNext }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const detectionIntervalRef = useRef(null);

  // Încărcăm modelele DIRECT de pe CDN (fără să le descărcăm local!)
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Folosim CDN-ul public pentru modele - NU mai trebuie descărcate!
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        
        console.log('📦 Loading face detection models from CDN...');
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        
        console.log('✅ Face detection models loaded successfully from CDN!');
        setModelsLoaded(true);
      } catch (err) {
        console.error('❌ Error loading face detection models:', err);
        console.log('💡 Trying alternative CDN...');
        
        // Fallback - încercăm alt CDN
        try {
          const FALLBACK_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
          await faceapi.nets.tinyFaceDetector.loadFromUri(FALLBACK_URL);
          await faceapi.nets.faceLandmark68Net.loadFromUri(FALLBACK_URL);
          await faceapi.nets.faceRecognitionNet.loadFromUri(FALLBACK_URL);
          console.log('✅ Models loaded from fallback CDN!');
          setModelsLoaded(true);
        } catch (fallbackErr) {
          console.error('❌ Fallback also failed:', fallbackErr);
        }
      }
    };

    loadModels();
  }, []);

  // Pornim camera
  useEffect(() => {
    let currentStream = null;

    const enableVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }, 
          audio: false 
        });
        currentStream = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Setup canvas când video-ul e gata
          videoRef.current.onloadedmetadata = () => {
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          };
        }
      } catch (err) {
        console.error("❌ Eroare la accesarea camerei:", err);
        setHasPermission(false);
      }
    };

    enableVideoStream();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  // Începem detecția când modelele sunt încărcate și camera pornește
  useEffect(() => {
    if (!modelsLoaded || !videoRef.current) return;

    const startFaceDetection = async () => {
      // Așteptăm să se încarce video-ul complet
      if (videoRef.current.readyState !== 4) {
        setTimeout(startFaceDetection, 500);
        return;
      }

      console.log('🎬 Starting face detection...');

      // Rulăm detecția la fiecare 300ms pentru tracking fluid
      detectionIntervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;

        try {
          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({
              inputSize: 224,
              scoreThreshold: 0.5
            }))
            .withFaceLandmarks()
            .withFaceDescriptor();

          // Curățăm canvas-ul
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          if (detection) {
            console.log('👤 FACE DETECTED!');
            console.log('Detection score:', detection.detection.score);
            
            // DESENĂM CHENARUL VERDE în jurul feței
            if (canvas) {
              const ctx = canvas.getContext('2d');
              const box = detection.detection.box;
              
              // Culoare dinamică bazată pe status
              let boxColor = '#00ff00'; // Verde default
              if (isComplete) {
                boxColor = '#00ff00'; // Verde strălucitor pentru complete
              } else if (isAuthenticating) {
                boxColor = '#00ffff'; // Cyan pentru autentificare
              } else if (faceDetected) {
                boxColor = '#00ff00'; // Verde pentru detectat
              }
              
              // Stil chenar cu culoare dinamică
              ctx.strokeStyle = boxColor;
              ctx.lineWidth = 4;
              ctx.shadowBlur = 15;
              ctx.shadowColor = boxColor;
              
              // Desenăm dreptunghiul
              ctx.strokeRect(box.x, box.y, box.width, box.height);
              
              // Adăugăm colțuri mai groase pentru efect retro
              const cornerLength = 20;
              ctx.lineWidth = 6;
              
              // Colț stânga-sus
              ctx.beginPath();
              ctx.moveTo(box.x, box.y + cornerLength);
              ctx.lineTo(box.x, box.y);
              ctx.lineTo(box.x + cornerLength, box.y);
              ctx.stroke();
              
              // Colț dreapta-sus
              ctx.beginPath();
              ctx.moveTo(box.x + box.width - cornerLength, box.y);
              ctx.lineTo(box.x + box.width, box.y);
              ctx.lineTo(box.x + box.width, box.y + cornerLength);
              ctx.stroke();
              
              // Colț stânga-jos
              ctx.beginPath();
              ctx.moveTo(box.x, box.y + box.height - cornerLength);
              ctx.lineTo(box.x, box.y + box.height);
              ctx.lineTo(box.x + cornerLength, box.y + box.height);
              ctx.stroke();
              
              // Colț dreapta-jos
              ctx.beginPath();
              ctx.moveTo(box.x + box.width - cornerLength, box.y + box.height);
              ctx.lineTo(box.x + box.width, box.y + box.height);
              ctx.lineTo(box.x + box.width, box.y + box.height - cornerLength);
              ctx.stroke();
              
              // Text dinamic bazat pe status
              ctx.font = 'bold 16px "Courier New"';
              ctx.fillStyle = boxColor; // Aceeași culoare ca și chenarul
              ctx.shadowBlur = 10;
              ctx.shadowColor = boxColor;
              
              let statusText = 'FACE DETECTED';
              if (isComplete) {
                statusText = 'AUTHENTICATED ✓';
              } else if (isAuthenticating) {
                statusText = 'AUTHENTICATING...';
              }
              
              ctx.fillText(statusText, box.x, box.y - 10);
              
              // Afișăm confidence score
              ctx.font = '12px "Courier New"';
              ctx.fillText(`${(detection.detection.score * 100).toFixed(1)}%`, 
                          box.x, box.y + box.height + 20);
            }
            
            // Prima detectare - începem countdown
            if (!faceDetected) {
              console.log('👤 FIRST FACE DETECTED!');
              console.log('Detection score:', detection.detection.score);
              setFaceDetected(true);
              
              // După 2 secunde de detectare continuă, trecem la "Authenticating"
              setTimeout(() => {
                setIsAuthenticating(true);
                
                // După încă 3 secunde, marcăm ca "Complete"
                setTimeout(() => {
                  setIsComplete(true);
                }, 3000);
              }, 2000);
            }
          } else {
            // Nu s-a detectat față - resetăm flag dacă nu am început autentificarea
            if (faceDetected && !isAuthenticating) {
              console.log('⚠️ Face lost, resetting...');
              setFaceDetected(false);
            }
          }
        } catch (err) {
          console.error('Error during face detection:', err);
        }
      }, 300);
    };

    startFaceDetection();

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [modelsLoaded, faceDetected, isAuthenticating]);

  return (
    <div className="desktop">
      <div className="welcome-content-camera">
        <h1 className="welcome-title-static">TIME CAPSULE 95</h1>
        
        <div className="monitor-wrapper">
          <img 
            src={monitorImage} 
            alt="Monitor Frame" 
            className="monitor-frame" 
          />
          
          <video 
            ref={videoRef}
            className="webcam-feed"
            playsInline 
            muted 
            autoPlay 
          />

          {/* Canvas pentru desenat chenarul verde */}
          <canvas 
            ref={canvasRef}
            className="face-overlay-canvas"
          />
          
          {!hasPermission && (
            <div className="error-message">
              Te rugăm să permiți accesul la cameră.
            </div>
          )}

          {!modelsLoaded && hasPermission && (
            <div className="loading-models">
              Loading AI models...
            </div>
          )}
        </div>

        {/* Mesaje de status bazate pe detecție reală */}
        {modelsLoaded && !faceDetected && (
          <p className="finding-user">Finding user...</p>
        )}
        
        {faceDetected && !isAuthenticating && (
          <p className="face-found">✓ Face detected!</p>
        )}
        
        {isAuthenticating && !isComplete && (
          <p className="auth">Authenticating...</p>
        )}
        
        {isComplete && (
          <p className="complete">Complete!</p>
        )}

        <div className="camera-controls">
          <button 
            className="continue-button" 
            onClick={() => {
              // Oprim tracking-ul când user-ul continuă
              if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
              }
              // Curățăm canvas-ul
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              }
              // Mergem la următoarea pagină
              onNext();
            }} 
            disabled={!hasPermission || !isComplete}
          >
            MERGI MAI DEPARTE
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenCamera;