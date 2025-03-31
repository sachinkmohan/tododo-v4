<script setup lang="ts"></script>

<template>
  <div>
    <v-img
      src="/icons/image-task-144x144.png"
      :width="$vuetify.display.mdAndUp ? 100 : 70"
      class="mx-auto rounded-xl"
    ></v-img>
  </div>
  <RouterView />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
