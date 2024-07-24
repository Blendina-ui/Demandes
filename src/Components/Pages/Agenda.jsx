import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from './firebaseConfig' // Ajustez ce chemin si nécessaire

export const Agenda = () => {
  const [dateDetails, setDateDetails] = useState({})
  
  useEffect(() => {
    const fetchRequests = () => {
      const unsubscribe = onSnapshot(collection(db, 'demandes'), (snapshot) => {
        const storedRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        const dateDetails = storedRequests.reduce((acc, demande) => {
          if (demande.status !== 'refused') {
            const startDate = new Date(demande.startDate)
            const endDate = new Date(demande.endDate)
            
            for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
              const dateKey = d.toISOString().split('T')[0]
              if (!acc[dateKey]) {
                acc[dateKey] = []
              }
              acc[dateKey].push(demande.fullname)
            }
          }
          return acc
        }, {})

        setDateDetails(dateDetails)
      })
      
      return () => unsubscribe()
    }
    
    fetchRequests()
  }, [])

  const tileContent = ({ date, view }) => {
    const dateKey = date.toISOString().split('T')[0]
    if (view === 'month' && dateDetails[dateKey]) {
      return (
        <>
          <ul>{dateDetails[dateKey].map((name, index) => <li key={index}>{name}</li>)}</ul>
          <div className="dot"></div>
        </>
      )
    }
    return null
  }

  return (
    <div className="wrapperAgenda">
      <header>Agenda</header>
      <Calendar
        tileContent={tileContent}
      />
    </div>
  )
}


// export default Agenda;
