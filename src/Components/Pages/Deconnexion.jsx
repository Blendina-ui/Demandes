import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from './firebaseConfig'

export const Deconnexion = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Appelle la fonction signOut pour déconnecter l'utilisateur
    signOut(auth)
      .then(() => {
        // Si la déconnexion réussit, navigue vers la page /profil
        navigate('/profil')
      })
      .catch((error) => {
        console.error('Error signing out:', error)
      });
  }, [navigate])

  return null
}
