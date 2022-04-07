<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white" style="opacity=.8">
      <q-toolbar :scroll-offset="250" :offset="[0, 0]">
        <q-toolbar-title>
          <router-link :to="{ name: 'home' }">
            <q-avatar>
              <img src="/logo.png" />
            </q-avatar>
          </router-link>
          Amicinbici
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <RouterView />
    </q-page-container>
  </q-layout>
</template>

<style>
#app {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
