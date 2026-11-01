import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Text, TextInput } from '../ui/Text';
import { buttonActionId, effectiveListingLayout, rowCheckboxLabel } from '../core/uxRules';
import { splitCreateAction } from '../core/phoneLayout';
import { canMove, dropOn, moveToLabel, zoneLabel, type MountedDropZone } from './dragDrop';
import { useViewController } from './MateuViewHost';
import { SavedView } from './savedViews';
import { interpolate, interpolateUrl } from '../core/expressions';
import { fetchExternalJson, mapItemsToRows } from '../core/restFetch';
import { restListingPage } from '../core/restListing';
import { DateField } from './DateField';
import { FormFieldRenderer, GridRowForm } from './FormFieldRenderer';
import { theme, themed } from '../theme';
import { Button as PaperButton, Card, Chip, Dialog, FAB, IconButton, Portal, Searchbar, Text as PaperText, TextInput as PaperTextInput, TouchableRipple } from 'react-native-paper';
import { MateuButton, SelectBox, StatusChip } from '../ui/controls';
import {
  AggregatableColumn,
  buildAggregateFooters,
  formatAggregateValue,
  GroupRow,
  groupLabelColumnId,
  groupRowCellText,
  interleaveGroupRows,
  isGroupRow,
  ListingData,
} from '../core/listingGroups';
import { buttonA11y } from '../a11y/a11y';
import { cellTooltipText } from './hoverDetails';
import { ComponentRenderer } from './ComponentRenderer';
import { showsPreSearch } from './patternGaps';
import { cellText } from './cellText';
import { useButtonPress } from './useButtonPress';
import { rowOpenLabel, rowOpenOf, rowPressOf, rowRouteFields } from '../core/rowOpen';
import { openExternal } from './openExternal';
import {
  activeFilterCount,
  allRowsSelected,
  applySearchToState,
  columnDefsOf,
  extractListing,
  cellTone,
  firstRowAction as firstRowActionOf,
  listRowModel,
  nextSort,
  normalizeCrudData,
  pagingOf,
  sortMark as sortMarkOf,
  toggledSelection,
  type SortState,
} from './crudListing';
import { flattenColumnGroups } from './columnGroups';

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
  actionId?: string;
  label?: string;
  buttonStyle?: string;
  color?: string | null;
  disabled?: boolean;
}

interface Props {
  component: Record<string, unknown>;
  metadata: Record<string, unknown>;
  state: Record<string, unknown>;
  data: unknown;
}

// The selection checkbox (src/ui/controls SelectBox). RN-04: a SIBLING of the row's own touchable —
// an accessible container swallows its children for VoiceOver/TalkBack, so a nested checkbox could
// never be reached — announced as a checkbox with its state and the row it selects.

