/**
 * The pure half of the two definition editors (wire `Workflow` and `FormEditor`) on React Native:
 * the same definition the web's mateu-workflow / mateu-form-editor edit, the same operations (add,
 * change, delete a step; add, duplicate, move, change, delete a field) and the same JSON coming out
 * — `JSON.stringify(definition, null, 2)`, which the editor puts into the component state under the
 * component's id, as the web's `value-changed` does. No React here: it runs under `node --test`.
 */

type Dict = Record<string, unknown>;

// ── Workflow ──────────────────────────────────────────────────────────────────────────────────────

export const STEP_TYPES = ['ACTION', 'JOIN', 'FORK', 'END', 'USER_TASK', 'PROCESS'] as const;
export const WORKFLOW_STATUSES = ['DRAFT', 'ACTIVE', 'DISABLED', 'ARCHIVED'] as const;

export interface WorkflowStep {
  id: string;
  type: string;
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
  [other: string]: unknown;
}

export interface WorkflowDefinition {
  id?: string;
  name: string;
  version?: number;
  description?: string;
  status?: string;
  limitConcurrentExecutions?: boolean;
  maxConcurrentExecutions?: number;
  enqueueOnLimit?: boolean;
  steps: WorkflowStep[];
  [other: string]: unknown;
}

const EMPTY_WORKFLOW = '{"name":"New Workflow","steps":[]}';

/** The definition in `value` (the web's default when absent; unknown keys kept as they are). */
export function parseWorkflow(value: string | null | undefined): WorkflowDefinition {
  try {
    const d = JSON.parse(value || EMPTY_WORKFLOW) as Dict;
    if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('not an object');
    const steps = Array.isArray(d['steps']) ? (d['steps'] as Dict[]).filter((s) => s && typeof s === 'object') : [];
    return {
      ...d,
      name: typeof d['name'] === 'string' ? d['name'] : 'New Workflow',
      steps: steps.map((s) => ({ ...s, id: String(s['id'] ?? ''), type: String(s['type'] ?? 'ACTION'), name: String(s['name'] ?? '') })),
    } as WorkflowDefinition;
  } catch {
    return { name: 'New Workflow', steps: [] };
  }
}

/** What the editor reports: the web's own serialization. */
export function serializeDefinition(definition: unknown): string {
  return JSON.stringify(definition, null, 2);
}

/** A fresh id with the prefix (`step-x1y2z3`), never one already taken. */
export function newDefinitionId(prefix: string, taken: string[], random: () => number = Math.random): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    const id = `${prefix}-${random().toString(36).slice(2, 8)}`;
    if (id.length > prefix.length + 1 && !taken.includes(id)) return id;
  }
  let n = taken.length + 1;
  while (taken.includes(`${prefix}-${n}`)) n++;
  return `${prefix}-${n}`;
}

/** Drops the keys whose value is undefined (an emptied optional disappears, like on the web). */
function compact<T extends Dict>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

export function updateWorkflow(wf: WorkflowDefinition, patch: Partial<WorkflowDefinition>): WorkflowDefinition {
  return compact({ ...wf, ...patch });
}

/** Adds an ACTION step named "New Step" at the end; returns the definition and the new step's id. */
export function addStep(wf: WorkflowDefinition, random?: () => number): { wf: WorkflowDefinition; id: string } {
  const id = newDefinitionId('step', wf.steps.map((s) => s.id), random);
  return { wf: { ...wf, steps: [...wf.steps, { id, type: 'ACTION', name: 'New Step' }] }, id };
}

export function updateStep(wf: WorkflowDefinition, id: string, patch: Partial<WorkflowStep>): WorkflowDefinition {
  return { ...wf, steps: wf.steps.map((s) => (s.id === id ? compact({ ...s, ...patch }) : s)) };
}

/** Removes a step; the steps that pointed at it (precondition or compensation) stop pointing. */
export function deleteStep(wf: WorkflowDefinition, id: string): WorkflowDefinition {
  return {
    ...wf,
    steps: wf.steps
      .filter((s) => s.id !== id)
      .map((s) => compact({
        ...s,
        preconditionStepId: s.preconditionStepId === id ? undefined : s.preconditionStepId,
        compensationStepId: s.compensationStepId === id ? undefined : s.compensationStepId,
      })),
  };
}

/** The type-specific property a step shows (ACTION → topic, USER_TASK → formId, PROCESS → child). */
export function typeSpecificProperty(type: string): { key: 'topic' | 'formId' | 'childWorkflowDefinitionId'; label: string } | undefined {
  if (type === 'ACTION') return { key: 'topic', label: 'Topic' };
  if (type === 'USER_TASK') return { key: 'formId', label: 'Form ID' };
  if (type === 'PROCESS') return { key: 'childWorkflowDefinitionId', label: 'Child workflow ID' };
  return undefined;
}

