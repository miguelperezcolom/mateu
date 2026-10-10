import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { BackHandler, Image, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FAB_MARGIN, fabInset, isCurrentDestination } from '../core/uxRules';
import { useAppContext } from '../context/AppContext';
import { NavTarget } from '../core/MateuSession';
import { ChatPanel } from './ChatPanel';
import { MateuViewHost } from './MateuViewHost';
import { theme } from '../theme';
import { buttonA11y } from '../a11y/a11y';
import { cardsOf, isCardsGroup } from './menuCards';
import { canSignOut, signOut } from '../core/auth';
import { isRuleLeaf, menuLeafEffects, registerActionCatalogue, type ShellAction } from '../core/shellFlows';
import { fetchExternalJson } from '../core/restFetch';
import { interpolate } from '../core/expressions';

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
}

interface AppMeta {
  title?: string;
  sseUrl?: string | null;
  themeToggle?: boolean;
  fabs?: { id?: string; label?: string; actionId?: string; icon?: string }[];
  homeRoute?: string;
  homeConsumedRoute?: string;
  homeServerSideType?: string;
  serverSideType?: string;
  rootRoute?: string;
  variant?: string;
  menu?: MenuItem[];
  contextSelectors?: AppContextSelector[];
  notificationsEnabled?: boolean;
  globalSearchEnabled?: boolean;
  /** The shell's declared actions; a flow carries its steps lowered to `commands`. */
  actions?: ShellAction[];
  /** The app's ACTION catalogue: named client-runnable actions, resolved after the owner's. */
  actionCatalogue?: ShellAction[];
}

/** One inbox entry as served by the _notifications-list / _notifications-read actions. */
interface AppNotification {
  id: string;
  title: string;
  text?: string | null;
  route?: string | null;
  unread: boolean;
  when?: string | null;
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
function ContentScreen({ route: routeArg, consumedRoute, serverSideType, bottomInset = 0 }: { route: string; consumedRoute: string; serverSideType: string; bottomInset?: number }) {
  const { session } = useAppContext();
  const [stack, setStack] = useState<NavTarget[]>([]);
  // live controller of the TOP view, for the dirty check on back navigation
  const topController = React.useRef<import('../core/MateuViewController').MateuViewController | null>(null);

  React.useEffect(() => {
    setStack([]);
    // The session-level opener (NavigateTo from any view) pushes onto whichever screen is live.
    session.openView = (target) => setStack((s) => [...s, target]);
  }, [routeArg, consumedRoute, serverSideType, session]);

  const push = useCallback((target: NavTarget) => setStack((s) => [...s, target]), []);
  const pop = useCallback(async () => {
    const c = topController.current;
    if (c && c.trackDirty && c.dirty && !(await session.confirmDiscard())) return;
    setStack((s) => s.slice(0, -1));
  }, [session]);

  const base: NavTarget = { label: '', route: routeArg, consumedRoute, serverSideType };
  const top = stack.length > 0 ? stack[stack.length - 1] : base;

  // Android's system Back must step back INSIDE the app (Material navigation principles): with a
  // detail pushed it pops it — through the same unsaved-changes guard as the on-screen "Back" — and
  // only on the base screen does it fall through to the navigator / leave the app. Without this the
  // hardware Back skipped the whole detail stack (RN-09).
  React.useEffect(() => {
    if (stack.length === 0) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      void pop();
      return true;
    });
    return () => sub.remove();
  }, [stack.length, pop]);

  return (
    <View style={[styles.stackHost, { paddingBottom: bottomInset }]}>
      {stack.length > 0 && (
        <View style={styles.backBar}>
          <TouchableOpacity {...buttonA11y({ label: 'Back' })} onPress={pop} style={styles.backButton} hitSlop={theme.hitSlop}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          {!!top.label && <Text style={styles.backTitle}>{top.label}</Text>}
        </View>
      )}
      <MateuViewHost
        key={`${top.route}|${top.consumedRoute}|${stack.length}`}
        session={session}
        target={top}
        onOpenDetail={push}
        onController={(c) => (topController.current = c)}
      />
    </View>
  );
}

