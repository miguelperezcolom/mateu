import React, { useState } from 'react';
import { Menu } from 'react-native-paper';
import { MateuButton } from '../ui/controls';
import { interpolate } from '../core/expressions';
import { buttonGroupMembers } from '../core/buttonGroup';
import { useButtonPress } from './useButtonPress';
import { usePendingAction } from './usePendingAction';

type Dict = Record<string, unknown>;

/**
 * A button of a page header's toolbar. A ButtonGroup there (a Button whose `children` are its
 * buttons and which has no action of its own) is ONE trigger opening a menu of its buttons, as the
 * web draws it — it was drawn as a plain button that ran an empty action (the page reloaded) and
 * never showed Export / Print.
 */
export function ToolbarButton({ button, ctx, runAction }: { button: Dict; ctx: { state?: unknown; data?: unknown; appState?: unknown }; runAction: (actionId: string, parameters?: Dict) => void }) {
  const pressButton = useButtonPress();
  const [open, setOpen] = useState(false);
  const members = buttonGroupMembers(button);
  const id = String(button['actionId'] ?? button['id'] ?? '');
  const label = interpolate(String(button['label'] ?? id), ctx as never);
  const pending = usePendingAction(id);
  if (members) {
    return (
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchor={<MateuButton label={label} icon="chevron-down" buttonStyle={button['buttonStyle'] as string | undefined} onPress={() => setOpen(true)} accessibilityHint="Opens a menu" />}
      >
        {members.map((member, i) => {
          const memberId = String(member['actionId'] ?? member['id'] ?? '');
          const memberLabel = interpolate(String(member['label'] ?? memberId), ctx as never);
          const press = pressButton(member, ctx, () => runAction(memberId, (member['parameters'] as Dict | undefined) ?? undefined), memberLabel);
          return (
            <Menu.Item
              key={i}
              title={memberLabel}
              disabled={member['disabled'] === true || press.disabled}
              onPress={() => {
                setOpen(false);
                press.onPress();
              }}
            />
          );
        })}
      </Menu>
    );
  }
  const press = pressButton(button, ctx, () => runAction(id, (button['parameters'] as Dict | undefined) ?? undefined), label);
  return (
    <MateuButton
      label={label}
      buttonStyle={button['buttonStyle'] as string | undefined}
      color={button['color'] as string | undefined}
      disabled={button['disabled'] === true || press.disabled || pending}
      loading={pending}
      onPress={press.onPress}
    />
  );
}
