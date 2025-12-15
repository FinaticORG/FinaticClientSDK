import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
  },
  define: {
    // Define process.env for browser compatibility
    // This is needed for dependencies that use process.env
    'process.env': {},
  },
})

