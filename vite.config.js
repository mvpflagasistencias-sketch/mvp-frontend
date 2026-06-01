import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Permite conexiones externas en local y producción
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173, // Dynamic port para Railway, 5173 para tu local
    strictPort: true // Evita que Vite cambie de puerto aleatoriamente en la nube
  }
})