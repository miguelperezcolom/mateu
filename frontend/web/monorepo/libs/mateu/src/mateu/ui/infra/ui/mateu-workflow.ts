import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, svg} from "lit";
import "@vaadin/button";
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/select";
import "@vaadin/text-field";
import "@vaadin/integer-field";
import "@vaadin/checkbox";
import "@vaadin/tooltip";
import "@vaadin/horizontal-layout";
import "@vaadin/vertical-layout";

// ── Domain types ─────────────────────────────────────────────────────────────

type StepType = "ACTION" | "JOIN" | "FORK" | "END" | "USER_TASK" | "PROCESS";
type WorkflowStatus = "DRAFT" | "ACTIVE" | "DISABLED" | "ARCHIVED";

interface WorkflowStep {
    id: string;
    type: StepType;
    name: string;
    description?: string;
    preconditionStepId?: string;
    preconditionExpression?: string;
    parallel?: boolean;
    topic?: string;
    formId?: string;
    childWorkflowDefinitionId?: string;
    timeout?: number;
    retries?: number;
    rollbackable?: boolean;
    compensationStepId?: string;
}

interface WorkflowDefinition {
    id?: string;
    name: string;
    version?: number;
    description?: string;
    status?: WorkflowStatus;
    limitConcurrentExecutions?: boolean;
    maxConcurrentExecutions?: number;
    enqueueOnLimit?: boolean;
    steps: WorkflowStep[];
}

interface NodePos { x: number; y: number; }

// ── Constants ─────────────────────────────────────────────────────────────────

const NODE_W = 160;
const NODE_H = 56;
const H_GAP = 220;
const V_GAP = 110;
const CANVAS_PAD = 60;

const TYPE_COLOR: Record<StepType, string> = {
    ACTION:    "#3B82F6",
    JOIN:      "#8B5CF6",
    FORK:      "#F59E0B",
    END:       "#EF4444",
    USER_TASK: "#10B981",
    PROCESS:   "#6366F1",
};

const TYPE_ICON: Record<StepType, string> = {
    ACTION:    "▶",
    JOIN:      "⟨",
    FORK:      "⟩",
    END:       "◼",
    USER_TASK: "👤",
    PROCESS:   "⚙",
};

const STEP_TYPES: StepType[] = ["ACTION", "JOIN", "FORK", "END", "USER_TASK", "PROCESS"];

function newId(): string {
    return "step-" + Math.random().toString(36).slice(2, 8);
}

// ── Component ─────────────────────────────────────────────────────────────────

@customElement("mateu-workflow")
export class MateuWorkflow extends LitElement {

    /** JSON string of the WorkflowDefinition. */
    @property() value = '{"name":"New Workflow","steps":[]}';

    @state() private wf: WorkflowDefinition = { name: "New Workflow", steps: [] };
    @state() private positions: Record<string, NodePos> = {};
    @state() private selectedId: string | null = null;
    @state() private showMeta = false;

    private draggingId: string | null = null;
    private dragOffset = { x: 0, y: 0 };
    private svgEl: SVGSVGElement | null = null;

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    updated(changed: Map<string, unknown>) {
        if (changed.has("value")) {
            try {
                this.wf = JSON.parse(this.value);
            } catch {
                /* keep previous */
            }
            this.autoLayout();
        }
    }

    // ── Layout ────────────────────────────────────────────────────────────────

    private autoLayout() {
        const steps = this.wf.steps ?? [];
        const layerOf: Record<string, number> = {};
        steps.forEach(s => { layerOf[s.id] = 0; });

        let changed = true;
        while (changed) {
            changed = false;
            steps.forEach(s => {
                if (s.preconditionStepId != null && layerOf[s.preconditionStepId] !== undefined) {
                    const needed = layerOf[s.preconditionStepId] + 1;
                    if (needed > layerOf[s.id]) { layerOf[s.id] = needed; changed = true; }
                }
            });
        }

        const cols: Record<number, string[]> = {};
        steps.forEach(s => {
            const l = layerOf[s.id] ?? 0;
            (cols[l] ??= []).push(s.id);
        });

        const newPos = { ...this.positions };
        let layoutChanged = false;
        Object.entries(cols).forEach(([lStr, ids]) => {
            const l = Number(lStr);
            ids.forEach((id, col) => {
                if (!newPos[id]) {
                    newPos[id] = { x: CANVAS_PAD + l * H_GAP, y: CANVAS_PAD + col * V_GAP };
                    layoutChanged = true;
                }
            });
        });
        if (layoutChanged) this.positions = newPos;
    }

