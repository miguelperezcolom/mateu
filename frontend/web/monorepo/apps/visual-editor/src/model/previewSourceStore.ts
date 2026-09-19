import { PreviewSource, defaultPreviewSource, parsePreviewSource, serializePreviewSource } from './previewSource'

/**
 * localStorage persistence for the chosen {@link PreviewSource}. Kept apart from the pure model so the
 * model stays unit-testable without a DOM. One key for now (per-window/project); scoping the key by
 * mount is a later refinement.
 */
const KEY = 'mateu-visual-editor-preview-source'

export function loadPreviewSource(fallbackBaseUrl: string): PreviewSource {
    try {
        return parsePreviewSource(localStorage.getItem(KEY), fallbackBaseUrl)
    } catch {
        return defaultPreviewSource(fallbackBaseUrl)
    }
}

export function savePreviewSource(src: PreviewSource): void {
    try {
        localStorage.setItem(KEY, serializePreviewSource(src))
    } catch {
        /* private mode / no storage — the choice just won't persist */
    }
}
