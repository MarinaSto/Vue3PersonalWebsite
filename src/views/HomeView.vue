<script setup lang="ts">
import { getSeasons, Season, Episode } from "../firebase";
import { ref } from "vue";
const seasons = ref<Season[]>([]);
const episodes = ref<Record<string, Episode[]>>({});
getSeasons().then((res) => {
  res.forEach((r) => {
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
    <q-header class="bg-primary text-white" style="opacity=.8">
      <q-toolbar :scroll-offset="250" :offset="[0, 0]">
        <q-toolbar-title>
          <q-avatar>
            <img src="/logo.png" />
          </q-avatar>
          Amicinbici
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

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
                Episode {{ episode.episodeNumber }} -> {{ episode.videoUrl }}
              </div>
            </div>
          </q-toolbar-title>
        </q-toolbar>
      </q-footer>
    </q-page-container>
  </q-layout>
</template>

<style></style>
