import React, { useState } from 'react';
import { Platform, ScrollView, Share, StyleSheet, View } from 'react-native';
import { Text } from '../../ui/Text';
import QRCode from 'react-native-qrcode-svg';
import { announce, headingA11y } from '../../a11y/a11y';
import { theme, themed } from '../../theme';
import { domainOf, exportLink } from '../links';
import { PrimaryButton, SecondaryButton, hubStyles } from './common';

/**
 * "Export my UIs": a QR (and the share sheet) with the base URLs ONLY — never names, tokens or
 * sessions (design/mobile-app-hub.md §7). Scanning it on another phone imports the list after a
 * confirmation that shows every domain.
 */
export function ExportScreen({ baseUrls, onClose }: { baseUrls: string[]; onClose: () => void }) {
  const link = exportLink(baseUrls);
  const [tooBig, setTooBig] = useState(false);
  const [shared, setShared] = useState('');

  const share = async () => {
    try {
      if (Platform.OS === 'web') {
        const nav = globalThis.navigator as Navigator | undefined;
        if (nav?.share) await nav.share({ title: 'My Mateu UIs', url: link });
        else {
          await nav?.clipboard?.writeText(link);
          setShared('Link copied.');
          announce('Link copied.');
        }
        return;
      }
      await Share.share({ message: link, url: link, title: 'My Mateu UIs' });
    } catch {
      // dismissed
    }
  };

  return (
    <View style={hubStyles.screen}>
      <View style={hubStyles.header}>
        <SecondaryButton label="Close" onPress={onClose} />
        <Text style={hubStyles.headerTitle} {...headingA11y(1)}>Export my UIs</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={[hubStyles.body, styles.center]}>
        <Text style={hubStyles.text}>Scan this with the Mateu app on another phone to copy your list. It contains addresses only — no sign-ins.</Text>
        <View
          style={styles.qr}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`QR code with ${baseUrls.length} address${baseUrls.length === 1 ? '' : 'es'}`}
          testID="hub-export-qr"
        >
          {tooBig ? (
            <Text style={hubStyles.text}>Too many addresses for one QR code — use Share instead.</Text>
          ) : (
            <QRCode value={link} size={240} ecl="L" onError={() => setTooBig(true)} />
          )}
        </View>
        <PrimaryButton label="Share" onPress={() => void share()} style={styles.wide} hint="Shares the link with your list of addresses" />
        {!!shared && <Text style={hubStyles.text}>{shared}</Text>}
        <View style={[hubStyles.card, styles.wide]}>
          {baseUrls.map((u) => (
            <Text key={u} style={styles.domain}>{domainOf(u)}</Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  spacer: { width: 60 },
  center: { alignItems: 'center' },
  qr: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: theme.radiusMd, minHeight: 272, minWidth: 272, alignItems: 'center', justifyContent: 'center' },
  wide: { alignSelf: 'stretch' },
  domain: { fontSize: 15, color: theme.ink, paddingVertical: 2 },
}));
