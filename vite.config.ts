import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Project site: https://a-jiwa.github.io/forecasting-institute/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/forecasting-institute/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
}))
