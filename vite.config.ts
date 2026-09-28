import { defineConfig, type Connect } from 'vite'
import { resolve } from 'path'

const serveMotionIndex: Connect.NextHandleFunction = (req, _res, next) => {
  const path = req.url?.split('?')[0]
  if (path === '/motion' || path === '/motion/') {
    req.url = '/motion/index.html'
  }
  if (path === '/thomas' || path === '/thomas/') {
    req.url = '/thomas/index.html'
  }
  next()
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'motion-index',
      configureServer(server) {
        server.middlewares.use(serveMotionIndex)
      },
      configurePreviewServer(server) {
        server.middlewares.use(serveMotionIndex)
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@games': resolve(__dirname, 'src/games'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
})
