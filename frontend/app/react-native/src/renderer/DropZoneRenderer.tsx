import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useViewController } from './MateuViewHost';
import { theme } from '../theme';
import { registerDropZone, type DropZoneMeta } from './dragDrop';

let seq = 0;

/**
 * Drop zone (wire `DropZone`): a titled card (title, subtitle) wrapping its children. On touch
 * there is no drag: the zone REGISTERS itself while mounted so a listing with `dragType` can offer
 * it in its "Move to…" picker (see `dragDrop.ts`); the dispatch is bound to THIS view's controller,
 * because the zone's action belongs to the component that declared the zone.
 */
export function DropZoneRenderer({ component, state, renderComponent }: {
  component: Record<string, unknown>;
  state?: Record<string, unknown>;
  renderComponent: (child: unknown, state: Record<string, unknown>, onStateChange: (id: string, v: unknown) => void) => React.ReactNode;
}) {
  const controller = useViewController();
  const meta = ((component['metadata'] as Record<string, unknown>) ?? {}) as DropZoneMeta;
  const children = (component['children'] as unknown[]) ?? [];
  const key = React.useRef(`${String(component['id'] ?? 'dropzone')}#${++seq}`).current;

  React.useEffect(
    () => registerDropZone({
      key,
      meta,
      dispatch: (actionId, parameters) => void controller.runAction(actionId, parameters),
    }),
    // re-register when the server sends a new zone (title/parameters may change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [component, controller],
  );

  return (
    <View style={styles.zone} accessibilityLabel={meta.title ?? undefined}>
      {!!meta.title && <Text style={styles.title} accessibilityRole="header">{meta.title}</Text>}
      {!!meta.subtitle && <Text style={styles.subtitle}>{meta.subtitle}</Text>}
      {children.map((child, i) => (
        <View key={i}>{renderComponent(child, state ?? {}, () => {})}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.border,
    borderRadius: theme.radiusMd,
    backgroundColor: theme.white,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
    marginVertical: theme.spacing.xs,
  },
  title: { fontSize: 15, fontWeight: '700', color: theme.ink, fontFamily: theme.fontFamily },
  subtitle: { fontSize: 13, color: theme.muted, fontFamily: theme.fontFamily },
});
