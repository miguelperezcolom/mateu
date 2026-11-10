import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import { TouchableOpacity } from '../ui/Touchable';
import { accordionLook, drawsNothing, segmentsFit, tabLayoutLook } from './patternGaps';
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
import { badgeIconsOf } from './displayFigures';
import { progressBarColor } from './displayTones';
import { badgeLook } from '../ui/looks';
import { BOX_SIZES, cssToRn } from '../core/cssStyle';

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

const node = (v: unknown): Dict | null => (v && typeof v === 'object' ? (v as Dict) : null);

/** A title/subtitle slot: a plain string, or a component (a Text, usually) drawn in the slot's look. */
function CardSlotText({ value, state, variant, style }: { value: unknown; state: Dict; variant: 'titleMedium' | 'bodyMedium'; style: unknown }) {
  if (typeof value === 'string') {
    return value ? <PaperText variant={variant} style={style as never} {...(variant === 'titleMedium' ? headingA11y(2) : {})}>{interpolate(value, { state })}</PaperText> : null;
  }
  const n = node(value);
  if (!n) return null;
  const m = meta(n);
  // a plain Text in the slot takes the slot's look (the title's weight, the subtitle's muted ink)
  if (m['type'] === 'Text' && !m['container']?.toString().match(/^h[1-6]$/)) {
    return <PaperText variant={variant} style={style as never} {...(variant === 'titleMedium' ? headingA11y(2) : {})}>{interpolate(String(m['text'] ?? ''), { state })}</PaperText>;
  }
  return <ComponentRenderer component={n} state={state} />;
}

/**
 * A Card as vaadin-card draws it: `media` (an image on top, or at the start of a `horizontal`
 * card), a header row — `headerPrefix` (an avatar), the title over the `subtitle`, `headerSuffix`
 * (a price badge) — or a custom `header`, then the content and the footer. `variants`: `elevated`
 * (a raised Material card instead of an outlined one), `horizontal`, `stretchMedia`/`coverMedia`
 * (the media spans the card). Its own `style` width (`18rem`) is kept, bounded by the screen.
 */
export function CardRenderer({ component, state }: { component: unknown; state: Dict }) {
  const m = meta(component);
  if (drawsNothing(component)) return null;
  const variants = new Set(((m['variants'] as string[] | undefined) ?? []).map(String));
  const elevated = variants.has('elevated');
  const horizontal = variants.has('horizontal');
  const media = node(m['media']);
  const prefix = node(m['headerPrefix']);
  const suffix = node(m['headerSuffix']);
  const header = node(m['header']);
  const hasTitle = (typeof m['title'] === 'string' && !!m['title']) || !!node(m['title']);
  const hasSubtitle = (typeof m['subtitle'] === 'string' && !!m['subtitle']) || !!node(m['subtitle']);
  const box = cssToRn(((component as Dict)?.['style'] as string) ?? '', CARD_BOX);
  const body = (
    <View style={styles.cardBody}>
      {header ? <ComponentRenderer component={header} state={state} /> : (hasTitle || hasSubtitle || prefix || suffix) ? (
        <View style={styles.cardHeader}>
          {prefix && <View style={styles.cardHeaderSide}><ComponentRenderer component={prefix} state={state} /></View>}
          <View style={styles.cardHeaderText}>
            <CardSlotText value={m['title']} state={state} variant="titleMedium" style={styles.cardTitle} />
            <CardSlotText value={m['subtitle']} state={state} variant="bodyMedium" style={styles.cardSubtitle} />
          </View>
          {suffix && <View style={styles.cardHeaderSide}><ComponentRenderer component={suffix} state={state} /></View>}
        </View>
      ) : null}
      {!!node(m['content']) && <ComponentRenderer component={m['content']} state={state} />}
      <Children component={component} state={state} />
      {!!node(m['footer']) && <View style={styles.cardFooter}><ComponentRenderer component={m['footer']} state={state} /></View>}
    </View>
  );
  return (
    <Card mode={elevated ? 'elevated' : 'outlined'} style={[styles.card, elevated ? styles.cardElevated : null, box, { maxWidth: '100%' }]}>
      {horizontal ? (
        <View style={styles.cardRow}>
          {media && <View style={styles.cardMediaStart}><ComponentRenderer component={media} state={state} /></View>}
          <View style={styles.cardRowBody}>{body}</View>
        </View>
      ) : (
        <>
          {media && <View style={styles.cardMediaTop}><ComponentRenderer component={media} state={state} /></View>}
          {body}
        </>
      )}
    </Card>
  );
}

