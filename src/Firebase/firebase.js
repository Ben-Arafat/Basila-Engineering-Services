import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let authInstance = null;
let dbInstance = null;
let storageInstance = null;
let googleProviderInstance = null;

// ========================================
// FIREBASE APP
// ========================================

export function getFirebaseApp() {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  return app;
}

// ========================================
// FIREBASE AUTH
// ========================================

export async function getAuthInstance() {
  if (!authInstance) {
    const { getAuth } = await import("firebase/auth");

    authInstance = getAuth(getFirebaseApp());
  }

  return authInstance;
}

// ========================================
// FIRESTORE
// ========================================

export async function getDbInstance() {
  if (!dbInstance) {
    const { getFirestore } = await import("firebase/firestore");

    dbInstance = getFirestore(getFirebaseApp());
  }

  return dbInstance;
}

// ========================================
// STORAGE
// ========================================

export async function getStorageInstance() {
  if (!storageInstance) {
    const { getStorage } = await import("firebase/storage");

    storageInstance = getStorage(getFirebaseApp());
  }

  return storageInstance;
}

// ========================================
// GOOGLE PROVIDER
// ========================================

export async function getGoogleProvider() {
  if (!googleProviderInstance) {
    const { GoogleAuthProvider } = await import("firebase/auth");

    googleProviderInstance = new GoogleAuthProvider();

    // Optional: force Google account selection
    googleProviderInstance.setCustomParameters({
      prompt: "select_account",
    });
  }

  return googleProviderInstance;
}