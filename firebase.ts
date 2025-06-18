import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyArAuYctZMjwryxFptwdvvk2Qz9lFmyK28",
  authDomain: "xenoxy-webapp.firebaseapp.com",
  projectId: "xenoxy-webapp",
  storageBucket: "xenoxy-webapp.firebasestorage.app",
  messagingSenderId: "389451455267",
  appId: "1:389451455267:web:9733c76deb9bf5bf8a8a96",
  measurementId: "G-8M5LDT9N9D"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Analytics (optional)
export const analytics = getAnalytics(app)

export default app