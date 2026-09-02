import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  optimizeDeps: {
    include: [
      "pdfjs-dist",
      "@react-pdf-viewer/core",
      "@react-pdf-viewer/default-layout",
      "@react-pdf-viewer/page-navigation",
    ],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@react-pdf-viewer") || id.includes("pdfjs-dist")) {
            return "pdf-vendor";
          }
          if (id.includes("node_modules/react") || id.includes("node_modules/zustand") || id.includes("node_modules/@tanstack")) {
            return "vendor";
          }
        },
      },
    },
  },
});
