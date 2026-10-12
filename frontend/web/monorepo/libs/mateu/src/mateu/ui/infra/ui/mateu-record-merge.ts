import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import type RecordMerge from '@mateu/shared/apiClients/dtos/componentmetadata/RecordMerge'
import type { MergeField } from '@mateu/shared/apiClients/dtos/componentmetadata/RecordMerge'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import {
    CUSTOM, initialPicks, mergeParameters, mergeSummary, mergedValue, MergePicks, valueText, visibleFields,
} from '@infra/ui/recordMerge.ts'

/**
 * COMPARE AND MERGE (`RecordMerge` on the wire): the records side by side, one column each, one row
 * per field. Rows whose values differ are tinted and say so ("differs", also for a screen reader);
 * each row is a radio group — "Use value from Profile 1021 for Email" — plus a free-text value when
 * the field is editable. Under it, the resulting record and a summary; the merge button dispatches
 * the standard `action-requested` with `_merged` / `_choices`. Picks are client-side state.
 *
 * A native table of native radios, so it is keyboard-operable as is (Tab between rows, arrows within
 * one). Design-system neutral: Lumo variables with fallbacks.
 */
@customElement('mateu-record-merge')
export class MateuRecordMerge extends LitElement {

    @property({ attribute: false }) merge: RecordMerge | undefined
    @state() picks: MergePicks = {}
    @state() custom: Record<string, string> = {}
    @state() differencesOnly = false
    private seeded: RecordMerge | undefined

    willUpdate() {
        // a new merge from the server (another pair of records) starts over
        if (this.merge && this.merge !== this.seeded) {
            this.seeded = this.merge
            this.picks = initialPicks(this.merge)
            this.custom = {}
            this.differencesOnly = !!this.merge.differencesOnly
        }
    }

    private pick(field: MergeField, choice: string) {
        this.picks = { ...this.picks, [field.fieldId]: choice }
    }

    private type(field: MergeField, text: string) {
        this.custom = { ...this.custom, [field.fieldId]: text }
        this.pick(field, CUSTOM)
    }

