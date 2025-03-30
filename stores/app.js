import { defineStore } from "pinia";
import { ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";

import { doc, getDoc } from "firebase/firestore";

export const useAppStore = defineStore("app", () => {
  const uid = ref("");
  const name = ref("");
  const level = ref(0);
  const isUserLoggedIn = ref(false);
  const partner = ref("");
  const friend = ref("");
  const todoistToken = ref("");
  const habits = ref([]);

  const initializeStore = async () => {
    const auth = getAuth();
    try {
      onAuthStateChanged(auth, async (user) => {
        if (user && user.displayName) {
          const userName = user.displayName.split(" ")[0];
          console.log("userName from mounted", userName);
          if (userName) {
            const docRef = doc(db, "users", userName);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              setUserData(docSnap.data());
            } else {
              console.log("No such document!");
            }
          } else {
            console.log("userName is undefined");
          }
        } else {
          console.log("user or user.displayName is undefined");
        }
      });
    } catch (error) {
      console.error("Error initializing store:", error);
    }
  };

  function setHabitsData(habits) {
    habits.value = habits;
  }

  function resetUserData() {
    uid.value = "";
    name.value = "";
    level.value = 0;
    isUserLoggedIn.value = false;
  }

  function setUserData(userData) {
    uid.value = userData.uid;
    name.value = userData.name;
    level.value = userData.level;
    isUserLoggedIn.value = userData.isUserLoggedIn;
    partner.value = userData.partner;
    friend.value = userData.friend;
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
    setUserData,
    initializeStore,
  };
});
