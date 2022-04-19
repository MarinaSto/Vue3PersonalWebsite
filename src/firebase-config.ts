const config = {
  apiKey: "AIzaSyD7-xqz2UouV2US39Y6f2HsQ4HEiZBgFXQ",
  authDomain: "amicinbiciwebpage.firebaseapp.com",
  projectId: "amicinbiciwebpage",
  storageBucket: "amicinbiciwebpage.appspot.com",
  messagingSenderId: "607208447023",
  appId: "1:607208447023:web:cd2f1a23f19af3d8657ada",
  measurementId: "G-X1L24HY4EM",
};

export function getFirebaseConfig() {
  if (!config || !config.apiKey) {
    throw new Error(
      "No Firebase configuration object provided." +
        "\n" +
        "Add your web app's configuration object to firebase-config.js"
    );
  } else {
    return config;
  }
}
