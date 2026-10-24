// A mirror of Oracle's CDN (static.oracle.com/cdn) that the deploying organisation hosts.
//
// Mateu never ships Oracle's files (NOTICE.md); with `mateu.oracle-cdn.url` set the SERVER rewrites
// the page it serves (core OracleCdn): the theme, the scripts and the runtime's configuration. What
// the page does not carry — the gallery images this bridge paints, the welcome banner's default
// illustrations of app-flow.json — follows the same mirror here, derived from that very
// configuration (the page's mirror script records it; else vbInitConfig.JET_CDN_PATH =
// <mirror>/jet/<version>), so there is one setting and nothing to keep in step. Unconfigured, every
// url is Oracle's, unchanged.

export const ORACLE_CDN = 'https://static.oracle.com/cdn'

/** The base the page's runtime configuration points at: the mirror, or Oracle's CDN. */
export function oracleCdnBase(config = globalThis.vbInitConfig) {
  // the page's mirror script records the base before Visual Builder starts (scripts/index-page.mjs)
  if (config === globalThis.vbInitConfig && typeof globalThis.__mateuOracleCdn === 'string'
      && /^https?:\/\/[^\s'"<>]+$/.test(globalThis.__mateuOracleCdn)) {
    return globalThis.__mateuOracleCdn
  }
  const path = config && typeof config.JET_CDN_PATH === 'string' ? config.JET_CDN_PATH : ''
  const match = path.match(/^(https?:\/\/[^\s'"<>]+?)\/jet\/[^/]+\/?$/)
  return match ? match[1] : ORACLE_CDN
}

/** `url` on the mirror when it is one of Oracle's CDN urls; anything else unchanged. */
export function oracleCdnUrl(url, config = globalThis.vbInitConfig) {
  if (typeof url !== 'string' || !url.startsWith(ORACLE_CDN + '/')) return url
  const base = oracleCdnBase(config)
  return base === ORACLE_CDN ? url : base + url.slice(ORACLE_CDN.length)
}
