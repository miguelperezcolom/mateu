import { html, nothing, TemplateResult } from "lit";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";

/**
 * The icon PORT (design-system-neutral). Core renderers call `icon(name, ...)` instead of emitting a
 * a DS icon element directly. It delegates to the active renderer's `renderIcon`
 * hook — the Vaadin adapter maps to a vaadin-icon element, a DS renderer to its own iconset — and falls back to a
 * semantic `<span data-icon>` placeholder (no glyph, but structurally present and CSS-targetable) when no
 * renderer is set or the renderer declares no icon hook. This keeps the core `@vaadin`-free.
 */
export const icon = (name: string | undefined, style?: string, cssClasses?: string, slot?: string): TemplateResult => {
    if (!name) {
        return html``
    }
    const hook = componentRenderer.get()?.renderIcon
    if (hook) {
        // Slot placement wraps the adapter's icon so the neutral port controls slotting uniformly.
        const rendered = hook.call(componentRenderer.get(), name, style, cssClasses)
        return slot ? html`<span slot="${slot}">${rendered}</span>` : rendered
    }
    return html`<span class="mateu-icon ${cssClasses ?? ''}" data-icon="${name}" aria-hidden="true"
                      style="display:inline-block; width:1em; height:1em; ${style ?? ''}" slot="${slot ?? nothing}"></span>`
}
