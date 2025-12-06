"use client"

import { useState, useRef, useEffect } from "react"
import "./Window95.css"

function Window95({ title, children, onClose, width = 500, height = 400, initialX = 100, initialY = 100 }) {
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleMouseDown = (e) => {
    if (e.target.closest(".title-bar-controls")) return

    const rect = windowRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsDragging(true)
  }

  return (
    <div
      ref={windowRef}
      className="window-95"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="title-bar" onMouseDown={handleMouseDown}>
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button className="title-bar-button" aria-label="Minimize">
            _
          </button>
          <button className="title-bar-button" aria-label="Maximize">
            □
          </button>
          <button className="title-bar-button close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
      <div className="window-body">{children}</div>
    </div>
  )
}

export default Window95
