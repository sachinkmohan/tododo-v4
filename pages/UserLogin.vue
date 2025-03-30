<template>
  <!-- Replace v-main with standard div container -->
  <div class="login-page">
    <!-- Replace v-container with standard div -->
    <div class="login-container">
      <!-- Replace v-row and v-col with standard div -->
      <div class="login-card">
        <!-- Replace v-card with standard div -->
        <div class="card">
          <!-- Replace v-card-text with standard div -->
          <div class="card-content">
            <!-- Replace v-btn with standard button -->
            <button class="sign-in-button" @click="handlesignInWithGoogle">
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { db } from "../firebase";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, onMounted } from "vue"; // Added onMounted
import { useRouter } from "vue-router";

const router = useRouter();
const userName = ref(null);

onMounted(() => {
  const auth = getAuth();
  auth.onAuthStateChanged((user) => {
    if (user && router.currentRoute.value.name !== "Home") {
      router.push({ name: "Home" });
    }
  });
});

const handlesignInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  const auth = getAuth();

  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      return signInWithPopup(auth, provider);
    })
    .then(async (result) => {
      const user = result.user;
      const userName = user.displayName.split(" ")[0];
      const additionalUserInfo = getAdditionalUserInfo(result);
      if (additionalUserInfo?.isNewUser) {
        // user.displayName has two words, only use the first one
        const userData = {
          name: userName,
          uid: user.uid,
          level: 0,
          email: user.email,
          createdAt: user.metadata.createdAt,
          lastLoginAt: user.metadata.lastLoginAt,
          todoistKey: "",
          todoistProjectID: "123",
          partnerName: "",
          friendName: "",
        };
        // New user, create a new document with score = 0
        try {
          await setDoc(doc(db, "users", userName), userData);
          console.log("Document written with ID: ", userName);
        } catch (e) {
          console.log("Error writign document", e);
        }
        await setDoc(doc(db, "users", userName), userData);
      } else {
        const userDoc = await getDoc(doc(db, "users", userName));
        if (userDoc.exists()) {
          console.log("User exists");
        } else {
          console.log("User does not exist");
        }
      }
      if (router.currentRoute.value.name !== "Home") {
        router.push({ name: "Home" });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 100%;
  padding: 16px;
}

.login-card {
  max-width: 400px;
  margin: 0 auto;
}

.card {
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background: white;
}

.card-content {
  padding: 16px;
}

.sign-in-button {
  width: 100%;
  padding: 8px 16px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.sign-in-button:hover {
  background-color: darkblue;
}
</style>
