import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { MateuAppProvider, useAppContext } from './src/context/AppContext';
import { AppRenderer } from './src/renderer/AppRenderer';
import { ComponentRenderer } from './src/renderer/ComponentRenderer';

// ─── Configure your Mateu backend here ───────────────────────────────────────
const MATEU_CONFIG = {
  baseUrl: 'http://localhost:8080',
  sessionId: 'native-session-1',
  appState: {},
};
// ─────────────────────────────────────────────────────────────────────────────

function MateuRoot() {
  const { api, appState } = useAppContext();
  const [rootComponent, setRootComponent] = useState<unknown>(null);
  const [state, setState] = useState<Record<string, unknown>>({});
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .initialLoad('', appState)
      .then((result) => {
        const res = result as Record<string, unknown>;
        const comp = (res['components'] as unknown[])?.[0] ?? result;
        const st = (res['state'] as Record<string, unknown>) ?? {};
        const dt = res['data'];
        setRootComponent(comp);
        setState(st);
        setData(dt);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0070f3" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Could not connect to Mateu backend</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (!rootComponent) return null;

  const comp = rootComponent as Record<string, unknown>;
  const metadata = (comp['metadata'] as Record<string, unknown>) ?? {};
  const metaType = (metadata['type'] as string) ?? '';

  if (metaType === 'App') {
    return <AppRenderer component={comp} appMeta={metadata as any} />;
  }

  return <ComponentRenderer component={rootComponent} state={state} data={data} />;
}

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <MateuAppProvider config={MATEU_CONFIG}>
        <MateuRoot />
      </MateuAppProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  errorTitle: { fontSize: 16, fontWeight: '600', color: '#cc0000', textAlign: 'center', marginBottom: 8 },
  errorDetail: { fontSize: 13, color: '#666', textAlign: 'center' },
});
