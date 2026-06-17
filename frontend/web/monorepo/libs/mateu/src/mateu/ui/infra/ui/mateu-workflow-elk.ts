import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, svg} from "lit";
import ELK, {ElkNode, ElkExtendedEdge} from "elkjs/lib/elk.bundled.js";
import "@vaadin/button";
import "@vaadin/icon";
import "@vaadin/icons";

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
const PAD = 60;

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

const elk = new ELK();

function newId(): string {
    return "step-" + Math.random().toString(36).slice(2, 8);
}

// ── Component ─────────────────────────────────────────────────────────────────

@customElement("mateu-workflow-elk")
export class MateuWorkflowElk extends LitElement {

    /** JSON string of the WorkflowDefinition. */
    @property() value = '{"name":"New Workflow","steps":[]}';

    /** When true, all editing interactions are disabled. */
    @property({type: Boolean}) readOnly = false;

    @state() private wf: WorkflowDefinition = {name: "New Workflow", steps: []};
    @state() private positions: Record<string, NodePos> = {};
    @state() private layoutReady = false;
    @state() private selectedId: string | null = null;
    @state() private showMeta = false;
    @state() private layoutError: string | null = null;

    private draggingId: string | null = null;
    private dragOffset = {x: 0, y: 0};
    private svgEl: SVGSVGElement | null = null;
    /** Track which step ids already have an ELK-computed position so we only
     *  re-layout genuinely new nodes, not ones the user has repositioned. */
    private elkPositioned = new Set<string>();

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    updated(changed: Map<string, unknown>) {
        if (changed.has("value")) {
            try {
                const parsed: WorkflowDefinition = JSON.parse(this.value);
                // Detect if the step list changed so we re-run ELK
                const oldIds = new Set((this.wf.steps ?? []).map(s => s.id));
                const newIds = new Set((parsed.steps ?? []).map(s => s.id));
                const structureChanged =
                    oldIds.size !== newIds.size ||
                    [...newIds].some(id => !oldIds.has(id)) ||
                    [...newIds].some(id => {
                        const oldStep = (this.wf.steps ?? []).find(s => s.id === id);
                        const newStep = (parsed.steps ?? []).find(s => s.id === id);
                        return oldStep?.preconditionStepId !== newStep?.preconditionStepId;
                    });
                this.wf = parsed;
                if (structureChanged || !this.layoutReady) {
                    this.runElkLayout();
                }
            } catch {
                /* keep previous */
            }
        }
    }

    // ── ELK layout ────────────────────────────────────────────────────────────

    private async runElkLayout() {
        const steps = this.wf.steps ?? [];
        if (steps.length === 0) {
            this.positions = {};
            this.layoutReady = true;
            return;
        }

        const graph: ElkNode = {
            id: "root",
            layoutOptions: {
                "elk.algorithm": "layered",
                "elk.direction": "RIGHT",
                "elk.spacing.nodeNode": "40",
                "elk.layered.spacing.nodeNodeBetweenLayers": "80",
                "elk.edgeRouting": "ORTHOGONAL",
                "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
            },
            children: steps.map(s => ({
                id: s.id,
                width: NODE_W,
                height: NODE_H,
            })),
            edges: steps
                .filter(s => s.preconditionStepId)
                .map(s => ({
                    id: `${s.preconditionStepId}->${s.id}`,
                    sources: [s.preconditionStepId!],
                    targets: [s.id],
                } as ElkExtendedEdge)),
        };

        try {
            const laid = await elk.layout(graph);
            const newPositions: Record<string, NodePos> = {...this.positions};
            for (const child of laid.children ?? []) {
                // Only override position for nodes not manually repositioned
                if (!this.elkPositioned.has(child.id) || !newPositions[child.id]) {
                    newPositions[child.id] = {
                        x: (child.x ?? 0) + PAD,
                        y: (child.y ?? 0) + PAD,
                    };
                    this.elkPositioned.add(child.id);
                }
            }
            this.positions = newPositions;
            this.layoutReady = true;
            this.layoutError = null;
        } catch (e) {
            this.layoutError = (e as Error)?.message ?? "ELK layout failed";
            this.layoutReady = true;
        }
    }

    // ── Mutation helpers ──────────────────────────────────────────────────────

