import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let authInstance;
let dbInstance;
let storageInstance;
let googleProviderInstance;

function getFirebaseApp() {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export async function getAuthInstance() {
  if (!authInstance) {
    const { getAuth } = await import("firebase/auth");
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}

export const auth = {
  get currentUser() {
    return null;
  },
};

export const db = {};
export const storage = {};
export const googleProvider = {};

export async function getDbInstance() {
  if (!dbInstance) {
    const { getFirestore } = await import("firebase/firestore");
    dbInstance = getFirestore(getFirebaseApp());
  }
  return dbInstance;
}

export async function getStorageInstance() {
  if (!storageInstance) {
    const { getStorage } = await import("firebase/storage");
    storageInstance = getStorage(getFirebaseApp());
  }
  return storageInstance;
}

export async function getGoogleProvider() {
  if (!googleProviderInstance) {
    const { GoogleAuthProvider } = await import("firebase/auth");
    googleProviderInstance = new GoogleAuthProvider();
  }
  return googleProviderInstance;
}

export default getFirebaseApp;