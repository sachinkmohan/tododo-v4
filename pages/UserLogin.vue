<template>
  <!-- Removed v-main, v-container, v-row, v-col, v-card, v-card-text in favor of standard HTML -->
  <main>
    <div class="login-container">
      <!-- Changed v-btn to standard button with custom class -->
      <button class="login-button" @click="handlesignInWithGoogle">
        Sign in with Google
      </button>
      <p class="text-h1 bg-green mt-1">Hello</p>
      <!-- Kept the test results display area -->
      <div v-if="testResult" class="result-display">
        <pre>{{ testResult }}</pre>
      </div>
    </div>
  </main>
</template>

<script>
import { db } from "../firebase/index";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default {
  data() {
    return {
      userName: null,
      // Added test result data property to display Firestore results
      testResult: null,
    };
  },
  methods: {
    handlesignInWithGoogle() {
      const provider = new GoogleAuthProvider();
      const auth = getAuth();

      // Simplified auth flow without persistence
      signInWithPopup(auth, provider)
        .then(async (result) => {
          const user = result.user;
          const userName = user.displayName.split(" ")[0];
          this.userName = userName; // Store username for display

          // Test Firestore read operation
          try {
            const userDoc = await getDoc(doc(db, "users", userName));

            if (userDoc.exists()) {
              // Success case - display the user data
              this.testResult =
                "User exists: " + JSON.stringify(userDoc.data(), null, 2);
              console.log("User data:", userDoc.data());
            } else {
              // User doesn't exist - create minimal test data
              const userData = {
                name: userName,
                uid: user.uid,
                email: user.email,
                testTimestamp: new Date().toISOString(),
              };

              await setDoc(doc(db, "users", userName), userData);
              this.testResult =
                "Created new user: " + JSON.stringify(userData, null, 2);
              console.log("New user created:", userData);
            }
          } catch (e) {
            // Error handling
            this.testResult = "Error: " + e.message;
            console.error("Firestore error:", e);
          }
        })
        .catch((error) => {
          this.testResult = "Auth error: " + error.message;
          console.error("Auth error:", error);
        });
    },
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.login-button {
  width: 100%;
  padding: 10px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.login-button:hover {
  background-color: #3367d6;
}

.result-display {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f8f9fa;
  overflow-x: auto;
}
</style>
