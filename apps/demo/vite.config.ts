import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// During local development, resolve `bakerui` directly to the package source
// so changes hot-reload without needing to rebuild the lib.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/bakerui/" : "/",
  plugins: [react()],
  // Env files live under `src/.env/` so they're co-located with the
  // demo source rather than scattered at the workspace root.
  envDir: resolve(__dirname, "src/.env"),
  resolve: {
    // Use the array form so the alias only matches the bare specifier
    // `bakerui` — subpaths like `bakerui/themes/brutalist.css` fall through
    // to normal package resolution (package.json `exports`).
    alias: [
      {
        find: /^bakerui$/,
        replacement: resolve(__dirname, "../../packages/bakerui/src/index.ts"),
      },
      {
        find: /^bakeruipro$/,
        replacement: resolve(__dirname, "../../../bakeruipro/src/index.ts"),
      },
      // CSS subpaths — point at the source so the demo doesn't need a built dist.
      {
        find: /^bakeruipro\/core\.css$/,
        replacement: resolve(__dirname, "../../../bakeruipro/src/core/core.css"),
      },
      {
        find: /^bakeruipro\/audio\.css$/,
        replacement: resolve(__dirname, "../../../bakeruipro/src/audio/audio.css"),
      },
      {
        find: /^bakeruipro\/video\.css$/,
        replacement: resolve(__dirname, "../../../bakeruipro/src/video/video.css"),
      },
      {
        find: /^bakeruipro\/calendar\.css$/,
        replacement: resolve(__dirname, "../../../bakeruipro/src/calendar/calendar.css"),
      },
      {
        find: /^bakeruipro\/commerce\.css$/,
        replacement: resolve(__dirname, "../../../bakeruipro/src/commerce/commerce.css"),
      },
      {
        find: /^bakeruipro\/pos\.css$/,
        replacement: resolve(__dirname, "../../../bakeruipro/src/pos/pos.css"),
      },
      {
        find: /^bakeruipro\/chat\.css$/,
        replacement: resolve(__dirname, "../../../bakeruipro/src/chat/chat.css"),
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
    // Allow tunneled hosts during dev. Vite blocks unknown Host headers by
    // default (CVE-2024-23331 hardening) — opting into the common tunnel
    // providers lets `cloudflared` / `ngrok` reach the dev server.
    allowedHosts: [".trycloudflare.com", ".ngrok-free.app", ".ngrok.app"],
  },
}));
