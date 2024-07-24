import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoc, doc } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from './firebaseConfig'

export const Profil = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Authentifie l'utilisateur avec son email et mot de passe
        const identifiantsU = await signInWithEmailAndPassword(auth, email, password)
        const user = identifiantsU.user // Récupère l'utilisateur authentifié

        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()

          // Vérifie si l'utilisateur est un administrateur
          if (userData.admin) {
            navigate('/validation')
          } else {
            navigate('/demandes')
          }
        } else {
          throw new Error(`User with uid ${user.uid} doesn't exist in database!`)
        }
      } catch (error) {
        // En cas d'erreur, récupère le code et le message de l'erreur
        const errorCode = error.code
        const errorMessage = error.message
        console.error('Error logging in:', errorCode, errorMessage)
      }
  }

  return (
    <div className="wrapperLoggin">
      <header>Login Form</header>
      <form onSubmit={handleSubmit} id="loginForm">
        <div className="fieldEmail emailLogIn">
          <div className="input-area">
            <input 
              type="text" 
              placeholder="Email Address" 
              id="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="fieldPass passwordLogin">
          <div className="input-area">
            <input 
              type="password" 
              id="Password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" id="btnLogin">Login</button>
      </form>
    </div>
  )
}
