import { fetchStaticBundle, type StaticBundle } from '@rn/core/staticBundle'

/**
 * The static bundle a page names (`<mateu-ui bundleUrl>`): its manifest, fetched once at boot. A
 * manifest that cannot be read leaves the app on its server (a hybrid site has one), said in the
 * console — never a dead page.
 */
export async function openPageBundle(bundleUrl: string | null): Promise<StaticBundle | null> {
  if (!bundleUrl) return null
  const url = new URL(bundleUrl, window.location.href)
  const slash = url.pathname.lastIndexOf('/')
  const base = url.origin + url.pathname.slice(0, slash)
  const answer = await fetchStaticBundle(base, url.pathname.slice(slash + 1) || undefined)
  if (answer.ok) return answer.bundle
  console.warn('mateu: the static bundle could not be opened; loading from the server', answer.reason)
  return null
}
