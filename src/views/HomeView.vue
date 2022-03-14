<script setup>
import LightingCanvas from "../components/LightingCanvas.vue";
</script>

<template>
  <main>
    <div>
      <img
        alt="Vue logo"
        class="logo"
        src="/logo.png"
        width="225"
        height="225"
      />
      <span>arina</span>
    </div>
    <LightingCanvas style="z-index: 1" />
  </main>
</template>

<style>
main {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
div {
  position: absolute;
  z-index: 20;
}
div span {
  color: #96ab40;
  font-size: 6em;
  text-shadow: 1px 1px hsla(0, 0%, 5%, 1), -1px -1px hsla(0, 0%, 5%, 1);
  letter-spacing: 6px;
}
</style>