    private emit() {
        const json = JSON.stringify(this.wf, null, 2);
        this.dispatchEvent(new CustomEvent("value-changed", {detail: {value: json}, bubbles: true, composed: true}));
    }

    private updateWf(patch: Partial<WorkflowDefinition>) {
        this.wf = {...this.wf, ...patch};
        this.emit();
    }

    private updateStep(id: string, patch: Partial<WorkflowStep>) {
        const steps = this.wf.steps.map(s => s.id === id ? {...s, ...patch} : s);
        const oldStep = this.wf.steps.find(s => s.id === id);
        const edgeChanged = patch.preconditionStepId !== undefined &&
            patch.preconditionStepId !== oldStep?.preconditionStepId;
        this.wf = {...this.wf, steps};
        if (edgeChanged) {
            // Invalidate ELK positions so a fresh layout runs
            this.elkPositioned.clear();
            this.runElkLayout();
        }
        this.emit();
    }

    private addStep() {
        const id = newId();
        const step: WorkflowStep = {id, type: "ACTION", name: "New Step"};
        this.wf = {...this.wf, steps: [...(this.wf.steps ?? []), step]};
        // Position new step to the right of the rightmost existing node until ELK runs
        const xs = Object.values(this.positions).map(p => p.x);
        this.positions = {
            ...this.positions,
            [id]: {x: xs.length ? Math.max(...xs) + NODE_W + 80 : PAD, y: PAD},
        };
        this.selectedId = id;
        // Re-run ELK for the new node (don't lock old positions so the whole
        // graph gets a clean layout with the new node included)
        this.elkPositioned.clear();
        this.runElkLayout();
        this.emit();
    }

    private deleteStep(id: string) {
        this.wf = {
            ...this.wf,
            steps: this.wf.steps
                .filter(s => s.id !== id)
                .map(s => s.preconditionStepId === id ? {...s, preconditionStepId: undefined} : s),
        };
        const {[id]: _, ...rest} = this.positions;
        this.positions = rest;
        this.elkPositioned.delete(id);
        if (this.selectedId === id) this.selectedId = null;
        this.runElkLayout();
        this.emit();
    }

    // ── Drag & drop ───────────────────────────────────────────────────────────

    private onNodeMouseDown(e: MouseEvent, id: string) {
        if (this.readOnly) return;
        e.preventDefault();
        this.draggingId = id;
        const pos = this.positions[id] ?? {x: 0, y: 0};
        const pt = this.toSvgPoint(e);
        this.dragOffset = {x: pt.x - pos.x, y: pt.y - pos.y};
        this.svgEl = (e.currentTarget as SVGElement).closest("svg") as SVGSVGElement;
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mouseup", this.onMouseUp);
    }

