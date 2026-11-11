/**
 * Dragging listing rows onto DropZones with a finger (Java `@DragRows` + `DropZone`): a long press
 * lifts the row — or the selection, when the row is part of it — a chip naming what is carried
 * follows the finger, the zones accepting the type light up and the one under the finger fills in;
 * letting go on it runs its action with the web's drop parameters. A long press released without
 * moving opens the listing's "Move to…" picker over those rows instead (the screen reader's way, and
 * anyone's who prefers it). The geometry and the registry are pure: dragDrop.ts.
 */
import React, { useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Vibration, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Portal } from 'react-native-paper';
import { announce } from '../a11y/a11y';
import { theme, themed } from '../theme';
import { MIcon } from '../ui/controls';
import { Text } from '../ui/Text';
import { STILL_DP, dragPreviewLabel, dropOn, rowsToDrag, zoneAt, zoneLabel, type DropZoneRegistry, type ZoneRect } from './dragDrop';

type Row = Record<string, unknown>;
type Point = { absoluteX: number; absoluteY: number };

interface RowDragHandlers {
  lift: (row: Row, e: Point) => void;
  follow: (e: Point) => void;
  finish: (drop: boolean) => void;
}

export interface RowDrag {
  /** Whether rows can be lifted (a drag type and at least one zone accepting it on screen). */
  enabled: boolean;
  handlers: React.RefObject<RowDragHandlers>;
  /** The chip following the finger (rendered once, in a portal over the whole screen). */
  overlay: React.ReactNode;
}

export function useRowDrag({ dragType, registry, selectedRows, titleOf, onDropped, onStillPress }: {
  dragType: string | null;
  registry: DropZoneRegistry;
  selectedRows: Row[];
  titleOf: (row: Row) => string;
  /** The rows were dropped on a zone (the listing clears a dropped selection). */
  onDropped: (rows: Row[]) => void;
  /** A long press let go without moving: offer the "Move to…" picker over these rows. */
  onStillPress: (rows: Row[]) => void;
}): RowDrag {
  const [label, setLabel] = useState<string | undefined>(undefined);
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const carried = useRef<{ rows: Row[]; rects: ZoneRect[]; startX: number; startY: number; moved: boolean; x: number; y: number } | undefined>(undefined);

  const place = (x: number, y: number) => position.setValue({ x: x + 12, y: y - 56 });
  const hover = () => {
    const c = carried.current;
    if (!c || !dragType) return;
    registry.setDrag({ type: dragType, hovered: zoneAt(c.rects, c.x, c.y) });
  };

  const lift = (row: Row, e: Point) => {
    if (!dragType) return;
    const rows = rowsToDrag(row, selectedRows);
    carried.current = { rows, rects: [], startX: e.absoluteX, startY: e.absoluteY, moved: false, x: e.absoluteX, y: e.absoluteY };
    registry.setDrag({ type: dragType });
    // where the zones are NOW (the page does not scroll while a row is held)
    void registry.measureAccepting(dragType).then((rects) => {
      if (carried.current) {
        carried.current.rects = rects;
        hover();
      }
    });
    place(e.absoluteX, e.absoluteY);
    setLabel(dragPreviewLabel(rows, titleOf));
    if (Platform.OS === 'android') Vibration.vibrate(15);
  };
  const follow = (e: Point) => {
    const c = carried.current;
    if (!c) return;
    c.x = e.absoluteX;
    c.y = e.absoluteY;
    if (Math.hypot(c.x - c.startX, c.y - c.startY) > STILL_DP) c.moved = true;
    place(c.x, c.y);
    hover();
  };
  const finish = (drop: boolean) => {
    const c = carried.current;
    carried.current = undefined;
    const hovered = registry.dragState()?.hovered;
    registry.setDrag(undefined);
    setLabel(undefined);
    if (!c || !drop || !dragType) return;
    if (!c.moved) {
      onStillPress(c.rows);
      return;
    }
    const zone = registry.zone(hovered);
    if (zone && dropOn(zone, dragType, c.rows)) {
      announce(`${dragPreviewLabel(c.rows, titleOf)} moved to ${zoneLabel(zone.meta)}`);
      onDropped(c.rows);
    }
  };
  const handlers = useRef<RowDragHandlers>({ lift, follow, finish });
  handlers.current = { lift, follow, finish };

  const overlay = label === undefined ? null : (
    <Portal>
      <Animated.View pointerEvents="none" style={[styles.floating, { transform: position.getTranslateTransform() }]}>
        <MIcon name="drag" size={18} color={theme.onPrimaryContainer} />
        <Text style={styles.floatingText} numberOfLines={1}>{label}</Text>
      </Animated.View>
    </Portal>
  );
  return { enabled: !!dragType, handlers, overlay };
}

/** A listing row a long press can lift (when the listing's rows drag); otherwise just its content. */
export function DraggableRow({ row, drag, children }: { row: Row; drag: RowDrag; children: React.ReactNode }) {
  const pan = React.useMemo(() => Gesture.Pan()
    .enabled(drag.enabled)
    .activateAfterLongPress(350)
    .runOnJS(true)
    .onStart((e) => drag.handlers.current?.lift(row, e))
    .onUpdate((e) => drag.handlers.current?.follow(e))
    .onEnd((_e, success) => drag.handlers.current?.finish(success))
    .onFinalize((_e, success) => { if (!success) drag.handlers.current?.finish(false); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [row, drag.enabled]);
  if (!drag.enabled) return <>{children}</>;
  return (
    <GestureDetector gesture={pan}>
      <View collapsable={false}>{children}</View>
    </GestureDetector>
  );
}

const styles = themed(() => StyleSheet.create({
  floating: {
    position: 'absolute', left: 0, top: 0, zIndex: 20, elevation: 8, flexDirection: 'row', alignItems: 'center', gap: 6,
    maxWidth: 260, paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radiusPill,
    backgroundColor: theme.primaryContainer, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  floatingText: { color: theme.onPrimaryContainer, fontWeight: '600', flexShrink: 1 },
}));
