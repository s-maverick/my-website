// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
// import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// export default defineConfig({
//   tanstackStart: {
//     // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
//     // nitro/vite builds from this
//     server: { entry: "static" },
//   },
// });

// import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// export default defineConfig({
//   tanstackStart: {
//     server: { entry: "src/start.ts" },
//   },
//   nitro: {
//     preset: "netlify",
//   },
// });

// import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// export default defineConfig({
//   tanstackStart: {
//     server: { entry: "src/start.ts" },
//   },
//   nitro: {
//     preset: "netlify",
//     output: {
//       dir: ".netlify/output",
//       serverDir: ".netlify/output/server",
//       publicDir: ".netlify/output/public",
//     },
//   },
// });

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { execSync } from 'node:child_process'

// Netlify sets COMMIT_REF and URL during a deploy; locally we ask git and leave the URL empty.
function commitSha() {
  if (process.env.COMMIT_REF) return process.env.COMMIT_REF
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'dev'
  }
}
// read by index.html (%VITE_SITE_URL%) so share-preview images get an absolute URL
process.env.VITE_SITE_URL = process.env.URL ?? ''

export default defineConfig({
  define: {
    __BUILD_SHA__: JSON.stringify(commitSha().slice(0, 7)),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    TanStackRouterVite({
      target: 'react',
      // one-page site: splitting the route only adds a second download before anything shows
      autoCodeSplitting: false,
      routesDirectory: path.resolve(__dirname, 'src/routes'),
      generatedRouteTree: path.resolve(__dirname, 'src/routeTree.gen.ts'),
    }),
    tailwindcss(),
    react(),
  ],
  root: 'src',
  publicDir: path.resolve(__dirname, 'public'),
  css: {
    transformer: 'postcss',
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    cssMinify: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})