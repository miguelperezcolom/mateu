import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ComponentRenderer } from './ComponentRenderer';
import { useAppContext } from '../context/AppContext';

type Dict = Record<string, unknown>;
const meta = (c: unknown): Dict => ((c as Dict)?.['metadata'] as Dict) ?? {};
const childrenOf = (c: unknown): unknown[] => ((c as Dict)?.['children'] as unknown[]) ?? [];

function Children({ component, state }: { component: unknown; state: Dict }) {
  return (
    <>
      {childrenOf(component).map((child, i) => (
        <ComponentRenderer key={i} component={child} state={state} />
      ))}
    </>
  );
}

// ── Sections / cards ──────────────────────────────────────────────────────────
export function SectionRenderer({ component, state }: { component: unknown; state: Dict }) {
  const title = (meta(component)['title'] as string) ?? '';
  return (
    <View style={styles.card}>
      {!!title && <Text style={styles.cardTitle}>{title}</Text>}
      <Children component={component} state={state} />
    </View>
  );
}

export function SubSectionRenderer({ component, state }: { component: unknown; state: Dict }) {
  const title = (meta(component)['title'] as string) ?? '';
  return (
    <View style={styles.subsection}>
      {!!title && <Text style={styles.subTitle}>{title}</Text>}
      <Children component={component} state={state} />
    </View>
  );
}

