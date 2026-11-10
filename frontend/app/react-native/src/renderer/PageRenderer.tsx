import { buttonGroupMembers } from '../core/buttonGroup';
import { GroupMenuButton } from './GroupMenuButton';
import { badgeLook } from '../ui/looks';
import { materialIconOf } from '../ui/wireIcons';
import { bodyRepeatsBar } from '../core/barTitle';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from '../ui/Touchable';
import { Text } from '../ui/Text';
import { interpolate } from '../core/expressions';
import { PageBanner } from '../core/MateuViewController';
import { useViewController } from './MateuViewHost';
import { BreadcrumbsRenderer } from './WireComponents';
import { ComponentRenderer } from './ComponentRenderer';
import { theme, themed } from '../theme';
import { Chip, FAB, IconButton, Text as PaperText } from 'react-native-paper';
import { showsSectionIndex } from './sectionIndex';
import { DenseFields, MateuButton, StatusChip } from '../ui/controls';
import { buttonA11y, headingA11y } from '../a11y/a11y';
import { RecordSwitcherRenderer } from './RecordSwitcherRenderer';
import { drawsNothing, pageHeaderExtrasOf, switcherOf } from './patternGaps';
import { fabBottom, withoutRedundantBack } from '../core/uxRules';
import { useButtonPress } from './useButtonPress';
import { FIT_CONTENT, InsideVerticalScroll, PageShowsToolbar, SectionIndex, type SectionEntry, type SectionRegistry, useBarTitle, useFitsContent, useScreenHasBack } from './ScrollContext';
import { uniqueButtons } from './patternGaps';

interface ButtonDto {
  actionId?: string;
  id?: string;
  label?: string;
  buttonStyle?: string;
  color?: string | null;
  disabled?: boolean;
  route?: string;
}

interface Props {
  component: Record<string, unknown>;
  metadata: Record<string, unknown>;
  state: Record<string, unknown>;
  data: unknown;
}

const BANNER_COLORS: Record<string, { bg: string; border: string }> = themed(() => ({
  info: { bg: theme.infoBg, border: theme.primary },
  success: { bg: theme.successBg, border: theme.success },
  warning: { bg: theme.warningBg, border: theme.warning },
  danger: { bg: theme.dangerBg, border: theme.danger },
  error: { bg: theme.dangerBg, border: theme.danger },
}));

/** Page banners: the static @Banner list (metadata) + action-returned banners (controller),
 *  rendered below the header. Closeable ones dismiss locally; timeoutSeconds auto-dismisses. */
