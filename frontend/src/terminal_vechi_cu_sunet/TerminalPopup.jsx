"use client"

import { useState, useEffect, useRef } from "react"
import "./TerminalPopup.css"

const TerminalPopup = ({ isOpen, onClose, text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (isOpen && text && currentIndex < text.length) {
      setIsTyping(true)
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)

        // Play typing sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch((err) => console.log("[v0] Audio play failed:", err))
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

  if (!isOpen) return null

  return (
    <>
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

      {/* Typing Sound Effect */}
      <audio ref={audioRef} preload="auto">
        <source
          src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zPLTgjMGHm7A7+OZSA0PVqzn7a1aFg1Ln+Hxw3EeBjKM0vLOgDEHIXXD79+VQgsRY7Tr7bBdGQ5Nm+LyxGwdBjWP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9Pn+LyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyvGsbBjaP1PDQhTQHJHnG7uGYRw0SZrns7LVhGw9PnuLyg=="
          type="audio/wav"
        />
      </audio>
    </>
  )
}

export default TerminalPopup
