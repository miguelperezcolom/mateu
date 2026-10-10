/**
 * Read-only diagram models for the native renderer (pure, unit-tested): a BPMN 2.0 XML document
 * (the `Bpmn` component) and a Mateu workflow definition (the `Workflow` component, a JSON
 * WorkflowDefinition) both become the same small scene — positioned boxes + polyline edges — that
 * DiagramRenderer paints with react-native-svg. No WebView and no bpmn-js: on a phone these are
 * things to LOOK at (the web renderers are where they are edited).
 */

export type NodeKind = 'start' | 'end' | 'event' | 'task' | 'gateway' | 'subprocess' | 'other';

export interface DiagramNode {
  id: string;
  kind: NodeKind;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
}

export interface DiagramEdge {
  id: string;
  points: { x: number; y: number }[];
}

export interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  width: number;
  height: number;
}

const EMPTY: Diagram = { nodes: [], edges: [], width: 0, height: 0 };

const attr = (tag: string, name: string): string | undefined => {
  const m = new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`).exec(tag) ?? new RegExp(`\\s${name}\\s*=\\s*'([^']*)'`).exec(tag);
  return m ? decodeXml(m[1]) : undefined;
};

const decodeXml = (s: string): string =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#10;|&#xA;/gi, ' ')
    .replace(/&amp;/g, '&');

export function bpmnKind(localName: string): NodeKind {
  const n = localName.toLowerCase();
  if (n === 'startevent') return 'start';
  if (n === 'endevent') return 'end';
  if (n.endsWith('event')) return 'event';
  if (n.endsWith('gateway')) return 'gateway';
  if (n === 'subprocess' || n === 'callactivity' || n === 'transaction') return 'subprocess';
  if (n.endsWith('task') || n === 'task') return 'task';
  return 'other';
}

/** BPMN XML → scene, from the diagram-interchange (bpmndi) section the modeller wrote. Elements
 *  without a shape (a model with no layout) are laid out in a single row as a fallback. */
export function parseBpmn(xml: string | null | undefined): Diagram {
  if (!xml || typeof xml !== 'string') return EMPTY;
  // flow elements: id → {kind, name}
  const elements = new Map<string, { kind: NodeKind; label: string }>();
  const elementRe = /<(?:[\w-]+:)?([A-Za-z]+)\b([^>]*?)\/?>/g;
  let m: RegExpExecArray | null;
  for (m = elementRe.exec(xml); m; m = elementRe.exec(xml)) {
    const local = m[1];
    const kind = bpmnKind(local);
    if (kind === 'other') continue;
    const id = attr(m[0], 'id');
    if (id) elements.set(id, { kind, label: attr(m[0], 'name') ?? '' });
  }

  const nodes: DiagramNode[] = [];
  const shapeRe = /<(?:[\w-]+:)?BPMNShape\b([^>]*)>([\s\S]*?)<\/(?:[\w-]+:)?BPMNShape>/g;
  for (m = shapeRe.exec(xml); m; m = shapeRe.exec(xml)) {
    const ref = attr(m[0], 'bpmnElement');
    const bounds = /<(?:[\w-]+:)?Bounds\b([^>]*)\/?>/.exec(m[2]);
    if (!ref || !bounds) continue;
    const el = elements.get(ref);
    nodes.push({
      id: ref,
      kind: el?.kind ?? 'other',
      label: el?.label ?? '',
      x: Number(attr(bounds[0], 'x') ?? 0),
      y: Number(attr(bounds[0], 'y') ?? 0),
      w: Number(attr(bounds[0], 'width') ?? 0),
      h: Number(attr(bounds[0], 'height') ?? 0),
    });
  }

  const edges: DiagramEdge[] = [];
  const edgeRe = /<(?:[\w-]+:)?BPMNEdge\b([^>]*)>([\s\S]*?)<\/(?:[\w-]+:)?BPMNEdge>/g;
  for (m = edgeRe.exec(xml); m; m = edgeRe.exec(xml)) {
    const points: { x: number; y: number }[] = [];
    const wpRe = /<(?:[\w-]+:)?waypoint\b([^>]*)\/?>/g;
    let w: RegExpExecArray | null;
    for (w = wpRe.exec(m[2]); w; w = wpRe.exec(m[2])) {
      points.push({ x: Number(attr(w[0], 'x') ?? 0), y: Number(attr(w[0], 'y') ?? 0) });
    }
    if (points.length >= 2) edges.push({ id: attr(m[0], 'bpmnElement') ?? `e${edges.length}`, points });
  }

  if (nodes.length === 0 && elements.size > 0) {
    // no diagram interchange: one row, in document order
    let x = 20;
    for (const [id, el] of elements) {
      const w = el.kind === 'task' || el.kind === 'subprocess' ? 120 : 40;
      nodes.push({ id, kind: el.kind, label: el.label, x, y: el.kind === 'task' || el.kind === 'subprocess' ? 20 : 40, w, h: w === 40 ? 40 : 80 });
      x += w + 40;
    }
  }
  return normalise(nodes, edges);
}

