import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from './firebaseConfig'

export const MesDemandes = () => {
  const [demandes, setDemandes] = useState([])
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const logOut = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/profil');
      } else {
        // Crée une requête pour récupérer les documents de la collection 'demandes' où l'email correspond à l'utilisateur connecté
        const q = query(collection(db, 'demandes'), where('email', '==', user.email))
        // Écoute les changements dans la collection 'demandes' en fonction de la requête
        const logOutSnapshot = onSnapshot(q, (querySnapshot) => {
          const storedDemandes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          // Trie les demandes par date de soumission en ordre décroissant
          storedDemandes.sort((a, b) => new Date(b.submitDate).getTime() - new Date(a.submitDate).getTime())
          // Met à jour l'état local 'demandes' avec le tableau trié des demandes
          setDemandes(storedDemandes)
          setNotifications(storedDemandes.filter(demande => demande.notification))
        })
        // Retourne une fonction de nettoyage pour se désabonner de l'écouteur de snapshot
        return () => logOutSnapshot()
      }
    });
    // Retourne une fonction de nettoyage pour se désabonner de l'écouteur d'authentification
    return () => logOut()
  }, [navigate])

  const getTypeCongeLabel = (leaveType) => {
    switch (leaveType) {
      case 'vacation':
        return 'Vacances';
      case 'telework':
        return 'Télétravail';
      case 'sick-leave':
        return 'Congé Maladie';
      case 'maternity-leave':
        return 'Congé Maternité';
      case 'day-off':
        return 'Journée de Repos';
      case 'half-day (morning)':
        return 'Demi-journée (Matin)';
      case 'half-day (afternoon)':
        return 'Demi-journée (Après-midi)';
      case 'moving':
        return 'Déménagement';
      case 'unpaid-vacation':
        return 'Vacances Non Payé';
      case 'accident':
        return 'Accident';
      case 'training-leave':
        return 'Congés de formation';
      default:
        return leaveType; // Pour gérer les types non listés
    }
  }
  // Fonction qui vérifie si le type de congé doit être traité comme une notification
  const isNotificationType = (leaveType) => {
    return ['sick-leave', 'maternity-leave', 'moving', 'accident'].includes(leaveType)
  }

  const handleDelete = async (index) => {
    // Récupère la demande à supprimer en utilisant l'index
    const demandeToDelete = demandes[index];
    // Supprime le document correspondant dans la collection 'demandes' de Firestore
    await deleteDoc(doc(db, 'demandes', demandeToDelete.id))
    // Met à jour l'état des demandes en filtrant la demande supprimée
    setDemandes(demandes.filter((_, i) => i !== index))
  }

  return (
    <div className="wrapperMesDemandes">
      <header>Mes Demandes</header>
      {notifications.length > 0 && (
        <div className="notifications">
          <h2>Notifications</h2>
          <ul>
            {notifications.map((notification, index) => (
              <li key={index}>{notification.notification}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="labels">
        <label htmlFor="approuver" className="LabelMesDemandes approved">
          <span className="circle"></span> Approuvé
        </label>
        <label htmlFor="refuser" className="LabelMesDemandes refuser">
          <span className="circle"></span> Refusé
        </label>
        <label htmlFor="enAttente" className="LabelMesDemandes pendingg">
          <span className="circle"></span> En attente d'approbation
        </label>
        <label htmlFor="notification" className="LabelMesDemandes notification">
          <span className="circle"></span> Notification
        </label>
      </div>
      <table className="requests-table-Mes-Demandes">
        <thead>
          <tr>
            <th>Date de début</th>
            <th>Date de fin</th>
            <th>Type de congé</th>
            <th>Statut</th>
            <th>Commentaire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {demandes.map((demande, index) => (
            <tr
              key={index}
              className={`demande ${demande.status || 'pending'} ${isNotificationType(demande.leaveType) ? 'notification-type' : ''}`}
            >
              <td>{demande.startDate}</td>
              <td>{demande.endDate}</td>
              {/* Affiche une étiquette lisible du type de congé en utilisant getTypeCongeLabel. */}
              <td>{getTypeCongeLabel(demande.leaveType)}</td>
              {/* Affiche le statut de la demande uniquement si le type de congé n'est pas une notification, sinon affiche une chaîne vide. */}
              <td>{isNotificationType(demande.leaveType) ? '' : demande.status}</td>
              <td>{demande.refuseComment || ''}</td>
              <td>
                <button className="delete-btn-Mes-Demandes" onClick={() => handleDelete(index)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
