<script setup lang="ts">
import { ref } from "vue";
import { RouterView } from "vue-router";
import { firebaseAuth } from "./firebase";
import { userStore } from "./store/user";
import { storeToRefs } from "pinia";

const storeUser = userStore();
storeUser.initFirebaseAuth();
const store = storeToRefs(userStore());
const { isUserLogged, userName, userProfilePicture } = store;
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
        <q-btn
          v-if="!isUserLogged"
          color="secondary"
          label="sign-in"
          @click="storeUser.signIn()"
        />
        <template v-else>
          <p>{{ userName }}</p>
          <q-avatar>
            <img :src="userProfilePicture" />
            <q-menu touch-position>
              <q-list style="min-width: 100px">
                <q-item
                  clickable
                  v-close-popup
                  @click="storeUser.signOutUser()"
                >
                  <q-item-section>Sign out</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-avatar>
        </template>
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
