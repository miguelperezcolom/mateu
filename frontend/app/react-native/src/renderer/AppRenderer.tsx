import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { ComponentRenderer } from './ComponentRenderer';

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

interface AppMeta {
  title?: string;
  homeRoute?: string;
  homeConsumedRoute?: string;
  homeServerSideType?: string;
  serverSideType?: string;
  variant?: string;
  menu?: MenuItem[];
}

interface ContentScreenState {
  component: unknown;
  state: Record<string, unknown>;
  data: unknown;
  loading: boolean;
  error: string | null;
}

function useContentLoader() {
  const { navigate } = useAppContext();
  const [screen, setScreen] = useState<ContentScreenState>({ component: null, state: {}, data: null, loading: false, error: null });

  const loadRoute = useCallback(
    async (route: string, consumedRoute: string, serverSideType: string) => {
      setScreen((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await navigate(route, consumedRoute, serverSideType);
        const res = result as Record<string, unknown>;
        const comp = (res['components'] as unknown[])?.[0] ?? result;
        const st = (res['state'] as Record<string, unknown>) ?? {};
        const dt = res['data'];
        setScreen({ component: comp, state: st, data: dt, loading: false, error: null });
      } catch (e: unknown) {
        const err = e instanceof Error ? e.message : String(e);
        setScreen((s) => ({ ...s, loading: false, error: err }));
      }
    },
    [navigate],
  );

  return { screen, loadRoute };
}

function ContentScreen({ route: routeArg, consumedRoute, serverSideType }: { route: string; consumedRoute: string; serverSideType: string }) {
  const { screen, loadRoute } = useContentLoader();

  React.useEffect(() => {
    loadRoute(routeArg, consumedRoute, serverSideType);
  }, [routeArg, consumedRoute, serverSideType]);

  if (screen.loading) return <ActivityIndicator style={styles.centered} size="large" />;
  if (screen.error) return <Text style={styles.error}>{screen.error}</Text>;
  if (!screen.component) return <View style={styles.centered} />;

  return <ComponentRenderer component={screen.component} state={screen.state} data={screen.data} />;
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

// Drawer content with sidebar menu
function SidebarContent({ appMeta, onNavigate }: { appMeta: AppMeta; onNavigate: (item: MenuItem) => void }) {
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
      {renderItems(appMeta.menu ?? [])}
    </DrawerContentScrollView>
  );
}

export function AppRenderer({ component, appMeta }: { component: Record<string, unknown>; appMeta: AppMeta }) {
  const { navigate } = useAppContext();
  const [currentNav, setCurrentNav] = useState<{ route: string; consumedRoute: string; serverSideType: string }>({
    route: appMeta.homeRoute ?? '',
    consumedRoute: appMeta.homeConsumedRoute ?? '',
    serverSideType: appMeta.homeServerSideType ?? appMeta.serverSideType ?? '',
  });

  const variant = appMeta.variant ?? 'NAVIGATION_LAYOUT';
  const menuItems = flattenMenuItems(appMeta.menu ?? []);

  const handleMenuNav = (item: MenuItem) => {
    setCurrentNav({
      route: item.route ?? '',
      consumedRoute: item.consumedRoute ?? '',
      serverSideType: item.serverSideType ?? '',
    });
  };

  const mainScreen = (
    <ContentScreen
      key={`${currentNav.route}-${currentNav.consumedRoute}`}
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
          drawerContent={() => <SidebarContent appMeta={appMeta} onNavigate={handleMenuNav} />}
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
  sidebar: { flex: 1, backgroundColor: '#354a5e' },
  sidebarTitle: { color: '#fff', fontSize: 18, fontWeight: '700', padding: 20, paddingTop: 16 },
  menuGroupLabel: { color: '#aac0d0', fontSize: 11, fontWeight: '600', paddingHorizontal: 20, paddingVertical: 8, letterSpacing: 1 },
  menuItem: { paddingVertical: 12, paddingRight: 20 },
  menuItemText: { color: '#fff', fontSize: 14 },
  separator: { height: 1, backgroundColor: '#4a6070', marginVertical: 4 },
});