/** A non-negative whole number typed in a numeric box (blank / junk → 0, the web's Number()). */
export function wholeNumber(text: string): number {
  const n = Number(text.trim());
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** The step a step's row names as its precondition ("after Validate"), for the list. */
export function stepCaption(wf: WorkflowDefinition, step: WorkflowStep): string {
  const parts = [step.type];
  const pre = step.preconditionStepId ? wf.steps.find((s) => s.id === step.preconditionStepId) : undefined;
  if (pre) parts.push(`after ${pre.name || pre.id}`);
  if (step.parallel) parts.push('parallel');
  return parts.join(' · ');
}

// ── FormEditor ────────────────────────────────────────────────────────────────────────────────────

export const DATA_TYPES = [
  'string', 'integer', 'number', 'bool', 'date', 'time', 'dateTime',
  'dateRange', 'money', 'file', 'array', 'status', 'component',
  'menu', 'range', 'action', 'actionGroup',
] as const;

export const STEREOTYPES = [
  'regular', 'radio', 'checkbox', 'textarea', 'toggle', 'combobox',
  'select', 'email', 'password', 'richText', 'listBox', 'html',
  'markdown', 'image', 'icon', 'link', 'money', 'grid', 'color',
  'choice', 'popover', 'slider', 'button', 'stars',
] as const;

export interface FormDefinitionField {
  id: string;
  label: string;
  dataType: string;
  stereotype?: string;
  required?: boolean;
  description?: string;
  [other: string]: unknown;
}

export interface FormDefinition {
  id?: string;
  name: string;
  description?: string;
  fields: FormDefinitionField[];
  [other: string]: unknown;
}

const EMPTY_FORM = '{"name":"New Form","fields":[]}';

export function parseFormEditorValue(value: string | null | undefined): FormDefinition {
  try {
    const d = JSON.parse(value || EMPTY_FORM) as Dict;
    if (!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('not an object');
    const fields = Array.isArray(d['fields']) ? (d['fields'] as Dict[]).filter((f) => f && typeof f === 'object') : [];
    return {
      ...d,
      name: typeof d['name'] === 'string' ? d['name'] : 'New Form',
      fields: fields.map((f) => ({ ...f, id: String(f['id'] ?? ''), label: String(f['label'] ?? f['id'] ?? ''), dataType: String(f['dataType'] ?? 'string') })),
    } as FormDefinition;
  } catch {
    return { name: 'New Form', fields: [] };
  }
}

export function updateForm(form: FormDefinition, patch: Partial<FormDefinition>): FormDefinition {
  return compact({ ...form, ...patch });
}

/** Adds a string field labelled "New Field" at the end; returns the form and the new field's id. */
export function addField(form: FormDefinition, random?: () => number): { form: FormDefinition; id: string } {
  const id = newDefinitionId('field', form.fields.map((f) => f.id), random);
  return { form: { ...form, fields: [...form.fields, { id, label: 'New Field', dataType: 'string' }] }, id };
}

export function updateField(form: FormDefinition, id: string, patch: Partial<FormDefinitionField>): FormDefinition {
  return { ...form, fields: form.fields.map((f) => (f.id === id ? compact({ ...f, ...patch }) : f)) };
}

export function deleteField(form: FormDefinition, id: string): FormDefinition {
  return { ...form, fields: form.fields.filter((f) => f.id !== id) };
}

/** A copy of the field right after it, labelled "<label> (copy)", with a fresh id. */
export function duplicateField(form: FormDefinition, id: string, random?: () => number): { form: FormDefinition; id?: string } {
  const index = form.fields.findIndex((f) => f.id === id);
  if (index < 0) return { form };
  const copyId = newDefinitionId('field', form.fields.map((f) => f.id), random);
  const fields = [...form.fields];
  fields.splice(index + 1, 0, { ...form.fields[index]!, id: copyId, label: `${form.fields[index]!.label} (copy)` });
  return { form: { ...form, fields }, id: copyId };
}

/** Moves a field one place up (-1) or down (+1); the touch twin of the web's drag handle. */
export function moveField(form: FormDefinition, id: string, delta: -1 | 1): FormDefinition {
  const from = form.fields.findIndex((f) => f.id === id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= form.fields.length) return form;
  const fields = [...form.fields];
  const [moved] = fields.splice(from, 1);
  fields.splice(to, 0, moved!);
  return { ...form, fields };
}

/** The stereotype picked (an empty one is absent), stored as the web's select stores it. */
export function stereotypePatch(stereotype: string): Partial<FormDefinitionField> {
  return { stereotype: stereotype || undefined };
}
