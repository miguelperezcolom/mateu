// The plugin's sandbox half: reads the document, keeps the settings. Everything else (converting,
// building, uploading) happens in the UI iframe, the only side with network access. What is kept
// where is plugin/store.js; every failure is told to the panel, never swallowed.
import { serialize } from './serialize.js'
import { CONFIG, FILE_ID, SECRETS, TARGET, fileMarkOf, messageOf, onlyTokens, readChunked, splitSecrets, storedTarget, targetFor, writeChunked } from './store.js'

// hidden layers are never content: the converter would skip them anyway
figma.skipInvisibleInstanceChildren = true

figma.showUI(__html__, { width: 520, height: 680, themeColors: true })

const post = (m) => figma.ui.postMessage(m)

/**
 * What names this file in clientStorage: its key when Figma gives it, else an id written into the
 * file once. In a file this user cannot edit nothing can be written: the id lasts this session.
 */
function fileId() {
  if (figma.fileKey) return figma.fileKey
  let id = figma.root.getPluginData(FILE_ID)
  if (!id) {
    id = `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    try {
      figma.root.setPluginData(FILE_ID, id)
    } catch {
      // view-only: remembered until the plugin closes, and the panel says so
      remembered = false
    }
  }
  return id
}

let targetKey
let remembered = true

async function ready() {
  await figma.loadAllPagesAsync()
  const file = await serialize(figma.root.children)
  const saved = readChunked(figma.root, CONFIG)
  let config = null
  try {
    config = saved ? JSON.parse(saved) : null
  } catch {
    post({ type: 'save-failed', what: 'settings', message: 'The settings saved in this file could not be read: starting from the design.' })
  }
  targetKey = TARGET + fileId()
  const { secrets, legacyTarget } = splitSecrets((await figma.clientStorage.getAsync(SECRETS)) ?? {})
  const { target, offered } = targetFor(await figma.clientStorage.getAsync(targetKey), fileMarkOf(figma.root))
  post({ type: 'document', name: figma.root.name, file, config, secrets, target: target ?? legacyTarget, offeredTarget: offered, targetRemembered: remembered })
}

/** Each part saved on its own, so one failing (a view-only file, a size limit) loses nothing else. */
async function save(what, run) {
  try {
    await run()
    post({ type: 'saved', what })
  } catch (e) {
    post({ type: 'save-failed', what, message: messageOf(e) })
  }
}

figma.ui.onmessage = async (m) => {
  if (m.type === 'ready') {
    try {
      await ready()
    } catch (e) {
      post({ type: 'error', message: `Could not read the design: ${messageOf(e)}` })
    }
  } else if (m.type === 'save-secrets') {
    await save('tokens', () => figma.clientStorage.setAsync(SECRETS, onlyTokens(m.secrets)))
  } else if (m.type === 'save-target') {
    await save('target', () => figma.clientStorage.setAsync(targetKey, storedTarget(m.target, fileMarkOf(figma.root))))
  } else if (m.type === 'save-config') {
    await save('settings', () => writeChunked(figma.root, CONFIG, JSON.stringify(m.config)))
  } else if (m.type === 'open') {
    figma.openExternal(m.url)
  }
}
