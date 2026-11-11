/**
 * The two definition editors on a phone or tablet (wire `Workflow` and `FormEditor`), the touch twins
 * of the web's mateu-workflow and mateu-form-editor: the same definition, the same operations and the
 * same JSON reported — into the component state under the component's id, as the web's
 * `value-changed`. What changes is the idiom: the step / field properties open in a dialog instead of
 * a side panel, the fields reorder with up/down buttons instead of a drag handle (which a screen
 * reader could not use either), the workflow's nodes are laid out automatically (positions are not
 * part of the definition on the web either) and "Export" shares the JSON instead of downloading it.
 * The rules are pure: definitionModel.ts.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { Dialog, IconButton, Portal, RadioButton } from 'react-native-paper';
import { buttonA11y, headingA11y } from '../a11y/a11y';
import { theme, themed } from '../theme';
import { MateuButton, OutlinedInput, OutlinedTrigger, SelectBox, StatusChip } from '../ui/controls';
import { Text } from '../ui/Text';
import { TouchableOpacity } from '../ui/Touchable';
import { useViewController } from './MateuViewHost';
import { DiagramView } from './WireComponents';
import { WORKFLOW_COLORS, workflowDiagram } from './diagrams';
import {
  DATA_TYPES, STEP_TYPES, STEREOTYPES, WORKFLOW_STATUSES, addField, addStep, deleteField, deleteStep, duplicateField,
  moveField, parseFormEditorValue, parseWorkflow, serializeDefinition, stepCaption, stereotypePatch, typeSpecificProperty,
  updateField, updateForm, updateStep, updateWorkflow, wholeNumber,
  type FormDefinition, type WorkflowDefinition,
} from './definitionModel';

type Dict = Record<string, unknown>;

/** The definition being edited: seeded from the wire, re-seeded when the server sends another one,
 *  and every change reported into the state under the component's id. */
function useDefinition<T>(component: Dict, valueKey: string, parse: (v: string | undefined) => T) {
  const controller = useViewController();
  const metadata = (component['metadata'] as Dict) ?? {};
  const value = typeof metadata[valueKey] === 'string' ? (metadata[valueKey] as string) : undefined;
  const [definition, setDefinition] = useState<T>(() => parse(value));
  useEffect(() => setDefinition(parse(value)), [value]);
  const id = String(component['id'] ?? 'fieldId');
  const change = (next: T) => {
    setDefinition(next);
    controller.putState(id, serializeDefinition(next));
  };
  return { definition, change };
}

async function exportJson(name: string, definition: unknown) {
  try {
    await Share.share({ title: name, message: serializeDefinition(definition) });
  } catch {
    // nothing to share with (a desktop browser without the Web Share API): the JSON stays in the state
  }
}

/** A select over a short list: an outlined trigger opening a dialog of radio rows. */
function ChoiceField({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const shown = options.find((o) => o.value === value)?.label ?? value;
  return (
    <>
      <OutlinedTrigger label={label} value={shown} onPress={() => setOpen(true)} expanded={open} />
      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)} style={styles.choiceDialog}>
          <Dialog.Title>{label}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <RadioButton.Group value={value} onValueChange={(v) => { onChange(v); setOpen(false); }}>
                {options.map((o) => (
                  <RadioButton.Item key={o.value} value={o.value} label={o.label} mode="android" color={theme.primary} />
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>
    </>
  );
}

function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <View style={styles.checkRow}>
      <SelectBox checked={checked} label={label} onToggle={onToggle} />
      <Text style={styles.checkLabel} onPress={onToggle}>{label}</Text>
    </View>
  );
}

const asOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

