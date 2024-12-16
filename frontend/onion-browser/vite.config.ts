import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      VITE_DIRECTORY_AUTHORITY_URL: JSON.stringify('http://localhost:3001'),
      VITE_ENTRY_PROXY_URL: JSON.stringify('http://localhost:3002')
    }
  },
  server: {
    port: 5173,
    host: true,
    cors: true
  }
})

