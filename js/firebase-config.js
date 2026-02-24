/* ============================================================
   GAMEFORGE — FIREBASE CONFIGURATION
   Replace the values below with your Firebase project config.
   Get them from: Firebase Console → Project Settings → General
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyD9iR6uNGDAvkwTnNik_M7T762Dwaw5tDA",
  authDomain: "game-studio-sim.firebaseapp.com",
  projectId: "game-studio-sim",
  storageBucket: "game-studio-sim.firebasestorage.app",
  messagingSenderId: "905521810445",
  appId: "1:905521810445:web:dd4306b601f352412dd944",
  measurementId: "G-WQJDVWR7L1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Exported handles (used across all JS files)
const db   = firebase.firestore();
const auth = firebase.auth();

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true }).catch(() => {
  // Persistence may fail in private/incognito mode — safe to ignore
});

console.log('[GameForge] Firebase initialized');
