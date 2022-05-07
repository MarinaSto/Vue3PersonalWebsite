<script setup lang="ts">
import { DocumentReference, updateDoc } from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref as storegeRef,
  uploadBytesResumable,
} from "firebase/storage";
import { ref } from "vue";
import { createEpisode } from "../api/firestoreApi";
import { Episode, Season } from "../api/interfaces";

const props = defineProps<{
  seasonRef?: DocumentReference<Season>;
}>();

const seasons = [1, 2, 3, 4];
const season = ref(null);
const fileInput = ref(null);
const title = ref<undefined | string>(undefined);
// const gallery = ref(null);
const videoUrl = ref<undefined | string>(undefined);
const description = ref<undefined | string>(undefined);
const episodeNumber = ref<undefined | number>(undefined);
const gpxFile = ref<File | undefined>(undefined);
const gpx = ref<string | null>(null);
const dialog = ref(false);
const maximizedToggle = ref(true);

const urlRules = [
  (v: string) => !!v || "Inserisci l' url del video.",
  (v: string) =>
    /https?:[0-9]*\/\/[\w!?/\-_~=;,*&@#$%\]]+/.test(v) ||
    "Devi usare un url valida.",
  (v: string) =>
    (v && v.includes("www.youtube.com/")) ||
    "Devi usare il link del video di youtube.",
  (v: string) =>
    (v && v.includes("/embed/")) ||
    "Stai usando il link sbagliato, devi incorporare il video, clicca su condivisi e poi su incorpora.",
];
function removeGpx() {
  gpxFile.value = undefined;
  gpx.value = null;
}
function onReset() {
  season.value = null;
  title.value = undefined;
  // gallery.value = null;
  videoUrl.value = undefined;
  description.value = undefined;
  episodeNumber.value = undefined;
  gpxFile.value = undefined;
  gpx.value = null;
}
async function onSubmit() {
  if (!props.seasonRef) {
    return;
  }

  try {
    if (!gpxFile.value) return;
    const episodeRef: DocumentReference<Episode> = await createEpisode(
      props.seasonRef,
      new Episode({
        title: title.value,
        episodeNumber: episodeNumber.value,
        videoUrl: videoUrl.value,
        description: description.value,
        gpx: gpx.value,
      })
    );

    // 2 - Upload the gpx to Cloud Storage.
    const filePath = `gpx/${episodeRef.id}/${gpxFile.value?.name}`;
    const newGpxRef = storegeRef(getStorage(), filePath);
    await uploadBytesResumable(newGpxRef, gpxFile.value);

    // 3 - Generate a public URL for the file.
    const publicGpxUrl = await getDownloadURL(newGpxRef);

    // 4 - Update the episode gpx placeholder with the gpx's URL.
    await updateDoc(episodeRef, {
      gpx: publicGpxUrl,
    });
  } catch (error) {
    console.error(
      "There was an error uploading the file to Cloud Storage:",
      error
    );
  }
}

function triggerInput() {
  if (fileInput.value) (fileInput.value as HTMLInputElement).click();
}

function loadGpx(e: Event) {
  const target = e.target as HTMLInputElement;
  console.log(target?.files?.[0]);
  gpxFile.value = target?.files?.[0];
}
</script>

<template>
  <div class="q-pa-md q-gutter-sm">
    <q-btn label="Aggiungi Episodio" color="secondary" @click="dialog = true" />

    <q-dialog
      v-model="dialog"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-white text-white">
        <q-bar>
          <q-space />

          <q-btn
            dense
            flat
            icon="minimize"
            @click="maximizedToggle = false"
            :disable="!maximizedToggle"
          >
            <q-tooltip v-if="maximizedToggle" class="bg-white text-primary"
              >Minimize</q-tooltip
            >
          </q-btn>
          <q-btn
            dense
            flat
            icon="crop_square"
            @click="maximizedToggle = true"
            :disable="maximizedToggle"
          >
            <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary"
              >Maximize</q-tooltip
            >
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card class="bg-white text-white">
          <q-form
            @submit="onSubmit"
            @reset="onReset"
            class="q-gutter-md q-ma-xl"
          >
            <q-select
              filled
              v-model="season"
              :options="seasons"
              label="Stagione"
              lazy-rules
              :rules="[
                (val) =>
                  (val !== null && val !== '') || 'Seleziona la stagione',
              ]"
            />
            <q-input
              filled
              v-model="title"
              label="Titolo dell' episodio"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Inserisci il titolo',
              ]"
            />
            <q-input
              filled
              v-model="episodeNumber"
              label="Numero dell' episodio"
              lazy-rules
              type="number"
              :rules="[
                (val) => (val && val.length > 0) || 'Inserisci il titolo',
              ]"
            />
            <q-input
              filled
              v-model="videoUrl"
              label="Link del video"
              lazy-rules
              :rules="urlRules"
            />
            <q-input
              filled
              v-model="description"
              type="textarea"
              label="Descrizione dell' episodio"
              lazy-rules
              :rules="[
                (val) =>
                  (val && val.length > 0) ||
                  'Inserisci la descrizione dell\' Episodio',
              ]"
            />
            <q-btn color="secondary" glossy icon="upload" @click="triggerInput"
              >GPX</q-btn
            >
            <q-chip
              v-if="gpxFile?.name"
              removable
              @remove="removeGpx()"
              color="grey"
              text-color="white"
              icon="map"
            >
              {{ gpxFile?.name }}
            </q-chip>
            <div>
              <q-btn label="Submit" type="submit" color="primary" />
              <q-btn
                label="Reset"
                type="reset"
                color="primary"
                flat
                class="q-ml-sm"
              />
            </div>
          </q-form>
        </q-card>
      </q-card>
    </q-dialog>
    <input
      hidden
      class="file-input"
      ref="fileInput"
      type="file"
      accept=".gpx"
      @change="loadGpx"
    />
  </div>
</template>

<style scoped></style>
