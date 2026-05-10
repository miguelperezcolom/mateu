import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing} from "lit";
import Sortable from "sortablejs";
import "@vaadin/button";
import "@vaadin/icon";
import "@vaadin/icons";

// ── Domain types ──────────────────────────────────────────────────────────────

type DataType =
    | "integer" | "string" | "number" | "date" | "time" | "dateTime"
    | "bool" | "array" | "file" | "status" | "money" | "component"
    | "menu" | "range" | "action" | "actionGroup" | "dateRange";

type Stereotype =
    | "regular" | "radio" | "checkbox" | "textarea" | "toggle" | "combobox"
    | "select" | "email" | "password" | "richText" | "listBox" | "html"
    | "markdown" | "image" | "icon" | "link" | "money" | "grid" | "color"
    | "choice" | "popover" | "slider" | "button" | "stars";

interface FormField {
    id: string;
    label: string;
    dataType: DataType;
    stereotype?: Stereotype;
    required?: boolean;
    description?: string;
}

interface FormDefinition {
    id?: string;
    name: string;
    description?: string;
    fields: FormField[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DATA_TYPES: DataType[] = [
    "string", "integer", "number", "bool", "date", "time", "dateTime",
    "dateRange", "money", "file", "array", "status", "component",
    "menu", "range", "action", "actionGroup",
];

const STEREOTYPES: Stereotype[] = [
    "regular", "radio", "checkbox", "textarea", "toggle", "combobox",
    "select", "email", "password", "richText", "listBox", "html",
    "markdown", "image", "icon", "link", "money", "grid", "color",
    "choice", "popover", "slider", "button", "stars",
];

const TYPE_COLOR: Record<DataType, string> = {
    string:      "#3B82F6",
    integer:     "#8B5CF6",
    number:      "#6366F1",
    bool:        "#10B981",
    date:        "#F59E0B",
    time:        "#F59E0B",
    dateTime:    "#F59E0B",
    dateRange:   "#F59E0B",
    money:       "#EF4444",
    file:        "#64748B",
    array:       "#0EA5E9",
    status:      "#EC4899",
    component:   "#14B8A6",
    menu:        "#94A3B8",
    range:       "#A855F7",
    action:      "#F97316",
    actionGroup: "#FB923C",
};

function newId(): string {
    return "field-" + Math.random().toString(36).slice(2, 8);
}

// ── Component ─────────────────────────────────────────────────────────────────

@customElement("mateu-form-editor")
export class MateuFormEditor extends LitElement {

    /** JSON string of the FormDefinition. */
    @property() value = '{"name":"New Form","fields":[]}';

    @state() private form: FormDefinition = {name: "New Form", fields: []};
    @state() private selectedId: string | null = null;
    @state() private showMeta = false;

    private sortable: Sortable | null = null;
    private listEl: HTMLElement | null = null;

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    updated(changed: Map<string, unknown>) {
        if (changed.has("value")) {
            try {
                this.form = JSON.parse(this.value);
            } catch {
                /* keep previous */
            }
        }
        this.attachSortable();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.sortable?.destroy();
        this.sortable = null;
    }

    private attachSortable() {
        const el = this.shadowRoot?.querySelector<HTMLElement>(".field-list");
        if (!el || el === this.listEl) return;
        this.listEl = el;
        this.sortable?.destroy();
        this.sortable = Sortable.create(el, {
            animation: 150,
            handle: ".drag-handle",
            ghostClass: "sortable-ghost",
            onEnd: (evt) => {
                const {oldIndex, newIndex} = evt;
                if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;
                const fields = [...this.form.fields];
                const [moved] = fields.splice(oldIndex, 1);
                fields.splice(newIndex, 0, moved);
                this.form = {...this.form, fields};
                this.emit();
            },
        });
    }

    // ── Mutation helpers ──────────────────────────────────────────────────────

    private emit() {
        const json = JSON.stringify(this.form, null, 2);
        this.dispatchEvent(new CustomEvent("value-changed", {detail: {value: json}, bubbles: true, composed: true}));
    }

    private updateForm(patch: Partial<FormDefinition>) {
        this.form = {...this.form, ...patch};
        this.emit();
    }

    private updateField(id: string, patch: Partial<FormField>) {
        this.form = {
            ...this.form,
            fields: this.form.fields.map(f => f.id === id ? {...f, ...patch} : f),
        };
        this.emit();
    }

    private addField() {
        const id = newId();
        const field: FormField = {id, label: "New Field", dataType: "string"};
        this.form = {...this.form, fields: [...this.form.fields, field]};
        this.selectedId = id;
        this.emit();
    }

    private deleteField(id: string) {
        this.form = {...this.form, fields: this.form.fields.filter(f => f.id !== id)};
        if (this.selectedId === id) this.selectedId = null;
        this.emit();
    }

    private duplicateField(id: string) {
        const src = this.form.fields.find(f => f.id === id);
        if (!src) return;
        const copy: FormField = {...src, id: newId(), label: src.label + " (copy)"};
        const idx = this.form.fields.findIndex(f => f.id === id);
        const fields = [...this.form.fields];
        fields.splice(idx + 1, 0, copy);
        this.form = {...this.form, fields};
        this.selectedId = copy.id;
        this.emit();
    }

    // ── Render ────────────────────────────────────────────────────────────────

    render() {
        return html`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta ? this.renderMeta() : nothing}
                <div class="workspace">
                    ${this.renderList()}
                    ${this.selectedId ? this.renderPanel() : nothing}
                </div>
            </div>
        `;
    }

    private renderToolbar() {
        return html`
            <div class="toolbar">
                <span class="form-name">${this.form.name}</span>
                <div style="flex:1"></div>
                <vaadin-button theme="tertiary small" @click="${() => this.showMeta = !this.showMeta}">
                    <vaadin-icon icon="vaadin:cog" slot="prefix"></vaadin-icon>
                    Settings
                </vaadin-button>
                <vaadin-button theme="primary small" @click="${() => this.addField()}">
                    <vaadin-icon icon="vaadin:plus" slot="prefix"></vaadin-icon>
                    Add Field
                </vaadin-button>
                <vaadin-button theme="tertiary small" @click="${() => this.exportJson()}">
                    <vaadin-icon icon="vaadin:download" slot="prefix"></vaadin-icon>
                    Export
                </vaadin-button>
            </div>
        `;
    }

    private renderMeta() {
        const f = this.form;
        return html`
            <div class="meta-panel">
                <div class="meta-grid">
                    <label>Name</label>
                    <input class="inp" .value="${f.name}"
                           @change="${(e: any) => this.updateForm({name: e.target.value})}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2"
                              @change="${(e: any) => this.updateForm({description: e.target.value})}">${f.description ?? ""}</textarea>
                </div>
            </div>
        `;
    }

    private renderList() {
        const fields = this.form.fields;
        return html`
            <div class="list-wrap">
                ${fields.length === 0 ? html`
                    <div class="empty">
                        No fields yet. Click <strong>Add Field</strong> to start.
                    </div>` : nothing}
                <div class="field-list">
                    ${fields.map(f => this.renderRow(f))}
                </div>
            </div>
        `;
    }

    private renderRow(f: FormField) {
        const color = TYPE_COLOR[f.dataType] ?? "#64748b";
        const selected = this.selectedId === f.id;
        return html`
            <div class="field-row ${selected ? "selected" : ""}"
                 data-id="${f.id}"
                 @click="${() => this.selectedId = this.selectedId === f.id ? null : f.id}">
                <span class="drag-handle" title="Drag to reorder">⠿</span>
                <span class="type-badge" style="background:${color}">${f.dataType}</span>
                <span class="field-label-text">${f.label}</span>
                <span class="field-id-text">${f.id}</span>
                ${f.required ? html`<span class="required-badge">required</span>` : nothing}
                ${f.stereotype && f.stereotype !== "regular"
                    ? html`<span class="stereo-badge">${f.stereotype}</span>` : nothing}
                <div style="flex:1"></div>
                <button class="row-btn" title="Duplicate"
                        @click="${(e: MouseEvent) => { e.stopPropagation(); this.duplicateField(f.id); }}">⧉</button>
                <button class="row-btn danger" title="Delete"
                        @click="${(e: MouseEvent) => { e.stopPropagation(); this.deleteField(f.id); }}">🗑</button>
            </div>
        `;
    }

    private renderPanel() {
        const f = this.form.fields.find(x => x.id === this.selectedId);
        if (!f) return nothing;

        const field = (label: string, body: unknown) => html`
            <div class="prop-field">
                <label class="prop-label">${label}</label>
                ${body}
            </div>
        `;

        return html`
            <div class="properties">
                <div class="prop-header">
                    <span>Field Properties</span>
                    <button class="close-btn" @click="${() => this.selectedId = null}">✕</button>
                </div>
                <div class="prop-body">
                    ${field("ID", html`<input class="inp" readonly .value="${f.id}"/>`)}
                    ${field("Label", html`
                        <input class="inp" .value="${f.label}"
                               @change="${(e: any) => this.updateField(f.id, {label: e.target.value})}"/>`)}
                    ${field("Data type", html`
                        <select class="inp"
                                @change="${(e: any) => this.updateField(f.id, {dataType: e.target.value})}">
                            ${DATA_TYPES.map(t => html`
                                <option value="${t}" ?selected="${f.dataType === t}">${t}</option>`)}
                        </select>`)}
                    ${field("Stereotype", html`
                        <select class="inp"
                                @change="${(e: any) => this.updateField(f.id, {stereotype: e.target.value || undefined})}">
                            ${STEREOTYPES.map(s => html`
                                <option value="${s}" ?selected="${(f.stereotype ?? "regular") === s}">${s}</option>`)}
                        </select>`)}
                    <div class="prop-field row">
                        <label class="prop-label">Required</label>
                        <input type="checkbox" ?checked="${f.required}"
                               @change="${(e: any) => this.updateField(f.id, {required: e.target.checked})}"/>
                    </div>
                    ${field("Description / hint", html`
                        <textarea class="inp" rows="3"
                                  @change="${(e: any) => this.updateField(f.id, {description: e.target.value || undefined})}">${f.description ?? ""}</textarea>`)}
                </div>
            </div>
        `;
    }

    // ── Export ────────────────────────────────────────────────────────────────

    private exportJson() {
        const json = JSON.stringify(this.form, null, 2);
        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (this.form.name ?? "form").replace(/\s+/g, "-").toLowerCase() + ".json";
        a.click();
        URL.revokeObjectURL(url);
    }

    // ── Styles ────────────────────────────────────────────────────────────────

    static styles = css`
        :host { display: block; height: 100%; font-family: var(--lumo-font-family, sans-serif); }

        .root { display: flex; flex-direction: column; height: 100%; background: var(--lumo-base-color, #fff); }

        /* toolbar */
        .toolbar {
            display: flex; align-items: center; gap: .5rem;
            padding: .5rem 1rem; flex-shrink: 0;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
        }
        .form-name { font-weight: 600; font-size: 1rem; color: var(--lumo-body-text-color, #1e293b); }

        /* meta panel */
        .meta-panel {
            padding: .75rem 1rem; flex-shrink: 0;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            background: var(--lumo-contrast-5pct, #f8fafc);
        }
        .meta-grid { display: grid; grid-template-columns: 100px 1fr; gap: .4rem .75rem; align-items: start; }
        .meta-grid label { font-size: .8rem; color: #64748b; padding-top: .3rem; }

        /* workspace */
        .workspace { display: flex; flex: 1; overflow: hidden; }

        /* field list */
        .list-wrap { flex: 1; overflow-y: auto; padding: .75rem; }
        .empty {
            text-align: center; color: #94a3b8; padding: 3rem 1rem;
            font-size: .9rem; border: 2px dashed #e2e8f0; border-radius: 8px;
        }

        .field-list { display: flex; flex-direction: column; gap: .4rem; }

        .field-row {
            display: flex; align-items: center; gap: .5rem;
            padding: .5rem .75rem; border-radius: 8px; cursor: pointer;
            border: 1.5px solid #e2e8f0; background: #fff;
            transition: border-color .15s, box-shadow .15s;
            user-select: none;
        }
        .field-row:hover { border-color: #94a3b8; box-shadow: 0 1px 4px #0000000d; }
        .field-row.selected { border-color: #3B82F6; box-shadow: 0 0 0 2px #3B82F620; }

        /* sortablejs ghost */
        .sortable-ghost { opacity: .35; background: #dbeafe !important; }

        .drag-handle {
            cursor: grab; color: #cbd5e1; font-size: 1.1rem; flex-shrink: 0;
            padding: 0 .1rem;
        }
        .drag-handle:active { cursor: grabbing; }

        .type-badge {
            font-size: .65rem; font-weight: 700; padding: .15rem .45rem;
            border-radius: 9999px; color: #fff; text-transform: uppercase;
            letter-spacing: .03em; flex-shrink: 0;
        }
        .required-badge {
            font-size: .65rem; font-weight: 600; padding: .15rem .4rem;
            border-radius: 9999px; background: #fee2e2; color: #991b1b;
            flex-shrink: 0;
        }
        .stereo-badge {
            font-size: .65rem; font-weight: 600; padding: .15rem .4rem;
            border-radius: 9999px; background: #ede9fe; color: #6d28d9;
            flex-shrink: 0;
        }
        .field-label-text { font-size: .875rem; font-weight: 600; color: #1e293b; }
        .field-id-text { font-size: .75rem; color: #94a3b8; }

        .row-btn {
            background: none; border: none; cursor: pointer;
            font-size: .9rem; padding: .15rem .3rem; border-radius: 4px; line-height: 1;
            color: #94a3b8; flex-shrink: 0;
        }
        .row-btn:hover { background: #f1f5f9; color: #475569; }
        .row-btn.danger:hover { background: #fee2e2; color: #b91c1c; }

        /* properties panel */
        .properties {
            width: 280px; flex-shrink: 0;
            border-left: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            display: flex; flex-direction: column;
            background: var(--lumo-base-color, #fff);
        }
        .prop-header {
            display: flex; align-items: center; gap: .4rem;
            padding: .6rem .75rem; font-size: .85rem; font-weight: 600;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
        }
        .prop-header span { flex: 1; }
        .close-btn {
            background: none; border: none; cursor: pointer;
            font-size: .95rem; padding: .1rem .3rem; border-radius: 4px; line-height: 1;
        }
        .close-btn:hover { background: #f1f5f9; }
        .prop-body {
            flex: 1; overflow-y: auto; padding: .75rem;
            display: flex; flex-direction: column; gap: .6rem;
        }

        /* inputs */
        .prop-field { display: flex; flex-direction: column; gap: .2rem; }
        .prop-field.row { flex-direction: row; align-items: center; gap: .5rem; }
        .prop-label { font-size: .75rem; color: #64748b; font-weight: 500; }
        .inp {
            width: 100%; box-sizing: border-box;
            padding: .3rem .5rem; border: 1px solid #e2e8f0; border-radius: 6px;
            font-size: .82rem; color: #1e293b; background: #fff;
            outline: none; font-family: inherit; transition: border-color .15s;
        }
        .inp:focus { border-color: #3B82F6; }
        textarea.inp { resize: vertical; }
        input[readonly].inp { background: #f8fafc; color: #94a3b8; }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-form-editor": MateuFormEditor;
    }
}