/** What a card takes from its own style: sizes and looks (never its flex: that is its row's). */
const CARD_BOX = new Set([...BOX_SIZES, 'background', 'background-color', 'border-radius']);

// ── Tabs ──────────────────────────────────────────────────────────────────────
export function TabsRenderer({ component, state }: { component: unknown; state: Dict }) {
  const m = meta(component);
  const tabs = childrenOf(component);
  // @Tab(open=true) marks the initially-selected tab (first-declared wins, else index 0)
  const [selected, setSelected] = useState(() => Math.max(0, tabs.findIndex((t) => meta(t)['active'] === true)));
  const active = tabs[selected] as Dict | undefined;
  const { width: windowWidth } = useWindowDimensions();
  // the width the tab strip really has (a TabLayout inside a card has less than the window): the
  // window width made segments look like they fit and then cut the labels ("Cont…", "Prefe…")
  const [width, setWidth] = useState(windowWidth - 64);
  const labels = tabs.map((t) => interpolate((meta(t)['label'] as string) ?? '', { state }));
  const badges = tabs.map((t) => meta(t)['badge']).map((b) => (b == null || b === '' ? '' : String(b)));
  const look = tabLayoutLook(m['variant']);
  // a lone tab, or tabs carrying badges: the underlined tab bar (a lone segment is a full-width
  // pill, and a segment has no room for a badge)
  const segments = !badges.some(Boolean) && segmentsFit(labels, width);
  return (
    <View style={look.bordered ? styles.tabsBordered : null} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {segments ? (
        // a handful of tabs: Material segmented buttons (each a tab with its selected state)
        <SegmentedButtons
          style={styles.segments}
          value={String(selected)}
          onValueChange={(v) => setSelected(Number(v))}
          density={look.small ? 'small' : undefined}
          buttons={tabs.map((t, i) => ({
            value: String(i),
            label: labels[i],
            accessibilityLabel: labels[i],
            showSelectedCheck: false,
            labelStyle: styles.segmentLabel,
          }))}
        />
      ) : (
        // more: a scrollable underlined tab bar (segments would squeeze the labels)
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.tabBar, look.minimal ? styles.tabBarMinimal : null]}
          contentContainerStyle={look.centered ? styles.tabBarCentered : null}
          accessibilityRole="tablist"
        >
          {tabs.map((t, i) => (
            <TouchableOpacity
              {...buttonA11y({ role: 'tab', selected: i === selected, label: badges[i] ? `${labels[i]}, ${badges[i]}` : undefined })}
              key={i}
              style={[styles.tab, look.small ? styles.tabSmall : null, i === selected && styles.tabActive]}
              onPress={() => setSelected(i)}
            >
              <View style={styles.tabInner}>
                <Text style={[styles.tabText, look.small ? styles.tabTextSmall : null, i === selected && styles.tabTextActive]}>{labels[i]}</Text>
                {!!badges[i] && <StatusChip label={badges[i]} tone={i === selected ? 'primary' : ''} style={styles.tabBadge} />}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <View style={[styles.tabContent, look.bordered ? styles.tabContentBordered : null]}>
        {active && <Children component={active} state={state} />}
      </View>
    </View>
  );
}

// ── Accordion ────────────────────────────────────────────────────────────────
export function AccordionRenderer({ component, state }: { component: unknown; state: Dict }) {
  const panels = childrenOf(component);
  const look = accordionLook(meta(component)['variant']);
  const [open, setOpen] = useState<Record<number, boolean>>(() => {
    const o: Record<number, boolean> = {};
    panels.forEach((p, i) => { if (meta(p)['active'] && meta(p)['disabled'] !== true) o[i] = true; });
    return o;
  });
  return (
    <View>
      {panels.map((p, i) => {
        // a disabled panel is shown (dimmed) but never opens — like vaadin-details[disabled]
        const disabled = meta(p)['disabled'] === true;
        const expanded = !disabled && !!open[i];
        return (
          <View key={i} style={[styles.panel, look.filled ? styles.panelFilled : null, disabled ? styles.panelDisabled : null]}>
            <List.Accordion
              title={interpolate((meta(p)['label'] as string) ?? '', { state })}
              expanded={expanded}
              onPress={disabled ? undefined : () => setOpen({ ...open, [i]: !open[i] })}
              style={[styles.panelHeader, look.filled ? styles.panelHeaderFilled : null]}
              titleStyle={[styles.panelTitle, look.small ? styles.panelTitleSmall : null, disabled ? styles.panelTitleDisabled : null]}
              accessibilityLabel={disabled ? `${interpolate((meta(p)["label"] as string) ?? "", { state })}, unavailable` : undefined}
            >
              <View style={styles.panelBody}><Children component={p} state={state} /></View>
            </List.Accordion>
          </View>
        );
      })}
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
  // its iconOnLeft / iconOnRight inside the chip (they were never drawn)
  return <StatusChip label={(metadata['text'] as string) ?? ''} look={badgeLook(metadata)} {...badgeIconsOf(metadata)} />;
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
      <ProgressBar progress={frac} color={progressBarColor(metadata['theme'] as string | undefined)} style={styles.progressTrack} />
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
  cardElevated: { borderWidth: 0 },
  cardBody: { gap: 10, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardHeaderSide: { flexShrink: 0 },
  cardHeaderText: { flex: 1, minWidth: 0 },
  cardSubtitle: { color: theme.muted },
  cardFooter: { marginTop: 4 },
  cardRow: { flexDirection: 'row' },
  cardRowBody: { flex: 1, minWidth: 0 },
  cardMediaTop: { overflow: 'hidden', borderTopLeftRadius: theme.radiusMd, borderTopRightRadius: theme.radiusMd },
  cardMediaStart: { overflow: 'hidden', borderTopLeftRadius: theme.radiusMd, borderBottomLeftRadius: theme.radiusMd, maxWidth: '40%' },
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
  tabsBordered: { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, borderRadius: theme.radiusMd, overflow: 'hidden' },
  tabContentBordered: { paddingHorizontal: 12 },
  tabBarMinimal: { borderBottomWidth: 0 },
  tabBarCentered: { flexGrow: 1, justifyContent: 'center' },
  tabSmall: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 40 },
  tabTextSmall: { fontSize: 12 },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 0, minHeight: 18 },
  panelFilled: { borderWidth: 0, backgroundColor: theme.background },
  panelHeaderFilled: { backgroundColor: theme.background },
  panelDisabled: { opacity: 0.55 },
  panelTitleSmall: { fontSize: 12 },
  panelTitleDisabled: { color: theme.faint },
  panel: { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, borderRadius: theme.radiusMd, marginBottom: 8, overflow: 'hidden', backgroundColor: theme.surface },
  panelHeader: { backgroundColor: theme.surface, paddingVertical: 4 },
  panelTitle: { fontWeight: '600', color: theme.ink },
  panelBody: { paddingHorizontal: 16, paddingBottom: 16 },
  link: { color: theme.primary, textDecorationLine: 'underline' },
  progressText: { fontSize: 14, color: theme.muted, marginBottom: 4 },
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
