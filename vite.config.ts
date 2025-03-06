import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/cc-bc/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("data/tags")) {
            return "tags";
          }
          if (id.includes("data/urls")) {
            return "urls";
          }
        },
      },
    },
  },
});
