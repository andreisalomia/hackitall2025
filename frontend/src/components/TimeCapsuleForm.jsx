"use client"

import { useState } from "react"
import "./TimeCapsuleForm.css"

function TimeCapsuleForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    openDate: "",
    recipient: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // TODO: Conectează cu backend-ul Python
    console.log("[v0] Salvare time capsule:", formData)

    // Simulare salvare
    alert("Time Capsule salvată cu succes!")

    if (onSuccess) {
      onSuccess()
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <span className="form-icon">💾</span>
        <h2>Creează o Time Capsule</h2>
      </div>

      <form onSubmit={handleSubmit} className="win95-form">
        <div className="form-group">
          <label htmlFor="title">Titlu:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="win95-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="recipient">Pentru cine:</label>
          <input
            type="text"
            id="recipient"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            className="win95-input"
            placeholder="Eu din viitor"
          />
        </div>

        <div className="form-group">
          <label htmlFor="openDate">Deschide la data:</label>
          <input
            type="date"
            id="openDate"
            name="openDate"
            value={formData.openDate}
            onChange={handleChange}
            className="win95-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Mesajul tău:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="win95-textarea"
            rows="8"
            placeholder="Scrie aici amintirile tale..."
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="win95-button primary">
            💾 Salvează
          </button>
          <button type="button" className="win95-button">
            Anulează
          </button>
        </div>
      </form>
    </div>
  )
}

export default TimeCapsuleForm
