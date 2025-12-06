"use client"

import { useState, useEffect, useRef } from "react"
import "./TerminalPopup.css"

const TerminalPopup = ({ isOpen, onClose, text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const audioContextRef = useRef(null)

  // Inițializează Audio Context
  useEffect(() => {
    if (isOpen && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      } catch (e) {
        console.log("Web Audio API not supported")
      }
    }
  }, [isOpen])

  // Funcție pentru a genera sunetul de tastare
  const playTypeSound = () => {
  if (!audioContextRef.current) return;

  try {
    const audioCtx = audioContextRef.current;

    // White noise buffer
    const bufferSize = 4096;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1; // white noise
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.01);

    noise.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start(audioCtx.currentTime);
    noise.stop(audioCtx.currentTime + 0.01); // 10ms click
  } catch (e) {
    console.log("Error playing improved typing sound:", e);
  }
};


  // Efect typewriter
  useEffect(() => {
    if (isOpen && text && currentIndex < text.length) {
      setIsTyping(true)
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)

        // Play typing sound doar la ~30% din litere pentru efect mai natural
        if (Math.random() < 0.3) {
          playTypeSound()
        }
      }, speed)

      return () => clearTimeout(timer)
    } else if (currentIndex >= text.length) {
      setIsTyping(false)
    }
  }, [isOpen, text, currentIndex, speed])

  // Reset when popup opens
  useEffect(() => {
    if (isOpen) {
      setDisplayedText("")
      setCurrentIndex(0)
    }
  }, [isOpen])

  // Cleanup audio context
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="terminal-popup-overlay" onClick={onClose}>
      <div className="terminal-popup-container nes-container is-dark" onClick={(e) => e.stopPropagation()}>
        {/* Terminal Header */}
        <div className="terminal-header">
          <span className="terminal-title">C:\TIMECAPSULE95&gt;</span>
          <button className="nes-btn is-error terminal-close" onClick={onClose}>
            X
          </button>
        </div>

        {/* Terminal Content */}
        <div className="terminal-content">
          <pre className="terminal-text">
            {displayedText}
            {isTyping && <span className="terminal-cursor">█</span>}
          </pre>
        </div>

        {/* Action Buttons */}
        {!isTyping && (
          <div className="terminal-actions">
            <button className="nes-btn is-success" onClick={onClose}>
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TerminalPopup