function Banners({ metadata, state }: { metadata: Record<string, unknown>; state: Record<string, unknown> }) {
  const controller = useViewController();
  const staticBanners = (metadata['banners'] as PageBanner[]) ?? [];
  const all = [...staticBanners, ...controller.actionBanners];
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    const timers = all
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => (b.timeoutSeconds ?? 0) > 0)
      .map(({ b, i }) => setTimeout(() => setDismissed((d) => [...d, i]), b.timeoutSeconds! * 1000));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all.length]);

  if (all.length === 0) return null;
  return (
    <View style={styles.banners}>
      {all.map((banner, i) => {
        if (dismissed.includes(i)) return null;
        const colors = BANNER_COLORS[String(banner.theme ?? 'info').toLowerCase()] ?? BANNER_COLORS.info;
        return (
          <View key={i} style={[styles.banner, { backgroundColor: colors.bg, borderLeftColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              {!!banner.title && <Text style={styles.bannerTitle}>{interpolate(banner.title, { state })}</Text>}
              {!!banner.description && <Text style={styles.bannerText}>{interpolate(banner.description, { state })}</Text>}
            </View>
            {banner.hasCloseButton && (
              <IconButton icon="close" size={18} hitSlop={8} style={styles.bannerClose} accessibilityLabel="Dismiss notice" onPress={() => setDismissed((d) => [...d, i])} />
            )}
          </View>
        );
      })}
    </View>
  );
}

export function PageRenderer({ component, metadata, state, data }: Props) {
  const fits = useFitsContent();
  const controller = useViewController();
  const runAction = (actionId: string) => void controller.runAction(actionId);
  const ctx = { state, data, appState: controller.session.appState };

  // a page template that owns the header (WelcomePage, HeroSearchPage…) draws its title in its own
  // banner: the wire still names it, for the window title, and `noHeader` says not to repeat it
  const noHeader = metadata['noHeader'] === true;
  const declaredTitle = noHeader ? '' : interpolate((metadata['title'] as string) ?? (metadata['pageTitle'] as string) ?? '', ctx);
  // the shell's bar already names the screen (RN-22): the header does not say it twice
  const barTitle = useBarTitle();
  const title = bodyRepeatsBar(declaredTitle, barTitle) ? '' : declaredTitle;
  const subtitle = noHeader ? '' : interpolate((metadata['subtitle'] as string) ?? '', ctx);
  // the same button twice (a listing's toolbar folded in more than once) is one button
  // …and «Back to list» stands down when the screen already has a back arrow (RN-26)
  const screenHasBack = useScreenHasBack();
  const toolbar = withoutRedundantBack(uniqueButtons((metadata['toolbar'] as ButtonDto[]) ?? []), screenHasBack);
  const buttons = (metadata['buttons'] as ButtonDto[]) ?? [];
  const badges = (metadata['badges'] as { text?: string; color?: string }[]) ?? [];
  const kpis = (metadata['kpis'] as { title?: string; text?: string }[]) ?? [];
  const fabs = (metadata['fabs'] as { id?: string; label?: string; actionId?: string; icon?: string }[]) ?? [];
  const children = (component['children'] as unknown[]) ?? [];
  // Record/context switcher (PageDto.switcher): a compact selector under the title.
  const switcher = switcherOf(metadata);
  // overline / title placeholder / "last updated" / previous-next record (the canonical header)
  const extras = pageHeaderExtrasOf(metadata, declaredTitle);
  const openPeer = (label: string, route: string) =>
    controller.session.openView({ label, route, consumedRoute: '', serverSideType: '' });

  const handleAction = (actionId: string) => runAction(actionId);
  const onlyListing =
    children.length === 1 &&
    ((children[0] as Record<string, unknown>)?.['metadata'] as Record<string, unknown> | undefined)?.['type'] === 'Crud';
  const pressButton = useButtonPress();

  // @Toc: the @Section cards register here; the index (a row of chips ABOVE the scrolling body, so
  // it never scrolls away — the phone's take on the web's sticky side index and pinned sections,
  // which on a 360dp screen would cover the content) jumps to a section
  const scrollRef = React.useRef<ScrollView>(null);
  const contentRef = React.useRef<View>(null);
  const [sections, setSections] = useState<SectionEntry[]>([]);
  const registry = React.useMemo<SectionRegistry>(() => ({
    register: (entry) => {
      setSections((all) => [...all.filter((e) => e.key !== entry.key), entry]);
      return () => setSections((all) => all.filter((e) => e.key !== entry.key));
    },
  }), []);
  const jumpTo = (entry: SectionEntry) => {
    const target = entry.ref.current as View | null;
    const content = contentRef.current;
    if (!target || !content) return;
    target.measureLayout(content, (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true }), () => {});
  };
  const indexEntries = [...sections.filter((s) => s.sticky), ...sections.filter((s) => !s.sticky)];
  const showIndex = !onlyListing && showsSectionIndex(metadata['toc'], sections.length);

  // the page's breadcrumb trail (BreadcrumbsSupplier / the derived trail) unless it opts out — it
  // was never drawn; and the page's HEADER components (HeaderSupplier: a listing's drop zones…)
  const crumbs = metadata['noBreadcrumbs'] === true ? [] : ((metadata['breadcrumbs'] as Record<string, unknown>[] | undefined) ?? []);
  const headerComponents = (metadata['header'] as unknown[] | undefined) ?? [];
  // a page whose body draws nothing (only its buttons, say) gets no empty band between dividers
  const bodyEmpty = children.every(drawsNothing);
  return (
    // @Compact (the page style's --mateu-compact marker): dense fields, tighter rows
    <DenseFields.Provider value={/--mateu-compact:\s*1/.test(String(component['style'] ?? ''))}>
    <View style={[styles.root, fits && FIT_CONTENT]}>
      {(!!title || !!subtitle || toolbar.length > 0 || !!switcher || !!extras.overline || !!extras.placeholder || !!extras.peers || crumbs.length > 0) && (
        <View style={styles.header}>
          {crumbs.length > 0 && <BreadcrumbsRenderer metadata={{ breadcrumbs: crumbs, currentItemText: title }} />}
          {!!extras.overline && <Text style={styles.overline}>{extras.overline}</Text>}
          {!declaredTitle && !!extras.placeholder && (
            <PaperText variant="headlineSmall" style={[styles.title, styles.placeholder]} {...headingA11y(1)}>{extras.placeholder}</PaperText>
          )}
          {!!title && (
            // Marked as a heading so the rotor / reading controls can jump between screens'
            // sections instead of forcing a linear read from the top.
            <PaperText variant="headlineSmall" style={styles.title} {...headingA11y(1)}>{title}</PaperText>
          )}
          {!!switcher && <RecordSwitcherRenderer switcher={switcher} />}
          {!!subtitle && <PaperText variant="bodyMedium" style={styles.subtitle}>{subtitle}</PaperText>}
          {!!extras.timestamp && <Text style={styles.timestamp}>{extras.timestamp}</Text>}
          {!!extras.peers && (
            <View style={styles.peers}>
              {(['prev', 'next'] as const).map((side) => {
                const peer = extras.peers![side];
                if (!peer) return null;
                const disabled = !peer.route;
                return (
                  <MateuButton
                    key={side}
                    label={peer.label}
                    icon={side === 'prev' ? 'chevron-left' : 'chevron-right'}
                    accessibilityLabel={peer.label ? `${side === 'prev' ? 'Previous' : 'Next'}: ${peer.label}` : side === 'prev' ? 'Previous' : 'Next'}
                    disabled={disabled}
                    compact
                    onPress={() => peer.route && openPeer(peer.label, peer.route)}
                  />
                );
              })}
            </View>
          )}
          {badges.length > 0 && (
            <View style={styles.badges}>
              {badges.map((b, i) => (
                <StatusChip key={i} label={interpolate(b.text ?? '', ctx)} look={badgeLook(b)} />
              ))}
            </View>
          )}
          {kpis.length > 0 && (
            <View style={styles.kpis}>
              {kpis.map((k, i) => (
                <View key={i} style={styles.kpi}>
                  <Text style={styles.kpiText}>{interpolate(k.text ?? '', ctx)}</Text>
                  <Text style={styles.kpiTitle}>{interpolate(k.title ?? '', ctx)}</Text>
                </View>
              ))}
            </View>
          )}
          {toolbar.length > 0 && (
            <View style={styles.toolbar}>
              {toolbar.map((btn, i) => {
                // a ButtonGroup ("More actions"): a menu of its buttons
                const members = buttonGroupMembers(btn as Record<string, unknown>);
                if (members) return <GroupMenuButton key={i} group={btn as Record<string, unknown>} members={members} ctx={ctx} run={(a, p) => void controller.runAction(a, p)} />;
                const id = btn.actionId ?? btn.id ?? '';
                const press = pressButton(btn as Record<string, unknown>, ctx, () => handleAction(id), interpolate(btn.label ?? id, ctx));
                const disabled = !!btn.disabled || press.disabled;
                return (
                  <MateuButton key={i} label={interpolate(btn.label ?? id, ctx)} buttonStyle={btn.buttonStyle} color={btn.color} disabled={disabled} onPress={press.onPress} />
                );
              })}
            </View>
          )}
        </View>
      )}

      {headerComponents.length > 0 && (
        <View style={styles.headerComponents}>
          {headerComponents.map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)}
        </View>
      )}

      <Banners metadata={metadata} state={state} />

      {onlyListing ? (
        // a page that is just a listing (an AutoCrud's page) IS the listing: edge to edge, scrolling
        // by itself — inside the padded body it was an inset panel and its list a virtualized list
        // nested in a ScrollView
        <PageShowsToolbar.Provider value={toolbar.length > 0}>
          <ComponentRenderer component={children[0]} state={state} data={data} />
        </PageShowsToolbar.Provider>
      ) : bodyEmpty ? null : (
        <>
        {showIndex && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tocBar} contentContainerStyle={styles.tocBarContent} accessibilityRole="toolbar" accessibilityLabel="Sections">
            {indexEntries.map((s) => (
              <Chip key={s.key} compact icon={s.sticky ? 'pin-outline' : undefined} onPress={() => jumpTo(s)} style={styles.tocChip} accessibilityLabel={`Go to ${s.title}`}>
                {s.title}
              </Chip>
            ))}
          </ScrollView>
        )}
        <ScrollView ref={scrollRef} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View ref={contentRef} collapsable={false}>
          <SectionIndex.Provider value={registry}>
          <InsideVerticalScroll.Provider value><PageShowsToolbar.Provider value={toolbar.length > 0}>
          {children.map((child, i) => (
            <ComponentRenderer key={i} component={child} state={state} data={data} />
          ))}
          </PageShowsToolbar.Provider></InsideVerticalScroll.Provider>
          </SectionIndex.Provider>
          </View>
        </ScrollView>
        </>
      )}


      {buttons.length > 0 && (
        <View style={[styles.bottomBar, bodyEmpty && styles.bottomBarFlush]}>
          {buttons.map((btn, i) => {
            const id = btn.actionId ?? btn.id ?? '';
            const press = pressButton(btn as Record<string, unknown>, ctx, () => handleAction(id), interpolate(btn.label ?? id, ctx));
            const disabled = !!btn.disabled || press.disabled;
            return (
              <MateuButton key={i} label={interpolate(btn.label ?? id, ctx)} buttonStyle={btn.buttonStyle} color={btn.color} disabled={disabled} onPress={press.onPress} />
            );
          })}
        </View>
      )}
      {/* AFTER the bottom bar and lifted above it: drawn before it (and at the same height) the
          bar covered the floating button — a tap on it pressed the page's Save instead. */}
      {fabs.length > 0 && (
        <View style={[styles.fabStack, { bottom: fabBottom(buttons.length > 0) }]} pointerEvents="box-none">
          {fabs.map((fab, i) => (
            fab.label ? (
              <FAB key={i} icon={materialIconOf(fab.icon)} label={interpolate(fab.label, ctx)} accessibilityLabel={interpolate(fab.label, ctx)} onPress={() => handleAction(fab.actionId ?? fab.id ?? '')} />
            ) : (
              <FAB key={i} icon={materialIconOf(fab.icon) ?? "plus"} accessibilityLabel={fab.actionId || fab.id || "Action"} onPress={() => handleAction(fab.actionId ?? fab.id ?? '')} />
            )
          ))}
        </View>
      )}
    </View>
    </DenseFields.Provider>
  );
}

