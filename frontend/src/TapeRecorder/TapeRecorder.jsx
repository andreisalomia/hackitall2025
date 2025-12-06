import React, { useState, useRef } from 'react';
import './TapeRecorder.css';

import tapeBody from './tape2_pixel_modif.png';
import singleReel from './rola_pixel.png';

export default function MatrixTapeRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Funcție pentru convertirea audio la WAV
  const encodeWAV = (audioBuffer) => {
    const numOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    let result;
    if (numOfChannels === 2) {
      result = interleave(audioBuffer.getChannelData(0), audioBuffer.getChannelData(1));
    } else {
      result = audioBuffer.getChannelData(0);
    }

    const buffer = new ArrayBuffer(44 + result.length * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + result.length * 2, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // format chunk identifier
    writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, format, true);
    // channel count
    view.setUint16(22, numOfChannels, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * numOfChannels * (bitDepth / 8), true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, numOfChannels * (bitDepth / 8), true);
    // bits per sample
    view.setUint16(34, bitDepth, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, result.length * 2, true);

    // write the PCM samples
    floatTo16BitPCM(view, 44, result);

    return buffer;
  };

  const interleave = (leftChannel, rightChannel) => {
    const length = leftChannel.length + rightChannel.length;
    const result = new Float32Array(length);

    let inputIndex = 0;
    for (let i = 0; i < length;) {
      result[i++] = leftChannel[inputIndex];
      result[i++] = rightChannel[inputIndex];
      inputIndex++;
    }
    return result;
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const floatTo16BitPCM = (output, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  };

  const handleStartRecording = async () => {
    try {
      setStatusMessage('🎙️ Se inițializează microfonul...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset chunks
      chunksRef.current = [];
      
      // Creăm MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/ogg';
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      // Colectăm chunk-urile
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      // La stop, procesăm audio-ul
      mediaRecorderRef.current.onstop = async () => {
        await processAndSendAudio();
        
        // Oprim stream-ul
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatusMessage('🔴 Înregistrare în curs...');
      
    } catch (error) {
      console.error('Eroare la pornirea înregistrării:', error);
      setStatusMessage('❌ Eroare: Nu s-a putut accesa microfonul');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setStatusMessage('⏳ Se procesează audio-ul...');
    }
  };

  const processAndSendAudio = async () => {
    try {
      // Construim blob-ul din chunks
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      
      setStatusMessage('🔄 Se convertește la WAV...');
      
      // Convertim la WAV
      const arrayBuffer = await blob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const wavBuffer = encodeWAV(audioBuffer);
      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      
      setStatusMessage('📤 Se trimite la server...');
      
      // Trimitem la backend
      const formData = new FormData();
      formData.append('audio', wavBlob, 'recording.wav');
      
      const response = await fetch('http://localhost:5000/recordings/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatusMessage('✅ Procesare completă!');
        
        // Afișăm rezultatul în consolă
        console.log('=== REZULTAT PROCESARE ===');
        console.log('Transcriere:', result.transcription);
        console.log('Clasificare:', result.classification);
        console.log('ID salvat:', result.saved_id);
        console.log('========================');
        
        // Reset după 3 secunde
        setTimeout(() => {
          setStatusMessage('');
          setIsProcessing(false);
        }, 3000);
        
      } else {
        throw new Error(result.error || 'Eroare necunoscută');
      }
      
    } catch (error) {
      console.error('Eroare la procesarea audio:', error);
      setStatusMessage(`❌ Eroare: ${error.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="matrix-wrapper">
      <div className="matrix-frame">
        <div className="matrix-layout">
          
          {/* CASETOFON */}
          <div className="tape-wrapper">
            <img src={tapeBody} alt="Tape Recorder Base" className="tape-bg" />

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
            <button 
              className="mx-btn record" 
              onClick={handleStartRecording}
              disabled={isRecording || isProcessing}
            >
              {isRecording ? 'ÎNREGISTRARE...' : 'RECORD'}
            </button>

            <button 
              className="mx-btn stop" 
              onClick={handleStopRecording}
              disabled={!isRecording}
            >
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
        
        {/* STATUS MESSAGE */}
        {statusMessage && (
          <div className="status-message">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}