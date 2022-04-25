<script setup lang="ts">
import CreateEpisode from "@/components/CreateEpisode.vue";
import { computed, ref } from "vue";
import {
  getSeasonEpisodeByNumber,
  getSeasonByNumber,
  getMessagesInEpisodeQuery,
  createMessage,
} from "../api/firestoreApi";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import type { ComputedRef } from "vue";
import { Message } from "../api/interfaces";
import type { Episode, Season } from "../api/interfaces";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { onSnapshot, updateDoc } from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref as storegeRef,
  uploadBytesResumable,
} from "firebase/storage";
import { userStore } from "../store/user";
import { storeToRefs } from "pinia";
import { getAuth } from "firebase/auth";
import Map from "../components/Map.vue"
const storeUser = userStore();

const store = storeToRefs(userStore());
const { isUserLogged, userName, userProfilePicture } = store;

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
    storeUser.initFirebaseAuth();
    loadMessages();
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

// Messages
const textMessage = ref("");
const fileInput = ref(null);
const messagesSnapshot = ref<QueryDocumentSnapshot<Message>[]>([]);
const LOADING_IMAGE_URL = "https://www.google.com/images/spin-32.gif?a";
const messageDescentOrder = ref(true);
const messages: ComputedRef<Array<{ id: string; data: Message }>> = computed(
  () => {
    const messages: Array<{ id: string; data: Message }> = [];
    messagesSnapshot.value?.forEach((m) => {
      messages.push({ id: m.id, data: m.data() });
    });
    if (messageDescentOrder.value) {
      messages.reverse();
    }
    return messages;
  }
);
function loadMessages() {
  if (!episodeSnapshot.value) {
    throw new Error("Reference to episode is missing");
  }
  // Create the query to load the last 12 messages and listen for new ones.
  const recentMessagesQuery = getMessagesInEpisodeQuery(
    episodeSnapshot.value.ref,
    12
  );
  // Start listening to the query.
  onSnapshot(recentMessagesQuery, (snapshot) => {
    function sortMessagesByTimestamp() {
      messagesSnapshot.value.sort((a, b) => {
        const time_a = a.data()?.timestamp?.getTime() || Infinity;
        const time_b = b.data()?.timestamp?.getTime() || Infinity;
        return time_a - time_b;
      });
    }
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        messagesSnapshot.value.push(change.doc);
        sortMessagesByTimestamp();
        return;
      }

      let el_idx = messagesSnapshot.value.findIndex((el) => {
        return el.id === change.doc.id;
      });
      if (el_idx === -1) {
        return;
      }

      if (change.type === "removed") {
        messagesSnapshot.value.splice(el_idx, 1);
        return;
      }
      if (change.type === "modified") {
        const needsReorder =
          messagesSnapshot.value[el_idx].data().timestamp !==
          change.doc.data().timestamp;
        messagesSnapshot.value.splice(el_idx, 1, change.doc);
        if (needsReorder) {
          sortMessagesByTimestamp();
        }
      }
    });
  });
}
async function saveMessage() {
  if (!episodeSnapshot.value) {
    throw new Error("Reference to episode is missing");
  }
  // Add a new message entry to the Firebase database.
  console.log("episodeSnapshot.value.ref", episodeSnapshot.value.ref);
  try {
    await createMessage(
      episodeSnapshot.value.ref,
      new Message({
        name: userName.value,
        text: textMessage.value,
        profilePictureUrl: userProfilePicture.value,
      })
    );
  } catch (error) {
    console.error("Error writing new message to Firebase Database", error);
  }
  textMessage.value = "";
}

function triggerInput() {
  if (fileInput.value) (fileInput.value as HTMLInputElement).click();
}
async function saveImage(e: Event) {
  if (!episodeSnapshot.value) {
    throw new Error("Reference to episode is missing");
  }
  const target = e.target as HTMLInputElement;
  const file = target?.files?.[0];
  // Check if the file is an image.
  if (!file || !file?.type?.match("image.*")) {
    var data = {
      message: "You can only share images",
      timeout: 2000,
    };
    console.log(data.message);
    return;
  }
  try {
    // 1 - We add a message with a loading icon that will get updated with the shared image.
    const messageRef = await createMessage(
      episodeSnapshot.value.ref,
      new Message({
        name: userName.value,
        imageUrl: LOADING_IMAGE_URL,
        profilePictureUrl: userProfilePicture.value,
      })
    );
    if (!getAuth() || !getAuth().currentUser) return;
    // 2 - Upload the image to Cloud Storage.
    const filePath = `chatImages/${messageRef.id}/${file?.name}`;
    const newImageRef = storegeRef(getStorage(), filePath);
    await uploadBytesResumable(newImageRef, file);

    // 3 - Generate a public URL for the file.
    const publicImageUrl = await getDownloadURL(newImageRef);

    // 4 - Update the chat message placeholder with the image's URL.
    await updateDoc(messageRef, {
      imageUrl: publicImageUrl,
    });
  } catch (error) {
    console.error(
      "There was an error uploading a file to Cloud Storage:",
      error
    );
  }
}
</script>

<template>
  <q-ajax-bar />
  <q-page padding v-if="season">
    <div class="q-pa-md">
      <div class="row">
        <div class="col-4 q-pr-sm" style="position: relative">
          <Map />
          <q-card class="my-card shadow-4">
            <!-- <q-img style="height: 150px" :src="season.episode.gallery[0]" /> -->
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
                <div class="text-caption text-weight-medium q-mr-md">0s</div>
                <q-icon name="south_east" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">0 m</div>
                <q-icon name="north_east" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">0 m</div>
                <q-icon name="straighten" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">0 km</div>
                <q-icon name="landscape" size="18" />
                <div class="text-caption text-weight-medium q-mr-md">0 slm</div>
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
          <CreateEpisode
            v-if="isUserLogged && episodeSnapshot"
            :seasonRef="seasonSnapshot?.ref"
          />
          <q-input
            v-if="isUserLogged && episodeSnapshot"
            outlined
            bottom-slots
            v-model="textMessage"
            :label="`Lascia un messaggio come ${userName}`"
            dense
            class="q-mt-md"
          >
            <template v-slot:before>
              <q-avatar>
                <img :src="userProfilePicture" />
              </q-avatar>
            </template>
            <template v-slot:after>
              <q-btn
                round
                color="primary"
                glossy
                icon="image"
                @click="triggerInput()"
              />
              <q-btn @click="saveMessage()" round dense flat icon="send" />
            </template>
          </q-input>

          <input
            hidden
            class="file-input"
            ref="fileInput"
            type="file"
            @change="saveImage"
          />
          <div class="q-pa-md q-gutter-md" v-if="messages.length > 0">
            <q-list bordered padding class="rounded-borders">
              <q-item-label header>Messaggi</q-item-label>

              <q-item
                clickable
                v-ripple
                v-for="message in messages"
                :key="message.id"
              >
                <q-item-section avatar top>
                  <q-avatar>
                    <img :src="message.data.profilePictureUrl" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1"
                    >{{ message.data.text
                    }}<span v-if="message.data.imageUrl"
                      ><img
                        :src="message.data.imageUrl"
                        fit="cover"
                        style="max-width: 300px; max-sheight: 150px" /></span
                  ></q-item-label>
                  <q-item-label caption lines="2">
                    <span class="text-weight-bold">{{
                      message.data.name
                    }}</span>
                  </q-item-label>
                </q-item-section>

                <q-item-section side top>
                  {{ message.data.timestamp }}
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style></style>
