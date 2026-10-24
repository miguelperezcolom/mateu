import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { ComponentRenderer } from './ComponentRenderer';
import { interpolate } from '../core/expressions';
import { progressFraction } from '../core/uxRules';
import { useViewController } from './MateuViewHost';
import { theme, themed } from '../theme';
import { Card, List, ProgressBar, SegmentedButtons, Text as PaperText } from 'react-native-paper';
import { MateuButton, StatusChip } from '../ui/controls';
import { headingA11y } from '../a11y/a11y';
import { buttonA11y } from '../a11y/a11y';
import { popoverOpensOnPress } from './hoverDetails';
import { openExternal } from './openExternal';

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
  const title = interpolate((meta(component)['title'] as string) ?? '', { state });
  return (
    // a Material outlined card with its title as the card's heading
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.cardContent}>
        {!!title && <PaperText variant="titleMedium" style={styles.cardTitle} {...headingA11y(2)}>{title}</PaperText>}
        <Children component={component} state={state} />
      </Card.Content>
    </Card>
  );
}

export function SubSectionRenderer({ component, state }: { component: unknown; state: Dict }) {
  const title = interpolate((meta(component)['title'] as string) ?? '', { state });
  return (
    <View style={styles.subsection}>
      {!!title && <PaperText variant="titleSmall" style={styles.subTitle} {...headingA11y(3)}>{title}</PaperText>}
      <Children component={component} state={state} />
    </View>
  );
}

export function CardRenderer({ component, state }: { component: unknown; state: Dict }) {
  const m = meta(component);
  const title = m['title'];
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.cardContent}>
        {typeof title === 'string' && !!title && <PaperText variant="titleMedium" style={styles.cardTitle} {...headingA11y(2)}>{interpolate(title, { state })}</PaperText>}
        {typeof title === 'object' && title && <ComponentRenderer component={title} state={state} />}
        {!!m['content'] && typeof m['content'] === 'object' && <ComponentRenderer component={m['content']} state={state} />}
        <Children component={component} state={state} />
        {!!m['footer'] && typeof m['footer'] === 'object' && <ComponentRenderer component={m['footer']} state={state} />}
      </Card.Content>
    </Card>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
