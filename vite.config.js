import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  // Disable publicDir to avoid overlap warning when outputting to public/app
  publicDir: false,
  server: {
    port: 5173,
    strictPort: true,
    open: false,
    cors: true,
    proxy: {
      '/health': 'http://localhost:11000',
      '/api': 'http://localhost:11000'
    }
  },
  build: {
    outDir: 'public/app',
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        manualChunks: undefined,
        entryFileNames: 'app.js',
        chunkFileNames: 'app.js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
})


