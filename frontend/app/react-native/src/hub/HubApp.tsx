import * as Linking from 'expo-linking';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View } from 'react-native';
import { announce } from '../a11y/a11y';
import { theme, themed } from '../theme';
import { fromExpoDevLink, parseHubLink, type HubLink, type ParseOptions } from './links';
import type { UiManifest } from './manifest';
import { allowInsecure, appVersion, extraLinkHosts, uiStore } from './storage';
import { DEMO_BASE_URL, type HubEntry } from './uiStore';
import { AddScreen } from './ui/AddScreen';
import { confirmDialog } from './ui/common';
import { ConfirmAddScreen, ConfirmImportScreen } from './ui/ConfirmScreens';
import { ExportScreen } from './ui/ExportScreen';
import { HomeScreen } from './ui/HomeScreen';
import { Switcher } from './ui/Switcher';
import { UiSession } from './ui/UiSession';

type Screen =
  | { name: 'home' }
  | { name: 'add'; mode: 'scan' | 'type' }
  | { name: 'confirm'; baseUrl: string; route?: string; probe?: boolean }
  | { name: 'import'; baseUrls: string[]; rejected: number }
  | { name: 'export' }
  | { name: 'ui' };

interface OpenSession {
  id: string;
  route: string;
  /** Bumped when a deep link re-targets a running session (it remounts at the new route). */
  generation: number;
}

/** Links that are not for the hub and must be ignored silently (OIDC redirect, Expo dev client). */
const isForeign = (url: string): boolean => /^mateu:\/\/\/?auth\b/i.test(url) || /^exps?:\/\//i.test(url) || /^[a-z]+:\/\/expo-development-client/i.test(url);

/** Only complain about an unusable link when it looked like one of ours. */
const lookedLikeOurs = (url: string): boolean => /^mateu:/i.test(url) || /\/(add|import)\?/i.test(url);

/**
 * The Mateu hub (design/mobile-app-hub.md): the list of the user's UIs, adding by QR / typed address /
 * deep link, and the running UI sessions, each kept mounted (hidden when not in front) so switching
 * back finds it as it was left.
 */
