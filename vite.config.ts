import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Project site: https://a-jiwa.github.io/institute-for-prediction-science-website/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/institute-for-prediction-science-website/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
}))
