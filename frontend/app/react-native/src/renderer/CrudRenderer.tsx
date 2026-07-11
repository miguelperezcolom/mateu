import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useViewController } from './MateuViewHost';
import { DateField } from './DateField';
import { FormFieldRenderer, GridRowForm } from './FormFieldRenderer';

interface FilterFieldMeta {
  fieldId: string;
  label?: string;
  dataType?: string;
  stereotype?: string;
  options?: { value: string; label: string }[];
}

interface ColumnMeta {
  id?: string;
  fieldId?: string;
  label?: string;
  metadata?: { id?: string; label?: string };
}

interface ButtonDto {
  id?: string;
  label?: string;
  buttonStyle?: string;
}

interface Props {
  component: Record<string, unknown>;
  metadata: Record<string, unknown>;
  state: Record<string, unknown>;
  data: unknown;
}

function normalizeCrudData(data: unknown): unknown {
  const d = data as Record<string, unknown> | null;
  const page = (d?.['crud'] as Record<string, unknown> | undefined)?.['page'];
  return page ?? data;
}

function extractRows(data: unknown): Record<string, unknown>[] {
  if (!data) return [];
  const d = data as Record<string, unknown>;
  const content = d['content'] ?? data;
  if (Array.isArray(content)) return content as Record<string, unknown>[];
  return [];
}

function extractRowId(row: Record<string, unknown>): string {
  for (const f of ['id', '_id', 'key', 'uuid']) {
    if (row[f] != null) return String(row[f]);
  }
  return '';
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    return String(v['message'] ?? v['value'] ?? JSON.stringify(value));
  }
  return String(value);
}

