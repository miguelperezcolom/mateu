import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../ui/Text';
import { interpolate } from '../core/expressions';
import { PageBanner } from '../core/MateuViewController';
import { useViewController } from './MateuViewHost';
import { ComponentRenderer } from './ComponentRenderer';
import { theme, themed } from '../theme';
import { FAB, IconButton, Text as PaperText } from 'react-native-paper';
import { MateuButton, StatusChip } from '../ui/controls';
import { buttonA11y, headingA11y } from '../a11y/a11y';
import { RecordSwitcherRenderer } from './RecordSwitcherRenderer';
import { pageHeaderExtrasOf, switcherOf } from './patternGaps';
import { fabBottom } from '../core/uxRules';
import { useButtonPress } from './useButtonPress';

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
              <IconButton icon="close" size={18} style={styles.bannerClose} accessibilityLabel="Dismiss notice" onPress={() => setDismissed((d) => [...d, i])} />
            )}
          </View>
        );
      })}
    </View>
  );
}

export function PageRenderer({ component, metadata, state, data }: Props) {
  const controller = useViewController();
  const runAction = (actionId: string) => void controller.runAction(actionId);
  const ctx = { state, data, appState: controller.session.appState };

  const title = interpolate((metadata['title'] as string) ?? (metadata['pageTitle'] as string) ?? '', ctx);
  const subtitle = interpolate((metadata['subtitle'] as string) ?? '', ctx);
  const toolbar = (metadata['toolbar'] as ButtonDto[]) ?? [];
  const buttons = (metadata['buttons'] as ButtonDto[]) ?? [];
  const badges = (metadata['badges'] as { text?: string; color?: string }[]) ?? [];
  const kpis = (metadata['kpis'] as { title?: string; text?: string }[]) ?? [];
  const fabs = (metadata['fabs'] as { id?: string; label?: string; actionId?: string; icon?: string }[]) ?? [];
  const children = (component['children'] as unknown[]) ?? [];
  // Record/context switcher (PageDto.switcher): a compact selector under the title.
  const switcher = switcherOf(metadata);
  // overline / title placeholder / "last updated" / previous-next record (the canonical header)
  const extras = pageHeaderExtrasOf(metadata, title);
  const openPeer = (label: string, route: string) =>
    controller.session.openView({ label, route, consumedRoute: '', serverSideType: '' });

  const handleAction = (actionId: string) => runAction(actionId);
  const onlyListing =
    children.length === 1 &&
    ((children[0] as Record<string, unknown>)?.['metadata'] as Record<string, unknown> | undefined)?.['type'] === 'Crud';
  const pressButton = useButtonPress();

  return (
    <View style={styles.root}>
      {(!!title || !!subtitle || toolbar.length > 0 || !!switcher || !!extras.overline || !!extras.placeholder || !!extras.peers) && (
        <View style={styles.header}>
          {!!extras.overline && <Text style={styles.overline}>{extras.overline}</Text>}
          {!title && !!extras.placeholder && (
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
                    accessibilityLabel={`${side === 'prev' ? 'Previous' : 'Next'}: ${peer.label}`}
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
                <StatusChip key={i} label={interpolate(b.text ?? '', ctx)} tone={b.color} />
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

      <Banners metadata={metadata} state={state} />

      {onlyListing ? (
        // a page that is just a listing (an AutoCrud's page) IS the listing: edge to edge, scrolling
        // by itself — inside the padded body it was an inset panel and its list a virtualized list
        // nested in a ScrollView
        <ComponentRenderer component={children[0]} state={state} data={data} />
      ) : (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {children.map((child, i) => (
            <ComponentRenderer key={i} component={child} state={state} data={data} />
          ))}
        </ScrollView>
      )}


      {buttons.length > 0 && (
        <View style={styles.bottomBar}>
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
              <FAB key={i} label={interpolate(fab.label, ctx)} accessibilityLabel={interpolate(fab.label, ctx)} onPress={() => handleAction(fab.actionId ?? fab.id ?? '')} />
            ) : (
              <FAB key={i} icon="plus" accessibilityLabel={fab.actionId || fab.id || 'Action'} onPress={() => handleAction(fab.actionId ?? fab.id ?? '')} />
            )
          ))}
        </View>
      )}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.surface },
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
  bannerTitle: { fontWeight: '700', fontSize: 13, color: theme.ink, marginBottom: 2 },
  bannerText: { fontSize: 13, color: theme.ink },
  bannerClose: { margin: -6 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600', color: theme.ink },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 },
  kpi: { alignItems: 'flex-start' },
  kpiText: { fontSize: 20, fontWeight: '700', color: theme.ink },
  kpiTitle: { fontSize: 11, color: theme.faint },
  fabStack: { position: 'absolute', right: 16, bottom: 24, gap: 12, alignItems: 'flex-end' },
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
