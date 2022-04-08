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
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
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

  constructor(
    public dbRef: DocumentReference<DocumentData>,
    public id: string,
    public title: string,
    public episodeNumber: number,
    public videoUrl: string,
    public description: string,
    public distance: number,
    public downhill: number,
    public duration: number,
    public maxAltitude: number,
    public summary: string,
    public uphill: number,
    // public gallery: Array<string>,
  ) {
    console.log("Constructor")
  }
  static validation() {
    return {
      title: "string",
      episodeNumber: "number",
      videoUrl: "string",
      description: "string",
      distance: "number",
      downhill: "number",
      duration: "number",
      maxAltitude: "number",
      summary: "string",
      uphill: "number",
    }
  }
  static createFromDocument(episode_document: QueryDocumentSnapshot<DocumentData>): Episode {
    const data = episode_document.data();
    const validation = this.validation()
    let property: keyof typeof validation
    const episodeParam = []
    for (property in validation) {
      if (
        data[property] == null ||
        typeof data[property] != validation[property]
      ) {
        throw new Error(`got a malformed ${property} field while parsing ${episode_document.id}`);
      }
      episodeParam.push(data[property])
    }
    return new Episode(episode_document.ref, episode_document.id, ...episodeParam);
  }
}
class Season {
  id: string;
  dbRef: DocumentReference<DocumentData>;
  seasonNumber!: number;
  nEpisodes!: number;
  year!: number;
  playlist!: string;
  unsubscribe?: Unsubscribe;
  constructor(season_snapshot: QueryDocumentSnapshot<DocumentData>) {
    this.dbRef = season_snapshot.ref;
    this.id = season_snapshot.id;
    this.unsubscribe = undefined;
    this.update(season_snapshot.data());
  }
  update(season: DocumentData): void {
    if (season.n_episodes == null || typeof season.n_episodes != "number") {
      throw new Error("got a malformed n_episodes field." + season);
    }
    if (season.year == null || typeof season.year != "number") {
      throw new Error("got a malformed year field." + season);
    }
    if (season.season == null || typeof season.season != "number") {
      throw new Error("got a malformed season field." + season);
    }
    if (season.playlist_url == null || typeof season.playlist_url != "string") {
      throw new Error("got a malformed playlist field." + season);
    }
    this.nEpisodes = season.n_episodes;
    this.seasonNumber = season.season;
    this.year = season.year;
    this.playlist = season.playlist_url;
  }
  activateRealtimeUpdate() {
    this.unsubscribe = onSnapshot(this.dbRef, (doc) => {
      const seasonDoc = doc.data();
      if (seasonDoc) {
        this.update(seasonDoc);
      }
    });
  }
  deactivateRealtimeUpdate() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }

  async getEpisodes(): Promise<Episode[]> {
    const episodes: Episode[] = [];
    const episodesCol = collection(this.dbRef, "episodes");
    const episodesSnapshot = await getDocs(episodesCol);
    episodesSnapshot.docs.forEach((episode) => {
      try {
        episodes.push(Episode.createFromDocument(episode));
      } catch (err: any) {
        const { message } = err;
        console.error("Skipping episode because: ", message);
      }
    });
    return episodes;
  }
  async getEpisodeByNumber(
    episodeNumber: number
  ): Promise<Episode> {
    const episodeCol = collection(this.dbRef, "episodes");
    const q = query(episodeCol, where("episodeNumber", "==", episodeNumber));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error(`Cannot find episode with number ${episodeNumber} in season ${this.id}`);
    }
    if (querySnapshot.size > 1) {
      console.warn(
        `Multiple episodes with number ${episodeNumber} in season ${this.seasonNumber} received. Selecting the first one and discarding the others.`
      );
    }
    return Episode.createFromDocument(querySnapshot.docs[0]);
  }
  static async getByNumber(seasonNumber: number): Promise<Season | undefined> {
    const seasonsCol = collection(firestore, "seasons");
    const q = query(seasonsCol, where("season", "==", seasonNumber));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return undefined;
    }
    if (querySnapshot.size > 1) {
      console.warn(
        `Multiple seasons with the same season number ${seasonNumber} received. Selecting the first one and discarding the others.`
      );
    }
    return new Season(querySnapshot.docs[0]);
  }
  static async getFromDb(realaTimeUpdate = false): Promise<Season[]> {
    const seasonsCol = collection(firestore, "seasons");
    const seasonsSnapshot = await getDocs(seasonsCol);
    const seasons: Season[] = [];

    seasonsSnapshot.docs.forEach((season) => {
      try {
        const newSeason = new Season(season);
        if (realaTimeUpdate) {
          newSeason.activateRealtimeUpdate();
        }
        seasons.push(newSeason);
      } catch (err: any) {
        const { message } = err;
        console.error("Skipping season because: ", message);
      }
    });
    return seasons;
  }
}
export { Season, Episode };
