import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Only scan our root index.html — ignore the stitch template HTML files
  optimizeDeps: {
    entries: ['index.html'],
  },
})
