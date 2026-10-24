import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom domain: https://www.predictionscience.org/ (served from the domain root)
export default defineConfig(() => ({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
}))
