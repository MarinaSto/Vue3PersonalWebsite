import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "../firebase";
import { defineStore } from "pinia";
import type { LoggedUser } from "../model/interfaces";
import type { User } from "firebase/auth";

export const userStore = defineStore("main", {
  state: (): LoggedUser => {
    return {
      isUserLogged: false,
      userName: "",
      userProfilePicture: "",
    };
  },
  // getters: {
  //   orderedMessages(): Message[] {
  //     return this.messages.sort((a, b) => {
  //       if (!a.time || !b.time) return 0;
  //       return b.time.getTime() - a.time.getTime();
  //     });
  //   },
  // },
  actions: {
    initFirebaseAuth() {
      onAuthStateChanged(getAuth(), this.authStateObserver);
    },
    authStateObserver(user: User | null) {
      if (user) {
        // User is signed in!
        // Get the signed-in user's profile pic and name.
        this.userProfilePicture = getProfilePicUrl();
        this.userName = getUserName();
        this.isUserLogged = isUserSignedIn();
      } else {
        // User is signed out!
        this.userProfilePicture = "/images/profile_placeholder.png";
        this.userName = "Guest";
        this.isUserLogged = false;
      }
    },
    async signIn() {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(getAuth(), provider);
    },
    signOutUser() {
      signOut(getAuth());
    },
  },
});

function getProfilePicUrl() {
  return getAuth()?.currentUser?.photoURL || "/images/profile_placeholder.png";
}
function getUserName() {
  return getAuth()?.currentUser?.displayName || "Guest";
}
function isUserSignedIn() {
  return !!getAuth().currentUser;
}