export function CardRenderer({ component, state }: { component: unknown; state: Dict }) {
  const m = meta(component);
  const title = m['title'];
  return (
    <View style={styles.card}>
      {typeof title === 'string' && !!title && <Text style={styles.cardTitle}>{title}</Text>}
      {typeof title === 'object' && title && <ComponentRenderer component={title} state={state} />}
      {!!m['content'] && typeof m['content'] === 'object' && <ComponentRenderer component={m['content']} state={state} />}
      <Children component={component} state={state} />
      {!!m['footer'] && typeof m['footer'] === 'object' && <ComponentRenderer component={m['footer']} state={state} />}
    </View>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
export function TabsRenderer({ component, state }: { component: unknown; state: Dict }) {
  const tabs = childrenOf(component);
  const [selected, setSelected] = useState(0);
  const active = tabs[selected] as Dict | undefined;
  return (
    <View>
      <View style={styles.tabBar}>
        {tabs.map((t, i) => (
          <TouchableOpacity key={i} style={[styles.tab, i === selected && styles.tabActive]} onPress={() => setSelected(i)}>
            <Text style={[styles.tabText, i === selected && styles.tabTextActive]}>{(meta(t)['label'] as string) ?? ''}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.tabContent}>
        {active && <Children component={active} state={state} />}
      </View>
    </View>
  );
}

// ── Accordion ────────────────────────────────────────────────────────────────
export function AccordionRenderer({ component, state }: { component: unknown; state: Dict }) {
  const panels = childrenOf(component);
  const [open, setOpen] = useState<Record<number, boolean>>(() => {
    const o: Record<number, boolean> = {};
    panels.forEach((p, i) => { if (meta(p)['active']) o[i] = true; });
    return o;
  });
  return (
    <View>
      {panels.map((p, i) => (
        <View key={i} style={styles.panel}>
          <TouchableOpacity style={styles.panelHeader} onPress={() => setOpen({ ...open, [i]: !open[i] })}>
            <Text style={styles.panelTitle}>{(meta(p)['label'] as string) ?? ''}</Text>
            <Text style={styles.panelChevron}>{open[i] ? '▾' : '▸'}</Text>
          </TouchableOpacity>
          {open[i] && <View style={styles.panelBody}><Children component={p} state={state} /></View>}
        </View>
      ))}
    </View>
  );
}

// ── Split ────────────────────────────────────────────────────────────────────
export function SplitRenderer({ component, state }: { component: unknown; state: Dict }) {
  const vertical = (meta(component)['orientation'] as string) === 'vertical';
  return (
    <View style={{ flexDirection: vertical ? 'column' : 'row', gap: 12 }}>
      {childrenOf(component).map((c, i) => (
        <View key={i} style={{ flex: 1 }}><ComponentRenderer component={c} state={state} /></View>
      ))}
    </View>
  );
}

// ── Badge / Anchor / ProgressBar ────────────────────────────────────────────────
export function BadgeRenderer({ metadata }: { metadata: Dict }) {
  const color = (metadata['color'] as string) ?? '';
  const bg = color === 'success' ? '#3e8635' : color === 'error' || color === 'danger' ? '#c9190b'
    : color === 'warning' ? '#f0ab00' : color === 'info' ? '#2b9af3' : '#6a6e73';
  return <Text style={[styles.badge, { backgroundColor: bg }]}>{(metadata['text'] as string) ?? ''}</Text>;
}

export function AnchorRenderer({ metadata }: { metadata: Dict }) {
  const { navigate } = useAppContext();
  const url = (metadata['url'] as string) ?? '';
  const text = (metadata['text'] as string) ?? url;
  return (
    <TouchableOpacity onPress={() => { if (url.startsWith('/')) navigate(url, '', ''); }}>
      <Text style={styles.link}>{text}</Text>
    </TouchableOpacity>
  );
}

export function ProgressBarRenderer({ metadata, state }: { metadata: Dict; state: Dict }) {
  const min = (metadata['min'] as number) ?? 0;
  const max = (metadata['max'] as number) ?? 1;
  const key = (metadata['valueKey'] as string) ?? '';
  const raw = key && state[key] != null ? Number(state[key]) : Number(metadata['value'] ?? 0);
  const frac = max - min === 0 ? 0 : Math.max(0, Math.min(1, (raw - min) / (max - min)));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${frac * 100}%` }]} />
    </View>
  );
}

// ── Dialog / ConfirmDialog (styled card) ──────────────────────────────────────────
export function DialogRenderer({ component, state }: { component: unknown; state: Dict }) {
  const m = meta(component);
  return (
    <View style={styles.dialog}>
      {!!m['headerTitle'] && <Text style={styles.dialogTitle}>{m['headerTitle'] as string}</Text>}
      {!!m['content'] && typeof m['content'] === 'object' && <ComponentRenderer component={m['content']} state={state} />}
      <Children component={component} state={state} />
      {!!m['footer'] && typeof m['footer'] === 'object' && <ComponentRenderer component={m['footer']} state={state} />}
    </View>
  );
}

export function ConfirmDialogRenderer({ metadata, state }: { metadata: Dict; state: Dict }) {
  const { runAction } = useAppContext();
  const m = metadata;
  return (
    <View style={styles.dialog}>
      {!!m['header'] && <Text style={styles.dialogTitle}>{m['header'] as string}</Text>}
      {!!m['content'] && typeof m['content'] === 'object' && <ComponentRenderer component={m['content']} state={state} />}
      <View style={styles.dialogFooter}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => runAction((m['confirmActionId'] as string) ?? '')}>
          <Text style={styles.btnPrimaryText}>{(m['confirmText'] as string) ?? 'OK'}</Text>
        </TouchableOpacity>
        {!!m['canReject'] && (
          <TouchableOpacity style={styles.btnDefault} onPress={() => runAction((m['rejectActionId'] as string) ?? '')}>
            <Text>{(m['rejectText'] as string) ?? 'No'}</Text>
          </TouchableOpacity>
        )}
        {!!m['canCancel'] && (
          <TouchableOpacity style={styles.btnDefault} onPress={() => runAction((m['cancelActionId'] as string) ?? '')}>
            <Text>{(m['cancelText'] as string) ?? 'Cancel'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderColor: '#d2d2d2', borderWidth: 1, borderRadius: 6, padding: 16, marginBottom: 12, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  subsection: { gap: 6, marginVertical: 8 },
  subTitle: { fontWeight: '700' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d2d2d2', gap: 4 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#0066cc' },
  tabText: { color: '#333' },
  tabTextActive: { color: '#0066cc', fontWeight: '700' },
  tabContent: { paddingVertical: 12 },
  panel: { borderWidth: 1, borderColor: '#d2d2d2', borderRadius: 6, marginBottom: 8, overflow: 'hidden' },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#fafafa' },
  panelTitle: { fontWeight: '700' },
  panelChevron: { color: '#666' },
  panelBody: { padding: 12 },
  badge: { color: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden', alignSelf: 'flex-start', fontSize: 12 },
  link: { color: '#0066cc', textDecorationLine: 'underline' },
  progressTrack: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#0066cc' },
  dialog: { backgroundColor: '#fff', borderColor: '#8a8d90', borderWidth: 1, borderRadius: 8, padding: 20, gap: 12, marginVertical: 12 },
  dialogTitle: { fontSize: 18, fontWeight: '700' },
  dialogFooter: { flexDirection: 'row', gap: 8 },
  btnPrimary: { backgroundColor: '#0066cc', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  btnPrimaryText: { color: '#fff' },
  btnDefault: { backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc' },
});
