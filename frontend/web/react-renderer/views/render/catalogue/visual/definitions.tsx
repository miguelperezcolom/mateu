import React, { useEffect, useMemo, useState } from 'react'
import { Button, Checkbox, Dialog, FormControl, IconButton, Label, Select, Text, TextInput, Textarea } from '@kit'
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon, DuplicateIcon, GearIcon, PlusIcon, TrashIcon } from '@kit/icons'
import { workflowDiagram } from '@rn/renderer/diagrams'
import {
  DATA_TYPES, STEP_TYPES, STEREOTYPES, WORKFLOW_STATUSES, addField, addStep, deleteField, deleteStep, duplicateField,
  moveField, parseFormEditorValue, parseWorkflow, serializeDefinition, stepCaption, stereotypePatch, typeSpecificProperty,
  updateField, updateForm, updateStep, updateWorkflow, wholeNumber,
  type FormDefinition, type FormDefinitionField, type WorkflowDefinition, type WorkflowStep,
} from '@rn/renderer/definitionModel'
import { useController } from '@mr/render/ViewHost'
import { BOX_STYLE, styleOf } from '@mr/render/styleOf'
import type { CatalogueProps } from '../types'
import { DiagramView } from './widgets'

type Dict = Record<string, unknown>

/**
 * The two definition editors (wire `Workflow` and `FormEditor`), the web's mateu-workflow and
 * mateu-form-editor in Primer: the same definition, the same operations (the React Native renderer's
 * pure definitionModel) and the same JSON reported — `JSON.stringify(definition, null, 2)` into the
 * component state under the component's id, as the web's `value-changed` does, so the screen's own
 * save action sends it. Properties open in a Primer Dialog; fields reorder with up / down buttons
 * (keyboard and screen-reader usable, where the web has a drag handle); Export downloads the JSON.
 */
function useDefinition<T>(component: Dict, metadata: Dict, parse: (v: string | undefined) => T) {
  const controller = useController()
  const value = typeof metadata['value'] === 'string' ? metadata['value'] : undefined
  const [definition, setDefinition] = useState<T>(() => parse(value))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setDefinition(parse(value)), [value])
  const id = String(component['id'] ?? 'fieldId')
  const change = (next: T) => {
    setDefinition(next)
    controller.putState(id, serializeDefinition(next))
  }
  return { definition, change }
}

function exportJson(name: string, definition: unknown) {
  const blob = new Blob([serializeDefinition(definition)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(name || 'definition').replace(/[^\w.-]+/g, '_')}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function Header({ name, badge, onSettings, settingsOpen, addLabel, onAdd, onExport }: {
  name: string; badge?: string; onSettings: () => void; settingsOpen: boolean; addLabel: string; onAdd: () => void; onExport: () => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--base-size-8)' }}>
      <Text weight="semibold" style={{ flex: '1 1 auto' }}>{name}</Text>
      {badge && <Label variant={badge === 'ACTIVE' ? 'success' : badge === 'DRAFT' ? 'accent' : 'secondary'}>{badge}</Label>}
      <Button size="small" leadingVisual={GearIcon} aria-expanded={settingsOpen} onClick={onSettings}>Settings</Button>
      <Button size="small" variant="primary" leadingVisual={PlusIcon} onClick={onAdd}>{addLabel}</Button>
      <Button size="small" leadingVisual={DownloadIcon} onClick={onExport}>Export</Button>
    </div>
  )
}

function TextProp({ label, value, onChange, multiline, disabled, placeholder, numeric }: {
  label: string; value: string; onChange?: (v: string) => void; multiline?: boolean; disabled?: boolean; placeholder?: string; numeric?: boolean
}) {
  return (
    <FormControl disabled={disabled}>
      <FormControl.Label>{label}</FormControl.Label>
      {multiline
        ? <Textarea block value={value} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)} />
        : <TextInput block value={value} placeholder={placeholder} type={numeric ? 'number' : 'text'} min={numeric ? 0 : undefined} onChange={(e) => onChange?.(e.target.value)} />}
    </FormControl>
  )
}

function ChoiceProp({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <FormControl>
      <FormControl.Label>{label}</FormControl.Label>
      <Select block value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
      </Select>
    </FormControl>
  )
}

function CheckProp({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <FormControl>
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <FormControl.Label>{label}</FormControl.Label>
    </FormControl>
  )
}

/** A list row that opens its properties: a two-line target, as tall as its text. */
function RowButton({ title, caption, label, onClick }: { title: string; caption: string; label: string; onClick: () => void }) {
  return (
    <button type="button" className="mv-def-row" aria-label={label} onClick={onClick}>
      <span className="mv-def-row-title">{title}</span>
      {caption && <span className="mv-def-row-caption">{caption}</span>}
    </button>
  )
}

const asOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }))
const grid: React.CSSProperties = { display: 'grid', gap: 'var(--base-size-12)' }

// ── Workflow ──────────────────────────────────────────────────────────────────────────────────────

