import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";

// @ts-ignore - Ignore TypeScript error for router import path
import router from "../router";

import "@mdi/font/css/materialdesignicons.css";

// Vuetify
// @ts-ignore - Ignore TypeScript error vuetify styles
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components,
  directives,
});

const app = createApp(App);
const pinia = createPinia();

app.use(vuetify);
app.use(pinia);
app.use(router);
app.mount("#app");
