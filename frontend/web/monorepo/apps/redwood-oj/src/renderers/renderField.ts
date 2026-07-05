import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option.ts";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";
import { html, LitElement, nothing, svg, TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { ref } from "lit/directives/ref.js";
import { evalIfNecessary } from "@infra/ui/renderers/avatarRenderer.ts";
import { interpolate } from "@infra/ui/interpolation.ts";
import { renderPlainGrid } from "@/renderers/renderData.ts";
import { uxIconClass } from "@/renderers/renderDisplayComponents.ts";

// ─────────────────────────────────────────────────────────────────────────────
// Redwood (Oracle JET) form field renderer. Mirrors the dispatch of the reference renderer
// (libs/mateu mateu-field.ts): stereotype badge/plainText first, then read-only, then wire
// dataType (string/number/integer/bool/date/dateTime/time/dateRange/array/money/status/
// range/file), with the string branch dispatching on the remaining stereotypes.
// ─────────────────────────────────────────────────────────────────────────────

const SECONDARY = 'var(--oj-core-text-color-secondary, #666)'
const DIVIDER = 'var(--oj-core-divider-color, #e0e0e0)'
const LABEL_STYLE = `display:block;font-size:0.75rem;color:${SECONDARY};margin-bottom:4px;`

const makeDataProvider = (items: { value: unknown; label: string }[]) => {
    const req = (window as any).require
    if (!req) return null
    try {
        const ADP = req('ojs/ojarraydataprovider')
        return new ADP(items, { keyAttributes: 'value' })
    } catch {
        return null
    }
}

// JET Core Pack (oj-c-*) inputs must be bound via @valueChanged (the controlled-property
// change event, fired on commit for every value-carrying component). @ojValueAction is NOT
// emitted by oj-c-input-text / text-area / checkbox / input-number — only some components
// (e.g. oj-c-select-single) fire it, so binding it silently dropped typed values.
const valueChanged = (event: Event, fieldId: string, value: unknown) => {
    event.target?.dispatchEvent(new CustomEvent('value-changed', {
        detail: { value, fieldId },
        bubbles: true,
        composed: true
    }))
}

const dispatchValueChanged = (target: EventTarget | null, fieldId: string, value: unknown) => {
    target?.dispatchEvent(new CustomEvent('value-changed', {
        detail: { value, fieldId },
        bubbles: true,
        composed: true
    }))
}

const dispatchAction = (target: EventTarget | null, actionId: string, parameters: Record<string, unknown>) => {
    target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId, parameters },
        bubbles: true,
        composed: true
    }))
}

// Label-on-top wrapper for controls that don't carry their own label-hint.
const labeled = (label: unknown, control: unknown, extraStyle = ''): TemplateResult => html`
    <div style="${extraStyle}">
        ${label ? html`<div style="${LABEL_STYLE}">${label}</div>` : nothing}
        ${control}
    </div>`

const formatMoney = (v: unknown, amountObj: any): string => {
    const num = typeof v === 'number' ? v : parseFloat('' + v)
    if (isNaN(num)) return '' + v
    return (amountObj && amountObj.locale && amountObj.currency)
        ? new Intl.NumberFormat(amountObj.locale, { style: 'currency', currency: amountObj.currency }).format(num)
        : new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
}

// ── Remote options ───────────────────────────────────────────────────────────
// Options for a remote field live in data[componentId] (populated by the backend after an
// action-requested with the field's remote coordinates). If they are not there yet, the
// request is dispatched once per container/field (mirrors mateu-field's lazy fetch).
const requestedRemote = new WeakMap<Element, Set<string>>()

const remoteOptions = (container: LitElement, metadata: FormField, id: string, fieldId: string, data: any): Option[] => {
    const bucket = data?.[id] ?? data?.[fieldId]
    const content = bucket?.content ?? (Array.isArray(bucket) ? bucket : undefined)
    if (content) return content
    const action = metadata.remoteCoordinates?.action
    if (action) {
        let requested = requestedRemote.get(container)
        if (!requested) {
            requested = new Set()
            requestedRemote.set(container, requested)
        }
        if (!requested.has(fieldId)) {
            requested.add(fieldId)
            setTimeout(() => dispatchAction(container, action, {
                searchText: '',
                fieldId,
                size: 200,
                page: 0,
                sort: undefined
            }))
        }
    }
    return []
}

const optionsFor = (container: LitElement, metadata: FormField, id: string, fieldId: string, data: any): Option[] =>
    metadata.remoteCoordinates
        ? remoteOptions(container, metadata, id, fieldId, data)
        : (metadata.options ?? [])