export function Workflow({ component, metadata }: CatalogueProps) {
  const { definition: wf, change } = useDefinition<WorkflowDefinition>(component, metadata, parseWorkflow)
  const [settings, setSettings] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const diagram = useMemo(() => workflowDiagram(serializeDefinition(wf)).diagram, [wf])
  const selected = wf.steps.find((s) => s.id === selectedId)
  const set = (patch: Partial<WorkflowDefinition>) => change(updateWorkflow(wf, patch))
  return (
    <div className="mv-box" style={{ ...grid, padding: 'var(--base-size-12)', ...styleOf(component, BOX_STYLE) }}>
      <Header name={wf.name} badge={wf.status ?? 'DRAFT'} settingsOpen={settings} onSettings={() => setSettings(!settings)}
        addLabel="Add step" onAdd={() => { const r = addStep(wf); change(r.wf); setSelectedId(r.id) }} onExport={() => exportJson(wf.name, wf)} />
      {settings && (
        <div style={grid}>
          <TextProp label="Name" value={wf.name} onChange={(t) => set({ name: t })} />
          <TextProp label="Description" multiline value={wf.description ?? ''} onChange={(t) => set({ description: t })} />
          <ChoiceProp label="Status" value={wf.status ?? 'DRAFT'} options={asOptions(WORKFLOW_STATUSES)} onChange={(v) => set({ status: v })} />
          <CheckProp label="Limit concurrent executions" checked={!!wf.limitConcurrentExecutions} onChange={(v) => set({ limitConcurrentExecutions: v })} />
          {!!wf.limitConcurrentExecutions && (
            <>
              <TextProp label="Max concurrent" numeric value={String(wf.maxConcurrentExecutions ?? 0)} onChange={(t) => set({ maxConcurrentExecutions: wholeNumber(t) })} />
              <CheckProp label="Enqueue on limit" checked={!!wf.enqueueOnLimit} onChange={(v) => set({ enqueueOnLimit: v })} />
            </>
          )}
        </div>
      )}
      {wf.steps.length > 0
        ? <DiagramView diagram={diagram} label={`Workflow ${wf.name}`} onPressNode={setSelectedId} />
        : <Text className="mv-muted">No steps yet. Press Add step to start.</Text>}
      {wf.steps.length > 0 && (
        <ul className="mv-box" style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Steps">
          {wf.steps.map((s, i) => (
            <li key={s.id} style={{ borderTop: i ? 'var(--borderWidth-thin) solid var(--borderColor-muted)' : undefined }}>
              <RowButton title={s.name || s.id} caption={stepCaption(wf, s)} label={`${s.name || s.id}, ${stepCaption(wf, s)}. Edit the step`} onClick={() => setSelectedId(s.id)} />
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <StepDialog wf={wf} step={selected} onClose={() => setSelectedId(null)}
          onChange={(patch) => change(updateStep(wf, selected.id, patch))}
          onDelete={() => { change(deleteStep(wf, selected.id)); setSelectedId(null) }} />
      )}
    </div>
  )
}

function StepDialog({ wf, step, onChange, onDelete, onClose }: {
  wf: WorkflowDefinition; step: WorkflowStep; onChange: (patch: Partial<WorkflowStep>) => void; onDelete: () => void; onClose: () => void
}) {
  const others = [{ value: '', label: '— none —' }, ...wf.steps.filter((s) => s.id !== step.id).map((s) => ({ value: s.id, label: `${s.name} (${s.id})` }))]
  const specific = typeSpecificProperty(step.type)
  return (
    <Dialog title="Step properties" onClose={onClose} width="large"
      footerButtons={[
        { content: 'Delete step', buttonType: 'danger', onClick: onDelete },
        { content: 'Done', buttonType: 'primary', onClick: onClose },
      ]}>
      <div style={grid}>
        <TextProp label="ID" value={step.id} disabled />
        <TextProp label="Name" value={step.name} onChange={(t) => onChange({ name: t })} />
        <ChoiceProp label="Type" value={step.type} options={asOptions(STEP_TYPES)} onChange={(v) => onChange({ type: v })} />
        <TextProp label="Description" multiline value={step.description ?? ''} onChange={(t) => onChange({ description: t })} />
        <ChoiceProp label="Precondition step" value={step.preconditionStepId ?? ''} options={others} onChange={(v) => onChange({ preconditionStepId: v || undefined })} />
        <TextProp label="Precondition expression" placeholder="JEXL expression" value={step.preconditionExpression ?? ''} onChange={(t) => onChange({ preconditionExpression: t || undefined })} />
        <CheckProp label="Parallel" checked={!!step.parallel} onChange={(v) => onChange({ parallel: v })} />
        <TextProp label="Timeout (ms)" numeric value={String(step.timeout ?? 0)} onChange={(t) => onChange({ timeout: wholeNumber(t) })} />
        <TextProp label="Retries" numeric value={String(step.retries ?? 0)} onChange={(t) => onChange({ retries: wholeNumber(t) })} />
        <CheckProp label="Rollbackable" checked={!!step.rollbackable} onChange={(v) => onChange({ rollbackable: v })} />
        {!!step.rollbackable && (
          <ChoiceProp label="Compensation step" value={step.compensationStepId ?? ''} options={others} onChange={(v) => onChange({ compensationStepId: v || undefined })} />
        )}
        {specific && (
          <TextProp label={specific.label} placeholder={specific.key === 'topic' ? 'kafka.topic.name' : undefined}
            value={String(step[specific.key] ?? '')} onChange={(t) => onChange({ [specific.key]: t || undefined })} />
        )}
      </div>
    </Dialog>
  )
}

// ── FormEditor ────────────────────────────────────────────────────────────────────────────────────

export function FormEditor({ component, metadata }: CatalogueProps) {
  const { definition: form, change } = useDefinition<FormDefinition>(component, metadata, parseFormEditorValue)
  const [settings, setSettings] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = form.fields.find((f) => f.id === selectedId)
  return (
    <div className="mv-box" style={{ ...grid, padding: 'var(--base-size-12)', ...styleOf(component, BOX_STYLE) }}>
      <Header name={form.name} settingsOpen={settings} onSettings={() => setSettings(!settings)}
        addLabel="Add field" onAdd={() => { const r = addField(form); change(r.form); setSelectedId(r.id) }} onExport={() => exportJson(form.name, form)} />
      {settings && (
        <div style={grid}>
          <TextProp label="Name" value={form.name} onChange={(t) => change(updateForm(form, { name: t }))} />
          <TextProp label="Description" multiline value={form.description ?? ''} onChange={(t) => change(updateForm(form, { description: t }))} />
        </div>
      )}
      {form.fields.length === 0 && <Text className="mv-muted">No fields yet. Press Add field to start.</Text>}
      {form.fields.length > 0 && (
        <ul className="mv-box" style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Fields">
          {form.fields.map((f, i) => (
            <FieldRow key={f.id} field={f} first={i === 0} last={i === form.fields.length - 1} divider={i > 0}
              onEdit={() => setSelectedId(f.id)}
              onMove={(d) => change(moveField(form, f.id, d))}
              onDuplicate={() => change(duplicateField(form, f.id).form)}
              onDelete={() => change(deleteField(form, f.id))} />
          ))}
        </ul>
      )}
      {selected && (
        <Dialog title="Field properties" onClose={() => setSelectedId(null)} width="large" footerButtons={[{ content: 'Done', buttonType: 'primary', onClick: () => setSelectedId(null) }]}>
          <FieldProps field={selected} onChange={(patch) => change(updateField(form, selected.id, patch))} />
        </Dialog>
      )}
    </div>
  )
}

function FieldRow({ field: f, first, last, divider, onEdit, onMove, onDuplicate, onDelete }: {
  field: FormDefinitionField; first: boolean; last: boolean; divider: boolean
  onEdit: () => void; onMove: (d: -1 | 1) => void; onDuplicate: () => void; onDelete: () => void
}) {
  const caption = [f.id, f.stereotype && f.stereotype !== 'regular' ? f.stereotype : ''].filter(Boolean).join(' · ')
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--base-size-4)', padding: 'var(--base-size-4) var(--base-size-8)', borderTop: divider ? 'var(--borderWidth-thin) solid var(--borderColor-muted)' : undefined }}>
      <Label variant="accent">{f.dataType}</Label>
      <RowButton title={`${f.label}${f.required ? ' *' : ''}`} caption={caption} label={`${f.label}, ${f.dataType}${f.required ? ', required' : ''}. Edit the field`} onClick={onEdit} />
      <IconButton icon={ArrowUpIcon} size="small" variant="invisible" disabled={first} aria-label={`Move ${f.label} up`} onClick={() => onMove(-1)} />
      <IconButton icon={ArrowDownIcon} size="small" variant="invisible" disabled={last} aria-label={`Move ${f.label} down`} onClick={() => onMove(1)} />
      <IconButton icon={DuplicateIcon} size="small" variant="invisible" aria-label={`Duplicate ${f.label}`} onClick={onDuplicate} />
      <IconButton icon={TrashIcon} size="small" variant="invisible" aria-label={`Delete ${f.label}`} onClick={onDelete} />
    </li>
  )
}

function FieldProps({ field, onChange }: { field: FormDefinitionField; onChange: (patch: Partial<FormDefinitionField>) => void }) {
  return (
    <div style={grid}>
      <TextProp label="ID" value={field.id} disabled />
      <TextProp label="Label" value={field.label} onChange={(t) => onChange({ label: t })} />
      <ChoiceProp label="Data type" value={field.dataType} options={asOptions(DATA_TYPES)} onChange={(v) => onChange({ dataType: v })} />
      <ChoiceProp label="Stereotype" value={field.stereotype ?? 'regular'} options={asOptions(STEREOTYPES)} onChange={(v) => onChange(stereotypePatch(v))} />
      <CheckProp label="Required" checked={!!field.required} onChange={(v) => onChange({ required: v })} />
      <TextProp label="Description / hint" multiline value={field.description ?? ''} onChange={(t) => onChange({ description: t || undefined })} />
    </div>
  )
}
