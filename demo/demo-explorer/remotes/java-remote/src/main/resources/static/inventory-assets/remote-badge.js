// A custom element owned by the Inventory remote. A screen of the remote names it with
// `Element { name: explorer-remote-badge, attributes: { import: /inventory-assets/remote-badge.js } }`.
// Inside a shell of another origin the renderer imports it from THIS origin — the badge prints where
// it was really loaded from (import.meta.url), which is the proof.
class ExplorerRemoteBadge extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return
    const root = this.attachShadow({ mode: 'open' })
    const badge = document.createElement('span')
    badge.setAttribute('part', 'badge')
    badge.className = 'badge'
    badge.textContent = `${this.getAttribute('label') || 'Remote'} · module loaded from ${new URL(import.meta.url).origin}`
    const style = document.createElement('style')
    style.textContent = `.badge { display: inline-block; padding: .35rem .8rem; border-radius: 999px;
      background: #e8f0fe; color: #1a3d7c; font: 600 .9rem system-ui, sans-serif; }`
    root.append(style, badge)
  }
}
if (!customElements.get('explorer-remote-badge')) customElements.define('explorer-remote-badge', ExplorerRemoteBadge)
