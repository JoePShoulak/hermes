import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/power": {
        target: "http://localhost:5000", // Replace with your backend's address
        changeOrigin: true,
      },
    },
  },
});
