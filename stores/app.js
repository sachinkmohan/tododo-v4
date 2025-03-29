import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore("app", () => {
  const uid = ref("");
  const name = ref("");
  const level = ref(0);
  const isUserLoggedIn = ref(false);
  const partner = ref("");
  const friend = ref("");
  const todoistToken = ref("");
  const habits = ref([]);

  function setHabitsData(habits) {
    habits.value = habits;
  }

  function resetUserData() {
    uid.value = "";
    name.value = "";
    level.value = 0;
    isUserLoggedIn.value = false;
  }

  return {
    uid,
    name,
    level,
    isUserLoggedIn,
    partner,
    friend,
    todoistToken,
    habits,
    setHabitsData,
    resetUserData,
  };
});
