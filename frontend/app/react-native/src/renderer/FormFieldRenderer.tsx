import React, { useEffect, useState } from 'react';
import { FieldFocusRegistrar } from '../ui/fieldFocus';
import { Modal, View, StyleSheet, ScrollView } from 'react-native';
import { MIcon } from '../ui/controls';
import { TouchableOpacity } from '../ui/Touchable';
import { HelperText, SegmentedButtons, Switch as PaperSwitch, Text as PaperText } from 'react-native-paper';
import { DenseFields, MateuButton, OutlinedDecimalInput, OutlinedInput, OutlinedTrigger, StatusChip } from '../ui/controls';
import { optionLabelOf, readOnlyFieldText, readOnlyStatus } from '../core/readOnlyDisplay';
import { Text, TextInput } from '../ui/Text';
import { PhotoCaptureField, SignatureField } from './CaptureFields';
import { DateField, TimeField } from './DateField';
import {
  BadgeChip,
  ColorField,
  formatMoney,
  ImagePreview,
  LinkText,
  MultiSelectField,
  CheckboxGroupField,
  FileUploadField,
  ListBoxField,
  RadioField,
  RichText,
  SliderField,
  StarsField,
  StepperField,
  DecimalInput,
  UploadableImageField,
} from './FieldWidgets';
import { LookupField } from './LookupField';
import { showsAsReadOnlyText } from './readOnlyText';
import { lookupLabelOf } from '../core/readOnlyDisplay';
import { interpolate, interpolateUrl } from '../core/expressions';
import { fetchExternalJson, mapItemsToOptions, type FetchedOption } from '../core/restFetch';
import { sourcedOptionsControl } from '../core/sourcedOptions';
import { useViewController } from './MateuViewHost';
import { theme, themed } from '../theme';
import { fieldA11y, buttonA11y, modalA11y, headingA11y, announce } from '../a11y/a11y';
import { fieldPlaceholder } from '../core/uxRules';
import { moneyInputCommit, moneyInputText, stepperValue } from '../core/uxRules';
import { flattenColumnGroups } from './columnGroups';

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
  /** A placeholder the developer declared (FormFieldDto.placeholder) — the only one shown. */
  placeholder?: string | null;
  /** @Help — read after the field name as guidance (accessibilityHint). */
  description?: string;
  dataType?: string;
  stereotype?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  initialValue?: unknown;
  options?: Option[];
  /** @RestOptions: options fetched CLIENT-SIDE from an arbitrary REST endpoint (url/method/headers/
   *  body interpolated; itemsPath→array; valuePath/labelPath per item). */
  optionsSource?: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    itemsPath?: string;
    valuePath?: string;
    labelPath?: string;
    /** Fetch through the Mateu server (no CORS, secrets server-side) instead of directly. */
    proxy?: boolean;
  };
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

/** A form field; its input can be asked for the focus (the first invalid field of a rejected save). */
export function FormFieldRenderer(props: Props) {
  const controller = useViewController();
  const fieldId = props.metadata.fieldId;
  const register = React.useCallback((focus: () => void) => controller.registerFieldFocus(fieldId, focus), [controller, fieldId]);
  return (
    <FieldFocusRegistrar.Provider value={register}>
      <FormFieldBody {...props} />
    </FieldFocusRegistrar.Provider>
  );
}