// ── Option-based controls ────────────────────────────────────────────────────

const renderSelectSingle = (metadata: FormField, id: string, label: string, value: any, options: Option[]): TemplateResult => {
    const dp = makeDataProvider(options.map(o => ({ value: o.value, label: o.label ?? '' })))
    return html`<oj-c-select-single
        data-oj-binding-provider="preact"
        id="${id}"
        label-hint="${label}"
        label-edge="top"
        .value="${value ?? null}"
        item-text="label"
        .data="${dp}"
        ?required="${metadata.required}"
        ?disabled="${metadata.disabled}"
        @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
    ></oj-c-select-single>`
}

const renderSelectMultiple = (metadata: FormField, id: string, label: string, value: any, options: Option[]): TemplateResult => {
    const dp = makeDataProvider(options.map(o => ({ value: o.value, label: o.label ?? '' })))
    return html`<oj-c-select-multiple
        data-oj-binding-provider="preact"
        id="${id}"
        label-hint="${label}"
        label-edge="top"
        .value="${value ?? []}"
        item-text="label"
        .data="${dp}"
        ?required="${metadata.required}"
        ?disabled="${metadata.disabled}"
        @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
    ></oj-c-select-multiple>`
}

// Plain single/multi list box (Redwood-styled); JET's list-view would need its own data
// provider + lifecycle, overkill for a bounded options list.
const renderListBox = (metadata: FormField, value: any, options: Option[], multiple: boolean): TemplateResult => {
    const isSelected = (opt: Option) => multiple
        ? Array.isArray(value) && value.includes(opt.value)
        : value === opt.value
    const newValue = (opt: Option) => {
        if (!multiple) return opt.value
        const arr: unknown[] = Array.isArray(value) ? value : []
        return arr.includes(opt.value) ? arr.filter(v => v !== opt.value) : [...arr, opt.value]
    }
    return html`
        <div role="listbox" aria-multiselectable="${multiple}"
             style="border: 1px solid ${DIVIDER}; border-radius: var(--oj-core-border-radius-md, 6px); max-height: 14rem; overflow-y: auto;">
            ${options.map(option => {
                const selected = isSelected(option)
                return html`
                    <div role="option" aria-selected="${selected}" tabindex="0"
                         style="padding: 0.4rem 0.75rem; cursor: ${metadata.disabled ? 'default' : 'pointer'}; display: flex; align-items: center; gap: 0.5rem; ${selected ? 'background: var(--oj-core-bg-color-selected, #e5f0fa); font-weight: 600;' : ''}"
                         @click="${metadata.disabled ? nothing : (e: Event) => dispatchValueChanged(e.target, metadata.fieldId, newValue(option))}">
                        ${option.icon ? html`<span class="${uxIconClass(option.icon)}"></span>` : nothing}
                        <span style="pointer-events: none;">
                            <span>${option.label}</span>
                            ${option.description ? html`<span style="display: block; font-size: 0.8125rem; color: ${SECONDARY};">${option.description}</span>` : nothing}
                        </span>
                    </div>`
            })}
        </div>`
}

// Card-per-option chooser (stereotype `choice`, also embedded in `popover`). Single- or
// multi-select depending on the field dataType, like the reference mateu-choice.
const renderChoiceOptions = (metadata: FormField, value: any, options: Option[], multiple: boolean): TemplateResult => html`
    <div style="display: flex; gap: 0.75rem; padding: 0.25rem 0; flex-wrap: wrap;">
        ${options.map(option => {
            const selected = multiple
                ? Array.isArray(value) && value.includes(option.value)
                : value == option.value
            const newValue = () => {
                if (!multiple) return option.value
                const arr: unknown[] = Array.isArray(value) ? value : []
                return arr.includes(option.value)
                    ? arr.filter(v => v !== option.value)
                    : [...arr, option.value]
            }
            return html`
                <div role="button" tabindex="0"
                     style="min-width: 10rem; min-height: 3rem; padding: 0.75rem 1rem; cursor: pointer; border-radius: var(--oj-core-border-radius-lg, 8px); border: 1px solid ${selected ? 'var(--oj-core-info-color, #0572ce)' : DIVIDER}; background: ${selected ? 'var(--oj-core-bg-color-selected, #e5f0fa)' : 'transparent'};"
                     @click="${(e: Event) => dispatchValueChanged(e.target, metadata.fieldId, newValue())}">
                    <div style="display: flex; align-items: center; gap: 0.5rem; pointer-events: none;">
                        ${option.icon ? html`<span class="${uxIconClass(option.icon)}"></span>` : nothing}
                        ${option.image ? html`<img src="${option.image}" alt="${option.label}" style="${(option as any).imageStyle ?? 'width: 2rem;'}" />` : nothing}
                        <div>
                            <div>${option.label}</div>
                            ${option.description ? html`
                                <div style="font-size: 0.8125rem; color: ${SECONDARY};">${option.description}</div>
                            ` : nothing}
                        </div>
                    </div>
                </div>`
        })}
    </div>`

