import React, { useState } from 'react';
import './TapeRecorder.css';

import tapeBody from './tape2_pixel_modif.png';
import singleReel from './rola_pixel.png';

export default function MatrixTapeRecorder() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="matrix-wrapper">

      <div className="matrix-frame">

        {/* ZONA PRINCIPALĂ ORIZONTALĂ */}
        <div className="matrix-layout">

          {/* CASETOFON */}
          <div className="tape-wrapper">
            <img src={tapeBody} alt="Tape Recorder Base" className="tape-bg" />

            {/* RULE ALINIATE CORECT */}
            <img
              src={singleReel}
              alt="Left Reel"
              className={`reel reel-left ${isRecording ? 'spin' : ''}`}
            />

            <img
              src={singleReel}
              alt="Right Reel"
              className={`reel reel-right ${isRecording ? 'spin' : ''}`}
            />

            {isRecording && <div className="blink-square"></div>}
          </div>

          {/* BUTOANE */}
          <div className="matrix-buttons">
            <button className="mx-btn record" onClick={() => setIsRecording(true)}>
              RECORD
            </button>

            <button className="mx-btn stop" onClick={() => setIsRecording(false)}>
              STOP
            </button>

            <button className="mx-btn summary">
              REZUMATUL ZILEI
            </button>

            <button className="mx-btn todo">
              TODO'S
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
