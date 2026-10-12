import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { headingA11y } from '../../a11y/a11y';
import { theme } from '../../theme';
import { domainOf } from '../links';
import { fetchManifest, versionGate, type UiManifest } from '../manifest';
import type { HubEntry } from '../uiStore';
import { PrimaryButton, SecondaryButton, UiIcon, hubStyles } from './common';

/**
 * Confirm before adding (design/mobile-app-hub.md, Security): a QR can come from anyone, so the
 * DOMAIN is shown first and biggest — the manifest name and icon are the server's own claims and are
 * shown under it, never instead of it.
 */
export function ConfirmAddScreen({
  baseUrl,
  existing,
  allowInsecure,
  appVersion,
  onAdd,
  onOpenExisting,
  onCancel,
}: {
  baseUrl: string;
  existing?: HubEntry;
  allowInsecure: boolean;
  appVersion: string;
  onAdd: (manifest: UiManifest) => void;
  onOpenExisting: (entry: HubEntry) => void;
  onCancel: () => void;
}) {
  const [state, setState] = useState<
    { phase: 'loading' } | { phase: 'ready'; manifest: UiManifest; missing: boolean } | { phase: 'error'; reason: string }
  >({ phase: 'loading' });
  const domain = domainOf(baseUrl);
  const insecure = baseUrl.startsWith('http:');

  const load = useCallback(async () => {
    setState({ phase: 'loading' });
    const r = await fetchManifest(baseUrl, undefined, { allowInsecure });
    setState(r.ok ? { phase: 'ready', manifest: r.manifest, missing: 'missing' in r } : { phase: 'error', reason: r.reason });
  }, [baseUrl, allowInsecure]);

  useEffect(() => {
    if (!existing) void load();
  }, [load, existing]);

  return (
    <View style={hubStyles.screen}>
      <View style={hubStyles.header}>
        <SecondaryButton label="Cancel" onPress={onCancel} />
        <Text style={hubStyles.headerTitle} {...headingA11y(1)}>Add this UI?</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={hubStyles.body}>
        <View style={hubStyles.card}>
          <Text style={styles.caption}>Server</Text>
          <Text style={styles.domain} accessibilityLabel={`Server domain: ${domain}`} testID="hub-confirm-domain">
            {domain}
          </Text>
          <Text style={styles.baseUrl} selectable>{baseUrl}</Text>
        </View>

        {insecure && (
          <View style={hubStyles.warning}>
            <Text style={hubStyles.warningText}>Not secure (http): allowed only because this is a development build.</Text>
          </View>
        )}

        {existing ? (
          <>
            <View style={hubStyles.note}>
              <Text style={hubStyles.noteText}>"{existing.name}" is already in your list.</Text>
            </View>
            <PrimaryButton label={`Open ${existing.name}`} onPress={() => onOpenExisting(existing)} />
          </>
        ) : state.phase === 'loading' ? (
          <View style={styles.loading}>
            <ActivityIndicator color={theme.primary} />
            <Text style={hubStyles.text}>Contacting {domain}…</Text>
          </View>
        ) : state.phase === 'error' ? (
          <>
            <View style={hubStyles.warning} accessibilityRole="alert">
              <Text style={hubStyles.warningText}>{state.reason}</Text>
            </View>
            <PrimaryButton label="Try again" onPress={() => void load()} />
          </>
        ) : (
          <ManifestCard manifest={state.manifest} missing={state.missing} appVersion={appVersion} onAdd={onAdd} />
        )}
        <Text style={[hubStyles.text, styles.fine]}>
          Only add UIs from organisations you trust. Adding one stores its address on this phone; you sign in to it, if it needs it, when you open it.
        </Text>
      </ScrollView>
    </View>
  );
}

function ManifestCard({ manifest, missing, appVersion, onAdd }: { manifest: UiManifest; missing: boolean; appVersion: string; onAdd: (m: UiManifest) => void }) {
  const gate = versionGate(manifest, appVersion);
  const issuer = manifest.auth ? domainOf(manifest.auth.issuer) : null;
  return (
    <>
      <View style={[hubStyles.card, styles.appRow]}>
        <UiIcon name={manifest.name} icon={manifest.icon} color={manifest.themeColor} size={56} />
        <View style={styles.appText}>
          <Text style={styles.caption}>Says it is</Text>
          <Text style={styles.appName} testID="hub-confirm-name">{manifest.name}</Text>
        </View>
      </View>
      {missing && (
        <View style={hubStyles.note}>
          <Text style={hubStyles.noteText}>This server does not describe itself (no Mateu manifest). It is named after its domain.</Text>
        </View>
      )}
      {issuer && (
        <View style={hubStyles.note}>
          <Text style={hubStyles.noteText}>You will sign in with {issuer}.</Text>
        </View>
      )}
      {!gate.ok && (
        <View style={hubStyles.warning}>
          <Text style={hubStyles.warningText}>{gate.reason} You can add it now and open it after updating Mateu.</Text>
        </View>
      )}
      <PrimaryButton label="Add" onPress={() => onAdd(manifest)} hint={`Adds ${manifest.name} to your list`} />
    </>
  );
}

/** Import from an export QR: lists the domains (the only thing it carries) before adding any. */
export function ConfirmImportScreen({
  baseUrls,
  rejected,
  known,
  onImport,
  onCancel,
}: {
  baseUrls: string[];
  rejected: number;
  known: (baseUrl: string) => boolean;
  onImport: (baseUrls: string[]) => void;
  onCancel: () => void;
}) {
  const fresh = baseUrls.filter((u) => !known(u));
  return (
    <View style={hubStyles.screen}>
      <View style={hubStyles.header}>
        <SecondaryButton label="Cancel" onPress={onCancel} />
        <Text style={hubStyles.headerTitle} {...headingA11y(1)}>Import UIs</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={hubStyles.body}>
        <Text style={[hubStyles.text, styles.fine]}>This code lists {baseUrls.length} server{baseUrls.length === 1 ? '' : 's'}. Only their addresses are imported — no sign-ins.</Text>
        <View style={hubStyles.card}>
          {baseUrls.map((u) => (
            <View key={u} style={styles.importRow}>
              <Text style={styles.importDomain}>{domainOf(u)}</Text>
              <Text style={styles.importState}>{known(u) ? 'already added' : 'new'}</Text>
            </View>
          ))}
        </View>
        {rejected > 0 && (
          <View style={hubStyles.warning}>
            <Text style={hubStyles.warningText}>{rejected} address{rejected === 1 ? ' was' : 'es were'} skipped (not secure or invalid).</Text>
          </View>
        )}
        <PrimaryButton
          label={fresh.length ? `Add ${fresh.length} UI${fresh.length === 1 ? '' : 's'}` : 'Nothing new to add'}
          disabled={!fresh.length}
          onPress={() => onImport(fresh)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSpacer: { width: 60 },
  caption: { fontSize: 12, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  domain: { fontSize: 26, fontWeight: '700', color: theme.ink },
  baseUrl: { fontSize: 13, color: theme.muted },
  loading: { alignItems: 'center', gap: 8, padding: theme.spacing.md },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appText: { flex: 1 },
  appName: { fontSize: 18, fontWeight: '600', color: theme.ink },
  fine: { textAlign: 'left', maxWidth: undefined, fontSize: 13 },
  importRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  importDomain: { fontSize: 15, fontWeight: '600', color: theme.ink, flex: 1 },
  importState: { fontSize: 13, color: theme.muted },
});