export function HubApp() {
  const [entries, setEntries] = useState<HubEntry[] | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [sessions, setSessions] = useState<OpenSession[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const pendingLink = useRef<string | null>(null);
  const [linkTick, setLinkTick] = useState(0);

  const linkOptions: ParseOptions = useMemo(() => ({ allowInsecure, extraLinkHosts }), []);

  useEffect(() => {
    const off = uiStore.subscribe((list) => setEntries([...list]));
    void uiStore.load().then((list) => setEntries([...list]));
    return () => {
      off();
    };
  }, []);

  const open = useCallback((entry: HubEntry, route?: string) => {
    setSessions((s) => {
      const existing = s.find((x) => x.id === entry.id);
      if (!existing) return [...s, { id: entry.id, route: route ?? '', generation: 0 }];
      // a deep link naming a route re-targets the running session; a plain open resumes it as left
      return route ? s.map((x) => (x.id === entry.id ? { ...x, route, generation: x.generation + 1 } : x)) : s;
    });
    setActiveId(entry.id);
    setSwitcherOpen(false);
    setScreen({ name: 'ui' });
  }, []);

  const goHome = useCallback(() => {
    setSwitcherOpen(false);
    setScreen({ name: 'home' });
    announce('My UIs');
  }, []);

  const handleLink = useCallback(
    (link: HubLink, source: 'scan' | 'link' | 'typed') => {
      if (link.kind === 'invalid') {
        if (source === 'link') {
          if (Platform.OS === 'web') announce(link.reason);
          else Alert.alert("Can't add this UI", link.reason);
        }
        return;
      }
      if (link.kind === 'import') {
        setScreen({ name: 'import', baseUrls: link.baseUrls, rejected: link.rejected });
        return;
      }
      const existing = uiStore.findByBaseUrl(link.baseUrl);
      // already trusted: a link just opens it (at its route); a new one always goes through confirm
      if (existing && source === 'link') open(existing, link.route);
      else setScreen({ name: 'confirm', baseUrl: link.baseUrl, route: link.route, probe: link.probe });
    },
    [open],
  );

  const handleUrl = useCallback(
    (raw: string | null) => {
      // Expo Go (development): exp://<dev server>/--/add?u=… is the hub's own add link
      const url = (raw && fromExpoDevLink(raw, linkOptions)) || raw;
      if (!url || isForeign(url)) return;
      const link = parseHubLink(url, linkOptions);
      if (link.kind === 'invalid' && !lookedLikeOurs(url)) return;
      handleLink(link, 'link');
      // web: drop ?u=… from the address bar so a reload doesn't add again
      if (Platform.OS === 'web' && typeof window !== 'undefined' && lookedLikeOurs(url)) {
        try {
          window.history.replaceState(null, '', '/');
        } catch {
          // ignore
        }
      }
    },
    [handleLink, linkOptions],
  );

  // Deep links: the one that launched the app (read once), and any opened while it runs. They are
  // queued until the list is loaded — the "already added?" check needs it.
  const handleUrlRef = useRef(handleUrl);
  handleUrlRef.current = handleUrl;
  const loaded = entries !== null;
  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      if (url) pendingLink.current = url;
      setLinkTick((t) => t + 1);
    });
    const sub = Linking.addEventListener('url', ({ url }) => {
      pendingLink.current = url;
      setLinkTick((t) => t + 1);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!loaded || !pendingLink.current) return;
    const url = pendingLink.current;
    pendingLink.current = null;
    handleUrlRef.current(url);
  }, [loaded, linkTick]);

  const remove = async (entry: HubEntry) => {
    const ok = await confirmDialog(
      `Remove ${entry.name}?`,
      `It disappears from your list and you are signed out of it on this phone. You can add it again later.`,
      'Remove',
      true,
    );
    if (!ok) return;
    setSessions((s) => s.filter((x) => x.id !== entry.id));
    if (activeId === entry.id) setActiveId(undefined);
    await uiStore.remove(entry.id);
    announce(`${entry.name} removed`);
  };

  const addConfirmed = async (baseUrl: string, manifest: UiManifest, route?: string) => {
    const { entry } = await uiStore.add(baseUrl, manifest);
    announce(`${entry.name} added`);
    open(entry, route);
  };

  if (!entries) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const front = (() => {
    switch (screen.name) {
      case 'home':
        return (
          <HomeScreen
            entries={entries}
            openIds={sessions.map((s) => s.id)}
            onOpen={(e) => open(e)}
            onAdd={(mode) => setScreen({ name: 'add', mode })}
            onAddDemo={() => setScreen({ name: 'confirm', baseUrl: DEMO_BASE_URL })}
            onRemove={(e) => void remove(e)}
            onMove={(e, d) => void uiStore.move(e.id, d)}
            onExport={() => setScreen({ name: 'export' })}
          />
        );
      case 'add':
        return <AddScreen initialMode={screen.mode} linkOptions={linkOptions} onCancel={goHome} onLink={(l) => handleLink(l, 'typed')} />;
      case 'confirm':
        return (
          <ConfirmAddScreen
            baseUrl={screen.baseUrl}
            route={screen.route}
            probe={screen.probe}
            findExisting={(u) => uiStore.findByBaseUrl(u)}
            allowInsecure={allowInsecure}
            appVersion={appVersion()}
            onAdd={(m, baseUrl, route) => void addConfirmed(baseUrl, m, route)}
            onOpenExisting={(e, route) => open(e, route)}
            onCancel={goHome}
          />
        );
      case 'import':
        return (
          <ConfirmImportScreen
            baseUrls={screen.baseUrls}
            rejected={screen.rejected}
            known={(u) => !!uiStore.findByBaseUrl(u)}
            onImport={(urls) =>
              void uiStore.importAll(urls).then((n) => {
                announce(`${n} UI${n === 1 ? '' : 's'} added`);
                goHome();
              })
            }
            onCancel={goHome}
          />
        );
      case 'export':
        return <ExportScreen baseUrls={uiStore.exportBaseUrls()} onClose={goHome} />;
      default:
        return null;
    }
  })();

  return (
    <View style={styles.root}>
      {sessions.map((s) => {
        const entry = entries.find((e) => e.id === s.id);
        if (!entry) return null;
        return (
          <UiSession
            key={`${s.id}#${s.generation}`}
            entry={entry}
            route={s.route}
            visible={screen.name === 'ui' && activeId === s.id}
            onHome={goHome}
            onSwitch={() => setSwitcherOpen(true)}
          />
        );
      })}
      {screen.name !== 'ui' && <View style={styles.front}>{front}</View>}
      <Switcher
        visible={switcherOpen}
        entries={entries}
        activeId={activeId}
        onPick={(e) => open(e)}
        onHome={goHome}
        onClose={() => setSwitcherOpen(false)}
      />
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background },
  front: { ...StyleSheet.absoluteFill },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
}));
