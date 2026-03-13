import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Use repo-name base path for GitHub Pages builds, but keep local dev at root.
  base: command === 'build' ? '/Expense-Tracker/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    // Expose dev server to other devices on your Wi‑Fi (phone/tablet)
    host: true,
    port: 5173,
    strictPort: false,
  },
}))
