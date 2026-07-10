import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { interpolate } from '../core/expressions';
import { PageBanner } from '../core/MateuViewController';
import { useViewController } from './MateuViewHost';
import { ComponentRenderer } from './ComponentRenderer';

interface ButtonDto {
  actionId?: string;
  id?: string;
  label?: string;
  buttonStyle?: string;
}

interface Props {
  component: Record<string, unknown>;
  metadata: Record<string, unknown>;
  state: Record<string, unknown>;
  data: unknown;
}

const BANNER_COLORS: Record<string, { bg: string; border: string }> = {
  info: { bg: '#e8f0fe', border: '#1a73e8' },
  success: { bg: '#e6f4ea', border: '#1e8e3e' },
  warning: { bg: '#fef7e0', border: '#f9ab00' },
  danger: { bg: '#fce8e6', border: '#d93025' },
  error: { bg: '#fce8e6', border: '#d93025' },
};

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
              <TouchableOpacity onPress={() => setDismissed((d) => [...d, i])}>
                <Text style={styles.bannerClose}>✕</Text>
              </TouchableOpacity>
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
  const children = (component['children'] as unknown[]) ?? [];

  const handleAction = (actionId: string) => runAction(actionId);

  return (
    <View style={styles.root}>
      {(!!title || !!subtitle || toolbar.length > 0) && (
        <View style={styles.header}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {toolbar.length > 0 && (
            <View style={styles.toolbar}>
              {toolbar.map((btn, i) => {
                const id = btn.actionId ?? btn.id ?? '';
                const isPrimary = btn.buttonStyle?.toLowerCase() === 'primary';
                return (
                  <TouchableOpacity key={i} style={isPrimary ? styles.btnPrimary : styles.btnDefault} onPress={() => handleAction(id)}>
                    <Text style={isPrimary ? styles.btnPrimaryText : styles.btnDefaultText}>
                      {interpolate(btn.label ?? id, ctx)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      <Banners metadata={metadata} state={state} />

      <ScrollView contentContainerStyle={styles.body}>
        {children.map((child, i) => (
          <ComponentRenderer key={i} component={child} state={state} data={data} />
        ))}
      </ScrollView>

      {buttons.length > 0 && (
        <View style={styles.bottomBar}>
          {buttons.map((btn, i) => {
            const id = btn.actionId ?? btn.id ?? '';
            const isPrimary = btn.buttonStyle?.toLowerCase() === 'primary';
            return (
              <TouchableOpacity key={i} style={isPrimary ? styles.btnPrimary : styles.btnDefault} onPress={() => handleAction(id)}>
                <Text style={isPrimary ? styles.btnPrimaryText : styles.btnDefaultText}>
                  {interpolate(btn.label ?? id, ctx)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  body: { padding: 16, paddingBottom: 24 },
  banners: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  banner: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 8, borderLeftWidth: 4, padding: 12, gap: 8 },
  bannerTitle: { fontWeight: '700', fontSize: 13, color: '#1a1a1a', marginBottom: 2 },
  bannerText: { fontSize: 13, color: '#1a1a1a' },
  bannerClose: { fontSize: 14, color: '#666', paddingHorizontal: 4 },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
    justifyContent: 'flex-end',
  },
  btnPrimary: { backgroundColor: '#0070f3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6 },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  btnDefault: { backgroundColor: '#f5f5f5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: '#ccc' },
  btnDefaultText: { color: '#333', fontSize: 14 },
});
