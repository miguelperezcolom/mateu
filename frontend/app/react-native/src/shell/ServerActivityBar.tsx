/**
 * "Waiting for the server": a thin Material 3 linear progress indicator right under the top bar of
 * the UI on screen, shown once the server has kept us waiting for SHOW_AFTER_MS (no flicker on a
 * fast answer) and gone the moment nothing is pending. What counts as waiting — and the background
 * traffic that never does — is core/serverActivity.ts.
 *
 * It OVERLAYS the content (a zero-height host with an absolute 4dp bar, pointerEvents none): nothing
 * moves when it comes or goes, and nothing under it stops taking touches. A screen reader hears a
 * polite "Loading…" once per wait (not per request, not repeatedly); the bar itself is hidden from it.
 * With the platform's "reduce motion" on, the bar stands still (a full static strip) instead of
 * sweeping.
 *
 * Placement (CLAUDE.md "ONE BAR"): the drawer shell's own top bar, or the hub's bar when the UI does
 * not claim it, or the top of the screen of a single-backend app without a bar.
 */
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { announceLive } from '../a11y/a11y';
import { loadingTexts } from '../core/loadingTexts';
import { uiLocale } from '../core/money';
import { DelayedBusy, serverActivity } from '../core/serverActivity';
import { theme } from '../theme';

let shared: DelayedBusy | null = null;

/** The app's one delay decision — and its one announcement per wait, however many bars are mounted
 *  (a hub keeps the UIs it is not showing mounted). */
function delayedBusy(): DelayedBusy {
  if (!shared) {
    shared = new DelayedBusy(serverActivity);
    shared.onShown(() => announceLive(loadingTexts(uiLocale()).loading, false));
  }
  return shared;
}

function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled?.()
      .then((on) => alive && setReduce(!!on))
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (on: boolean) => setReduce(!!on));
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  return reduce;
}

export function ServerActivityBar() {
  const busy = delayedBusy();
  const [visible, setVisible] = useState(busy.visible);
  const reduceMotion = useReduceMotion();
  useEffect(() => {
    setVisible(busy.visible);
    return busy.subscribe(setVisible);
  }, [busy]);

  return (
    <View style={styles.host} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {visible && (
        <View style={styles.bar} testID="server-activity-bar">
          {reduceMotion ? (
            <ProgressBar progress={1} color={theme.primary} style={styles.track} />
          ) : (
            <ProgressBar indeterminate color={theme.primary} style={styles.track} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // zero height: it takes no room in the layout; the bar hangs below it over the content
  host: { height: 0, zIndex: 60, elevation: 60, overflow: 'visible' },
  bar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  track: { height: 4, backgroundColor: 'transparent' },
});
