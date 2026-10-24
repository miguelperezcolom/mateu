import React from 'react';
import { StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '../ui/Text';
import { useViewController } from './MateuViewHost';
import { theme, themed } from '../theme';
import { buttonA11y, headingA11y } from '../a11y/a11y';
import {
  CUSTOM, initialPicks, mergeParameters, mergeSummary, mergedValue, pickLabel, summaryText, valueText, visibleFields,
  type MergeFieldMeta, type MergePicks, type RecordMergeMeta,
} from './recordMerge';

/**
 * Compare and merge (`RecordMerge`). On a phone the records-as-columns table of the web does not
 * fit, so each FIELD is a card: its label (+ a "differs" badge), one radio row per record value
 * ("Use value from Profile 1021 for Email") and, for an editable field, a "Custom" input. Then a
 * "Show only differences" switch, the resulting record, a summary and the merge button, which
 * dispatches `mergeActionId` with `_merged` / `_choices` — the same parameters as the web.
 */
export function RecordMergeRenderer({ metadata }: { metadata: Record<string, unknown> }) {
  const controller = useViewController();
  const merge = metadata as RecordMergeMeta;
  const [picks, setPicks] = React.useState<MergePicks>(() => initialPicks(merge));
  const [custom, setCustom] = React.useState<Record<string, string>>({});
  const [differencesOnly, setDifferencesOnly] = React.useState(!!merge.differencesOnly);

  // a new merge from the server (another pair of records) starts over
  React.useEffect(() => {
    setPicks(initialPicks(merge));
    setCustom({});
    setDifferencesOnly(!!merge.differencesOnly);
  }, [metadata]); // eslint-disable-line react-hooks/exhaustive-deps

  const records = merge.records ?? [];
  const recordLabel = (id: string | undefined) => (id === CUSTOM ? 'Custom' : records.find((r) => r.id === id)?.label ?? '');
  const pick = (field: MergeFieldMeta, choice: string) => setPicks((p) => ({ ...p, [field.fieldId]: choice }));

  return (
    <View style={styles.root}>
      {!!merge.title && <Text {...headingA11y(3)} style={styles.title}>{merge.title}</Text>}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Show only differences</Text>
        <Switch
          accessibilityLabel="Show only differences"
          accessibilityRole="switch"
          value={differencesOnly}
          onValueChange={setDifferencesOnly}
        />
      </View>
      {visibleFields(merge, differencesOnly).map((field) => (
        <View key={field.fieldId} style={[styles.card, field.differs && styles.cardDiffers]} accessibilityRole="radiogroup" accessibilityLabel={field.label}>
          <View style={styles.cardHeader}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            {!!field.differs && <Text style={styles.badge}>differs</Text>}
          </View>
          {records.map((record, index) => {
            const text = valueText((field.values ?? [])[index]);
            const checked = picks[field.fieldId] === record.id;
            return (
              <TouchableOpacity
                key={record.id}
                accessibilityRole="radio"
                accessibilityState={{ checked }}
                accessibilityLabel={pickLabel(record.label, field.label)}
                style={styles.option}
                onPress={() => pick(field, record.id)}
              >
                <View style={[styles.radio, checked && styles.radioOn]} />
                <View style={styles.optionBody}>
                  <Text style={[styles.optionValue, !text && styles.empty, checked && styles.picked]}>{text || '(empty)'}</Text>
                  <Text style={styles.optionRecord}>{record.label}{record.caption ? ` · ${record.caption}` : ''}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          {!!field.editable && (
            <View style={styles.option}>
              <TouchableOpacity
                accessibilityRole="radio"
                accessibilityState={{ checked: picks[field.fieldId] === CUSTOM }}
                accessibilityLabel={`Custom value for ${field.label}`}
                hitSlop={theme.hitSlop}
                onPress={() => pick(field, CUSTOM)}
              >
                <View style={[styles.radio, picks[field.fieldId] === CUSTOM && styles.radioOn]} />
              </TouchableOpacity>
              <TextInput
                accessibilityLabel={`Custom value for ${field.label}`}
                placeholder="Custom"
                placeholderTextColor={theme.faint}
                style={styles.input}
                value={custom[field.fieldId] ?? ''}
                onChangeText={(t) => {
                  setCustom((c) => ({ ...c, [field.fieldId]: t }));
                  pick(field, CUSTOM);
                }}
              />
            </View>
          )}
        </View>
      ))}
      <Text {...headingA11y(4)} style={styles.resultTitle}>Result</Text>
      {(merge.fields ?? []).map((field) => {
        const value = valueText(mergedValue(merge, field, picks, custom));
        return (
          <View key={field.fieldId} style={styles.resultRow}>
            <Text style={styles.resultLabel}>{field.label}</Text>
            <Text style={[styles.resultValue, field.differs && styles.picked]}>
              {value || '(empty)'} <Text style={styles.optionRecord}>from {recordLabel(picks[field.fieldId])}</Text>
            </Text>
          </View>
        );
      })}
      <Text style={styles.summary} accessibilityLiveRegion="polite">{summaryText(mergeSummary(merge, picks))}</Text>
      {!!merge.mergeActionId && (
        <TouchableOpacity
          {...buttonA11y({ label: merge.mergeLabel || 'Merge' })}
          style={styles.mergeButton}
          onPress={() => void controller.runAction(merge.mergeActionId!, mergeParameters(merge, picks, custom))}
        >
          <Text style={styles.mergeText}>{merge.mergeLabel || 'Merge'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  root: { gap: 8, paddingVertical: 4 },
  title: { fontSize: 17, fontWeight: '700', color: theme.ink },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: theme.minTouch },
  switchLabel: { color: theme.ink, fontSize: 14 },
  card: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusMd, padding: 10, backgroundColor: theme.white },
  cardDiffers: { borderLeftWidth: 4, borderLeftColor: theme.warning, backgroundColor: theme.warningBg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  fieldLabel: { fontWeight: '700', color: theme.ink, fontSize: 14 },
  badge: { color: theme.warning, fontSize: 11, fontWeight: '600', borderWidth: 1, borderColor: theme.warning, borderRadius: theme.radiusSm, paddingHorizontal: 4 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: theme.minTouch, paddingVertical: 4 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.muted },
  radioOn: { borderColor: theme.primary, backgroundColor: theme.primary },
  optionBody: { flex: 1 },
  optionValue: { color: theme.ink, fontSize: 14 },
  optionRecord: { color: theme.muted, fontSize: 12, fontWeight: '400' },
  empty: { color: theme.faint, fontStyle: 'italic' },
  picked: { fontWeight: '700' },
  input: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, paddingHorizontal: 8, paddingVertical: 6, color: theme.ink, fontSize: 14 },
  resultTitle: { marginTop: 8, fontWeight: '700', color: theme.ink, fontSize: 15 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingVertical: 2 },
  resultLabel: { color: theme.muted, fontSize: 13 },
  resultValue: { color: theme.ink, fontSize: 13, flexShrink: 1, textAlign: 'right' },
  summary: { color: theme.muted, fontSize: 13, marginTop: 4 },
  mergeButton: { backgroundColor: theme.primary, borderRadius: theme.radiusSm, minHeight: theme.minTouch, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 4 },
  mergeText: { color: theme.onPrimary, fontWeight: '700', fontSize: 15 },
}));
