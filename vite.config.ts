import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackStart(),
    nitro(),
    react(),
    tailwindcss(),
  ],

  build: {
    cssMinify: "esbuild",
  },

  resolve: {
    tsconfigPaths: true,
  },
});