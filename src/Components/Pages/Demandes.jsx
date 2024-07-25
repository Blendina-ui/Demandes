import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { addDoc, collection, getDoc, doc } from 'firebase/firestore'
import { auth, db } from './firebaseConfig'


export const Demandes = () => {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [leaveType, setLeaveType] = useState('')
  const [halfDayTime, setHalfDayTime] = useState('') 
  const [restDayComment, setRestDayComment] = useState('') 
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

// Utilisation du hook useEffect pour exécuter du code après le rendu du composant
  useEffect(() => {
    // Écoute les changements d'état d'authentification de l'utilisateur
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUser(userData)
          setEmail(u.email) // Met à jour l'état de l'email avec l'email de l'utilisateur connecté
         
        } else {
          console.error("User document not found")
        }
      } else {
        navigate('/profil')
      }
    });
  }, [navigate])// Le tableau de dépendances inclut 'navigate' pour exécuter l'effet lorsque navigate change

  console.log(errors)
  const handleSubmit = async (e) => {
    e.preventDefault()
    

    const fullname = `${user?.firstname || ''} ${user?.lastname || ''}`.trim()

    let formErrors = {}

    if (!leaveType) {
      formErrors.leaveType = 'Veuillez sélectionner un type de congé'
    }
    if (!startDate) {
      formErrors.startDate = 'Veuillez sélectionner une date de début'
    }
    if (!endDate) {
      formErrors.endDate = 'Veuillez sélectionner une date de fin'
    }
    if (leaveType === 'half-day' && !halfDayTime) {
      formErrors.halfDayTime = 'Veuillez sélectionner un moment de la demi-journée'
    }
    if (leaveType === 'day-off' && !restDayComment) {
      formErrors.restDayComment = 'Veuillez entrer une raison pour la journée de repos'
    }

    if (Object.keys(formErrors).length > 0){
      console.log(formErrors)
      setErrors(formErrors)
      return;
    }


      
      const newDemande = {
        fullname,
        email,
        leaveType: leaveType === 'half-day' ? `Demi-journée (${halfDayTime === 'morning' ? 'Matin' : 'Après-midi'})` : leaveType,
        restDayComment: leaveType === 'day-off' ? restDayComment : '',
        startDate,
        endDate,
        submitDate: new Date().toISOString(),
        status: 'pending', 
        notification: '', 
      };

      try {
        await addDoc(collection(db, 'demandes'), newDemande)
        alert('Demande de congé soumise avec succès!')
        navigate('/MesDemandes') 
      } catch (error) {
        console.error("Error adding document: ", error)
      }
    }
  

  return (
    <div className="wrapperDemandes">
      <header>Gestion des demandes des congés</header>
      <form onSubmit={handleSubmit} id="DemandesForm">
        <div className={`field ${errors.name ? 'error' : ''}`}>
          <div className="input-area">
            <input
              type="text"
              placeholder="Nom Complet"
              value={`${user?.firstname || ''} ${user?.lastname || ''}`}
              readOnly
              disabled
            />
          </div>
        </div>
        <div className={`field ${errors.email ? 'error' : ''}`}>
          <div className="input-area">
            <input
              type="email"
              id="userEmailInput"
              placeholder="Adresse Email"
              value={email}
              readOnly
              disabled
            />
          </div>
        </div>
        <div className={`field ${errors.leaveType ? 'error' : ''}`}>
          <div className="input-area">
            <select value={leaveType} className={`${errors.leaveType ? 'error' : ''}`} onChange={(e) => setLeaveType(e.target.value)}>
              <option value="">Sélectionnez le type de congé</option>
              <option value="accident">Accident</option>
              <option value="sick-leave">Congé Maladie</option>
              <option value="maternity-leave">Congé Maternité</option>
              <option value="training-leave">Congés de formation</option>
              <option value="moving">Déménagement</option>
              <option value="half-day">Demi-journée</option>
              <option value="day-off">Journée de Repos</option>
              <option value="telework">Télétravail</option>
              <option value="vacation">Vacances</option>
              <option value="unpaid-vacation">Vacances Non Payé</option>
            </select>
          </div>
          {errors.leaveType && <div className="error error-txt">{errors.leaveType}</div>}
        </div>
        {leaveType === 'half-day' && (
          <div className={`field ${errors.halfDayTime ? 'error' : ''}`}>
            <div className="input-area">
              <label className='btnmatin'>
                <input
                  type="radio"
                  name="halfDayTime"
                  value="morning"
                  checked={halfDayTime === 'morning'}
                  onChange={(e) => setHalfDayTime(e.target.value)}
                  className='Inputmatin' 
                  
                />
                Matin
              </label>
              <label className='btnmidi Inputmidi'>
                <input
                  type="radio"
                  name="halfDayTime"
                  value="afternoon"
                  checked={halfDayTime === 'afternoon'}
                  onChange={(e) => setHalfDayTime(e.target.value)}
                  className='Inputmidi'
                />
                Après-midi
              </label>
            </div>
            {errors.halfDayTime && <div className="error error-txt">{errors.halfDayTime}</div>}
          </div>
        )}
        {leaveType === 'day-off' && (
          <div className={`field ${errors.restDayComment ? 'error' : ''}`}>
            <div className="input-area">
              <textarea
                placeholder="Raison de la journée de repos"
                value={restDayComment}
                onChange={(e) => setRestDayComment(e.target.value)}
                className={`field ${errors.restDayComment ? 'error' : ''}`}
              />
            </div>
            {errors.restDayComment && <div className="error error-txt">{errors.restDayComment}</div>}
          </div>
        )}
        <div className={`field ${errors.startDate ? 'error' : ''}`}>
          <div className="input-area">
            <input
              type="date"
              placeholder="Date de début"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`field ${errors.startDate ? 'error' : ''}`}
            />
          </div>
          {errors.startDate && <div className="error error-txt">{errors.startDate}</div>}
        </div>
        <div className={`field ${errors.endDate ? 'error' : ''}`}>
          <div className="input-area">
            <input
              type="date"
              placeholder="Date de fin"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`field ${errors.endDate ? 'error' : ''}`}
            />
          </div>
          {errors.endDate && <div className="error error-txt">{errors.endDate}</div>}
        </div>
        <input type="submit" value="Soumettre la demande" />
      </form>
    </div>
  )
}