function FormFieldBody({ metadata, state, onStateChange, error }: Props) {
  const { fieldId, dataType = 'string', stereotype = '', readOnly = false, disabled = false, options = [] } = metadata;
  const controller = useViewController();

  // widgets that derive their display from props (switch, date, selects, grid) keep a local echo of
  // the last committed value; an edit re-publishes the same state, and a value the SERVER changes
  // arrives with a remount (or replaces the echo below when it differs).
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
  const dense = React.useContext(DenseFields);
  if (ruleAttrs['hidden']) return null;

  const editable = !readOnly && !disabled && !ruleAttrs['disabled'];
  // RN-10: only a declared placeholder — the label echoed inside the box made empty fields look filled.
  const placeholder = fieldPlaceholder(metadata);
  const help = (metadata.description ?? '').trim();

  // A TextInput cannot be associated with the <Text> label above it — React Native has no
  // labelFor and no aria-labelledby — so the name has to be handed to the control itself, or the
  // field is announced as a bare "text field". Computed once and spread onto whichever branch
  // below actually renders.
  const a11y = fieldA11y({
    label: label || fieldId,
    description: metadata.description,
    required,
    editable,
    error,
  });

  // Property-list row (@Section(propertyList=true)): read-only, label left / plain-text value
  // right, divider under the row — same contract as the web renderers' FormField.propertyRow.
  if (metadata.propertyRow) {
    const isBool = dataType === 'bool' || dataType === 'boolean' || rawValue === true || rawValue === false;
    // money formatted, an option's label instead of its code, a status as its tone chip
    const status = dataType === 'status' ? readOnlyStatus(metadata, rawValue) : null;
    const text = isBool
      ? (rawValue === true || rawValue === 'true' ? '✓' : '—')
      : readOnlyFieldText(metadata, rawValue) || '—';
    return (
      <View style={styles.propertyRow}>
        {!!label && label !== 'null' && <Text style={styles.propertyRowLabel}>{label}</Text>}
        {status ? <StatusChip label={status.label} tone={status.tone} /> : <Text style={styles.propertyRowValue}>{text}</Text>}
      </View>
    );
  }

  // Text-like inputs, selects and dates draw their label INSIDE the outline (Material outlined
  // field) and their error under it; everything else keeps the label above.
  let ownLabel = false;
  const outlined = { label: label || fieldId, required, error, a11y };
  const renderInput = () => {
    // Grid: an array-of-rows field (nested collection). Read-only shows the table; editable
    // opens a row form on tap (mobile-friendly counterpart of the web's inline editors).
    if (stereotype === 'grid' || (dataType === 'array' && (metadata.columns?.length ?? 0) > 0)) {
      return (
        <GridField
          columns={flattenColumnGroups(metadata.columns ?? []).map((c) => c.metadata).filter(Boolean) as GridColumnMeta[]}
          rows={Array.isArray(rawValue) ? (rawValue as Record<string, unknown>[]) : []}
          editable={editable}
          onChange={(rows) => commit(fieldId, rows)}
          onRowSelected={
            metadata.onItemSelectionActionId && !(editable && metadata.onItemSelectionActionId === `${fieldId}_selected`)
              ? (row) => void controller.runAction(metadata.onItemSelectionActionId!, { _clickedRow: row })
              : undefined
          }
        />
      );
    }

    // A status (dataType status): its tone chip — a plain word ("AVAILABLE") reads as its option
    // label or as words, toned by its meaning (the web's toStatus); a Mateu {type, message} as is
    if (dataType === 'status') {
      const status = readOnlyStatus(metadata, rawValue);
      return status ? <StatusChip label={status.label} tone={status.tone} /> : <ReadOnlyValue label={label || fieldId} text="" />;
    }

    // Boolean badge chip (@Badge): lit when true, shows the label
    if (stereotype === 'badge') {
      return <BadgeChip label={label || fieldId} on={Boolean(rawValue)} />;
    }

    // Boolean (also the toggle/checkbox stereotypes)
    if (dataType === 'bool' || dataType === 'boolean' || dataType === 'Boolean') {
      ownLabel = true;
      return (
        // a Material switch row: the label on the left, the switch on the right
        <View style={styles.switchRow}>
          <PaperText variant="bodyLarge" style={styles.switchLabel} importantForAccessibility="no" accessibilityElementsHidden>
            {label || fieldId}{required ? ' *' : ''}
          </PaperText>
          {/* RN-07: the switch carries the field's name (it was announced as an unnamed "switch"). */}
          <PaperSwitch
            {...a11y}
            accessibilityRole="switch"
            value={Boolean(rawValue)}
            onValueChange={(v) => commit(fieldId, v)}
            disabled={!editable}
            color={theme.primary}
          />
        </View>
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
      const text = readOnlyFieldText(metadata, rawValue);
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

    // A multi-value field (multi-select, checkbox group, list box, tree) fed by a REST
    // `optionsSource`: its own control, drawn with the source's options once they land
    // (core/sourcedOptions). Only the single select read a source before — these drew empty.
    const sourcedControl = sourcedOptionsControl(metadata, rawValue);
    if (sourcedControl && metadata.optionsSource) {
      if (sourcedControl === 'treeSelect') ownLabel = true;
      const selected = Array.isArray(rawValue) ? (rawValue as unknown[]).map(String) : [];
      return (
        <SourcedOptions source={metadata.optionsSource} fieldId={fieldId} state={state} appState={controller.session.appState}>
          {(fetched) => {
            switch (sourcedControl) {
              case 'checkbox':
                return <CheckboxGroupField options={fetched} value={selected} editable={editable} onChange={(v) => commit(fieldId, v)} />;
              case 'listBox':
                return <ListBoxField options={fetched} value={stringValue} editable={editable} onChange={(v) => commit(fieldId, v)} />;
              case 'treeSelect':
                return (
                  <TreeSelectField
                    label={label || fieldId}
                    options={fetched}
                    leavesOnly={(metadata as { treeLeavesOnly?: boolean }).treeLeavesOnly === true}
                    value={stringValue}
                    editable={editable}
                    onChange={(v) => commit(fieldId, v)}
                  />
                );
              default:
                return <MultiSelectField options={fetched} value={selected} editable={editable} onChange={(v) => commit(fieldId, v)} />;
            }
          }}
        </SourcedOptions>
      );
    }

    // Multi-select (Set<Enum> fields) — value is a list
    if (stereotype === 'multiSelect') {
      const selected = Array.isArray(rawValue) ? (rawValue as string[]).map(String) : [];
      return <MultiSelectField options={options} value={selected} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // @Stereotype(checkbox) on a collection: a checkbox group (a list of values, like multiSelect)
    if (stereotype === 'checkbox' && (dataType === 'array' || Array.isArray(rawValue)) && options.length > 0) {
      const selected = Array.isArray(rawValue) ? (rawValue as unknown[]).map(String) : [];
      return <CheckboxGroupField options={options} value={selected} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // @Stereotype(listBox): the options always visible, one chosen
    if (stereotype === 'listBox' && options.length > 0) {
      return <ListBoxField options={options} value={stringValue} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // @FileUpload: a file picker committing the file as a data URI (the wire contract)
    if (stereotype === 'fileUpload') {
      const accept = ((metadata as { attributes?: { key?: string; value?: string }[] }).attributes ?? []).find((a) => a.key === 'accept')?.value;
      return <FileUploadField value={stringValue} accept={accept} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // Stars rating
    if (stereotype === 'stars') {
      return <StarsField value={Number(rawValue) || 0} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // Slider
    if (stereotype === 'slider') {
      return (
        <SliderField
          {...a11y}
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
      const content = stringValue;
      if (!editable) return <RichText value={content} kind={stereotype as 'markdown' | 'html' | 'richText'} />;
      ownLabel = true;
      // the web's source + Preview editor (mateu-markup-editor): the source in an outlined box,
      // and a Preview that draws it — the markdown rendered, the HTML/rich text as its text
      return (
        <MarkupEditor
          kind={stereotype as 'markdown' | 'html' | 'richText'}
          value={content}
          onChange={(v) => commit(fieldId, v)}
          input={(
            <OutlinedInput
              {...outlined}
              style={styles.textarea}
              value={content}
              onChangeText={(v) => commit(fieldId, v)}
              multiline
              numberOfLines={6}
              placeholder={placeholder}
            />
          )}
        />
      );
    }

    // Date / datetime: calendar picker committing the ISO wire format
    // (dateTime: LocalDateTime as the Java server spells it — it used to fall through to a text box)
    if (dataType === 'date' || dataType === 'datetime' || dataType === 'dateTime') {
      if (!editable) return <ReadOnlyValue label={label || fieldId} text={stringValue.replace('T', ' ')} />;
      ownLabel = true;
      return (
        <DateField
          {...a11y}
          label={label || fieldId}
          required={required}
          error={error}
          value={stringValue}
          editable={editable}
          withTime={dataType === 'datetime' || dataType === 'dateTime'}
          placeholder={placeholder}
          onChange={(v) => commit(fieldId, v)}
        />
      );
    }

    // Lookup / searchable selects: remote search through the `search-<fieldId>` action
    if (stereotype === 'searchable' || (stereotype === 'combobox' && metadata.remoteCoordinates)) {
      return (
        <LookupField
          {...a11y}
          fieldId={fieldId}
          label={label}
          value={stringValue}
          editable={editable}
          action={metadata.remoteCoordinates?.action}
          valueLabel={lookupLabelOf(controller.rendered.data, state, fieldId)}
          onChange={(v) => commit(fieldId, v)}
        />
      );
    }

    // Tree select: the dropdown unfolds a TREE (options carry children)
    if (stereotype === 'treeSelect') {
      ownLabel = true;
      return (
        <TreeSelectField
          label={label || fieldId}
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

    // @RestOptions: options fetched CLIENT-SIDE from an arbitrary REST endpoint.
    if (metadata.optionsSource) {
      ownLabel = true;
      return (
        <RestOptionsField
          label={label || fieldId}
          required={required}
          error={error}
          source={metadata.optionsSource}
          fieldId={fieldId}
          state={state}
          appState={controller.session.appState}
          value={stringValue}
          editable={editable}
          onChange={(v) => commit(fieldId, v)}
        />
      );
    }

    // Options (enum / static list)
    if (options.length > 0) {
      if (!editable) return <ReadOnlyValue label={label || fieldId} text={optionLabelOf(metadata, rawValue) ?? stringValue} />;
      ownLabel = true;
      return <OptionsField label={label || fieldId} required={required} error={error} options={options} value={stringValue} editable={editable} onChange={(v) => commit(fieldId, v)} />;
    }

    // RN-08: a read-only value is TEXT, not an input box. A disabled TextInput looked exactly like
    // an editable one (same border, same background), so a view page read as a form the user could
    // not type into — and an empty value was an empty box. Now: the value as text, "—" when empty.
    if (showsAsReadOnlyText(editable, dataType, stereotype)) {
      const shown = stereotype === 'password' && stringValue ? '••••••••' : readOnlyFieldText(metadata, rawValue);
      return <ReadOnlyValue label={label || fieldId} text={shown} multiline={stereotype === 'textarea'} />;
    }

    // Textarea
    if (stereotype === 'textarea') {
      ownLabel = true;
      return (
        <OutlinedInput
          {...outlined}
          style={styles.textarea}
          value={stringValue}
          onChangeText={(v) => commit(fieldId, v)}
          multiline
          numberOfLines={4}
          editable={editable}
          placeholder={placeholder}
        />
      );
    }

    // Password
    if (stereotype === 'password') {
      ownLabel = true;
      return (
        <OutlinedInput
          {...outlined}
          value={stringValue}
          onChangeText={(v) => commit(fieldId, v)}
          secureTextEntry
          editable={editable}
          placeholder={placeholder}
        />
      );
    }

    // Time (LocalTime): an hour / minute picker committing HH:MM
    if (dataType === 'time') {
      ownLabel = true;
      return (
        <TimeField
          label={label || fieldId}
          required={required}
          error={error}
          value={stringValue}
          editable={editable}
          placeholder={placeholder}
          onChange={(v) => commit(fieldId, v)}
        />
      );
    }

    // Integer / long — step buttons when the wire asks for them
    if (['integer', 'int', 'long', 'Integer', 'Long'].includes(dataType)) {
      if (metadata.stepButtonsVisible) {
        return (
          <StepperField
            value={stepperValue(rawValue)}
            step={metadata.step ?? 1}
            editable={editable}
            onChange={(v) => commit(fieldId, v)}
          />
        );
      }
      ownLabel = true;
      return (
        <OutlinedInput
          {...outlined}
          value={stringValue}
          onChangeText={(v) => commit(fieldId, v === '' ? null : parseInt(v, 10))}
          keyboardType="number-pad"
          editable={editable}
          placeholder={placeholder}
        />
      );
    }

    // Decimal / money (money formats when read-only)
    if (['number', 'double', 'float', 'decimal', 'BigDecimal', 'money'].includes(dataType) || ['money', 'currency'].includes(stereotype)) {
      if (!editable && (dataType === 'money' || ['money', 'currency'].includes(stereotype))) {
        return <Text style={styles.plainText}>{formatMoney(rawValue)}</Text>;
      }
      const money = dataType === 'money' || ['money', 'currency'].includes(stereotype);
      ownLabel = true;
      return (
        <OutlinedDecimalInput
          {...outlined}
          text={money ? moneyInputText(rawValue) : stringValue}
          blurredText={money && stringValue !== "" ? formatMoney(rawValue) : undefined}
          onChangeText={(v) => commit(fieldId, money ? moneyInputCommit(rawValue, v) : v === '' ? null : parseFloat(v.replace(',', '.')))}
          keyboardType="decimal-pad"
          editable={editable}
          placeholder={placeholder}
        />
      );
    }

    // Default text (email keyboard for the email stereotype)
    ownLabel = true;
    return (
      <OutlinedInput
        {...outlined}
        value={stringValue}
        onChangeText={(v) => commit(fieldId, v)}
        editable={editable}
        placeholder={placeholder}
        keyboardType={stereotype === 'email' ? 'email-address' : 'default'}
        autoCapitalize="none"
      />
    );
  };

  return (
    <View style={[styles.container, dense && styles.containerDense]}>
      {(() => {
        const input = renderInput();
        return (
          <>
            {!ownLabel && <PaperText variant="labelLarge" style={styles.label}>{label ?? fieldId}{required ? ' *' : ''}</PaperText>}
            {input}
            {!!error && !ownLabel && <HelperText type="error" visible style={styles.fieldError}>{error}</HelperText>}
            {/* @Help / description: the guidance under the field, visible (it lived only in the
                accessibility hint); an error under the field takes its place */}
            {!!help && !error && (
              <HelperText type="info" visible style={styles.fieldHelp} importantForAccessibility="no" accessibilityElementsHidden>{help}</HelperText>
            )}
          </>
        );
      })()}
    </View>
  );
}

/** A read-only field value: text (selectable, wraps), "—" when empty, named for screen readers. */
/** A markdown / HTML / rich-text editor: Write (the source) | Preview (it drawn). */
function MarkupEditor({ kind, value, input }: { kind: 'markdown' | 'html' | 'richText'; value: string; onChange: (v: string) => void; input: React.ReactNode }) {
  const [preview, setPreview] = useState(false);
  return (
    <View>
      <SegmentedButtons
        density="small"
        style={styles.markupTabs}
        value={preview ? 'preview' : 'write'}
        onValueChange={(v) => setPreview(v === 'preview')}
        buttons={[
          { value: 'write', label: kind === 'markdown' ? 'Markdown' : 'HTML', showSelectedCheck: false },
          { value: 'preview', label: 'Preview', showSelectedCheck: false },
        ]}
      />
      {preview ? (
        <View style={styles.markupPreview}>
          {value.trim() ? <RichText value={value} kind={kind} /> : <Text style={styles.readOnlyEmpty}>Nothing to preview</Text>}
        </View>
      ) : input}
    </View>
  );
}

function ReadOnlyValue({ label, text, multiline }: { label: string; text: string; multiline?: boolean }) {
  const empty = !text;
  return (
    <Text
      accessible
      accessibilityLabel={`${label}, ${empty ? 'empty' : text}`}
      selectable
      numberOfLines={multiline ? undefined : 3}
      style={[styles.readOnlyValue, empty && styles.readOnlyEmpty]}
    >
      {empty ? '—' : text}
    </Text>
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
        <TouchableOpacity {...buttonA11y()}
          key={i}
          style={[styles.gridRow, i % 2 === 1 && styles.gridRowAlt]}
          disabled={!editable && !onRowSelected}
          // an EDITABLE grid (@InlineEditing) edits the tapped row; the default "<field>_selected"
          // selection action the server sends with it answers nothing on a phone — it used to take
          // the tap, so the row form never opened
          onPress={() => { if (editable) setEditingIndex(i); if (onRowSelected) onRowSelected(row); }}
        >
          {cols.map((c) => (
            <Text key={c.id} style={styles.gridCell} numberOfLines={1}>
              {cellText(row[c.id])}
            </Text>
          ))}
        </TouchableOpacity>
      ))}
      {editable && (
        <TouchableOpacity {...buttonA11y()} style={styles.gridAdd} onPress={() => setEditingIndex(rows.length)}>
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
    <Modal accessibilityViewIsModal accessibilityLabel="Edit row" animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.rowFormBackdrop}>
        <View style={styles.rowFormCard}>
          <ScrollView>
            {columns.map((c) => (
              <View key={c.id} style={styles.container}>
                {(isBool(c) || (c.editorOptions?.length ?? 0) > 0 || c.dataType === 'date' || c.dataType === 'datetime') && (
                  <PaperText variant="labelLarge" style={styles.label}>{c.label || c.id}</PaperText>
                )}
                {isBool(c) ? (
                  <PaperSwitch
                    accessibilityLabel={c.label || c.id}
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
                  <OutlinedInput
                    label={c.label || c.id}
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
            {!isNew && <MateuButton label="Delete" buttonStyle="tertiary" color="error" onPress={onDelete} />}
            <View style={{ flex: 1 }} />
            <MateuButton label="Cancel" buttonStyle="tertiary" onPress={onCancel} />
            <MateuButton label="Save" buttonStyle="primary" onPress={() => onSave(draft)} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * The options of a REST `optionsSource`, fetched on mount (and again when the interpolated url
 * changes — a state-dependent source); empty until they land or when the fetch fails.
 */
function useSourcedOptions(source: NonNullable<FieldMeta['optionsSource']>, fieldId: string, state: Record<string, unknown>, appState: Record<string, unknown>): FetchedOption[] {
  const controller = useViewController();
  const [options, setOptions] = useState<FetchedOption[]>([]);
  const resolve = (t: unknown): string => interpolate(String(t ?? ''), { state, appState });
  // Resolve a catalogue `ref` (if any) so the url, the mapping paths and the proxy flag all come
  // from the resolved source — a by-ref surface carries none of its own.
  const resolved = controller.session.sources.resolve(source as Record<string, unknown>);
  const url = resolve(resolved.url);
  useEffect(() => {
    let cancelled = false;
    // Proxy mode: route through the Mateu server via __restfetch__ (no CORS, secrets server-side);
    // direct fetch otherwise. Both resolve to the same JSON → mapItemsToOptions.
    // A sampled source (sample mode) is never proxied: fetchExternalJson answers it from the sample.
    const jsonPromise = controller.session.sources.viaProxy(source as Record<string, unknown>)
      ? controller.fetchViaProxy('options', fieldId)
      : fetchExternalJson(source as Record<string, unknown>, resolve, (t) => interpolateUrl(String(t ?? ''), { state, appState }), controller.session.sources);
    jsonPromise
      .then((json) => { if (!cancelled) setOptions(mapItemsToOptions(json, resolved.itemsPath, resolved.valuePath, resolved.labelPath)); })
      .catch((e) => console.warn('mateu: external options fetch failed', e));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  return options;
}

/** A multi-value control over a REST source: [children] draws it from the fetched options. */
function SourcedOptions({ source, fieldId, state, appState, children }: {
  source: NonNullable<FieldMeta['optionsSource']>;
  fieldId: string;
  state: Record<string, unknown>;
  appState: Record<string, unknown>;
  children: (options: Option[]) => React.ReactNode;
}) {
  const options = useSourcedOptions(source, fieldId, state, appState);
  return <>{children(options)}</>;
}

// @RestOptions: a select whose options are fetched CLIENT-SIDE from an arbitrary REST endpoint on
// mount (and refetched when the interpolated url changes — a state-dependent source).
function RestOptionsField({ label, required, error, source, fieldId, state, appState, value, editable, onChange }: {
  label?: string;
  required?: boolean;
  error?: string;
  source: NonNullable<FieldMeta['optionsSource']>;
  fieldId: string;
  state: Record<string, unknown>;
  appState: Record<string, unknown>;
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
}) {
  const options = useSourcedOptions(source, fieldId, state, appState);
  return <OptionsField label={label} required={required} error={error} options={options} value={value} editable={editable} onChange={onChange} />;
}

function OptionsField({ label, required, error, options, value, editable, onChange }: { label?: string; required?: boolean; error?: string; options: Option[]; value: string; editable: boolean; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const shown = selected?.label ?? (value || 'Select…');

  return (
    <View>
      {/* RN-07: the trigger is named after the FIELD and says its value + whether the list is open
          (it was announced as just the value — "Available, button" — with no field name). */}
      {label ? (
        <OutlinedTrigger
          label={label}
          required={required}
          error={error}
          value={selected?.label ?? value}
          placeholder="Select…"
          icon={open ? 'menu-up' : 'menu-down'}
          expanded={open}
          disabled={!editable}
          accessibilityLabel={`${label}: ${selected?.label ?? (value || 'not selected')}`}
          onPress={() => editable && setOpen(!open)}
        />
      ) : (
        <TouchableOpacity
          {...buttonA11y({ expanded: open, disabled: !editable })}
          style={styles.input}
          onPress={() => editable && setOpen(!open)}
          activeOpacity={editable ? 0.7 : 1}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={!selected ? styles.placeholder : undefined}>{shown}</Text>
            <MIcon name="menu-down" />
          </View>
        </TouchableOpacity>
      )}
      {/* a bottom sheet, Material's way on a phone: a list opened in place pushed the whole form down */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity {...buttonA11y({ label: 'Close' })} style={styles.sheetDismiss} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            {!!label && <PaperText variant="titleMedium" style={styles.sheetTitle} accessibilityRole="header">{label}</PaperText>}
            <ScrollView>
              {options.map((opt) => (
                <TouchableOpacity {...buttonA11y({ selected: opt.value === value })}
                  key={opt.value}
                  style={[styles.sheetRow, opt.value === value && styles.dropdownItemSelected]}
                  onPress={() => { onChange(opt.value); setOpen(false); }}
                >
                  <Text style={[styles.sheetRowText, opt.value === value ? styles.dropdownTextSelected : undefined]}>{opt.label}</Text>
                  {opt.value === value && <MIcon name="check" size={20} color={theme.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// The tree variant of OptionsField (@TreeSelect): nodes with children expand/collapse in place;
// with leavesOnly, tapping a group only toggles it.
function TreeSelectField({ label, options, leavesOnly, value, editable, onChange }: {
  label?: string;
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
      <OutlinedTrigger
        label={label}
        value={value ? currentLabel : ''}
        placeholder="Select…"
        icon={open ? 'menu-up' : 'menu-down'}
        expanded={open}
        disabled={!editable}
        onPress={() => editable && setOpen(!open)}
      />
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
                    <TouchableOpacity {...buttonA11y()}
                      onPress={() => setOpenNodes(isOpen ? openNodes.filter((n) => n !== opt.value) : [...openNodes, opt.value])}
                      style={{ paddingRight: 6 }}
                    >
                      <MIcon name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} />
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity {...buttonA11y()}
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

const styles = themed(() => StyleSheet.create({
  fieldError: { paddingHorizontal: 0 },
  fieldHelp: { paddingHorizontal: 0, color: theme.muted },
  markupTabs: { marginBottom: 6, alignSelf: 'flex-start' },
  markupPreview: { borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, minHeight: 120 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 50, marginTop: 6, gap: 12 },
  switchLabel: { flex: 1, color: theme.ink },
  dropdownItemSelected: { backgroundColor: theme.primaryContainer },
  dropdownTextSelected: { color: theme.onPrimaryContainer, fontWeight: '600' },
  plainText: { fontSize: 14, color: theme.ink, paddingVertical: 6 },
  readOnlyValue: { fontSize: 16, color: theme.ink, paddingVertical: 6 },
  readOnlyEmpty: { color: theme.faint },
  // Property-list rows (@Section(propertyList=true))
  propertyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
  propertyRowLabel: { fontSize: 14, color: theme.faint },
  propertyRowValue: { flex: 1, fontSize: 14, color: theme.ink, fontWeight: '500', textAlign: 'right' },
  // Bulleted list field (@BulletedList)
  bulletedField: { gap: 2, paddingVertical: 2 },
  bulletedFieldRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 2 },
  bulletedFieldDot: { color: theme.faint, lineHeight: 20 },
  bulletedFieldText: { flex: 1, color: theme.ink, fontSize: 14, lineHeight: 20 },
  // the top margin keeps an outlined field's floating label clear of a tight caption above it
  container: { marginTop: 6, marginBottom: 14 },
  containerDense: { marginTop: 2, marginBottom: 6 },
  label: { color: theme.muted, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radiusSm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: theme.white,
    minHeight: 42,
    justifyContent: 'center',
  },
  textarea: { minHeight: 110, textAlignVertical: 'top' },
  placeholder: { color: theme.faint },
  dropdown: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.surface,
    marginTop: 4,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 100,
  },
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.32)' },
  sheetDismiss: { flex: 1 },
  sheet: { maxHeight: '70%', backgroundColor: theme.surface, borderTopLeftRadius: theme.radiusLg, borderTopRightRadius: theme.radiusLg, paddingBottom: 24 },
  sheetHandle: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2, backgroundColor: theme.border, marginTop: 12, marginBottom: 12 },
  sheetTitle: { color: theme.ink, paddingHorizontal: 24, paddingBottom: 8 },
  sheetRow: { minHeight: 56, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sheetRowText: { flex: 1, color: theme.ink, fontSize: 16 },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 14, minHeight: 48, justifyContent: 'center' },
  gridBox: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, overflow: 'hidden' },
  gridRow: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.divider },
  gridRowAlt: { backgroundColor: theme.background },
  gridHeader: { backgroundColor: theme.divider },
  gridHeaderText: { fontWeight: '600', color: theme.ink },
  gridCell: { flex: 1, fontSize: 14, color: theme.ink, paddingHorizontal: 4 },
  gridEmpty: { padding: 12, fontSize: 14, color: theme.faint, fontStyle: 'italic' },
  gridAdd: { padding: 10, alignItems: 'center' },
  gridAddText: { color: theme.primary, fontWeight: '600', fontSize: 14 },
  rowFormBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  rowFormCard: { backgroundColor: theme.surface, borderRadius: theme.radiusLg, padding: 24, maxHeight: '80%' },
  rowFormButtons: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  rowFormButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border },
  rowFormSave: { backgroundColor: theme.primary, borderColor: theme.primary },
  rowFormSaveText: { color: theme.onFill, fontWeight: '600' },
  rowFormDelete: { borderColor: theme.danger },
  rowFormDeleteText: { color: theme.danger },
}));
