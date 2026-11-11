import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { useViewController } from './MateuViewHost';
import { theme, themed } from '../theme';
import { accepts, type DropZoneMeta } from './dragDrop';

let seq = 0;

/**
 * Drop zone (wire `DropZone`): a titled card (title, subtitle) wrapping its children. The zone
 * REGISTERS itself while mounted (see `dragDrop.ts`): a listing with `dragType` offers it in its
 * "Move to…" picker, and a row lifted with a long press finds it by its box on the screen — it
 * lights up while a row of its type is carried and fills in under the finger. The dispatch is
 * bound to THIS view's controller, because the zone's action belongs to the component that declared
 * the zone.
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
  const box = React.useRef<View>(null);
  const registry = controller.session.dropZones;
  const [drag, setDrag] = React.useState(registry.dragState());

  React.useEffect(
    () => registry.register({
      key,
      meta,
      dispatch: (actionId, parameters) => void controller.runAction(actionId, parameters),
      measure: () => new Promise((resolve) => {
        const view = box.current;
        if (!view) return resolve(undefined);
        view.measureInWindow((x, y, width, height) => resolve({ key, x, y, width, height }));
      }),
    }),
    // re-register when the server sends a new zone (title/parameters may change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [component, controller],
  );
  React.useEffect(() => registry.subscribe(() => setDrag(registry.dragState())), [registry]);

  const candidate = !!drag && accepts(meta, drag.type);
  const hovered = candidate && drag?.hovered === key;
  return (
    <View ref={box} collapsable={false} style={[styles.zone, candidate && styles.candidate, hovered && styles.hovered]}
      accessibilityLabel={meta.title ?? undefined}>
      {!!meta.title && <Text style={styles.title} accessibilityRole="header">{meta.title}</Text>}
      {!!meta.subtitle && <Text style={styles.subtitle}>{meta.subtitle}</Text>}
      {children.map((child, i) => (
        <View key={i}>{renderComponent(child, state ?? {}, () => {})}</View>
      ))}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
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
  candidate: { borderColor: theme.primary, borderWidth: 2 },
  hovered: { borderStyle: 'solid', backgroundColor: theme.primaryContainer },
  title: { fontSize: 16, fontWeight: '700', color: theme.ink, fontFamily: theme.fontFamily },
  subtitle: { fontSize: 14, color: theme.muted, fontFamily: theme.fontFamily },
}));
