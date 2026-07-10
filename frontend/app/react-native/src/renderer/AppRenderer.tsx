import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { NavTarget } from '../core/MateuSession';
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
  homeRoute?: string;
  homeConsumedRoute?: string;
  homeServerSideType?: string;
  serverSideType?: string;
  variant?: string;
  menu?: MenuItem[];
  contextSelectors?: AppContextSelector[];
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
      <ContextSelectors selectors={appMeta.contextSelectors ?? []} appMeta={appMeta} onChanged={onContextChanged} />
      {renderItems(appMeta.menu ?? [])}
    </DrawerContentScrollView>
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
      <NavigationContainer>
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
      <NavigationContainer>
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
          screenOptions={{ headerShown: true, title: appMeta.title ?? 'Mateu' }}
        >
          <Drawer.Screen name="Main" children={() => mainScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    );
  }

  // MEDIATOR / no menu
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" children={() => mainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#cc0000', padding: 16, fontSize: 14 },
  stackHost: { flex: 1 },
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
});
