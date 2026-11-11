import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Badge, IconButton, Text as PaperText } from 'react-native-paper';
import { TouchableOpacity } from '../ui/Touchable';
import { Text } from '../ui/Text';
import { MateuButton } from '../ui/controls';
import { buttonA11y, modalA11y } from '../a11y/a11y';
import { theme, themed } from '../theme';
import { SessionContextProvider } from '../context/AppContext';
import { unreadCount } from '../core/inbox';
import { contextChipText, headerActionLeaves, splitHeaderActions, type EmbeddedAppExtras, type HeaderAction } from '../core/embeddedAppExtras';
import type { MateuViewController } from '../core/MateuViewController';
import { ContextSelectors, NotificationBell, type AppContextSelector, type AppMeta } from './AppRenderer';

type Sheet = { kind: 'context' } | { kind: 'inbox' } | { kind: 'actions'; title: string; actions: HeaderAction[] } | null;

/**
 * The shell extras of an app EMBEDDED in a page (a MicroFrontend or an island answering an App),
 * drawn as a compact bar above its content — a phone has no room for a second app header, and the
 * embedded app has no drawer of its own: one chip per app-context selector, up to two header
 * actions (the rest and every menu in a sheet) and the notification bell with its unread badge.
 * The selectors and the inbox are the full-screen app's own pieces, opened in a bottom sheet and
 * talking to the EMBEDDED app's session (its backend, its app state).
 */
export function EmbeddedAppBar({ controller, extras }: { controller: MateuViewController; extras: EmbeddedAppExtras }) {
  const session = controller.session;
  const [sheet, setSheet] = useState<Sheet>(null);
  const [, setRevision] = useState(0);
  // the bell's badge follows the session's inbox (filled once the inbox sheet has loaded it)
  useEffect(() => session.inbox.subscribe(() => setRevision((r) => r + 1)), [session]);

  const appMeta = {
    title: extras.title,
    serverSideType: extras.serverSideType,
    rootRoute: extras.rootRoute,
    homeRoute: extras.homeRoute,
    contextSelectors: extras.contextSelectors as AppContextSelector[],
    notificationsEnabled: extras.notificationsEnabled,
    notificationsSource: extras.notificationsSource,
    notificationsReadSource: extras.notificationsReadSource,
  } as AppMeta;
  // a new context value: the embedded screen rebuilds against it (the app's own remount)
  const reload = () => {
    setSheet(null);
    void controller.navigate(controller.currentRoute, controller.currentConsumedRoute, controller.currentServerSideType);
  };
  const run = (actionId?: string | null) => {
    setSheet(null);
    if (actionId) void controller.runAppExtrasAction(actionId);
  };
  const { inline, more } = splitHeaderActions(extras.contextActions);
  const unread = unreadCount(session.inbox.items());

  return (
    <SessionContextProvider session={session}>
      <View style={styles.bar} accessibilityRole="toolbar" accessibilityLabel={extras.title ? `${extras.title} toolbar` : 'App toolbar'}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barContent}>
          {extras.contextSelectors.map((selector) => {
            const text = contextChipText(selector, session.appState);
            return (
              <TouchableOpacity key={selector.fieldName} {...buttonA11y({ label: text })} style={styles.chip} onPress={() => setSheet({ kind: 'context' })}>
                <Text style={styles.chipText} numberOfLines={1}>{text}</Text>
                <Text style={styles.chipCaret}>▾</Text>
              </TouchableOpacity>
            );
          })}
          {inline.map((action, i) => (
            <MateuButton key={`a${i}`} label={action.label ?? action.actionId ?? ''} buttonStyle="tertiary" onPress={() => run(action.actionId)} />
          ))}
          {more.length > 0 && (
            <IconButton
              icon="dots-horizontal"
              size={20}
              accessibilityLabel="More actions"
              onPress={() => setSheet({ kind: 'actions', title: extras.title ?? 'Actions', actions: more })}
            />
          )}
        </ScrollView>
        {extras.notificationsEnabled && (
          <View>
            <IconButton icon="bell-outline" size={22} accessibilityLabel={unread ? `Notifications, ${unread} unread` : 'Notifications'} onPress={() => setSheet({ kind: 'inbox' })} />
            {unread > 0 && <Badge size={16} style={styles.badge}>{unread > 99 ? '99+' : unread}</Badge>}
          </View>
        )}
      </View>
      <Modal visible={!!sheet} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <View style={styles.backdrop} {...modalA11y()}>
          <TouchableOpacity {...buttonA11y({ label: 'Close' })} style={styles.dismiss} onPress={() => setSheet(null)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <ScrollView>
              {sheet?.kind === 'context' && (
                <ContextSelectors selectors={extras.contextSelectors as AppContextSelector[]} appMeta={appMeta} onChanged={reload} />
              )}
              {sheet?.kind === 'inbox' && (
                <NotificationBell
                  appMeta={appMeta}
                  onNavigate={(item) => {
                    setSheet(null);
                    void controller.navigate(item.route ?? '', item.consumedRoute ?? '', item.serverSideType ?? '');
                  }}
                />
              )}
              {sheet?.kind === 'actions' && (
                <View>
                  <PaperText variant="titleMedium" style={styles.sheetTitle} accessibilityRole="header">{sheet.title}</PaperText>
                  {sheet.actions.map((action, i) => {
                    const leaves = headerActionLeaves(action);
                    const grouped = (action.children?.length ?? 0) > 0;
                    return (
                      <View key={i}>
                        {grouped && <Text style={styles.group}>{action.label ?? ''}</Text>}
                        {leaves.map((leaf, j) => (
                          <TouchableOpacity key={j} {...buttonA11y({ label: leaf.label ?? leaf.actionId ?? '' })} style={styles.row} onPress={() => run(leaf.actionId)}>
                            <Text style={styles.rowText}>{leaf.label ?? leaf.actionId}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SessionContextProvider>
  );
}

const styles = themed(() => StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingLeft: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider, backgroundColor: theme.surface },
  barContent: { alignItems: 'center', gap: 6, paddingRight: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusPill, paddingHorizontal: 12, minHeight: 36, maxWidth: 220 },
  chipText: { color: theme.ink, fontSize: 14 },
  chipCaret: { color: theme.muted, fontSize: 12 },
  badge: { position: 'absolute', top: 4, right: 4 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.32)' },
  dismiss: { flex: 1 },
  sheet: { maxHeight: '75%', backgroundColor: theme.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 24 },
  handle: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2, backgroundColor: theme.border, marginVertical: 12 },
  sheetTitle: { paddingHorizontal: 20, paddingBottom: 8, color: theme.ink },
  group: { color: theme.muted, fontSize: 12, fontWeight: '600', paddingHorizontal: 20, paddingTop: 10, textTransform: 'uppercase' },
  row: { paddingHorizontal: 20, paddingVertical: 12, minHeight: theme.minTouch, justifyContent: 'center' },
  rowText: { color: theme.ink, fontSize: 16 },
}));
