import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://10.0.30.21:3001", // Backend server address
        changeOrigin: true,
      },
    },
  },
});
