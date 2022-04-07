<script setup lang="ts">
import { ref } from "vue";
import { Season, Episode } from "../firebase";

const season = ref<Season | undefined>(undefined);
const episode = ref<Episode | undefined>(undefined);
Season.getByNumber(2).then((res) => {
  season.value = res;
  if (!res) {
    return;
  }
  res.getEpisodeByNumber(2).then((resEpisode) => {
    episode.value = resEpisode;
  });
});
</script>

<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row">
        <div class="col-4 q-pr-sm" style="position: relative">
          <img
            style="width: 100%"
            src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2062&q=80"
          />
          <q-card class="my-card">
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
                  Season <span v-if="season">{{ season.seasonNumber }}</span>
                  Ciclabile dell' Alta val di Non
                </div>

                <div
                  class="col-auto text-grey text-caption q-pt-md row no-wrap items-center"
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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
                euismod commodo tellus, a lobortis dolor elementum quis.
                Vestibulum eget ipsum non sem scelerisque consequat. Orci varius
                natoque penatibus et magnis dis parturient montes, nascetur
                ridiculus mus. Fusce sit amet nisl a nibh sagittis dapibus in ac
                metus. Pellentesque et arcu a nibh aliquam malesuada. Quisque
                malesuada dictum nunc non semper. Curabitur ut auctor metus.
                Vivamus tristique diam in auctor lobortis. Duis elit dui,
                scelerisque at mi eget, placerat volutpat tortor. Curabitur
                ligula leo, laoreet non porta id, sollicitudin in nulla. In hac
                habitasse platea dictumst. Aenean in vulputate metus.
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions>
              <q-btn flat round icon="event" />
              <q-btn flat color="primary"> Reserve </q-btn>
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
