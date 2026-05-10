import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// During local development, resolve `bakerui` directly to the package source
// so changes hot-reload without needing to rebuild the lib.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/bakerui/" : "/",
  plugins: [react()],
  resolve: {
    // Use the array form so the alias only matches the bare specifier
    // `bakerui` — subpaths like `bakerui/themes/brutalist.css` fall through
    // to normal package resolution (package.json `exports`).
    alias: [
      {
        find: /^bakerui$/,
        replacement: resolve(__dirname, "../../packages/bakerui/src/index.ts"),
      },
    ],
  },
  server: {
    port: 5173,
    open: true,
    // Listen on all network interfaces so the dev server is reachable from
    // other devices on the same wifi (e.g. mobile testing). Vite prints both
    // the localhost URL and the LAN URL on startup.
    host: true,
  },
}));