/** Shift the scene so it starts at a 20px margin and compute its size. */
function normalise(nodes: DiagramNode[], edges: DiagramEdge[]): Diagram {
  if (nodes.length === 0) return EMPTY;
  const xs = [...nodes.map((n) => n.x), ...edges.flatMap((e) => e.points.map((p) => p.x))];
  const ys = [...nodes.map((n) => n.y), ...edges.flatMap((e) => e.points.map((p) => p.y))];
  const dx = 20 - Math.min(...xs);
  const dy = 20 - Math.min(...ys);
  const moved = nodes.map((n) => ({ ...n, x: n.x + dx, y: n.y + dy }));
  const movedEdges = edges.map((e) => ({ ...e, points: e.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }));
  const width = Math.max(...moved.map((n) => n.x + n.w), ...movedEdges.flatMap((e) => e.points.map((p) => p.x))) + 20;
  const height = Math.max(...moved.map((n) => n.y + n.h), ...movedEdges.flatMap((e) => e.points.map((p) => p.y))) + 20;
  return { nodes: moved, edges: movedEdges, width, height };
}

// ── Workflow ──────────────────────────────────────────────────────────────────

interface WorkflowStep {
  id: string;
  type?: string;
  name?: string;
  preconditionStepId?: string;
}

export const WORKFLOW_COLORS: Record<string, string> = {
  ACTION: '#3B82F6',
  JOIN: '#8B5CF6',
  FORK: '#F59E0B',
  END: '#EF4444',
  USER_TASK: '#10B981',
  PROCESS: '#6366F1',
};

const NODE_W = 150;
const NODE_H = 52;
const H_GAP = 50;
const V_GAP = 60;

/** The workflow's name + scene: each step one level below its precondition step (steps without
 *  one start at the top), siblings side by side — the same layered layout the web editor uses,
 *  turned vertical so it scrolls naturally on a phone. */
export function workflowDiagram(value: string | null | undefined): { name: string; diagram: Diagram } {
  let def: { name?: string; steps?: WorkflowStep[] } = {};
  try {
    def = value ? JSON.parse(value) : {};
  } catch {
    return { name: '', diagram: EMPTY };
  }
  const steps = (def.steps ?? []).filter((s) => s && typeof s.id === 'string');
  const byId = new Map(steps.map((s) => [s.id, s]));
  const level = new Map<string, number>();
  const levelOf = (s: WorkflowStep, seen = new Set<string>()): number => {
    if (level.has(s.id)) return level.get(s.id)!;
    const parent = s.preconditionStepId ? byId.get(s.preconditionStepId) : undefined;
    const l = parent && !seen.has(parent.id) ? levelOf(parent, new Set([...seen, s.id])) + 1 : 0;
    level.set(s.id, l);
    return l;
  };
  steps.forEach((s) => levelOf(s));
  const rows = new Map<number, WorkflowStep[]>();
  for (const s of steps) rows.set(level.get(s.id)!, [...(rows.get(level.get(s.id)!) ?? []), s]);
  const widest = Math.max(1, ...[...rows.values()].map((r) => r.length));
  const totalW = widest * NODE_W + (widest - 1) * H_GAP;
  const nodes: DiagramNode[] = [];
  for (const [l, row] of rows) {
    const rowW = row.length * NODE_W + (row.length - 1) * H_GAP;
    row.forEach((s, i) => {
      nodes.push({
        id: s.id,
        kind: s.type === 'END' ? 'end' : s.type === 'FORK' || s.type === 'JOIN' ? 'gateway' : 'task',
        label: s.name || s.id,
        x: (totalW - rowW) / 2 + i * (NODE_W + H_GAP),
        y: l * (NODE_H + V_GAP),
        w: NODE_W,
        h: NODE_H,
        color: WORKFLOW_COLORS[s.type ?? ''] ?? '#64748B',
      });
    });
  }
  const at = new Map(nodes.map((n) => [n.id, n]));
  const edges: DiagramEdge[] = [];
  for (const s of steps) {
    const from = s.preconditionStepId ? at.get(s.preconditionStepId) : undefined;
    const to = at.get(s.id);
    if (!from || !to) continue;
    edges.push({
      id: `${from.id}->${to.id}`,
      points: [
        { x: from.x + from.w / 2, y: from.y + from.h },
        { x: to.x + to.w / 2, y: to.y },
      ],
    });
  }
  return { name: def.name ?? '', diagram: normalise(nodes, edges) };
}
