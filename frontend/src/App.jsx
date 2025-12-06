import { useState, useEffect } from 'react'
import axios from 'axios'
import LandingPage from './landing_page/LandingPage'; // Importul e corect

const API_URL = 'http://localhost:5000'

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  
  // --- AICI ESTE NOUTATEA ---
  // Starea care decide dacă suntem pe ecranul de start sau în aplicație
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
        const res = await axios.get(`${API_URL}/items`)
        setItems(res.data)
    } catch (error) {
        console.error("Backend-ul nu răspunde, dar e ok, lucrăm la frontend", error);
    }
  }

  const addItem = async (e) => {
    e.preventDefault()
    if (!name) return;
    await axios.post(`${API_URL}/items`, { name })
    setName('')
    fetchItems()
  }

  // --- LOGICA DE AFIȘARE ---
  
  // 1. Dacă jocul NU a început, afișăm DOAR Landing Page-ul
  if (!gameStarted) {
      return (
          // Îi pasăm o funcție care schimbă starea când dăm click pe Start
          <LandingPage onStart={() => setGameStarted(true)} />
      );
  }

  // 2. Dacă jocul a început (gameStarted e true), afișăm aplicația principală (codul tău vechi)
  return (
    <div className="container mt-5">
      <h1>Hackathon App Main Dashboard</h1>
      
      <form onSubmit={addItem} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add item..."
          />
          <button className="btn btn-primary" type="submit">Add</button>
        </div>
      </form>

      <ul className="list-group">
        {items.map((item, i) => (
          <li key={i} className="list-group-item">{item.name}</li>
        ))}
      </ul>
      
      {/* Un buton mic să te întorci înapoi, opțional */}
      <button 
        className="btn btn-secondary mt-3" 
        onClick={() => setGameStarted(false)}
      >
        Back to Start
      </button>
    </div>
  )
}

export default App