/// <reference types="vitest" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'vite-plugin-build-timestamp',
    apply: 'build',
    closeBundle() {
      const now = new Date();

      const pad = (n: number) => n.toString().padStart(2, '0');

      const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

      console.log(`\n\x1b[32m✨ Build finished successfully at: ${time} ${date}\x1b[0m\n`);
    }
  }],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: "./index.html",
        "dictionary-popup": "./public/dictionary-popup.html",
        "thank-you": "./public/thank-you.html",
        "content-script": "./src/content-script/index.ts",
        background: "./src/background.ts",
      },
      output: {
        manualChunks: (id) => {
          // Only manually chunk the most problematic/important pieces
          if (id.includes("src/components/ui/")) {
            return "ui-components";
          }
          if (id.includes("src/services/")) {
            return "services";
          }
          if (id.includes("node_modules/react")) {
            return "react-vendor";
          }
          // Let Vite handle the rest automatically
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    silent: true,
  },
});
