<template>
  <v-app>
    <div class="d-flex justify-space-between align-center">
      <div class="d-flex ga-2">
        <v-btn
          variant="tonal"
          icon="mdi-auto-fix"
          @click="habitColorManualUpdate()"
        ></v-btn>
        <v-btn
          variant="tonal"
          icon="mdi-restart"
          @click="confirmReset()"
        ></v-btn>
      </div>
      <div>
        <v-btn variant="tonal" icon="mdi-logout" @click="logout"></v-btn>
      </div>
    </div>

    <div>
      <p v-if="showMagicText" style="background-color: green; color: aliceblue">
        Category colors updated!! 🥳
      </p>
      <p v-if="showResetText" style="background-color: blue; color: aliceblue">
        All habits reset!! 🥳
      </p>
    </div>

    <!-- show a hide button -->
    <v-btn class="my-3" @click="showInputFields = !showInputFields">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <div v-if="showInputFields" class="ma-3">
      <input class="ma-3" v-model="newHabit.title" placeholder="Titel" />
      <input
        v-model.number="newHabit.weeklyTarget"
        type="number"
        placeholder="Weekly Target"
      />
      <!-- category dropdown -->
      <v-select
        :items="categories"
        label="Category"
        v-model="newHabit.category"
      />

      <!-- Frequency Checkboxes -->
      <v-row no-gutters align="center">
        <v-checkbox
          v-model="newHabit.frequency"
          label="Daily"
          value="D"
          color="blue"
        />
        <v-checkbox
          v-model="newHabit.frequency"
          label="Weekly"
          value="W"
          color="blue"
        />
        <v-checkbox
          v-model="newHabit.frequency"
          label="Monthly"
          value="M"
          color="blue"
        />
        <v-checkbox
          v-model="newHabit.frequency"
          label="NA"
          value="NA"
          color="blue"
        />
        <p class="text-subtitle-1">
          P.S - Daily, Weekly, Monthly denotes the reminder frequency. Enter
          your goal always in weekly target. For eg. For habit - abs workout -
          if you want to do once in a week, set weekly target to 1. Say you want
          to be reminded by color coding once in a week, choose Weekly.
        </p>
      </v-row>

      <v-btn color="blue" @click="addHabit"><v-icon>mdi-plus</v-icon></v-btn>
    </div>

    <div>
      <v-checkbox
        label="Show All"
        v-model="showAllCategories"
        @update:model-value="handleShowAllChange"
      />
      <div class="category-scroll">
        <v-radio-group
          inline
          v-model="selectedCategories"
          @update:model-value="handleCategoryChange"
          class="d-flex"
        >
          <v-radio
            v-for="category in categories"
            :key="category"
            :value="category"
            :label="category"
            :class="getCategoryColor(category)"
            class="ma-1 text-caption"
          />
        </v-radio-group>
      </div>
    </div>

    <div>
      <v-list-item v-for="habit in filteredHabits" :key="habit.id">
        <HabitTracker
          :habit="habit"
          @update="updateHabitToDB"
          @delete="deleteHabitFromDB"
          @reset="resetHabitToDB"
          :habit-color="habitColor(habit)"
        />
      </v-list-item>
    </div>
  </v-app>
</template>

<script>
import HabitTracker from "../components/HabitTracker.vue";

import { db } from "../../firebase";
import { useAppStore } from "../../stores/app";
import { mapActions } from "pinia";

import { getAuth, signOut } from "firebase/auth";

import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";