function Toolbar({ name, badge, settingsOpen, onSettings, addLabel, onAdd, onExport }: {
  name: string;
  badge?: string;
  settingsOpen: boolean;
  onSettings: () => void;
  addLabel: string;
  onAdd: () => void;
  onExport: () => void;
}) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.titleRow}>
        <Text style={styles.name} numberOfLines={1} {...headingA11y()}>{name}</Text>
        {!!badge && <StatusChip label={badge} tone={badge === 'ACTIVE' ? 'success' : badge === 'DRAFT' ? 'info' : 'neutral'} />}
      </View>
      <View style={styles.buttons}>
        <MateuButton label="Settings" icon="cog-outline" compact onPress={onSettings} accessibilityHint={settingsOpen ? 'Hides the settings' : 'Shows the settings'} />
        <MateuButton label={addLabel} icon="plus" buttonStyle="primary" compact onPress={onAdd} />
        <MateuButton label="Export" icon="share-variant-outline" compact onPress={onExport} />
      </View>
    </View>
  );
}

// ── Workflow ──────────────────────────────────────────────────────────────────────────────────────

export function WorkflowEditorRenderer({ component }: { component: Dict }) {
  const { definition: wf, change } = useDefinition<WorkflowDefinition>(component, 'value', parseWorkflow);
  const [settings, setSettings] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const diagram = useMemo(() => workflowDiagram(serializeDefinition(wf)).diagram, [wf]);
  const selected = wf.steps.find((s) => s.id === selectedId);
  const otherSteps = wf.steps.filter((s) => s.id !== selectedId).map((s) => ({ value: s.id, label: `${s.name} (${s.id})` }));
  const none = { value: '', label: '— none —' };

  return (
    <View style={styles.card}>
      <Toolbar name={wf.name} badge={wf.status ?? 'DRAFT'} settingsOpen={settings} onSettings={() => setSettings(!settings)}
        addLabel="Add step" onAdd={() => { const r = addStep(wf); change(r.wf); setSelectedId(r.id); }}
        onExport={() => void exportJson(wf.name, wf)} />
      {settings && (
        <View style={styles.panel}>
          <OutlinedInput label="Name" value={wf.name} onChangeText={(t) => change(updateWorkflow(wf, { name: t }))} />
          <OutlinedInput label="Description" multiline value={wf.description ?? ''} onChangeText={(t) => change(updateWorkflow(wf, { description: t }))} />
          <ChoiceField label="Status" value={wf.status ?? 'DRAFT'} options={asOptions(WORKFLOW_STATUSES)} onChange={(v) => change(updateWorkflow(wf, { status: v }))} />
          <CheckRow label="Limit concurrent executions" checked={!!wf.limitConcurrentExecutions}
            onToggle={() => change(updateWorkflow(wf, { limitConcurrentExecutions: !wf.limitConcurrentExecutions }))} />
          {!!wf.limitConcurrentExecutions && (
            <>
              <OutlinedInput label="Max concurrent" keyboardType="number-pad" value={String(wf.maxConcurrentExecutions ?? 0)}
                onChangeText={(t) => change(updateWorkflow(wf, { maxConcurrentExecutions: wholeNumber(t) }))} />
              <CheckRow label="Enqueue on limit" checked={!!wf.enqueueOnLimit} onToggle={() => change(updateWorkflow(wf, { enqueueOnLimit: !wf.enqueueOnLimit }))} />
            </>
          )}
        </View>
      )}
      {wf.steps.length > 0 && <DiagramView diagram={diagram} label={`Workflow ${wf.name}`} onPressNode={setSelectedId} />}
      {wf.steps.length === 0 && <Text style={styles.empty}>No steps yet. Press Add step to start.</Text>}
      {wf.steps.map((s) => (
        <TouchableOpacity key={s.id} {...buttonA11y({ label: `${s.name || s.id}, ${stepCaption(wf, s)}`, hint: 'Edits the step' })}
          style={styles.row} onPress={() => setSelectedId(s.id)}>
          <View style={[styles.swatch, { backgroundColor: WORKFLOW_COLORS[s.type] ?? theme.muted }]} />
          <View style={styles.flex1}>
            <Text style={styles.rowTitle} numberOfLines={1}>{s.name || s.id}</Text>
            <Text style={styles.rowCaption} numberOfLines={1}>{stepCaption(wf, s)}</Text>
          </View>
        </TouchableOpacity>
      ))}
      <Portal>
        <Dialog visible={!!selected} onDismiss={() => setSelectedId(null)} style={styles.editDialog}>
          <Dialog.Title>Step properties</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.panelBody}>
              {selected && (() => {
                const set = (patch: Partial<typeof selected>) => change(updateStep(wf, selected.id, patch));
                const specific = typeSpecificProperty(selected.type);
                return (
                  <>
                    <OutlinedInput label="ID" value={selected.id} editable={false} />
                    <OutlinedInput label="Name" value={selected.name} onChangeText={(t) => set({ name: t })} />
                    <ChoiceField label="Type" value={selected.type} options={asOptions(STEP_TYPES)} onChange={(v) => set({ type: v })} />
                    <OutlinedInput label="Description" multiline value={selected.description ?? ''} onChangeText={(t) => set({ description: t })} />
                    <ChoiceField label="Precondition step" value={selected.preconditionStepId ?? ''} options={[none, ...otherSteps]}
                      onChange={(v) => set({ preconditionStepId: v || undefined })} />
                    <OutlinedInput label="Precondition expression" placeholder="JEXL expression" value={selected.preconditionExpression ?? ''}
                      onChangeText={(t) => set({ preconditionExpression: t || undefined })} />
                    <CheckRow label="Parallel" checked={!!selected.parallel} onToggle={() => set({ parallel: !selected.parallel })} />
                    <OutlinedInput label="Timeout (ms)" keyboardType="number-pad" value={String(selected.timeout ?? 0)} onChangeText={(t) => set({ timeout: wholeNumber(t) })} />
                    <OutlinedInput label="Retries" keyboardType="number-pad" value={String(selected.retries ?? 0)} onChangeText={(t) => set({ retries: wholeNumber(t) })} />
                    <CheckRow label="Rollbackable" checked={!!selected.rollbackable} onToggle={() => set({ rollbackable: !selected.rollbackable })} />
                    {!!selected.rollbackable && (
                      <ChoiceField label="Compensation step" value={selected.compensationStepId ?? ''} options={[none, ...otherSteps]}
                        onChange={(v) => set({ compensationStepId: v || undefined })} />
                    )}
                    {specific && (
                      <OutlinedInput label={specific.label} placeholder={specific.key === 'topic' ? 'kafka.topic.name' : undefined}
                        value={String(selected[specific.key] ?? '')} onChangeText={(t) => set({ [specific.key]: t || undefined })} />
                    )}
                  </>
                );
              })()}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <MateuButton label="Delete step" icon="delete-outline" color="error"
              onPress={() => { if (selected) change(deleteStep(wf, selected.id)); setSelectedId(null); }} />
            <MateuButton label="Done" buttonStyle="primary" onPress={() => setSelectedId(null)} />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

// ── FormEditor ────────────────────────────────────────────────────────────────────────────────────

export function FormEditorRenderer({ component }: { component: Dict }) {
  const { definition: form, change } = useDefinition<FormDefinition>(component, 'value', parseFormEditorValue);
  const [settings, setSettings] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = form.fields.find((f) => f.id === selectedId);

  return (
    <View style={styles.card}>
      <Toolbar name={form.name} settingsOpen={settings} onSettings={() => setSettings(!settings)}
        addLabel="Add field" onAdd={() => { const r = addField(form); change(r.form); setSelectedId(r.id); }}
        onExport={() => void exportJson(form.name, form)} />
      {settings && (
        <View style={styles.panel}>
          <OutlinedInput label="Name" value={form.name} onChangeText={(t) => change(updateForm(form, { name: t }))} />
          <OutlinedInput label="Description" multiline value={form.description ?? ''} onChangeText={(t) => change(updateForm(form, { description: t }))} />
        </View>
      )}
      {form.fields.length === 0 && <Text style={styles.empty}>No fields yet. Press Add field to start.</Text>}
      {form.fields.map((f, i) => (
        <View key={f.id} style={styles.row}>
          <TouchableOpacity {...buttonA11y({ label: `${f.label}, ${f.dataType}${f.required ? ', required' : ''}`, hint: 'Edits the field' })}
            style={styles.fieldPress} onPress={() => setSelectedId(f.id)}>
            <Text style={styles.typeBadge}>{f.dataType}</Text>
            <View style={styles.flex1}>
              <Text style={styles.rowTitle} numberOfLines={1}>{f.label}{f.required ? ' *' : ''}</Text>
              <Text style={styles.rowCaption} numberOfLines={1}>{[f.id, f.stereotype && f.stereotype !== 'regular' ? f.stereotype : ''].filter(Boolean).join(' · ')}</Text>
            </View>
          </TouchableOpacity>
          <IconButton icon="arrow-up" size={20} disabled={i === 0} accessibilityLabel={`Move ${f.label} up`}
            onPress={() => change(moveField(form, f.id, -1))} />
          <IconButton icon="arrow-down" size={20} disabled={i === form.fields.length - 1} accessibilityLabel={`Move ${f.label} down`}
            onPress={() => change(moveField(form, f.id, 1))} />
          <IconButton icon="content-copy" size={20} accessibilityLabel={`Duplicate ${f.label}`}
            onPress={() => { const r = duplicateField(form, f.id); change(r.form); }} />
          <IconButton icon="delete-outline" size={20} iconColor={theme.danger} accessibilityLabel={`Delete ${f.label}`}
            onPress={() => change(deleteField(form, f.id))} />
        </View>
      ))}
      <Portal>
        <Dialog visible={!!selected} onDismiss={() => setSelectedId(null)} style={styles.editDialog}>
          <Dialog.Title>Field properties</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.panelBody}>
              {selected && (() => {
                const set = (patch: Partial<typeof selected>) => change(updateField(form, selected.id, patch));
                return (
                  <>
                    <OutlinedInput label="ID" value={selected.id} editable={false} />
                    <OutlinedInput label="Label" value={selected.label} onChangeText={(t) => set({ label: t })} />
                    <ChoiceField label="Data type" value={selected.dataType} options={asOptions(DATA_TYPES)} onChange={(v) => set({ dataType: v })} />
                    <ChoiceField label="Stereotype" value={selected.stereotype ?? 'regular'} options={asOptions(STEREOTYPES)} onChange={(v) => set(stereotypePatch(v))} />
                    <CheckRow label="Required" checked={!!selected.required} onToggle={() => set({ required: !selected.required })} />
                    <OutlinedInput label="Description / hint" multiline value={selected.description ?? ''} onChangeText={(t) => set({ description: t || undefined })} />
                  </>
                );
              })()}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <MateuButton label="Done" buttonStyle="primary" onPress={() => setSelectedId(null)} />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  card: { gap: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, borderRadius: theme.radiusMd, padding: 12, backgroundColor: theme.surface },
  toolbar: { gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '600', color: theme.ink, flexShrink: 1 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  panel: { gap: 8, paddingVertical: 4 },
  panelBody: { gap: 10, paddingVertical: 8 },
  scrollArea: { maxHeight: 520, paddingHorizontal: 16 },
  editDialog: { maxWidth: 560, width: '92%', alignSelf: 'center' },
  choiceDialog: { maxWidth: 420, width: '88%', alignSelf: 'center', maxHeight: '80%' },
  empty: { color: theme.faint, fontStyle: 'italic', paddingVertical: 12, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: theme.minTouch, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  fieldPress: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: theme.minTouch },
  flex1: { flex: 1, minWidth: 0 },
  swatch: { width: 10, height: 28, borderRadius: 3 },
  rowTitle: { fontWeight: '600', color: theme.ink, fontSize: 14 },
  rowCaption: { fontSize: 12, color: theme.muted },
  typeBadge: { fontSize: 11, color: theme.onFill, backgroundColor: theme.info, borderRadius: theme.radiusPill, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: theme.minTouch },
  checkLabel: { color: theme.ink, fontSize: 14, flex: 1 },
}));
