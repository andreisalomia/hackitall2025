"use client"

import { useState, useEffect } from "react"
import "./MyCapsules.css"

function MyCapsules() {
  const [capsules, setCapsules] = useState([])
  const [selectedCapsule, setSelectedCapsule] = useState(null)

  useEffect(() => {
    // TODO: Fetch de la backend Python
    // Deocamdată folosim date mock
    setCapsules([
      {
        id: 1,
        title: "Amintiri Hackathon 2025",
        recipient: "Eu din 2030",
        openDate: "2030-01-15",
        message: "Acest hackathon a fost incredibil! Am învățat atât de multe...",
        createdAt: "2025-01-12",
        isLocked: true,
      },
      {
        id: 2,
        title: "Prima mea time capsule",
        recipient: "Viitorul eu",
        openDate: "2025-12-31",
        message: "Sper că toate planurile mele s-au îndeplinit!",
        createdAt: "2025-01-10",
        isLocked: true,
      },
    ])
  }, [])

  const isUnlocked = (openDate) => {
    return new Date(openDate) <= new Date()
  }

  return (
    <div className="capsules-container">
      <div className="capsules-list">
        <div className="list-header">
          <span className="col-icon">📁</span>
          <span className="col-title">Titlu</span>
          <span className="col-date">Se deschide</span>
          <span className="col-status">Status</span>
        </div>

        {capsules.map((capsule) => (
          <div
            key={capsule.id}
            className={`capsule-item ${selectedCapsule?.id === capsule.id ? "selected" : ""}`}
            onClick={() => setSelectedCapsule(capsule)}
            onDoubleClick={() => {
              if (isUnlocked(capsule.openDate)) {
                alert(`Mesaj: ${capsule.message}`)
              } else {
                alert("🔒 Această capsulă este încă blocată!")
              }
            }}
          >
            <span className="item-icon">{isUnlocked(capsule.openDate) ? "📂" : "🔒"}</span>
            <span className="item-title">{capsule.title}</span>
            <span className="item-date">{capsule.openDate}</span>
            <span className="item-status">{isUnlocked(capsule.openDate) ? "✅ Deschis" : "🔒 Blocat"}</span>
          </div>
        ))}

        {capsules.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>Nu ai time capsule salvate</p>
          </div>
        )}
      </div>

      {selectedCapsule && (
        <div className="capsule-details">
          <div className="details-header">
            <h3>{selectedCapsule.title}</h3>
          </div>
          <div className="details-body">
            <div className="detail-row">
              <strong>Pentru:</strong>
              <span>{selectedCapsule.recipient}</span>
            </div>
            <div className="detail-row">
              <strong>Creat la:</strong>
              <span>{selectedCapsule.createdAt}</span>
            </div>
            <div className="detail-row">
              <strong>Se deschide:</strong>
              <span>{selectedCapsule.openDate}</span>
            </div>
            <div className="detail-row">
              <strong>Status:</strong>
              <span>{isUnlocked(selectedCapsule.openDate) ? "✅ Disponibil" : "🔒 Blocat"}</span>
            </div>

            {isUnlocked(selectedCapsule.openDate) && (
              <div className="detail-message">
                <strong>Mesaj:</strong>
                <div className="message-box">{selectedCapsule.message}</div>
              </div>
            )}
          </div>

          <div className="details-actions">
            <button
              className="win95-button primary"
              onClick={() => {
                if (isUnlocked(selectedCapsule.openDate)) {
                  alert("Deschis!")
                } else {
                  alert("🔒 Această capsulă se va deschide la: " + selectedCapsule.openDate)
                }
              }}
            >
              {isUnlocked(selectedCapsule.openDate) ? "📂 Deschide" : "🔒 Blocat"}
            </button>
            <button className="win95-button">Șterge</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyCapsules
