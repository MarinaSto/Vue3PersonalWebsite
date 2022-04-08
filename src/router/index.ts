import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import EpisodeView from "../views/EpisodeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/season:season/episode:episode",
      name: "episode",
      component: EpisodeView,
    },
  ],
});

export default router;
