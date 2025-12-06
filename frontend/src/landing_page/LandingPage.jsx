"use client"

import { useState } from "react"
import "./LandingPage.css"
import Window95 from "../components/Window95"
import TimeCapsuleForm from "../components/TimeCapsuleForm"
import MyCapsules from "../components/MyCapsules"

function LandingPage({ onStart }) {
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
      {/* Welcome Screen */}
      {!openWindows["new-capsule"] && !openWindows["my-capsules"] && (
        <div className="welcome-container">
          <div className="welcome-content">
            <img src="/computer-icon.png" alt="Computer" className="welcome-icon" />
            <h1 className="welcome-title">TIME CAPSULE 95</h1>
            <p className="welcome-subtitle">&gt; Pastreaza amintirile pentru viitor...</p>
            <p className="welcome-subtitle">&gt; Sistema de arhivare memorie v1.0</p>
            <p className="welcome-subtitle">&gt; Press START to initialize</p>
            <button className="start-button" onClick={onStart}>
              START
            </button>
          </div>
        </div>
      )}

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

export default LandingPage
