import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { getDoc, doc } from 'firebase/firestore'
import { auth, db } from './Pages/firebaseConfig'

export const Navbar = () => {
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        const uid = u.uid;
        try {
          const docSnap = await getDoc(doc(db, 'users', uid))
          if (docSnap.exists()) {
             // Si le document existe, met à jour l'état admin avec la valeur récupérée
            setAdmin(docSnap.data().admin)
          } else {
            console.error(`User with uid ${uid} doesn't exist in database!`)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      } else {
        setAdmin(false); // Si l'utilisateur n'est pas connecté, définit l'état admin à false
      }
    })
  }, [])
  
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/profil">Profil</Link>
        </li>
        {admin === true && (
          <>
            <li>
              <Link to="/validation">Validation</Link>
            </li>
            <li>
              <Link to="/agenda">Agenda</Link>
            </li>
          </>
        )}
        {admin === false && (
          <>
            <li>
              <Link to="/demandes">Demandes</Link>
            </li>
            <li>
              <Link to="/mesDemandes">Mes Demandes</Link>
            </li>
          </>
        )}
        {admin !== null && ( 
          <li>
            <Link to="/logout">Déconnexion</Link>
          </li>
        )}
      </ul>
    </nav>
  )
}

// export default Navbar;
