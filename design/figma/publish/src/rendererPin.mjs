// The renderer Mateu Publish deploys: pinned to a release tag, with a SHA-256 per file. The plugin
// downloads the files from jsDelivr at that tag and checks each one before building a site.
// No imports: bin/pin-renderer.mjs runs this in a bare checkout, with Node's own hash.

export const RENDERER_DIR = 'backend/shared/frontend/vaadin-lit/src/main/resources/static/'
const INDEX = '_index.html'

/** The contents of renderer.json for a release. `files` = every renderer path at that tag; `digestOf(path)` = its hex SHA-256. */
export function rendererPin(version, files, digestOf) {
  if (!files.includes(INDEX)) throw new Error(`v${version} has no ${INDEX} under ${RENDERER_DIR}`)
  return {
    tag: `v${version}`,
    base: `https://cdn.jsdelivr.net/gh/miguelperezcolom/mateu@v${version}/${RENDERER_DIR}`,
    index: INDEX,
    files: files.filter((p) => p !== INDEX).sort(),
    digests: Object.fromEntries([...files].sort().map((p) => [p, digestOf(p)])),
  }
}

/** `bytes` when they are the file the pin names; throws when the file differs or is not pinned. */
export function checkRendererFile(pin, path, bytes, sha256Hex) {
  const expected = pin.digests[path]
  if (!expected) throw new Error(`${path} is not pinned in the renderer ${pin.tag}`)
  if (sha256Hex(bytes) !== expected) throw new Error(`${path} does not match the renderer ${pin.tag}: not publishing it`)
  return bytes
}
