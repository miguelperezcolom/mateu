import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Text } from '../../ui/Text';
import { announce } from '../../a11y/a11y';
import { theme, themed } from '../../theme';
import { aboutRows, checkMessage, type AboutInfo, type CheckState } from '../about';
import { appSide } from '../appUpdate';
import { appVersion } from '../storage';
import { HubBar, HubCard, PrimaryButton, SecondaryButton, hubStyles } from './common';

function aboutInfo(): AboutInfo {
  const platform = (Constants.platform ?? {}) as { android?: { versionCode?: number }; ios?: { buildNumber?: string } };
  return {
    version: appVersion(),
    build: Platform.OS === 'android' ? platform.android?.versionCode : platform.ios?.buildNumber,
    mateuVersion: appSide().mateuVersion,
    updatesEnabled: Updates.isEnabled,
    embedded: Updates.isEmbeddedLaunch,
    updateId: Updates.updateId,
    updateCreatedAt: Updates.createdAt,
    channel: Updates.channel,
    runtimeVersion: Updates.runtimeVersion,
  };
}

/**
 * "About Mateu": which app and which code this phone runs, and "Check for updates" — the
 * over-the-air update applied NOW (download + restart) instead of on some later cold start.
 */
export function AboutScreen({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<CheckState>(() => (Updates.isEnabled ? { kind: 'idle' } : { kind: 'disabled' }));
  const rows = aboutRows(aboutInfo());
  const busy = state.kind === 'checking' || state.kind === 'downloading';

  const say = (s: CheckState) => {
    setState(s);
    const text = checkMessage(s);
    if (text) announce(text);
  };

  const check = async () => {
    if (!Updates.isEnabled) return say({ kind: 'disabled' });
    try {
      say({ kind: 'checking' });
      const found = await Updates.checkForUpdateAsync();
      if (!found.isAvailable) return say({ kind: 'latest' });
      say({ kind: 'downloading' });
      await Updates.fetchUpdateAsync();
      say({ kind: 'pending' });
      await Updates.reloadAsync(); // relaunches on the new code — never returns
    } catch (e) {
      say({ kind: 'failed', message: e instanceof Error ? e.message : String(e) });
    }
  };

  const message = checkMessage(state);
  return (
    <View style={hubStyles.screen}>
      <HubBar title="About Mateu" onNavigate={onClose} navigateIcon="close" navigateLabel="Close" />
      <ScrollView contentContainerStyle={hubStyles.body}>
        <HubCard>
          {rows.map((r) => (
            <View key={r.label} style={styles.row} accessible accessibilityLabel={`${r.label}: ${r.value}`}>
              <Text style={styles.label}>{r.label}</Text>
              <Text style={styles.value} selectable>{r.value}</Text>
            </View>
          ))}
        </HubCard>
        {state.kind !== 'disabled' && (
          <PrimaryButton
            label={busy ? 'Checking…' : 'Check for updates'}
            icon="update"
            disabled={busy}
            onPress={() => void check()}
            hint="Downloads the latest update and restarts Mateu with it"
            style={styles.wide}
          />
        )}
        {state.kind === 'pending' && (
          <SecondaryButton label="Restart now" icon="restart" onPress={() => void Updates.reloadAsync()} style={styles.wide} />
        )}
        {!!message && <Text style={hubStyles.text}>{message}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  row: { paddingVertical: 6 },
  label: { fontSize: 13, color: theme.muted },
  value: { fontSize: 16, color: theme.ink },
  wide: { alignSelf: 'stretch' },
}));
