import { createRouter, createWebHistory } from "vue-router";
import HelloWorld from "../src/components/HelloWorld.vue";
import UserLogin from "../pages/UserLogin.vue";

const routes = [
  {
    path: "/home",
    name: "Home",
    component: HelloWorld,
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
