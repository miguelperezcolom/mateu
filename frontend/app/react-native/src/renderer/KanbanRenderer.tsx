/**
 * The kanban board on a phone: columns side by side, each scrolling its own cards. A long press
 * lifts a card and it follows the finger (the board scrolls by itself near the edges); dropping it
 * runs the board's move action, like dragging on the web. The ⋯ button offers the same moves in a
 * picker, which is also how a screen reader moves a card. A long press released without moving opens
 * that picker too. The geometry and the move are pure: src/core/kanban.ts.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, ScrollView, StyleSheet, useWindowDimensions, Vibration, View } from 'react-native';
import { TouchableOpacity } from '../ui/Touchable';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Dialog, IconButton, Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { announce, buttonA11y } from '../a11y/a11y';
import type { KanbanCard, KanbanColumn } from '../api/metadata';
import { interpolate, interpolateUrl } from '../core/expressions';
import {
  BoardCard, BoardColumn, ColumnGeometry, DropTarget, KanbanMove, cardRouteOf, cardsFromRows, dropTargetOf, edgeScrollStep,
  itemsOf, moveCard, moveOfDrop, moveParameters, movesOf,
} from '../core/kanban';
import { fetchExternalJson } from '../core/restFetch';
import { isExternalRoute } from '../core/rowOpen';
import { theme, themed } from '../theme';
import { Text } from '../ui/Text';
import { useViewController } from './MateuViewHost';
import { openExternal } from './openExternal';

type Dict = Record<string, unknown>;

const COLUMN_WIDTH = 248;
const MIN_BOARD_HEIGHT = 360;
/** A finger that moved less than this while held did not drag: it asked for the picker. */
const STILL_DP = 10;

interface Drag {
  card: BoardCard;
  columnId: string;
  width: number;
  target?: DropTarget;
}

function CardBody({ card, movable, onPick, style }: { card: BoardCard; movable: boolean; onPick?: () => void; style?: object }) {
  return (
    <View style={[styles.card, { borderLeftColor: card.color ?? theme.border }, style]}>
      <Text style={[styles.cardTitle, movable && styles.cardTitleMovable]}>{card.title ?? ''}</Text>
      {!!card.description && <Text style={styles.cardDesc}>{card.description}</Text>}
      {!!card.badge && <Text style={styles.badge}>{card.badge}</Text>}
      {movable && onPick && (
        <IconButton icon="dots-horizontal" size={20} style={styles.move} iconColor={theme.muted} hitSlop={6}
          accessibilityLabel={`Move ${card.title ?? ''}`} onPress={onPick} />
      )}
    </View>
  );
}

