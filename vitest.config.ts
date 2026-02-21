import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/gitworktree/**'],
    environment: 'jsdom',
    setupFiles: ['./src/lib/__tests__/setup.ts'],
  },
})
