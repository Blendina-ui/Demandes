import React, { useState, useEffect } from 'react'
import {  Routes, Route } from "react-router-dom"
import  { Navbar }  from "./Components/NavBar"
import  { Profil } from "./Components/Pages/Profil"
import  { Demandes } from "./Components/Pages/Demandes"
import  { MesDemandes }  from "./Components/Pages/MesDemandes"
import  { Validation }  from "./Components/Pages/Validation"
import { Deconnexion } from './Components/Pages/Deconnexion'
import { Agenda } from './Components/Pages/Agenda'


function App() {
  const [demandes, setDemandes] = useState([])

  useEffect(() => {
    const loadedDemandes = JSON.parse(localStorage.getItem('demandes'))
    if (loadedDemandes) {
      setDemandes(loadedDemandes)
    }
  }, [])

  const handleSetDemandes = (newDemandes) => {
    localStorage.setItem('demandes', JSON.stringify(newDemandes))
    setDemandes(newDemandes)
  }

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/profil" element={<Profil />} />
        <Route path="/demandes" element={<Demandes setDemandes={handleSetDemandes} />} />
        <Route
          path="/mesDemandes"
          element={<MesDemandes demandes={demandes} />}
        />
        <Route path="/validation" element={<Validation />} />
        <Route path="/logout" element={<Deconnexion />} />
        <Route path="/agenda" element={<Agenda />} />
       
      </Routes>
    </div>
  );
}

export default App;
