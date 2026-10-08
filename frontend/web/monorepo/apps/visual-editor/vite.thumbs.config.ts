import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config'

/** Builds the thumbnail harness (thumbs.html) apart from the editor — see scripts/thumbnails.mjs. */
export default mergeConfig(base, defineConfig({
    build: { rollupOptions: { input: 'thumbs.html' } },
}))