export default {
  components: {
    HabitTracker,
  },
  data() {
    return {
      newHabit: {
        title: "",
        weeklyTarget: 0,
        category: "",
        frequency: "",
      },
      habits: [],
      categories: [
        "Growth & Learning",
        "Fitness",
        "Health",
        "Mind & Wellness",
        "House",
        "Work",
        "Community",
        "Relationships",
        "Fun & Recreation",
        "Finance",
        "Career",
        "Self Care",
        "Lang-Learning",
        "Adventure",
        "Other",
        "OKR",
      ],
      selectedCategories: [],
      showAllCategories: true,
      showInputFields: false,
      showMagicText: false,
      showResetText: false,
      appStore: useAppStore(),
    };
  },
  async created() {
    try {
      await this.appStore.initializeStore();
    } catch (e) {
      console.log("Error in store initializing", e);
    }
  },
  mounted() {
    this.$watch(
      () => this.appStore.name,
      () => {
        this.fetchHabits();
      },
      { immediate: true }
    );
  },
  computed: {
    filteredHabits() {
      if (this.showAllCategories)
        return this.habits.sort((a, b) => {
          return new Date(b.completedAt) - new Date(a.completedAt);
        });
      return this.habits
        .filter((habit) => this.selectedCategories.includes(habit.category))
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    },
  },
  methods: {
    ...mapActions(useAppStore, ["setHabitsData", "resetUserData"]),
    logout() {
      console.log("logout pressed");
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          // Sign-out successful.
          this.$router.push("/");

          //reset store user data
          this.appStore.resetUserData();
          console.log("signed out successfully");
        })
        .catch((error) => {
          console.log("Error signing out: ", error);
        });
    },
    addHabit() {
      if (!this.newHabit.title || this.newHabit.weeklyTarget <= 0) {
        alert("Please enter a title and a weekly target");
        return;
      }

      this.addHabitToDb();

      this.newHabit.title = "";
      this.newHabit.weeklyTarget = 0;
    },
    async addHabitToDb() {
      const userDocRef = doc(db, "users", this.appStore.name);
      const habitTrackerCollectionRef = collection(userDocRef, "habitsTracker");
      try {
        const docRef = await addDoc(habitTrackerCollectionRef, {
          title: this.newHabit.title,
          weeklyTarget: this.newHabit.weeklyTarget,
          weeklyProgress: 0,
          yearlyProgress: 0,
          completedAt: "Not updated yet",
          category: this.newHabit.category,
          frequency: this.newHabit.frequency,
        });
        console.log("Document written with ID - Add Habit to DB: ", docRef.id);
      } catch (e) {
        console.log("Error adding document: ", e);
      }
    },

    fetchHabits() {
      try {
        const userDocRef = doc(db, "users", this.appStore.name);
        const habitTrackerCollectionRef = collection(
          userDocRef,
          "habitsTracker"
        );
        const q = query(habitTrackerCollectionRef);
        onSnapshot(q, (querySnapshot) => {
          this.habits = [];
          querySnapshot.forEach((doc) => {
            this.habits.push({ id: doc.id, ...doc.data() });
          });
          console.log("Habits fetched from DB:", this.habits);
          this.appStore.setHabitsData(this.habits);
        });
      } catch (error) {
        console.log("Error fetching habits", error);
      }
    },

    async updateHabitToDB(habit) {
      const userDocRef = doc(db, "users", this.appStore.name);
      const habitTrackerCollectionRef = collection(userDocRef, "habitsTracker");
      const habitDocRef = doc(habitTrackerCollectionRef, habit.id);
      try {
        await updateDoc(habitDocRef, {
          title: habit.title,
          weeklyTarget: habit.weeklyTarget,
          weeklyProgress: habit.weeklyProgress,
          yearlyProgress: habit.yearlyProgress,
          completedAt: habit.completedAt,
        });
        console.log("Document successfully updated!");
      } catch (e) {
        console.log("Error updating document: ", e);
      }
    },

    async deleteHabitFromDB(habit) {
      const userDocRef = doc(db, "users", this.appStore.name);
      const habitTrackerCollectionRef = collection(userDocRef, "habitsTracker");
      const habitDocRef = doc(habitTrackerCollectionRef, habit.id);
      try {
        await deleteDoc(habitDocRef);
        console.log("Document successfully deleted!");
      } catch (e) {
        console.log("Error deleting document: ", e);
      }
    },
    async resetHabitToDB(habit) {
      const userDocRef = doc(db, "users", this.appStore.name);
      const habitTrackerCollectionRef = collection(userDocRef, "habitsTracker");
      const habitDocRef = doc(habitTrackerCollectionRef, habit.id);
      try {
        await updateDoc(habitDocRef, {
          weeklyProgress: habit.weeklyProgress - 1,
          yearlyProgress: habit.yearlyProgress - 1,
        });
        console.log("Document successfully updated!");
      } catch (e) {
        console.log("Error updating document: ", e);
      }
    },
    async updateHabitDueColorToDB(habit, color) {
      const userDocRef = doc(db, "users", this.appStore.name);
      const habitTrackerCollectionRef = collection(userDocRef, "habitsTracker");
      const habitDocRef = doc(habitTrackerCollectionRef, habit.id);
      try {
        await updateDoc(habitDocRef, {
          dueColor: color,
        });
        this.showMagicText = true;

        // Hide the magic text after 3 seconds
        setTimeout(() => {
          this.showMagicText = false;
        }, 3000);
      } catch (e) {
        console.log("Error updating document: ", e);
      }
    },

    resetAllHabits() {
      this.habits.forEach((habit) => {
        this.resetAllHabitToDB(habit);
      });
    },

    resetAllHabitToDB(habit) {
      if (!this.appStore.name) {
        console.error("User name is not available in the store.");
        return;
      }

      const userDocRef = doc(db, "users", this.appStore.name);

      // Ensure the habit ID is not empty
      if (!habit.id) {
        console.error("Habit ID is undefined or empty:", habit.id);
        return;
      }

      const habitTrackerCollectionRef = collection(userDocRef, "habitsTracker");
      const habitDocRef = doc(habitTrackerCollectionRef, habit.id);
      try {
        updateDoc(habitDocRef, {
          weeklyProgress: 0,
        });
        this.showResetText = true;
        console.log("All habits reset in DB updated successfully!");

        // Hide the reset text after 3 seconds
        setTimeout(() => {
          this.showResetText = false;
        }, 3000);
      } catch (e) {
        console.log("Error updating habit order in DB: ", e);
      }
    },

    timeSinceLastUpdate(habit) {
      if (!habit.completedAt) return 0;
      const lastUpdate = new Date(habit.completedAt);
      return (new Date() - lastUpdate) / (1000 * 3600); // time in hours
    },

    habitColor(habit) {
      // Check if the habit is marked to disable color coding
      if (habit.frequency.includes("NA")) return "";

      // Check if the habit has not been updated yet
      if (habit.completedAt === "Not updated yet") {
        return "light-blue";
      }

      if (habit.completedAt === "Paused") return "white";

      // Calculate the time since the last update
      const hoursSinceUpdate = this.timeSinceLastUpdate(habit);
      if (habit.frequency.includes("D")) {
        if (hoursSinceUpdate > 48) {
          return "#EF9A9A";
        } else if (hoursSinceUpdate > 24) {
          return "yellow";
        } else if (hoursSinceUpdate < 24) {
          return "#BFEE90";
        }
      } else if (habit.frequency.includes("W")) {
        if (hoursSinceUpdate > 2 * 7 * 24) {
          return "#EF9A9A"; // 2 weeks
        } else if (hoursSinceUpdate > 1 * 7 * 24) {
          return "yellow"; // 1 week
        } else if (hoursSinceUpdate < 24 * 7) {
          return "#BFEE90";
        }
      }
      return "";
    },

    habitColorManualUpdate() {
      this.habits.forEach((habit) => {
        // Check if the habit is marked to disable color coding
        if (habit.frequency.includes("NA")) return "";

        // Check if the habit has not been updated yet
        if (habit.completedAt === "Not updated yet") {
          this.updateHabitDueColorToDB(habit, "light-blue");
        }

        if (habit.completedAt === "Paused") {
          this.updateHabitDueColorToDB(habit, "white");
        }

        // Calculate the time since the last update
        const hoursSinceUpdate = this.timeSinceLastUpdate(habit);
        if (habit.frequency.includes("D")) {
          // if hoursSinceUpdate > 48 hours and not less than 24 hours, update the color to light-red
          if (hoursSinceUpdate > 72) {
            this.updateHabitDueColorToDB(habit, "#EF9A9A");
          } else if (hoursSinceUpdate > 24 && hoursSinceUpdate < 72) {
            this.updateHabitDueColorToDB(habit, "yellow");
          } else if (hoursSinceUpdate < 24) {
            this.updateHabitDueColorToDB(habit, "light-green");
          }
        } else if (habit.frequency.includes("W")) {
          if (hoursSinceUpdate > 2 * 7 * 24) {
            this.updateHabitDueColorToDB(habit, "#EF9A9A");
          } else if (hoursSinceUpdate > 1 * 7 * 24) {
            this.updateHabitDueColorToDB(habit, "yellow");
          } else if (hoursSinceUpdate < 24 * 7) {
            this.updateHabitDueColorToDB(habit, "light-green");
          }
        }
        return "";
      });
    },
    handleShowAllChange() {
      if (this.showAllCategories) {
        this.selectedCategories = [];
      }
    },
    handleCategoryChange() {
      if (this.selectedCategories.length === 0) {
        this.showAllCategories = true;
      } else {
        this.showAllCategories = false;
      }
    },
    getCategoryColor(category) {
      const habitsPresentInCategory = this.habits.filter(
        (habit) => habit.category === category
      );

      if (habitsPresentInCategory.length === 0) return "grey";

      const dueColors = habitsPresentInCategory.map((habit) => habit.dueColor);

      if (dueColors.includes("light-green")) return "light-green";
      if (dueColors.includes("yellow")) return "yellow";
      if (dueColors.includes("light-blue")) return "light-blue";
      if (dueColors.includes("#EF9A9A")) return "light-red";

      return "white";
    },
    confirmReset() {
      if (confirm("Are you sure you want to reset all habits?")) {
        this.resetAllHabits();
      }
    },
  },
};
</script>

<style scoped>
.yellow {
  background-color: yellow;
}

.light-red {
  background-color: lightcoral;
}

.light-green {
  background-color: lightgreen;
}

.light-blue {
  background-color: lightblue;
}

:deep(.v-list-item) {
  padding: 0 !important;
}

.category-scroll {
  display: flex;
  overflow-x: auto;
  padding-bottom: 8px;
}

:deep(.v-radio-group) {
  flex-shrink: 0;
}
</style>
