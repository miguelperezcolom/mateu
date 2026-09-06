/**
 * Theme isolation for embedding.
 *
 * A Mateu app embedded in a foreign host must not inherit the host page's design tokens
 * (`--lumo-*` / `--mateu-*`), nor leak its own. Shadow DOM does NOT help here: it encapsulates
 * rules and selectors, but CSS *custom properties* cross the shadow boundary by inheritance. So a
 * host that declares `--lumo-primary-color` on its `:root` would repaint every embedded Mateu
 * component, because `:root` is an ancestor of `<mateu-ui>`.
 *
 * The fix is proximity, not encapsulation: a renderer declares its full token baseline ON the
 * `<mateu-ui>` container (see the Vaadin renderer's `lumo.js`, which re-emits Lumo's root token
 * blocks scoped to `mateu-ui`). Because the container is a CLOSER ancestor than the host's `:root`,
 * every element inside resolves each token from the container, and the host's value can never win.
 *
 * For that baseline's dark palette (`mateu-ui[theme~="dark"]`) to switch, the container needs the
 * `theme` attribute the app otherwise sets on `document.documentElement`. This helper mirrors it —
 * so scoped dark mode tracks the document's, while the tokens themselves stay firewalled on the
 * container. Renderer-neutral (it only moves an attribute); a no-op where no scoped baseline exists.
 */
export function mirrorThemeAttribute(host: HTMLElement): () => void {
  const apply = () => {
    const theme = document.documentElement.getAttribute("theme");
    if (theme) {
      host.setAttribute("theme", theme);
    } else {
      host.removeAttribute("theme");
    }
  };
  apply();
  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["theme"],
  });
  return () => observer.disconnect();
}