// ── Stars (integer stereotype) ───────────────────────────────────────────────
// Plain star icons: deterministic (oj-c-rating-gauge would need one more AMD module and its
// Core-Pack property-changed event wiring).
const renderStars = (value: any, fieldId: string, disabled: boolean): TemplateResult => {
    let renderValue = value
    if (isNaN(renderValue)) renderValue = 0
    const stars = [1, 2, 3, 4, 5]
    return html`<div style="display: flex; align-items: center; gap: 0.25rem;">
        ${stars.map(index => html`
            <span role="${disabled ? nothing : 'button'}"
                  style="cursor: ${disabled ? 'default' : 'pointer'}; font-size: 1.5rem; line-height: 1; color: ${index <= renderValue ? 'var(--oj-core-warning-color, #efb73e)' : SECONDARY};"
                  @click="${disabled ? nothing : (e: Event) => dispatchValueChanged(e.target, fieldId, index)}"
            >${index <= renderValue ? '★' : '☆'}</span>
        `)}
    </div>`
}

// ── Uploadable image (stereotype `uploadableImage`) ──────────────────────────
// The picked file is read client-side into a data URI and stored as the field value, so the
// image travels in the string itself — no upload endpoint (same contract as the reference).
const imageUpload = (fieldId: string) => (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => dispatchValueChanged(input, fieldId, reader.result as string)
    reader.readAsDataURL(file)
    input.value = '' // allow re-selecting the same file
}

const triggerImageUpload = (inputId: string) => (e: Event) => {
    const root = (e.target as HTMLElement).getRootNode() as ParentNode
    const input = root.querySelector(`#${CSS.escape(inputId)}`) as HTMLInputElement | null
    input?.click()
}

const renderUploadableImage = (metadata: FormField, id: string, value: any): TemplateResult => {
    const hasImage = value != null && value !== ''
    const inputId = `${id}_file`
    return html`
        <div style="display: flex; flex-direction: column; align-items: stretch; gap: 0.5rem; max-width: 320px;">
            ${hasImage ? html`
                <img src="${value}"
                     style="max-width: 100%; max-height: 240px; object-fit: contain; border: 1px solid ${DIVIDER}; border-radius: var(--oj-core-border-radius-lg, 8px); ${metadata.style ?? ''}">
            ` : html`
                <div style="height: 135px; display: flex; align-items: center; justify-content: center; border: 1px dashed ${DIVIDER}; border-radius: var(--oj-core-border-radius-lg, 8px); color: ${SECONDARY};">
                    <span class="oj-ux-ico-image" style="font-size: 2rem;"></span>
                </div>
            `}
            <input type="file" id="${inputId}" accept="image/*" style="display: none;" @change="${imageUpload(metadata.fieldId)}">
            <div style="display: flex; gap: 0.5rem;">
                <oj-c-button data-oj-binding-provider="preact" label="${hasImage ? 'Replace' : 'Upload'}" chroming="outlined"
                             @ojAction="${triggerImageUpload(inputId)}"></oj-c-button>
                ${hasImage ? html`
                    <oj-c-button data-oj-binding-provider="preact" label="Delete" chroming="borderless"
                                 @ojAction="${(e: Event) => dispatchValueChanged(e.target, metadata.fieldId, '')}"></oj-c-button>` : nothing}
            </div>
        </div>`
}

// ── Special top-level fields ─────────────────────────────────────────────────

const renderBadgeField = (component: ClientSideComponent, value: any, labelText: string): TemplateResult => {
    const on = value === true || value === 'true'
    return html`
        <div style="${component.style ?? nothing}">
            <oj-c-badge data-oj-binding-provider="preact"
                        variant="${on ? 'success' : 'neutral'}"
                        style="${on ? '' : 'opacity: 0.4;'}">${labelText}</oj-c-badge>
        </div>`
}

