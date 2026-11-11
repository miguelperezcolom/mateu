import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Menu } from 'react-native-paper';
import { MateuButton } from '../ui/controls';
import { interpolate } from '../core/expressions';
import { useButtonPress } from './useButtonPress';

/**
 * A SPLIT button (a ButtonGroup with a primary): the primary as a button of its own, joined to a
 * ▾ button named "More actions" that opens a Paper Menu of the other buttons — each run like a
 * button of its own (an action, or a route it navigates to).
 */
export function SplitMenuButton({ primary, more, ctx, run, pending }: {
  primary: Record<string, unknown>;
  more: Record<string, unknown>[];
  ctx: { state?: Record<string, unknown>; data?: unknown };
  /** runs a part that is an action (not a route) */
  run: (actionId: string, parameters?: Record<string, unknown>) => void;
  pending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pressButton = useButtonPress();
  const id = String(primary['actionId'] ?? primary['id'] ?? '');
  const label = interpolate(String(primary['label'] ?? id), ctx as never);
  const press = pressButton(primary, ctx as never, () => run(id, primary['parameters'] as Record<string, unknown> | undefined), label);
  const disabled = primary['disabled'] === true;
  return (
    <View style={styles.row} accessibilityRole="none">
      <MateuButton
        label={label}
        buttonStyle={primary['buttonStyle'] as string | undefined}
        color={primary['color'] as string | undefined}
        size={primary['size'] as string | undefined}
        disabled={disabled || press.disabled || pending}
        loading={pending}
        style={styles.primary}
        onPress={press.onPress}
      />
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchor={(
          <MateuButton
            label=""
            buttonStyle={primary['buttonStyle'] as string | undefined}
            color={primary['color'] as string | undefined}
            size={primary['size'] as string | undefined}
            iconRight={open ? 'menu-up' : 'menu-down'}
            disabled={disabled}
            accessibilityLabel="More actions"
            compact
            style={styles.more}
            onPress={() => setOpen(true)}
          />
        )}
      >
        {more.map((m, i) => {
          const mid = String(m['actionId'] ?? m['id'] ?? '');
          const text = interpolate(String(m['label'] ?? mid), ctx as never);
          const mpress = pressButton(m, ctx as never, () => run(mid, m['parameters'] as Record<string, unknown> | undefined), text);
          return (
            <Menu.Item
              key={i}
              title={text}
              disabled={m['disabled'] === true || mpress.disabled}
              onPress={() => { setOpen(false); mpress.onPress?.(); }}
            />
          );
        })}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  primary: { borderTopRightRadius: 4, borderBottomRightRadius: 4, marginRight: 1 },
  more: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4, minWidth: 40 },
});
