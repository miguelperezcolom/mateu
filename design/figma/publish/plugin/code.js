// The plugin's sandbox half: reads the document, keeps the settings. Everything else (converting,
// building, uploading) happens in the UI iframe, the only side with network access.
import { serialize } from './serialize.js'

const CONFIG = 'mateu-publish-config' // in the file: routes, data, actions — shared with whoever edits it
const SECRETS = 'mateu-publish-secrets' // on this device and for this user only: never in the file

// hidden layers are never content: the converter would skip them anyway
figma.skipInvisibleInstanceChildren = true

figma.showUI(__html__, { width: 520, height: 680, themeColors: true })

figma.ui.onmessage = async (m) => {
  if (m.type === 'ready') {
    await figma.loadAllPagesAsync()
    const file = await serialize(figma.root.children)
    const saved = figma.root.getPluginData(CONFIG)
    figma.ui.postMessage({
      type: 'document',
      name: figma.root.name,
      file,
      config: saved ? JSON.parse(saved) : null,
      secrets: (await figma.clientStorage.getAsync(SECRETS)) ?? {},
    })
  } else if (m.type === 'save') {
    figma.root.setPluginData(CONFIG, JSON.stringify(m.config))
    await figma.clientStorage.setAsync(SECRETS, m.secrets)
  } else if (m.type === 'open') {
    figma.openExternal(m.url)
  }
}
