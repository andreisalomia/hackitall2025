import React from 'react';
import './TapeRecorder.css';

// Importăm imaginile tale
import tapeBody from './tape2_pixel_modif.png'; 
import singleReel from './rola_pixel.png'; 

const TapeRecorder = ({ onClick }) => {
  return (
    // Containerul principal
    <div className="tape-wrapper" onClick={onClick}>
      
      {/* 1. Imaginea de fundal (Casetofonul întreg) */}
      <img 
        src={tapeBody} 
        alt="Tape Recorder Base" 
        className="tape-bg" 
      />

      {/* 2. Rola Stângă (Animată) */}
      <img 
        src={singleReel} 
        alt="Spinning Reel Left" 
        className="reel reel-left" 
      />

      {/* 3. Rola Dreaptă (Animată) */}
      <img 
        src={singleReel} 
        alt="Spinning Reel Right" 
        className="reel reel-right"
      />
      <div className="blink-square"></div>
      
    </div>
  );
};

export default TapeRecorder;