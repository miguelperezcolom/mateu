import React, { useState } from 'react';
import { Menu } from 'react-native-paper';
import { MateuButton } from '../ui/controls';
import { interpolate } from '../core/expressions';
import { useButtonPress } from './useButtonPress';

/**
 * A toolbar ButtonGroup ("More actions"): the group's button opens a menu of its members, each run
 * like a button of its own (the web's dropdown). It used to be one plain button that ran nothing
 * (a reload) and never showed Export / Print.
 */
export function GroupMenuButton({ group, members, ctx, run }: {
  group: Record<string, unknown>;
  members: Record<string, unknown>[];
  ctx: { state?: Record<string, unknown>; data?: unknown };
  /** runs a member that is an action (not a route) */
  run: (actionId: string, parameters?: Record<string, unknown>) => void;
}) {
  const [open, setOpen] = useState(false);
  const pressButton = useButtonPress();
  const label = interpolate(String(group['label'] ?? ''), ctx as never) || 'More';
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={(
        <MateuButton
          label={label}
          buttonStyle={group['buttonStyle'] as string | undefined}
          color={group['color'] as string | undefined}
          iconRight={open ? 'menu-up' : 'menu-down'}
          disabled={group['disabled'] === true}
          accessibilityLabel={`${label}, menu`}
          onPress={() => setOpen(true)}
        />
      )}
    >
      {members.map((m, i) => {
        const id = String(m['actionId'] ?? m['id'] ?? '');
        const text = interpolate(String(m['label'] ?? id), ctx as never);
        const press = pressButton(m, ctx as never, () => run(id, m['parameters'] as Record<string, unknown> | undefined), text);
        return (
          <Menu.Item
            key={i}
            title={text}
            disabled={m['disabled'] === true || press.disabled}
            onPress={() => { setOpen(false); press.onPress?.(); }}
          />
        );
      })}
    </Menu>
  );
}
