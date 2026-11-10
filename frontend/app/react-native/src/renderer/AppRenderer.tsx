import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { remoteHomeBaseUrl } from '../core/homeTarget';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { CommonActions, NavigationContainer, createNavigationContainerRef, useIsFocused } from '@react-navigation/native';
import { Appbar, BottomNavigation, Divider, Drawer as PaperDrawer, FAB, Icon, IconButton, Text as PaperText } from 'react-native-paper';
import { navigationTheme, useThemeControl } from '../ui/MateuTheme';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { AppState, BackHandler, Image, Platform, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from '../ui/Touchable';
import { Text, TextInput } from '../ui/Text';
import { FAB_MARGIN, fabInset, isCurrentDestination, stackAfterGoTo } from '../core/uxRules';
import { BarTitle, ScreenHasBack } from './ScrollContext';
import { barTitleOf } from '../core/barTitle';
import { useAppContext } from '../context/AppContext';
import { BACK_HINT, NavTarget, ScreenBack, declareMenuRemotes, navigationSession } from '../core/MateuSession';
import { firstComponentFragment, previewOverlayOf, type ChatScreenSnapshot } from '../core/chatStream';
import type { MateuViewController } from '../core/MateuViewController';
import { ChatPanel } from './ChatPanel';
import { MateuViewHost } from './MateuViewHost';
import { theme, themed } from '../theme';
import { materialIconOf } from '../ui/wireIcons';
import { buttonA11y } from '../a11y/a11y';
import { MateuButton } from '../ui/controls';
import { cardsOf, isCardsGroup } from './menuCards';
import { canSignOut, signOut } from '../core/auth';
import { isRuleLeaf, menuLeafEffects, navigableMenuLeaves, type ShellAction } from '../core/shellFlows';
import { fetchExternalJson } from '../core/restFetch';
import { contextOptionsOf, markReadVars, notificationsOf, runAppSource, searchHitsOf, type AppSourceHost } from '../core/appSources';
import { interpolate } from '../core/expressions';
import { catchUpOnResume, filtered, grouped, inboxItemOf, unreadCount, type InboxAction, type InboxFilter, type InboxItem } from '../core/inbox';
import { toastOf } from '../core/componentContext';
import { NotifyOnThisDevice } from './TaskHost';
import { HeaderValuesView, IdleSessionGuard, QuickLaunch, useLiveUpdates, type ShellExtrasMeta } from './AppShellExtras';
import type { AppShortcut } from '../core/appShellExtras';
import { ConnectAiEntry, useAgentChannel, type AgentPushMeta } from './AgentPush';
import { openExternal } from './openExternal';
import { fetch as streamingFetch } from 'expo/fetch';
import { discoverDevEvents, followLiveReload } from '../core/liveReload';
import { MANIFEST_PATH } from '../hub/manifest';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

interface MenuItem {
  label?: string;
  separator?: boolean;
  route?: string;
  consumedRoute?: string;
  serverSideType?: string;
  actionId?: string;
  /** A remote entry's own backend (federated menus). */
  baseUrl?: string;
  submenus?: MenuItem[];
  icon?: string | null;
  description?: string | null;
  /** "cards" on a GROUP whose entries render as cards (label/description/icon/image, submenus = actions). */
  display?: string | null;
  /** Image of an entry shown as a card: URL relative to the backend base, absolute, or data URI. */
  image?: string | null;
  /** A leaf that RUNS rules instead of navigating (RuleLink: a RunAction naming a shell flow). */
  rules?: { action?: string; actionId?: string | null }[] | null;
}

interface AppContextSelector {
  fieldName: string;
  label?: string;
  options?: { value: unknown; label?: string }[];
  /** A data-authored shell's `optionsSource:`: the app fetches the options itself. */
  optionsSource?: Record<string, unknown> | null;
}

interface AppMeta extends ShellExtrasMeta, AgentPushMeta {
  title?: string;
  sseUrl?: string | null;
  /** The app's MCP endpoint (@AI(mcp=…)): forwarded, absolute, with every chat message. */
  mcpUrl?: string | null;
  /** The endpoint the chat's attach button uploads to (@AI(upload=…)). */
  uploadUrl?: string | null;
  themeToggle?: boolean;
  /** @App(accentColor): the brand accent — the renderer's Material primary when it is a hex colour. */
  accentColor?: string | null;
  fabs?: { id?: string; label?: string; actionId?: string; icon?: string }[];
  homeRoute?: string;
  homeConsumedRoute?: string;
  homeServerSideType?: string;
  /** Where the home is loaded from: ABSOLUTE when the server mounted a remote screen as the home. */
  homeBaseUrl?: string;
  serverSideType?: string;
  rootRoute?: string;
  variant?: string;
  menu?: MenuItem[];
  contextSelectors?: AppContextSelector[];
  notificationsEnabled?: boolean;
  /** The app opted in to OS-level notifications (@App(osNotifications = true)). */
  osNotifications?: boolean;
  /** A data-authored shell's inbox: REST sources instead of the app class's supplier. */
  notificationsSource?: Record<string, unknown> | null;
  notificationsReadSource?: Record<string, unknown> | null;
  globalSearchEnabled?: boolean;
  globalSearchSource?: Record<string, unknown> | null;
  /** The shell's declared actions; a flow carries its steps lowered to `commands`. */
  actions?: ShellAction[];
  /** The app's ACTION catalogue: named client-runnable actions, resolved after the owner's. */
  actionCatalogue?: ShellAction[];
}


/** One entity hit as served by the app-level _globalsearch action. */
interface GlobalSearchHit {
  label: string;
  description?: string | null;
  route: string;
  category?: string | null;
}

/**
 * A navigation stack of Mateu views: the base screen (menu target) plus pushed details
 * (row → detail/new/edit, NavigateTo). The top view shows a back header when stacked.
 */
/** What the assistant is told the user is looking at: the live top view. */
const screenOf = (c: MateuViewController): ChatScreenSnapshot => ({
  route: c.currentRoute,
  componentState: c.currentComponentState,
  component: c.rendered.component,
});

function ContentScreen({ route: routeArg, consumedRoute, serverSideType, baseUrl, bottomInset = 0, onPopToRoot, hostBack }: { route: string; consumedRoute: string; serverSideType: string; baseUrl?: string; bottomInset?: number; onPopToRoot?: (popToRoot: () => void) => void; hostBack?: (back: ScreenBack | null) => void }) {
  const { session: appSession } = useAppContext();
  // a navigation naming another backend (a federated entry, the assistant's navigation-requested)
  // runs against it — with the user's credentials only when the app's own backend named it (its
  // menu: declareMenuRemotes); a navigation itself never makes an origin trusted
  const session = React.useMemo(() => (baseUrl ? navigationSession(appSession, baseUrl) : appSession), [appSession, baseUrl]);
  const [stack, setStack] = useState<NavTarget[]>([]);
  // live controller of the TOP view, for the dirty check on back navigation
  const topController = React.useRef<import('../core/MateuViewController').MateuViewController | null>(null);

  React.useEffect(() => {
    setStack([]);
    // The session-level opener (NavigateTo from any view) pushes onto whichever screen is live.
    session.openView = (target) => setStack((s) => [...s, target]);
    // what the agent's render-screen into the content asks about before replacing this screen
    session.hasUnsavedChanges = () => {
      const c = topController.current;
      return !!(c && c.trackDirty && c.dirty) || session.anyUnsavedChanges();
    };
  }, [routeArg, consumedRoute, serverSideType, session]);

  const push = useCallback((target: NavTarget) => setStack((s) => [...s, target]), []);
  // Stack-aware navigation (crud answers, NavigateTo): a screen already on the stack — or the tab's
  // own base — is gone BACK to, never stacked twice; a saved form gives its place to the record.
  const stackNavigate = useCallback(
    (target: NavTarget, replaceTop: boolean) => setStack((s) => stackAfterGoTo(s, routeArg, target, replaceTop)),
    [routeArg],
  );
  const pop = useCallback(async () => {
    const c = topController.current;
    if (((c && c.trackDirty && c.dirty) || session.anyUnsavedChanges()) && !(await session.confirmDiscard())) return;
    setStack((s) => s.slice(0, -1));
  }, [session]);
  // …or straight back to the section's first screen (a long press on the arrow), through the same guard
  const popToStart = useCallback(async () => {
    const c = topController.current;
    if (((c && c.trackDirty && c.dirty) || session.anyUnsavedChanges()) && !(await session.confirmDiscard())) return;
    setStack([]);
  }, [session]);

  // Re-pressing the ACTIVE tab goes back to the tab's own screen (the iOS / Material convention):
  // without it a detail or a NavigateTo pushed over a tab (the starter's "Browse products" CTA)
  // left the user stuck on it, tapping a tab that did nothing.
  React.useEffect(() => {
    onPopToRoot?.(() => setStack([]));
  }, [onPopToRoot]);

  const base: NavTarget = { label: '', route: routeArg, consumedRoute, serverSideType };
  const top = stack.length > 0 ? stack[stack.length - 1] : base;

  // Android's system Back must step back INSIDE the app (Material navigation principles): with a
  // detail pushed it pops it — through the same unsaved-changes guard as the on-screen "Back" — and
  // only on the base screen does it fall through to the navigator / leave the app. Without this the
  // hardware Back skipped the whole detail stack (RN-09).
  React.useEffect(() => {
    if (stack.length === 0) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!appSession.onScreen) return false; // a UI the hub keeps hidden: its stack is not what Back means
      void pop();
      return true;
    });
    return () => sub.remove();
  }, [stack.length, pop]);

  // A shell with a top bar hosts the way back IN that bar (its menu button becomes a back arrow):
  // one bar, not a second one stacked under it. Without a bar (tabs, no menu) the screen draws its own.
  // …and only the screen on view hands it over: a tab in the background keeps its stack to itself
  const focused = useIsFocused();
  React.useEffect(() => {
    if (!hostBack || !focused) return;
    hostBack(stack.length > 0 ? { back: () => void pop(), toStart: () => void popToStart() } : null);
  }, [hostBack, stack.length, pop, popToStart, focused]);
  React.useEffect(() => () => hostBack?.(null), [hostBack]);

  return (
    <View style={[styles.stackHost, { paddingBottom: bottomInset }]}>
      {stack.length > 0 && !hostBack && (
        <View style={styles.backBar}>
          <IconButton icon="arrow-left" accessibilityLabel="Back" accessibilityHint={BACK_HINT} onPress={() => void pop()} onLongPress={() => void popToStart()} iconColor={theme.ink} />
          {!!top.label && <PaperText variant="titleMedium" numberOfLines={1} style={styles.backTitle}>{top.label}</PaperText>}
        </View>
      )}
      <ScreenHasBack.Provider value={stack.length > 0}>
        <MateuViewHost
          key={`${top.route}|${top.consumedRoute}|${stack.length}`}
          session={session}
          target={top}
          onOpenDetail={push}
          onStackNavigate={stackNavigate}
          onController={(c) => {
            topController.current = c;
            appSession.currentScreen = () => screenOf(c);
          }}
        />
      </ScreenHasBack.Provider>
    </View>
  );
}

