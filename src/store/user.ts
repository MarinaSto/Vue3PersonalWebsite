import { defineStore } from "pinia";
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut,
} from "../firebase";
console.log("TRE")
const firebaseAuth = getAuth();

export const userStore = defineStore("main", {
    state: () => ({
        isUserLogged: false,
        userName: "Guest",
        userProfilePicture: "Guest",
    }),
    actions: {
        initFirebaseAuth() {
            // Listen to auth state changes.
            onAuthStateChanged(getAuth(), this.authStateObserver);
        },
        authStateObserver(user) {
            if (user) {
                this.userProfilePicture = this.getProfilePicUrl();
                this.userName = this.getUserName();
                this.isUserLogged = true;
            } else {
                this.isUserLogged = false;
            }
        },
        async signIn() {
            // Sign in Firebase using popup auth and Google as the identity provider.
            const provider = new GoogleAuthProvider();
            await signInWithPopup(firebaseAuth, provider);
        },
        signOutUser() {
            // Sign out of Firebase.
            signOut(firebaseAuth);
        },
        isSignedIn() {
            return !!getAuth().currentUser;
        },// Returns the signed-in user's profile Pic URL.
        getProfilePicUrl() {
            return getAuth().currentUser?.photoURL || "/profile_placeholder.png";
        },
        // Returns the signed-in user's display name.
        getUserName() {
            return getAuth().currentUser?.displayName || "Guest";
        }
    }
})