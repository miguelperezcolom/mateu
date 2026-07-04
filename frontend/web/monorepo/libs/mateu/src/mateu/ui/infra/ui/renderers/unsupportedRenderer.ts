import { html, nothing, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";

/**
 * Explicit fallback for component types a renderer declares it does NOT support.
 *
 * Design (parity phase 0): non-vaadin renderers override only part of the shared
 * renderClientSideComponent switch; anything else used to fall through to the shared
 * Vaadin-flavoured components, which look broken/inconsistent in other design systems —
 * silently. Instead, each renderer can declare the set of ComponentMetadataType it supports
 * (see ComponentRenderer.supportedClientSideTypes). When a type outside that set reaches the
 * shared fallback, we render a clearly visible <mateu-unsupported> placeholder so the gap is
 * obvious on screen and measurable by the conformance suite (e2e/conformance.mjs), which
 * counts these elements per route.
 *
 * The placeholder is a bare custom element (no Lit base class, no design system, inline CSS
 * in its own shadow root) so it renders identically under any renderer, whether the host tree
 * uses shadow DOM or light DOM.
 */

/** Pure decision helper — kept separate so it is unit-testable without a DOM. */
export const isUnsupportedType = (
    supported: ReadonlySet<ComponentMetadataType> | undefined,
    type: ComponentMetadataType | undefined
): boolean => type != undefined && supported != undefined && !supported.has(type)

// HTMLElement does not exist under plain node (vitest); use a no-op base there so this module
// stays importable from unit tests. The element is only defined when customElements exists.
const Base = (typeof HTMLElement !== 'undefined' ? HTMLElement : class {}) as typeof HTMLElement

export class MateuUnsupported extends Base {

    static get observedAttributes() { return ['type', 'renderer'] }

    connectedCallback() { this.render() }
    attributeChangedCallback() { this.render() }

    private render() {
        const type = this.getAttribute('type') ?? 'unknown'
        const renderer = this.getAttribute('renderer') ?? 'unknown'
        if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' })
        }
        this.shadowRoot!.innerHTML = `
            <style>
                :host { display: block; }
                .mateu-unsupported {
                    box-sizing: border-box;
                    border: 1px dashed #b45309;
                    border-radius: 4px;
                    background: repeating-linear-gradient(45deg, #fffbeb, #fffbeb 10px, #fef3c7 10px, #fef3c7 20px);
                    color: #92400e;
                    font-family: monospace;
                    font-size: 12px;
                    line-height: 1.4;
                    padding: 6px 10px;
                    margin: 2px 0;
                }
            </style>
            <div class="mateu-unsupported" role="note">
                ⚠ Component “${type}” is not supported by the “${renderer}” renderer yet.
            </div>
        `
    }
}

if (typeof customElements !== 'undefined' && !customElements.get('mateu-unsupported')) {
    customElements.define('mateu-unsupported', MateuUnsupported)
}

const warned = new Set<string>()

export const renderUnsupported = (
    component: ClientSideComponent | undefined,
    type: ComponentMetadataType,
    rendererName: string
): TemplateResult => {
    const key = `${rendererName}/${type}`
    if (!warned.has(key)) {
        warned.add(key)
        console.warn(`[mateu] Component type "${type}" is not supported by the "${rendererName}" renderer — rendering <mateu-unsupported> placeholder.`)
    }
    return html`<mateu-unsupported
            type="${type}"
            renderer="${rendererName}"
            data-component-id="${component?.id ?? nothing}"
            slot="${component?.slot ?? nothing}"
    ></mateu-unsupported>`
}
