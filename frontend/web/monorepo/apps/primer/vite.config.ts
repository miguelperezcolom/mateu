import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rendererConfig } from '../../../react-renderer/vite/rendererConfig'

// the shared React renderer configuration (frontend/web/react-renderer/vite/rendererConfig.ts)
export default defineConfig(rendererConfig({
  appDir: import.meta.dirname,
  name: 'primer',
  port: 5180,
  react: react(),
  kit: { index: 'index.ts', icons: 'icons.ts' },
}) as never)