export function KanbanRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const m = ((component as Dict)?.['metadata'] ?? {}) as Dict;
  const declared = (m['columns'] as KanbanColumn[]) ?? [];
  const moveActionId = m['moveActionId'] as string | undefined;
  const rowsSource = m['rowsSource'] as Dict | undefined;
  const cardRoute = m['cardRoute'] as string | undefined;
  const [live, setLive] = useState<BoardColumn[] | undefined>(undefined);
  // the board right after a move, until the action answers (put back when it fails)
  const [optimistic, setOptimistic] = useState<BoardColumn[] | undefined>(undefined);
  const [picking, setPicking] = useState<{ cardId: string; columnId: string; title: string } | undefined>(undefined);
  const [reload, setReload] = useState(0);
  const [drag, setDrag] = useState<Drag | undefined>(undefined);
  // the server re-rendered the board: it is the truth now
  useEffect(() => { setOptimistic(undefined); }, [declared]);
  // a LIVE board reads its source (proxied by the board id, or direct) — again after every move
  const sourceKey = rowsSource ? JSON.stringify(rowsSource) : '';
  useEffect(() => {
    if (!rowsSource) return;
    let cancelled = false;
    const sources = controller.session.sources;
    const resolved = sources.resolve(rowsSource) as { itemsPath?: string };
    const ctx = { state: controller.currentComponentState, appState: controller.session.appState };
    const json = sources.viaProxy(rowsSource)
      ? controller.fetchViaProxy('rows', String((component as Dict)?.['id'] ?? 'kanban'))
      : fetchExternalJson(rowsSource, (t) => interpolate(String(t ?? ''), ctx), (t) => interpolateUrl(String(t ?? ''), ctx), sources);
    json
      .then((j) => {
        if (cancelled) return;
        setLive(cardsFromRows({
          columns: declared, columnField: m['columnField'] as string | undefined,
          card: m['card'] as KanbanCard | undefined,
          cardColors: m['cardColors'] as Record<string, string> | undefined,
          orderField: m['orderField'] as string | undefined,
        }, itemsOf(j, resolved.itemsPath)));
        setOptimistic(undefined);
      })
      .catch((e) => console.warn('mateu: kanban items fetch failed', e));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey, reload]);

  const shown: BoardColumn[] = optimistic ?? live ?? declared;
  const commit = async (move: KanbanMove) => {
    setPicking(undefined);
    const card = shown.find((c) => c.id === move.fromColumnId)?.cards?.find((c) => c.id === move.cardId);
    if (!moveActionId || !card) return;
    const after = moveCard(shown, move);
    setOptimistic(after);
    const ok = await controller.runAction(moveActionId, moveParameters(card, move, m['orderField'] as string | undefined, after));
    if (!ok) {
      setOptimistic(undefined);
      announce('The card could not be moved; it is back where it was');
    } else if (rowsSource) {
      setReload((r) => r + 1);
    }
  };
  const open = (card: BoardCard) => {
    const route = cardRouteOf(cardRoute, card);
    if (route) {
      if (isExternalRoute(route)) openExternal(route.startsWith('//') ? 'https:' + route : route);
      else controller.session.openView({ label: '', route, consumedRoute: '', serverSideType: '' });
      return;
    }
    if (card.actionId) {
      const { row, ...plain } = card;
      void controller.runAction(card.actionId, { ...(row ?? {}), _clickedCard: plain });
    }
  };

  // ── the board fills what is left of the screen, so each column scrolls on its own ──────────────
  const board = useRef<View>(null);
  const boardOrigin = useRef({ x: 0, y: 0 });
  const [boardTop, setBoardTop] = useState<number | undefined>(undefined);
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // where the board is, for the drag; its height is decided once, or a scrolled page would resize it
  // under the finger at the moment of the long press
  const measureBoard = (andHeight: boolean) => board.current?.measureInWindow((x, y) => {
    boardOrigin.current = { x, y };
    if (andHeight) setBoardTop(y);
  });
  const height = Math.max(MIN_BOARD_HEIGHT, window.height - (boardTop ?? 0) - insets.bottom - 8);

  // ── what a drag needs to know, kept out of state: it changes on every frame ────────────────────
  const horizontal = useRef<ScrollView>(null);
  const lists = useRef<Record<string, ScrollView | null>>({});
  const scrollX = useRef(0);
  const contentWidth = useRef(0);
  const boardWidth = useRef(0);
  const columnLayout = useRef<Record<string, { x: number; width: number; listTop: number; listHeight: number }>>({});
  const listScroll = useRef<Record<string, number>>({});
  const listContent = useRef<Record<string, number>>({});
  const cardLayout = useRef<Record<string, Record<string, { y: number; height: number }>>>({});
  const finger = useRef({ x: 0, y: 0 });
  const grab = useRef({ x: 0, y: 0, startX: 0, startY: 0, moved: false });
  const dragRef = useRef<Drag | undefined>(undefined);
  const floating = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ticker = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const geometry = (): ColumnGeometry[] =>
    shown.filter((c) => c.id && columnLayout.current[c.id]).map((c) => {
      const layout = columnLayout.current[c.id!]!;
      return {
        id: c.id!,
        x: layout.x - scrollX.current,
        width: layout.width,
        listTop: layout.listTop,
        scrollY: listScroll.current[c.id!] ?? 0,
        cards: (c.cards ?? []).map((card) => ({ id: card.id ?? '', ...(cardLayout.current[c.id!]?.[card.id ?? ''] ?? { y: 0, height: 0 }) })),
      };
    });

  const updateTarget = () => {
    const current = dragRef.current;
    if (!current) return;
    const x = finger.current.x - boardOrigin.current.x;
    const y = finger.current.y - boardOrigin.current.y;
    floating.setValue({ x: finger.current.x - boardOrigin.current.x - grab.current.x, y: finger.current.y - boardOrigin.current.y - grab.current.y });
    const target = dropTargetOf(geometry(), x, y, current.card.id ?? '');
    const same = target?.columnId === current.target?.columnId && target?.index === current.target?.index && target?.lineY === current.target?.lineY;
    if (same) return;
    dragRef.current = { ...current, target };
    setDrag(dragRef.current);
  };

  // near an edge the board scrolls by itself: sideways between columns, up and down inside the column
  const tick = () => {
    if (!dragRef.current) return;
    const step = edgeScrollStep(finger.current.x - boardOrigin.current.x, 0, boardWidth.current);
    const maxX = Math.max(0, contentWidth.current - boardWidth.current);
    const nextX = Math.max(0, Math.min(maxX, scrollX.current + step));
    if (nextX !== scrollX.current) {
      scrollX.current = nextX;
      horizontal.current?.scrollTo({ x: nextX, animated: false });
    }
    const columnId = dragRef.current.target?.columnId;
    const layout = columnId ? columnLayout.current[columnId] : undefined;
    if (columnId && layout) {
      const y = finger.current.y - boardOrigin.current.y;
      const vertical = edgeScrollStep(y, layout.listTop, layout.listTop + layout.listHeight);
      const maxY = Math.max(0, (listContent.current[columnId] ?? 0) - layout.listHeight);
      const current = listScroll.current[columnId] ?? 0;
      const nextY = Math.max(0, Math.min(maxY, current + vertical));
      if (nextY !== current) {
        listScroll.current[columnId] = nextY;
        lists.current[columnId]?.scrollTo({ y: nextY, animated: false });
      }
    }
    updateTarget();
  };

  const lift = (card: BoardCard, columnId: string, width: number, e: { x: number; y: number; absoluteX: number; absoluteY: number }) => {
    measureBoard(false);
    grab.current = { x: e.x, y: e.y, startX: e.absoluteX, startY: e.absoluteY, moved: false };
    finger.current = { x: e.absoluteX, y: e.absoluteY };
    dragRef.current = { card, columnId, width };
    setDrag(dragRef.current);
    if (Platform.OS === 'android') Vibration.vibrate(15);
    updateTarget();
    ticker.current = setInterval(tick, 16);
  };
  const follow = (e: { absoluteX: number; absoluteY: number }) => {
    finger.current = { x: e.absoluteX, y: e.absoluteY };
    if (Math.hypot(e.absoluteX - grab.current.startX, e.absoluteY - grab.current.startY) > STILL_DP) grab.current.moved = true;
    updateTarget();
  };
  const finish = (drop: boolean) => {
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = undefined;
    const current = dragRef.current;
    dragRef.current = undefined;
    setDrag(undefined);
    if (!current || !drop) return;
    if (!grab.current.moved) {
      setPicking({ cardId: current.card.id!, columnId: current.columnId, title: current.card.title ?? '' });
      return;
    }
    const move = current.target && moveOfDrop(shown, current.card.id!, current.columnId, current.target);
    if (move) {
      const column = shown.find((c) => c.id === move.toColumnId);
      announce(`${current.card.title ?? 'Card'} moved to ${column?.title ?? move.toColumnId}`);
      void commit(move);
    }
  };
  useEffect(() => () => { if (ticker.current) clearInterval(ticker.current); }, []);
  // the card being dragged is gone (a live update, another user's move): its gesture went with it, so
  // no callback will ever end the drag, and the board would stay frozen
  const draggedId = drag?.card.id;
  useEffect(() => {
    if (draggedId && !shown.some((c) => c.cards?.some((x) => x.id === draggedId))) finish(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggedId, shown]);
  // the gestures live as long as their card: they reach the latest closures through this
  const handlers = useRef({ lift, follow, finish });
  handlers.current = { lift, follow, finish };

  return (
    <>
    <View ref={board} style={[styles.board, { height }]} onLayout={(e) => { boardWidth.current = e.nativeEvent.layout.width; measureBoard(true); }}>
      <ScrollView ref={horizontal} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.columns} scrollEnabled={!drag}
        scrollEventThrottle={16} onScroll={(e) => { if (!drag) scrollX.current = e.nativeEvent.contentOffset.x; }}
        onContentSizeChange={(w) => { contentWidth.current = w; }}>
        {shown.map((col, i) => {
          const id = col.id ?? String(i);
          const isTarget = drag?.target?.columnId === id;
          return (
            <View key={id} style={[styles.column, isTarget && styles.columnTarget]}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                columnLayout.current[id] = { listTop: columnLayout.current[id]?.listTop ?? 0, listHeight: columnLayout.current[id]?.listHeight ?? 0, x, width };
              }}>
              <View style={[styles.head, { borderBottomColor: col.color ?? theme.border }]}>
                <Text style={styles.title} numberOfLines={1}>{col.title ?? ''}</Text>
                <Text style={styles.count}>{col.cards?.length ?? 0}</Text>
              </View>
              <ScrollView ref={(r) => { lists.current[id] = r; }} nestedScrollEnabled scrollEnabled={!drag} style={styles.list} contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false} scrollEventThrottle={16}
                onScroll={(e) => { if (!drag) listScroll.current[id] = e.nativeEvent.contentOffset.y; }}
                onContentSizeChange={(_, h) => { listContent.current[id] = h; }}
                onLayout={(e) => {
                  const { y, height: listHeight } = e.nativeEvent.layout;
                  columnLayout.current[id] = { x: columnLayout.current[id]?.x ?? 0, width: columnLayout.current[id]?.width ?? COLUMN_WIDTH, listTop: y, listHeight };
                }}>
                {(col.cards ?? []).map((card, j) => (
                  <BoardCardItem key={card.id ?? j} card={card} columnId={id}
                    movable={!!moveActionId && !!card.id && !!col.id}
                    acts={!!card.actionId || !!cardRouteOf(cardRoute, card)}
                    dragged={drag?.card.id === card.id && !!card.id}
                    onOpen={open}
                    onPick={() => setPicking({ cardId: card.id!, columnId: col.id!, title: card.title ?? '' })}
                    handlers={handlers}
                    onMeasured={(layout) => { (cardLayout.current[id] ??= {})[card.id ?? String(j)] = layout; }} />
                ))}
                {isTarget && drag?.target && <View pointerEvents="none" style={[styles.line, { top: drag.target.lineY }]} />}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
      {drag && (
        <Animated.View pointerEvents="none" style={[styles.floating, { width: drag.width, transform: floating.getTranslateTransform() }]}>
          <CardBody card={drag.card} movable={false} />
        </Animated.View>
      )}
    </View>
    {/* "Move…": the screen reader's (and anyone's) way of dragging a card — up/down or to another column */}
    <Portal>
      <Dialog visible={!!picking} onDismiss={() => setPicking(undefined)}>
        <Dialog.Title>{`Move ${picking?.title ?? ''}`}</Dialog.Title>
        <Dialog.Content>
          {picking && movesOf(shown, picking.cardId, picking.columnId).map((item) => (
            <TouchableOpacity {...buttonA11y({ label: item.label })} key={`${item.move.toColumnId}:${item.move.toIndex}`} style={styles.moveRow}
              onPress={() => void commit(item.move)}>
              <Text>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </Dialog.Content>
      </Dialog>
    </Portal>
    </>
  );
}

interface Handlers {
  lift: (card: BoardCard, columnId: string, width: number, e: { x: number; y: number; absoluteX: number; absoluteY: number }) => void;
  follow: (e: { absoluteX: number; absoluteY: number }) => void;
  finish: (drop: boolean) => void;
}

function BoardCardItem({ card, columnId, movable, acts, dragged, onOpen, onPick, handlers, onMeasured }: {
  card: BoardCard;
  columnId: string;
  movable: boolean;
  acts: boolean;
  dragged: boolean;
  onOpen: (card: BoardCard) => void;
  onPick: () => void;
  handlers: React.RefObject<Handlers>;
  onMeasured: (layout: { y: number; height: number }) => void;
}) {
  const width = useRef(COLUMN_WIDTH);
  const pan = useMemo(() => Gesture.Pan()
    .enabled(movable)
    .activateAfterLongPress(280)
    .runOnJS(true)
    .onStart((e) => handlers.current.lift(card, columnId, width.current, e))
    .onUpdate((e) => handlers.current.follow(e))
    .onEnd((_e, success) => handlers.current.finish(success))
    .onFinalize((_e, success) => { if (!success) handlers.current.finish(false); }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [card, columnId, movable]);
  const body = <CardBody card={card} movable={movable} onPick={onPick} style={dragged ? styles.cardLifted : undefined} />;
  return (
    <GestureDetector gesture={pan}>
      <View collapsable={false} onLayout={(e) => {
        width.current = e.nativeEvent.layout.width;
        onMeasured({ y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height });
      }}>
        {acts ? (
          // a touchable swallows what is inside it for a screen reader, ⋯ included: Move is its action
          <TouchableOpacity {...buttonA11y()} onPress={() => onOpen(card)}
            accessibilityActions={movable ? [{ name: 'activate' }, { name: 'move', label: 'Move' }] : undefined}
            onAccessibilityAction={(e) => { if (e.nativeEvent.actionName === 'move') onPick(); else onOpen(card); }}>
            {body}
          </TouchableOpacity>
        ) : body}
      </View>
    </GestureDetector>
  );
}

const styles = themed(() => StyleSheet.create({
  board: { position: 'relative' },
  columns: { gap: 12, paddingBottom: 4 },
  column: { width: COLUMN_WIDTH, backgroundColor: theme.background, borderRadius: theme.radiusMd, padding: 10 },
  columnTarget: { backgroundColor: theme.primaryContainer },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 6, marginBottom: 8, borderBottomWidth: 2 },
  title: { fontWeight: '600', flex: 1, color: theme.ink },
  count: { fontSize: 12, color: theme.onPrimaryContainer, backgroundColor: theme.primaryContainer, borderRadius: 999, paddingHorizontal: 8, overflow: 'hidden' },
  list: { flex: 1 },
  listContent: { gap: 8, paddingBottom: 8, flexGrow: 1 },
  card: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderLeftWidth: 4, borderRadius: theme.radiusMd, padding: 12, gap: 4 },
  cardLifted: { opacity: 0.35 },
  cardTitle: { fontWeight: '600', color: theme.ink },
  cardTitleMovable: { paddingRight: 32 },
  cardDesc: { fontSize: 12, color: theme.muted },
  move: { position: 'absolute', top: -2, right: -2, margin: 0 },
  moveRow: { minHeight: 48, justifyContent: 'center' },
  badge: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '600', color: theme.onPrimaryContainer, backgroundColor: theme.primaryContainer, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  line: { position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 2, backgroundColor: theme.primary },
  floating: { position: 'absolute', left: 0, top: 0, zIndex: 10, elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, borderRadius: theme.radiusMd },
}));
