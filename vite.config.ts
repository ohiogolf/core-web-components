import { defineConfig } from "vite";
import { resolve } from "path";

const root = import.meta.dirname;

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: resolve(root, "src/index.ts"),
      name: "OhioGolfCoreComponents",
      formats: ["iife"],
      fileName: () => "ohio-golf-core-components.js",
    },
    outDir: resolve(root, "dist"),
    emptyOutDir: true,
  },
});
