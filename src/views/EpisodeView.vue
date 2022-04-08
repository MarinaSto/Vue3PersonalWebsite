<script setup lang="ts">
import { ref } from "vue";
import { Season, Episode } from "../firebase";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
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
const season = ref<Season | undefined>(undefined);
const episode = ref<Episode | undefined>(undefined);

Season.getByNumber(getSeasonNumber()).then((res) => {
  season.value = res;
  if (!res) {
    return;
  }
  res.getEpisodeByNumber(getEpisodeNumber()).then((resEpisode) => {
    $q.loadingBar.stop();
    episode.value = resEpisode;
  });
});
</script>

<template>
  <q-ajax-bar />
  <q-page padding v-if="season && episode">
    <div class="q-pa-md">
      <div class="row">
        <div class="col-4 q-pr-sm" style="position: relative">
          <img
            style="width: 100%"
            src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2062&q=80"
          />
          <q-card class="my-card shadow-4">
            <q-img
              style="height: 150px"
              src="https://images.unsplash.com/photo-1604748954134-457791b2ce9b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bXRifGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
            />

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
                  {{ episode.title }}
                </div>

                <div
                  class="
                    col-auto
                    text-grey text-caption
                    q-pt-md
                    row
                    no-wrap
                    items-center
                  "
                >
                  <q-icon name="place" />
                  250 ft
                </div>
              </div>
              <div class="text-grey-8 row items-center">
                <q-icon name="timer" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">
                  02:00h
                </div>
                <q-icon name="south_east" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">700 m</div>
                <q-icon name="north_east" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">670 m</div>
                <q-icon name="straighten" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">40 km</div>
                <q-icon name="landscape" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">
                  1330 slm
                </div>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="text-caption text-grey">
                {{ episode.description }}
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions>
              <div class="text-secondary row items-center">
                <q-btn flat>
                  Stagione &nbsp;<span>{{ season.seasonNumber }}</span>
                </q-btn>
                <q-icon name="east" class="q-mr-md" />
                <div>
                  Episodio &nbsp;<span>{{ episode.episodeNumber }}</span>
                </div>
              </div>
            </q-card-actions>
          </q-card>
        </div>
        <div class="col-8 q-pl-sm">
          <q-card class="my-card" style="height: 500px" v-if="episode">
            <iframe
              width="100%"
              height="100%"
              :src="episode.videoUrl"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style></style>
