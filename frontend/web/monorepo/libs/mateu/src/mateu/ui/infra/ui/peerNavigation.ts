/**
 * A peer route (`peerNav`) that leaves the app: a path of the site (`/x`, possibly another mount this
 * app knows nothing about) or a whole URL. Only a browser load gets there. Anything else is a place of
 * this app, relative to its mount: read by the browser, it would resolve against the current page.
 */
export const peerRouteLeavesApp = (route: string): boolean => /^(\/|[a-z][a-z0-9+.-]*:)/i.test(route)
