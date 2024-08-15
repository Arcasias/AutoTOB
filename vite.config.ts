import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  base: "https://arcasias.github.io/AutoTOB/",
  plugins: [svelte()],
})