export function CrudRenderer({ component, metadata, state, data }: Props) {
  const controller = useViewController();

  const title = (metadata['title'] as string) ?? '';
  const subtitle = (metadata['subtitle'] as string) ?? '';
  const searchable = Boolean(metadata['searchable']);
  const columns = (metadata['columns'] as ColumnMeta[]) ?? [];
  const toolbar = (metadata['toolbar'] as ButtonDto[]) ?? [];

  // Live listing data: seeded from the initial fragment, refreshed by every data-only
  // fragment (search/pagination responses) through the registered data handler.
  const [liveData, setLiveData] = useState<unknown>(data);
  useEffect(() => {
    const id = (component['id'] as string) || 'crud';
    controller.registerDataHandler(id, (d) => setLiveData(normalizeCrudData(d)));
    controller.registerDataHandler('crud', (d) => setLiveData(normalizeCrudData(d)));
  }, [component, controller]);

  const rawRows = extractRows(liveData);
  const d = liveData as Record<string, unknown> | undefined;
  const totalElements = Number(d?.['totalElements'] ?? rawRows.length);
  const pageSize = Number(d?.['pageSize'] ?? rawRows.length) || rawRows.length;
  const pageNumber = Number(d?.['pageNumber'] ?? 0);
  const totalPages = pageSize > 0 ? Math.ceil(totalElements / pageSize) : 1;

  const [searchText, setSearchText] = useState('');
  const filters = (metadata['filters'] as FilterFieldMeta[]) ?? [];
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = Object.values(filterValues).filter(
    (v) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
  ).length;

  const doSearch = (values?: Record<string, unknown>) => {
    controller.seedSearchState();
    controller.currentComponentState['searchText'] = searchText;
    controller.currentComponentState['page'] = 0;
    for (const [k, v] of Object.entries(values ?? filterValues)) {
      if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) {
        delete controller.currentComponentState[k];
      } else {
        controller.currentComponentState[k] = v;
      }
    }
    void controller.runAction('search');
  };

  const clearFilters = () => {
    for (const k of Object.keys(filterValues)) delete controller.currentComponentState[k];
    setFilterValues({});
    doSearch({});
  };

  // Pagination is a SEARCH with the new page in the component state (the same idiom the web
  // renderer and toggleSort use) — there is no nextPage/prevPage server action.
  const changePage = (delta: number) => {
    controller.seedSearchState();
    const current = Number(controller.currentComponentState['page'] ?? 0);
    controller.currentComponentState['page'] = Math.max(0, current + delta);
    void controller.runAction('search');
  };

  // Sorting: header tap cycles ascending → descending → none; state shape is
  // sort=[{field, direction:'ascending'|'descending'}] (Pageable.sort on the wire).
  const [sortState, setSortState] = useState<{ field: string; direction: 'ascending' | 'descending' } | null>(null);
  const toggleSort = (field: string) => {
    const next =
      sortState?.field !== field
        ? ({ field, direction: 'ascending' } as const)
        : sortState.direction === 'ascending'
          ? ({ field, direction: 'descending' } as const)
          : null;
    setSortState(next);
    controller.seedSearchState();
    controller.currentComponentState['sort'] = next ? [next] : [];
    controller.currentComponentState['page'] = 0;
    void controller.runAction('search');
  };
  const sortMark = (field: string) =>
    sortState?.field === field ? (sortState.direction === 'ascending' ? ' ▲' : ' ▼') : '';

  // Inline editing (@InlineEditing): rows with editable columns get a pencil opening a row form;
  // saving dispatches the crud's update-row with the edited row (the web's cell-commit contract).
  const editableCols = columns.filter((c) => (c.metadata as Record<string, unknown> | undefined)?.['editable'] === true);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const saveEditedRow = async (row: Record<string, unknown>) => {
    setEditingRow(null);
    await controller.runAction('update-row', { _editedRow: { ...editingRow, ...row } });
    doSearch();
  };

  // Row press → the row LINK action (e.g. "view"); without one, the row's first
  // group action (its primary — e.g. "Check-in"). The state-only _route response
  // then drives the detail navigation (a pushed screen via the detail opener).
  const linkActionId =
    columns.map((c) => (c.metadata as Record<string, unknown> | undefined)?.['actionId'] as string | undefined)
      .find((a) => !!a) ?? '';
  const firstRowAction = (row: Record<string, unknown>): string => {
    for (const col of columns) {
      const cm = (col.metadata ?? {}) as Record<string, unknown>;
      const dataType = String(cm['dataType'] ?? '');
      if (dataType === 'actionGroup' || dataType === 'menu' || dataType === 'action') {
        const cell = row[String(cm['id'] ?? '')] as Record<string, unknown> | undefined;
        const actions = (cell?.['actions'] as Record<string, unknown>[]) ?? [];
        const method = actions[0]?.['methodNameInCrud'];
        if (method) return `action-on-row-${method}`;
      }
    }
    return '';
  };
  const handleRowPress = (row: Record<string, unknown>) => {
    if (linkActionId) {
      void controller.runAction(linkActionId, { ...row });
      return;
    }
    const fallback = firstRowAction(row);
    if (fallback) void controller.runAction(fallback, { _clickedRow: row });
  };

  const gridLayout = String(metadata['gridLayout'] ?? 'auto');

  const colDefs = columns
    .map((col) => {
      const cm = (col.metadata ?? {}) as Record<string, unknown>;
      return {
        fieldId: (cm['id'] as string) ?? col.id ?? col.fieldId ?? '',
        label: (cm['label'] as string) ?? col.label ?? col.id ?? '',
        dataType: (cm['dataType'] as string) ?? '',
        sortable: cm['sortable'] === true,
        sortingProperty: (cm['sortingProperty'] as string) ?? '',
      };
    })
    .filter((c) => c.dataType !== 'actionGroup' && c.dataType !== 'menu' && c.dataType !== 'action');

  return (
    <View style={styles.root}>
      {(!!title || !!subtitle || toolbar.length > 0) && (
        <View style={styles.header}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {toolbar.length > 0 && (
            <View style={styles.toolbar}>
              {toolbar.map((btn, i) => {
                const id = btn.id ?? '';
                const isPrimary = btn.buttonStyle?.toLowerCase() === 'primary';
                return (
                  <TouchableOpacity key={i} style={isPrimary ? styles.btnPrimary : styles.btnDefault} onPress={() => void controller.runAction(id)}>
                    <Text style={isPrimary ? styles.btnPrimaryText : styles.btnDefaultText}>{btn.label ?? id}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {searchable && (
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search..."
            onSubmitEditing={() => doSearch()}
            returnKeyType="search"
          />
          {filters.length > 0 && (
            <TouchableOpacity style={styles.btnDefault} onPress={() => setFiltersOpen(!filtersOpen)}>
              <Text style={styles.btnDefaultText}>
                Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnPrimary} onPress={() => doSearch()}>
            <Text style={styles.btnPrimaryText}>Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {filtersOpen && filters.length > 0 && (
        <FilterPanel
          filters={filters}
          values={filterValues}
          onChange={setFilterValues}
          onApply={() => { setFiltersOpen(false); doSearch(); }}
          onClear={() => { setFiltersOpen(false); clearFilters(); }}
        />
      )}

      {rawRows.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🗂</Text>
          <Text style={styles.emptyStateText}>{(metadata['emptyStateMessage'] as string) || 'No data'}</Text>
        </View>
      ) : gridLayout === 'cards' ? (
        // Cards: one card per row — the mobile-first layout
        <FlatList
          data={rawRows}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.cardRow} onPress={() => handleRowPress(item)}>
              {editableCols.length > 0 && (
                <TouchableOpacity style={styles.editPencilCard} onPress={() => setEditingRow(item)}>
                  <Text style={styles.editPencilText}>✎</Text>
                </TouchableOpacity>
              )}
              {colDefs.map((col, i) => (
                <View key={col.fieldId} style={styles.cardLine}>
                  {i > 0 && <Text style={styles.cardLabel}>{col.label}</Text>}
                  <Text style={i === 0 ? styles.cardPrimary : styles.cardValue} numberOfLines={2}>
                    {cellText(item[col.fieldId])}
                  </Text>
                </View>
              ))}
            </TouchableOpacity>
          )}
        />
      ) : gridLayout === 'list' ? (
        // List: compact single-line rows (first column primary, the rest secondary)
        <FlatList
          data={rawRows}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listRow} onPress={() => handleRowPress(item)}>
              <Text style={styles.cardPrimary} numberOfLines={1}>{cellText(item[colDefs[0]?.fieldId ?? ''])}</Text>
              <Text style={styles.listSecondary} numberOfLines={1}>
                {colDefs.slice(1).map((c) => cellText(item[c.fieldId])).filter(Boolean).join(' · ')}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : gridLayout === 'tree' ? (
        // Tree: hierarchical rows carrying a self-referential `children` list
        <ScrollView>
          <TreeRows rows={rawRows} colDefs={colDefs} depth={0} onPress={handleRowPress} />
        </ScrollView>
      ) : (
        <ScrollView horizontal>
          <View>
            {/* Table header — tapping a sortable column cycles the sort */}
            <View style={styles.tableHeader}>
              {colDefs.map((col) => (
                <TouchableOpacity
                  key={col.fieldId}
                  style={styles.headerCell}
                  disabled={!col.sortable}
                  onPress={() => toggleSort(col.sortingProperty || col.fieldId)}
                >
                  <Text style={styles.headerText}>
                    {col.label}
                    {sortMark(col.sortingProperty || col.fieldId)}
                  </Text>
                </TouchableOpacity>
              ))}
              {editableCols.length > 0 && <View style={styles.editHeaderCell} />}
            </View>

            {/* Rows: tapping one opens its detail (link action / primary row action). */}
            <FlatList
              data={rawRows}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.tableRow} onPress={() => handleRowPress(item)}>
                  {colDefs.map((col) => (
                    <View key={col.fieldId} style={styles.cell}>
                      <Text style={styles.cellText} numberOfLines={2}>{cellText(item[col.fieldId])}</Text>
                    </View>
                  ))}
                  {editableCols.length > 0 && (
                    <TouchableOpacity style={styles.editPencilCell} onPress={() => setEditingRow(item)}>
                      <Text style={styles.editPencilText}>✎</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>
      )}

      {editingRow && (
        <GridRowForm
          columns={editableCols.map((c) => {
            const cm = (c.metadata ?? {}) as Record<string, unknown>;
            return {
              id: String(cm['id'] ?? ''),
              label: (cm['label'] as string) ?? '',
              dataType: (cm['dataType'] as string) ?? '',
              editorType: cm['editorType'] as string | null,
              editorOptions: cm['editorOptions'] as { value: string; label: string }[] | null,
            };
          })}
          row={editingRow}
          isNew={false}
          onSave={(row) => void saveEditedRow(row)}
          onDelete={() => setEditingRow(null)}
          onCancel={() => setEditingRow(null)}
        />
      )}

      {totalElements > pageSize && pageSize > 0 && (
        <View style={styles.paginationBar}>
          <TouchableOpacity
            style={[styles.btnDefault, pageNumber <= 0 && styles.btnDisabled]}
            onPress={() => pageNumber > 0 && changePage(-1)}
            disabled={pageNumber <= 0}
          >
            <Text style={styles.btnDefaultText}>← Prev</Text>
          </TouchableOpacity>
          <Text style={styles.paginationInfo}>
            Page {pageNumber + 1} / {totalPages} ({totalElements} total)
          </Text>
          <TouchableOpacity
            style={[styles.btnDefault, (pageNumber + 1) * pageSize >= totalElements && styles.btnDisabled]}
            onPress={() => (pageNumber + 1) * pageSize < totalElements && changePage(1)}
            disabled={(pageNumber + 1) * pageSize >= totalElements}
          >
            <Text style={styles.btnDefaultText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/** Hierarchical rows (GridLayout.tree): indentation + expand carets; the caret is its own tap
 *  target so selectable group rows can still expand (same rule as the tree select). */
function TreeRows({ rows, colDefs, depth, onPress }: {
  rows: Record<string, unknown>[];
  colDefs: { fieldId: string; label: string }[];
  depth: number;
  onPress: (row: Record<string, unknown>) => void;
}) {
  const [openRows, setOpenRows] = useState<number[]>([]);
  return (
    <View>
      {rows.map((row, i) => {
        const children = Array.isArray(row['children']) ? (row['children'] as Record<string, unknown>[]) : [];
        const open = openRows.includes(i);
        return (
          <View key={i}>
            <View style={[styles.listRow, { paddingLeft: 12 + depth * 20, flexDirection: 'row', alignItems: 'center' }]}>
              {children.length > 0 ? (
                <TouchableOpacity
                  style={styles.treeCaret}
                  onPress={() => setOpenRows(open ? openRows.filter((n) => n !== i) : [...openRows, i])}
                >
                  <Text>{open ? '▾' : '▸'}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.treeCaret} />
              )}
              <TouchableOpacity style={{ flex: 1 }} onPress={() => onPress(row)}>
                <Text style={styles.cardPrimary} numberOfLines={1}>
                  {String(row[colDefs[0]?.fieldId ?? ''] ?? '')}
                </Text>
              </TouchableOpacity>
            </View>
            {open && children.length > 0 && (
              <TreeRows rows={children} colDefs={colDefs} depth={depth + 1} onPress={onPress} />
            )}
          </View>
        );
      })}
    </View>
  );
}

/** Filter widgets under the search bar. Range stereotypes (dateRange/numberRange) write the
 *  crud's `<field>_from`/`<field>_to` state keys; multiSelect writes a value list; everything
 *  else reuses the standard form field widgets against the local filter-values map. */
function FilterPanel({ filters, values, onChange, onApply, onClear }: {
  filters: FilterFieldMeta[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const set = (key: string, value: unknown) => onChange({ ...values, [key]: value });

  return (
    <View style={styles.filterPanel}>
      {filters.map((f) => {
        const stereotype = f.stereotype ?? '';
        if (stereotype === 'dateRange' || stereotype === 'numberRange') {
          const isDate = stereotype === 'dateRange';
          return (
            <View key={f.fieldId} style={styles.filterItem}>
              <Text style={styles.filterLabel}>{f.label || f.fieldId}</Text>
              <View style={styles.filterRangeRow}>
                {isDate ? (
                  <>
                    <View style={styles.filterRangeInput}>
                      <DateField
                        value={String(values[`${f.fieldId}_from`] ?? '')}
                        editable
                        placeholder="From"
                        onChange={(v) => set(`${f.fieldId}_from`, v)}
                      />
                    </View>
                    <View style={styles.filterRangeInput}>
                      <DateField
                        value={String(values[`${f.fieldId}_to`] ?? '')}
                        editable
                        placeholder="To"
                        onChange={(v) => set(`${f.fieldId}_to`, v)}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <TextInput
                      style={[styles.searchInput, styles.filterRangeInput]}
                      value={String(values[`${f.fieldId}_from`] ?? '')}
                      onChangeText={(v) => set(`${f.fieldId}_from`, v)}
                      placeholder="From"
                      keyboardType="decimal-pad"
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={[styles.searchInput, styles.filterRangeInput]}
                      value={String(values[`${f.fieldId}_to`] ?? '')}
                      onChangeText={(v) => set(`${f.fieldId}_to`, v)}
                      placeholder="To"
                      keyboardType="decimal-pad"
                      autoCapitalize="none"
                    />
                  </>
                )}
              </View>
            </View>
          );
        }
        if (stereotype === 'multiSelect') {
          const selected = Array.isArray(values[f.fieldId]) ? (values[f.fieldId] as string[]) : [];
          return (
            <View key={f.fieldId} style={styles.filterItem}>
              <Text style={styles.filterLabel}>{f.label || f.fieldId}</Text>
              <View style={styles.filterChips}>
                {(f.options ?? []).map((opt) => {
                  const on = selected.includes(opt.value);
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.filterChip, on && styles.filterChipOn]}
                      onPress={() =>
                        set(f.fieldId, on ? selected.filter((v) => v !== opt.value) : [...selected, opt.value])
                      }
                    >
                      <Text style={on ? styles.filterChipOnText : styles.btnDefaultText}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        }
        return (
          <FormFieldRenderer
            key={f.fieldId}
            metadata={f as never}
            state={values}
            onStateChange={set}
          />
        );
      })}
      <View style={styles.filterButtons}>
        <TouchableOpacity style={styles.btnDefault} onPress={onClear}>
          <Text style={styles.btnDefaultText}>Clear filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={onApply}>
          <Text style={styles.btnPrimaryText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CELL_WIDTH = 140;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 20, fontWeight: '600', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  searchBar: { flexDirection: 'row', padding: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f5f5f5', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  headerCell: { width: CELL_WIDTH, padding: 10 },
  headerText: { fontWeight: '600', fontSize: 13, color: '#333' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  cell: { width: CELL_WIDTH, padding: 10, justifyContent: 'center' },
  cellText: { fontSize: 13, color: '#444' },
  actionCell: { width: 80 },
  paginationBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', gap: 12 },
  paginationInfo: { flex: 1, textAlign: 'center', fontSize: 12, color: '#666' },
  btnPrimary: { backgroundColor: '#0070f3', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  btnDefault: { backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc' },
  btnDefaultText: { color: '#333', fontSize: 13 },
  btnDisabled: { opacity: 0.4 },
  filterPanel: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fafafa' },
  filterItem: { marginBottom: 12 },
  filterLabel: { fontSize: 12, color: '#555', marginBottom: 4, fontWeight: '500' },
  filterRangeRow: { flexDirection: 'row', gap: 8 },
  filterRangeInput: { flex: 1 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  filterChipOn: { backgroundColor: '#0070f3', borderColor: '#0070f3' },
  filterChipOnText: { color: '#fff', fontSize: 13 },
  filterButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  emptyState: { alignItems: 'center', padding: 32 },
  emptyStateIcon: { fontSize: 32, marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#888' },
  cardRow: { margin: 8, marginBottom: 0, padding: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, backgroundColor: '#fff' },
  cardLine: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  cardLabel: { fontSize: 11, color: '#888', minWidth: 90 },
  cardPrimary: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  cardValue: { fontSize: 13, color: '#444', flex: 1 },
  listRow: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  listSecondary: { fontSize: 12, color: '#888', marginTop: 2 },
  treeCaret: { width: 24, alignItems: 'center' },
  editHeaderCell: { width: 44 },
  editPencilCell: { width: 44, alignItems: 'center', justifyContent: 'center' },
  editPencilCard: { position: 'absolute', top: 8, right: 8, zIndex: 2, padding: 4 },
  editPencilText: { fontSize: 16, color: '#0070f3' },
});
