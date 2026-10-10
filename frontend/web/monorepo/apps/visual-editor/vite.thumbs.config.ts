import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config'

/** Builds the thumbnail harness (thumbs.html) apart from the editor — see scripts/thumbnails.mjs. */
// The harness is the editor's canvas, so in Redwood mode it frames redwood-preview.html: built too.
// (Not merged with the editor's inputs: mergeConfig would add the editor itself to this build.)
const config = mergeConfig(base, defineConfig({}))
config.build = { ...config.build, rollupOptions: { input: { thumbs: 'thumbs.html', 'redwood-preview': 'redwood-preview.html' } } }
export default config