    private onMouseMove = (e: MouseEvent) => {
        if (!this.draggingId || !this.svgEl) return;
        const pt = this.toSvgPoint(e);
        // Mark as manually positioned so ELK won't override it next run
        this.elkPositioned.add(this.draggingId);
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

    private toSvgPoint(e: MouseEvent): {x: number; y: number} {
        if (!this.svgEl) return {x: 0, y: 0};
        const rect = this.svgEl.getBoundingClientRect();
        return {x: e.clientX - rect.left, y: e.clientY - rect.top};
    }

    // ── Re-layout button ──────────────────────────────────────────────────────

    private relayout() {
        this.elkPositioned.clear();
        this.runElkLayout();
    }

    // ── Canvas size ───────────────────────────────────────────────────────────

    private canvasSize() {
        const pts = Object.values(this.positions);
        const w = pts.length ? Math.max(...pts.map(p => p.x)) + NODE_W + PAD : 600;
        const h = pts.length ? Math.max(...pts.map(p => p.y)) + NODE_H + PAD : 400;
        return {w: Math.max(w, 600), h: Math.max(h, 400)};
    }

    // ── Render ────────────────────────────────────────────────────────────────

    render() {
        if (!this.layoutReady) {
            return html`<div class="loading">Computing layout…</div>`;
        }

        const {w, h} = this.canvasSize();
        const steps = this.wf.steps ?? [];

        return html`
            <div class="root">
                ${this.renderToolbar()}
                ${this.showMeta ? this.renderMeta() : ""}
                ${this.layoutError ? html`<div class="error">⚠ ${this.layoutError}</div>` : ""}
                <div class="workspace">
                    <div class="canvas-wrap">
                        <svg width="${w}" height="${h}" class="canvas"
                             @click="${(e: MouseEvent) => {if (e.target === e.currentTarget) this.selectedId = null;}}">
                            <defs>
                                <marker id="arrow" markerWidth="10" markerHeight="10"
                                        refX="8" refY="3.5" orient="auto">
                                    <path d="M0,0 L0,7 L10,3.5 z" fill="#94a3b8"/>
                                </marker>
                                <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                                    <feDropShadow dx="0" dy="2" stdDeviation="3"
                                                  flood-color="#00000018"/>
                                </filter>
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
                <vaadin-button theme="tertiary small" title="Re-run ELK layout"
                               @click="${() => this.relayout()}">
                    <vaadin-icon icon="vaadin:sitemap" slot="prefix"></vaadin-icon>
                    Re-layout
                </vaadin-button>
                ${!this.readOnly ? html`
                    <vaadin-button theme="tertiary small" @click="${() => this.showMeta = !this.showMeta}">
                        <vaadin-icon icon="vaadin:cog" slot="prefix"></vaadin-icon>
                        Settings
                    </vaadin-button>
                    <vaadin-button theme="primary small" @click="${() => this.addStep()}">
                        <vaadin-icon icon="vaadin:plus" slot="prefix"></vaadin-icon>
                        Add Step
                    </vaadin-button>
                ` : nothing}
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
                    <input class="inp" .value="${wf.name}"
                           @change="${(e: Event) => this.updateWf({name: (e.target as HTMLInputElement).value})}"/>
                    <label>Description</label>
                    <textarea class="inp" rows="2"
                              @change="${(e: Event) => this.updateWf({description: (e.target as HTMLTextAreaElement).value})}">${wf.description ?? ""}</textarea>
                    <label>Status</label>
                    <select class="inp"
                            @change="${(e: Event) => this.updateWf({status: (e.target as HTMLSelectElement).value as WorkflowStatus})}">
                        ${(["DRAFT", "ACTIVE", "DISABLED", "ARCHIVED"] as WorkflowStatus[]).map(s => html`
                            <option value="${s}" ?selected="${wf.status === s}">${s}</option>`)}
                    </select>
                    <label>Limit concurrent</label>
                    <input type="checkbox" ?checked="${wf.limitConcurrentExecutions}"
                           @change="${(e: Event) => this.updateWf({limitConcurrentExecutions: (e.target as HTMLInputElement).checked})}"/>
                    ${wf.limitConcurrentExecutions ? html`
                        <label>Max concurrent</label>
                        <input class="inp" type="number" min="0"
                               .value="${String(wf.maxConcurrentExecutions ?? 0)}"
                               @change="${(e: Event) => this.updateWf({maxConcurrentExecutions: Number((e.target as HTMLInputElement).value)})}"/>
                        <label>Enqueue on limit</label>
                        <input type="checkbox" ?checked="${wf.enqueueOnLimit}"
                               @change="${(e: Event) => this.updateWf({enqueueOnLimit: (e.target as HTMLInputElement).checked})}"/>
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

        // Connect right-center of source → left-center of target
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
        const pos = this.positions[step.id] ?? {x: PAD, y: PAD};
        const color = TYPE_COLOR[step.type] ?? "#64748b";
        const icon = TYPE_ICON[step.type] ?? "•";
        const selected = this.selectedId === step.id;
        const label = step.name.length > 16 ? step.name.slice(0, 15) + "…" : step.name;

        return svg`
            <g transform="translate(${pos.x},${pos.y})"
               style="cursor:grab"
               @mousedown="${(e: MouseEvent) => this.onNodeMouseDown(e, step.id)}"
               @click="${(e: MouseEvent) => {e.stopPropagation(); this.selectedId = step.id;}}">
                <rect width="${NODE_W}" height="${NODE_H}" rx="8"
                      fill="white"
                      stroke="${selected ? color : "#e2e8f0"}"
                      stroke-width="${selected ? 2.5 : 1.5}"
                      filter="url(#shadow)"/>
                <!-- type badge strip -->
                <rect x="0" y="0" width="32" height="${NODE_H}" rx="8"
                      fill="${color}" clip-path="inset(0 -8px 0 0 round 8px)"/>
                <rect x="24" y="0" width="8" height="${NODE_H}" fill="${color}"/>
                <text x="16" y="${NODE_H / 2 + 5}" text-anchor="middle"
                      font-size="14" fill="white">${icon}</text>
                <!-- labels -->
                <text x="44" y="${NODE_H / 2 - 6}" font-size="11"
                      fill="#1e293b" font-weight="600">${label}</text>
                <text x="44" y="${NODE_H / 2 + 8}" font-size="9"
                      fill="#94a3b8">${step.id}</text>
                <text x="44" y="${NODE_H / 2 + 20}" font-size="9"
                      fill="${color}">${step.type}</text>
            </g>
        `;
    }

    private renderPanel() {
        const step = this.wf.steps.find(s => s.id === this.selectedId);
        if (!step) return "";
        const others = this.wf.steps.filter(s => s.id !== step.id);
        const ro = this.readOnly;

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
                    ${!ro ? html`<button class="del-btn" title="Delete step"
                            @click="${() => this.deleteStep(step.id)}">🗑</button>` : nothing}
                    <button class="close-btn"
                            @click="${() => this.selectedId = null}">✕</button>
                </div>
                <div class="prop-body">
                    ${field("ID", html`<input class="inp" readonly .value="${step.id}"/>`)}
                    ${field("Name", html`<input class="inp" ?readonly="${ro}" .value="${step.name}"
                        @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {name: (e.target as HTMLInputElement).value})}"/>`)}
                    ${field("Type", html`
                        <select class="inp" ?disabled="${ro}"
                                @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {type: (e.target as HTMLSelectElement).value as StepType})}">
                            ${STEP_TYPES.map(t => html`
                                <option value="${t}" ?selected="${step.type === t}">${t}</option>`)}
                        </select>`)}
                    ${field("Description", html`<textarea class="inp" rows="2" ?readonly="${ro}"
                        @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {description: (e.target as HTMLTextAreaElement).value})}">${step.description ?? ""}</textarea>`)}
                    ${field("Precondition step", html`
                        <select class="inp" ?disabled="${ro}"
                                @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {preconditionStepId: (e.target as HTMLSelectElement).value || undefined})}">
                            <option value="">— none —</option>
                            ${others.map(s => html`
                                <option value="${s.id}" ?selected="${step.preconditionStepId === s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`)}
                    ${field("Precondition expression", html`
                        <input class="inp" placeholder="JEXL expression" ?readonly="${ro}"
                               .value="${step.preconditionExpression ?? ""}"
                               @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {preconditionExpression: (e.target as HTMLInputElement).value || undefined})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Parallel</label>
                        <input type="checkbox" ?checked="${step.parallel}" ?disabled="${ro}"
                               @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {parallel: (e.target as HTMLInputElement).checked})}"/>
                    </div>
                    ${field("Timeout (ms)", html`
                        <input class="inp" type="number" min="0" ?readonly="${ro}"
                               .value="${String(step.timeout ?? 0)}"
                               @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {timeout: Number((e.target as HTMLInputElement).value)})}"/>`)}
                    ${field("Retries", html`
                        <input class="inp" type="number" min="0" ?readonly="${ro}"
                               .value="${String(step.retries ?? 0)}"
                               @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {retries: Number((e.target as HTMLInputElement).value)})}"/>`)}
                    <div class="field row">
                        <label class="field-label">Rollbackable</label>
                        <input type="checkbox" ?checked="${step.rollbackable}" ?disabled="${ro}"
                               @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {rollbackable: (e.target as HTMLInputElement).checked})}"/>
                    </div>
                    ${step.rollbackable ? field("Compensation step", html`
                        <select class="inp" ?disabled="${ro}"
                                @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {compensationStepId: (e.target as HTMLSelectElement).value || undefined})}">
                            <option value="">— none —</option>
                            ${others.map(s => html`
                                <option value="${s.id}" ?selected="${step.compensationStepId === s.id}">
                                    ${s.name} (${s.id})
                                </option>`)}
                        </select>`) : ""}
                    ${step.type === "ACTION" ? field("Topic", html`
                        <input class="inp" placeholder="kafka.topic.name" ?readonly="${ro}"
                               .value="${step.topic ?? ""}"
                               @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {topic: (e.target as HTMLInputElement).value || undefined})}"/>`) : ""}
                    ${step.type === "USER_TASK" ? field("Form ID", html`
                        <input class="inp" ?readonly="${ro}" .value="${step.formId ?? ""}"
                               @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {formId: (e.target as HTMLInputElement).value || undefined})}"/>`) : ""}
                    ${step.type === "PROCESS" ? field("Child workflow ID", html`
                        <input class="inp" ?readonly="${ro}" .value="${step.childWorkflowDefinitionId ?? ""}"
                               @change="${ro ? nothing : (e: Event) => this.updateStep(step.id, {childWorkflowDefinitionId: (e.target as HTMLInputElement).value || undefined})}"/>`) : ""}
                </div>
            </div>
        `;
    }

    // ── Export ────────────────────────────────────────────────────────────────

    private exportJson() {
        const json = JSON.stringify(this.wf, null, 2);
        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (this.wf.name ?? "workflow").replace(/\s+/g, "-").toLowerCase() + ".json";
        a.click();
        URL.revokeObjectURL(url);
    }

    // ── Styles ────────────────────────────────────────────────────────────────

    static styles = css`
        :host {display: block; height: 100%; font-family: var(--lumo-font-family, sans-serif);}

        .root {display: flex; flex-direction: column; height: 100%; background: var(--lumo-base-color, #fff);}

        .loading {
            display: flex; align-items: center; justify-content: center;
            height: 100%; color: #94a3b8; font-size: .9rem;
        }
        .error {
            padding: .4rem 1rem; background: #fee2e2; color: #991b1b;
            font-size: .8rem; flex-shrink: 0;
        }

        /* toolbar */
        .toolbar {
            display: flex; align-items: center; gap: .5rem;
            padding: .5rem 1rem; flex-shrink: 0;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
        }
        .wf-name {font-weight: 600; font-size: 1rem; color: var(--lumo-body-text-color, #1e293b);}
        .badge {
            font-size: .7rem; font-weight: 600; padding: .15rem .5rem;
            border-radius: 9999px; text-transform: uppercase; letter-spacing: .04em;
        }
        .badge-draft    {background: #e2e8f0; color: #475569;}
        .badge-active   {background: #dcfce7; color: #166534;}
        .badge-disabled {background: #fef9c3; color: #854d0e;}
        .badge-archived {background: #fee2e2; color: #991b1b;}

        /* meta */
        .meta-panel {
            padding: .75rem 1rem; flex-shrink: 0;
            border-bottom: 1px solid var(--lumo-contrast-10pct, #e2e8f0);
            background: var(--lumo-contrast-5pct, #f8fafc);
        }
        .meta-grid {display: grid; grid-template-columns: 120px 1fr; gap: .4rem .75rem; align-items: start;}
        .meta-grid label {font-size: .8rem; color: #64748b; padding-top: .3rem;}

        /* workspace */
        .workspace {display: flex; flex: 1; overflow: hidden;}
        .canvas-wrap {flex: 1; overflow: auto; background: #f8fafc;}
        .canvas {display: block;}

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
        .prop-header span {flex: 1;}
        .del-btn, .close-btn {
            background: none; border: none; cursor: pointer;
            font-size: .95rem; padding: .1rem .3rem; border-radius: 4px; line-height: 1;
        }
        .del-btn:hover {background: #fee2e2;}
        .close-btn:hover {background: #f1f5f9;}
        .prop-body {flex: 1; overflow-y: auto; padding: .75rem; display: flex; flex-direction: column; gap: .6rem;}

        /* fields */
        .field {display: flex; flex-direction: column; gap: .2rem;}
        .field.row {flex-direction: row; align-items: center; gap: .5rem;}
        .field-label {font-size: .75rem; color: #64748b; font-weight: 500;}
        .inp {
            width: 100%; box-sizing: border-box;
            padding: .3rem .5rem; border: 1px solid #e2e8f0; border-radius: 6px;
            font-size: .82rem; color: #1e293b; background: #fff;
            outline: none; font-family: inherit; transition: border-color .15s;
        }
        .inp:focus {border-color: #3B82F6;}
        textarea.inp {resize: vertical;}
        input[readonly].inp {background: #f8fafc; color: #94a3b8;}
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-workflow-elk": MateuWorkflowElk;
    }
}
