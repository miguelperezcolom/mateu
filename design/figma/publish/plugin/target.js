// The line next to the Publish button: what pressing it will do, for the file open now.

/** What publishing [target] (this file's host and site) will do, in one sentence. */
export function targetDescription(target = {}) {
  if (target.host === 'zip') return 'Publishing builds a zip to download: nothing is put online.'
  if (target.host === 'cloudflare') {
    if (!target.cfProject) return 'Publishing to Cloudflare Pages: name this file\'s project above.'
    return `Publishing updates the Cloudflare Pages project "${target.cfProject}"${target.cfUrl ? ` (${target.cfUrl})` : ''}, creating it if it does not exist.`
  }
  if (target.netlifySiteId) return `Publishing replaces this file's Netlify site: ${target.netlifyUrl ?? `site ${target.netlifySiteId}`}.`
  return `Publishing creates a new Netlify site${target.netlifySite ? ` called "${target.netlifySite}"` : ''} for this file.`
}
