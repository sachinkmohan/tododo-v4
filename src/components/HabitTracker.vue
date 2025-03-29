<template>
  <div>
    <v-card :color="habitColor">
      <v-card-text class="text-subtitle-1">
        {{ habit.title }}
      </v-card-text>
      <p class="mb-0">{{ habit.weeklyProgress }}/{{ habit.weeklyTarget }}</p>
      <p>{{ habit.yearlyProgress }}/{{ yearlyTarget }}</p>
      <v-progress-circular
        :value="currentWeekProgress"
        :total="habit.weeklyTarget"
        class="mx-1"
        color="blue"
        size="50"
        ><strong
          >{{ Math.ceil(currentWeekProgress) }}%</strong
        ></v-progress-circular
      >
      <v-progress-circular
        :value="currentYearProgress"
        :total="yearlyTarget"
        color="blue"
        size="50"
        ><strong
          >{{ Math.ceil(currentYearProgress) }}%</strong
        ></v-progress-circular
      >
      <v-btn class="ml-2" @click="updateYesterdayProgress"
        ><v-icon>mdi-arrow-left-drop-circle-outline</v-icon></v-btn
      >
      <v-btn class="ml-2" @click="updateProgress"
        ><v-icon>mdi-numeric-positive-1</v-icon></v-btn
      >
      <v-btn class="ml-2" @click="resetWeeklyProgress"
        ><v-icon>mdi-numeric-negative-1</v-icon></v-btn
      >
      <v-btn class="ml-2" @click="deleteHabit"
        ><v-icon>mdi-delete</v-icon></v-btn
      >
      <v-btn
        class="ml-2"
        @click="pauseProgress"
        :color="habit.completedAt === 'Paused' ? 'green' : 'white'"
        ><v-icon>mdi-bell-sleep-outline</v-icon></v-btn
      >

      <!-- category as a chip -->
      <v-chip class="ma-2" color="blue" text-color="white">
        {{ habit.category }}
      </v-chip>
      <!-- frequency as a chip -->
      <v-chip class="ma-2" color="blue" text-color="white">
        {{ habit.frequency }}
      </v-chip>
      <p>{{ formatCompletedAt }}</p>
    </v-card>
  </div>
</template>

<script>
export default {
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
    updateProgress() {
      this.habit.weeklyProgress += 1;
      this.habit.yearlyProgress += 1;
      this.habit.completedAt = new Date().toISOString();
      this.$emit("update", this.habit);
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
