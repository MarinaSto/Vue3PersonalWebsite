<script setup lang="ts">
import { ref, computed } from "vue";
import { getEpisodes, getSeasons } from "../api/firestoreApi";
import type { ComputedRef } from "vue";
import type { Season, Episode } from "../api/interfaces";
import type { QueryDocumentSnapshot } from "firebase/firestore";

type EpisodeSeasonsBySeason = {
  [key: string]: Array<QueryDocumentSnapshot<Episode>>;
};

const seasonSnapshots = ref<Array<QueryDocumentSnapshot<Season>>>([]);
const episodeSnapshotsBySeason = ref<EpisodeSeasonsBySeason>({});
getSeasons().then((result) => {
  seasonSnapshots.value = result;
  result.forEach((seasonSnapshot) => {
    episodeSnapshotsBySeason.value[seasonSnapshot.id] = [];
    getEpisodes(seasonSnapshot.ref).then((result) => {
      episodeSnapshotsBySeason.value[seasonSnapshot.id] = result;
    });
  });
});

const seasons: ComputedRef<Array<{ info: Season; episodes: Array<Episode> }>> =
  computed(() => {
    if (seasonSnapshots.value.length === 0) return [];
    const seasons: Array<{ info: Season; episodes: Array<Episode> }> = [];
    seasonSnapshots.value.forEach((element) => {
      try {
        const seasonEpisodes: Array<Episode> = [];
        const seasonEpisodeSnapshot =
          episodeSnapshotsBySeason.value[element.id];
        seasonEpisodeSnapshot.forEach((snapshot) => {
          seasonEpisodes.push(snapshot.data());
        });
        seasons.push({ info: element.data(), episodes: seasonEpisodes });
      } catch {
        console.log("Season not ready");
      }
    });
    return seasons;
  });
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <video
        style="
          position: fixed;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          opacity: 0.8;
        "
        autoplay
        loop
        muted
      >
        <source type="video/webm" src="@/assets/backgroundVideo.mp4" />
        <source type="video/mp4" src="@/assets/backgroundVideo.mp4" />
      </video>

      <q-footer elevated class="bg-grey-8 text-white">
        <q-toolbar>
          <q-toolbar-title>
            <q-avatar>
              <img
                src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg"
              />
            </q-avatar>
            <div v-for="season in seasons" :key="season.info.seasonNumber">
              Season {{ season.info.seasonNumber }}
              <div
                v-for="episode in season.episodes"
                :key="episode.episodeNumber"
              >
                <q-btn
                  :to="{
                    name: 'episode',
                    params: {
                      episode: episode.episodeNumber,
                      season: season.info.seasonNumber,
                    },
                  }"
                  >Episode {{ episode.episodeNumber }}</q-btn
                >
                -> {{ episode.videoUrl }}
              </div>
            </div>
          </q-toolbar-title>
        </q-toolbar>
      </q-footer>
    </q-page-container>
  </q-layout>
</template>

<style></style>
