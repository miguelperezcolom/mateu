import React from 'react'
import { Button, Flash, Stack, Text } from '@kit'
import { renderFailureDetail, renderFailureTexts } from '@rn/core/renderFailure'

interface Props {
  children: React.ReactNode
  /** A new key (a new answer for the view) tries again on its own. */
  resetKey?: unknown
  /** One component inside a screen: a compact note in its place. */
  compact?: boolean
}

interface State { error: unknown; resetKey: unknown }

/**
 * A render failure stays where it happened: the screen (or the one component) shows "This part
 * could not be shown" + Try again, in the page's language (the RN core's texts), and the rest of
 * the app keeps working. Without it one component's exception unmounted the whole React tree.
 */
export class RenderBoundary extends React.Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error: error ?? new Error('render failed') }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[Mateu] render failure', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    const texts = renderFailureTexts(document.documentElement.lang)
    const retry = <Button size="small" onClick={() => this.setState({ error: null })}>{texts.retry}</Button>
    if (this.props.compact) {
      return (
        <Flash variant="warning" role="alert">
          <Stack direction="horizontal" align="center" justify="space-between" wrap="wrap" gap="condensed">
            <Text size="small">{texts.title}</Text>
            {retry}
          </Stack>
        </Flash>
      )
    }
    return (
      <Flash variant="danger" role="alert">
        <Stack gap="condensed">
          <Text weight="semibold">{texts.title}</Text>
          <Text>{texts.detail}</Text>
          {import.meta.env.DEV && <Text size="small" style={{ fontFamily: 'var(--fontStack-monospace)' }}>{renderFailureDetail(this.state.error)}</Text>}
          <div>{retry}</div>
        </Stack>
      </Flash>
    )
  }
}
