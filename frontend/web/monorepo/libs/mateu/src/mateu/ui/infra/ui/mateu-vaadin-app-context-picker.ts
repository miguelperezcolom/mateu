import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement, TemplateResult} from "lit";
import "@vaadin/select";
import "@vaadin/combo-box";
import type {ComboBoxDataProvider} from "@vaadin/combo-box";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import AppContextSelector from "@mateu/shared/apiClients/dtos/componentmetadata/AppContextSelector.ts";
import {mateuApiClient} from "@infra/http/AxiosMateuApiClient.ts";
import {
    installAppContextWatcher,
    readAppContext,
    readAppContextLabels,
    writeAppContext
} from "@infra/appContextStore.ts";

type Option = { value: unknown, label: string }

/**
 * The VAADIN flavor of the @AppContext header selector (the shared appRenderer is the Vaadin
 * shell): few options render as a native vaadin-select, larger sets as a vaadin-combo-box whose
 * lazy dataProvider runs the same _appcontext-search-<field> remote action as the DS-neutral
 * mateu-app-context-picker (still used by the sapui5/redhat/redwood/slds shells). Same
 * semantics: the picked value persists client-side and the page reloads against the new context.
 */
@customElement('mateu-vaadin-app-context-picker')
export class MateuVaadinAppContextPicker extends LitElement {

    // above this many options the widget upgrades to a searchable combo box
    static readonly SEARCHABLE_THRESHOLD = 7

    @property()
    selector!: AppContextSelector

    @property()
    app: App | undefined

    @property()
    baseUrl = ''

    connectedCallback() {
        super.connectedCallback();
        // reload this tab when ANOTHER tab changes the context
        installAppContextWatcher()
    }

    private currentValue(): string {
        return String(readAppContext()[this.selector.fieldName] ?? '')
    }

    private currentLabel(): string {
        const value = this.currentValue()
        if (!value) return ''
        const option = (this.selector.options ?? []).find(o => String(o.value) === value)
        if (option) return option.label
        const label = readAppContextLabels()[this.selector.fieldName]
        return label !== undefined ? String(label) : value
    }

    private pick(value: unknown, label?: string) {
        if (String(value ?? '') === this.currentValue()) return
        writeAppContext(this.selector.fieldName, value, label)
        window.location.reload()
    }

    // Lazy combo-box pages through the server search (options created after the app metadata was
    // built still show up); falls back to filtering the loaded options when the action fails.
    private dataProvider: ComboBoxDataProvider<Option> = async (params, callback) => {
        const filter = params.filter ?? ''
        const remote = await this.remoteSearch(filter)
        const options = remote ?? (this.selector.options ?? [])
            .filter(o => o.label.toLowerCase().includes(filter.toLowerCase()))
        callback(options, options.length)
    }

    private async remoteSearch(searchText: string): Promise<Option[] | undefined> {
        const app = this.app
        if (!app?.serverSideType) return undefined
        try {
            const increment = await mateuApiClient.runAction(
                this.baseUrl ?? '',
                app.rootRoute ?? app.initialRoute ?? '',
                '',
                `_appcontext-search-${this.selector.fieldName}`,
                `appcontext-${this.selector.fieldName}`,
                undefined,
                app.serverSideType,
                {},
                { searchText },
                this,
                true
            )
            for (const fragment of increment?.fragments ?? []) {
                const data = fragment.data as Record<string, any> | undefined
                const page = data?.[`_appcontext_${this.selector.fieldName}`]
                const content = page?.content
                if (Array.isArray(content)) {
                    return content.map((option: any) =>
                        ({ value: option.value, label: option.label ?? String(option.value) }))
                }
            }
        } catch {
            // server search unavailable: the caller filters the loaded options client-side
        }
        return undefined
    }

    private renderSelect(): TemplateResult {
        const items = [
            { label: '—', value: '' },
            ...(this.selector.options ?? []).map(option =>
                ({ label: option.label, value: String(option.value) })),
        ]
        return html`
            <vaadin-select theme="small"
                           .items="${items}"
                           .value="${this.currentValue()}"
                           @value-changed="${(e: CustomEvent) => {
                               const value = e.detail.value ?? ''
                               const label = items.find(i => i.value === value)?.label
                               this.pick(value, value === '' ? undefined : label)
                           }}"></vaadin-select>`
    }

    private renderComboBox(): TemplateResult {
        const value = this.currentValue()
        const selected: Option | null = value ? { value, label: this.currentLabel() } : null
        return html`
            <vaadin-combo-box theme="small"
                              item-label-path="label"
                              item-value-path="value"
                              clear-button-visible
                              placeholder="—"
                              .dataProvider="${this.dataProvider}"
                              .selectedItem="${selected}"
                              @selected-item-changed="${(e: CustomEvent) => {
                                  const item = e.detail.value as Option | null
                                  this.pick(item?.value ?? '', item?.label)
                              }}"></vaadin-combo-box>`
    }

    render(): TemplateResult {
        if (!this.selector) return html``
        const searchable =
            (this.selector.options?.length ?? 0) > MateuVaadinAppContextPicker.SEARCHABLE_THRESHOLD
        return html`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                ${searchable ? this.renderComboBox() : this.renderSelect()}
            </label>`
    }

    static styles = css`
        :host {
            display: inline-flex;
            flex-shrink: 0;
        }
        .root {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            margin-left: 0.5rem;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.6));
        }
        vaadin-select, vaadin-combo-box {
            width: 11rem;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-vaadin-app-context-picker': MateuVaadinAppContextPicker
    }
}
