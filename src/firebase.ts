/* TODO: a more elegant approach is to use boot file to initialize the firebase
 https://quasar.dev/quasar-cli-vite/boot-files */
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD7-xqz2UouV2US39Y6f2HsQ4HEiZBgFXQ",
  authDomain: "amicinbiciwebpage.firebaseapp.com",
  projectId: "amicinbiciwebpage",
  storageBucket: "amicinbiciwebpage.appspot.com",
  messagingSenderId: "607208447023",
  appId: "1:607208447023:web:cd2f1a23f19af3d8657ada",
  measurementId: "G-X1L24HY4EM",
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

export { firestore };
