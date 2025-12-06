"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import LandingPage from "./landing_page/LandingPage"
import MainApp from "./components/MainApp"
import "./App.css"

const API_URL = "http://localhost:5000"

function App() {
  const [items, setItems] = useState([])
  const [name, setName] = useState("")
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_URL}/items`)
      setItems(res.data)
    } catch (error) {
      console.error("Backend-ul nu răspunde, dar e ok, lucrăm la frontend", error)
    }
  }

  const addItem = async (e) => {
    e.preventDefault()
    if (!name) return
    await axios.post(`${API_URL}/items`, { name })
    setName("")
    fetchItems()
  }

  if (!gameStarted) {
    return <LandingPage onStart={() => setGameStarted(true)} />
  }

  return (
    <MainApp
      items={items}
      name={name}
      setName={setName}
      addItem={addItem}
      onBackToStart={() => setGameStarted(false)}
    />
  )
}

export default App
