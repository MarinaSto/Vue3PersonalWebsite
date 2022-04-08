import { createApp } from "vue";
import { Quasar, LoadingBar } from "quasar";
import App from "./App.vue";
import router from "./router";

// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/material-icons-round/material-icons-round.css";

// Import Quasar css
import "quasar/src/css/index.sass";
// A few examples for animations from Animate.css:
import "@quasar/extras/animate/fadeIn.css";
import "@quasar/extras/animate/fadeOut.css";
import "@quasar/extras/animate/bounceInDown.css";
const app = createApp(App);

app.use(router);
app.use(Quasar, {
  plugins: {
    LoadingBar,
  },
  config: {
    loadingBar: {
      color: "primary",
      size: "10px",
      position: "bottom",
    },
  },
});

app.mount("#app");
