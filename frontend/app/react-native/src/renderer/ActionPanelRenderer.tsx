import React from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useViewController } from './MateuViewHost';
import { theme } from '../theme';
import { buttonA11y, headingA11y, modalA11y } from '../a11y/a11y';
import { interpolate } from '../core/expressions';
import { actionPanelView, panelLabel, type ActionPanelMeta, type PanelAction } from './actionPanel';

/**
 * «I want to…» action panel: a trigger button opening a modal with one section per category.
 * Ordering / cut / labels live in `actionPanel.ts`; this only paints and keeps the client-side
 * state (open, expanded categories, hide-unpopulated).
 *
 * Choosing an action closes the modal and dispatches it exactly like a `Button` does
 * (`controller.runAction(actionId, parameters)`).
 *
 * The wire `shortcut` (e.g. "ctrl+i") is NOT applicable here: a touch device has no keyboard
 * accelerators to bind it to, so it is deliberately ignored.
 */
export function ActionPanelRenderer({ metadata, state }: { metadata: Record<string, unknown>; state: Record<string, unknown> }) {
  const controller = useViewController();
  const meta = metadata as ActionPanelMeta;
  const [open, setOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Set<number>>(() => new Set());
  const [hideUnpopulated, setHideUnpopulated] = React.useState(false);

  const label = interpolate(panelLabel(meta), { state });
  const categories = actionPanelView(meta, { expanded, hideUnpopulated });

  const close = () => {
    setOpen(false);
    setExpanded(new Set());
  };

  const choose = (action: PanelAction) => {
    if (action.disabled || !action.actionId) return;
    close();
    void controller.runAction(action.actionId, action.parameters);
  };

  return (
    <View>
      <TouchableOpacity {...buttonA11y({ expanded: open })} style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText}>{label}</Text>
      </TouchableOpacity>
      {open && (
        <Modal {...modalA11y(label)} accessibilityViewIsModal animationType="fade" transparent onRequestClose={close}>
          <View style={styles.backdrop}>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <Text {...headingA11y(2)} style={styles.title}>{label}</Text>
                <TouchableOpacity {...buttonA11y({ label: 'Close' })} style={styles.close} onPress={close}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
              {!!meta.hideUnpopulatedToggle && (
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Hide unpopulated</Text>
                  <Switch
                    accessibilityLabel="Hide unpopulated"
                    accessibilityRole="switch"
                    value={hideUnpopulated}
                    onValueChange={setHideUnpopulated}
                  />
                </View>
              )}
              <ScrollView contentContainerStyle={styles.body}>
                {categories.map((category) => (
                  <View key={category.index} style={styles.category}>
                    {!!category.title && (
                      <Text {...headingA11y(3)} style={styles.categoryTitle}>{interpolate(category.title, { state })}</Text>
                    )}
                    {category.actions.map((action, i) => {
                      const text = interpolate(action.label, { state });
                      return (
                        <TouchableOpacity
                          key={`${action.actionId}-${i}`}
                          {...buttonA11y({ label: text, disabled: action.disabled })}
                          disabled={action.disabled}
                          style={styles.action}
                          onPress={() => choose(action)}
                        >
                          <Text
                            style={[
                              styles.actionText,
                              action.populated && styles.populated,
                              action.disabled && styles.disabled,
                            ]}
                          >
                            {text}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    {category.hiddenCount > 0 && (
                      <TouchableOpacity
                        {...buttonA11y({ label: category.moreLabel })}
                        style={styles.action}
                        onPress={() => setExpanded((prev) => new Set(prev).add(category.index))}
                      >
                        <Text style={styles.more}>{category.moreLabel}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: theme.background, paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radiusSm,
    borderWidth: 1, borderColor: theme.border, alignSelf: 'flex-start',
  },
  triggerText: { color: theme.ink, fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: theme.spacing.md },
  sheet: { backgroundColor: theme.white, borderRadius: theme.radiusMd, maxHeight: '90%', overflow: 'hidden' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider,
  },
  title: { flex: 1, fontSize: 17, fontWeight: '600', color: theme.ink },
  close: { padding: theme.spacing.sm },
  closeText: { fontSize: 16, color: theme.muted },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs,
  },
  toggleLabel: { fontSize: 13, color: theme.muted },
  body: { padding: theme.spacing.md, gap: theme.spacing.md },
  category: { gap: 2 },
  categoryTitle: { fontSize: 13, fontWeight: '700', color: theme.muted, textTransform: 'uppercase', marginBottom: 4 },
  action: { paddingVertical: 8 },
  actionText: { fontSize: 14, color: theme.info },
  populated: { fontWeight: '700' },
  disabled: { color: theme.faint },
  more: { fontSize: 13, color: theme.primary },
});
