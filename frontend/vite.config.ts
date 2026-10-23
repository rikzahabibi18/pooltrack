import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Import dengan '@/...' menunjuk ke folder src, mis. '@/components/ui/button'
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
