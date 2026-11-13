import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { MateuButton } from './controls';
import { headingA11y } from '../a11y/a11y';
import { uiLocale } from '../core/money';
import { failedStateOf, renderFailureDetail, renderFailureTexts, shouldReset } from '../core/renderFailure';
import { theme, themed } from '../theme';

interface Props {
  children: React.ReactNode;
  /** A new value draws the children again (a new screen, a new answer from the server). */
  resetKey?: unknown;
  /** A one-line fallback (an island, a field-sized piece) instead of the centred block. */
  compact?: boolean;
  /** Where it sits, for the log line. */
  where?: string;
  /** An overlay: the fallback also offers to close it (trying again may fail the same way). */
  onClose?: () => void;
  closeLabel?: string;
}

interface State {
  failed: boolean;
  error: unknown;
  attempt: number;
  resetKey: unknown;
}

/**
 * Keeps a render exception to the piece that threw (core/renderFailure.ts): the screen, the overlay
 * or the hub UI around it go on, with "Try again". Without one, React unmounts the whole app.
 */
export class RenderBoundary extends React.Component<Props, State> {
  state: State = { failed: false, error: null, attempt: 0, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return failedStateOf(error);
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (!state.failed) return Object.is(props.resetKey, state.resetKey) ? null : { resetKey: props.resetKey };
    if (shouldReset({ attempt: state.attempt, resetKey: state.resetKey }, { attempt: state.attempt, resetKey: props.resetKey })) {
      return { failed: false, error: null, resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }): void {
    // never silent: the developer sees which piece threw (the user sees the fallback)
    console.warn(`[Mateu] render failed${this.props.where ? ` (${this.props.where})` : ''}:`, renderFailureDetail(error), info?.componentStack ?? '');
  }

  private retry = () => this.setState((s) => ({ failed: false, error: null, attempt: s.attempt + 1 }));

  render(): React.ReactNode {
    if (!this.state.failed) return this.props.children;
    const texts = renderFailureTexts(uiLocale());
    const detail = __DEV__ ? renderFailureDetail(this.state.error) : null;
    if (this.props.compact) {
      return (
        <View style={styles.compact} accessibilityRole="alert">
          <Text style={styles.compactText}>{texts.title}</Text>
          <MateuButton label={texts.retry} compact icon="refresh" onPress={this.retry} />
        </View>
      );
    }
    return (
      <View style={styles.centered} accessibilityRole="alert">
        <Text style={styles.title} {...headingA11y(2)}>{texts.title}</Text>
        <Text style={styles.detail}>{texts.detail}</Text>
        {detail ? <Text style={styles.technical}>{detail}</Text> : null}
        <MateuButton label={texts.retry} buttonStyle="primary" icon="refresh" onPress={this.retry} />
        {this.props.onClose ? <MateuButton label={this.props.closeLabel ?? 'Close'} icon="close" onPress={this.props.onClose} /> : null}
      </View>
    );
  }
}

const styles = themed(() => StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 },
  title: { fontSize: 22, fontWeight: '700', color: theme.ink, textAlign: 'center' },
  detail: { fontSize: 14, color: theme.muted, textAlign: 'center', maxWidth: 360 },
  technical: { fontSize: 12, color: theme.faint, textAlign: 'center', maxWidth: 360 },
  compact: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  compactText: { flexShrink: 1, fontSize: 12, color: theme.muted },
}));
