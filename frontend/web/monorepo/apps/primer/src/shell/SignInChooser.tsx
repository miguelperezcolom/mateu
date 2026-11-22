import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { BaseStyles, Button, Flash, Heading, Stack, Text } from '@primer/react'
import { KeyIcon } from '@primer/octicons-react'
import type { ChooserOptions } from '@infra/auth/signInFlow.ts'
import { signInGlyph, type SignInProvider } from '@infra/auth/signInConfig.ts'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import { trapFocus } from '@infra/a11y/focusTrap.ts'
import { announceLive } from '@rn/a11y/a11y'
import { ThemedRoot } from './header/theme'
import './signIn.css'

/**
 * The sign-in chooser in Primer's grammar — GitHub's sign-in card: a centred panel on the canvas,
 * one full-width button per provider. It stands in for libs/mateu's `mateu-sign-in` (vite aliases
 * that module here), so the built-in flows are the web renderer's and only the look is Primer's.
 * A labelled modal dialog: the focus starts on the first provider and stays inside; Esc declines
 * when the user may (after a 401), never at boot.
 */
function Chooser({ options, done }: { options: ChooserOptions; done: (p: SignInProvider | null) => void }) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = panel.current
    if (!el) return undefined
    const trap = trapFocus(el, { initialFocus: () => el.querySelector('button[data-provider]') as HTMLElement | null })
    if (options.message) announceLive(options.message, true)
    return () => trap.release()
  }, [options.message])
  return (
    <div className="mateu-sign-in" data-mateu-sign-in="" onKeyDown={(e) => { if (e.key === 'Escape' && options.cancellable) { e.preventDefault(); done(null) } }}>
      <div ref={panel} className="mateu-sign-in-panel" role="dialog" aria-modal="true" aria-labelledby="mateu-sign-in-title">
        <Stack gap="normal">
          <Heading as="h1" id="mateu-sign-in-title" variant="medium">{chromeText('signInTitle')}</Heading>
          {options.message
            ? <Flash variant="danger" role="alert">{options.message}</Flash>
            : <Text as="p" className="mateu-sign-in-hint">{chromeText(options.providers.length > 1 ? 'signInChoose' : 'signInHint')}</Text>}
          <Stack gap="condensed">
            {options.providers.map((p) => {
              const initial = signInGlyph(p)
              return (
                <Button key={p.id} data-provider={p.id} block alignContent="start"
                  leadingVisual={initial ? () => <span className="mateu-sign-in-glyph" aria-hidden="true">{initial}</span> : KeyIcon}
                  onClick={() => done(p)}>
                  {chromeTextf('signInWith', { provider: p.label })}
                </Button>
              )
            })}
          </Stack>
          {options.cancellable && <Button variant="invisible" onClick={() => done(null)}>{chromeText('cancel')}</Button>}
        </Stack>
      </div>
    </div>
  )
}

/** libs/mateu's chooser contract: shows it over the page; resolves with the provider, or null when declined. */
export const showSignInChooser = (options: ChooserOptions): Promise<SignInProvider | null> =>
  new Promise((resolve) => {
    document.querySelectorAll('[data-mateu-sign-in-host]').forEach((el) => el.remove())
    const host = document.body.appendChild(document.createElement('div'))
    host.setAttribute('data-mateu-sign-in-host', '')
    const root = createRoot(host)
    const done = (p: SignInProvider | null) => {
      root.unmount()
      host.remove()
      resolve(p)
    }
    root.render(<ThemedRoot><BaseStyles><Chooser options={options} done={done} /></BaseStyles></ThemedRoot>)
  })
