import React from 'react';
import { Animated, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PlanningBlock, PlanningBoard, PlanningResource } from '../api/metadata';
import { useViewController } from './MateuViewHost';
import { computePlanningMove } from './planningDrag';
import { theme } from '../theme';
import { buttonA11y } from '../a11y/a11y';

/**
 * Planning board / tape chart (PlanningBoardDto) — READ-ONLY on native: rows = resources (with
 * optional group swimlane captions), columns = days, colored blocks spanning their date ranges.
 * Tapping a block dispatches the board's selectActionId with `{_blockId: block.id}` through the
 * standard action pipeline (same contract as the web's mateu-planning-board). When moveActionId is
 * set, a block is DRAGGABLE (PanResponder): on release the pixel delta becomes a move via the pure
 * `computePlanningMove` and dispatches moveActionId with `{_blockId, _resourceId, _start, _end}` —
 * same payload as the web. A drag under the tap threshold falls back to select.
 *
 * Layout mirrors the Gantt renderer: a fixed-ish left column with the resource labels + a
 * horizontal ScrollView with the day headers and the block lanes, both built from the same
 * resource walk so rows stay aligned.
 */

const DAY_MS = 86400000;
const DAY_W = 34;
const ROW_H = 34;
const HEADER_H = 34;
const GROUP_H = 24;
const LABEL_W = 110;

const parseDay = (s?: string): number | null => {
  if (!s) return null;
  const t = Date.parse(`${s}T00:00:00Z`);
  return isNaN(t) ? null : Math.floor(t / DAY_MS);
};

type BoardRow =
  | { kind: 'group'; label: string }
  | { kind: 'resource'; resource: PlanningResource };

/** Resources in declaration order, with a swimlane caption row wherever `group` changes. */
const buildRows = (resources: PlanningResource[]): BoardRow[] => {
  const rows: BoardRow[] = [];
  let lastGroup: string | undefined;
  for (const resource of resources) {
    const group = resource.group ?? '';
    if (group && group !== lastGroup) rows.push({ kind: 'group', label: group });
    lastGroup = group;
    rows.push({ kind: 'resource', resource });
  }
  return rows;
};

