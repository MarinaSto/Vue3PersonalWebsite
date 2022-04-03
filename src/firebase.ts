// initialize firebase
/* TODO: a more elegant approach is to use boot file to initialize the firebase
 https://quasar.dev/quasar-cli-vite/boot-files */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  QueryDocumentSnapshot,
  type DocumentData,
  DocumentReference,
} from "firebase/firestore/lite";
const firebaseConfig = {
  apiKey: "AIzaSyD7-xqz2UouV2US39Y6f2HsQ4HEiZBgFXQ",
  authDomain: "amicinbiciwebpage.firebaseapp.com",
  projectId: "amicinbiciwebpage",
  storageBucket: "amicinbiciwebpage.appspot.com",
  messagingSenderId: "607208447023",
  appId: "1:607208447023:web:cd2f1a23f19af3d8657ada",
  measurementId: "G-X1L24HY4EM",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

class Episode {
  id: string;
  title: string;
  episodeNumber: number;
  videoUrl: string;
  dbRef: DocumentReference<DocumentData>;
  constructor(episode: QueryDocumentSnapshot<DocumentData>) {
    if (
      episode.data().episode == null ||
      typeof episode.data().episode != "number"
    ) {
      throw new Error("got a malformed episode field." + episode);
    }
    if (
      episode.data().title == null ||
      typeof episode.data().title != "string"
    ) {
      throw new Error("got a malformed title field." + episode);
    }
    if (
      episode.data().video_url == null ||
      typeof episode.data().video_url != "string"
    ) {
      throw new Error("got a malformed videoUrl field." + episode);
    }
    this.id = episode.id;
    this.dbRef = episode.ref;
    this.episodeNumber = episode.data().episode;
    this.title = episode.data().title;
    this.videoUrl = episode.data().video_url;
  }
}
class Season {
  id: string;
  seasonNumber: number;
  nEpisodes: number;
  year: number;
  playlist: string;
  dbRef: DocumentReference<DocumentData>;
  constructor(season: QueryDocumentSnapshot<DocumentData>) {
    if (
      season.data().n_episodes == null ||
      typeof season.data().year != "number"
    ) {
      throw new Error("got a malformed n_episodes field." + season);
    }
    if (season.data().year == null || typeof season.data().year != "number") {
      throw new Error("got a malformed year field." + season);
    }
    if (season.data().season == null || typeof season.data().year != "number") {
      throw new Error("got a malformed season field." + season);
    }
    if (
      season.data().playlist == null ||
      typeof season.data().playlist != "string"
    ) {
      throw new Error("got a malformed playlist field." + season);
    }
    this.id = season.id;
    this.dbRef = season.ref;
    this.nEpisodes = season.data().n_episodes;
    this.seasonNumber = season.data().season;
    this.year = season.data().year;
    this.playlist = season.data().playlist;
  }
  async getEpisodes(): Promise<Episode[]> {
    const episodes: Episode[] = [];
    const episodesCol = collection(this.dbRef, "episodes");
    const episodesSnapshot = await getDocs(episodesCol);
    episodesSnapshot.docs.forEach((episode) => {
      try {
        episodes.push(new Episode(episode));
      } catch (err: any) {
        const { message } = err;
        console.error("Skipping episode because: ", message);
      }
    });
    return episodes;
  }
}

async function getSeasons(): Promise<Season[]> {
  const seasonsCol = collection(firestore, "seasons");
  const seasonsSnapshot = await getDocs(seasonsCol);
  const seasons: Season[] = [];
  seasonsSnapshot.docs.forEach((season) => {
    try {
      seasons.push(new Season(season));
    } catch (err: any) {
      const { message } = err;
      console.error("Skipping season because: ", message);
    }
  });
  return seasons;
}
export { getSeasons, Season, Episode };
