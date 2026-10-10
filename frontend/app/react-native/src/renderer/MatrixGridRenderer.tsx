import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useViewController } from './MateuViewHost';
import { theme } from '../theme';
import { buttonA11y } from '../a11y/a11y';
import {
  cellA11yLabel, cellParameters, cellTone, groupHeaders, initialCollapsed, isActionableLink, matrixLines,
  shouldCommit, toggleSection, type MatrixColumnMeta, type MatrixGridMeta, type MatrixRowMeta, type Tone,
} from './matrixGrid';

const CELL_W = 72;
const LABEL_W = 140;
const LINE_H = 36;

const TONE_BG: Record<Tone, string> = {
  info: theme.infoBg, success: theme.successBg, warning: theme.warningBg, danger: theme.dangerBg, neutral: theme.background,
};
const TONE_INK: Record<Tone, string> = {
  info: theme.info, success: theme.success, warning: theme.warning, danger: theme.danger, neutral: theme.ink,
};

/**
 * Matrix grid (wire `MatrixGrid`): a FIXED left column with the row labels next to a horizontal
 * ScrollView holding the column headers and the cells — every line has the same fixed height so the
 * two halves stay aligned. Flattening, spans, tones and the commit rule live in `matrixGrid.ts`.
 *
 * Section collapse is client-side state. A `link` cell dispatches `cellActionId` like a Button
 * (`controller.runAction(id, { _rowId, _columnId, _value })`); a cell of an `editable` row turns
 * into a TextInput on tap (on LONG press when it is also a link) and commits on submit/blur through
 * `editActionId` — unchanged values dispatch nothing. The committed value is shown locally until the
 * server re-renders the grid.
 */
