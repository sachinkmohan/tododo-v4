import { createRouter, createWebHistory } from "vue-router";
import ProgressBarTracker from "../src/components/ProgressBarTracker.vue";
import UserLogin from "../pages/UserLogin.vue";

const routes = [
  {
    path: "/home",
    name: "Home",
    component: ProgressBarTracker,
  },
  {
    path: "/",
    name: "UserLogin",
    component: UserLogin,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
