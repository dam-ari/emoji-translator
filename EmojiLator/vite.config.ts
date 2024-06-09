import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit to 1000 KB
    rollupOptions: {
      output: {
        manualChunks: {
          tfjs: [
            "@tensorflow/tfjs",
            "@tensorflow-models/universal-sentence-encoder",
          ],
        },
      },
    },
  },
});
