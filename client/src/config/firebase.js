import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { 
  getAuth, 
  connectAuthEmulator,
  signInWithCustomToken,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import api from '../services/api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Connect to emulators ONLY when explicitly enabled via VITE_USE_EMULATOR=true
// Run: firebase emulators:start  before enabling this
if (import.meta.env.VITE_USE_EMULATOR === 'true' && !window.__FIREBASE_EMULATORS_CONNECTED__) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    window.__FIREBASE_EMULATORS_CONNECTED__ = true;
    console.log('🔧 Firebase connected to LOCAL EMULATORS (Firestore:8080, Auth:9099)');
  } catch (e) {
    // Already connected — safe to ignore
  }
}

export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
};

// Ensures the client is signed into Firebase Auth using a custom token from the backend.
// Safe to call multiple times — skips if already signed in.
export const ensureFirebaseAuth = async () => {
  if (auth.currentUser) return;
  try {
    const res = await api.get('/auth/firebase-token');
    await signInWithCustomToken(auth, res.data.token);
    console.log('Firebase auth signed in:', auth.currentUser?.uid);
  } catch (err) {
    console.warn('Firebase auth sign-in failed (non-fatal):', err?.message);
  }
};