export function PlanningBoardRenderer({ metadata }: { metadata: PlanningBoard }) {
  const controller = useViewController();
  const resources = metadata.resources ?? [];
  const blocks = metadata.blocks ?? [];

  // Day range: from/to on the wire, falling back to the blocks' min/max dates.
  const blockDays = blocks
    .flatMap((b) => [parseDay(b.start), parseDay(b.end)])
    .filter((d): d is number => d != null);
  const minDay = parseDay(metadata.from) ?? (blockDays.length > 0 ? Math.min(...blockDays) : null);
  const maxDay = parseDay(metadata.to) ?? (blockDays.length > 0 ? Math.max(...blockDays) : null);
  if (resources.length === 0 || minDay == null || maxDay == null || maxDay < minDay) {
    return <Text style={styles.empty}>No planning data.</Text>;
  }
  const totalDays = maxDay - minDay + 1;
  const laneW = totalDays * DAY_W;
  const todayDay = Math.floor(Date.now() / DAY_MS);
  const todayX = todayDay >= minDay && todayDay <= maxDay ? (todayDay - minDay) * DAY_W : null;

  const rows = buildRows(resources);
  const rowHeight = (row: BoardRow) => (row.kind === 'group' ? GROUP_H : ROW_H);

  const days = Array.from({ length: totalDays }, (_, i) => new Date((minDay + i) * DAY_MS));
  const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const selectBlock = (block: PlanningBlock) => {
    const actionId = metadata.selectActionId;
    if (!actionId) return;
    void controller.runAction(actionId, { _blockId: block.id });
  };

  const windowFromIso = new Date(minDay * DAY_MS).toISOString().slice(0, 10);
  const moveBlock = (block: PlanningBlock, dx: number, dy: number) => {
    const actionId = metadata.moveActionId;
    if (!actionId) return;
    const start = parseDay(block.start);
    const end = parseDay(block.end);
    if (start == null || end == null) return;
    const move = computePlanningMove({
      blockId: block.id ?? '',
      originResourceIndex: resources.findIndex((r) => r.id === block.resourceId),
      originStartIdx: start - minDay,
      durationDays: end - start + 1,
      deltaXpx: dx,
      deltaYpx: dy,
      dayWidthPx: DAY_W,
      laneHeightPx: ROW_H,
      resourceIds: resources.map((r) => r.id ?? ''),
      windowFromIso,
      dayCount: totalDays,
    });
    if (move) void controller.runAction(actionId, move as unknown as Record<string, unknown>);
  };

  // Blocks per resource id, clamped to the visible day range (start/end inclusive).
  const blocksFor = (resourceId?: string) =>
    blocks
      .map((block) => {
        if (block.resourceId !== resourceId) return null;
        const start = parseDay(block.start);
        const end = parseDay(block.end);
        if (start == null || end == null || end < minDay || start > maxDay) return null;
        const from = Math.max(start, minDay);
        const to = Math.min(end, maxDay);
        return { block, left: (from - minDay) * DAY_W, width: Math.max(DAY_W, (to - from + 1) * DAY_W) };
      })
      .filter((b): b is { block: PlanningBlock; left: number; width: number } => b != null);

  return (
    <View style={styles.board}>
      {/* Fixed left column: corner + swimlane captions + resource labels */}
      <View style={{ width: LABEL_W }}>
        <View style={[styles.corner, { height: HEADER_H }]} />
        {rows.map((row, i) =>
          row.kind === 'group' ? (
            <View key={i} style={[styles.groupLabelCell, { height: GROUP_H }]}>
              <Text style={styles.groupLabel} numberOfLines={1}>{row.label.toUpperCase()}</Text>
            </View>
          ) : (
            <View key={i} style={[styles.labelCell, { height: ROW_H }]}>
              <Text style={styles.label} numberOfLines={1}>{row.resource.label ?? row.resource.id ?? ''}</Text>
            </View>
          ),
        )}
      </View>

      {/* Scrollable day lanes */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: laneW }}>
          {/* Day headers */}
          <View style={[styles.headerRow, { height: HEADER_H }]}>
            {days.map((day, i) => {
              const weekend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
              const isToday = minDay + i === todayDay;
              return (
                <View key={i} style={[styles.dayHead, { width: DAY_W }, weekend && styles.weekend]}>
                  <Text style={styles.dow}>{DOW[day.getUTCDay()]}</Text>
                  <Text style={[styles.dayNum, isToday && styles.todayNum]}>{day.getUTCDate()}</Text>
                </View>
              );
            })}
          </View>

          {/* One lane per row, group captions spanning the full width */}
          {rows.map((row, i) =>
            row.kind === 'group' ? (
              <View key={i} style={[styles.groupLane, { height: GROUP_H }]} />
            ) : (
              <View key={i} style={[styles.lane, { height: rowHeight(row) }]}>
                {/* Day grid lines */}
                {days.map((_, dayIndex) => (
                  <View key={dayIndex} style={[styles.gridLine, { left: dayIndex * DAY_W }]} />
                ))}
                {blocksFor(row.resource.id).map(({ block, left, width }, j) => (
                  <DraggableBlock
                    key={block.id ?? j}
                    block={block}
                    left={left}
                    width={width}
                    moveEnabled={!!metadata.moveActionId}
                    selectEnabled={!!metadata.selectActionId}
                    onSelect={() => selectBlock(block)}
                    onMove={(dx, dy) => moveBlock(block, dx, dy)}
                  />
                ))}
              </View>
            ),
          )}

          {/* Today marker */}
          {todayX != null && (
            <View style={[styles.today, { left: todayX + DAY_W / 2, height: HEADER_H + rows.reduce((h, r) => h + rowHeight(r), 0) }]} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const DRAG_THRESHOLD = 4;

/** A planning block: draggable (PanResponder) when moveEnabled, else a plain tap-to-select cell.
 *  A drag under the threshold is treated as a tap → select. */
function DraggableBlock({
  block, left, width, moveEnabled, selectEnabled, onSelect, onMove,
}: {
  block: PlanningBlock;
  left: number;
  width: number;
  moveEnabled: boolean;
  selectEnabled: boolean;
  onSelect: () => void;
  onMove: (dx: number, dy: number) => void;
}) {
  const pan = React.useRef(new Animated.ValueXY()).current;
  const responder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        moveEnabled && (Math.abs(g.dx) > DRAG_THRESHOLD || Math.abs(g.dy) > DRAG_THRESHOLD),
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_e, g) => {
        pan.setValue({ x: 0, y: 0 });
        if (Math.abs(g.dx) < DRAG_THRESHOLD && Math.abs(g.dy) < DRAG_THRESHOLD) onSelect();
        else onMove(g.dx, g.dy);
      },
    }),
  ).current;

  const label = (
    <Text style={styles.blockLabel} numberOfLines={1}>{block.label ?? ''}</Text>
  );
  const bg = block.color || '#7aa7d9';

  if (!moveEnabled) {
    return (
      <TouchableOpacity
        {...buttonA11y()}
        style={[styles.block, { left, width, backgroundColor: bg }]}
        disabled={!selectEnabled}
        onPress={onSelect}
      >
        {label}
      </TouchableOpacity>
    );
  }
  return (
    <Animated.View
      {...responder.panHandlers}
      {...buttonA11y({ label: block.label })}
      style={[styles.block, { left, width, backgroundColor: bg, transform: pan.getTranslateTransform() }]}
    >
      {label}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: { flexDirection: 'row', borderWidth: 1, borderColor: theme.border, borderRadius: 8, overflow: 'hidden', backgroundColor: theme.white, marginVertical: 8 },
  empty: { fontSize: 13, color: theme.faint, padding: 12 },
  corner: { borderBottomWidth: 1, borderBottomColor: theme.divider },
  labelCell: { justifyContent: 'center', paddingHorizontal: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider, borderRightWidth: 1, borderRightColor: theme.divider },
  label: { fontSize: 12, color: theme.ink },
  groupLabelCell: { justifyContent: 'center', paddingHorizontal: 10, backgroundColor: theme.background, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  groupLabel: { fontSize: 10, fontWeight: '600', color: theme.muted, letterSpacing: 0.5 },
  headerRow: { flexDirection: 'row', backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: theme.divider },
  dayHead: { alignItems: 'center', justifyContent: 'center', borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: theme.divider },
  weekend: { backgroundColor: theme.divider },
  dow: { fontSize: 8, color: theme.faint, textTransform: 'uppercase' },
  dayNum: { fontSize: 11, fontWeight: '600', color: theme.ink },
  todayNum: { color: theme.primary },
  lane: { position: 'relative', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  groupLane: { backgroundColor: theme.background, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  gridLine: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: theme.divider },
  block: { position: 'absolute', top: 4, bottom: 4, borderRadius: 5, justifyContent: 'center', paddingHorizontal: 6 },
  blockLabel: { fontSize: 11, fontWeight: '600', color: theme.white },
  today: { position: 'absolute', top: 0, width: 2, backgroundColor: theme.danger, opacity: 0.6 },
});
