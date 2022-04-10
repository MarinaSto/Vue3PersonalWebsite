import { firestore } from "@/firebase";
import type {
  DocumentData,
  DocumentSnapshot,
  SnapshotOptions,
} from "@firebase/firestore";
import {
  collection,
  CollectionReference,
  DocumentReference,
  getDocs,
  query,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { Episode, Season } from "./interfaces";

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
      distance: episode.distance,
      downhill: episode.downhill,
      duration: episode.duration,
      maxAltitude: episode.maxAltitude,
      summary: episode.summary,
      uphill: episode.uphill,
      gallery: episode.gallery,
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
    return new Episode({
      title: data.title,
      episodeNumber: data.episodeNumber,
      videoUrl: data.videoUrl,
      description: data.description,
      distance: data.distance,
      downhill: data.downhill,
      duration: data.duration,
      maxAltitude: data.maxAltitude,
      summary: data.summary,
      uphill: data.uphill,
      gallery: data.gallery,
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
export { getSeasons, getEpisodes, getSeasonEpisodeByNumber, getSeasonByNumber };
