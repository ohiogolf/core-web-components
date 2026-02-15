import { defineConfig, type Plugin } from "vite";
import { resolve } from "path";
import { readFileSync } from "fs";

const root = import.meta.dirname;

function apiMock(): Plugin {
  const fixtures = resolve(root, "fixtures");

  return {
    name: "api-mock",
    configureServer(server) {
      server.middlewares.use("/api/metros.json", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(readFileSync(resolve(fixtures, "metros.json")));
      });

      server.middlewares.use("/api/clubs/search.json", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(readFileSync(resolve(fixtures, "clubs-search.json")));
      });
    },
  };
}

export default defineConfig({
  plugins: [apiMock()],
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
