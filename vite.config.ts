import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          enabled: true,
        },
        manifest: {
          icons: [
            {
              src: "/icons/image-task-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/icons/image-task-144x144.png",
              sizes: "144x144",
              type: "image/png",
              purpose: "any",
            },
          ],
        },
        injectManifest: {
          globPatterns: ["**/*.{js,css,html}"],
        },
      }),
    ],
    define: {
      "process.env.VITE_FIREBASE_API_KEY": JSON.stringify(
        env.VITE_FIREBASE_API_KEY
      ),
      "process.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(
        env.VITE_FIREBASE_AUTH_DOMAIN
      ),
      "process.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(
        env.VITE_FIREBASE_PROJECT_ID
      ),
      "process.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(
        env.VITE_FIREBASE_STORAGE_BUCKET
      ),
      "process.env.VITE_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
        env.VITE_FIREBASE_MESSAGING_SENDER_ID
      ),
      "process.env.VITE_FIREBASE_APP_ID": JSON.stringify(
        env.VITE_FIREBASE_APP_ID
      ),
      "process.env.VITE_FIREBASE_MEASUREMENT_ID": JSON.stringify(
        env.VITE_FIREBASE_MEASUREMENT_ID
      ),
    },
  };
});
