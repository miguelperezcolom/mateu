/**
 * Light or dark, following the HOST: VS Code marks its webview body `vscode-dark` /
 * `vscode-high-contrast` (and `vscode-light` / `vscode-high-contrast-light`), IntelliJ injects
 * `window.__mateuTheme`, and a browser answers `prefers-color-scheme`. The editor applies it to its
 * own chrome and to the canvas (Lumo's dark palette), so a dark IDE does not get a white slab.
 */
export type Theme = 'light' | 'dark'

declare global {
    interface Window { __mateuTheme?: string }
}

export function hostTheme(): Theme {
    const cls = document.body?.classList
    if (cls?.contains('vscode-high-contrast-light') || cls?.contains('vscode-light')) return 'light'
    if (cls?.contains('vscode-dark') || cls?.contains('vscode-high-contrast')) return 'dark'
    if (window.__mateuTheme === 'dark' || window.__mateuTheme === 'light') return window.__mateuTheme
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Call `cb` now and whenever the host theme changes (VS Code swaps the body class live). */
export function watchHostTheme(cb: (t: Theme) => void): () => void {
    let last = hostTheme()
    cb(last)
    const check = () => { const t = hostTheme(); if (t !== last) { last = t; cb(t) } }
    const mo = new MutationObserver(check)
    if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    mq?.addEventListener?.('change', check)
    return () => { mo.disconnect(); mq?.removeEventListener?.('change', check) }
}
