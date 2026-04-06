import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    globals: false
  }
})