export function CrudRenderer({ component, metadata, state, data }: Props) {
  const controller = useViewController();

  const title = (metadata['title'] as string) ?? '';
  const subtitle = (metadata['subtitle'] as string) ?? '';
  const searchable = Boolean(metadata['searchable']);
  // a column group (GridGroupColumn) becomes its columns, headed "Group · Column" (columnGroups.ts)
  const columns = flattenColumnGroups((metadata['columns'] as ColumnMeta[]) ?? []);
  // The listing's create action (`new`) is its screen's primary action: a Material extended FAB
  // ("+ New") instead of one more pill in the action row; the other toolbar buttons stay there.
  const { create: createButton, rest: toolbar } = splitCreateAction((metadata['toolbar'] as ButtonDto[]) ?? []);
  // the FAB floats above the pagination bar (measured), the list scrolls clear of it
  const [paginationHeight, setPaginationHeight] = useState(0);
  const fabClearance = createButton ? { paddingBottom: CREATE_FAB_CLEARANCE } : undefined;

  // Bulk row selection (Crud.rowsSelectionEnabled): the selected ROW OBJECTS live in the
  // component state under crud_selected_items so they travel with every dispatched action
  // (the web's mateu-table-crud contract). A new result set clears the selection.
  // @DragRows: rows can be "dragged" onto a DropZone — on touch, selected and MOVED through a
  // picker of the zones on screen accepting the type (see dragDrop.ts), so selection turns on too.
  const dragType = (metadata['dragType'] as string | null | undefined) ?? null;
  const rowsSelectionEnabled = metadata['rowsSelectionEnabled'] === true || !!dragType;
  const [moveOpen, setMoveOpen] = useState(false);
  const [dropZones, setDropZones] = useState<MountedDropZone[]>([]);
  useEffect(() => {
    if (!dragType) return;
    const refresh = () => setDropZones(controller.session.dropZones.zonesAccepting(dragType));
    refresh();
    return controller.session.dropZones.subscribe(refresh);
  }, [dragType]);
  const [selectedRows, setSelectedRows] = useState<Record<string, unknown>[]>([]);
  const syncSelection = (next: Record<string, unknown>[]) => {
    setSelectedRows(next);
    controller.currentComponentState['crud_selected_items'] = next;
  };

  // Live listing data: seeded from the initial fragment, refreshed by every data-only
  // fragment (search/pagination responses) through the registered data handler.
  const [liveData, setLiveData] = useState<unknown>(data);
  // CrudlDto.preSearch: shown in place of the results until this listing's FIRST search answers;
  // from then on the results (or the normal empty state) replace it for good.
  const [searched, setSearched] = useState(false);
  const preSearch = (metadata['preSearch'] as unknown[] | null | undefined) ?? null;
  useEffect(() => {
    const id = (component['id'] as string) || 'crud';
    const onData = (d: unknown) => {
      setSearched(true);
      setLiveData(normalizeCrudData(d));
      // fresh rows: any previous selection points at stale row objects
      setSelectedRows([]);
      controller.currentComponentState['crud_selected_items'] = [];
    };
    controller.registerDataHandler(id, onData);
    controller.registerDataHandler('crud', onData);
  }, [component, controller]);

  // @RestListing: rows fetched CLIENT-SIDE from an arbitrary REST endpoint instead of the server
  // `search` action. Declarative listings get no server OnLoad trigger, so self-fetch on mount (and
  // when the interpolated url changes); free-text search filters the fetched rows in memory.
  const rowsSource = metadata['rowsSource'] as
    | { url?: string; ref?: string; method?: string; headers?: Record<string, string>; body?: string; itemsPath?: string; proxy?: boolean }
    | undefined;
  // Resolve a catalogue `ref` so the url, itemsPath and proxy flag come from the resolved source.
  const rowsResolved = rowsSource ? (controller.session.sources.resolve(rowsSource as Record<string, unknown>) as typeof rowsSource) : undefined;
  // the columns, plus the fields a column reads beside its own (a primary cell's caption and
  // leading picture, a tooltip): not columns, so a row mapped to the columns alone dropped them
  const columnIds = [...new Set([
    ...columns.map((c) => c.metadata?.id ?? c.id ?? c.fieldId),
    ...columns.flatMap((c) => ['captionPath', 'leadingPath', 'tooltipPath'].map((k) => (c.metadata as Record<string, unknown> | undefined)?.[k])),
    // …and the fields the rowRoute needs (its record id): also what a bulk action on the selected
    // rows reads (`${state.id}` per row)
    ...rowRouteFields(metadata['rowRoute']),
  ].filter((f): f is string => typeof f === 'string' && !!f))];
  const restResolve = (t: unknown): string => interpolate(String(t ?? ''), { state, appState: controller.session.appState });
  const rowsUrl = rowsResolved ? restResolve(rowsResolved.url) : '';
  const [restRows, setRestRows] = useState<Record<string, unknown>[]>([]);
  // The REST listing is fetched WHOLE (RN does not honour totalPath, and a source answered from its
  // SAMPLE cannot honour `${state.page}` either): search, filters, sort and page apply in memory over
  // the component state — the web's mateu-table-crud unpaged path.
  const restPageSize = Number(metadata['pageSize'] ?? 0) || 0;
  const showRestPage = (rows: Record<string, unknown>[]) =>
    setLiveData({
      page: restListingPage(rows, {
        columnIds,
        filters: (metadata['filters'] as FilterFieldMeta[]) ?? [],
        state: controller.currentComponentState,
        pageSize: restPageSize,
      }),
    });
  useEffect(() => {
    if (!rowsSource || !rowsResolved) return;
    let cancelled = false;
    // Proxy mode: route through the Mateu server via __restfetch__ (no CORS, secrets server-side);
    // direct fetch otherwise. Both resolve to the same JSON → mapItemsToRows.
    // A sampled source (sample mode) is never proxied: fetchExternalJson answers it from the sample.
    const jsonPromise = controller.session.sources.viaProxy(rowsSource as Record<string, unknown>)
      ? controller.fetchViaProxy('rows', String(component['id'] ?? 'crud'))
      : fetchExternalJson(rowsSource, restResolve, (t) => interpolateUrl(String(t ?? ''), { state, appState: controller.session.appState }), controller.session.sources);
    jsonPromise
      .then((json) => {
        if (cancelled) return;
        const rows = mapItemsToRows(json, rowsResolved.itemsPath, columnIds) as Record<string, unknown>[];
        setRestRows(rows);
        setSearched(true);
        showRestPage(rows);
      })
      .catch((e) => console.warn('mateu: external rows fetch failed', e));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsUrl]);

  const listing = extractListing<ListingData>(liveData);
  const { rows: rawRows, totalElements, pageSize, pageNumber, totalPages, hasPrevious, hasNext } = pagingOf(liveData);

  const isSelected = (row: Record<string, unknown>) => selectedRows.includes(row);
  const toggleRow = (row: Record<string, unknown>) => syncSelection(toggledSelection(selectedRows, row));
  const allSelected = allRowsSelected(rawRows, selectedRows);
  const toggleAll = () => syncSelection(allSelected ? [] : [...rawRows]);

  const [searchText, setSearchText] = useState('');
  const filters = (metadata['filters'] as FilterFieldMeta[]) ?? [];
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = activeFilterCount(filterValues);

  const doSearch = (values?: Record<string, unknown>, searchTextOverride?: string) => {
    const effectiveSearchText = searchTextOverride ?? searchText;
    // @RestListing: search/filter the client-fetched rows in memory — no server round-trip.
    if (!rowsSource) controller.seedSearchState();
    applySearchToState(controller.currentComponentState, effectiveSearchText, values ?? filterValues);
    if (rowsSource) {
      showRestPage(restRows);
      return;
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
    if (!rowsSource) controller.seedSearchState();
    const current = Number(controller.currentComponentState['page'] ?? 0);
    controller.currentComponentState['page'] = Math.max(0, current + delta);
    if (rowsSource) return showRestPage(restRows);
    void controller.runAction('search');
  };

  // Sorting: header tap cycles ascending → descending → none; state shape is
  // sort=[{field, direction:'ascending'|'descending'}] (Pageable.sort on the wire).
  const [sortState, setSortState] = useState<SortState>(null);
  const toggleSort = (field: string) => {
    const next = nextSort(sortState, field);
    setSortState(next);
    if (!rowsSource) controller.seedSearchState();
    controller.currentComponentState['sort'] = next ? [next] : [];
    controller.currentComponentState['page'] = 0;
    if (rowsSource) return showRestPage(restRows);
    void controller.runAction('search');
  };
  const sortMark = (field: string) => sortMarkOf(sortState, field);

  // Inline editing (@InlineEditing): rows with editable columns get a pencil opening a row form;
  // saving dispatches the crud's update-row with the edited row (the web's cell-commit contract).
  const editableCols = columns.filter((c) => (c.metadata as Record<string, unknown> | undefined)?.['editable'] === true);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(null);
  const saveEditedRow = async (row: Record<string, unknown>) => {
    setEditingRow(null);
    await controller.runAction('update-row', { _editedRow: { ...editingRow, ...row } });
    doSearch();
  };

  // Row press (decision U1, see core/rowOpen): a NAVIGABLE row (rowRoute, or a `view` column)
  // opens its record wherever it is pressed — by route, or by the `view` action whose state-only
  // _route response drives the detail navigation (a pushed screen via the detail opener). The
  // cells with a press of their own (display columns, editors) are their own touchables. A
  // listing that is not navigable keeps the mobile shortcut: the row's first group action (its
  // primary — e.g. "Check-in").
  const rowOpen = rowOpenOf(metadata['rowRoute'], columns.map((c) => (c.metadata ?? {}) as Record<string, unknown>));
  const firstRowAction = (row: Record<string, unknown>): string => firstRowActionOf(columns, row);
  // A toolbar button carrying a `route` (a RouteLink actionable — a YAML "New character") NAVIGATES
  // (useButtonPress, like a form's buttons): its actionId is only the label's echo, which no server
  // claims — and a static UI has no server at all
  const buttonPress = useButtonPress();
  const pressButton = (btn: ButtonDto) =>
    buttonPress(btn as Record<string, unknown>, { state }, () => void controller.runAction(buttonActionId(btn)), btn.label ?? '').onPress();
  const handleRowPress = (row: Record<string, unknown>) => {
    if (rowOpen) {
      const press = rowPressOf(rowOpen, row);
      if (press?.kind === 'url') {
        openExternal(press.url); // refuses anything but http(s)/mailto/tel
      } else if (press?.kind === 'route') {
        // no label: a route is no title (the screen shows its own)
        controller.session.openView({ label: '', route: press.route, consumedRoute: '', serverSideType: '' });
      } else if (press) {
        void controller.runAction(press.actionId, press.parameters);
      }
      return;
    }
    const fallback = firstRowAction(row);
    if (fallback) void controller.runAction(fallback, { _clickedRow: row });
  };
  // A display cell's own press: an editor cell edits the row, a cell with its own action runs it
  // (with the row, like the web's button column); anything else is inert — never the row's open.
  const cellPress = (col: { editable?: boolean; cellAction?: string }, row: Record<string, unknown>) =>
    col.editable ? () => setEditingRow(row)
      : col.cellAction ? () => void controller.runAction(col.cellAction!, { ...row })
        : undefined;
  // the row's accessible name says what it opens; its display cells are offered as custom actions
  // too (the row merges its children into one element, so a screen reader reaches them that way)
  const rowA11y = (row: Record<string, unknown>) => {
    if (!rowOpen) return buttonA11y();
    const cellActions = colDefs.filter((c) => c.display && cellPress(c, row));
    return {
      ...buttonA11y({ label: rowOpenLabel(cellText(row[colDefs[0]?.fieldId ?? ''], colDefs[0]?.valueLabels)) }),
      ...(cellActions.length ? {
        accessibilityActions: [{ name: 'activate' }, ...cellActions.map((c) => ({ name: c.fieldId, label: c.label }))],
        onAccessibilityAction: (e: { nativeEvent: { actionName: string } }) => {
          const name = e.nativeEvent.actionName;
          if (name === 'activate') return handleRowPress(row);
          const col = cellActions.find((c) => c.fieldId === name);
          if (col) cellPress(col, row)?.();
        },
      } : {}),
    };
  };
  /** A cell of a row: a display cell gets its own touchable (or swallows the press when it has
   *  nothing to do), so pressing it never reaches the row's open. */
  const renderDisplayCell = (
    col: { fieldId: string; label: string; editable?: boolean; cellAction?: string },
    row: Record<string, unknown>,
    style: unknown,
    content: React.ReactNode,
  ) => {
    const press = cellPress(col, row);
    return press ? (
      <TouchableOpacity {...buttonA11y({ label: col.editable ? `Edit ${col.label}` : col.label || undefined })}
        key={col.fieldId} style={style as never} onPress={press}>
        {content}
      </TouchableOpacity>
    ) : (
      <View key={col.fieldId} style={style as never} onStartShouldSetResponder={() => true}>{content}</View>
    );
  };

  // RN-14: an undeclared (`auto`) listing is a list on a phone — a sideways-scrolling table cuts
  // the columns at the screen edge. A declared layout is always honoured.
  const { width: windowWidth } = useWindowDimensions();
  const gridLayout = effectiveListingLayout(metadata['gridLayout'] as string | undefined, windowWidth);

  const allColDefs = columnDefsOf(columns, rowOpen);

  // Per-user column personalization (show/hide) — session-scoped (see columnPrefs). The first column
  // (identity / row-open) is protected and never hideable. `colDefs` is what the table actually renders.
  const columnScope = String((metadata['id'] as string) ?? (metadata['title'] as string) ?? '');
  const protectedColId = allColDefs[0]?.fieldId;
  const [hiddenCols, setHiddenCols] = useState<string[]>(() => controller.session.columnPrefs.get(columnScope));
  const [columnsOpen, setColumnsOpen] = useState(false);
  const toggleColumn = (id: string) => {
    const next = hiddenCols.includes(id) ? hiddenCols.filter((x) => x !== id) : [...hiddenCols, id];
    setHiddenCols(next);
    controller.session.columnPrefs.set(columnScope, next);
  };
  const colDefs = allColDefs.filter((c) => !hiddenCols.includes(c.fieldId));

  // Saved views: named snapshots of {searchText + filters}; one may be the default (auto-applied once).
  const [viewsOpen, setViewsOpen] = useState(false);
  const [viewsVersion, setViewsVersion] = useState(0);
  const [newViewName, setNewViewName] = useState('');
  void viewsVersion; // re-reading the (external) store depends on this bumping
  const savedViews = controller.session.savedViews.list(columnScope);
  const applyView = (view: SavedView) => {
    const { searchText: st, ...fv } = view.values as Record<string, unknown>;
    const stStr = st != null ? String(st) : '';
    setSearchText(stStr);
    setFilterValues(fv);
    doSearch(fv, stStr);
    setViewsOpen(false);
  };
  const saveCurrentView = () => {
    const values: Record<string, unknown> = { ...filterValues };
    if (searchText.trim()) values.searchText = searchText.trim();
    controller.session.savedViews.save(columnScope, { name: newViewName, values });
    setNewViewName('');
    setViewsVersion((v) => v + 1);
  };
  const removeView = (name: string) => { controller.session.savedViews.delete(columnScope, name); setViewsVersion((v) => v + 1); };
  const toggleDefaultView = (name: string) => { controller.session.savedViews.setDefault(columnScope, name); setViewsVersion((v) => v + 1); };
  // Auto-apply the default view once, when the screen still has no active conditions.
  const defaultAppliedRef = React.useRef(false);
  useEffect(() => {
    if (defaultAppliedRef.current) return;
    defaultAppliedRef.current = true;
    const dv = controller.session.savedViews.defaultView(columnScope);
    if (dv && Object.keys(filterValues).length === 0 && !searchText) applyView(dv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listing totals + groups (Crud.groupBy / GridColumn.aggregate): rows arrive group-sorted,
  // a group header row is interleaved wherever the groupBy value changes, and a totals footer
  // is pinned at the bottom when there is anything to total (see core/listingGroups.ts).
  const groupBy = (metadata['groupBy'] as string) ?? '';
  const asAggregatable = (c: (typeof colDefs)[number]): AggregatableColumn => ({
    id: c.fieldId,
    dataType: c.dataType,
    stereotype: c.stereotype,
    aggregate: c.aggregate || undefined,
  });
  const labelColumnId = groupLabelColumnId(groupBy, colDefs.map((c) => c.fieldId));
  const displayRows = interleaveGroupRows(rawRows, groupBy, listing.groups);
  const footers = buildAggregateFooters(colDefs.map(asAggregatable), listing, groupBy);
  /** One-line group band for the cards/list layouts: "value (count) · Col: aggregate · …". */
  const groupBandText = (g: GroupRow): string => {
    const parts = [`${g.__mateuGroup.value} (${g.__mateuGroup.count})`];
    for (const c of colDefs) {
      if (c.aggregate && g.__mateuGroup.aggregates?.[c.fieldId] != null) {
        parts.push(`${c.label}: ${formatAggregateValue(g.__mateuGroup.aggregates[c.fieldId], asAggregatable(c))}`);
      }
    }
    return parts.join(' · ');
  };
  /** Totals band for the cards/list layouts, from the same footer texts as the table. */
  const totalsBandText = footers
    ? colDefs
        .filter((c) => footers[c.fieldId] !== undefined)
        .map((c, i) => (i === 0 && !c.aggregate ? footers[c.fieldId] : `${c.label}: ${footers[c.fieldId]}`))
        .join(' · ')
    : '';

  const showMove = canMove(dragType, selectedRows.length) && dropZones.length > 0;
  const moveTo = (zone: MountedDropZone) => {
    setMoveOpen(false);
    if (dragType && dropOn(zone, dragType, selectedRows)) syncSelection([]);
  };

  return (
    <View style={styles.root}>
      {(!!title || !!subtitle || toolbar.length > 0 || showMove) && (
        <View style={styles.header}>
          {!!title && <PaperText variant="headlineSmall" style={styles.title} accessibilityRole="header">{title}</PaperText>}
          {!!subtitle && <PaperText variant="bodyMedium" style={styles.subtitle}>{subtitle}</PaperText>}
          {(toolbar.length > 0 || showMove) && (
            <View style={styles.toolbar}>
              {showMove && (
                <MateuButton label={moveToLabel(selectedRows.length)} icon="folder-move-outline" onPress={() => setMoveOpen(true)} />
              )}
              {toolbar.map((btn, i) => {
                // RN-01: the wire carries the action in `actionId` — reading `id` alone made every
                // crud toolbar button (New, Delete, bulk actions) dispatch nothing.
                const id = buttonActionId(btn);
                // A destructive action (color "error", e.g. Delete) is marked as such, not styled
                // like its harmless neighbours (HIG/Material: destructive actions are distinguishable).
                return (
                  <MateuButton
                    key={i}
                    label={btn.label ?? id}
                    buttonStyle={btn.buttonStyle}
                    color={btn.color}
                    disabled={!!btn.disabled}
                    onPress={() => pressButton(btn)}
                  />
                );
              })}
            </View>
          )}
        </View>
      )}

      {!searchable && (allColDefs.length > 1 || filters.length > 0) && (
        <View style={styles.columnsBar}>
          {filters.length > 0 && (
            <PaperButton mode="text" compact icon="star-outline" accessibilityLabel="Saved views" onPress={() => setViewsOpen(true)}>
              {`Views${savedViews.length ? ` (${savedViews.length})` : ''}`}
            </PaperButton>
          )}
          {allColDefs.length > 1 && (
            <PaperButton mode="text" compact icon="view-column-outline" accessibilityLabel="Choose columns" onPress={() => setColumnsOpen(true)}>
              {`Columns${hiddenCols.length ? ` (${colDefs.length}/${allColDefs.length})` : ''}`}
            </PaperButton>
          )}
        </View>
      )}

      {searchable && (
        <View style={styles.searchBar}>
          {/* the Material search bar: the magnifier (or the keyboard's Search key) runs the search */}
          <Searchbar
            style={styles.searchInput}
            inputStyle={styles.searchInputText}
            value={searchText}
            onChangeText={setSearchText}
            // RN-06: a placeholder is not a name — VoiceOver/TalkBack announced a bare "text field".
            accessibilityLabel={title ? `Search ${title}` : 'Search'}
            accessibilityRole="search"
            placeholder="Search"
            onSubmitEditing={() => doSearch()}
            onIconPress={() => doSearch()}
            searchAccessibilityLabel="Search"
            returnKeyType="search"
            onClearIconPress={() => doSearch(undefined, '')}
          />
          {filters.length > 0 && (
            <View>
              <IconButton
                icon="filter-variant"
                mode={filtersOpen || activeFilters > 0 ? 'contained-tonal' : undefined}
                accessibilityLabel={`Filters${activeFilters > 0 ? ` (${activeFilters} active)` : ''}`}
                accessibilityState={{ expanded: filtersOpen }}
                onPress={() => setFiltersOpen(!filtersOpen)}
              />
              {activeFilters > 0 && <PaperText style={styles.filterCount} importantForAccessibility="no">{activeFilters}</PaperText>}
            </View>
          )}
          {/* saved views and the column chooser sit beside the search bar as icon buttons */}
          {filters.length > 0 && (
            <IconButton icon={savedViews.length ? 'star' : 'star-outline'} accessibilityLabel={`Saved views${savedViews.length ? ` (${savedViews.length})` : ''}`} onPress={() => setViewsOpen(true)} style={styles.searchIcon} />
          )}
          {allColDefs.length > 1 && (
            <IconButton icon="view-column-outline" accessibilityLabel={`Choose columns${hiddenCols.length ? ` (${colDefs.length} of ${allColDefs.length} shown)` : ''}`} onPress={() => setColumnsOpen(true)} style={styles.searchIcon} />
          )}
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

      {showsPreSearch(preSearch, searched) ? (
        <View style={styles.preSearch}>
          {(preSearch ?? []).map((c, i) => (
            <ComponentRenderer key={i} component={c} state={state} />
          ))}
        </View>
      ) : rawRows.length === 0 ? (
        <View style={styles.emptyState}>
          <IconButton icon="tray-remove" size={36} iconColor={theme.faint} disabled importantForAccessibility="no" />
          <PaperText variant="bodyLarge" style={styles.emptyStateText}>{(metadata['emptyStateMessage'] as string) || 'No data'}</PaperText>
        </View>
      ) : gridLayout === 'cards' ? (
        // Cards: one card per row — the mobile-first layout
        <>
          <FlatList
            data={displayRows}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={fabClearance}
            renderItem={({ item }) =>
              isGroupRow(item) ? (
                <View style={styles.groupBand}>
                  <Text style={styles.groupBandText}>{groupBandText(item)}</Text>
                </View>
              ) : (
                <View style={styles.cardWrap}>
                <Card mode="outlined" style={styles.cardRow}>
                <TouchableRipple {...rowA11y(item)} borderless style={styles.cardRipple} onPress={() => handleRowPress(item)}>
                <View>
                  {colDefs.map((col, i) => {
                    const tip = cellTooltipText(item, col.tooltipPath);
                    const lineStyle = [styles.cardLine, rowsSelectionEnabled && i === 0 && styles.cardLineSelectable];
                    const tone = i > 0 ? cellTone(item[col.fieldId], col) : null;
                    const content = (
                      <>
                        {i > 0 && <Text style={styles.cardLabel}>{col.label}</Text>}
                        {tone ? (
                          <StatusChip label={cellText(item[col.fieldId], col.valueLabels, col)} tone={tone} />
                        ) : (
                          <Text style={i === 0 ? styles.cardPrimary : styles.cardValue} numberOfLines={2}>
                            {cellText(item[col.fieldId], col.valueLabels, col)}
                          </Text>
                        )}
                      </>
                    );
                    if (col.display) return renderDisplayCell(col, item, lineStyle, content);
                    return tip ? (
                      <TouchableOpacity
                        {...buttonA11y({ hint: 'Long-press for details' })}
                        key={col.fieldId}
                        style={lineStyle}
                        onPress={() => handleRowPress(item)}
                        onLongPress={() => Alert.alert(col.label, tip)}
                      >
                        {content}
                      </TouchableOpacity>
                    ) : (
                      <View key={col.fieldId} style={lineStyle}>{content}</View>
                    );
                  })}
                </View>
                </TouchableRipple>
                </Card>
                {/* Siblings of the card's touchable (not children): each is reachable on its own. */}
                {rowsSelectionEnabled && (
                  <SelectBox
                    checked={isSelected(item)}
                    label={rowCheckboxLabel(item[colDefs[0]?.fieldId ?? ''])}
                    onToggle={() => toggleRow(item)}
                    style={styles.checkboxCard}
                  />
                )}
                {editableCols.length > 0 && (
                  <IconButton icon="pencil-outline" accessibilityLabel="Edit row" style={styles.editPencilCard} onPress={() => setEditingRow(item)} />
                )}
                </View>
              )
            }
          />
          {!!footers && (
            <View style={styles.totalsBand}>
              <Text style={styles.totalsBandText}>{totalsBandText}</Text>
            </View>
          )}
        </>
      ) : gridLayout === 'list' ? (
        // List: compact single-line rows (first column primary, the rest secondary)
        <>
          <FlatList
            data={displayRows}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={fabClearance}
            renderItem={({ item }) =>
              isGroupRow(item) ? (
                <View style={styles.groupBand}>
                  <Text style={styles.groupBandText}>{groupBandText(item)}</Text>
                </View>
              ) : (
                <View style={styles.listRowWrap}>
                  {rowsSelectionEnabled && (
                    <SelectBox
                      checked={isSelected(item)}
                      label={rowCheckboxLabel(item[colDefs[0]?.fieldId ?? ''])}
                      onToggle={() => toggleRow(item)}
                      style={styles.checkboxList}
                    />
                  )}
                  {(() => {
                    // a Material list item: headline, supporting text, and the statuses as chips
                    const model = listRowModel(item, colDefs, (v, c) => cellText(v, c.valueLabels, c));
                    return (
                      <TouchableRipple {...rowA11y(item)} style={[styles.listRow, rowsSelectionEnabled && styles.listRowSelectable]} onPress={() => handleRowPress(item)}>
                        <View style={styles.listRowInner}>
                          {!!model.leading && (
                            <Image source={{ uri: model.leading }} style={styles.listLeading} accessibilityIgnoresInvertColors importantForAccessibility="no" accessibilityElementsHidden />
                          )}
                          <View style={styles.listRowText}>
                            <PaperText variant="titleMedium" style={styles.listHeadline} numberOfLines={1}>{model.headline}</PaperText>
                            {!!model.supporting && (
                              <PaperText variant="bodyMedium" style={styles.listSecondary} numberOfLines={2}>{model.supporting}</PaperText>
                            )}
                            {model.chips.length > 0 && (
                              <View style={styles.listChips}>
                                {model.chips.map((c, ci) => <StatusChip key={ci} label={c.label} tone={c.tone} />)}
                              </View>
                            )}
                          </View>
                          {!!rowOpen && <IconButton icon="chevron-right" size={20} iconColor={theme.faint} style={styles.listChevron} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden />}
                        </View>
                      </TouchableRipple>
                    );
                  })()}
                </View>
              )
            }
          />
          {!!footers && (
            <View style={styles.totalsBand}>
              <Text style={styles.totalsBandText}>{totalsBandText}</Text>
            </View>
          )}
        </>
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
              {rowsSelectionEnabled && (
                <SelectBox checked={allSelected} label="Select all rows" onToggle={toggleAll} style={styles.checkboxCell} />
              )}
              {colDefs.map((col) => (
                <TouchableOpacity
                  {...buttonA11y({ disabled: !col.sortable, hint: col.sortable ? 'Sorts by this column' : undefined })}
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

            {/* Rows: tapping one opens its detail (link action / primary row action).
                Group header rows (groupBy) are presentation-only — no press, no selection. */}
            <FlatList
              data={displayRows}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={fabClearance}
              renderItem={({ item }) =>
                isGroupRow(item) ? (
                  <View style={[styles.tableRow, styles.groupTableRow]}>
                    {rowsSelectionEnabled && <View style={styles.checkboxCell} />}
                    {colDefs.map((col) => (
                      <View key={col.fieldId} style={styles.cell}>
                        <Text style={styles.groupCellText} numberOfLines={1}>
                          {groupRowCellText(item, asAggregatable(col), labelColumnId)}
                        </Text>
                      </View>
                    ))}
                    {editableCols.length > 0 && <View style={styles.editHeaderCell} />}
                  </View>
                ) : (
                  <View style={styles.tableRow}>
                    {rowsSelectionEnabled && (
                      <SelectBox
                        checked={isSelected(item)}
                        label={rowCheckboxLabel(item[colDefs[0]?.fieldId ?? ''])}
                        onToggle={() => toggleRow(item)}
                        style={styles.checkboxCell}
                      />
                    )}
                    <TouchableOpacity {...rowA11y(item)} style={styles.tableRowCells} onPress={() => handleRowPress(item)}>
                    {colDefs.map((col) => {
                      const tip = cellTooltipText(item, col.tooltipPath);
                      const tone = cellTone(item[col.fieldId], col);
                      const content = tone
                        ? <StatusChip label={cellText(item[col.fieldId], col.valueLabels, col)} tone={tone} />
                        : <Text style={styles.cellText} numberOfLines={2}>{cellText(item[col.fieldId], col.valueLabels, col)}</Text>;
                      if (col.display) return renderDisplayCell(col, item, styles.cell, content);
                      return tip ? (
                        <TouchableOpacity
                          {...buttonA11y({ hint: 'Long-press for details' })}
                          key={col.fieldId}
                          style={styles.cell}
                          onPress={() => handleRowPress(item)}
                          onLongPress={() => Alert.alert(col.label, tip)}
                        >
                          {content}
                        </TouchableOpacity>
                      ) : (
                        <View key={col.fieldId} style={styles.cell}>{content}</View>
                      );
                    })}
                    </TouchableOpacity>
                    {editableCols.length > 0 && (
                      <IconButton icon="pencil-outline" accessibilityLabel="Edit row" style={styles.editPencilCell} onPress={() => setEditingRow(item)} />
                    )}
                  </View>
                )
              }
            />

            {/* Totals footer: whole-filtered-set aggregates, pinned under the rows. */}
            {!!footers && (
              <View style={[styles.tableRow, styles.totalsTableRow]}>
                {rowsSelectionEnabled && <View style={styles.checkboxCell} />}
                {colDefs.map((col) => (
                  <View key={col.fieldId} style={styles.cell}>
                    <Text style={styles.totalsCellText} numberOfLines={1}>{footers[col.fieldId] ?? ''}</Text>
                  </View>
                ))}
                {editableCols.length > 0 && <View style={styles.editHeaderCell} />}
              </View>
            )}
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
        <View style={styles.paginationBar} onLayout={(e) => setPaginationHeight(e.nativeEvent.layout.height)}>
          <IconButton icon="chevron-left" mode="outlined" accessibilityLabel="Previous page" disabled={!hasPrevious} onPress={() => hasPrevious && changePage(-1)} />
          <PaperText variant="bodyMedium" style={styles.paginationInfo}>
            Page {pageNumber + 1} of {totalPages} · {totalElements} total
          </PaperText>
          <IconButton icon="chevron-right" mode="outlined" accessibilityLabel="Next page" disabled={!hasNext} onPress={() => hasNext && changePage(1)} />
        </View>
      )}

      {createButton && (
        <FAB
          icon="plus"
          label={createButton.label || 'New'}
          accessibilityLabel={createButton.label || 'New'}
          disabled={!!createButton.disabled}
          style={[styles.createFab, { bottom: (totalElements > pageSize && pageSize > 0 ? paginationHeight : 0) + 16 }]}
          onPress={() => pressButton(createButton)}
        />
      )}

      {/* Saved views: apply / save / default / delete named snapshots of the search conditions. */}
      <Portal>
      <Dialog visible={viewsOpen} onDismiss={() => setViewsOpen(false)} style={styles.dialog}>
        <Dialog.Title>Saved views</Dialog.Title>
          <Dialog.Content>
            {savedViews.length === 0 && <Text style={styles.columnsLabelDim}>No saved views yet.</Text>}
            {savedViews.map((v) => (
              <View key={v.name} style={styles.columnsRow}>
                <TouchableOpacity {...buttonA11y({ label: `Apply ${v.name}` })} style={styles.viewApply} onPress={() => applyView(v)}>
                  <Text style={styles.columnsLabel}>{v.name}</Text>
                </TouchableOpacity>
                <IconButton icon={v.isDefault ? 'star' : 'star-outline'} accessibilityLabel="Default" accessibilityState={{ selected: !!v.isDefault }} onPress={() => toggleDefaultView(v.name)} />
                <IconButton icon="delete-outline" accessibilityLabel="Delete" onPress={() => removeView(v.name)} />
              </View>
            ))}
            <View style={styles.viewSaveRow}>
              <PaperTextInput
                mode="outlined"
                dense
                style={styles.viewNameInput}
                label="Save current as…"
                value={newViewName}
                onChangeText={setNewViewName}
              />
              <MateuButton label="Save" buttonStyle="primary" accessibilityLabel="Save view" disabled={!newViewName.trim()} onPress={saveCurrentView} />
            </View>
          </Dialog.Content>
      </Dialog>
      </Portal>

      {/* "Move to…": the touch equivalent of dragging the selected rows onto a DropZone. */}
      <Portal>
      <Dialog visible={moveOpen} onDismiss={() => setMoveOpen(false)} style={styles.dialog}>
        <Dialog.Title>{moveToLabel(selectedRows.length)}</Dialog.Title>
          <Dialog.Content>
            {dropZones.length === 0 && <Text style={styles.columnsLabelDim}>No destinations on this screen.</Text>}
            {dropZones.map((zone) => (
              <TouchableOpacity {...buttonA11y({ label: zoneLabel(zone.meta) })}
                key={zone.key} style={styles.columnsRow} onPress={() => moveTo(zone)}>
                <View>
                  <Text style={styles.columnsLabel}>{zoneLabel(zone.meta)}</Text>
                  {!!zone.meta.title && !!zone.meta.subtitle && (
                    <Text style={styles.columnsLabelDim}>{zone.meta.subtitle}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Dialog.Content>
      </Dialog>
      </Portal>

      {/* Column chooser: show/hide columns (session-scoped; the identity column stays). */}
      <Portal>
      <Dialog visible={columnsOpen} onDismiss={() => setColumnsOpen(false)} style={styles.dialog}>
        <Dialog.Title>Columns</Dialog.Title>
          <Dialog.Content>
            {allColDefs.map((c) => {
              const isProtected = c.fieldId === protectedColId;
              const visible = !hiddenCols.includes(c.fieldId);
              return (
                <View key={c.fieldId} style={styles.columnsRow}>
                  <SelectBox checked={visible} label={c.label} disabled={isProtected} onToggle={() => toggleColumn(c.fieldId)} />
                  <Text style={[styles.columnsLabel, isProtected && styles.columnsLabelDim]}>
                    {c.label}{isProtected ? ' (required)' : ''}
                  </Text>
                </View>
              );
            })}
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setColumnsOpen(false)}>Done</PaperButton>
          </Dialog.Actions>
      </Dialog>
      </Portal>
    </View>
  );
}

/** Hierarchical rows (GridLayout.tree): indentation + expand carets; the caret is its own tap
 *  target so selectable group rows can still expand (same rule as the tree select). */
function TreeRows({ rows, colDefs, depth, onPress }: {
  rows: Record<string, unknown>[];
  colDefs: { fieldId: string; label: string; valueLabels?: Record<string, string> | null }[];
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
                <TouchableOpacity {...buttonA11y()}
                  style={styles.treeCaret}
                  onPress={() => setOpenRows(open ? openRows.filter((n) => n !== i) : [...openRows, i])}
                >
                  <Text>{open ? '▾' : '▸'}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.treeCaret} />
              )}
              <TouchableOpacity {...buttonA11y()} style={{ flex: 1 }} onPress={() => onPress(row)}>
                <Text style={styles.cardPrimary} numberOfLines={1}>
                  {cellText(row[colDefs[0]?.fieldId ?? ''], colDefs[0]?.valueLabels)}
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
                    <Chip
                      key={opt.value}
                      mode="outlined"
                      selected={on}
                      showSelectedOverlay
                      accessibilityLabel={opt.label}
                      accessibilityState={{ selected: on }}
                      onPress={() =>
                        set(f.fieldId, on ? selected.filter((v) => v !== opt.value) : [...selected, opt.value])
                      }
                    >
                      {opt.label}
                    </Chip>
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
        <MateuButton label="Clear filters" buttonStyle="tertiary" onPress={onClear} />
        <MateuButton label="Apply" buttonStyle="primary" onPress={onApply} />
      </View>
    </View>
  );
}

const CELL_WIDTH = 140;
/** room under the last row so it scrolls clear of the create FAB (56 + its 16 margin + 16) */
const CREATE_FAB_CLEARANCE = 88;

const styles = themed(() => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.surface },
  createFab: { position: 'absolute', right: 16, zIndex: 10 },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  title: { color: theme.ink, fontWeight: '600' },
  subtitle: { color: theme.muted, marginTop: 4 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 8, paddingTop: 8, paddingBottom: 12, gap: 0 },
  searchIcon: { marginHorizontal: 0 },
  searchInput: { flex: 1, backgroundColor: theme.scheme === 'dark' ? '#2A2C31' : '#E9EBF0', borderRadius: theme.radiusPill, elevation: 0, minHeight: 48 },
  searchInputText: { fontSize: 16, minHeight: 0 },
  filterCount: { position: 'absolute', top: 4, right: 2, minWidth: 16, height: 16, borderRadius: 8, overflow: 'hidden', backgroundColor: theme.primary, color: theme.onPrimary, fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 16 },
  dialog: { backgroundColor: theme.surface, borderRadius: theme.radiusLg },
  tableHeader: { flexDirection: 'row', backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerCell: { width: CELL_WIDTH, padding: 10 },
  columnsBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 8 },
  columnsBtn: { paddingHorizontal: 10, paddingVertical: 4, minHeight: 36, justifyContent: 'center' },
  columnsBtnText: { color: theme.info, fontSize: 13, fontWeight: '600' },
  columnsBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 24 },
  columnsSheet: { backgroundColor: theme.white, borderRadius: theme.radiusSm, padding: 16, maxHeight: '80%' },
  columnsTitle: { fontSize: 16, fontWeight: '600', color: theme.ink, marginBottom: 8 },
  columnsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  columnsCheck: { fontSize: 16, color: theme.ink },
  columnsLabel: { fontSize: 14, color: theme.ink },
  columnsLabelDim: { color: theme.faint, fontSize: 13, paddingVertical: 6 },
  viewApply: { flex: 1 },
  viewSaveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  viewNameInput: { flex: 1, backgroundColor: theme.surface },
  headerText: { fontWeight: '600', fontSize: 13, color: theme.ink },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.divider },
  tableRowCells: { flexDirection: 'row' },
  cardWrap: {},
  btnDestructive: { borderColor: theme.danger, backgroundColor: theme.white },
  btnDestructiveText: { color: theme.danger, fontWeight: '600' },
  cell: { width: CELL_WIDTH, padding: 10, justifyContent: 'center' },
  cellText: { fontSize: 13, color: theme.ink },
  actionCell: { width: 80 },
  paginationBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.divider, backgroundColor: theme.surface, gap: 8 },
  paginationInfo: { flex: 1, textAlign: 'center', color: theme.muted },
  btnPrimary: { backgroundColor: theme.primary, paddingHorizontal: 16, paddingVertical: 8, minHeight: theme.minTouch, justifyContent: 'center', borderRadius: theme.radiusSm },
  btnPrimaryText: { color: theme.onFill, fontWeight: '600', fontSize: 14 },
  btnDefault: { backgroundColor: theme.background, paddingHorizontal: 16, paddingVertical: 8, minHeight: theme.minTouch, justifyContent: 'center', borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border },
  btnDefaultText: { color: theme.ink, fontSize: 14 },
  btnDisabled: { opacity: 0.4 },
  filterPanel: { marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: theme.radiusMd, backgroundColor: theme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border },
  filterItem: { marginBottom: 12 },
  filterLabel: { fontSize: 12, color: theme.muted, marginBottom: 4, fontWeight: '500' },
  filterRangeRow: { flexDirection: 'row', gap: 8 },
  filterRangeInput: { flex: 1 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.white },
  filterChipOn: { backgroundColor: theme.primary, borderColor: theme.primary },
  filterChipOnText: { color: theme.onFill, fontSize: 13 },
  filterButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  emptyState: { alignItems: 'center', padding: 40 },
  preSearch: { padding: 12, gap: 12 },
  emptyStateIcon: { fontSize: 32, marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: theme.faint },
  cardRow: { marginHorizontal: 16, marginTop: 10, borderRadius: theme.radiusMd, backgroundColor: theme.surface, borderColor: theme.border },
  cardRipple: { padding: 16, borderRadius: theme.radiusMd },
  cardLine: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  cardLabel: { fontSize: 11, color: theme.faint, minWidth: 90 },
  cardPrimary: { fontSize: 16, fontWeight: '600', color: theme.ink },
  cardValue: { fontSize: 13, color: theme.ink, flex: 1 },
  // Material's three-line list item: 88dp (8 + headline 24 + supporting 20 + 6 + chip 22 + 8)
  listRow: { flex: 1, paddingLeft: 16, paddingRight: 4, paddingVertical: 8, minHeight: 72, justifyContent: 'center' },
  listRowSelectable: { paddingLeft: 4 },
  listRowInner: { flexDirection: 'row', alignItems: 'center' },
  listLeading: { width: 40, height: 40, borderRadius: 20, marginRight: 16, backgroundColor: theme.divider },
  listRowText: { flex: 1, minWidth: 0 },
  listHeadline: { color: theme.ink },
  listSecondary: { color: theme.muted },
  listChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  listChevron: { margin: 0 },
  treeCaret: { width: 24, alignItems: 'center' },
  editHeaderCell: { width: 44 },
  editPencilCell: { width: 44, alignItems: 'center', justifyContent: 'center' },
  editPencilCard: { position: 'absolute', top: 14, right: 22, zIndex: 2, margin: 0 },
  editPencilText: { fontSize: 16, color: theme.primary },
  // bulk row selection
  checkboxCell: { width: 40, alignItems: 'center', justifyContent: 'center' },
  checkboxCard: { position: 'absolute', top: 18, left: 20, zIndex: 2 },
  checkboxList: { paddingLeft: 8, justifyContent: 'center' },
  checkboxText: { fontSize: 18, color: theme.primary },
  cardLineSelectable: { paddingLeft: 40 },
  listRowWrap: { flexDirection: 'row', alignItems: 'stretch', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  // groups + totals
  groupTableRow: { backgroundColor: theme.infoBg },
  groupCellText: { fontSize: 13, fontWeight: '700', color: theme.ink },
  totalsTableRow: { backgroundColor: theme.background, borderTopWidth: 1, borderTopColor: theme.border },
  totalsCellText: { fontSize: 13, fontWeight: '700', color: theme.ink },
  groupBand: { backgroundColor: theme.infoBg, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 },
  groupBandText: { fontSize: 13, fontWeight: '700', color: theme.ink },
  totalsBand: { backgroundColor: theme.background, borderTopWidth: 1, borderTopColor: theme.border, paddingHorizontal: 12, paddingVertical: 8 },
  totalsBandText: { fontSize: 13, fontWeight: '700', color: theme.ink },
}));
