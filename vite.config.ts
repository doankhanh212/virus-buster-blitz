// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Build a Vercel-compatible bundle (.vercel/output) so `vercel deploy` works.
  // Without this, the deploy plugin is skipped outside the Lovable sandbox and
  // Vercel serves nothing → 404. Override the preset via NITRO_PRESET if you
  // deploy somewhere else (e.g. "node-server", "cloudflare-module").
  nitro: { preset: process.env.NITRO_PRESET || "vercel" },
});
