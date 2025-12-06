import { useState, useEffect } from 'react'
import axios from 'axios'
// Asigură-te că importurile sunt corecte
import LandingPage from './landing_page/LandingPage';
import OpenCamera from './open_camera/OpenCamera';
import TapeRecorder from './TapeRecorder/TapeRecorder'; // Presupun că aici e componenta finală
import './index.css'; 

const API_URL = 'http://localhost:5000'

function App() {
  // --- NOUTATE: Starea acum poate fi 'landing', 'camera', sau 'recorder' ---
  const [currentPage, setCurrentPage] = useState('landing');

  // (Restul codului pentru items poate rămâne, deși nu e folosit în UI acum)
  const [items, setItems] = useState([])
  useEffect(() => { fetchItems() }, [])
  const fetchItems = async () => {
    try { const res = await axios.get(`${API_URL}/items`); setItems(res.data) } 
    catch (error) { console.error("Eroare backend:", error); }
  }

  /* App.jsx - Verificare */

// ...
  return (
    <div className="app-container">
      
      {/* LANDING PAGE */}
      <div className={`fade-layer ${currentPage === 'landing' ? 'visible' : 'hidden'}`}>
        <LandingPage onStart={() => setCurrentPage('camera')} />
      </div>

      {/* CAMERA PAGE */}
      {/* Verifică dacă ai scris 'camera' corect aici și în onStart-ul de mai sus */}
      <div className={`fade-layer ${currentPage === 'camera' ? 'visible' : 'hidden'}`}>
        {/* Folosim condiția && pentru a monta componenta doar când e nevoie */}
        {currentPage === 'camera' && (
           <OpenCamera onNext={() => setCurrentPage('recorder')} />
        )}
      </div>

      {/* RECORDER PAGE */}
      <div className={`fade-layer ${currentPage === 'recorder' ? 'visible' : 'hidden'}`}>
        <TapeRecorder />
      </div>

    </div>
  )
// ...
}

export default App