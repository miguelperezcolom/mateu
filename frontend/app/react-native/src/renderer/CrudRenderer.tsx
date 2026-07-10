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
import { FormFieldRenderer } from './FormFieldRenderer';

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

  const changePage = (actionId: 'prevPage' | 'nextPage') => {
    controller.seedSearchState();
    void controller.runAction(actionId);
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

  const colDefs = columns
    .map((col) => {
      const cm = (col.metadata ?? {}) as Record<string, unknown>;
      return {
        fieldId: (cm['id'] as string) ?? col.id ?? col.fieldId ?? '',
        label: (cm['label'] as string) ?? col.label ?? col.id ?? '',
        dataType: (cm['dataType'] as string) ?? '',
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

      <ScrollView horizontal>
        <View>
          {/* Table header */}
          <View style={styles.tableHeader}>
            {colDefs.map((col) => (
              <View key={col.fieldId} style={styles.headerCell}>
                <Text style={styles.headerText}>{col.label}</Text>
              </View>
            ))}
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
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>

      {totalElements > pageSize && pageSize > 0 && (
        <View style={styles.paginationBar}>
          <TouchableOpacity
            style={[styles.btnDefault, pageNumber <= 0 && styles.btnDisabled]}
            onPress={() => pageNumber > 0 && changePage('prevPage')}
            disabled={pageNumber <= 0}
          >
            <Text style={styles.btnDefaultText}>← Prev</Text>
          </TouchableOpacity>
          <Text style={styles.paginationInfo}>
            Page {pageNumber + 1} / {totalPages} ({totalElements} total)
          </Text>
          <TouchableOpacity
            style={[styles.btnDefault, (pageNumber + 1) * pageSize >= totalElements && styles.btnDisabled]}
            onPress={() => (pageNumber + 1) * pageSize < totalElements && changePage('nextPage')}
            disabled={(pageNumber + 1) * pageSize >= totalElements}
          >
            <Text style={styles.btnDefaultText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
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
                <TextInput
                  style={[styles.searchInput, styles.filterRangeInput]}
                  value={String(values[`${f.fieldId}_from`] ?? '')}
                  onChangeText={(v) => set(`${f.fieldId}_from`, v)}
                  placeholder={isDate ? 'From (YYYY-MM-DD)' : 'From'}
                  keyboardType={isDate ? 'default' : 'decimal-pad'}
                  autoCapitalize="none"
                />
                <TextInput
                  style={[styles.searchInput, styles.filterRangeInput]}
                  value={String(values[`${f.fieldId}_to`] ?? '')}
                  onChangeText={(v) => set(`${f.fieldId}_to`, v)}
                  placeholder={isDate ? 'To (YYYY-MM-DD)' : 'To'}
                  keyboardType={isDate ? 'default' : 'decimal-pad'}
                  autoCapitalize="none"
                />
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
  toolbar: { flexDirection: 'row', marginTop: 12, gap: 8 },
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
});
