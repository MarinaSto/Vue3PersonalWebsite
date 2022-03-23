<script setup lang="ts"></script>

<template>
  <main>
    <div class="">
      <q-parallax :height="550">
        <template v-slot:media>
          <video
            style="object-fit: cover; opacity: 0.3"
            height="440"
            autoplay
            loop
            muted
          >
            <source type="video/webm" src="@/assets/backgroundVideo.mp4" />
            <source type="video/mp4" src="@/assets/backgroundVideo.mp4" />
          </video>
        </template>
        <transition
          appear
          enter-active-class="animated fadeIn"
          :duration="1000"
        >
          <img
            alt="Anicinbici logo"
            class="logo"
            src="/logo.png"
            width="225"
            height="225"
          />
        </transition>
      </q-parallax>
    </div>
  </main>
</template>

<style></style>
