<template>
  <div class="mb-3">
    <div
      :style="{ backgroundColor: habitColor }"
      class="rounded-lg border pa-2"
    >
      <p class="text-subtitle-1 d-flex font-weight-bold align-center">
        <template v-if="!isEditing">
          <span class="flex-grow-1 text-left">{{ habit.title }}</span>
          <v-btn
            class="ml-2"
            size="small"
            icon="mdi-pencil"
            @click="editTitle"
            variant="text"
          ></v-btn>
        </template>
        <template v-else>
          <input
            v-model="editableTitle"
            @keyup.enter="saveTitle"
            @keyup.esc="cancelEdit"
            ref="titleInput"
            class="w-100"
          /><v-btn
            class="ml-2"
            size="small"
            icon="mdi-check"
            @click="saveTitle"
            color="success"
            variant="tonal"
          ></v-btn>
          <v-btn
            class="ml-2"
            size="small"
            icon="mdi-cancel"
            @click="cancelEdit"
            variant="tonal"
          ></v-btn>
        </template>
      </p>
      <div class="d-flex justify-space-between align-center mb-2">
        <div class="d-flex">
          <div>
            <p class="mb-0">
              {{ habit.weeklyProgress }}/{{ habit.weeklyTarget }}
            </p>
            <v-progress-circular
              :value="currentWeekProgress"
              :total="habit.weeklyTarget"
              class="mx-1"
              color="black"
              size="50"
              ><strong
                >{{ Math.ceil(currentWeekProgress) }}%</strong
              ></v-progress-circular
            >
          </div>
          <div>
            <p>{{ habit.yearlyProgress }}/{{ yearlyTarget }}</p>

            <v-progress-circular
              :value="currentYearProgress"
              :total="yearlyTarget"
              color="black"
              size="50"
              ><strong
                >{{ Math.ceil(currentYearProgress) }}%</strong
              ></v-progress-circular
            >
          </div>
        </div>
        <div class="flex-column">
          <div>
            <v-btn
              class="ml-2"
              size="small"
              variant="tonal"
              icon="mdi-history"
              @click="updateYesterdayProgress"
            ></v-btn>
            <v-btn
              class="ml-2"
              size="small"
              variant="tonal"
              icon="mdi-check-decagram"
              @click="updateProgress"
            ></v-btn>
            <v-btn
              class="ml-2"
              size="small"
              variant="tonal"
              icon="mdi-dots-vertical"
              @click="toggleMenu"
            ></v-btn>
          </div>

          <div v-if="menuOpen" class="mt-1">
            <v-btn
              class="ml-2"
              size="small"
              variant="tonal"
              icon="mdi-undo-variant"
              @click="resetWeeklyProgress"
            ></v-btn>
            <v-btn
              class="ml-2"
              size="small"
              variant="tonal"
              icon="mdi-delete"
              @click="deleteHabit"
            ></v-btn>
            <v-btn
              class="ml-2"
              size="small"
              variant="tonal"
              @click="pauseProgress"
              :color="habit.completedAt === 'Paused' ? 'green' : 'black'"
              icon="mdi-bell-sleep-outline"
            ></v-btn>
          </div>
        </div>
      </div>

      <div class="d-flex justify-space-between align-center">
        <div class="d-flex ga-1">
          <!-- category as a chip -->
          <v-chip color="gray">
            {{ habit.category }}
          </v-chip>
          <!-- frequency as a chip -->
          <v-chip color="gray">
            {{ habit.frequency }}
          </v-chip>
        </div>
        <div>
          <p class="text-caption">{{ formatCompletedAt }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menuOpen: false,
      isEditing: false,
      editableTitle: "",
    };
  },
  props: {
    habit: {
      type: Object,
      default: () => ({
        title: "",
        completedAt: "",
        weeklyTarget: 0,
        weeklyProgress: 0,
        yearlyProgress: 0,
      }),
      required: true,
    },
    habitColor: {
      type: String,
      required: true,
    },
  },
  computed: {
    currentWeekProgress() {
      return (this.habit.weeklyProgress / this.habit.weeklyTarget) * 100;
    },
    yearlyTarget() {
      return 52 * this.habit.weeklyTarget;
    },
    currentYearProgress() {
      return (this.habit.yearlyProgress / this.yearlyTarget) * 100;
    },
    formatCompletedAt() {
      const timestamp = this.habit.completedAt;
      if (timestamp === "Not updated yet") return timestamp;
      const completedAtDate = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - completedAtDate) / 1000);

      if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
      } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      } else if (diffInSeconds < 604800) {
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
      } else if (diffInSeconds < 2419200) {
        return `${Math.floor(diffInSeconds / 604800)} weeks / ${Math.floor(
          diffInSeconds / 86400
        )} days ago`;
      } else if (diffInSeconds < 29030400) {
        return `${Math.floor(diffInSeconds / 2419200)} months / ${Math.floor(
          diffInSeconds / 604800
        )} weeks ago`;
      } else {
        return `${Math.floor(diffInSeconds / 29030400)} years ago`;
      }
    },
  },
  methods: {
    editTitle() {
      this.editableTitle = this.habit.title;
      this.isEditing = true;
      this.$nextTick(() => {
        this.$refs.titleInput.focus();
      });
    },
    saveTitle() {
      if (!this.isEditing) return;

      if (this.editableTitle.trim()) {
        const updatedHabit = {
          ...this.habit,
          title: this.editableTitle.trim(),
        };
        this.$emit("update", updatedHabit);
        this.isEditing = false;
      } else {
        this.cancelEdit();
      }
    },
    cancelEdit() {
      this.editableTitle = this.habit.title;
      this.isEditing = false;
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    updateProgress() {
      const updatedHabit = {
        ...this.habit,
        weeklyProgress: this.habit.weeklyProgress + 1,
        yearlyProgress: this.habit.yearlyProgress + 1,
        completedAt: new Date().toISOString(),
      };
      this.$emit("update", updatedHabit);
    },
    updateYesterdayProgress() {
      this.habit.weeklyProgress += 1;
      this.habit.yearlyProgress += 1;
      // this.habit.completedAt will be yesterdays date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      this.habit.completedAt = yesterday.toISOString();
      this.$emit("update", this.habit);
    },
    pauseProgress() {
      this.habit.completedAt = "Paused";
      this.$emit("update", this.habit);
    },
    deleteHabit() {
      this.$emit("delete", this.habit);
    },
    resetWeeklyProgress() {
      this.$emit("reset", this.habit);
    },
  },
};
</script>
