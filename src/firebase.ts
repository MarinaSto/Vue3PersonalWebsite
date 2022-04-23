/* TODO: a more elegant approach is to use boot file to initialize the firebase
 https://quasar.dev/quasar-cli-vite/boot-files */
import { initializeApp } from "firebase/app";
import { getPerformance } from "firebase/performance";

import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFirebaseConfig } from "./firebase-config";

const firebaseAppConfig = getFirebaseConfig();
const firebaseApp = initializeApp(firebaseAppConfig);
const firestore = getFirestore(firebaseApp);
const firebaseAuth = getAuth();
const perf = getPerformance(firebaseApp);
perf;
firebaseAuth.useDeviceLanguage();

export {
  firestore,
  firebaseApp,
  firebaseAuth,
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
};
