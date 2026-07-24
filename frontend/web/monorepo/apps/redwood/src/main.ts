import './oj/preactCss' // Oracle oj-c-* component CSS (externalized from the CDN JS) — styles the controls.
import './index.css'
import { MateuOjApp } from './app/MateuOjApp'

/**
 * Entry point of the redwood renderer.
 *
 * The AP-generated controllers inject the routed `<mateu-ui baseUrl="/route" pathPrefix="…">` into
 * the inert holder template. We only READ its attributes to learn the base URL / path prefix — we
 * never upgrade it as a custom element (the OJET-native island renders its own shell). When there is
 * no injected element (dev server / statically served dist) we default to a same-origin root app.
 */
function readMountConfig(): { baseUrl: string; pathPrefix: string } {
  const holder = document.getElementById('mateu-ui-holder') as HTMLTemplateElement | null
  const injected = holder?.content?.querySelector('mateu-ui') ?? document.querySelector('mateu-ui')
  if (injected) {
    return {
      baseUrl: injected.getAttribute('baseurl') ?? injected.getAttribute('baseUrl') ?? '',
      pathPrefix: injected.getAttribute('pathprefix') ?? injected.getAttribute('pathPrefix') ?? '',
    }
  }
  return { baseUrl: '', pathPrefix: '' }
}

const root = document.getElementById('app-root')
if (root) {
  const { baseUrl, pathPrefix } = readMountConfig()
  const app = new MateuOjApp({ baseUrl, pathPrefix, root })
  void app.boot()
  document.getElementById('landing-loader')?.remove()
}