const renderPlainTextField = (metadata: FormField, value: any, label: unknown, state: any, data: any): TemplateResult => {
    let v: any = evalIfNecessary(value, state, data)
    const amountObj = (v && typeof v === 'object' && 'value' in v) ? v : null
    if (v && v.value) v = v.value
    const isBool = metadata.dataType == 'bool' || v === true || v === false
    const isMoney = metadata.dataType == 'money'
    const hasValue = v !== null && v !== undefined && v !== ''
    let display = hasValue ? '' + v : '—'
    if (isMoney && hasValue) {
        display = formatMoney(v, amountObj)
    }
    const body = isBool
        ? html`<span>${(v === true || v === 'true') ? '✓' : '—'}</span>`
        : metadata.multiline
            ? html`<span style="font-weight: 500; white-space: pre-wrap; word-break: break-word;">${display}</span>`
            : html`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;${isMoney ? ' font-variant-numeric: tabular-nums;' : ''}">${display}</span>`
    return labeled(label, body, isMoney ? 'text-align: right; ' : '')
}

const renderReadOnlyField = (metadata: FormField, value: any, label: unknown, state: any, data: any): TemplateResult => {
    let valueToDisplay: any = evalIfNecessary(value, state, data) || data?.[metadata.fieldId]
    if (valueToDisplay && valueToDisplay.value) {
        valueToDisplay = valueToDisplay.value
    }
    if (metadata.stereotype == 'image' || metadata.stereotype == 'uploadableImage') {
        return labeled(label, html`<img src="${valueToDisplay}" style="${metadata.style ?? nothing}">`)
    }
    if (metadata.dataType == 'bool') {
        return labeled(label, html`<span>${valueToDisplay ? '✓' : '—'}</span>`)
    }
    if (metadata.stereotype == 'link') {
        return labeled(label, html`<a class="oj-link-standalone" href="${valueToDisplay ?? ''}" target="_blank">${valueToDisplay ?? ''}</a>`)
    }
    if (metadata.stereotype == 'color') {
        return labeled(label, html`<span style="background-color: ${valueToDisplay}; display: block; height: 20px; width: 40px; border: 1px solid ${SECONDARY}; border-radius: 4px;"></span>`)
    }
    const hasValue = valueToDisplay !== null && valueToDisplay !== undefined && valueToDisplay !== ''
    return labeled(label, html`<span style="display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis;">${hasValue ? valueToDisplay : '—'}</span>`)
}

// ── Field navigation link (@LinkTo / LinkSupplier) ───────────────────────────
// Icon anchor at the right of the field. href and title arrive as raw ${state.xxx} templates
// and are interpolated against the live state (re-rendered on every state commit; keystrokes
// inside the field itself update the anchor eagerly via the wrapper's input listener below).

