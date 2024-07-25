import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'
import { collection, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { db } from './firebaseConfig'

Modal.setAppElement('#root') 

export const Validation = () => {
  const [requests, setRequests] = useState([])
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [selectedRequestIndex, setSelectedRequestIndex] = useState(null)
  const [refuseComment, setRefuseComment] = useState('')

  useEffect(() => {
    //  Elle contient la logique pour récupérer les données de la collection Firestore demandes.
    const fetchRequests = async () => {
      const unsubscribe = onSnapshot(collection(db, 'demandes'), (snapshot) => {
        const storedRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setRequests(storedRequests)
      })
      return () => unsubscribe()
    }
    
    fetchRequests()
  }, [])
  //mettre à jour le statut d'une demande spécifique dans une liste de demandes
  const updateRequestStatus = async (index, status, comment = '') => {
    // requests pour éviter de modifier directement l'état actuel
    const updatedRequests = [...requests];
    // met à jour le statut de la demande spécifiée par l'index avec la nouvelle valeur de status
    updatedRequests[index].status = status;
    // met à jour le commentaire de refus de la demande spécifiée par l'index avec la nouvelle valeur de comment.
    updatedRequests[index].refuseComment = comment;
    // met à jour l'état du composant avec la nouvelle liste de demandes modifiée.
    setRequests(updatedRequests);

    const requestDocRef = doc(db, 'demandes', updatedRequests[index].id)
    await updateDoc(requestDocRef, { status, refuseComment: comment })
  };

  const handleAccept = (index) => {
    updateRequestStatus(index, 'accepted')
  };

  const handleRefuse = (index) => {
    setSelectedRequestIndex(index)
    setModalIsOpen(true)
  };

  const handleSubmitRefuse = () => {
    updateRequestStatus(selectedRequestIndex, 'refused', refuseComment)
    // ferme le modal après la soumission
    setModalIsOpen(false)
    // réinitialise le champ de commentaire de refus pour qu'il soit vide pour la prochaine utilisation.
    setRefuseComment('')
  }

  const handleDelete = async (index) => {
    const updatedRequests = [...requests]
    const [deletedRequest] = updatedRequests.splice(index, 1)
    setRequests(updatedRequests)

    const requestDocRef = doc(db, 'demandes', deletedRequest.id)
    await deleteDoc(requestDocRef)
  };

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
        return leaveType;
    }
  }

  const isNotificationType = (leaveType) => {
    return ['sick-leave', 'maternity-leave', 'moving', 'accident'].includes(leaveType)
  }

  return (
    <div className="wrapperValidation">
      <header>Validation</header>
      <div className="table-container-Validation">
        <table className="requests-table-Validation">
          <thead>
            <tr>
              <th>Nom/Prénom</th>
              <th>Email</th>
              <th>Date de début</th>
              <th>Date de fin</th>
              <th>Type de congé</th>
              <th>Raison</th>
              <th>Actions</th>
              <th>Supprimer</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr
                key={index}
                className={`request ${request.status || 'pending'} ${isNotificationType(request.leaveType) ? 'notification-type' : ''}`}
              >
                <td>{request.fullname}</td>
                <td>{request.email}</td>
                <td>{request.startDate}</td>
                <td>{request.endDate}</td>
                <td>{getTypeCongeLabel(request.leaveType)}</td>
                <td>{request.restDayComment || ''}</td>
                <td>
                  {!isNotificationType(request.leaveType) && (
                    <>
                      <button
                        className="accept-btn"
                        onClick={() => handleAccept(index)}
                        disabled={request.status === 'accepted' || request.status === 'refused'}
                      >
                        Accepter
                      </button>
                      <button
                        className="refuse-btn"
                        onClick={() => handleRefuse(index)}
                        disabled={request.status === 'accepted' || request.status === 'refused'}
                      >
                        Refuser
                      </button>
                    </>
                  )}
                </td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(index)}>X</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Motif du refus"
        
      >
        <h2 className='ModaltitleH2'>Motif du refus</h2>
        <textarea
          value={refuseComment}
          onChange={(e) => setRefuseComment(e.target.value)}
          placeholder="Entrez le motif du refus"
          className='ModalComment'
        />
        <button onClick={handleSubmitRefuse} className='btnModalSubmit'>Soumettre</button>
        <button onClick={() => setModalIsOpen(false)} className='btnModalAnnuler'>Annuler</button>
      </Modal>
    </div>
  )
}
