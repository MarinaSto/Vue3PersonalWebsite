<script setup lang="ts">
import { ref } from "vue";

const MAP_API_KEY = "AIzaSyBViuT0T9oQmNeJSDKUWdQ6Qz3-XJ9arMY";

import { Loader, LoaderOptions } from "google-maps";
// or const {Loader} = require('google-maps'); without typescript

const options: LoaderOptions = {
  /* todo */
};
const loader = new Loader(MAP_API_KEY, options);

loader.load().then(function (google) {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
});
// TAKEN FROM https://www.npmjs.com/package/google-maps
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <body>
        <div id="map"></div>
      </body>
    </q-page-container>
  </q-layout>
</template>

<style></style>
