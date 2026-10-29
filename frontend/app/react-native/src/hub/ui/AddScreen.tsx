import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { Appbar, HelperText, TextInput } from 'react-native-paper';
import { Text } from '../../ui/Text';
import { announce, fieldA11y, headingA11y } from '../../a11y/a11y';
import { theme, themed } from '../../theme';
import { normalizeBaseUrl, parseHubLink, type HubLink, type ParseOptions } from '../links';
import { HubBar, PrimaryButton, SecondaryButton, hubStyles } from './common';

interface Props {
  initialMode: 'scan' | 'type';
  linkOptions: ParseOptions;
  onCancel: () => void;
  /** A parsed add/import, ready for the confirm screen. */
  onLink: (link: Exclude<HubLink, { kind: 'invalid' }>) => void;
}

/** Add a UI: scan its QR code, or type its address (or paste a Mateu link). */
export function AddScreen({ initialMode, linkOptions, onCancel, onLink }: Props) {
  const [mode, setMode] = useState(initialMode);
  return (
    <View style={hubStyles.screen}>
      <HubBar title="Add a UI" onNavigate={onCancel} navigateIcon="close" navigateLabel="Cancel">
        <Appbar.Action
          icon={mode === 'scan' ? 'keyboard-outline' : 'qrcode-scan'}
          accessibilityLabel={mode === 'scan' ? 'Type an address instead' : 'Scan a QR code instead'}
          onPress={() => setMode((m) => (m === 'scan' ? 'type' : 'scan'))}
        />
      </HubBar>
      {mode === 'scan' ? (
        <Scanner linkOptions={linkOptions} onLink={onLink} onType={() => setMode('type')} />
      ) : (
        <TypeAddress linkOptions={linkOptions} onLink={onLink} />
      )}
    </View>
  );
}

function TypeAddress({ linkOptions, onLink }: { linkOptions: ParseOptions; onLink: Props['onLink'] }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    const text = value.trim();
    // a pasted Mateu link (mateu://add?…, https://mateu.io/add?…) is accepted as well
    if (/^(mateu:|https?:\/\/(www\.)?mateu\.io\/(add|import))/i.test(text)) {
      const link = parseHubLink(text, linkOptions);
      if (link.kind !== 'invalid') return onLink(link);
      setError(link.reason);
      announce(link.reason);
      return;
    }
    const n = normalizeBaseUrl(text, linkOptions);
    if (!n.ok) {
      setError(n.reason);
      announce(n.reason);
      return;
    }
    setError('');
    onLink({ kind: 'add', baseUrl: n.baseUrl });
  };
  return (
    <View style={hubStyles.body}>
      <TextInput
        {...fieldA11y({ label: 'Address of the UI', required: true, error: error || undefined })}
        mode="outlined"
        label="Address of the UI"
        testID="hub-address"
        value={value}
        onChangeText={(t) => {
          setValue(t);
          if (error) setError('');
        }}
        placeholder="https://apps.example.com/crm"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        keyboardType="url"
        inputMode="url"
        returnKeyType="go"
        onSubmitEditing={submit}
        error={!!error}
        left={<TextInput.Icon icon="web" />}
        autoFocus
      />
      <HelperText type="error" visible={!!error} accessibilityLiveRegion="polite">
        {error}
      </HelperText>
      <Text style={[hubStyles.text, styles.left]}>
        You will see the server's name and domain before anything is added. Only secure (https) addresses are accepted.
      </Text>
      <PrimaryButton label="Continue" onPress={submit} disabled={!value.trim()} />
    </View>
  );
}

function Scanner({ linkOptions, onLink, onType }: { linkOptions: ParseOptions; onLink: Props['onLink']; onType: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState('');
  const handled = useRef(false);
  const lastBad = useRef('');

  if (!permission) {
    return (
      <View style={hubStyles.centered}>
        <Text style={hubStyles.text}>Checking camera access…</Text>
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={hubStyles.centered}>
        <Text style={hubStyles.title} {...headingA11y(2)}>Camera access</Text>
        <Text style={hubStyles.text}>
          {permission.canAskAgain
            ? 'Mateu uses the camera only to read QR codes. Nothing is recorded.'
            : 'Camera access is off for Mateu. Turn it on in Settings, or type the address instead.'}
        </Text>
        {permission.canAskAgain ? (
          <PrimaryButton label="Allow camera" icon="camera" onPress={() => void requestPermission()} style={styles.wide} />
        ) : (
          Platform.OS !== 'web' && <PrimaryButton label="Open Settings" onPress={() => void Linking.openSettings()} style={styles.wide} />
        )}
        <SecondaryButton label="Type the address instead" icon="keyboard-outline" onPress={onType} />
      </View>
    );
  }

  return (
    <View style={styles.scanner}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => {
          if (handled.current || data === lastBad.current) return;
          const link = parseHubLink(data, linkOptions);
          if (link.kind === 'invalid') {
            // the same unrelated code stays in view: say it once, keep scanning
            lastBad.current = data;
            setError(link.reason);
            announce(link.reason);
            return;
          }
          handled.current = true;
          onLink(link);
        }}
        accessibilityLabel="Camera viewfinder. Point it at a Mateu QR code."
      />
      <View style={styles.frame} pointerEvents="none" />
      <View style={styles.scanHint}>
        <Text style={styles.scanHintText}>{error || 'Point the camera at a Mateu QR code'}</Text>
      </View>
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  left: { textAlign: 'left', maxWidth: undefined },
  wide: { alignSelf: 'stretch', maxWidth: 340, marginTop: theme.spacing.sm },
  scanner: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  frame: { width: 240, height: 240, borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 24 },
  scanHint: { position: 'absolute', bottom: 40, left: 24, right: 24, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 16 },
  scanHintText: { color: '#FFFFFF', fontSize: 15, textAlign: 'center' },
}));
