import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useViewController } from './MateuViewHost';
import { ComponentRenderer } from './ComponentRenderer';
import { DashboardPanel, MetricCard } from '../api/metadata';

type Dict = Record<string, unknown>;
const meta = (c: unknown): Dict => ((c as Dict)?.['metadata'] as Dict) ?? {};
const childrenOf = (c: unknown): unknown[] => ((c as Dict)?.['children'] as unknown[]) ?? [];

// Icons arrive as web icon tokens ("vaadin:chart") or emoji — only emoji/plain text render natively.
const displayIcon = (icon?: string): string => (icon && !icon.includes(':') ? icon : '');

// ── MetricCard ────────────────────────────────────────────────────────────────
export function MetricCardRenderer({ metadata }: { metadata: MetricCard }) {
  const controller = useViewController();
  const runAction = (actionId: string) => void controller.runAction(actionId);
  const trend = metadata.trend ?? 'neutral';
  const trendColor = trend === 'up' ? '#1a7f37' : trend === 'down' ? '#c5221f' : '#666';
  const trendArrow = trend === 'up' ? '▲ ' : trend === 'down' ? '▼ ' : '';
  const icon = displayIcon(metadata.icon);
  const actionId = metadata.actionId;

  const body = (
    <>
      <View style={styles.metricHeader}>
        <Text style={styles.metricTitle} numberOfLines={1}>{metadata.title ?? ''}</Text>
        {!!icon && <Text style={styles.metricIcon}>{icon}</Text>}
      </View>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{metadata.value ?? ''}</Text>
        {!!metadata.unit && <Text style={styles.metricUnit}>{metadata.unit}</Text>}
      </View>
      {(!!metadata.trend || !!metadata.trendLabel) && (
        <Text style={[styles.metricTrend, { color: trendColor }]}>
          {trendArrow}{metadata.trendLabel ?? ''}
        </Text>
      )}
      {!!metadata.description && <Text style={styles.metricDescription}>{metadata.description}</Text>}
    </>
  );

  if (actionId) {
    return (
      <TouchableOpacity style={styles.metricCard} onPress={() => runAction(actionId)}>
        {body}
      </TouchableOpacity>
    );
  }
  return <View style={styles.metricCard}>{body}</View>;
}

// ── Scoreboard (horizontal KPI band; children = MetricCards) ─────────────────
export function ScoreboardRenderer({ component, state }: { component: unknown; state: Dict }) {
  return (
    <View style={styles.scoreboard}>
      {childrenOf(component).map((child, i) => (
        <View key={i} style={styles.scoreboardItem}>
          <ComponentRenderer component={child} state={state} />
        </View>
      ))}
    </View>
  );
}

// ── DashboardPanel (titled card tile) ─────────────────────────────────────────
export function DashboardPanelRenderer({ component, state }: { component: unknown; state: Dict }) {
  const m = meta(component) as unknown as DashboardPanel;
  return (
    <View style={styles.panelCard}>
      {!!m.title && (
        <View style={styles.panelCardHeader}>
          <Text style={styles.panelCardTitle}>{m.title}</Text>
          {!!m.subtitle && <Text style={styles.panelCardSubtitle}>{m.subtitle}</Text>}
        </View>
      )}
      {childrenOf(component).map((child, i) => (
        <ComponentRenderer key={i} component={child} state={state} />
      ))}
    </View>
  );
}

// ── DashboardLayout (mobile-first: single column stack, Scoreboards first) ───
export function DashboardLayoutRenderer({ component, state }: { component: unknown; state: Dict }) {
  const children = childrenOf(component);
  const isScoreboard = (c: unknown) => (meta(c)['type'] as string) === 'Scoreboard';
  const scoreboards = children.filter(isScoreboard);
  const rest = children.filter((c) => !isScoreboard(c));
  return (
    <View style={styles.dashboard}>
      {[...scoreboards, ...rest].map((child, i) => (
        <ComponentRenderer key={i} component={child} state={state} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: { backgroundColor: '#fff', borderColor: '#d2d2d2', borderWidth: 1, borderRadius: 8, padding: 12, gap: 4, flex: 1 },
  metricHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  metricTitle: { fontSize: 13, color: '#666', flexShrink: 1 },
  metricIcon: { fontSize: 14, color: '#999' },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  metricValue: { fontSize: 28, fontWeight: '700', lineHeight: 32, color: '#1a1a1a' },
  metricUnit: { fontSize: 15, color: '#666' },
  metricTrend: { fontSize: 13 },
  metricDescription: { fontSize: 12, color: '#999' },
  scoreboard: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  scoreboardItem: { flexGrow: 1, flexBasis: 140 },
  panelCard: { backgroundColor: '#fff', borderColor: '#d2d2d2', borderWidth: 1, borderRadius: 8, padding: 16, gap: 8 },
  panelCardHeader: { gap: 2 },
  panelCardTitle: { fontSize: 16, fontWeight: '700' },
  panelCardSubtitle: { fontSize: 13, color: '#666' },
  dashboard: { gap: 12 },
});
