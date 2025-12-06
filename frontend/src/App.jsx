"use client"

import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import LandingPage from "./landing_page/LandingPage";
import OpenCamera from "./open_camera/OpenCamera";
import TapeRecorder from "./TapeRecorder/TapeRecorder";

function App() {
  const navigate = useNavigate();

  return (
    <div className="app-container">

      <Routes>

        {/* LANDING PAGE */}
        <Route 
          path="/" 
          element={
            <LandingPage 
              onStart={() => navigate("/camera")} 
            />
          } 
        />

        {/* CAMERA PAGE */}
        <Route 
          path="/camera" 
          element={
            <OpenCamera 
              onNext={() => navigate("/recorder")} 
            />
          } 
        />

        {/* RECORDER PAGE */}
        <Route 
          path="/recorder" 
          element={<TapeRecorder />} 
        />

      </Routes>

    </div>
  );
}

export default App;