export function MatrixGridRenderer({ metadata }: { metadata: Record<string, unknown> }) {
  const controller = useViewController();
  const meta = metadata as MatrixGridMeta;
  const columns = meta.columns ?? [];
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => initialCollapsed(meta));
  const [overrides, setOverrides] = React.useState<Record<string, string>>({});
  const [editing, setEditing] = React.useState<{ key: string; text: string } | null>(null);
  const committing = React.useRef(false);

  // A new grid from the server is the truth again: drop the local overrides and the open editor.
  React.useEffect(() => {
    setCollapsed(initialCollapsed(meta));
    setOverrides({});
    setEditing(null);
  }, [metadata]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = groupHeaders(columns);
  const lines = matrixLines(meta, collapsed);
  const cellKey = (row: MatrixRowMeta, column: MatrixColumnMeta) => `${row.id ?? ''}::${column.id ?? ''}`;

  const commit = (row: MatrixRowMeta, column: MatrixColumnMeta, previous: string, next: string) => {
    if (committing.current) return; // submit is followed by blur: one commit only
    committing.current = true;
    setEditing(null);
    if (shouldCommit(meta, previous, next)) {
      setOverrides((prev) => ({ ...prev, [cellKey(row, column)]: next }));
      void controller.runAction(meta.editActionId!, { ...cellParameters(row, column, next) });
    }
    setTimeout(() => { committing.current = false; }, 0);
  };

  const header = (text: string, width: number, key: string) => (
    <View key={key} style={[styles.headerCell, { width }]}>
      <Text accessibilityRole="header" numberOfLines={1} style={styles.headerText}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.grid}>
      {/* Fixed left column: row header + row labels / section toggles */}
      <View style={{ width: LABEL_W }}>
        {groups.length > 0 && <View style={[styles.headerCell, { width: LABEL_W }]} />}
        {header(meta.rowHeaderLabel ?? '', LABEL_W, 'rowHeader')}
        {lines.map((line) => line.kind === 'section' ? (
          <TouchableOpacity
            key={line.key}
            {...buttonA11y({ label: line.title, expanded: !line.collapsed })}
            style={[styles.line, styles.section]}
            onPress={() => setCollapsed((prev) => toggleSection(prev, line.key))}
          >
            <Text numberOfLines={1} style={styles.sectionText}>{line.collapsed ? '▸' : '▾'} {line.title}</Text>
          </TouchableOpacity>
        ) : (
          <View key={line.key} style={[styles.line, styles.label]}>
            <Text numberOfLines={1} style={[styles.labelText, line.row.emphasis && styles.bold]}>{line.row.label ?? ''}</Text>
          </View>
        ))}
      </View>

      {/* Scrollable cells */}
      <ScrollView horizontal style={{ flex: 1 }}>
        <View>
          {groups.length > 0 && (
            <View style={styles.rowFlex}>
              {groups.map((g) => header(g.label, g.span * CELL_W, `g${g.start}`))}
            </View>
          )}
          <View style={styles.rowFlex}>
            {columns.map((c, i) => {
              const tone = cellTone(undefined, c);
              return (
                <View key={c.id ?? i} style={[styles.headerCell, { width: CELL_W }, tone && { backgroundColor: TONE_BG[tone] }]}>
                  <Text accessibilityRole="header" numberOfLines={1} style={styles.headerText}>{c.label ?? ''}</Text>
                </View>
              );
            })}
          </View>
          {lines.map((line) => {
            if (line.kind === 'section') return <View key={line.key} style={[styles.line, styles.section, { width: columns.length * CELL_W }]} />;
            const row = line.row;
            return (
              <View key={line.key} style={styles.rowFlex}>
                {columns.map((column, i) => {
                  const cell = row.cells?.[i];
                  const key = cellKey(row, column);
                  const value = overrides[key] ?? cell?.value ?? '';
                  const tone = cellTone(cell, column);
                  const link = isActionableLink(meta, cell);
                  const toneStyle = tone && { backgroundColor: TONE_BG[tone] };
                  const label = cellA11yLabel(row, column, value);
                  if (editing?.key === key) {
                    return (
                      <View key={key} style={[styles.line, styles.cell, toneStyle]}>
                        <TextInput
                          autoFocus
                          accessibilityLabel={`${row.label ?? ''}, ${column.label ?? ''}`}
                          value={editing.text}
                          onChangeText={(text) => setEditing({ key, text })}
                          onSubmitEditing={() => commit(row, column, value, editing.text)}
                          onBlur={() => commit(row, column, value, editing.text)}
                          returnKeyType="done"
                          style={styles.input}
                        />
                      </View>
                    );
                  }
                  const edit = row.editable ? () => setEditing({ key, text: value }) : undefined;
                  const textStyle = [
                    styles.cellText,
                    row.emphasis && styles.bold,
                    tone && cell?.tone ? { color: TONE_INK[tone] } : null,
                    link && styles.link,
                  ];
                  if (link || edit) {
                    return (
                      <TouchableOpacity
                        key={key}
                        {...buttonA11y({
                          label,
                          role: link ? 'link' : 'button',
                          hint: link && edit ? 'Long press to edit' : edit ? 'Edit' : undefined,
                        })}
                        style={[styles.line, styles.cell, toneStyle]}
                        onPress={link
                          ? () => void controller.runAction(meta.cellActionId!, { ...cellParameters(row, column, value) })
                          : edit}
                        onLongPress={link ? edit : undefined}
                      >
                        <Text numberOfLines={1} style={textStyle}>{value}</Text>
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <View key={key} accessible accessibilityLabel={label} style={[styles.line, styles.cell, toneStyle]}>
                      <Text numberOfLines={1} style={textStyle}>{value}</Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, borderRadius: theme.radiusSm,
    overflow: 'hidden', backgroundColor: theme.white,
  },
  rowFlex: { flexDirection: 'row' },
  headerCell: {
    height: LINE_H, justifyContent: 'center', paddingHorizontal: 6, backgroundColor: theme.background,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider,
  },
  headerText: { fontSize: 12, fontWeight: '700', color: theme.muted, textAlign: 'center' },
  line: { height: LINE_H, justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  section: { backgroundColor: theme.background, paddingHorizontal: 8 },
  sectionText: { fontSize: 13, fontWeight: '700', color: theme.ink },
  label: { paddingHorizontal: 8, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: theme.divider },
  labelText: { fontSize: 13, color: theme.ink },
  cell: { width: CELL_W, paddingHorizontal: 4 },
  cellText: { fontSize: 13, color: theme.ink, textAlign: 'right' },
  bold: { fontWeight: '700' },
  link: { color: theme.info, textDecorationLine: 'underline' },
  input: {
    height: LINE_H - 8, borderWidth: 1, borderColor: theme.info, borderRadius: theme.radiusSm, paddingHorizontal: 4,
    fontSize: 13, textAlign: 'right', color: theme.ink,
  },
});
