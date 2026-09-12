import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the built app works when served from a subpath, e.g.
  // GitHub Pages project sites (https://<user>.github.io/<repo>/) — the
  // repo name doesn't need to be hardcoded here or in the deploy workflow.
  base: "./",
})
