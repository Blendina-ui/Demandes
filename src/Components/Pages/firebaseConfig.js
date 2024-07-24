
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBfxu0JIu6eWLAi2AWTd_-qSLjykStUsCE",

  authDomain: "gestion-des-demandes.firebaseapp.com",

  projectId: "gestion-des-demandes",

  storageBucket: "gestion-des-demandes.appspot.com",

  messagingSenderId: "1032681986862",

  appId: "1:1032681986862:web:be8bd8623d2d51aa42b8bf"

};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
export { auth, db }
