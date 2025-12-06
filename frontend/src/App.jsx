import { useState, useEffect } from 'react'
import axios from 'axios'
import LandingPage from './landing_page/LandingPage';
import OpenCamera from './open_camera/OpenCamera';
import './index.css'; // Asigură-te că ai importat CSS-ul de mai sus

const API_URL = 'http://localhost:5000'

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
        const res = await axios.get(`${API_URL}/items`)
        setItems(res.data)
    } catch (error) {
        console.error("Backend error:", error);
    }
  }

  // Nu mai folosim "if (!gameStarted) return ...", ci returnăm ambele
  return (
    <div className="app-container">
      
      {/* 1. Landing Page (Layer 1) */}
      <div className={`fade-page ${!gameStarted ? 'visible' : 'hidden'}`}>
        <LandingPage onStart={() => setGameStarted(true)} />
      </div>

      {/* 2. Open Camera (Layer 2) */}
      <div className={`fade-page ${gameStarted ? 'visible' : 'hidden'}`}>
        <OpenCamera />
      </div>

    </div>
  )
}

export default App