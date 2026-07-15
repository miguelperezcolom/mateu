import React, { useState } from 'react';
import {
  Modal,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { PhotoCaptureField, SignatureField } from './CaptureFields';
import { DateField } from './DateField';
import {
  BadgeChip,
  ColorField,
  formatMoney,
  ImagePreview,
  LinkText,
  MultiSelectField,
  RadioField,
  RichText,
  SliderField,
  StarsField,
  StepperField,
  UploadableImageField,
} from './FieldWidgets';
import { LookupField } from './LookupField';
import { interpolate } from '../core/expressions';
import { useViewController } from './MateuViewHost';

interface Option {
  children?: Option[];
  label: string;
  value: string;
}

interface GridColumnMeta {
  id: string;
  label?: string;
  dataType?: string;
  editorType?: string | null;
  editorOptions?: Option[] | null;
}

interface FieldMeta {
  fieldId: string;
  label?: string;
  dataType?: string;
  stereotype?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  initialValue?: unknown;
  options?: Option[];
  /** Grid fields: ClientSide GridColumn nodes. */
  columns?: { metadata?: GridColumnMeta }[];
  /** Lookup fields: remote search coordinates (action = `search-<fieldId>` by convention). */
  remoteCoordinates?: { action?: string | null } | null;
  sliderMin?: number;
  sliderMax?: number;
  step?: number;
  stepButtonsVisible?: boolean;
  multiline?: boolean;
  /** Property-list sections (@Section(propertyList=true)): read-only row, label left / value
   *  right, divider between rows. */
  propertyRow?: boolean;
  /** @OnRowSelected on grid fields: routed action id run with parameters._clickedRow. */
  onItemSelectionActionId?: string | null;
}

interface Props {
  metadata: FieldMeta;
  state: Record<string, unknown>;
  onStateChange: (fieldId: string, value: unknown) => void;
  /** Client-side validation error to surface under the input. */
  error?: string;
}

export function FormFieldRenderer({ metadata, state, onStateChange, error }: Props) {
  const { fieldId, dataType = 'string', stereotype = '', readOnly = false, disabled = false, options = [] } = metadata;
  const controller = useViewController();

  // putState mutates the controller state WITHOUT re-publishing (a full re-render per keystroke
  // would be wasteful), so widgets that derive their display from props (switch, date, selects,
  // grid) keep a local echo of the last committed value until the next real publish remounts us.
  const [localValue, setLocalValue] = useState<unknown>(undefined);
  const rawValue = (localValue !== undefined ? localValue : state[fieldId] ?? metadata.initialValue) ?? '';
  const stringValue = rawValue === null || rawValue === undefined ? '' : String(rawValue);
  const commit = (id: string, v: unknown) => {
    setLocalValue(v);
    onStateChange(id, v);
  };

  // Rule-driven attribute overrides (SetAttributeValue: hidden/disabled/required) + interpolation
  const ruleAttrs = controller.fieldAttributes[fieldId] ?? {};
  const label = interpolate(metadata.label ?? '', { state, appState: controller.session.appState });
  const required = ruleAttrs['required'] !== undefined ? Boolean(ruleAttrs['required']) : metadata.required === true;
  if (ruleAttrs['hidden']) return null;

  const editable = !readOnly && !disabled && !ruleAttrs['disabled'];

  // Property-list row (@Section(propertyList=true)): read-only, label left / plain-text value
  // right, divider under the row — same contract as the web renderers' FormField.propertyRow.
  if (metadata.propertyRow) {
    const isBool = dataType === 'bool' || dataType === 'boolean' || rawValue === true || rawValue === false;
    const text = isBool
      ? (rawValue === true || rawValue === 'true' ? '✓' : '—')
      : dataType === 'money'
        ? formatMoney(rawValue)
        : stringValue !== '' ? stringValue : '—';
    return (
      <View style={styles.propertyRow}>
        {!!label && label !== 'null' && <Text style={styles.propertyRowLabel}>{label}</Text>}
        <Text style={styles.propertyRowValue}>{text}</Text>
      </View>
    );
  }

  const renderInput = () => {
    // Grid: an array-of-rows field (nested collection). Read-only shows the table; editable
    // opens a row form on tap (mobile-friendly counterpart of the web's inline editors).
    if (stereotype === 'grid' || (dataType === 'array' && (metadata.columns?.length ?? 0) > 0)) {
      return (
        <GridField
          columns={(metadata.columns ?? []).map((c) => c.metadata).filter(Boolean) as GridColumnMeta[]}
          rows={Array.isArray(rawValue) ? (rawValue as Record<string, unknown>[]) : []}
          editable={editable}
          onChange={(rows) => commit(fieldId, rows)}
          onRowSelected={
            metadata.onItemSelectionActionId
              ? (row) => void controller.runAction(metadata.onItemSelectionActionId!, { _clickedRow: row })
              : undefined
          }
        />
      );
    }

    // Boolean badge chip (@Badge): lit when true, shows the label
    if (stereotype === 'badge') {
      return <BadgeChip label={label || fieldId} on={Boolean(rawValue)} />;
    }

    // Boolean (also the toggle/checkbox stereotypes)
    if (dataType === 'bool' || dataType === 'boolean' || dataType === 'Boolean') {
      return (
        <Switch
          value={Boolean(rawValue)}
          onValueChange={(v) => commit(fieldId, v)}
          disabled={!editable}
        />
      );
    }

    // Plain bulleted list (@BulletedList on a collection field): read-only <ul>
    if (stereotype === 'bulletedList') {
      const items = Array.isArray(rawValue) ? rawValue.map(String) : stringValue ? [stringValue] : [];
      return (
        <View style={styles.bulletedField}>
          {items.map((item, i) => (
            <View key={i} style={styles.bulletedFieldRow}>
              <Text style={styles.bulletedFieldDot}>•</Text>
              <Text style={styles.bulletedFieldText}>{item}</Text>
            </View>
          ))}
        </View>
      );
    }

    // Plain read-only text (@PlainText context): money formats, @Multiline wraps
    if (stereotype === 'plainText') {
      const text = dataType === 'money' ? formatMoney(rawValue) : stringValue;
      return (
        <Text style={styles.plainText} numberOfLines={metadata.multiline ? undefined : 1}>
          {text}
        </Text>
      );
    }

    // Radio buttons (small enums / @UseRadioButtons)
    if (stereotype === 'radio' && options.length > 0) {
      return <RadioField options={options} value={stringValue} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // Multi-select (Set<Enum> fields) — value is a list
    if (stereotype === 'multiSelect') {
      const selected = Array.isArray(rawValue) ? (rawValue as string[]).map(String) : [];
      return <MultiSelectField options={options} value={selected} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // Stars rating
    if (stereotype === 'stars') {
      return <StarsField value={Number(rawValue) || 0} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // Slider
    if (stereotype === 'slider') {
      return (
        <SliderField
          min={metadata.sliderMin ?? 0}
          max={metadata.sliderMax ?? 100}
          step={metadata.step ?? 1}
          value={Number(rawValue) || 0}
          editable={editable}
          onChange={(v) => commit(fieldId, v)}
        />
      );
    }

    // Color picker
    if (stereotype === 'color') {
      return <ColorField value={stringValue} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // Images: read-only preview / @UploadableImage picker (data URI round-trip)
    if (stereotype === 'uploadableImage') {
      return <UploadableImageField value={stringValue} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }
    if (stereotype === 'image') {
      return <ImagePreview value={stringValue} />;
    }

    // Link (read-only navigations)
    if (stereotype === 'link' && !editable) {
      return <LinkText value={stringValue} />;
    }

    // Rich content: rendered read-only, textarea when editable
    if (['markdown', 'html', 'richText'].includes(stereotype)) {
      if (!editable) return <RichText value={stringValue} kind={stereotype as 'markdown' | 'html' | 'richText'} />;
      return (
        <TextInput
          style={[styles.input, styles.textarea]}
          value={stringValue}
          onChangeText={(v) => commit(fieldId, v)}
          multiline
          numberOfLines={6}
          placeholder={label}
        />
      );
    }

    // Date / datetime: calendar picker committing the ISO wire format
    if (dataType === 'date' || dataType === 'datetime') {
      return (
        <DateField
          value={stringValue}
          editable={editable}
          withTime={dataType === 'datetime'}
          placeholder={label}
          onChange={(v) => commit(fieldId, v)}
        />
      );
    }

    // Lookup / searchable selects: remote search through the `search-<fieldId>` action
    if (stereotype === 'searchable' || (stereotype === 'combobox' && metadata.remoteCoordinates)) {
      return (
        <LookupField
          fieldId={fieldId}
          label={label}
          value={stringValue}
          editable={editable}
          action={metadata.remoteCoordinates?.action}
          onChange={(v) => commit(fieldId, v)}
        />
      );
    }

    // Tree select: the dropdown unfolds a TREE (options carry children)
    if (stereotype === 'treeSelect') {
      return (
        <TreeSelectField
          options={options}
          leavesOnly={(metadata as { treeLeavesOnly?: boolean }).treeLeavesOnly === true}
          value={stringValue}
          editable={editable}
          onChange={(v) => commit(fieldId, v)}
        />
      );
    }

    // Capture fields: signature pad (svg strokes rasterized by view-shot) and expo-camera —
    // both commit a data URI, the same wire contract as the web renderers
    if (stereotype === 'signature') {
      return <SignatureField value={stringValue} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }
    if (stereotype === 'camera') {
      return <PhotoCaptureField value={stringValue} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // Options (enum / static list)
    if (options.length > 0) {
      return <OptionsField options={options} value={stringValue} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // Textarea
    if (stereotype === 'textarea') {
      return (
        <TextInput
          style={[styles.input, styles.textarea]}
          value={stringValue}
          onChangeText={(v) => commit(fieldId, v)}
          multiline
          numberOfLines={4}
          editable={editable}
          placeholder={label}
        />
      );
    }

    // Password
    if (stereotype === 'password') {
      return (
        <TextInput
          style={styles.input}
          value={stringValue}
          onChangeText={(v) => commit(fieldId, v)}
          secureTextEntry
          editable={editable}
          placeholder={label}
        />
      );
    }

    // Time (LocalTime): HH:MM input
    if (dataType === 'time') {
      return (
        <TextInput
          style={styles.input}
          value={stringValue}
          onChangeText={(v) => commit(fieldId, v)}
          placeholder="HH:MM"
          editable={editable}
          autoCapitalize="none"
        />
      );
    }

    // Integer / long — step buttons when the wire asks for them
    if (['integer', 'int', 'long', 'Integer', 'Long'].includes(dataType)) {
      if (metadata.stepButtonsVisible) {
        return (
          <StepperField
            value={Number(rawValue) || 0}
            step={metadata.step ?? 1}
            editable={editable}
            onChange={(v) => commit(fieldId, v)}
          />
        );
      }
      return (
        <TextInput
          style={styles.input}
          value={stringValue}
          onChangeText={(v) => commit(fieldId, v === '' ? null : parseInt(v, 10))}
          keyboardType="number-pad"
          editable={editable}
          placeholder={label}
        />
      );
    }

    // Decimal / money (money formats when read-only)
    if (['number', 'double', 'float', 'decimal', 'BigDecimal', 'money'].includes(dataType) || ['money', 'currency'].includes(stereotype)) {
      if (!editable && (dataType === 'money' || ['money', 'currency'].includes(stereotype))) {
        return <Text style={styles.plainText}>{formatMoney(rawValue)}</Text>;
      }
      return (
        <TextInput
          style={styles.input}
          value={stringValue}
          onChangeText={(v) => commit(fieldId, v === '' ? null : parseFloat(v))}
          keyboardType="decimal-pad"
          editable={editable}
          placeholder={label}
        />
      );
    }

    // Default text (email keyboard for the email stereotype)
    return (
      <TextInput
        style={styles.input}
        value={stringValue}
        onChangeText={(v) => commit(fieldId, v)}
        editable={editable}
        placeholder={label}
        keyboardType={stereotype === 'email' ? 'email-address' : 'default'}
        autoCapitalize="none"
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label ?? fieldId}{required ? ' *' : ''}</Text>
      {renderInput()}
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

/** Table for an array field. Columns come from the wire GridColumn metadata; when a fragment
 *  omits them (edit-mode responses), they derive from the first row's keys. */
function GridField({ columns, rows, editable, onChange, onRowSelected }: {
  columns: GridColumnMeta[];
  rows: Record<string, unknown>[];
  editable: boolean;
  onChange: (rows: Record<string, unknown>[]) => void;
  /** @OnRowSelected: tapping a row runs the developer action with _clickedRow (works read-only). */
  onRowSelected?: (row: Record<string, unknown>) => void;
}) {
  // editingIndex: -1 closed, rows.length = new row
  const [editingIndex, setEditingIndex] = useState(-1);

  // internal columns (_select, _rowNumber…) are wire plumbing, not data
  const cols: GridColumnMeta[] = (
    columns.length > 0
      ? columns
      : Object.keys(rows[0] ?? {}).map((k) => ({ id: k, label: k }))
  ).filter((c) => !c.id.startsWith('_'));

  const cellText = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? '✓' : '—';
    return String(v);
  };

  const commitRow = (row: Record<string, unknown>) => {
    const next = [...rows];
    if (editingIndex >= rows.length) next.push({ ...row, _rowNumber: rows.length });
    else next[editingIndex] = { ...next[editingIndex], ...row };
    onChange(next);
    setEditingIndex(-1);
  };

  const deleteRow = () => {
    onChange(rows.filter((_, i) => i !== editingIndex).map((r, i) => ({ ...r, _rowNumber: i })));
    setEditingIndex(-1);
  };

  return (
    <View style={styles.gridBox}>
      <View style={[styles.gridRow, styles.gridHeader]}>
        {cols.map((c) => (
          <Text key={c.id} style={[styles.gridCell, styles.gridHeaderText]} numberOfLines={1}>
            {c.label || c.id}
          </Text>
        ))}
      </View>
      {rows.length === 0 && <Text style={styles.gridEmpty}>No data</Text>}
      {rows.map((row, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.gridRow, i % 2 === 1 && styles.gridRowAlt]}
          disabled={!editable && !onRowSelected}
          onPress={() => (onRowSelected ? onRowSelected(row) : setEditingIndex(i))}
        >
          {cols.map((c) => (
            <Text key={c.id} style={styles.gridCell} numberOfLines={1}>
              {cellText(row[c.id])}
            </Text>
          ))}
        </TouchableOpacity>
      ))}
      {editable && (
        <TouchableOpacity style={styles.gridAdd} onPress={() => setEditingIndex(rows.length)}>
          <Text style={styles.gridAddText}>+ Add</Text>
        </TouchableOpacity>
      )}
      {editingIndex >= 0 && (
        <GridRowForm
          columns={cols}
          row={rows[editingIndex] ?? {}}
          isNew={editingIndex >= rows.length}
          onSave={commitRow}
          onDelete={deleteRow}
          onCancel={() => setEditingIndex(-1)}
        />
      )}
    </View>
  );
}

/** Modal row editor: one input per column, typed by the column dataType (falling back to the
 *  current value's type — column dataType is often 'string' even for numeric cells). */
export function GridRowForm({ columns, row, isNew, onSave, onDelete, onCancel }: {
  columns: GridColumnMeta[];
  row: Record<string, unknown>;
  isNew: boolean;
  onSave: (row: Record<string, unknown>) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...row });

  const isBool = (c: GridColumnMeta) =>
    ['bool', 'boolean', 'Boolean'].includes(c.dataType ?? '') || typeof row[c.id] === 'boolean';
  const isNumber = (c: GridColumnMeta) =>
    ['integer', 'int', 'long', 'number', 'double', 'float', 'decimal'].includes(c.dataType ?? '') ||
    typeof row[c.id] === 'number';

  return (
    <Modal animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.rowFormBackdrop}>
        <View style={styles.rowFormCard}>
          <ScrollView>
            {columns.map((c) => (
              <View key={c.id} style={styles.container}>
                <Text style={styles.label}>{c.label || c.id}</Text>
                {isBool(c) ? (
                  <Switch
                    value={Boolean(draft[c.id])}
                    onValueChange={(v) => setDraft({ ...draft, [c.id]: v })}
                  />
                ) : (c.editorOptions?.length ?? 0) > 0 ? (
                  <OptionsField
                    options={c.editorOptions!}
                    value={draft[c.id] == null ? '' : String(draft[c.id])}
                    editable
                    onChange={(v) => setDraft({ ...draft, [c.id]: v })}
                  />
                ) : c.dataType === 'date' || c.dataType === 'datetime' ? (
                  <DateField
                    value={draft[c.id] == null ? '' : String(draft[c.id])}
                    editable
                    withTime={c.dataType === 'datetime'}
                    onChange={(v) => setDraft({ ...draft, [c.id]: v })}
                  />
                ) : (
                  <TextInput
                    style={styles.input}
                    value={draft[c.id] === null || draft[c.id] === undefined ? '' : String(draft[c.id])}
                    keyboardType={isNumber(c) ? 'decimal-pad' : 'default'}
                    onChangeText={(v) =>
                      setDraft({
                        ...draft,
                        [c.id]: isNumber(c) ? (v === '' ? null : Number(v)) : v,
                      })
                    }
                    autoCapitalize="none"
                  />
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.rowFormButtons}>
            {!isNew && (
              <TouchableOpacity style={[styles.rowFormButton, styles.rowFormDelete]} onPress={onDelete}>
                <Text style={styles.rowFormDeleteText}>Delete</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.rowFormButton} onPress={onCancel}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rowFormButton, styles.rowFormSave]} onPress={() => onSave(draft)}>
              <Text style={styles.rowFormSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function OptionsField({ options, value, editable, onChange }: { options: Option[]; value: string; editable: boolean; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={() => editable && setOpen(!open)} activeOpacity={editable ? 0.7 : 1}>
        <Text style={!selected ? styles.placeholder : undefined}>{selected?.label ?? (value || 'Select…')}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 200 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.dropdownItem}
                onPress={() => { onChange(opt.value); setOpen(false); }}
              >
                <Text>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// The tree variant of OptionsField (@TreeSelect): nodes with children expand/collapse in place;
// with leavesOnly, tapping a group only toggles it.
function TreeSelectField({ options, leavesOnly, value, editable, onChange }: {
  options: Option[]; leavesOnly: boolean; value: string; editable: boolean; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openNodes, setOpenNodes] = useState<string[]>([]);

  const findLabel = (opts: Option[], v: string): string | null => {
    for (const opt of opts) {
      if (opt.value === v) return opt.label;
      const sub = findLabel(opt.children ?? [], v);
      if (sub != null) return sub;
    }
    return null;
  };

  const flatten = (opts: Option[], depth: number): { opt: Option; depth: number }[] =>
    opts.flatMap((opt) => {
      const self = [{ opt, depth }];
      const children = opt.children ?? [];
      return children.length > 0 && openNodes.includes(opt.value)
        ? [...self, ...flatten(children, depth + 1)]
        : self;
    });

  const currentLabel = findLabel(options, value) ?? (value || 'Select…');

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={() => editable && setOpen(!open)} activeOpacity={editable ? 0.7 : 1}>
        <Text style={!value ? styles.placeholder : undefined}>{currentLabel}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 240 }}>
            {flatten(options, 0).map(({ opt, depth }) => {
              const children = opt.children ?? [];
              const isOpen = openNodes.includes(opt.value);
              const isGroup = children.length > 0;
              return (
                <View key={opt.value} style={[styles.dropdownItem, { paddingLeft: 12 + depth * 16, flexDirection: 'row', alignItems: 'center' }]}>
                  {isGroup ? (
                    <TouchableOpacity
                      onPress={() => setOpenNodes(isOpen ? openNodes.filter((n) => n !== opt.value) : [...openNodes, opt.value])}
                      style={{ paddingRight: 6 }}
                    >
                      <Text>{isOpen ? '▾' : '▸'}</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      if (leavesOnly && isGroup) {
                        setOpenNodes(isOpen ? openNodes.filter((n) => n !== opt.value) : [...openNodes, opt.value]);
                      } else {
                        onChange(opt.value);
                        setOpen(false);
                      }
                    }}
                  >
                    <Text>{opt.label}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldError: { color: '#cc0000', fontSize: 12, marginTop: 4 },
  plainText: { fontSize: 14, color: '#1a1a1a', paddingVertical: 6 },
  // Property-list rows (@Section(propertyList=true))
  propertyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e4e4e7' },
  propertyRowLabel: { fontSize: 13, color: '#888' },
  propertyRowValue: { flex: 1, fontSize: 14, color: '#1a1a1a', fontWeight: '500', textAlign: 'right' },
  // Bulleted list field (@BulletedList)
  bulletedField: { gap: 2, paddingVertical: 2 },
  bulletedFieldRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 2 },
  bulletedFieldDot: { color: '#888', lineHeight: 20 },
  bulletedFieldText: { flex: 1, color: '#222', fontSize: 14, lineHeight: 20 },
  container: { marginBottom: 12 },
  label: { fontSize: 12, color: '#555', marginBottom: 4, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 42,
    justifyContent: 'center',
  },
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: 10 },
  placeholder: { color: '#aaa' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginTop: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 100,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  gridBox: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 6, overflow: 'hidden' },
  gridRow: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  gridRowAlt: { backgroundColor: '#fafafa' },
  gridHeader: { backgroundColor: '#f0f0f0' },
  gridHeaderText: { fontWeight: '600', color: '#333' },
  gridCell: { flex: 1, fontSize: 13, color: '#1a1a1a', paddingHorizontal: 4 },
  gridEmpty: { padding: 12, fontSize: 13, color: '#999', fontStyle: 'italic' },
  gridAdd: { padding: 10, alignItems: 'center' },
  gridAddText: { color: '#0070f3', fontWeight: '600', fontSize: 13 },
  rowFormBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  rowFormCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '80%' },
  rowFormButtons: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  rowFormButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: '#ccc' },
  rowFormSave: { backgroundColor: '#0070f3', borderColor: '#0070f3' },
  rowFormSaveText: { color: '#fff', fontWeight: '600' },
  rowFormDelete: { borderColor: '#cc0000' },
  rowFormDeleteText: { color: '#cc0000' },
});
