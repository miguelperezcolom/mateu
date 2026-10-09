/**
 * The widths a screen can be looked at: what the app looks like on a desk, a tablet and a phone (an
 * idea from m3e-canvas, which switches each screen between a phone and a desktop frame). Mateu screens
 * are not laid out at fixed sizes — zones stack, form columns collapse, listings narrow — so the
 * width IS the thing to check. Shared by the canvas and play mode.
 *
 * `fill` takes whatever room the pane has (the editor's default). The others frame the screen at that
 * width: a component that adapts to its CONTAINER (a form layout's columns, a zone's wrap) shows its
 * real behaviour; one keyed to a viewport media query does not, since the editor's window is wider.
 */
export type ViewportId = 'fill' | 'desktop' | 'tablet' | 'phone'

export const VIEWPORTS: { id: ViewportId; width: number; label: string }[] = [
    { id: 'fill', width: 0, label: 'Fill' },
    { id: 'desktop', width: 1280, label: 'Desktop · 1280' },
    { id: 'tablet', width: 768, label: 'Tablet · 768' },
    { id: 'phone', width: 390, label: 'Phone · 390' },
]

export function viewportWidth(id: ViewportId): number {
    return VIEWPORTS.find((v) => v.id === id)?.width ?? 0
}

/** A persisted choice back to a viewport, `fill` for anything unknown. */
export function parseViewport(value: string | null | undefined): ViewportId {
    return VIEWPORTS.some((v) => v.id === value) ? (value as ViewportId) : 'fill'
}
