<script setup lang="ts">
import { computed, ref } from "vue";
import {
  getSeasonEpisodeByNumber,
  getSeasonByNumber,
} from "../api/firestoreApi";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import type { ComputedRef } from "vue";
import type { Episode, Season } from "../api/interfaces";
import type { QueryDocumentSnapshot } from "firebase/firestore";

function getEpisodeNumber(): number {
  console.assert(
    typeof route.params.episode === "string",
    "Expected single episode, got multiple."
  );
  return parseInt(
    Array.isArray(route.params.episode)
      ? route.params.episode[0]
      : route.params.episode
  );
}
function getSeasonNumber(): number {
  console.assert(
    typeof route.params.season === "string",
    "Expected single season, got multiple."
  );
  return parseInt(
    Array.isArray(route.params.season)
      ? route.params.season[0]
      : route.params.season
  );
}

const $q = useQuasar();
$q.loadingBar.start();
const route = useRoute();
const seasonSnapshot = ref<QueryDocumentSnapshot<Season> | undefined>(
  undefined
);
const episodeSnapshot = ref<QueryDocumentSnapshot<Episode> | undefined>(
  undefined
);
getSeasonByNumber(getSeasonNumber()).then((res) => {
  seasonSnapshot.value = res;
  if (!res) {
    return;
  }
  getSeasonEpisodeByNumber(res.ref, getEpisodeNumber()).then((res) => {
    episodeSnapshot.value = res;
    $q.loadingBar.stop();
  });
});

const season: ComputedRef<{ info: Season; episode: Episode } | undefined> =
  computed(() => {
    if (!seasonSnapshot.value) return undefined;
    if (!episodeSnapshot.value) return undefined;
    return {
      info: seasonSnapshot.value.data(),
      episode: episodeSnapshot.value.data(),
    };
  });
</script>

<template>
  <q-ajax-bar />
  <q-page padding v-if="season">
    <div class="q-pa-md">
      <div class="row">
        <div class="col-4 q-pr-sm" style="position: relative">
          <img
            style="width: 100%"
            src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2062&q=80"
          />
          <q-card class="my-card shadow-4">
            <q-img style="height: 150px" :src="season.episode.gallery[0]" />
            <q-card-section>
              <q-btn
                fab
                color="primary"
                icon="place"
                class="absolute"
                style="top: 0; right: 12px; transform: translateY(-50%)"
              />

              <div class="row no-wrap items-center text-grey">
                <div class="col text-h6 ellipsis">
                  {{ season.episode.title }}
                </div>

                <div
                  class="col-auto text-grey text-caption q-pt-md row no-wrap items-center"
                ></div>
              </div>
              <div class="text-grey-8 row items-center">
                <q-icon name="timer" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">
                  {{ season.episode.duration }}s
                </div>
                <q-icon name="south_east" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">
                  {{ season.episode.downhill }} m
                </div>
                <q-icon name="north_east" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">
                  {{ season.episode.uphill }} m
                </div>
                <q-icon name="straighten" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">
                  {{ season.episode.distance / 1000 }} km
                </div>
                <q-icon name="landscape" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">
                  {{ season.episode.maxAltitude }} slm
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="text-caption text-grey">
                {{ season.episode.description }}
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions>
              <div class="text-secondary row items-center">
                <q-btn flat>
                  Stagione &nbsp;<span>{{ season.info.seasonNumber }}</span>
                </q-btn>
                <q-icon name="east" class="q-mr-md" />
                <div>
                  Episodio &nbsp;<span>{{ season.episode.episodeNumber }}</span>
                </div>
              </div>
            </q-card-actions>
          </q-card>
        </div>
        <div class="col-8 q-pl-sm">
          <q-card class="my-card" style="height: 500px">
            <iframe
              width="100%"
              height="100%"
              :src="season.episode.videoUrl"
              :title="season.episode.title"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style></style>
