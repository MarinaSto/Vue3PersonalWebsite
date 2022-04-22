import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "../firebase";
import { defineStore } from "pinia";
import {
  addDoc,
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import type { Message, Item } from "../model/interfaces";
import type { User } from "firebase/auth";
const LOADING_IMAGE_URL = "https://www.google.com/images/spin-32.gif?a";

export const userStore = defineStore("main", {
  state: (): Item => {
    return {
      isUserLogged: false,
      userName: "",
      userProfilePicture: "",
      messages: [],
    };
  },
  getters: {
    orderedMessages(): Message[] {
      return this.messages.sort((a, b) => {
        if (!a.time || !b.time) return 0;
        return b.time.getTime() - a.time.getTime();
      });
    },
  },
  actions: {
    initFirebaseAuth() {
      onAuthStateChanged(getAuth(), this.authStateObserver);
      this.loadMessages();
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
    loadMessages() {
      // Create the query to load the last 12 messages and listen for new ones.
      const recentMessagesQuery = query(
        collection(getFirestore(), "messages"),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      // Start listening to the query.
      onSnapshot(recentMessagesQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const message = change.doc.data();
          const messageToModel: Message = {
            id: change.doc.id,
            name: message.name,
            profilePictureUrl: message.profilePictureUrl,
            text: message.text,
            imageUrl: message.imageUrl,
            time: new Date(message.timestamp.seconds * 1000),
          };

          if (
            change.type !== "removed" &&
            !this.messages.some(
              (msg: { id: string }) => msg.id === messageToModel.id
            )
          ) {
            this.messages.push(messageToModel);
          }
        });
      });
    },

    async saveMessage(messageText: string) {
      // Add a new message entry to the Firebase database.
      console.log("messageText ", messageText);
      try {
        await addDoc(collection(getFirestore(), "messages"), {
          name: getUserName(),
          text: messageText,
          profilePicUrl: getProfilePicUrl(),
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error writing new message to Firebase Database", error);
      }
    },
    async saveImageMessage(file: File | undefined) {
      try {
        // 1 - We add a message with a loading icon that will get updated with the shared image.
        const messageRef = await addDoc(
          collection(getFirestore(), "messages"),
          {
            name: getUserName(),
            imageUrl: LOADING_IMAGE_URL,
            profilePicUrl: getProfilePicUrl(),
            timestamp: serverTimestamp(),
          }
        );
        if (!getAuth() || !getAuth().currentUser) return;
        // 2 - Upload the image to Cloud Storage.
        const filePath = `${getAuth()?.currentUser?.uid}/${messageRef.id}/${
          file?.name
        }`;
        const newImageRef = ref(getStorage(), filePath);
        const fileSnapshot = file
          ? await uploadBytesResumable(newImageRef, file)
          : undefined;

        // 3 - Generate a public URL for the file.
        const publicImageUrl = await getDownloadURL(newImageRef);

        // 4 - Update the chat message placeholder with the image's URL.
        await updateDoc(messageRef, {
          imageUrl: publicImageUrl,
          storageUri: fileSnapshot?.metadata?.fullPath,
        });
      } catch (error) {
        console.error(
          "There was an error uploading a file to Cloud Storage:",
          error
        );
      }
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