    private doMerge() {
        const merge = this.merge
        if (!merge?.mergeActionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: merge.mergeActionId, parameters: mergeParameters(merge, this.picks, this.custom) },
            bubbles: true,
            composed: true,
        }))
    }

    private recordLabel(id: string | undefined): string {
        if (id === CUSTOM) return chromeText('mergeCustom')
        return this.merge?.records.find((r) => r.id === id)?.label ?? ''
    }

    render() {
        const merge = this.merge
        if (!merge) return nothing
        const records = merge.records ?? []
        const anyEditable = (merge.fields ?? []).some((f) => f.editable)
        const fields = visibleFields(merge, this.differencesOnly)
        const summary = mergeSummary(merge, this.picks)
        return html`
            <div class="bar">
                ${merge.title ? html`<h3 id="title">${merge.title}</h3>` : nothing}
                <label class="switch">
                    <input type="checkbox" role="switch" .checked="${this.differencesOnly}"
                           @change="${(e: Event) => { this.differencesOnly = (e.target as HTMLInputElement).checked }}" />
                    ${chromeText('mergeShowDifferences')}
                </label>
            </div>
            <div class="scroller">
                <table aria-labelledby="${merge.title ? 'title' : nothing}">
                    <thead>
                        <tr>
                            <th scope="col">${chromeText('mergeField')}</th>
                            ${records.map((r) => html`
                                <th scope="col">
                                    <span class="record">${r.label}</span>
                                    ${r.caption ? html`<span class="caption">${r.caption}</span>` : nothing}
                                </th>`)}
                            ${anyEditable ? html`<th scope="col">${chromeText('mergeCustom')}</th>` : nothing}
                        </tr>
                    </thead>
                    <tbody>
                        ${repeat(fields, (field) => field.fieldId, (field) => this.renderRow(field, anyEditable))}
                    </tbody>
                </table>
            </div>
            <section class="result" aria-label="${chromeText('mergeResult')}">
                <h4>${chromeText('mergeResult')}</h4>
                <dl>
                    ${(merge.fields ?? []).map((field) => {
                        const value = valueText(mergedValue(merge, field, this.picks, this.custom))
                        return html`
                            <div class="entry ${field.differs ? 'differs' : ''}">
                                <dt>${field.label}</dt>
                                <dd>${value || chromeText('mergeEmpty')}
                                    <span class="from">${chromeTextf('mergeFrom', { record: this.recordLabel(this.picks[field.fieldId]) })}</span>
                                </dd>
                            </div>`
                    })}
                </dl>
                <div class="footer">
                    <span class="summary" aria-live="polite">${chromeTextf('mergeSummary', summary)}</span>
                    ${merge.mergeActionId ? html`
                        <button class="merge" type="button" @click="${() => this.doMerge()}">${merge.mergeLabel || chromeText('mergeAction')}</button>` : nothing}
                </div>
            </section>
        `
    }

    // Rows are KEYED by field (repeat): a row reused for another field would carry its radios' old
    // group and checked state across, and a checked radio joining a group unchecks the others.
    private renderRow(field: MergeField, anyEditable: boolean) {
        const merge = this.merge!
        const group = 'merge-' + field.fieldId
        return html`
            <tr class="${field.differs ? 'differs' : ''}">
                <th scope="row">
                    ${field.label}
                    ${field.differs ? html`<span class="badge">${chromeText('mergeDiffers')}</span>` : nothing}
                </th>
                ${merge.records.map((record, index) => {
                    const text = valueText((field.values ?? [])[index])
                    const checked = this.picks[field.fieldId] === record.id
                    return html`
                        <td class="${checked ? 'picked' : ''}">
                            <label>
                                <input type="radio" name="${group}" .checked="${checked}"
                                       aria-label="${chromeTextf('mergeUseValue', { record: record.label, field: field.label })}"
                                       @change="${() => this.pick(field, record.id)}" />
                                <span class="${text ? '' : 'empty'}">${text || chromeText('mergeEmpty')}</span>
                            </label>
                        </td>`
                })}
                ${anyEditable ? html`
                    <td class="${this.picks[field.fieldId] === CUSTOM ? 'picked' : ''}">
                        ${field.editable ? html`
                            <span class="custom">
                                <input type="radio" name="${group}" .checked="${this.picks[field.fieldId] === CUSTOM}"
                                       aria-label="${chromeTextf('mergeCustomValue', { field: field.label })}"
                                       @change="${() => this.pick(field, CUSTOM)}" />
                                <input type="text" .value="${this.custom[field.fieldId] ?? ''}"
                                       aria-label="${chromeTextf('mergeCustomValue', { field: field.label })}"
                                       @input="${(e: Event) => this.type(field, (e.target as HTMLInputElement).value)}" />
                            </span>` : nothing}
                    </td>` : nothing}
            </tr>`
    }

    static styles = css`
        :host { display: block; color: var(--lumo-body-text-color, inherit); }
        .bar { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: var(--lumo-space-s, 0.5rem); }
        h3 { margin: 0; font-size: var(--lumo-font-size-l, 1.125rem); }
        h4 { margin: var(--lumo-space-m, 1rem) 0 var(--lumo-space-s, 0.5rem); font-size: var(--lumo-font-size-m, 1rem); }
        .switch { display: inline-flex; align-items: center; gap: var(--lumo-space-xs, 0.25rem); font-size: var(--lumo-font-size-s, 0.875rem); }
        .scroller { overflow-x: auto; margin-top: var(--lumo-space-s, 0.5rem); }
        table { border-collapse: collapse; width: 100%; min-width: max-content; }
        th, td { text-align: start; vertical-align: top; padding: var(--lumo-space-xs, 0.25rem) var(--lumo-space-s, 0.5rem);
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1)); }
        thead th { font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-secondary-text-color, inherit); font-weight: 600; }
        .record { display: block; color: var(--lumo-body-text-color, inherit); }
        .caption { display: block; font-weight: 400; font-size: var(--lumo-font-size-xs, 0.8125rem); }
        tbody th { font-weight: 600; white-space: nowrap; }
        tr.differs { background: var(--lumo-warning-color-10pct, rgba(255, 196, 0, 0.12)); }
        tr.differs th { box-shadow: inset 3px 0 0 var(--lumo-warning-color, #c48b00); }
        .badge { display: inline-block; margin-inline-start: var(--lumo-space-xs, 0.25rem); padding: 0 var(--lumo-space-xs, 0.25rem);
            border-radius: var(--lumo-border-radius-s, 4px); font-size: var(--lumo-font-size-xxs, 0.75rem); font-weight: 500;
            color: var(--lumo-warning-text-color, #7a5600); background: var(--lumo-warning-color-10pct, rgba(255, 196, 0, 0.18)); }
        label { display: inline-flex; gap: var(--lumo-space-xs, 0.25rem); align-items: baseline; cursor: pointer; }
        td.picked span:not(.empty) { font-weight: 600; }
        .empty { color: var(--lumo-disabled-text-color, inherit); font-style: italic; }
        .custom { display: inline-flex; gap: var(--lumo-space-xs, 0.25rem); align-items: center; }
        .custom input[type=text] { font: inherit; padding: var(--lumo-space-xs, 0.25rem); min-width: 10rem;
            border: 1px solid var(--lumo-contrast-30pct, rgba(0, 0, 0, 0.3)); border-radius: var(--lumo-border-radius-s, 4px);
            background: var(--lumo-base-color, transparent); color: inherit; }
        input:focus-visible { outline: 2px solid var(--lumo-primary-color, Highlight); outline-offset: 2px; }
        dl { margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: var(--lumo-space-xs, 0.25rem) var(--lumo-space-m, 1rem); }
        .entry { display: flex; flex-direction: column; }
        dt { font-size: var(--lumo-font-size-xs, 0.8125rem); color: var(--lumo-secondary-text-color, inherit); }
        dd { margin: 0; }
        .entry.differs dd { font-weight: 600; }
        .from { font-weight: 400; font-size: var(--lumo-font-size-xs, 0.8125rem); color: var(--lumo-secondary-text-color, inherit); margin-inline-start: var(--lumo-space-xs, 0.25rem); }
        .footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--lumo-space-s, 0.5rem); margin-top: var(--lumo-space-m, 1rem); }
        .summary { font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-secondary-text-color, inherit); }
        .merge { font: inherit; cursor: pointer; padding: var(--lumo-space-xs, 0.25rem) var(--lumo-space-m, 1rem);
            border: 0; border-radius: var(--lumo-border-radius-m, 6px);
            background: var(--lumo-primary-color, Highlight); color: var(--lumo-primary-contrast-color, HighlightText); }
        .merge:focus-visible { outline: 2px solid var(--lumo-primary-color, Highlight); outline-offset: 2px; }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-record-merge': MateuRecordMerge
    }
}