function flattenMenuItems(items: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = [];
  for (const item of items) {
    if (item.separator) continue;
    if (item.submenus && item.submenus.length > 0) {
      result.push(...flattenMenuItems(item.submenus));
    } else if (isRuleLeaf(item)) {
      // a leaf that RUNS a flow has no screen of its own: it is drawn in the drawer, never a tab
      continue;
    } else if (item.route || item.serverSideType) {
      result.push(item);
    }
  }
  return result;
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
  const { api, appState } = useAppContext();
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
      {selectors.map((selector) => {
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
              <Text style={[styles.contextValue, !current && styles.contextValueUnset]}>{current ? currentLabel : 'Not set'} {open ? '▾' : '▸'}</Text>
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
  const { api, appState } = useAppContext();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = React.useCallback(async () => {
    try {
      const fragments = await runAppLevelAction(api, appState, appMeta, '_notifications-list', {}, 'notification-bell');
      for (const fragment of fragments) {
        const list = fragment.data?.['_notifications'];
        if (Array.isArray(list)) {
          setNotifications(list as AppNotification[]);
          return;
        }
      }
    } catch {
      // inbox unavailable: keep whatever list we had
    }
  }, [api, appState, appMeta]);

  const markRead = async (ids: string[] | 'all') => {
    try {
      const fragments = await runAppLevelAction(api, appState, appMeta, '_notifications-read', { ids }, 'notification-bell');
      for (const fragment of fragments) {
        const list = fragment.data?.['_notifications'];
        if (Array.isArray(list)) {
          setNotifications(list as AppNotification[]);
          return;
        }
      }
    } catch {
      // keep the current list
    }
  };

  // fetch once on mount so the badge knows the unread count
  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const entryPressed = async (notification: AppNotification) => {
    if (notification.unread) await markRead([notification.id]);
    if (notification.route) {
      setOpen(false);
      onNavigate({ label: notification.title, route: notification.route, consumedRoute: '', serverSideType: '' });
    }
  };

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <View>
      <TouchableOpacity
        {...buttonA11y({ label: unread > 0 ? `Notifications, ${unread} unread` : 'Notifications', expanded: open })}
        style={styles.contextRow}
        onPress={() => {
          const next = !open;
          setOpen(next);
          // the count from the last fetch may be stale — refetch each time the panel opens
          if (next) void refresh();
        }}
      >
        <Text style={styles.contextLabel}>Notifications</Text>
        <View style={styles.bellRight}>
          {unread > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
          <Text style={styles.contextValue}>{open ? '▾' : '▸'}</Text>
        </View>
      </TouchableOpacity>
      {open && (
        <View>
          {notifications.length === 0 && <Text style={styles.bellEmpty}>No notifications</Text>}
          {notifications.map((n, i) => (
            <TouchableOpacity {...buttonA11y()} key={n.id ?? i} style={styles.bellEntry} onPress={() => void entryPressed(n)}>
              <View style={[styles.bellDot, n.unread && styles.bellDotUnread]} />
              <View style={styles.bellEntryBody}>
                <View style={styles.bellEntryTop}>
                  <Text style={[styles.bellEntryTitle, n.unread && styles.bellEntryTitleUnread]} numberOfLines={1}>
                    {n.title}
                  </Text>
                  {!!n.when && <Text style={styles.bellEntryWhen}>{n.when}</Text>}
                </View>
                {!!n.text && <Text style={styles.bellEntryText} numberOfLines={1}>{n.text}</Text>}
              </View>
            </TouchableOpacity>
          ))}
          {notifications.length > 0 && (
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
  const { api, appState } = useAppContext();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<GlobalSearchHit[]>([]);
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const remoteSearch = (text: string) => {
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
    ? flattenMenuItems(appMeta.menu ?? []).filter((item) => (item.label ?? '').toLowerCase().includes(text))
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

function SidebarContent({ appMeta, currentRoute, onNavigate, onContextChanged }: { appMeta: AppMeta; currentRoute: string; onNavigate: (item: MenuItem) => void; onContextChanged: () => void }) {
  const renderItems = (items: MenuItem[], depth = 0): React.ReactNode[] => {
    return items.map((item, i) => {
      if (item.separator) {
        return <View key={`sep-${i}`} style={styles.separator} />;
      }
      if (isCardsGroup(item)) {
        return <MenuCards key={i} group={item} onNavigate={onNavigate} />;
      }
      const hasSubmenus = item.submenus && item.submenus.length > 0;
      if (hasSubmenus && depth === 0) {
        return (
          <View key={i}>
            <Text style={styles.menuGroupLabel}>{(item.label ?? '').toUpperCase()}</Text>
            {renderItems(item.submenus!, depth + 1)}
          </View>
        );
      }
      // "You are here": the current destination carries the active indicator (Nielsen #1,
      // visibility of system status; the Material navigation drawer's selected item).
      const selected = isCurrentDestination(item, currentRoute);
      return (
        <TouchableOpacity {...buttonA11y({ selected })} key={i} style={[styles.menuItem, selected && styles.menuItemSelected, { paddingLeft: 12 + depth * 12 }]} onPress={() => onNavigate(item)}>
          <Text style={[styles.menuItemText, selected && styles.menuItemTextSelected]}>{item.label}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <DrawerContentScrollView style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>{appMeta.title ?? 'Mateu'}</Text>
      {appMeta.globalSearchEnabled === true && <GlobalSearchBox appMeta={appMeta} onNavigate={onNavigate} />}
      {appMeta.notificationsEnabled === true && <NotificationBell appMeta={appMeta} onNavigate={onNavigate} />}
      <ContextSelectors selectors={appMeta.contextSelectors ?? []} appMeta={appMeta} onChanged={onContextChanged} />
      {renderItems(appMeta.menu ?? [])}
      {canSignOut() && (
        <TouchableOpacity {...buttonA11y({ label: 'Sign out' })} style={[styles.menuItem, { paddingLeft: 12 }]} onPress={() => void signOut()}>
          <Text style={styles.menuItemText}>Sign out</Text>
        </TouchableOpacity>
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

function AppOverlays({ appMeta }: { appMeta: AppMeta }) {
  const { session } = useAppContext();
  const [chatOpen, setChatOpen] = useState(false);
  const fabs = appMeta.fabs ?? [];
  const runAppAction = useRunAppAction(appMeta);

  if (fabs.length === 0 && !appMeta.sseUrl) return null;
  return (
    <>
      <View style={styles.appFabStack} pointerEvents="box-none">
        {fabs.map((fab, i) => (
          <TouchableOpacity {...buttonA11y({ label: fab.label || fab.actionId || fab.id || 'Action' })} key={i} style={styles.appFab} onPress={() => void runAppAction(fab.actionId ?? fab.id ?? '')}>
            <Text style={styles.appFabText}>{fab.label || '+'}</Text>
          </TouchableOpacity>
        ))}
        {!!appMeta.sseUrl && (
          <TouchableOpacity {...buttonA11y({ label: 'Open assistant' })} style={[styles.appFab, styles.chatFab]} onPress={() => setChatOpen(true)}>
            <Text style={styles.appFabText}>💬</Text>
          </TouchableOpacity>
        )}
      </View>
      {chatOpen && !!appMeta.sseUrl && <ChatPanel session={session} sseUrl={appMeta.sseUrl} onClose={() => setChatOpen(false)} />}
    </>
  );
}

export function AppRenderer({ component, appMeta }: { component: Record<string, unknown>; appMeta: AppMeta }) {
  const [currentNav, setCurrentNav] = useState<{ route: string; consumedRoute: string; serverSideType: string }>({
    route: appMeta.homeRoute ?? '',
    consumedRoute: appMeta.homeConsumedRoute ?? '',
    serverSideType: appMeta.homeServerSideType ?? appMeta.serverSideType ?? '',
  });

  const variant = appMeta.variant ?? 'NAVIGATION_LAYOUT';
  const menuItems = flattenMenuItems(appMeta.menu ?? []);
  // bumped when an @AppContext selector changes so the current screen remounts (and thus reloads
  // with the new appState)
  const [contextVersion, setContextVersion] = useState(0);
  // themeToggle = true on @App: light/dark switch applied to the navigation chrome
  const [dark, setDark] = useState(false);
  const navTheme = dark ? DarkTheme : DefaultTheme;

  const { session } = useAppContext();
  const runAppAction = useRunAppAction(appMeta);

  // A menu leaf with rules RUNS them: a RunAction naming a flow the shell declares applies its
  // lowered commands here (no server round-trip); any other id is an app-level server action.
  // The catalogue is app-wide: register it so every screen's controller resolves ids against it.
  React.useEffect(() => registerActionCatalogue(appMeta.actionCatalogue), [appMeta.actionCatalogue]);

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
          void Linking.openURL(effect.url);
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
          fetchExternalJson(source, resolve)
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

  const handleMenuNav = (item: MenuItem) => {
    if (isRuleLeaf(item)) {
      runMenuLeaf(item);
      return;
    }
    setCurrentNav({
      route: item.route ?? '',
      consumedRoute: item.consumedRoute ?? '',
      serverSideType: item.serverSideType ?? '',
    });
  };

  // The app FABs live INSIDE the screen (so the drawer and the tab bar cover them, instead of a FAB
  // floating over an open drawer), and the screen keeps a band free at its bottom for them so they
  // never cover the content's last controls (RN-13).
  const bottomInset = fabInset((appMeta.fabs?.length ?? 0) + (appMeta.sseUrl ? 1 : 0));
  const withOverlays = (screen: React.ReactNode) => (
    <View style={styles.stackHost}>
      {screen}
      <AppOverlays appMeta={appMeta} />
    </View>
  );

  const mainScreen = withOverlays(
    <ContentScreen
      key={`${currentNav.route}-${currentNav.consumedRoute}-${contextVersion}`}
      route={currentNav.route}
      consumedRoute={currentNav.consumedRoute}
      serverSideType={currentNav.serverSideType}
      bottomInset={bottomInset}
    />,
  );

  if (variant === 'TABS' && menuItems.length > 0) {
    return (
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          {menuItems.map((item, i) => (
            <Tab.Screen
              key={i}
              name={item.label ?? `Tab${i}`}
              children={() =>
                withOverlays(
                  <ContentScreen
                    route={item.route ?? ''}
                    consumedRoute={item.consumedRoute ?? ''}
                    serverSideType={item.serverSideType ?? ''}
                    bottomInset={bottomInset}
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
  // (including HAMBURGUER_MENU and AUTO) render through it.
  if (variant !== 'TABS' && menuItems.length > 0) {
    return (
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
            />
          )}
          screenOptions={{
            headerShown: true,
            title: appMeta.title ?? 'Mateu',
            headerRight: appMeta.themeToggle
              ? () => (
                  <TouchableOpacity
                    {...buttonA11y({ label: dark ? 'Switch to light theme' : 'Switch to dark theme' })}
                    style={styles.themeToggle}
                    hitSlop={theme.hitSlop}
                    onPress={() => setDark(!dark)}
                  >
                    <Text style={styles.themeToggleText}>{dark ? '☀️' : '🌙'}</Text>
                  </TouchableOpacity>
                )
              : undefined,
          }}
        >
          <Drawer.Screen name="Main" children={() => mainScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    );
  }

  // MEDIATOR / no menu
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" children={() => mainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: theme.danger, padding: 16, fontSize: 14 },
  stackHost: { flex: 1, backgroundColor: theme.white },
  appFabStack: { position: 'absolute', right: FAB_MARGIN, bottom: FAB_MARGIN, gap: 10, alignItems: 'flex-end', zIndex: 50 },
  appFab: { minWidth: 52, height: 52, borderRadius: 26, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  chatFab: { backgroundColor: theme.ink },
  appFabText: { color: theme.white, fontWeight: '600', fontSize: 16 },
  themeToggle: { paddingHorizontal: 14, minHeight: theme.minTouch, justifyContent: 'center' },
  themeToggleText: { fontSize: 18 },
  backBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, minHeight: theme.minTouch, borderBottomWidth: 1, borderBottomColor: theme.divider, backgroundColor: theme.background },
  backButton: { paddingVertical: 8, paddingRight: 12 },
  backText: { color: theme.primary, fontSize: 15, fontWeight: '600' },
  backTitle: { fontSize: 15, fontWeight: '600', color: theme.ink },
  // A light navigation drawer with an active indicator on the current destination — the Material 3
  // navigation drawer / iOS sidebar idiom (the former dark custom sidebar read as another product's
  // chrome and its grey labels fell under AA contrast).
  sidebar: { flex: 1, backgroundColor: theme.white },
  sidebarTitle: { color: theme.ink, fontSize: 18, fontWeight: '700', padding: 20, paddingTop: 16 },
  menuGroupLabel: { color: theme.muted, fontSize: 12, fontWeight: '600', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, letterSpacing: 0.5 },
  menuItem: { minHeight: theme.minTouch, justifyContent: 'center', paddingVertical: 10, paddingRight: 20, marginHorizontal: 8, borderRadius: theme.radiusPill },
  menuItemSelected: { backgroundColor: theme.infoBg },
  menuItemText: { color: theme.ink, fontSize: 15 },
  menuItemTextSelected: { color: theme.info, fontWeight: '700' },
  separator: { height: 1, backgroundColor: theme.divider, marginVertical: 4 },
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
  menuCardActionText: { color: theme.info, fontSize: 13, fontWeight: '600' },
  contextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, minHeight: theme.minTouch },
  contextLabel: { color: theme.muted, fontSize: 13, fontWeight: '600' },
  contextValue: { color: theme.ink, fontSize: 14, fontWeight: '700' },
  contextValueUnset: { color: theme.muted, fontWeight: '400' },
  contextOption: { paddingVertical: 10, paddingLeft: 32, paddingRight: 20, minHeight: theme.minTouch, justifyContent: 'center' },
  contextSearch: { marginHorizontal: 20, marginBottom: 4, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, color: theme.ink, fontSize: 14 },
  contextOptionText: { color: theme.ink, fontSize: 14 },
  contextOptionSelected: { fontWeight: '700', color: theme.info },
  // notification bell (drawer inbox)
  bellRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bellBadge: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: theme.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  bellBadgeText: { color: theme.white, fontSize: 11, fontWeight: '700' },
  bellEmpty: { color: theme.muted, fontSize: 13, paddingLeft: 32, paddingVertical: 8 },
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
  bellMarkAllText: { color: theme.info, fontSize: 13, fontWeight: '600' },
  bellMarkAllDisabled: { color: theme.disabled },
  // global search (drawer command palette)
  globalSearchInput: { marginHorizontal: 20, marginBottom: 8, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, color: theme.ink, fontSize: 14 },
  globalSearchResults: { marginBottom: 4 },
  globalSearchHit: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 20, minHeight: theme.minTouch },
  globalSearchHitBody: { flex: 1, minWidth: 0 },
  globalSearchHitLabel: { color: theme.ink, fontSize: 14, fontWeight: '600' },
  globalSearchHitDescription: { color: theme.muted, fontSize: 12, marginTop: 1 },
  globalSearchHitCategory: { color: theme.faint, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
});
