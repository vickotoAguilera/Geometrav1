import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export const firebaseConfig = {
  "apiKey": "AIzaSyCAmqE1-QKZqJJ59zyHgwhg7szwFffZbcg",
  "authDomain": "geogebra-476523.firebaseapp.com",
  "projectId": "geogebra-476523",
  "storageBucket": "geogebra-476523.appspot.com",
  "messagingSenderId": "929725972973",
  "appId": "1:929725972973:web:43969e5859f54ef8b2a7e4",
  "measurementId": "G-4517Z1F1CS"
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth };
