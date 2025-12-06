import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:5000'

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const res = await axios.get(`${API_URL}/items`)
    setItems(res.data)
  }

  const addItem = async (e) => {
    e.preventDefault()
    await axios.post(`${API_URL}/items`, { name })
    setName('')
    fetchItems()
  }

  return (
    <div className="container mt-5">
      <h1>Hackathon App</h1>
      
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
    </div>
  )
}

export default App