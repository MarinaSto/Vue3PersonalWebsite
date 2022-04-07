<script setup lang="ts">
import { ref } from "vue";
import { Season, Episode } from "../firebase";

const seasons = ref<Season[]>([]);
const episodes = ref<Record<string, Episode[]>>({});
Season.getFromDb(true).then((res) => {
  res.forEach((r) => {
    r.activateRealtimeUpdate();
    episodes.value[r.id] = [];
    seasons.value.push(r);
    r.getEpisodes().then((data) => {
      episodes.value[r.id] = data;
      episodes.value[r.id].sort((lhs, rhs) => {
        return lhs.episodeNumber - rhs.episodeNumber;
      });
    });
  });
  seasons.value.sort((lhs, rhs) => {
    return lhs.seasonNumber - rhs.seasonNumber;
  });
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
            <div v-for="season in seasons" :key="season.id">
              Season {{ season.seasonNumber }}
              <div v-for="episode in episodes[season.id]" :key="episode.id">
                <q-btn
                  :to="{
                    name: 'episode',
                    params: { id: episode.id },
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