    // ── Mutation helpers ──────────────────────────────────────────────────────

    private emit() {
        const json = JSON.stringify(this.wf, null, 2);
        this.dispatchEvent(new CustomEvent("value-changed", { detail: { value: json }, bubbles: true, composed: true }));
    }

    private updateWf(patch: Partial<WorkflowDefinition>) {
        this.wf = { ...this.wf, ...patch };
        this.emit();
    }

    private updateStep(id: string, patch: Partial<WorkflowStep>) {
        this.wf = {
            ...this.wf,
            steps: this.wf.steps.map(s => s.id === id ? { ...s, ...patch } : s),
        };
        this.emit();
    }

    private addStep() {
        const id = newId();
        const step: WorkflowStep = { id, type: "ACTION", name: "New Step" };
        this.wf = { ...this.wf, steps: [...(this.wf.steps ?? []), step] };
        // Place new step below last node
        const ys = Object.values(this.positions).map(p => p.y);
        const y = ys.length ? Math.max(...ys) + V_GAP : CANVAS_PAD;
        this.positions = { ...this.positions, [id]: { x: CANVAS_PAD, y } };
        this.selectedId = id;
        this.emit();
    }

    private deleteStep(id: string) {
        this.wf = {
            ...this.wf,
            steps: this.wf.steps
                .filter(s => s.id !== id)
                .map(s => s.preconditionStepId === id ? { ...s, preconditionStepId: undefined } : s),
        };
        const { [id]: _, ...rest } = this.positions;
        this.positions = rest;
        if (this.selectedId === id) this.selectedId = null;
        this.emit();
    }

    // ── Drag & drop ───────────────────────────────────────────────────────────