export function TabsRenderer({ component, state }: { component: unknown; state: Dict }) {
  const tabs = childrenOf(component);
  // @Tab(open=true) marks the initially-selected tab (first-declared wins, else index 0)
  const [selected, setSelected] = useState(() => Math.max(0, tabs.findIndex((t) => meta(t)['active'] === true)));
  const active = tabs[selected] as Dict | undefined;
  return (
    <View>
      {tabs.length <= 4 ? (
        // a handful of tabs: Material segmented buttons (each a tab with its selected state)
        <SegmentedButtons
          style={styles.segments}
          value={String(selected)}
          onValueChange={(v) => setSelected(Number(v))}
          buttons={tabs.map((t, i) => ({
            value: String(i),
            label: interpolate((meta(t)['label'] as string) ?? '', { state }),
            accessibilityLabel: interpolate((meta(t)['label'] as string) ?? '', { state }),
            showSelectedCheck: false,
            labelStyle: styles.segmentLabel,
          }))}
        />
      ) : (
        // more: a scrollable underlined tab bar (segments would squeeze the labels)
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} accessibilityRole="tablist">
          {tabs.map((t, i) => (
            <TouchableOpacity {...buttonA11y({ role: 'tab', selected: i === selected })} key={i} style={[styles.tab, i === selected && styles.tabActive]} onPress={() => setSelected(i)}>
              <Text style={[styles.tabText, i === selected && styles.tabTextActive]}>{interpolate((meta(t)['label'] as string) ?? '', { state })}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
          <List.Accordion
            title={interpolate((meta(p)['label'] as string) ?? '', { state })}
            expanded={!!open[i]}
            onPress={() => setOpen({ ...open, [i]: !open[i] })}
            style={styles.panelHeader}
            titleStyle={styles.panelTitle}
          >
            <View style={styles.panelBody}><Children component={p} state={state} /></View>
          </List.Accordion>
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
  return <StatusChip label={(metadata['text'] as string) ?? ''} tone={(metadata['color'] as string) ?? ''} />;
}

export function AnchorRenderer({ metadata }: { metadata: Dict }) {
  const controller = useViewController();
  const navigate = (url: string) => controller.session.openView({ label: url, route: url, consumedRoute: '', serverSideType: '' });
  const url = (metadata['url'] as string) ?? '';
  const text = (metadata['text'] as string) ?? url;
  // Internal routes open in-app; external URLs (or target="_blank") hand off to the OS browser.
  const external = !url.startsWith('/') || (metadata['target'] as string) === '_blank';
  return (
    <TouchableOpacity {...buttonA11y()} onPress={() => { if (!url) return; if (external) { openExternal(url); } else { navigate(url); } }}>
      <Text style={styles.link}>{text}</Text>
    </TouchableOpacity>
  );
}

export function ProgressBarRenderer({ metadata, state }: { metadata: Dict; state: Dict }) {
  const frac = progressFraction(metadata, state);
  // RN-18: the bar's own text (a wizard sends "Step 2") was dropped, so the bar alone had to say
  // where the user was; and it was invisible to screen readers. Now the text shows above the bar,
  // and the bar is a progressbar with its value.
  const text = (metadata['text'] as string) ?? '';
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={text || undefined}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(frac * 100) }}
    >
      {!!text && <Text style={styles.progressText}>{text}</Text>}
      <ProgressBar progress={frac} color={theme.primary} style={styles.progressTrack} />
    </View>
  );
}

// ── Dialog / ConfirmDialog (styled card) ──────────────────────────────────────────
export function DialogRenderer({ component, state }: { component: unknown; state: Dict }) {
  const m = meta(component);
  return (
    <View style={styles.dialog}>
      {!!m['headerTitle'] && <PaperText variant="headlineSmall" style={styles.dialogTitle}>{m['headerTitle'] as string}</PaperText>}
      {!!m['content'] && typeof m['content'] === 'object' && <ComponentRenderer component={m['content']} state={state} />}
      <Children component={component} state={state} />
      {!!m['footer'] && typeof m['footer'] === 'object' && <ComponentRenderer component={m['footer']} state={state} />}
    </View>
  );
}

// ── Popover ───────────────────────────────────────────────────────────────────
/**
 * A popover: the wrapped component, and its content in a small floating panel shown under it.
 * `trigger: "hover"` has no meaning on a touch screen (no pointer to hover with), so a hover
 * popover opens on PRESS exactly like a click one; pressing again closes it.
 */
export function PopoverRenderer({ component, state }: { component: unknown; state: Dict }) {
  const m = meta(component);
  const [open, setOpen] = useState(false);
  const opensOnPress = popoverOpensOnPress(m['trigger']);
  return (
    <View style={styles.popoverHost}>
      <TouchableOpacity
        {...buttonA11y({ expanded: open, hint: open ? 'Hides the details' : 'Shows the details' })}
        disabled={!opensOnPress}
        onPress={() => setOpen(!open)}
      >
        {!!m['wrapped'] && typeof m['wrapped'] === 'object' && <ComponentRenderer component={m['wrapped']} state={state} />}
      </TouchableOpacity>
      {open && !!m['content'] && typeof m['content'] === 'object' && (
        <View style={styles.popoverPanel} accessibilityLiveRegion="polite">
          <ComponentRenderer component={m['content']} state={state} />
        </View>
      )}
    </View>
  );
}

export function ConfirmDialogRenderer({ metadata, state }: { metadata: Dict; state: Dict }) {
  const controller = useViewController();
  const runAction = (actionId: string) => void controller.runAction(actionId);
  const m = metadata;
  return (
    <View style={styles.dialog}>
      {!!m['header'] && <PaperText variant="headlineSmall" style={styles.dialogTitle}>{m['header'] as string}</PaperText>}
      {!!m['content'] && typeof m['content'] === 'object' && <ComponentRenderer component={m['content']} state={state} />}
      <View style={styles.dialogFooter}>
        {!!m['canCancel'] && (
          <MateuButton label={(m['cancelText'] as string) ?? 'Cancel'} buttonStyle="tertiary" onPress={() => runAction((m['cancelActionId'] as string) ?? '')} />
        )}
        {!!m['canReject'] && (
          <MateuButton label={(m['rejectText'] as string) ?? 'No'} onPress={() => runAction((m['rejectActionId'] as string) ?? '')} />
        )}
        <MateuButton label={(m['confirmText'] as string) ?? 'OK'} buttonStyle="primary" onPress={() => runAction((m['confirmActionId'] as string) ?? '')} />
      </View>
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  card: { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: theme.radiusMd, marginBottom: 16 },
  cardContent: { gap: 10, paddingTop: 16, paddingBottom: 16 },
  cardTitle: { color: theme.ink, fontWeight: '600', marginBottom: 2 },
  subsection: { gap: 6, marginVertical: 8 },
  subTitle: { color: theme.muted },
  segments: { marginBottom: 4 },
  segmentLabel: { marginHorizontal: 6 },
  tabBar: { flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
  tab: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent', minHeight: 48, justifyContent: 'center' },
  tabActive: { borderBottomColor: theme.primary },
  tabText: { color: theme.muted, fontWeight: '500' },
  tabTextActive: { color: theme.primary, fontWeight: '600' },
  tabContent: { paddingVertical: 12 },
  panel: { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, borderRadius: theme.radiusMd, marginBottom: 8, overflow: 'hidden', backgroundColor: theme.surface },
  panelHeader: { backgroundColor: theme.surface, paddingVertical: 4 },
  panelTitle: { fontWeight: '600', color: theme.ink },
  panelBody: { paddingHorizontal: 16, paddingBottom: 16 },
  link: { color: theme.primary, textDecorationLine: 'underline' },
  progressText: { fontSize: 13, color: theme.muted, marginBottom: 4 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: theme.divider, marginBottom: 8 },
  dialog: { backgroundColor: theme.surface, borderRadius: theme.radiusLg, padding: 24, gap: 16, marginVertical: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  dialogTitle: { color: theme.ink },
  popoverHost: { alignSelf: 'flex-start' },
  popoverPanel: {
    backgroundColor: theme.white, borderColor: theme.border, borderWidth: 1, borderRadius: theme.radiusSm,
    padding: 10, marginTop: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  dialogFooter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 },
}));
