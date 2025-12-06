"use client"

import { useState } from "react"
import "./MainApp.css"
import DesktopIcon from "./DesktopIcon"
import Window95 from "./Window95"
import TimeCapsuleForm from "./TimeCapsuleForm"
import MyCapsules from "./MyCapsules"

function MainApp({ items, name, setName, addItem, onBackToStart }) {
  const [openWindows, setOpenWindows] = useState({})
  const [selectedIcon, setSelectedIcon] = useState(null)

  const openWindow = (windowId) => {
    setOpenWindows((prev) => ({ ...prev, [windowId]: true }))
  }

  const closeWindow = (windowId) => {
    setOpenWindows((prev) => {
      const newWindows = { ...prev }
      delete newWindows[windowId]
      return newWindows
    })
  }

  const handleIconClick = (iconId) => {
    setSelectedIcon(iconId)
  }

  const handleIconDoubleClick = (iconId) => {
    openWindow(iconId)
  }

  return (
    <div className="desktop">
      {/* Desktop Icons */}
      <div className="desktop-icons">
        <DesktopIcon
          icon="🖥️"
          label="My Computer"
          onClick={() => handleIconClick("my-computer")}
          onDoubleClick={() => handleIconDoubleClick("my-computer")}
          selected={selectedIcon === "my-computer"}
        />
        <DesktopIcon
          icon="📝"
          label="New Time Capsule"
          onClick={() => handleIconClick("new-capsule")}
          onDoubleClick={() => handleIconDoubleClick("new-capsule")}
          selected={selectedIcon === "new-capsule"}
        />
        <DesktopIcon
          icon="📁"
          label="My Capsules"
          onClick={() => handleIconClick("my-capsules")}
          onDoubleClick={() => handleIconDoubleClick("my-capsules")}
          selected={selectedIcon === "my-capsules"}
        />
        <DesktopIcon
          icon="💾"
          label="Dashboard"
          onClick={() => handleIconClick("dashboard")}
          onDoubleClick={() => handleIconDoubleClick("dashboard")}
          selected={selectedIcon === "dashboard"}
        />
      </div>

      {/* Windows */}
      {openWindows["new-capsule"] && (
        <Window95
          title="New Time Capsule"
          onClose={() => closeWindow("new-capsule")}
          width={600}
          height={500}
          initialX={100}
          initialY={80}
        >
          <TimeCapsuleForm
            onSuccess={() => {
              closeWindow("new-capsule")
              openWindow("my-capsules")
            }}
          />
        </Window95>
      )}

      {openWindows["my-capsules"] && (
        <Window95
          title="My Time Capsules"
          onClose={() => closeWindow("my-capsules")}
          width={700}
          height={550}
          initialX={150}
          initialY={100}
        >
          <MyCapsules />
        </Window95>
      )}

      {openWindows["my-computer"] && (
        <Window95
          title="My Computer"
          onClose={() => closeWindow("my-computer")}
          width={500}
          height={400}
          initialX={200}
          initialY={120}
        >
          <div className="my-computer-content">
            <div className="drive-icon">
              <span className="drive-emoji">💾</span>
              <span>Floppy (A:)</span>
            </div>
            <div className="drive-icon">
              <span className="drive-emoji">💿</span>
              <span>CD-ROM (D:)</span>
            </div>
            <div className="drive-icon">
              <span className="drive-emoji">🖥️</span>
              <span>Hard Drive (C:)</span>
            </div>
          </div>
        </Window95>
      )}

      {openWindows["dashboard"] && (
        <Window95
          title="Hackathon Dashboard"
          onClose={() => closeWindow("dashboard")}
          width={600}
          height={450}
          initialX={180}
          initialY={90}
        >
          <div className="dashboard-content">
            <h2 className="dashboard-title">Main Dashboard</h2>

            <form onSubmit={addItem} className="dashboard-form">
              <div className="form-group">
                <input
                  type="text"
                  className="win95-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Add item..."
                />
                <button className="win95-button" type="submit">
                  Add
                </button>
              </div>
            </form>

            <div className="items-list">
              <div className="list-header">Items:</div>
              {items.length === 0 ? (
                <div className="no-items">No items yet...</div>
              ) : (
                <ul className="win95-list">
                  {items.map((item, i) => (
                    <li key={i} className="list-item">
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button className="win95-button back-button" onClick={onBackToStart}>
              Back to Start
            </button>
          </div>
        </Window95>
      )}

      {/* Taskbar */}
      <div className="taskbar">
        <button className="start-btn">
          <span className="start-logo">⊞</span>
          Start
        </button>
        <div className="taskbar-divider"></div>
        <div className="taskbar-apps">
          {openWindows["new-capsule"] && <button className="taskbar-app active">📝 New Time Capsule</button>}
          {openWindows["my-capsules"] && <button className="taskbar-app active">📁 My Time Capsules</button>}
          {openWindows["dashboard"] && <button className="taskbar-app active">💾 Dashboard</button>}
        </div>
        <div className="taskbar-tray">
          <span className="tray-time">
            {new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default MainApp
