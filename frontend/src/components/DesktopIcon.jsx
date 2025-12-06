"use client"

import "./DesktopIcon.css"

function DesktopIcon({ icon, label, onClick, onDoubleClick, selected }) {
  return (
    <div className={`desktop-icon ${selected ? "selected" : ""}`} onClick={onClick} onDoubleClick={onDoubleClick}>
      <div className="icon-image">
        {icon.startsWith("/") ? (
          <img src={icon || "/placeholder.svg"} alt={label} />
        ) : (
          <span className="icon-emoji">{icon}</span>
        )}
      </div>
      <span className="icon-label">{label}</span>
    </div>
  )
}

export default DesktopIcon
