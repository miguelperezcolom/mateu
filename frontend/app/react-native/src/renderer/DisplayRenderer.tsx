import React, { useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useViewController } from './MateuViewHost';
import { ComponentRenderer } from './ComponentRenderer';
import { EmptyState, FoldoutPanelInfo, GanttTask, HeroSection, KanbanColumn, Skeleton } from '../api/metadata';

type Dict = Record<string, unknown>;
const meta = (c: unknown): Dict => ((c as Dict)?.['metadata'] as Dict) ?? {};
const childrenOf = (c: unknown): unknown[] => ((c as Dict)?.['children'] as unknown[]) ?? [];
const slotOf = (c: unknown): string => ((c as Dict)?.['slot'] as string) ?? '';

// Icons arrive as web icon tokens ("vaadin:chart") or emoji — only emoji/plain text render natively.
const displayIcon = (icon?: string): string => (icon && !icon.includes(':') ? icon : '');

// ── FoldoutLayout (mobile adaptation: overview card + accordion of panels) ───
export function FoldoutRenderer({ component, state }: { component: unknown; state: Dict }) {
  const panels = (meta(component)['panels'] as FoldoutPanelInfo[]) ?? [];
  const children = childrenOf(component);
  const overview = children.find((c) => slotOf(c) === 'overview');
  const [open, setOpen] = useState<Record<number, boolean>>(() => {
    const o: Record<number, boolean> = {};
    panels.forEach((p, i) => { if (p.open) o[i] = true; });
    return o;
  });
  return (
    <View style={styles.foldout}>
      {!!overview && (
        <View style={styles.foldoutOverview}>
          <ComponentRenderer component={overview} state={state} />
        </View>
      )}
      {panels.map((p, i) => {
        const content = children.find((c) => slotOf(c) === `panel-${i}`);
        const icon = displayIcon(p.icon);
        return (
          <View key={i} style={styles.foldoutPanel}>
            <TouchableOpacity style={styles.foldoutHeader} onPress={() => setOpen({ ...open, [i]: !open[i] })}>
              <View style={styles.foldoutHeaderText}>
                <Text style={styles.foldoutTitle}>{icon ? `${icon} ` : ''}{p.title ?? ''}</Text>
                {!!p.subtitle && <Text style={styles.foldoutSubtitle}>{p.subtitle}</Text>}
              </View>
              <Text style={styles.foldoutChevron}>{open[i] ? '▾' : '▸'}</Text>
            </TouchableOpacity>
            {!!open[i] && !!content && (
              <View style={styles.foldoutBody}>
                <ComponentRenderer component={content} state={state} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ── HeroSection ───────────────────────────────────────────────────────────────
const heroHeight = (height?: string): number => {
  if (!height) return 180;
  const value = parseFloat(height);
  if (isNaN(value)) return 180;
  if (height.includes('rem') || height.includes('em')) return value * 16;
  return value;
};

export function HeroSectionRenderer({ component, state }: { component: unknown; state: Dict }) {
  const m = meta(component) as unknown as HeroSection;
  const children = childrenOf(component);
  const centered = m.centered !== false;
  const onImage = !!m.image;

  const content = (
    <View style={[styles.heroContent, { alignItems: centered ? 'center' : 'flex-start' }]}>
      {!!m.title && (
        <Text style={[styles.heroTitle, onImage && styles.heroTextOnImage, { textAlign: centered ? 'center' : 'left' }]}>
          {m.title}
        </Text>
      )}
      {!!m.subtitle && (
        <Text style={[styles.heroSubtitle, onImage && styles.heroTextOnImage, { textAlign: centered ? 'center' : 'left' }]}>
          {m.subtitle}
        </Text>
      )}
      {children.length > 0 && (
        <View style={[styles.heroCtas, { justifyContent: centered ? 'center' : 'flex-start' }]}>
          {children.map((child, i) => (
            <ComponentRenderer key={i} component={child} state={state} />
          ))}
        </View>
      )}
    </View>
  );

  if (m.image) {
    return (
      <ImageBackground source={{ uri: m.image }} style={[styles.hero, { minHeight: heroHeight(m.height) }]} imageStyle={styles.heroImage}>
        <View style={styles.heroOverlay} />
        {content}
      </ImageBackground>
    );
  }
  return <View style={[styles.hero, styles.heroPlain, { minHeight: heroHeight(m.height) }]}>{content}</View>;
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyStateRenderer({ metadata }: { metadata: EmptyState }) {
  const controller = useViewController();
  const runAction = (actionId: string) => void controller.runAction(actionId);
  const actionId = metadata.actionId;
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{metadata.icon ?? '🗂'}</Text>
      {!!metadata.title && <Text style={styles.emptyTitle}>{metadata.title}</Text>}
      <Text style={styles.emptyDescription}>{metadata.description ?? 'Nothing here yet.'}</Text>
      {!!actionId && !!metadata.actionLabel && (
        <TouchableOpacity style={styles.emptyBtn} onPress={() => runAction(actionId)}>
          <Text style={styles.emptyBtnText}>{metadata.actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Skeleton (grey rounded placeholder blocks) ────────────────────────────────
export function SkeletonRenderer({ metadata }: { metadata: Skeleton }) {
  const variant = metadata.variant ?? 'text';
  const count = metadata.count && metadata.count > 0 ? metadata.count : 3;
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <View style={styles.skeleton}>
      {items.map((i) => {
        if (variant === 'card') return <View key={i} style={[styles.bone, styles.boneCard]} />;
        if (variant === 'grid') return <View key={i} style={[styles.bone, styles.boneRow]} />;
        if (variant === 'form') {
          return (
            <View key={i} style={styles.boneFormPair}>
              <View style={[styles.bone, styles.boneLabel]} />
              <View style={[styles.bone, styles.boneField]} />
            </View>
          );
        }
        return <View key={i} style={[styles.bone, styles.boneText, i === count - 1 && styles.boneTextLast]} />;
      })}
    </View>
  );
}

// ── Gantt (horizontal-scrollable timeline with proportional bars) ─────────────
const DAY_MS = 86400000;
const GANTT_ROW_H = 30;
const GANTT_HEADER_H = 22;

const parseDay = (s?: string): number | null => {
  if (!s) return null;
  const t = Date.parse(`${s}T00:00:00Z`);
  return isNaN(t) ? null : Math.floor(t / DAY_MS);
};

export function GanttRenderer({ component }: { component: unknown }) {
  const tasks = ((meta(component)['tasks'] as GanttTask[]) ?? []).filter(
    (t) => parseDay(t.start) != null && parseDay(t.end) != null,
  );
  if (tasks.length === 0) return <Text style={styles.ganttEmpty}>No tasks.</Text>;

  const minDay = Math.min(...tasks.map((t) => parseDay(t.start)!));
  const maxDay = Math.max(...tasks.map((t) => parseDay(t.end)!));
  const totalDays = Math.max(1, maxDay - minDay + 1);
  const dayW = Math.max(4, Math.min(16, Math.round(560 / totalDays)));
  const laneW = totalDays * dayW;
  const todayDay = Math.floor(Date.now() / DAY_MS);
  const todayX = todayDay >= minDay && todayDay <= maxDay ? (todayDay - minDay) * dayW : null;

  // Month tick labels along the header.
  const months: { label: string; left: number }[] = [];
  const cursor = new Date(minDay * DAY_MS);
  cursor.setUTCDate(1);
  while (Math.floor(cursor.getTime() / DAY_MS) <= maxDay) {
    const day = Math.floor(cursor.getTime() / DAY_MS);
    if (day >= minDay) {
      months.push({ label: cursor.toISOString().slice(0, 7), left: (day - minDay) * dayW });
    }
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return (
    <View style={styles.gantt}>
      <View style={styles.ganttLabels}>
        <View style={{ height: GANTT_HEADER_H }} />
        {tasks.map((t, i) => (
          <View key={t.id ?? i} style={styles.ganttLabelRow}>
            <Text style={styles.ganttLabel} numberOfLines={1}>{t.title ?? t.id ?? ''}</Text>
          </View>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: laneW }}>
          <View style={styles.ganttHeader}>
            {months.map((mth, i) => (
              <Text key={i} style={[styles.ganttMonth, { left: mth.left }]}>{mth.label}</Text>
            ))}
          </View>
          <View>
            {tasks.map((t, i) => {
              const start = parseDay(t.start)!;
              const end = parseDay(t.end)!;
              const left = (start - minDay) * dayW;
              const width = Math.max(dayW, (end - start + 1) * dayW);
              const progress = Math.max(0, Math.min(100, t.progress ?? 0));
              return (
                <View key={t.id ?? i} style={styles.ganttRow}>
                  <View style={[styles.ganttBar, { left, width, backgroundColor: t.color ?? '#b3d1f0' }]}>
                    <View style={[styles.ganttProgress, { width: `${progress}%` }]} />
                  </View>
                </View>
              );
            })}
            {todayX != null && <View style={[styles.ganttToday, { left: todayX }]} />}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Kanban (horizontal scroll of columns, each a stack of cards) ──────────────
export function KanbanRenderer({ component }: { component: unknown }) {
  const controller = useViewController();
  const columns = (meta(component)['columns'] as KanbanColumn[]) ?? [];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kanbanBoard}>
      {columns.map((col, i) => (
        <View key={col.id ?? i} style={styles.kanbanColumn}>
          <View style={[styles.kanbanHead, { borderBottomColor: col.color ?? '#cbd5e1' }]}>
            <Text style={styles.kanbanTitle} numberOfLines={1}>{col.title ?? ''}</Text>
            <Text style={styles.kanbanCount}>{col.cards?.length ?? 0}</Text>
          </View>
          {(col.cards ?? []).map((card, j) => {
            const body = (
              <View key={card.id ?? j} style={[styles.kanbanCard, { borderLeftColor: card.color ?? 'transparent' }]}>
                <Text style={styles.kanbanCardTitle}>{card.title ?? ''}</Text>
                {!!card.description && <Text style={styles.kanbanCardDesc}>{card.description}</Text>}
                {!!card.badge && <Text style={styles.kanbanBadge}>{card.badge}</Text>}
              </View>
            );
            return card.actionId ? (
              <TouchableOpacity key={card.id ?? j} onPress={() => void controller.runAction(card.actionId!)}>
                {body}
              </TouchableOpacity>
            ) : body;
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Foldout
  foldout: { gap: 12 },
  foldoutOverview: { backgroundColor: '#fff', borderColor: '#d2d2d2', borderWidth: 1, borderRadius: 8, padding: 16 },
  foldoutPanel: { borderWidth: 1, borderColor: '#d2d2d2', borderRadius: 8, overflow: 'hidden' },
  foldoutHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#fafafa' },
  foldoutHeaderText: { flex: 1, gap: 2 },
  foldoutTitle: { fontWeight: '700' },
  foldoutSubtitle: { fontSize: 12, color: '#666' },
  foldoutChevron: { color: '#666', marginLeft: 8 },
  foldoutBody: { padding: 12, backgroundColor: '#fff' },
  // Hero
  hero: { borderRadius: 12, overflow: 'hidden', justifyContent: 'center' },
  heroPlain: { backgroundColor: '#f5f5f5' },
  heroImage: { borderRadius: 12 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroContent: { padding: 24, gap: 8 },
  heroTitle: { fontSize: 28, fontWeight: '700', lineHeight: 34, color: '#1a1a1a' },
  heroSubtitle: { fontSize: 16, color: '#666' },
  heroTextOnImage: { color: '#fff' },
  heroCtas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  // EmptyState
  emptyState: { alignItems: 'center', justifyContent: 'center', gap: 6, padding: 24 },
  emptyIcon: { fontSize: 30, opacity: 0.6 },
  emptyTitle: { fontWeight: '600', color: '#333' },
  emptyDescription: { fontSize: 13, color: '#666', textAlign: 'center' },
  emptyBtn: { marginTop: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ccc' },
  emptyBtnText: { color: '#0066cc', fontSize: 14 },
  // Skeleton
  skeleton: { gap: 8, flex: 1 },
  bone: { backgroundColor: '#e5e5e5', borderRadius: 6 },
  boneText: { height: 12, alignSelf: 'stretch' },
  boneTextLast: { width: '60%', alignSelf: 'flex-start' },
  boneCard: { height: 90, alignSelf: 'stretch' },
  boneRow: { height: 36, alignSelf: 'stretch' },
  boneFormPair: { gap: 4 },
  boneLabel: { height: 10, width: '35%' },
  boneField: { height: 32, alignSelf: 'stretch' },
  // Gantt
  gantt: { flexDirection: 'row', borderWidth: 1, borderColor: '#d2d2d2', borderRadius: 8, padding: 8, backgroundColor: '#fff' },
  ganttLabels: { width: 110, marginRight: 8 },
  ganttLabelRow: { height: GANTT_ROW_H, justifyContent: 'center' },
  ganttLabel: { fontSize: 12, color: '#333' },
  ganttHeader: { height: GANTT_HEADER_H },
  ganttMonth: { position: 'absolute', top: 2, fontSize: 10, color: '#999' },
  ganttRow: { height: GANTT_ROW_H, justifyContent: 'center' },
  ganttBar: { position: 'absolute', height: 18, borderRadius: 4, overflow: 'hidden', justifyContent: 'center' },
  ganttProgress: { height: '100%', backgroundColor: 'rgba(0,0,0,0.25)' },
  ganttToday: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#c5221f' },
  ganttEmpty: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  // Kanban
  kanbanBoard: { gap: 12, paddingBottom: 4 },
  kanbanColumn: { width: 220, gap: 8, backgroundColor: '#f4f4f5', borderRadius: 12, padding: 10 },
  kanbanHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 6, borderBottomWidth: 2 },
  kanbanTitle: { fontWeight: '600', flex: 1, color: '#222' },
  kanbanCount: { fontSize: 12, color: '#666', backgroundColor: '#e4e4e7', borderRadius: 999, paddingHorizontal: 8, overflow: 'hidden' },
  kanbanCard: { backgroundColor: '#fff', borderColor: '#e4e4e7', borderWidth: 1, borderLeftWidth: 3, borderRadius: 8, padding: 10, gap: 4 },
  kanbanCardTitle: { fontWeight: '600', color: '#222' },
  kanbanCardDesc: { fontSize: 12, color: '#666' },
  kanbanBadge: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '600', color: '#1a73e8', backgroundColor: 'rgba(26,115,232,0.1)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, overflow: 'hidden' },
});