/** The assistant's render-screen, shown by the shell in the content area until the next navigation. */
function PreviewScreen({ preview, onDismiss, bottomInset }: { preview: ContentPreview; onDismiss: () => void; bottomInset: number }) {
  const { session } = useAppContext();
  return (
    <View style={[styles.stackHost, { paddingBottom: bottomInset }]}>
      <View style={styles.backBar}>
        <IconButton icon="close" accessibilityLabel="Close preview" onPress={onDismiss} iconColor={theme.ink} />
        <PaperText variant="titleMedium" numberOfLines={1} style={styles.backTitle}>{preview.title || 'Assistant preview'}</PaperText>
      </View>
      <MateuViewHost
        key={preview.version}
        session={session}
        preview={{ increment: preview.increment, route: preview.route, consumedRoute: preview.route }}
        onController={(c) => (session.currentScreen = () => screenOf(c))}
      />
    </View>
  );
}

interface ContentPreview {
  increment: unknown;
  route: string;
  title?: string;
  version: number;
}

// beyond this many options the open selector shows a search box (like the web picker)
const CONTEXT_SEARCHABLE_THRESHOLD = 7;

// Application-level context selectors (@AppContext fields of the app class), rendered at the top
// of the drawer: tapping an option fixes the value in the appState sent with every request and
// remounts the current screen so it rebuilds against the new context. Session-scoped for now
// (persisting would need AsyncStorage, which this renderer doesn't depend on yet). With many
// options a search box filters the loaded ones client-side and (debounced) asks the server for
// matches beyond the loaded page via the standard `_appcontext-search-<field>` action.
function ContextSelectors({ selectors, appMeta, onChanged }: { selectors: AppContextSelector[]; appMeta: AppMeta; onChanged: () => void }) {
  const { api, appState, session } = useAppContext();
  // the app's @AppContext values are the user's context: an untrusted island is not given them
  for (const selector of selectors) session.appContextKeys.add(selector.fieldName);
  // a data-authored shell's pickers read their options from their REST source, once
  const [sourced, setSourced] = useState<Record<string, { value: unknown; label?: string }[]>>({});
  React.useEffect(() => {
    for (const selector of selectors) {
      const source = selector.optionsSource;
      if (!source) continue;
      runAppSource(appSourceHost(api, session.sources, appState, appMeta), 'contextOptions', source, {}, selector.fieldName)
        .then((json) => setSourced((s) => ({ ...s, [selector.fieldName]: contextOptionsOf(json, source, session.sources) })))
        .catch((e) => console.warn('mateu: context options fetch failed', e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectors]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  // server results replacing the loaded options while a remote search is active
  const [searched, setSearched] = useState<{ value: unknown; label?: string }[] | null>(null);
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const remoteSearch = (fieldName: string, text: string) => {
    const route = appMeta.homeRoute ?? '';
    api
      .runAction({
        route,
        consumedRoute: route || '_empty',
        actionId: `_appcontext-search-${fieldName}`,
        serverSideType: appMeta.serverSideType ?? null,
        initiatorComponentId: `appcontext-${fieldName}`,
        componentState: {},
        appState,
        parameters: { searchText: text },
      })
      .then((increment) => {
        const fragments = (increment as { fragments?: { data?: Record<string, unknown> }[] })?.fragments ?? [];
        for (const fragment of fragments) {
          const page = fragment.data?.[`_appcontext_${fieldName}`] as { content?: { value: unknown; label?: string }[] } | undefined;
          if (Array.isArray(page?.content)) {
            setSearched(page.content);
            return;
          }
        }
      })
      .catch(() => {
        // server search unavailable: the client-side filter still applies
      });
  };

  const onSearchInput = (fieldName: string, text: string) => {
    setSearchText(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!text.trim()) {
      setSearched(null);
      return;
    }
    searchTimer.current = setTimeout(() => remoteSearch(fieldName, text), 300);
  };

  if (selectors.length === 0) return null;
  return (
    <View>
      {selectors.map((declaredSelector) => {
        const selector = sourced[declaredSelector.fieldName] ? { ...declaredSelector, options: sourced[declaredSelector.fieldName] } : declaredSelector;
        const current = appState[selector.fieldName] != null ? String(appState[selector.fieldName]) : '';
        const currentLabel =
          selector.options?.find((o) => String(o.value) === current)?.label ?? (current || '—');
        const open = expanded === selector.fieldName;
        const searchable = (selector.options?.length ?? 0) > CONTEXT_SEARCHABLE_THRESHOLD;
        const text = searchText.trim().toLowerCase();
        const base = text ? (searched ?? selector.options ?? []) : (selector.options ?? []);
        const visible = text
          ? base.filter((o) => (o.label ?? String(o.value)).toLowerCase().includes(text))
          : base;
        return (
          <View key={selector.fieldName}>
            <TouchableOpacity
              {...buttonA11y({ label: `${selector.label ?? selector.fieldName}: ${current ? currentLabel : 'not set'}`, expanded: open })}
              style={styles.contextRow}
              onPress={() => {
                setSearchText('');
                setSearched(null);
                setExpanded(open ? null : selector.fieldName);
              }}
            >
              <Text style={styles.contextLabel}>{selector.label ?? selector.fieldName}</Text>
              <View style={styles.bellRight}><Text style={[styles.contextValue, !current && styles.contextValueUnset]}>{current ? currentLabel : 'Not set'}</Text><Icon source={open ? 'chevron-up' : 'chevron-down'} size={20} color={theme.muted} /></View>
            </TouchableOpacity>
            {open && searchable && (
              <TextInput
                style={styles.contextSearch}
                placeholder="Search…"
                accessibilityLabel="Search"
                placeholderTextColor={theme.faint}
                value={searchText}
                onChangeText={(value) => onSearchInput(selector.fieldName, value)}
              />
            )}
            {open &&
              [{ value: '', label: 'None' }, ...visible].map((option, i) => (
                <TouchableOpacity {...buttonA11y({ selected: String(option.value ?? '') === current })}
                  key={i}
                  style={styles.contextOption}
                  onPress={() => {
                    if (option.value === '' || option.value == null) {
                      delete appState[selector.fieldName];
                    } else {
                      appState[selector.fieldName] = option.value;
                    }
                    setExpanded(null);
                    onChanged();
                  }}
                >
                  <Text style={[styles.contextOptionText, String(option.value) === current && styles.contextOptionSelected]}>
                    {option.label ?? String(option.value)}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        );
      })}
      <View style={styles.separator} />
    </View>
  );
}

/** Dispatches an APP-LEVEL action (the same rail as the @AppContext pickers' remote search:
 *  route = the app's root/home route, serverSideType = the app class) and returns the response's
 *  fragments. Used by the notification bell (_notifications-*) and the global search. */
const appSourceHost = (
  api: import('../api/MateuApiClient').MateuApiClient,
  sources: AppSourceHost['sources'],
  appState: Record<string, unknown>,
  appMeta: AppMeta,
): AppSourceHost => ({
  api: api as unknown as AppSourceHost['api'],
  sources,
  appState,
  rootRoute: appMeta.rootRoute,
  serverSideType: appMeta.serverSideType ?? null,
});

async function runAppLevelIncrement(
  api: import('../api/MateuApiClient').MateuApiClient,
  appState: Record<string, unknown>,
  appMeta: AppMeta,
  actionId: string,
  parameters: Record<string, unknown>,
  initiatorComponentId: string,
): Promise<unknown> {
  const route = appMeta.rootRoute ?? appMeta.homeRoute ?? '';
  return api.runAction({
    route,
    consumedRoute: route || '_empty',
    actionId,
    serverSideType: appMeta.serverSideType ?? null,
    initiatorComponentId,
    componentState: {},
    appState,
    parameters,
  });
}

async function runAppLevelAction(
  api: import('../api/MateuApiClient').MateuApiClient,
  appState: Record<string, unknown>,
  appMeta: AppMeta,
  actionId: string,
  parameters: Record<string, unknown>,
  initiatorComponentId: string,
): Promise<{ data?: Record<string, unknown> }[]> {
  const route = appMeta.rootRoute ?? appMeta.homeRoute ?? '';
  const increment = await api.runAction({
    route,
    consumedRoute: route || '_empty',
    actionId,
    serverSideType: appMeta.serverSideType ?? null,
    initiatorComponentId,
    componentState: {},
    appState,
    parameters,
  });
  return (increment as { fragments?: { data?: Record<string, unknown> }[] })?.fragments ?? [];
}

/**
 * Notification inbox (App.notificationsEnabled — the app class implements NotificationsSupplier),
 * rendered at the top of the drawer next to the @AppContext selectors: a bell row with an
 * unread-count badge expanding an inbox panel (the drawer idiom the context selectors use).
 * Data comes from the app-level _notifications-list / _notifications-read actions; entry click
 * marks that id read and navigates to the entry's route; "Mark all read" sends {ids:"all"}.
 */
function NotificationBell({ appMeta, onNavigate }: { appMeta: AppMeta; onNavigate: (item: MenuItem) => void }) {
  const { api, appState, session } = useAppContext();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<InboxFilter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  // the session's inbox: the server's list + this session's own entries (inbox messages, pushes)
  const [, setRevision] = useState(0);
  const source = appMeta.notificationsSource ?? undefined;

  /** The list a `_notifications-*` answer carries, into the inbox store. */
  const takeList = useCallback(
    (increment: unknown): boolean => {
      for (const fragment of ((increment as { fragments?: { data?: Record<string, unknown> }[] })?.fragments ?? [])) {
        const list = fragment.data?.['_notifications'];
        if (Array.isArray(list)) {
          session.inbox.setServer(list.map(inboxItemOf).filter((i): i is InboxItem => !!i));
          return true;
        }
      }
      return false;
    },
    [session],
  );

  const refresh = React.useCallback(async () => {
    try {
      if (source) {
        const host = appSourceHost(api, session.sources, appState, appMeta);
        session.inbox.setServer(
          notificationsOf(await runAppSource(host, 'notifications', source, {}), source, session.sources)
            .map(inboxItemOf)
            .filter((i): i is InboxItem => !!i),
        );
        return;
      }
      takeList(await runAppLevelIncrement(api, appState, appMeta, '_notifications-list', {}, 'notification-bell'));
    } catch {
      // inbox unavailable: keep whatever list we had
    }
  }, [api, appState, appMeta, source, session, takeList]);

  /** An inbox answer's other effects: a detail overlay, a message, a navigation. */
  const applyAnswer = (increment: unknown) => {
    const inc = (increment ?? {}) as Record<string, unknown>;
    for (const fragment of (inc['fragments'] as Record<string, unknown>[] | undefined) ?? []) {
      const component = fragment['component'] as Record<string, unknown> | undefined;
      const type = (component?.['metadata'] as Record<string, unknown> | undefined)?.['type'];
      if (component && (type === 'Drawer' || type === 'Dialog')) {
        const route = appMeta.rootRoute ?? appMeta.homeRoute ?? '';
        session.openOverlay(component, fragment['state'], fragment['data'], {
          route,
          consumedRoute: route || '_empty',
          serverSideType: appMeta.serverSideType ?? '',
        });
      }
    }
    for (const message of (inc['messages'] as Record<string, unknown>[] | undefined) ?? []) {
      const toast = toastOf(message);
      if (toast) session.notify(toast.title, toast.text, toast.variant, { duration: toast.duration, sticky: toast.persistence === 'sticky' || undefined, key: toast.key });
    }
    for (const command of (inc['commands'] as Record<string, unknown>[] | undefined) ?? []) {
      if (command['type'] === 'NavigateTo' && typeof command['data'] === 'string') {
        setOpen(false);
        onNavigate({ label: '', route: command['data'], consumedRoute: '', serverSideType: '' });
      }
    }
  };

  const markRead = async (ids: string[] | 'all') => {
    const localIds = new Set(session.inbox.items().filter((i) => i.local).map((i) => i.id));
    session.inbox.markRead(ids);
    const serverIds = ids === 'all' ? ids : ids.filter((id) => !localIds.has(id));
    if (serverIds !== 'all' && serverIds.length === 0) return;
    try {
      if (source) {
        // a source with no way to mark read keeps it local: the entry stops being unread here
        const read = appMeta.notificationsReadSource;
        const all = ids === 'all';
        const list = all ? session.inbox.items().map((n) => n.id) : (serverIds as string[]);
        if (read) await runAppSource(appSourceHost(api, session.sources, appState, appMeta), 'notificationsRead', read, markReadVars(list, all));
        return;
      }
      takeList(await runAppLevelIncrement(api, appState, appMeta, '_notifications-read', { ids: serverIds }, 'notification-bell'));
    } catch {
      // keep the current list
    }
  };

  const dismiss = async (item: InboxItem) => {
    session.inbox.dismiss([item.id]);
    if (item.local || source) return;
    try {
      takeList(await runAppLevelIncrement(api, appState, appMeta, '_notifications-dismiss', { ids: [item.id] }, 'notification-bell'));
    } catch {
      // dismissed here; the server keeps it
    }
  };

  /** One of an entry's actions: a session entry runs it on its screen, a server one on the server. */
  const act = async (item: InboxItem, action: InboxAction) => {
    if (item.local) {
      if (item.unread) session.inbox.markRead([item.id]);
      item.run?.(action);
      return;
    }
    if (action.route && !action.actionId) {
      setOpen(false);
      onNavigate({ label: action.label ?? '', route: action.route, consumedRoute: '', serverSideType: '' });
      return;
    }
    try {
      const answer = await runAppLevelIncrement(api, appState, appMeta, '_notifications-act', { id: item.id, actionId: action.actionId }, 'notification-bell');
      takeList(answer);
      applyAnswer(answer);
    } catch (e) {
      session.notify(null, `The action failed: ${(e as Error)?.message ?? e}`, 'error');
    }
  };

  // fetch once on mount so the badge knows the unread count; follow the store (pushes, messages)
  React.useEffect(() => {
    void refresh();
    return session.inbox.subscribe((change) => {
      setRevision((r) => r + 1);
      if (change?.kind === 'refetch') void refresh();
    });
  }, [refresh, session]);

  // what arrived while the app was away (no stream, no JavaScript) is only on the server
  React.useEffect(() => catchUpOnResume(AppState, () => void refresh()), [refresh]);

  const entryPressed = async (notification: InboxItem) => {
    if (notification.unread) await markRead([notification.id]);
    if (notification.hasDetail && !notification.local) {
      try {
        applyAnswer(await runAppLevelIncrement(api, appState, appMeta, '_notifications-open', { id: notification.id }, 'notification-bell'));
      } catch {
        // no detail: nothing opens
      }
      return;
    }
    if (notification.route) {
      setOpen(false);
      onNavigate({ label: notification.title, route: notification.route, consumedRoute: '', serverSideType: '' });
      return;
    }
    // no route, no detail: the entry unfolds its whole text
    setExpanded((e) => (e === notification.id ? null : notification.id));
  };

  const items = session.inbox.items();
  const unread = unreadCount(items);
  const groups = grouped(filtered(items, filter));

  return (
    <View>
      <PaperDrawer.Item
        label="Notifications"
        icon="bell-outline"
        accessibilityLabel={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        accessibilityState={{ expanded: open }}
        right={() => (
          <View style={styles.bellRight}>
            {unread > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unread > 99 ? '99+' : unread}</Text>
              </View>
            )}
            <Icon source={open ? 'chevron-up' : 'chevron-down'} size={22} color={theme.muted} />
          </View>
        )}
        onPress={() => {
          const next = !open;
          setOpen(next);
          // the count from the last fetch may be stale — refetch each time the panel opens
          if (next) void refresh();
        }}
      />
      {open && (
        <View>
          <NotifyOnThisDevice session={session} />
          <View style={styles.bellFilters} accessibilityRole="tablist">
            {(['unread', 'all', 'resolved'] as InboxFilter[]).map((f) => (
              <TouchableOpacity
                key={f}
                accessibilityRole="tab"
                accessibilityState={{ selected: filter === f }}
                style={[styles.bellFilter, filter === f && styles.bellFilterOn]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.bellFilterText, filter === f && styles.bellFilterTextOn]}>
                  {f === 'unread' ? 'Unread' : f === 'all' ? 'All' : 'Resolved'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {groups.length === 0 && <Text style={styles.bellEmpty}>No notifications</Text>}
          {groups.map((group) => (
            <View key={group.category || '_'}>
              {!!group.category && <Text style={styles.bellCategory} accessibilityRole="header">{group.category}</Text>}
              {group.items.map((n) => (
                <View key={n.id}>
                  <View style={styles.bellEntryRow}>
                    <TouchableOpacity
                      {...buttonA11y({ label: `${n.title}${n.unread ? ', unread' : ''}${n.resolved ? ', resolved' : ''}${n.when ? `, ${n.when}` : ''}` })}
                      style={[styles.bellEntry, styles.bellEntryFlex]}
                      onPress={() => void entryPressed(n)}
                    >
                      <View style={[styles.bellDot, n.unread && styles.bellDotUnread, n.variant === 'error' && styles.bellDotError]} />
                      <View style={styles.bellEntryBody}>
                        <View style={styles.bellEntryTop}>
                          <Text style={[styles.bellEntryTitle, n.unread && styles.bellEntryTitleUnread]} numberOfLines={1}>
                            {n.title}
                          </Text>
                          {!!n.when && <Text style={styles.bellEntryWhen}>{n.when}</Text>}
                        </View>
                        {!!n.text && <Text style={styles.bellEntryText} numberOfLines={expanded === n.id ? undefined : 1}>{n.text}</Text>}
                      </View>
                    </TouchableOpacity>
                    <IconButton icon="close" size={18} accessibilityLabel={`Dismiss ${n.title}`} onPress={() => void dismiss(n)} />
                  </View>
                  {!n.resolved && (n.actions ?? []).length > 0 && (
                    <View style={styles.bellActions}>
                      {(n.actions ?? []).map((a, i) => (
                        <MateuButton
                          key={`${a.actionId ?? a.route ?? ''}#${i}`}
                          compact
                          label={a.label || (a.style === 'undo' ? 'Undo' : '')}
                          buttonStyle={a.style === 'primary' ? 'primary' : null}
                          color={a.style === 'danger' ? 'error' : null}
                          onPress={() => void act(n, a)}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))}
          {items.length > 0 && (
            <TouchableOpacity {...buttonA11y()} style={styles.bellMarkAll} disabled={unread === 0} onPress={() => void markRead('all')}>
              <Text style={[styles.bellMarkAllText, unread === 0 && styles.bellMarkAllDisabled]}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={styles.separator} />
    </View>
  );
}

/**
 * Global search (App.globalSearchEnabled — the ⌘K command palette on the web): a search box atop
 * the drawer menu mixing (a) the app's menu entries, matched client-side, and (b) entity hits
 * from the app-level _globalsearch action (parameters {searchText}, debounced ~300ms). Tapping
 * either navigates through the same path as a menu click.
 */
function GlobalSearchBox({ appMeta, onNavigate }: { appMeta: AppMeta; onNavigate: (item: MenuItem) => void }) {
  const { api, appState, session } = useAppContext();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<GlobalSearchHit[]>([]);
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const remoteSearch = (text: string) => {
    const source = appMeta.globalSearchSource;
    if (source) {
      runAppSource(appSourceHost(api, session.sources, appState, appMeta), 'globalSearch', source, { searchText: text })
        .then((json) => setHits(searchHitsOf(json, source, session.sources) as GlobalSearchHit[]))
        .catch(() => setHits([]));
      return;
    }
    runAppLevelAction(api, appState, appMeta, '_globalsearch', { searchText: text }, 'cmd-palette')
      .then((fragments) => {
        for (const fragment of fragments) {
          const list = fragment.data?.['_globalsearch'];
          if (Array.isArray(list)) {
            setHits(list as GlobalSearchHit[]);
            return;
          }
        }
        setHits([]);
      })
      .catch(() => setHits([]));
  };

  const onInput = (text: string) => {
    setQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!text.trim()) {
      setHits([]);
      return;
    }
    searchTimer.current = setTimeout(() => remoteSearch(text.trim()), 300);
  };

  const text = query.trim().toLowerCase();
  const menuMatches = text
    ? navigableMenuLeaves(appMeta.menu ?? []).filter((item) => (item.label ?? '').toLowerCase().includes(text))
    : [];

  const pick = (item: MenuItem) => {
    setQuery('');
    setHits([]);
    onNavigate(item);
  };

  return (
    <View>
      <TextInput
        style={styles.globalSearchInput}
        placeholder="Search…"
        accessibilityLabel="Search"
        placeholderTextColor={theme.faint}
        value={query}
        onChangeText={onInput}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {!!text && (menuMatches.length > 0 || hits.length > 0) && (
        <View style={styles.globalSearchResults}>
          {menuMatches.map((item, i) => (
            <TouchableOpacity {...buttonA11y()} key={`menu-${i}`} style={styles.globalSearchHit} onPress={() => pick(item)}>
              <Text style={styles.globalSearchHitLabel} numberOfLines={1}>{item.label}</Text>
              <Text style={styles.globalSearchHitCategory}>Menu</Text>
            </TouchableOpacity>
          ))}
          {hits.map((hit, i) => (
            <TouchableOpacity {...buttonA11y()}
              key={`hit-${i}`}
              style={styles.globalSearchHit}
              onPress={() => pick({ label: hit.label, route: hit.route, consumedRoute: '', serverSideType: '' })}
            >
              <View style={styles.globalSearchHitBody}>
                <Text style={styles.globalSearchHitLabel} numberOfLines={1}>{hit.label}</Text>
                {!!hit.description && (
                  <Text style={styles.globalSearchHitDescription} numberOfLines={1}>{hit.description}</Text>
                )}
              </View>
              {!!hit.category && <Text style={styles.globalSearchHitCategory}>{hit.category}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// Drawer content with sidebar menu
// A `display: "cards"` group: one card per entry (title, description, icon/image). A card whose
// entry has submenus is not navigable itself — its submenus render as action chips.
function MenuCards({ group, onNavigate }: { group: MenuItem; onNavigate: (item: MenuItem) => void }) {
  const { session } = useAppContext();
  const cards = cardsOf(group, session.api.baseUrl);
  return (
    <View>
      {!!group.label && <Text style={styles.menuGroupLabel}>{group.label.toUpperCase()}</Text>}
      {cards.map((card, i) => {
        const body = (
          <>
            {card.imageUri ? (
              <Image source={{ uri: card.imageUri }} style={styles.menuCardImage} resizeMode="cover" accessibilityIgnoresInvertColors />
            ) : card.glyph ? (
              <Text style={styles.menuCardGlyph} importantForAccessibility="no">{card.glyph}</Text>
            ) : null}
            <View style={styles.menuCardBody}>
              <Text style={styles.menuCardTitle}>{card.title}</Text>
              {!!card.description && <Text style={styles.menuCardDescription}>{card.description}</Text>}
            </View>
          </>
        );
        return (
          <View key={i} style={styles.menuCard}>
            {card.target ? (
              <TouchableOpacity
                {...buttonA11y({ role: 'link', label: card.description ? `${card.title}, ${card.description}` : card.title })}
                style={styles.menuCardHeader}
                onPress={() => onNavigate(card.target!)}
              >
                {body}
              </TouchableOpacity>
            ) : (
              <View style={styles.menuCardHeader} accessible accessibilityLabel={card.description ? `${card.title}, ${card.description}` : card.title}>
                {body}
              </View>
            )}
            {card.actions.length > 0 && (
              <View style={styles.menuCardActions}>
                {card.actions.map((action, j) => (
                  <TouchableOpacity
                    {...buttonA11y({ role: 'link', label: `${card.title}: ${action.label ?? ''}` })}
                    key={j}
                    style={styles.menuCardAction}
                    onPress={() => onNavigate(action)}
                  >
                    <Text style={styles.menuCardActionText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function SidebarContent({ appMeta, currentRoute, onNavigate, onContextChanged, onLaunch }: { appMeta: AppMeta; currentRoute: string; onNavigate: (item: MenuItem) => void; onContextChanged: () => void; onLaunch: (shortcut: AppShortcut) => void }) {
  const renderItems = (items: MenuItem[], depth = 0): React.ReactNode[] => {
    return items.map((item, i) => {
      if (item.separator) {
        return <Divider key={`sep-${i}`} style={styles.separator} />;
      }
      if (isCardsGroup(item)) {
        return <MenuCards key={i} group={item} onNavigate={onNavigate} />;
      }
      const hasSubmenus = item.submenus && item.submenus.length > 0;
      if (hasSubmenus && depth === 0) {
        return (
          // A group is a section of the drawer, not one more destination: a divider and a quiet
          // header (Material's section label), so it never reads like the entries it holds.
          <View key={i} style={styles.drawerSection}>
            <Divider style={styles.drawerSectionDivider} />
            <PaperText variant="titleSmall" style={styles.drawerSectionTitle} accessibilityRole="header">{item.label ?? ''}</PaperText>
            {renderItems(item.submenus!, depth + 1)}
          </View>
        );
      }
      // "You are here": the current destination carries the active indicator (Nielsen #1,
      // visibility of system status; the Material navigation drawer's selected item).
      const selected = isCurrentDestination(item, currentRoute);
      return (
        // the Material 3 navigation drawer item: a pill with the active indicator on "you are here"
        <PaperDrawer.Item
          key={i}
          label={item.label ?? ''}
          icon={materialIconOf(item.icon)}
          active={selected}
          onPress={() => onNavigate(item)}
          accessibilityLabel={item.label ?? undefined}
          accessibilityState={{ selected }}
          style={depth > 1 ? { marginLeft: 12 + (depth - 1) * 12 } : undefined}
        />
      );
    });
  };

  const { session } = useAppContext();
  const hub = session.hub;
  const canOut = session.signOut ? true : session.api.auth === undefined && canSignOut();
  const doSignOut = () => void (session.signOut ? session.signOut() : signOut());
  return (
    <DrawerContentScrollView style={styles.sidebar} contentContainerStyle={styles.sidebarContent}>
      {hub && (
        // The Mateu hub app: the drawer top is where the user jumps back to their list of UIs or
        // to another UI (design/mobile-app-hub.md §4, "switch between UIs").
        <View style={styles.hubRow}>
          <MateuButton label="My UIs" icon="arrow-left" buttonStyle="tertiary" accessibilityLabel="My UIs" onPress={hub.goHome} />
          <MateuButton label="Switch" icon="swap-horizontal" buttonStyle="tertiary" accessibilityLabel="Switch UI" onPress={hub.openSwitcher} />
        </View>
      )}
      <PaperText variant="titleLarge" style={styles.sidebarTitle} accessibilityRole="header">{appMeta.title ?? 'Mateu'}</PaperText>
      <HeaderValuesView />
      <QuickLaunch meta={appMeta} onLaunch={onLaunch} />
      {appMeta.globalSearchEnabled === true && <GlobalSearchBox appMeta={appMeta} onNavigate={onNavigate} />}
      {appMeta.notificationsEnabled === true && <NotificationBell appMeta={appMeta} onNavigate={onNavigate} />}
      <ConnectAiEntry meta={appMeta} />
      <ContextSelectors selectors={appMeta.contextSelectors ?? []} appMeta={appMeta} onChanged={onContextChanged} />
      {renderItems(appMeta.menu ?? [])}
      {canOut && (
        <PaperDrawer.Item label="Sign out" icon="logout" onPress={doSignOut} accessibilityLabel="Sign out" />
      )}
    </DrawerContentScrollView>
  );
}

/** App-level floating layer: @Fab buttons of the @UI app class + the AI chat FAB (sseUrl).
 *  App fab actions run against the app's home route (the class that declared them). */
function useRunAppAction(appMeta: AppMeta) {
  const { session } = useAppContext();
  return async (actionId: string) => {
    if (!actionId) return;
    try {
      const inc = (await session.api.runFormAction(
        appMeta.homeRoute ?? '',
        appMeta.homeConsumedRoute ?? '',
        actionId,
        appMeta.serverSideType ?? '',
        'ux_main',
        {},
        session.appState,
      )) as { messages?: { title?: string; text?: string; variant?: string }[] };
      for (const m of inc.messages ?? []) {
        if (m.text) session.notify(m.title ?? null, m.text, (m.variant as 'info' | 'warning' | 'error') ?? 'info');
      }
    } catch (e) {
      session.notify(null, e instanceof Error ? e.message : String(e), 'error');
    }
  };
}

/** `connectAiFab`: a shell with no drawer offers "Connect AI" (live UI push) as a floating button. */
function AppOverlays({ appMeta, connectAiFab = false }: { appMeta: AppMeta; connectAiFab?: boolean }) {
  const { session } = useAppContext();
  const [chatOpen, setChatOpen] = useState(false);
  const fabs = appMeta.fabs ?? [];
  const runAppAction = useRunAppAction(appMeta);
  // a pushed navigation / screen hides the assistant, exactly like the same event from the chat
  React.useEffect(() => {
    session.closeAssistant = () => setChatOpen(false);
  }, [session]);
  const connectAi = connectAiFab && appMeta.agentPush === true;

  if (fabs.length === 0 && !appMeta.sseUrl && !connectAi) return null;
  return (
    <>
      <View style={styles.appFabStack} pointerEvents="box-none">
        {fabs.map((fab, i) => (
          fab.label ? (
            <FAB key={i} label={fab.label} accessibilityLabel={fab.label} onPress={() => void runAppAction(fab.actionId ?? fab.id ?? '')} />
          ) : (
            <FAB key={i} icon="plus" accessibilityLabel={fab.actionId || fab.id || 'Action'} onPress={() => void runAppAction(fab.actionId ?? fab.id ?? '')} />
          )
        ))}
        {connectAi && <ConnectAiEntry meta={appMeta} asFab />}
        {!!appMeta.sseUrl && (
          <FAB icon="chat-processing-outline" accessibilityLabel="Open assistant" onPress={() => setChatOpen(true)} />
        )}
      </View>
      {/* mounted while hidden: the conversation survives closing it (and a navigation it asked for) */}
      {!!appMeta.sseUrl && <ChatPanel session={session} sseUrl={appMeta.sseUrl} visible={chatOpen} onClose={() => setChatOpen(false)} />}
    </>
  );
}

export function AppRenderer({ component, appMeta }: { component: Record<string, unknown>; appMeta: AppMeta }) {
  const [currentNav, setNav] = useState<{ route: string; consumedRoute: string; serverSideType: string; baseUrl?: string }>({
    route: appMeta.homeRoute ?? '',
    consumedRoute: appMeta.homeConsumedRoute ?? '',
    serverSideType: appMeta.homeServerSideType ?? appMeta.serverSideType ?? '',
    // a remote screen mounted as the home (a link to /fed/stock) is loaded from the remote
    baseUrl: remoteHomeBaseUrl(appMeta),
  });

  const variant = appMeta.variant ?? 'NAVIGATION_LAYOUT';
  const menuItems = navigableMenuLeaves(appMeta.menu ?? []);
  // bumped when an @AppContext selector changes so the current screen remounts (and thus reloads
  // with the new appState)
  const [contextVersion, setContextVersion] = useState(0);
  const [menuVisit, setMenuVisit] = useState(0);
  // themeToggle = true on @App: a light/dark switch for the whole renderer (src/ui/MateuTheme.tsx);
  // the app's accent colour (@App(accentColor)) becomes the Material primary
  const { dark, setSchemeOverride, setAccent } = useThemeControl();
  const navTheme = navigationTheme();
  React.useEffect(() => setAccent(appMeta.accentColor), [appMeta.accentColor, setAccent]);

  const { session } = useAppContext();
  // OS-level notifications are the app's choice (core/osNotifications.ts)
  session.osNotifications = appMeta.osNotifications === true;
  // the version-skew notices' Reload (core/buildSkew.ts): remount the current screen, so it re-runs
  // its load from scratch against the redeployed backend — the same remount an @AppContext change does
  React.useEffect(() => {
    session.reload = () => setContextVersion((v) => v + 1);
  }, [session]);
  // development mode (the IDE's "Run Mateu App (Live)"): the manifest names the backend's live-reload
  // events (core/liveReload.ts) — a YAML edit, a HotSwap or a restart re-renders the screen on
  // display, as on the web. A production backend (or a static bundle) names none: nothing is opened.
  React.useEffect(() => {
    const base = session.api.baseUrl;
    if (!base || session.api.local) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    // the manifest is asked again while the server is still starting (core/liveReload.ts): opened at
    // once with "Run Mateu App (Live)", it used to find nothing and leave live reload off
    const stopDiscovery = discoverDevEvents({
      baseUrl: base,
      manifestPath: MANIFEST_PATH,
      fetchImpl: fetch,
      onUrl: (url) => {
        if (cancelled) return;
        // a browser's own fetch streams; expo/fetch is the one that streams on a device (React
        // Native's fetch buffers the whole body, and expo/fetch on the web never hands one over)
        const fetchImpl = Platform.OS === 'web' ? fetch : (streamingFetch as unknown as typeof fetch);
        stop = followLiveReload({ url, fetchImpl, onAction: () => session.reload() });
      },
    });
    return () => {
      cancelled = true;
      stopDiscovery();
      stop?.();
    };
  }, [session]);
  // the remotes the app's menu names are the ones its backend chose: they may carry credentials
  declareMenuRemotes(session, appMeta.menu);
  const runAppAction = useRunAppAction(appMeta);
  // the assistant's render-screen shown in the content area: transient — any navigation (even back
  // to the same menu entry) shows the real screen again
  const [preview, setPreview] = useState<ContentPreview | null>(null);
  const setCurrentNav = (nav: { route: string; consumedRoute: string; serverSideType: string; baseUrl?: string }) => {
    setPreview(null);
    setNav(nav);
  };
  // each tab's "back to my own screen", called when the ACTIVE tab is pressed again
  const tabRoots = React.useRef<Record<number, () => void>>({});
  // TABS: the navigator (a navigation to a tab's own route selects that tab, like tapping it) and a
  // destination waiting for the live tab's screen to be back (a preview replaced it: its opener is
  // the unmounted screen's until the real one mounts again)
  const tabsNav = React.useRef(createNavigationContainerRef<Record<string, undefined>>()).current;
  const pendingTabView = React.useRef<NavTarget | null>(null);
  React.useEffect(() => {
    if (preview || !pendingTabView.current) return;
    const target = pendingTabView.current;
    pendingTabView.current = null;
    session.openView(target);
  }, [preview, session]);

  // The shell's REST source catalogue, known BEFORE any child renders: the drawer's inbox and search
  // and the first screen's listing name their sources by `ref`. (A shell loaded here never goes
  // through a view controller, which registers it otherwise; a listing then fetched "undefined".)
  React.useMemo(() => {
    if ((appMeta as { restSources?: unknown }).restSources !== undefined) session.sources.register((appMeta as { restSources?: unknown }).restSources);
  }, [session, (appMeta as { restSources?: unknown }).restSources]);

  // A menu leaf with rules RUNS them: a RunAction naming a flow the shell declares applies its
  // lowered commands here (no server round-trip); any other id is an app-level server action.
  // The catalogue is app-wide: register it so every screen's controller resolves ids against it.
  React.useEffect(() => session.actionCatalogue.register(appMeta.actionCatalogue), [session, appMeta.actionCatalogue]);

  // The assistant: what the shell lets it do (navigate like a menu click, show a screen it declared)
  // and what it tells it (the menu, the MCP and upload endpoints).
  session.chatApp = { menu: appMeta.menu, mcpUrl: appMeta.mcpUrl, uploadUrl: appMeta.uploadUrl };
  session.navigateTo = (nav) => {
    if (!nav.route && nav.actionId) {
      void runAppAction(nav.actionId); // an action entry of the menu
      return;
    }
    const target = { route: nav.route, consumedRoute: nav.consumedRoute, serverSideType: nav.serverSideType ?? '', baseUrl: nav.baseUrl && nav.baseUrl !== session.api.baseUrl ? nav.baseUrl : undefined };
    if (variant === 'TABS' && menuItems.length > 0) {
      const tab = menuItems.findIndex((item) => isCurrentDestination(item, target.route));
      if (tab >= 0 && tabsNav.isReady()) {
        // a tab's own route: select it (and show its own screen), exactly what tapping it does
        setPreview(null);
        tabRoots.current[tab]?.();
        tabsNav.navigate(menuItems[tab].label ?? `Tab${tab}`);
        return;
      }
      // tabs keep their own screens: the destination opens on the live tab's stack — once that
      // screen is back, when a preview was covering it
      if (preview) {
        pendingTabView.current = { label: '', ...target };
        setPreview(null);
      } else {
        session.openView({ label: '', ...target });
      }
    } else {
      setCurrentNav(target);
    }
  };
  session.showPreview = (increment, target, title) => {
    const route = session.currentScreen()?.route ?? currentNav.route;
    if (target === 'content') {
      setPreview((p) => ({ increment, route, title, version: (p?.version ?? 0) + 1 }));
      return;
    }
    const fragment = firstComponentFragment(increment);
    if (!fragment) {
      session.notify(null, 'The assistant sent a screen with nothing to show.', 'warning');
      return;
    }
    session.openOverlay(previewOverlayOf(fragment, target, title), null, null, { route, consumedRoute: route, serverSideType: '' });
  };

  // live header values: seeded from the shell, changed by UpdateHeaderValue / the event stream
  React.useEffect(() => session.headerValues.seed(appMeta.headerValues), [session, appMeta.headerValues]);
  useLiveUpdates(appMeta);
  // live UI push (AppDto.agentPush): the channel an MCP agent's screens / navigations arrive on
  useAgentChannel(appMeta);

  // QUICK LAUNCH: a shortcut's route goes there (mount-absolute, like a menu route); an actionId
  // runs app-level, like a header action
  const launch = (shortcut: AppShortcut) => {
    if (shortcut.route) {
      setCurrentNav({ route: shortcut.route, consumedRoute: appMeta.rootRoute ?? '', serverSideType: '' });
    } else if (shortcut.actionId) {
      void runAppAction(shortcut.actionId);
    }
  };
  const goHome = React.useCallback(() => {
    setCurrentNav({
      route: appMeta.homeRoute ?? '',
      consumedRoute: appMeta.homeConsumedRoute ?? '',
      serverSideType: appMeta.homeServerSideType ?? appMeta.serverSideType ?? '',
      baseUrl: remoteHomeBaseUrl(appMeta),
    });
    setContextVersion((v) => v + 1);
  }, [appMeta.homeRoute, appMeta.homeConsumedRoute, appMeta.homeServerSideType, appMeta.serverSideType, appMeta.homeBaseUrl]);
  const guard = (content: React.ReactNode) => (
    <IdleSessionGuard meta={appMeta} runAppAction={(id) => void runAppAction(id)} onSignOut={goHome}>
      {content}
    </IdleSessionGuard>
  );

  const runMenuLeaf = (item: MenuItem) => {
    for (const effect of menuLeafEffects(item, appMeta.actions, appMeta.actionCatalogue ?? [])) {
      switch (effect.kind) {
        case 'navigate': {
          // mount-relative, like routes.yaml: under the app's root route, like a menu route click
          const root = (appMeta.rootRoute ?? '').replace(/\/+$/, '');
          setCurrentNav({ route: `${root}/${effect.route}`, consumedRoute: appMeta.rootRoute ?? '', serverSideType: '' });
          break;
        }
        case 'url':
          openExternal(effect.url);
          break;
        case 'runAction':
          void runAppAction(effect.actionId);
          break;
        case 'restAction': {
          // A catalogue REST call from the menu: there is no screen state, only the app state.
          const rest = effect.restAction as Record<string, unknown>;
          const source = (rest['source'] as Record<string, unknown>) ?? {};
          if (source['proxy']) {
            void runAppAction(effect.actionId);
            break;
          }
          const ctx = { state: {}, data: {}, appState: session.appState, appData: {} };
          const resolve = (t: unknown) => interpolate(typeof t === 'string' ? t : '', ctx);
          fetchExternalJson(source, resolve, undefined, session.sources)
            .then(() => {
              const message = resolve(rest['successMessage']);
              if (message) session.notify(null, message, 'info', { duration: 3000 });
            })
            .catch(() => session.notify(null, 'Request failed', 'error'));
          break;
        }
        case 'event':
          session.dispatchEvent(effect.eventName, effect.payload);
          break;
        case 'closeOverlay':
          session.closeTopOverlay();
          if (effect.eventName) session.dispatchEvent(effect.eventName, effect.payload ?? null);
          break;
      }
    }
  };

  const handleMenuNav = async (item: MenuItem) => {
    if (isRuleLeaf(item)) {
      runMenuLeaf(item);
      return;
    }
    // @ConfirmOnNavigationIfDirty: a menu entry leaves the screen on view — any of its views
    // (an embedded form included) with unsaved changes asks first
    if (session.anyUnsavedChanges() && !(await session.confirmDiscard())) return;
    setCurrentNav({
      route: item.route ?? '',
      consumedRoute: item.consumedRoute ?? '',
      serverSideType: item.serverSideType ?? '',
    });
    // a menu entry always opens at its first screen — the one on view too, with records pushed over it
    setMenuVisit((v) => v + 1);
  };

  // The app FABs live INSIDE the screen (so the drawer and the tab bar cover them, instead of a FAB
  // floating over an open drawer), and the screen keeps a band free at its bottom for them so they
  // never cover the content's last controls (RN-13).
  const drawerShell = variant !== 'TABS' && menuItems.length > 0;
  // the drawer shell's top bar is THE bar: it hosts the way back from a pushed screen and, inside
  // the Mateu hub, the hub's "switch UI" — so the hub hides its own (session.hub.claimBar)
  const [headerBack, setHeaderBack] = useState<ScreenBack | null>(null);
  const hostBack = React.useCallback((back: ScreenBack | null) => setHeaderBack(back), []);
  // RN-22: the bar names the screen on view (SetWindowTitle, or its own title once resolved) — the
  // Material top app bar; the app's name stays in the drawer header and until a screen names itself
  const [screenTitle, setScreenTitle] = useState<string | null>(null);
  React.useEffect(() => {
    if (!drawerShell) return;
    session.setTitle = (title: string) => setScreenTitle(title);
    return () => {
      session.setTitle = () => {};
    };
  }, [drawerShell, session]);
  const barTitle = barTitleOf(screenTitle, appMeta.title, session.hub?.uiName);
  React.useEffect(() => {
    if (!drawerShell) return;
    session.hub?.claimBar?.(true);
    return () => session.hub?.claimBar?.(false);
  }, [drawerShell, session]);
  const connectAiFab = !drawerShell && appMeta.agentPush === true;
  const bottomInset = fabInset((appMeta.fabs?.length ?? 0) + (appMeta.sseUrl ? 1 : 0) + (connectAiFab ? 1 : 0));
  const withOverlays = (screen: React.ReactNode) => (
    <View style={styles.stackHost}>
      {preview ? <PreviewScreen preview={preview} onDismiss={() => setPreview(null)} bottomInset={bottomInset} /> : screen}
      <AppOverlays appMeta={appMeta} connectAiFab={connectAiFab} />
    </View>
  );

  const mainScreen = withOverlays(
    <BarTitle.Provider value={drawerShell ? barTitle : null}>
    <ContentScreen
      key={`${currentNav.route}-${currentNav.consumedRoute}-${currentNav.baseUrl ?? ""}-${contextVersion}-${menuVisit}`}
      route={currentNav.route}
      consumedRoute={currentNav.consumedRoute}
      serverSideType={currentNav.serverSideType}
      baseUrl={currentNav.baseUrl}
      bottomInset={bottomInset}
      hostBack={drawerShell ? hostBack : undefined}
    />
    </BarTitle.Provider>,
  );

  if (variant === 'TABS' && menuItems.length > 0) {
    return guard(
      <NavigationContainer theme={navTheme} ref={tabsNav}>
        <Tab.Navigator
          screenOptions={{ headerShown: false }}
          // Material's navigation bar, with its active indicator: the navigator keeps deciding what is shown
          tabBar={({ navigation, state, descriptors, insets }) => (
            <BottomNavigation.Bar
              navigationState={state}
              safeAreaInsets={insets}
              onTabPress={({ route, preventDefault }) => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (event.defaultPrevented) preventDefault();
                else navigation.dispatch({ ...CommonActions.navigate(route.name, route.params), target: state.key });
              }}
              renderIcon={({ route, focused, color }) => descriptors[route.key]?.options.tabBarIcon?.({ focused, color, size: 24 }) ?? null}
              getLabelText={({ route }) => route.name}
              // one line, as Material's navigation bar: a long label is cut, never wrapped under its neighbours
              renderLabel={({ route, color }) => (
                <PaperText variant="labelMedium" numberOfLines={1} style={{ color, textAlign: 'center' }}>{route.name}</PaperText>
              )}
            />
          )}
        >
          {menuItems.map((item, i) => (
            <Tab.Screen
              key={i}
              name={item.label ?? `Tab${i}`}
              options={{ tabBarIcon: ({ color, size }) => <Icon source={materialIconOf(item.icon) ?? 'circle-small'} color={color} size={size} /> }}
              listeners={({ navigation }) => ({
                tabPress: () => {
                  setPreview(null);
                  if (navigation.isFocused()) tabRoots.current[i]?.();
                },
              })}
              children={() =>
                withOverlays(
                  <ContentScreen
                    route={item.route ?? ''}
                    consumedRoute={item.consumedRoute ?? ''}
                    serverSideType={item.serverSideType ?? ''}
                    bottomInset={bottomInset}
                    hostBack={session.hub?.hostBack}
                    onPopToRoot={(popToRoot) => (tabRoots.current[i] = popToRoot)}
                  />,
                )
              }
            />
          ))}
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

  // A Drawer is the native equivalent of a hamburger/side menu, so all menu-bearing variants
  // (HAMBURGER_MENU and AUTO) render through it.
  if (variant !== 'TABS' && menuItems.length > 0) {
    return guard(
      <NavigationContainer theme={navTheme}>
        <Drawer.Navigator
          drawerContent={(props) => (
            <SidebarContent
              appMeta={appMeta}
              currentRoute={currentNav.route}
              onNavigate={(item) => {
                handleMenuNav(item);
                props.navigation.closeDrawer();
              }}
              onContextChanged={() => setContextVersion((v) => v + 1)}
              onLaunch={(shortcut) => {
                launch(shortcut);
                props.navigation.closeDrawer();
              }}
            />
          )}
          screenOptions={{
            headerShown: true,
            title: appMeta.title ?? 'Mateu',
            // the Material 3 small top app bar; the root SafeAreaView already keeps it below the
            // status bar, so it adds no inset of its own (it used to: a band of empty space)
            header: ({ navigation }) => (
              <Appbar.Header statusBarHeight={0} style={styles.appBar}>
                {headerBack ? (
                  <Appbar.BackAction accessibilityLabel="Back" accessibilityHint={BACK_HINT} onPress={headerBack.back} onLongPress={headerBack.toStart} />
                ) : (
                  <Appbar.Action icon="menu" accessibilityLabel="Open menu" onPress={() => (navigation as { toggleDrawer: () => void }).toggleDrawer()} />
                )}
                <Appbar.Content title={barTitle} titleStyle={styles.appBarTitle} accessibilityRole="header" testID="app-bar-title" />
                {appMeta.themeToggle && (
                  <Appbar.Action
                    icon={dark ? 'white-balance-sunny' : 'weather-night'}
                    accessibilityLabel={dark ? 'Switch to light theme' : 'Switch to dark theme'}
                    onPress={() => setSchemeOverride(dark ? 'light' : 'dark')}
                  />
                )}
                {session.hub && (
                  <Appbar.Action icon="swap-horizontal" accessibilityLabel="Switch UI" testID="hub-switch" onPress={session.hub.openSwitcher} />
                )}
              </Appbar.Header>
            ),
            drawerStyle: { backgroundColor: theme.surface },
            // the menu is a swipe from the left edge away even while the bar shows the back arrow
            swipeEnabled: true,
          }}
        >
          <Drawer.Screen name="Main" children={() => mainScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    );
  }

  // MEDIATOR / no menu
  return guard(
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" children={() => mainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = themed(() => StyleSheet.create({
  hubRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 4, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider, marginBottom: 8 },
  drawerSection: { marginTop: 8 },
  drawerSectionDivider: { marginHorizontal: 28, marginBottom: 8 },
  drawerSectionTitle: { color: theme.muted, paddingHorizontal: 28, paddingVertical: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: theme.danger, padding: 16, fontSize: 14 },
  stackHost: { flex: 1, backgroundColor: theme.surface },
  appFabStack: { position: 'absolute', right: FAB_MARGIN, bottom: FAB_MARGIN, gap: 12, alignItems: 'flex-end', zIndex: 50 },
  appBar: { backgroundColor: theme.surface },
  appBarTitle: { fontWeight: '600' },
  backBar: { flexDirection: 'row', alignItems: 'center', paddingRight: 16, minHeight: 52, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider, backgroundColor: theme.surface },
  backTitle: { flex: 1, color: theme.ink },
  // A light navigation drawer with an active indicator on the current destination — the Material 3
  // navigation drawer / iOS sidebar idiom (the former dark custom sidebar read as another product's
  // chrome and its grey labels fell under AA contrast).
  sidebar: { flex: 1, backgroundColor: theme.surface },
  // the root SafeAreaView already keeps the drawer below the status bar: no second inset
  sidebarContent: { paddingTop: 8 },
  sidebarTitle: { color: theme.ink, fontWeight: '600', paddingHorizontal: 28, paddingTop: 16, paddingBottom: 12 },
  menuGroupLabel: { color: theme.muted, fontSize: 12, fontWeight: '600', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, letterSpacing: 0.5 },
  menuItem: { minHeight: theme.minTouch, justifyContent: 'center', paddingVertical: 10, paddingRight: 20, marginHorizontal: 8, borderRadius: theme.radiusPill },
  menuItemSelected: { backgroundColor: theme.infoBg },
  menuItemText: { color: theme.ink, fontSize: 16 },
  menuItemTextSelected: { color: theme.info, fontWeight: '700' },
  separator: { marginVertical: 8, marginHorizontal: 28 },
  // card menus (display: "cards" groups)
  menuCard: { marginHorizontal: 12, marginVertical: 4, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusMd, backgroundColor: theme.white, overflow: 'hidden' },
  menuCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  menuCardImage: { width: 40, height: 40, borderRadius: theme.radiusSm, marginRight: 12 },
  menuCardGlyph: { fontSize: 24, width: 40, textAlign: 'center', marginRight: 12 },
  menuCardBody: { flex: 1 },
  menuCardTitle: { color: theme.ink, fontSize: 14, fontWeight: '700' },
  menuCardDescription: { color: theme.muted, fontSize: 12, marginTop: 2 },
  menuCardActions: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingBottom: 10, gap: 6 },
  menuCardAction: { borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusPill, paddingHorizontal: 12, paddingVertical: 8, minHeight: 36, justifyContent: 'center' },
  menuCardActionText: { color: theme.info, fontSize: 14, fontWeight: '600' },
  contextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, minHeight: theme.minTouch },
  contextLabel: { color: theme.muted, fontSize: 14, fontWeight: '600' },
  contextValue: { color: theme.ink, fontSize: 14, fontWeight: '700' },
  contextValueUnset: { color: theme.muted, fontWeight: '400' },
  contextOption: { paddingVertical: 10, paddingLeft: 32, paddingRight: 20, minHeight: theme.minTouch, justifyContent: 'center' },
  contextSearch: { marginHorizontal: 20, marginBottom: 4, backgroundColor: theme.scheme === 'dark' ? '#2A2C31' : '#ECEEF2', borderRadius: theme.radiusPill, paddingHorizontal: 18, minHeight: 44, color: theme.ink, fontSize: 16 },
  contextOptionText: { color: theme.ink, fontSize: 14 },
  contextOptionSelected: { fontWeight: '700', color: theme.info },
  // notification bell (drawer inbox)
  bellRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bellBadge: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: theme.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  bellBadgeText: { color: theme.onFill, fontSize: 11, fontWeight: '700' },
  bellEmpty: { color: theme.muted, fontSize: 14, paddingLeft: 32, paddingVertical: 8 },
  bellFilters: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingVertical: 6 },
  bellFilter: { paddingHorizontal: 12, minHeight: 32, borderRadius: 16, borderWidth: 1, borderColor: theme.border, justifyContent: 'center' },
  bellFilterOn: { backgroundColor: theme.primary, borderColor: theme.primary },
  bellFilterText: { color: theme.ink, fontSize: 14 },
  bellFilterTextOn: { color: theme.onFill },
  bellCategory: { color: theme.muted, fontSize: 12, fontWeight: '600', paddingLeft: 20, paddingTop: 10, textTransform: 'uppercase' },
  bellEntryRow: { flexDirection: 'row', alignItems: 'center' },
  bellEntryFlex: { flex: 1, paddingRight: 4 },
  bellActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingLeft: 36, paddingRight: 20, paddingBottom: 8 },
  bellDotError: { backgroundColor: theme.danger },
  bellEntry: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 10, paddingLeft: 20, paddingRight: 20, minHeight: theme.minTouch },
  bellDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'transparent', marginTop: 5 },
  bellDotUnread: { backgroundColor: theme.primary },
  bellEntryBody: { flex: 1, minWidth: 0 },
  bellEntryTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  bellEntryTitle: { flex: 1, color: theme.muted, fontSize: 14 },
  bellEntryTitleUnread: { fontWeight: '700', color: theme.ink },
  bellEntryWhen: { color: theme.faint, fontSize: 12 },
  bellEntryText: { color: theme.muted, fontSize: 12, marginTop: 1 },
  bellMarkAll: { paddingVertical: 10, paddingLeft: 32, minHeight: theme.minTouch, justifyContent: 'center' },
  bellMarkAllText: { color: theme.info, fontSize: 14, fontWeight: '600' },
  bellMarkAllDisabled: { color: theme.disabled },
  // global search (drawer command palette)
  globalSearchInput: { marginHorizontal: 16, marginBottom: 8, backgroundColor: theme.scheme === 'dark' ? '#2A2C31' : '#ECEEF2', borderRadius: theme.radiusPill, paddingHorizontal: 18, minHeight: 44, color: theme.ink, fontSize: 16 },
  globalSearchResults: { marginBottom: 4 },
  globalSearchHit: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 20, minHeight: theme.minTouch },
  globalSearchHitBody: { flex: 1, minWidth: 0 },
  globalSearchHitLabel: { color: theme.ink, fontSize: 14, fontWeight: '600' },
  globalSearchHitDescription: { color: theme.muted, fontSize: 12, marginTop: 1 },
  globalSearchHitCategory: { color: theme.faint, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
}));
