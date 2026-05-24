import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppContext } from '../context/AppContext';

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
  const { runAction, currentRoute, currentConsumedRoute, currentServerSideType, navigate } = useAppContext();

  const title = (metadata['title'] as string) ?? '';
  const subtitle = (metadata['subtitle'] as string) ?? '';
  const canEdit = Boolean(metadata['canEdit']);
  const searchable = Boolean(metadata['searchable']);
  const detailPath = (metadata['detailPath'] as string) ?? '';
  const columns = (metadata['columns'] as ColumnMeta[]) ?? [];
  const toolbar = (metadata['toolbar'] as ButtonDto[]) ?? [];

  const rawRows = extractRows(data);
  const d = data as Record<string, unknown> | undefined;
  const totalElements = Number(d?.['totalElements'] ?? rawRows.length);
  const pageSize = Number(d?.['pageSize'] ?? rawRows.length) || rawRows.length;
  const pageNumber = Number(d?.['pageNumber'] ?? 0);
  const totalPages = pageSize > 0 ? Math.ceil(totalElements / pageSize) : 1;

  const [searchText, setSearchText] = useState('');
  const [componentState, setComponentState] = useState<Record<string, unknown>>(state ?? {});

  const doSearch = async () => {
    const s = { ...componentState, searchText, page: 0, size: 10, sort: [] };
    setComponentState(s);
    await runAction('search', s);
  };

  const handleRowPress = (row: Record<string, unknown>) => {
    const rowId = extractRowId(row);
    const route = detailPath || `${currentRoute}/${rowId}`;
    navigate(route, currentConsumedRoute, currentServerSideType);
  };

  const colDefs = columns.map((col) => ({
    fieldId: col.metadata?.id ?? col.id ?? col.fieldId ?? '',
    label: col.metadata?.label ?? col.label ?? col.id ?? '',
  }));

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
                  <TouchableOpacity key={i} style={isPrimary ? styles.btnPrimary : styles.btnDefault} onPress={() => runAction(id)}>
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
            onSubmitEditing={doSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.btnPrimary} onPress={doSearch}>
            <Text style={styles.btnPrimaryText}>Search</Text>
          </TouchableOpacity>
        </View>
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
            {(!!detailPath || canEdit) && (
              <View style={[styles.headerCell, styles.actionCell]}>
                <Text style={styles.headerText}>Actions</Text>
              </View>
            )}
          </View>

          {/* Rows */}
          <FlatList
            data={rawRows}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                {colDefs.map((col) => (
                  <View key={col.fieldId} style={styles.cell}>
                    <Text style={styles.cellText} numberOfLines={2}>{cellText(item[col.fieldId])}</Text>
                  </View>
                ))}
                {(!!detailPath || canEdit) && (
                  <View style={[styles.cell, styles.actionCell]}>
                    <TouchableOpacity style={styles.btnDefault} onPress={() => handleRowPress(item)}>
                      <Text style={styles.btnDefaultText}>{canEdit ? 'Edit' : 'View'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      </ScrollView>

      {totalElements > pageSize && pageSize > 0 && (
        <View style={styles.paginationBar}>
          <TouchableOpacity
            style={[styles.btnDefault, pageNumber <= 0 && styles.btnDisabled]}
            onPress={() => pageNumber > 0 && runAction('prevPage')}
            disabled={pageNumber <= 0}
          >
            <Text style={styles.btnDefaultText}>← Prev</Text>
          </TouchableOpacity>
          <Text style={styles.paginationInfo}>
            Page {pageNumber + 1} / {totalPages} ({totalElements} total)
          </Text>
          <TouchableOpacity
            style={[styles.btnDefault, (pageNumber + 1) * pageSize >= totalElements && styles.btnDisabled]}
            onPress={() => (pageNumber + 1) * pageSize < totalElements && runAction('nextPage')}
            disabled={(pageNumber + 1) * pageSize >= totalElements}
          >
            <Text style={styles.btnDefaultText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
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
});