// Default glyphs are inline SVGs (stroke: currentColor) because the Redwood UX icon font is
// not bundled with this app; explicit icons map through uxIconClass like everywhere else.
const EXTERNAL_LINK_GLYPH = svg`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
const LINK_GLYPH = svg`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`

const resolveNavLink = (metadata: FormField, state: any, data: any): { href: string; title: string } => {
    const link = metadata.link!
    const href = interpolate(link.href, state, data) ?? link.href
    const title = interpolate(link.title, state, data) || href
    return { href, title }
}

// Vertically centers the anchor on the field's input row (label above / messages below would
// skew a plain flex alignment). The margin is set imperatively — the style attribute in the
// template is static, so a lit re-render doesn't clobber it. The row keeps reflowing well after
// first paint (JET Core Pack components upgrade asynchronously and swap in their native <input>;
// the web font loads later still and changes the label height), so a one-shot measurement goes
// stale: poll for a few seconds and re-measure when the fonts settle.
// setTimeout, not requestAnimationFrame: rAF is suspended in background tabs.
const positionNavLink = (anchor?: Element) => {
    const a = anchor as (HTMLElement & { __navlinkPositioned?: boolean }) | undefined
    if (!a || a.__navlinkPositioned) return
    a.__navlinkPositioned = true
    const measure = () => {
        const row = a.parentElement
        const input = row?.firstElementChild?.querySelector('input, textarea, select') as HTMLElement | null
        if (!row || !input) return
        const rect = input.getBoundingClientRect()
        if (rect.height === 0) return
        a.style.marginTop = `${Math.max(0, Math.round(
            rect.top + rect.height / 2 - a.offsetHeight / 2 - row.getBoundingClientRect().top))}px`
    }
    let tries = 0
    const poll = () => { measure(); if (tries++ < 32) setTimeout(poll, 250) }
    setTimeout(poll)
    document.fonts?.ready.then(() => setTimeout(measure))
}

const renderNavLinkAnchor = (metadata: FormField, state: any, data: any): TemplateResult => {
    const link = metadata.link!
    const { href, title } = resolveNavLink(metadata, state, data)
    const icon = link.icon
        ? html`<span class="${uxIconClass(link.icon)}" style="font-size: 1.125rem;"></span>`
        : (href.startsWith('http') ? EXTERNAL_LINK_GLYPH : LINK_GLYPH)
    // Until measured, approximate label height + half the input; positionNavLink() refines it.
    return html`<a data-navlink
        href="${href}"
        title="${title}"
        target="${link.target || nothing}"
        ${ref(positionNavLink)}
        style="display: flex; align-items: center; color: ${SECONDARY}; align-self: flex-start; margin-top: 1.9rem;"
    >${icon}</a>`
}

// Keystrokes inside the linked field update the anchor before the value is committed to state
// (JET Core Pack inputs only fire valueChanged on commit). Cross-field references refresh on
// the commit re-render, same as the reference renderer.
const liveNavLinkUpdate = (metadata: FormField, state: any, data: any) => (e: Event) => {
    const raw = (e.composedPath()[0] as HTMLInputElement)?.value
    if (raw == null) return
    const row = e.currentTarget as HTMLElement
    const anchor = row.querySelector('a[data-navlink]') as HTMLAnchorElement | null
    if (!anchor) return
    const { href, title } = resolveNavLink(metadata, { ...state, [metadata.fieldId]: raw }, data)
    anchor.setAttribute('href', href)
    anchor.setAttribute('title', title)
}

// ── Main dispatch ────────────────────────────────────────────────────────────

export const renderField = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any): TemplateResult => {
    const metadata = component.metadata as FormField
    const control = renderFieldControl(container, component, baseUrl, state, data)
    if (!metadata?.link?.href) return control
    return html`<div style="display: flex; gap: 0.5rem;" @input="${liveNavLinkUpdate(metadata, state, data)}">
        <div style="flex: 1; min-width: 0;">${control}</div>
        ${renderNavLinkAnchor(metadata, state, data)}
    </div>`
}

const renderFieldControl = (container: LitElement, component: ClientSideComponent, _baseUrl: string | undefined, state: any, data: any): TemplateResult => {
    const metadata = component.metadata as FormField
    const fieldId = metadata?.fieldId ?? ''
    const value = state && fieldId in state ? state[fieldId] : metadata?.initialValue
    const label = metadata.label ?? ''
    const id = component.id ?? fieldId
    const stereotype = metadata.stereotype

    if (stereotype === 'badge') {
        return renderBadgeField(component, value, label || fieldId)
    }
    if (stereotype === 'plainText') {
        return renderPlainTextField(metadata, value, label, state, data)
    }
    if (metadata.readOnly && stereotype != 'grid' && metadata.dataType != 'status' && metadata.dataType != 'money') {
        return renderReadOnlyField(metadata, value, label, state, data)
    }

    // Inline grid (read-only tabular display of a row list)
    if (stereotype === 'grid' && metadata.columns && metadata.columns.length > 0) {
        const rows: any[] = Array.isArray(value) ? value : []
        const cols = metadata.columns.map((c: any) => ({ ...(c.metadata as GridColumn), id: (c.metadata as any).id ?? c.id }))
        // @OnRowSelected: clicking a row dispatches the field's selection action with the row —
        // same contract as the reference renderer's mateu-grid (drives master/detail panels).
        const selectionActionId = (metadata as any).onItemSelectionActionId
        const onRowClick = selectionActionId
            ? (e: Event, item: any) => (e.target as HTMLElement)?.dispatchEvent(new CustomEvent('action-requested', {
                detail: { actionId: selectionActionId, parameters: { _clickedRow: item } },
                bubbles: true, composed: true,
            }))
            : undefined
        return labeled(label, html`<div style="overflow-x: auto;">${renderPlainGrid(cols, rows, false, onRowClick)}</div>`)
    }

    if (metadata.dataType === 'string') {
        if (stereotype === 'searchable') {
            const searchCode = (e: Event) => dispatchAction(e.target, 'code-' + fieldId, {
                code: ((e as CustomEvent).detail?.value ?? (e.target as any)?.value ?? '')
            })
            const search = (e: Event) => dispatchAction(e.target, 'codesearch-' + fieldId, {})
            return labeled(label, html`
                <div style="display: flex; gap: 0.33rem; align-items: center;">
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" style="width: 6rem;"
                                     .value="${value ?? ''}" @valueChanged="${searchCode}"></oj-c-input-text>
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" readonly style="flex: 1;"
                                     .value="${data?.[fieldId + '-label'] ?? ''}"></oj-c-input-text>
                    <oj-c-button data-oj-binding-provider="preact" label="Search" chroming="outlined" @ojAction="${search}"></oj-c-button>
                </div>`)
        }
        if (stereotype === 'textarea') {
            return html`<oj-c-text-area
                data-oj-binding-provider="preact"
                id="${id}"
                label-hint="${label}"
                label-edge="top"
                .value="${value ?? ''}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                ?readonly="${metadata.readOnly}"
                @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
            ></oj-c-text-area>`
        }
        if (stereotype === 'richText' || stereotype === 'richtext') {
            // JET Core Pack has no rich-text editor: fall back to a growing textarea (the value
            // round-trips unchanged, only the formatting toolbar is missing).
            return html`<oj-c-text-area
                data-oj-binding-provider="preact"
                id="${id}"
                label-hint="${label}"
                label-edge="top"
                rows="6"
                .value="${value ?? ''}"
                ?disabled="${metadata.disabled}"
                ?readonly="${metadata.readOnly}"
                @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
            ></oj-c-text-area>`
        }
        if (stereotype === 'markdown') {
            // mateu-markdown renders parsed markdown (marked + DOMPurify) as plain HTML typography
            // into its light DOM (registered by the shared mateu-component import) — design-system-neutral.
            return labeled(label, html`<mateu-markdown .content="${value ?? ''}"></mateu-markdown>`)
        }
        if (stereotype === 'password') {
            return html`<oj-c-input-password
                data-oj-binding-provider="preact"
                id="${id}"
                label-hint="${label}"
                label-edge="top"
                .value="${value ?? ''}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
            ></oj-c-input-password>`
        }
        if (stereotype === 'select' || stereotype === 'combobox') {
            const realValue = (value && value.value) ? value.value : value
            return renderSelectSingle(metadata, id, label, realValue, optionsFor(container, metadata, id, fieldId, data))
        }
        if (stereotype === 'listBox') {
            return labeled(label, renderListBox(metadata, value, optionsFor(container, metadata, id, fieldId, data), false))
        }
        if (stereotype === 'choice') {
            return labeled(label, renderChoiceOptions(metadata, value, optionsFor(container, metadata, id, fieldId, data), false))
        }
        if (stereotype === 'popover') {
            const options = optionsFor(container, metadata, id, fieldId, data)
            const selectedLabel = options.find(opt => opt.value === value)?.label ?? value ?? ''
            const toggle = (e: Event) => {
                const wrap = (e.currentTarget as HTMLElement).closest('.rw-pop-wrap')
                const panel = wrap?.querySelector(':scope > .rw-pop-panel') as HTMLElement | null
                if (panel) panel.hidden = !panel.hidden
            }
            return labeled(label, html`
                <span class="rw-pop-wrap" style="position: relative; display: inline-block;">
                    <span style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;" @click="${toggle}">
                        <span>${selectedLabel}</span>
                        <span class="oj-ux-ico-chevron-down"></span>
                    </span>
                    <div class="rw-pop-panel" hidden
                         style="position: absolute; top: 100%; left: 0; margin-top: 4px; z-index: 1000; background: var(--oj-core-bg-color-content, #fff); border: 1px solid ${DIVIDER}; border-radius: var(--oj-core-border-radius-md, 6px); box-shadow: 0 4px 12px rgba(0,0,0,.15); padding: 0.5rem;">
                        ${renderChoiceOptions(metadata, value, options, false)}
                    </div>
                </span>`)
        }
        if (stereotype === 'radio') {
            // Core-Pack radioset takes an `options` items array ({value,label}), not oj-option children.
            const options = optionsFor(container, metadata, id, fieldId, data)
                .map(o => ({ value: o.value, label: o.label ?? '' }))
            return html`<oj-c-radioset
                data-oj-binding-provider="preact"
                id="${id}"
                label-hint="${label}"
                label-edge="top"
                .value="${value ?? null}"
                .options="${options}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
            ></oj-c-radioset>`
        }
        if (stereotype === 'html') {
            return html`<div id="${id}">${unsafeHTML('' + (value ?? ''))}</div>`
        }
        if (stereotype === 'image') {
            return html`<figure style="margin: 0;">
                <figcaption style="${LABEL_STYLE}">${label}</figcaption>
                <img src="${value}" alt="${label}" style="${metadata.style ?? ''}" />
            </figure>`
        }
        if (stereotype === 'uploadableImage') {
            return labeled(label, renderUploadableImage(metadata, id, value))
        }
        if (stereotype === 'icon') {
            // Icon ids arrive as "vaadin:name"; the preview uses the Oracle UX icon font.
            return labeled(label, html`
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" style="flex: 1;"
                                     .value="${value ?? ''}"
                                     ?disabled="${metadata.disabled}"
                                     @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
                    ></oj-c-input-text>
                    ${value ? html`<span class="${uxIconClass(value)}" style="font-size: 1.25rem;"></span>` : nothing}
                </div>`)
        }
        if (stereotype === 'color') {
            return html`<div>
                <label for="${id}" style="${LABEL_STYLE}">${label}</label>
                <input id="${id}" type="color" .value="${value ?? '#000000'}" ?disabled="${metadata.disabled}"
                    @input="${(e: Event) => valueChanged(e, id, (e.target as HTMLInputElement).value)}" />
            </div>`
        }
        if (stereotype === 'link') {
            return html`<div>
                <div style="${LABEL_STYLE}">${label}</div>
                <a class="oj-link-standalone" href="${value}" target="_blank">${value}</a>
            </div>`
        }
        // Enum / any string field carrying static options → select
        if (metadata.options && metadata.options.length > 0) {
            return renderSelectSingle(metadata, id, label, value, metadata.options)
        }
        // Remote options without an explicit stereotype → select
        if (metadata.remoteCoordinates) {
            return renderSelectSingle(metadata, id, label, value, remoteOptions(container, metadata, id, fieldId, data))
        }
        return html`<oj-c-input-text
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? ''}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            ?readonly="${metadata.readOnly}"
            placeholder="${metadata.placeholder ?? nothing}"
            @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-text>`
    }

    if (metadata.dataType === 'number') {
        return html`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? null}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-number>`
    }

    if (metadata.dataType === 'integer') {
        if (stereotype === 'stars') {
            return labeled(label, renderStars(value, fieldId, metadata.disabled))
        }
        if (stereotype === 'slider') {
            return html`<div>
                <label for="${id}" style="${LABEL_STYLE}">${label}</label>
                <input id="${id}" type="range"
                    min="${metadata.sliderMin ?? 0}"
                    max="${metadata.sliderMax ?? 10}"
                    .value="${'' + (value ?? 0)}"
                    @input="${(e: Event) => valueChanged(e, id, parseInt((e.target as HTMLInputElement).value))}" />
            </div>`
        }
        return html`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? null}"
            step="1"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-number>`
    }

    if (metadata.dataType === 'bool') {
        if (stereotype === 'toggle') {
            return html`<div>
                <div style="${LABEL_STYLE}">${label}</div>
                <oj-c-toggle-button
                    data-oj-binding-provider="preact"
                    id="${id}"
                    label="${label}"
                    .value="${!!value}"
                    ?disabled="${metadata.disabled}"
                    @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
                ></oj-c-toggle-button>
            </div>`
        }
        return html`<oj-c-checkbox
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            .value="${!!value}"
            ?disabled="${metadata.disabled}"
            @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        >${label}</oj-c-checkbox>`
    }

    if (metadata.dataType === 'date') {
        return html`<oj-c-input-date-text
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? null}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-date-text>`
    }

    if (metadata.dataType === 'dateTime') {
        const dtValue = value as string | undefined
        const datePart = dtValue ? dtValue.split('T')[0] : null
        const timePart = dtValue ? dtValue.split('T')[1]?.substring(0, 5) : null
        return html`<div style="display:flex;gap:0.5rem;align-items:flex-end;">
            <oj-c-input-date-text
                data-oj-binding-provider="preact"
                id="${id}_date"
                label-hint="${label}"
                label-edge="top"
                .value="${datePart}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value + 'T' + (timePart ?? '00:00'))}"
            ></oj-c-input-date-text>
            <oj-c-input-time-mask
                data-oj-binding-provider="preact"
                id="${id}_time"
                label-hint="Time"
                label-edge="top"
                .value="${timePart}"
                ?disabled="${metadata.disabled}"
                @valueChanged="${(e: CustomEvent) => valueChanged(e, id, (datePart ?? '') + 'T' + e.detail.value)}"
            ></oj-c-input-time-mask>
        </div>`
    }

    if (metadata.dataType === 'time') {
        return html`<oj-c-input-time-mask
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? null}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-time-mask>`
    }

    if (metadata.dataType === 'dateRange') {
        const range = value as { from: string; to: string } | undefined
        return html`<div style="display:flex;gap:0.5rem;align-items:flex-end;">
            <oj-c-input-date-text
                data-oj-binding-provider="preact"
                id="${id}_from"
                label-hint="${label} From"
                label-edge="top"
                .value="${range?.from ?? null}"
                @valueChanged="${(e: CustomEvent) => valueChanged(e, id, { ...range, from: e.detail.value })}"
            ></oj-c-input-date-text>
            <oj-c-input-date-text
                data-oj-binding-provider="preact"
                id="${id}_to"
                label-hint="${label} To"
                label-edge="top"
                .value="${range?.to ?? null}"
                @valueChanged="${(e: CustomEvent) => valueChanged(e, id, { ...range, to: e.detail.value })}"
            ></oj-c-input-date-text>
        </div>`
    }

    if (metadata.dataType === 'array') {
        if (stereotype === 'choice') {
            return labeled(label, renderChoiceOptions(metadata, value, optionsFor(container, metadata, id, fieldId, data), true))
        }
        if (stereotype === 'listBox') {
            return labeled(label, renderListBox(metadata, value, optionsFor(container, metadata, id, fieldId, data), true))
        }
        if (stereotype === 'combobox' || stereotype === 'select') {
            return renderSelectMultiple(metadata, id, label, value, optionsFor(container, metadata, id, fieldId, data))
        }
        // Core-Pack checkboxset takes an `options` items array ({value,label}), not oj-option children.
        const options = optionsFor(container, metadata, id, fieldId, data)
            .map(o => ({ value: o.value, label: o.label ?? '' }))
        return html`<oj-c-checkboxset
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? []}"
            .options="${options}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-checkboxset>`
    }

    if (metadata.dataType === 'status') {
        const status = value as { message: string; type: string } | undefined
        const severityMap: Record<string, string> = { danger: 'error', success: 'success', warning: 'warning', info: 'info' }
        const severity = severityMap[(status?.type ?? '').toLowerCase()] ?? 'info'
        return html`<div id="${id}">
            <div style="${LABEL_STYLE}">${label}</div>
            ${status ? html`<oj-c-badge
                data-oj-binding-provider="preact"
                .value="${status.message}"
                severity="${severity}"
            ></oj-c-badge>` : html``}
        </div>`
    }

    if (metadata.dataType === 'money') {
        if (metadata.readOnly) {
            const amount = value as any
            let formatted = ''
            if (amount?.locale && amount?.currency) {
                formatted = new Intl.NumberFormat(amount.locale, { style: 'currency', currency: amount.currency }).format(amount.value)
            } else if (amount != null) {
                formatted = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
            }
            return html`<div id="${id}">
                <div style="${LABEL_STYLE}">${label}</div>
                <div style="text-align:right;font-weight:bold;font-variant-numeric:tabular-nums;">${formatted}</div>
            </div>`
        }
        return html`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? null}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @valueChanged="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-number>`
    }

    if (metadata.dataType === 'file') {
        return html`<oj-c-file-picker
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            ?disabled="${metadata.disabled}"
            @ojSelect="${(e: CustomEvent) => {
                const file = e.detail.files?.[0]
                valueChanged(e, id, file ? { name: file.name, size: file.size } : null)
            }}"
        ></oj-c-file-picker>`
    }

    if (metadata.dataType === 'range') {
        const range = value as { from: number; to: number } | undefined
        return html`<div>
            <div style="${LABEL_STYLE}">${label}</div>
            <div style="display:flex;gap:1rem;align-items:center;">
                <input type="range"
                    min="${metadata.sliderMin ?? 0}" max="${metadata.sliderMax ?? 10}"
                    .value="${'' + (range?.from ?? 0)}"
                    @input="${(e: Event) => valueChanged(e, id, { ...range, from: parseInt((e.target as HTMLInputElement).value) })}" />
                <input type="range"
                    min="${metadata.sliderMin ?? 0}" max="${metadata.sliderMax ?? 10}"
                    .value="${'' + (range?.to ?? 0)}"
                    @input="${(e: Event) => valueChanged(e, id, { ...range, to: parseInt((e.target as HTMLInputElement).value) })}" />
            </div>
        </div>`
    }

    return html`<p>Unknown field type: ${metadata.dataType} / ${metadata.stereotype}</p>`
}
