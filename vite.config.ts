import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { homeShareHead } from './src/data/socialShare.ts'

// Custom domain: https://www.predictionscience.org/ (served from the domain root)
export default defineConfig(() => ({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'ips-share-meta',
      transformIndexHtml(html: string) {
        const marker = '<!--og-share-->'
        if (!html.includes(marker)) return html
        return html.replace(marker, homeShareHead())
      },
    },
  ],
  server: {
    host: true,
  },
}))
