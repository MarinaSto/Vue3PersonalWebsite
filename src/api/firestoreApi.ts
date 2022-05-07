import { firestore } from "@/firebase";
import {
  addDoc,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type DocumentSnapshot,
  type SnapshotOptions,
} from "@firebase/firestore";
import {
  collection,
  CollectionReference,
  DocumentReference,
  getDocs,
  Query,
  limit,
  query,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { Episode, Season, Message } from "./interfaces";

// Get a reference to the storage service, which is used to create references in your storage bucket
// const storage = getStorage();

// Create a storage reference from our storage service
// Create a reference to 'gpx'
// const gpxRef = ref(storage, "gpxFiles");

const seasonConverter = {
  toFirestore: (season: Season) => {
    return {
      season: season.seasonNumber,
      n_episodes: season.nEpisodes,
      year: season.year,
      playlist_url: season.playlist,
    };
  },
  fromFirestore: (
    snapshot: DocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ) => {
    if (!snapshot.exists()) {
      throw new Error("Cannot find any data inside the snapshot.");
    }

    const data = snapshot.data(options);
    return new Season({
      seasonNumber: data.season,
      nEpisodes: data.n_episodes,
      year: data.year,
      playlist: data.playlist_url,
    });
  },
};

const episodeConverter = {
  toFirestore: (episode: Episode) => {
    return {
      title: episode.title,
      episodeNumber: episode.episodeNumber,
      videoUrl: episode.videoUrl,
      description: episode.description,
      gpx: episode.gpx,
    };
    // gallery: episode.gallery,
  },
  fromFirestore: (
    snapshot: DocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ) => {
    if (!snapshot.exists()) {
      throw new Error("Cannot find any data inside the snapshot.");
    }

    const data = snapshot.data(options);
    return new Episode({
      title: data.title,
      episodeNumber: data.episodeNumber,
      videoUrl: data.videoUrl,
      description: data.description,
      gpx: data.gpx,
    });
    // gallery: data.gallery,
  },
};

const messageConverter = {
  toFirestore: (message: Message) => {
    if (message.timestamp) {
      throw new Error("Concerting message with a timesstamp is not supported.");
    }
    const timestamp = serverTimestamp();
    if (message.imageUrl) {
      return {
        name: message.name,
        profilePictureUrl: message.profilePictureUrl,
        timestamp: timestamp,
        imageUrl: message.imageUrl,
      };
    }
    if (message.text) {
      return {
        name: message.name,
        profilePictureUrl: message.profilePictureUrl,
        timestamp: timestamp,
        text: message.text,
      };
    }
    return {
      name: message.name,
      profilePictureUrl: message.profilePictureUrl,
      timestamp: timestamp,
    };
  },
  fromFirestore: (
    snapshot: DocumentSnapshot<DocumentData>,
    options?: SnapshotOptions
  ) => {
    if (!snapshot.exists()) {
      throw new Error("Cannot find any data inside the snapshot.");
    }
    const data = snapshot.data(options);
    return new Message({
      name: data.name,
      profilePictureUrl: data.profilePictureUrl,
      text: data?.text,
      imageUrl: data?.imageUrl,
      timestamp: data.timestamp
        ? new Date(data.timestamp.seconds * 1000)
        : undefined,
    });
  },
};

function episodeCollection(
  seasonRef: DocumentReference<Season>
): CollectionReference<Episode> {
  return collection(seasonRef, "episodes").withConverter(episodeConverter);
}

function seasonsCollection(): CollectionReference<Season> {
  return collection(firestore, "seasons").withConverter(seasonConverter);
}

async function getSeasons(): Promise<Array<QueryDocumentSnapshot<Season>>> {
  const seasonsSnapshot = await getDocs(seasonsCollection());
  return seasonsSnapshot.docs;
}

async function getSeasonByNumber(
  seasonNumber: number
): Promise<QueryDocumentSnapshot<Season> | undefined> {
  const q = query(seasonsCollection(), where("season", "==", seasonNumber));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    console.error(
      `Cannot find season with number ${seasonNumber} in the database.`
    );
    return undefined;
  }
  if (querySnapshot.size > 1) {
    console.warn(
      `Multiple seasons with the same season number ${seasonNumber} received. Selecting the first one and discarding the others.`
    );
  }
  return querySnapshot.docs[0];
}

async function getEpisodes(
  seasonRef: DocumentReference<Season>
): Promise<Array<QueryDocumentSnapshot<Episode>>> {
  const episodesSnapshot = await getDocs(episodeCollection(seasonRef));
  return episodesSnapshot.docs;
}

async function getSeasonEpisodeByNumber(
  seasonRef: DocumentReference<Season>,
  episodeNumber: number
): Promise<QueryDocumentSnapshot<Episode> | undefined> {
  const q = query(
    episodeCollection(seasonRef),
    where("episodeNumber", "==", episodeNumber)
  );
  const queryEpisodesSnapshot = await getDocs(q);
  if (queryEpisodesSnapshot.empty) {
    console.error(
      `Cannot find episode with number ${episodeNumber} in season ${seasonRef}`
    );
    return undefined;
  }
  if (queryEpisodesSnapshot.size > 1) {
    console.warn(
      `Multiple episodes with number ${episodeNumber} in season ${seasonRef} received. Selecting the first one and discarding the others.`
    );
  }
  return queryEpisodesSnapshot.docs[0];
}

function getMessagesInEpisodeQuery(
  episodeRef: DocumentReference<Episode>,
  limitElement = 10,
  desc = true
): Query<Message> {
  return query(
    collection(episodeRef, "messages").withConverter(messageConverter),
    orderBy("timestamp", desc ? "desc" : "asc"),
    limit(limitElement)
  );
}

async function createMessage(
  episodeRef: DocumentReference<Episode>,
  message: Message
): Promise<DocumentReference<Message>> {
  return addDoc(
    collection(episodeRef, "messages").withConverter(messageConverter),
    message
  );
}

async function createEpisode(
  seasonRef: DocumentReference<Season>,
  episode: Episode
): Promise<DocumentReference<Episode>> {
  return addDoc(
    collection(seasonRef, "episodes").withConverter(episodeConverter),
    episode
  );
}

export {
  getSeasons,
  getEpisodes,
  getSeasonEpisodeByNumber,
  getSeasonByNumber,
  getMessagesInEpisodeQuery,
  createMessage,
  createEpisode,
};
