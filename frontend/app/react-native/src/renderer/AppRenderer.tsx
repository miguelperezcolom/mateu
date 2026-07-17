import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NavTarget } from '../core/MateuSession';
import { ChatPanel } from './ChatPanel';
import { MateuViewHost } from './MateuViewHost';

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
function ContentScreen({ route: routeArg, consumedRoute, serverSideType }: { route: string; consumedRoute: string; serverSideType: string }) {
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

  return (
    <View style={styles.stackHost}>
      {stack.length > 0 && (
        <View style={styles.backBar}>
          <TouchableOpacity onPress={pop} style={styles.backButton}>
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
              style={styles.contextRow}
              onPress={() => {
                setSearchText('');
                setSearched(null);
                setExpanded(open ? null : selector.fieldName);
              }}
            >
              <Text style={styles.contextLabel}>{selector.label ?? selector.fieldName}</Text>
              <Text style={styles.contextValue}>{currentLabel} {open ? '▾' : '▸'}</Text>
            </TouchableOpacity>
            {open && searchable && (
              <TextInput
                style={styles.contextSearch}
                placeholder="Search…"
                placeholderTextColor="#8a97a5"
                value={searchText}
                onChangeText={(value) => onSearchInput(selector.fieldName, value)}
              />
            )}
            {open &&
              [{ value: '', label: '—' }, ...visible].map((option, i) => (
                <TouchableOpacity
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
        style={styles.contextRow}
        onPress={() => {
          const next = !open;
          setOpen(next);
          // the count from the last fetch may be stale — refetch each time the panel opens
          if (next) void refresh();
        }}
      >
        <Text style={styles.contextLabel}>🔔 NOTIFICATIONS</Text>
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
            <TouchableOpacity key={n.id ?? i} style={styles.bellEntry} onPress={() => void entryPressed(n)}>
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
            <TouchableOpacity style={styles.bellMarkAll} disabled={unread === 0} onPress={() => void markRead('all')}>
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
        placeholderTextColor="#8a97a5"
        value={query}
        onChangeText={onInput}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {!!text && (menuMatches.length > 0 || hits.length > 0) && (
        <View style={styles.globalSearchResults}>
          {menuMatches.map((item, i) => (
            <TouchableOpacity key={`menu-${i}`} style={styles.globalSearchHit} onPress={() => pick(item)}>
              <Text style={styles.globalSearchHitLabel} numberOfLines={1}>{item.label}</Text>
              <Text style={styles.globalSearchHitCategory}>Menu</Text>
            </TouchableOpacity>
          ))}
          {hits.map((hit, i) => (
            <TouchableOpacity
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
function SidebarContent({ appMeta, onNavigate, onContextChanged }: { appMeta: AppMeta; onNavigate: (item: MenuItem) => void; onContextChanged: () => void }) {
  const renderItems = (items: MenuItem[], depth = 0): React.ReactNode[] => {
    return items.map((item, i) => {
      if (item.separator) {
        return <View key={`sep-${i}`} style={styles.separator} />;
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
      return (
        <TouchableOpacity key={i} style={[styles.menuItem, { paddingLeft: 20 + depth * 12 }]} onPress={() => onNavigate(item)}>
          <Text style={styles.menuItemText}>{item.label}</Text>
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
    </DrawerContentScrollView>
  );
}

/** App-level floating layer: @Fab buttons of the @UI app class + the AI chat FAB (sseUrl).
 *  App fab actions run against the app's home route (the class that declared them). */
function AppOverlays({ appMeta }: { appMeta: AppMeta }) {
  const { session } = useAppContext();
  const [chatOpen, setChatOpen] = useState(false);
  const fabs = appMeta.fabs ?? [];

  const runAppAction = async (actionId: string) => {
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

  if (fabs.length === 0 && !appMeta.sseUrl) return null;
  return (
    <>
      <View style={styles.appFabStack} pointerEvents="box-none">
        {fabs.map((fab, i) => (
          <TouchableOpacity key={i} style={styles.appFab} onPress={() => void runAppAction(fab.actionId ?? fab.id ?? '')}>
            <Text style={styles.appFabText}>{fab.label || '+'}</Text>
          </TouchableOpacity>
        ))}
        {!!appMeta.sseUrl && (
          <TouchableOpacity style={[styles.appFab, styles.chatFab]} onPress={() => setChatOpen(true)}>
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

  const handleMenuNav = (item: MenuItem) => {
    setCurrentNav({
      route: item.route ?? '',
      consumedRoute: item.consumedRoute ?? '',
      serverSideType: item.serverSideType ?? '',
    });
  };

  const mainScreen = (
    <ContentScreen
      key={`${currentNav.route}-${currentNav.consumedRoute}-${contextVersion}`}
      route={currentNav.route}
      consumedRoute={currentNav.consumedRoute}
      serverSideType={currentNav.serverSideType}
    />
  );

  if (variant === 'TABS' && menuItems.length > 0) {
    return (
      <NavigationContainer theme={navTheme}>
        <AppOverlays appMeta={appMeta} />
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          {menuItems.map((item, i) => (
            <Tab.Screen
              key={i}
              name={item.label ?? `Tab${i}`}
              children={() => (
                <ContentScreen
                  route={item.route ?? ''}
                  consumedRoute={item.consumedRoute ?? ''}
                  serverSideType={item.serverSideType ?? ''}
                />
              )}
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
                  <TouchableOpacity style={styles.themeToggle} onPress={() => setDark(!dark)}>
                    <Text style={styles.themeToggleText}>{dark ? '☀️' : '🌙'}</Text>
                  </TouchableOpacity>
                )
              : undefined,
          }}
        >
          <Drawer.Screen name="Main" children={() => mainScreen} />
        </Drawer.Navigator>
        <AppOverlays appMeta={appMeta} />
      </NavigationContainer>
    );
  }

  // MEDIATOR / no menu
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" children={() => mainScreen} />
      </Stack.Navigator>
      <AppOverlays appMeta={appMeta} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#cc0000', padding: 16, fontSize: 14 },
  stackHost: { flex: 1 },
  appFabStack: { position: 'absolute', right: 16, bottom: 90, gap: 10, alignItems: 'flex-end', zIndex: 50 },
  appFab: { minWidth: 52, height: 52, borderRadius: 26, backgroundColor: '#0070f3', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  chatFab: { backgroundColor: '#1a1a2e' },
  appFabText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  themeToggle: { paddingHorizontal: 14 },
  themeToggleText: { fontSize: 18 },
  backBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fafafa' },
  backButton: { paddingVertical: 4, paddingRight: 12 },
  backText: { color: '#0070f3', fontSize: 15, fontWeight: '600' },
  backTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  sidebar: { flex: 1, backgroundColor: '#354a5e' },
  sidebarTitle: { color: '#fff', fontSize: 18, fontWeight: '700', padding: 20, paddingTop: 16 },
  menuGroupLabel: { color: '#aac0d0', fontSize: 11, fontWeight: '600', paddingHorizontal: 20, paddingVertical: 8, letterSpacing: 1 },
  menuItem: { paddingVertical: 12, paddingRight: 20 },
  menuItemText: { color: '#fff', fontSize: 14 },
  separator: { height: 1, backgroundColor: '#4a6070', marginVertical: 4 },
  contextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  contextLabel: { color: '#aac0d0', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  contextValue: { color: '#fff', fontSize: 14, fontWeight: '700' },
  contextOption: { paddingVertical: 8, paddingLeft: 32, paddingRight: 20 },
  contextSearch: { marginHorizontal: 20, marginBottom: 4, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#4a5a6a', borderRadius: 6, color: '#ffffff', fontSize: 13 },
  contextOptionText: { color: '#d5e2ec', fontSize: 14 },
  contextOptionSelected: { fontWeight: '700', color: '#fff' },
  // notification bell (drawer inbox)
  bellRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bellBadge: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#d32f2f', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  bellEmpty: { color: '#8a97a5', fontSize: 13, paddingLeft: 32, paddingVertical: 8 },
  bellEntry: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 8, paddingLeft: 20, paddingRight: 20 },
  bellDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'transparent', marginTop: 5 },
  bellDotUnread: { backgroundColor: '#4da3ff' },
  bellEntryBody: { flex: 1, minWidth: 0 },
  bellEntryTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  bellEntryTitle: { flex: 1, color: '#d5e2ec', fontSize: 13 },
  bellEntryTitleUnread: { fontWeight: '700', color: '#fff' },
  bellEntryWhen: { color: '#8a97a5', fontSize: 11 },
  bellEntryText: { color: '#aac0d0', fontSize: 12, marginTop: 1 },
  bellMarkAll: { paddingVertical: 8, paddingLeft: 32 },
  bellMarkAllText: { color: '#4da3ff', fontSize: 13, fontWeight: '600' },
  bellMarkAllDisabled: { color: '#5a6e80' },
  // global search (drawer command palette)
  globalSearchInput: { marginHorizontal: 20, marginBottom: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#4a5a6a', borderRadius: 6, color: '#ffffff', fontSize: 13 },
  globalSearchResults: { marginBottom: 4 },
  globalSearchHit: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 20 },
  globalSearchHitBody: { flex: 1, minWidth: 0 },
  globalSearchHitLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },
  globalSearchHitDescription: { color: '#aac0d0', fontSize: 11, marginTop: 1 },
  globalSearchHitCategory: { color: '#8a97a5', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
});
