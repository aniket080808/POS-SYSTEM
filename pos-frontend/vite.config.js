import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  define: {
    global: "globalThis",
  },
  esbuild: mode === "production" ? { drop: ["console", "debugger"] } : {},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router") || id.includes("react-dom") || id.includes("react/") || id.includes("@reduxjs/toolkit") || id.includes("react-redux")) {
              return "vendor-core";
            }
            if (id.includes("lucide-react") || id.includes("radix-ui") || id.includes("@radix-ui")) {
              return "vendor-ui";
            }
            if (id.includes("recharts") || id.includes("d3-")) {
              return "vendor-charts";
            }
            if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("xlsx")) {
              return "vendor-export";
            }
          }
        },
      },
    },
  },
}));