const styles = themed(() => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.surface },
  headerComponents: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  header: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, backgroundColor: theme.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  title: { color: theme.ink, fontWeight: '600' },
  subtitle: { color: theme.muted, marginTop: 4 },
  overline: { fontSize: 12, color: theme.muted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  placeholder: { opacity: 0.45 },
  timestamp: { fontSize: 12, color: theme.muted, marginTop: 4 },
  peers: { flexDirection: 'row', gap: 8, marginTop: 8 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14, gap: 8 },
  body: { padding: 16, paddingBottom: 24 },
  banners: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  banner: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: theme.radiusMd, borderLeftWidth: 4, padding: 12, gap: 8 },
  bannerTitle: { fontWeight: '700', fontSize: 14, color: theme.ink, marginBottom: 2 },
  bannerText: { fontSize: 14, color: theme.ink },
  bannerClose: { margin: -6 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600', color: theme.ink },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 },
  kpi: { alignItems: 'flex-start' },
  kpiText: { fontSize: 22, fontWeight: '700', color: theme.ink },
  kpiTitle: { fontSize: 11, color: theme.faint },
  fabStack: { position: 'absolute', right: 16, bottom: 24, gap: 12, alignItems: 'flex-end' },
  bottomBarFlush: { borderTopWidth: 0 },
  tocBar: { flexGrow: 0, flexShrink: 0, minHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider, backgroundColor: theme.surface },
  tocBarContent: { gap: 8, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center' },
  tocChip: { backgroundColor: theme.background },
  bottomBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: theme.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.divider,
    gap: 8,
    justifyContent: 'flex-end',
  },
  btnPrimary: { backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 10, minHeight: theme.minTouch, justifyContent: 'center', borderRadius: theme.radiusSm },
  btnPrimaryText: { color: theme.onFill, fontWeight: '600', fontSize: 14 },
  btnDefault: { backgroundColor: theme.background, paddingHorizontal: 20, paddingVertical: 10, minHeight: theme.minTouch, justifyContent: 'center', borderRadius: theme.radiusSm, borderWidth: 1, borderColor: theme.border },
  btnDefaultText: { color: theme.ink, fontSize: 14 },
  btnDisabled: { opacity: 0.45 },
}));
