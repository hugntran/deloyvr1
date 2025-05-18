import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  define: {
    global: "window",
  },
  server: {
    proxy: {
      "/app-data-service": {
        target: "http://18.182.12.54:8082",
        changeOrigin: true,
        secure: false,
      },
      "/identity": {
        target: "http://18.182.12.54:8080",
        changeOrigin: true,
        secure: false,
      },
      "/dispute": {
        target: "http://18.182.12.54:8086",
        changeOrigin: true,
        secure: false,
      },
      "/payment": {
        target: "http://18.182.12.54:8084",
        changeOrigin: true,
        secure: false,
      },
      "/file": {
        target: "http://18.182.12.54:8085",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("tailwindcss") || id.includes("lodash")) {
              return "vendor-utils";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
});
