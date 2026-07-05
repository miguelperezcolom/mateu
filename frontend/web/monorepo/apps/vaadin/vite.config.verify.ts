// Temporary config for verification against a scratch backend on :8593 — safe to delete.
import baseConfig from './vite.config'

export default {
  ...baseConfig,
  server: {
    ...baseConfig.server,
    port: 5198,
    strictPort: true,
    proxy: {
      '/fluent/mateu': 'http://localhost:8593',
      '/mateu': 'http://localhost:8593',
      '/myassets': 'http://localhost:8593',
      '/images': 'http://localhost:8593',
      '/sse': 'http://localhost:8593',
      '/upload': 'http://localhost:8593',
    },
  },
}