    private onNodeMouseDown(e: MouseEvent, id: string) {
        e.preventDefault();
        this.draggingId = id;
        const pos = this.positions[id] ?? { x: 0, y: 0 };
        const pt = this.toSvgPoint(e);
        this.dragOffset = { x: pt.x - pos.x, y: pt.y - pos.y };
        this.svgEl = (e.currentTarget as SVGElement).closest("svg") as SVGSVGElement;
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);
    }

    private onMouseMove = (e: MouseEvent) => {
        if (!this.draggingId || !this.svgEl) return;
        const pt = this.toSvgPoint(e);
        this.positions = {
            ...this.positions,
            [this.draggingId]: {
                x: Math.max(0, pt.x - this.dragOffset.x),
                y: Math.max(0, pt.y - this.dragOffset.y),
            },
        };
    };

    private onMouseUp = () => {
        this.draggingId = null;
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);
    };

    private toSvgPoint(e: MouseEvent): { x: number; y: number } {
        if (!this.svgEl) return { x: 0, y: 0 };
        const rect = this.svgEl.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    // ── Canvas size ───────────────────────────────────────────────────────────

    private canvasSize() {
        const pts = Object.values(this.positions);
        const w = pts.length ? Math.max(...pts.map(p => p.x)) + NODE_W + CANVAS_PAD : 600;
        const h = pts.length ? Math.max(...pts.map(p => p.y)) + NODE_H + CANVAS_PAD : 400;
        return { w: Math.max(w, 600), h: Math.max(h, 400) };
    }

    // ── Render ────────────────────────────────────────────────────────────────

    render() {
        const { w, h } = this.canvasSize();
        const steps = this.wf.steps ?? [];

        return html`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta ? this.renderMeta() : ""}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${w}" height="${h}" class="canvas"
                             @click="${(e: MouseEvent) => { if (e.target === e.currentTarget) this.selectedId = null; }}">
                            <defs>
                                <marker id="arrow" markerWidth="8" markerHeight="8"
                                        refX="6" refY="3" orient="auto">
                                    <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/>
                                </marker>
                            </defs>
                            ${steps.map(s => this.renderArrow(s))}
                            ${steps.map(s => this.renderNode(s))}
                        </svg>
                    </div>
                    ${this.selectedId ? this.renderPanel() : ""}
                </div>
            </div>
        `;
    }

    private renderToolbar() {
        const status = this.wf.status ?? "DRAFT";
        return html`
            <div class="toolbar">
                <span class="wf-name">${this.wf.name}</span>
                <span class="badge badge-${status.toLowerCase()}">${status}</span>
                <div style="flex:1"></div>
                <vaadin-button theme="tertiary small" @click="${() => this.showMeta = !this.showMeta}">
                    <vaadin-icon icon="vaadin:cog" slot="prefix"></vaadin-icon>
                    Settings
                </vaadin-button>
                <vaadin-button theme="primary small" @click="${() => this.addStep()}">
                    <vaadin-icon icon="vaadin:plus" slot="prefix"></vaadin-icon>
                    Add Step
                </vaadin-button>
                <vaadin-button theme="tertiary small" @click="${() => this.exportJson()}">
                    <vaadin-icon icon="vaadin:download" slot="prefix"></vaadin-icon>
                    Export
                </vaadin-button>
            </div>
        `;
    }

    private renderMeta() {
        const wf = this.wf;
        return html`
            <div class="meta-panel">
                <div class="meta-grid">
                    <label>Name</label>
                    <input class="inp" .value="${wf.name}" @change="${(e: any) => this.updateWf({ name: e.target.value })}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2" @change="${(e: any) => this.updateWf({ description: e.target.value })}">${wf.description ?? ""}</textarea>
                    <label>Status</label>
                    <select class="inp" @change="${(e: any) => this.updateWf({ status: e.target.value })}">
                        ${(["DRAFT","ACTIVE","DISABLED","ARCHIVED"] as WorkflowStatus[]).map(s => html`
                            <option value="${s}" ?selected="${wf.status === s}">${s}</option>`)}
                    </select>
                    <label>Limit concurrent</label>
                    <input type="checkbox" ?checked="${wf.limitConcurrentExecutions}"
                           @change="${(e: any) => this.updateWf({ limitConcurrentExecutions: e.target.checked })}"/>
                    ${wf.limitConcurrentExecutions ? html`
                        <label>Max concurrent</label>
                        <input class="inp" type="number" min="0" .value="${String(wf.maxConcurrentExecutions ?? 0)}"
                               @change="${(e: any) => this.updateWf({ maxConcurrentExecutions: Number(e.target.value) })}"/>
                        <label>Enqueue on limit</label>
                        <input type="checkbox" ?checked="${wf.enqueueOnLimit}"
                               @change="${(e: any) => this.updateWf({ enqueueOnLimit: e.target.checked })}"/>
                    ` : ""}
                </div>
            </div>
        `;
    }

    private renderArrow(step: WorkflowStep) {
        if (!step.preconditionStepId) return svg``;
        const from = this.positions[step.preconditionStepId];
        const to = this.positions[step.id];
        if (!from || !to) return svg``;

        const x1 = from.x + NODE_W;
        const y1 = from.y + NODE_H / 2;
        const x2 = to.x;
        const y2 = to.y + NODE_H / 2;
        const cx = (x1 + x2) / 2;

        return svg`
            <path d="M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}"
                  fill="none" stroke="#94a3b8" stroke-width="2"
                  marker-end="url(#arrow)"/>
        `;
    }

    private renderNode(step: WorkflowStep) {
        const pos = this.positions[step.id] ?? { x: CANVAS_PAD, y: CANVAS_PAD };
        const color = TYPE_COLOR[step.type] ?? "#64748b";
        const icon = TYPE_ICON[step.type] ?? "•";
        const selected = this.selectedId === step.id;

        return svg`
            <g transform="translate(${pos.x},${pos.y})"
               style="cursor:grab"
               @mousedown="${(e: MouseEvent) => this.onNodeMouseDown(e, step.id)}"
               @click="${(e: MouseEvent) => { e.stopPropagation(); this.selectedId = step.id; }}">
                <rect width="${NODE_W}" height="${NODE_H}" rx="8"
                      fill="white"
                      stroke="${selected ? color : "#e2e8f0"}"
                      stroke-width="${selected ? 2.5 : 1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge -->
                <rect x="0" y="0" width="32" height="${NODE_H}" rx="8" fill="${color}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${NODE_H}" fill="${color}"/>
                <text x="16" y="${NODE_H / 2 + 5}" text-anchor="middle"
                      font-size="14" fill="white">${icon}</text>
                <!-- name -->
                <text x="44" y="${NODE_H / 2 - 6}" font-size="11" fill="#1e293b" font-weight="600">
                    ${step.name.length > 16 ? step.name.slice(0, 15) + "…" : step.name}
                </text>
                <text x="44" y="${NODE_H / 2 + 8}" font-size="9" fill="#94a3b8">${step.id}</text>
                <text x="44" y="${NODE_H / 2 + 20}" font-size="9" fill="${color}">${step.type}</text>
            </g>
        `;
    }

    private renderPanel() {
        const step = this.wf.steps.find(s => s.id === this.selectedId);
        if (!step) return "";
        const otherSteps = this.wf.steps.filter(s => s.id !== step.id);

        const field = (label: string, body: unknown) => html`
            <div class="field">
                <label class="field-label">${label}</label>
                ${body}
            </div>
        `;

        return html`
            <div class="properties">
                <div class="prop-header">
                    <span>Step Properties</span>
                    <button class="del-btn" title="Delete step"
                            @click="${() => this.deleteStep(step.id)}">🗑</button>
                    <button class="close-btn" @click="${() => this.selectedId = null}">✕</button>
                </div>
                <div class="prop-body">
                    ${field("ID", html`<input class="inp" readonly .value="${step.id}"/>`)}
                    ${field("Name", html`<input class="inp" .value="${step.name}"
                        @change="${(e: any) => this.updateStep(step.id, { name: e.target.value })}"/>`)}
                    ${field("Type", html`
                        <select class="inp" @change="${(e: any) => this.updateStep(step.id, { type: e.target.value })}">
                            ${STEP_TYPES.map(t => html`<option value="${t}" ?selected="${step.type === t}">${t}</option>`)}
                        </select>`)}
                    ${field("Description", html`<textarea class="inp" rows="2"
                        @change="${(e: any) => this.updateStep(step.id, { description: e.target.value })}">${step.description ?? ""}</textarea>`)}
                    ${field("Precondition step", html`
                        <select class="inp" @change="${(e: any) => this.updateStep(step.id, { preconditionStepId: e.target.value || undefined })}">
                            <option value="">— none —</option>
                            ${otherSteps.map(s => html`<option value="${s.id}" ?selected="${step.preconditionStepId === s.id}">${s.name} (${s.id})</option>`)}
                        </select>`)}
                    ${field("Precondition expression", html`<input class="inp" placeholder="JEXL expression"
                        .value="${step.preconditionExpression ?? ""}"
                        @change="${(e: any) => this.updateStep(step.id, { preconditionExpression: e.target.value || undefined })}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${step.parallel}"
                               @change="${(e: any) => this.updateStep(step.id, { parallel: e.target.checked })}"/>
                    </div>
                    ${field("Timeout (ms)", html`<input class="inp" type="number" min="0"
                        .value="${String(step.timeout ?? 0)}"
                        @change="${(e: any) => this.updateStep(step.id, { timeout: Number(e.target.value) })}"/>`)}
                    ${field("Retries", html`<input class="inp" type="number" min="0"
                        .value="${String(step.retries ?? 0)}"
                        @change="${(e: any) => this.updateStep(step.id, { retries: Number(e.target.value) })}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${step.rollbackable}"
                               @change="${(e: any) => this.updateStep(step.id, { rollbackable: e.target.checked })}"/>
                    </div>
                    ${step.rollbackable ? field("Compensation step", html`
                        <select class="inp" @change="${(e: any) => this.updateStep(step.id, { compensationStepId: e.target.value || undefined })}">
                            <option value="">— none —</option>
                            ${otherSteps.map(s => html`<option value="${s.id}" ?selected="${step.compensationStepId === s.id}">${s.name} (${s.id})</option>`)}
                        </select>`) : ""}

                    ${step.type === "ACTION" ? field("Topic", html`<input class="inp" placeholder="kafka.topic.name"
                        .value="${step.topic ?? ""}"
                        @change="${(e: any) => this.updateStep(step.id, { topic: e.target.value || undefined })}"/>`) : ""}
                    ${step.type === "USER_TASK" ? field("Form ID", html`<input class="inp"
                        .value="${step.formId ?? ""}"
                        @change="${(e: any) => this.updateStep(step.id, { formId: e.target.value || undefined })}"/>`) : ""}
                    ${step.type === "PROCESS" ? field("Child workflow ID", html`<input class="inp"
                        .value="${step.childWorkflowDefinitionId ?? ""}"
                        @change="${(e: any) => this.updateStep(step.id, { childWorkflowDefinitionId: e.target.value || undefined })}"/>`) : ""}
                </div>
            </div>
        `;
    }

    // ── Export ────────────────────────────────────────────────────────────────

    private exportJson() {
        const json = JSON.stringify(this.wf, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (this.wf.name ?? "workflow").replace(/\s+/g, "-").toLowerCase() + ".json";
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
            padding: .5rem 1rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            background: var(--lumo-base-color, #fff);
            flex-shrink: 0;
        }
        .wf-name { font-weight: 600; font-size: 1rem; color: var(--lumo-body-text-color, #1e293b); }
        .badge {
            font-size: .7rem; font-weight: 600; padding: .15rem .5rem;
            border-radius: 9999px; text-transform: uppercase; letter-spacing: .04em;
        }
        .badge-draft    { background: #e2e8f0; color: #475569; }
        .badge-active   { background: #dcfce7; color: #166534; }
        .badge-disabled { background: #fef9c3; color: #854d0e; }
        .badge-archived { background: #fee2e2; color: #991b1b; }

        /* meta */
        .meta-panel {
            padding: .75rem 1rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            background: var(--lumo-contrast-5pct, #f8fafc);
            flex-shrink: 0;
        }
        .meta-grid { display: grid; grid-template-columns: 120px 1fr; gap: .4rem .75rem; align-items: start; }
        .meta-grid label { font-size: .8rem; color: #64748b; padding-top: .3rem; }

        /* workspace */
        .workspace { display: flex; flex: 1; overflow: hidden; }
        .canvas-wrap { flex: 1; overflow: auto; background: #f8fafc; }
        .canvas { display: block; }

        /* properties panel */
        .properties {
            width: 280px; flex-shrink: 0;
            border-left: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            display: flex; flex-direction: column;
            background: var(--lumo-base-color, #fff);
        }
        .prop-header {
            display: flex; align-items: center;
            padding: .6rem .75rem;
            font-size: .85rem; font-weight: 600;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            gap: .4rem;
        }
        .prop-header span { flex: 1; }
        .del-btn, .close-btn {
            background: none; border: none; cursor: pointer;
            font-size: .95rem; padding: .1rem .3rem; border-radius: 4px;
            line-height: 1;
        }
        .del-btn:hover { background: #fee2e2; }
        .close-btn:hover { background: #f1f5f9; }
        .prop-body { flex: 1; overflow-y: auto; padding: .75rem; display: flex; flex-direction: column; gap: .6rem; }

        /* fields */
        .field { display: flex; flex-direction: column; gap: .2rem; }
        .field.row { flex-direction: row; align-items: center; gap: .5rem; }
        .field-label { font-size: .75rem; color: #64748b; font-weight: 500; }
        .inp {
            width: 100%; box-sizing: border-box;
            padding: .3rem .5rem;
            border: 1px solid #e2e8f0; border-radius: 6px;
            font-size: .82rem; color: #1e293b;
            background: #fff; outline: none;
            font-family: inherit;
            transition: border-color .15s;
        }
        .inp:focus { border-color: #3B82F6; }
        textarea.inp { resize: vertical; }
        input[readonly].inp { background: #f8fafc; color: #94a3b8; }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-workflow": MateuWorkflow;
    }
}
