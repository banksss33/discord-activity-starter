import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
				'/api': {
					target: 'http://localhost:8080',
					changeOrigin: true,
					secure: false,
				},
			},
			hmr: {
				clientPort: 443,
			},
  },
  envDir: '../'
})
