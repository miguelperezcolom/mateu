import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rendererConfig } from '../../../react-renderer/vite/rendererConfig'

// the shared React renderer configuration (frontend/web/react-renderer/vite/rendererConfig.ts)
export default defineConfig(rendererConfig({
  appDir: import.meta.dirname,
  name: 'slds',
  port: 5200,
  react: react(),
  kit: { index: 'index.ts', icons: 'icons.tsx' },
}) as never)
