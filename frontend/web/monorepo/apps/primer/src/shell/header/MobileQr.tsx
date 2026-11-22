import React, { useState } from 'react'
import { Button, Dialog, FormControl, Stack, Text, TextInput } from '@primer/react'
import { CopyIcon } from '@primer/octicons-react'
import { qrDataUri } from '@infra/ui/qr/qrEncoder.ts'
import { currentRoute, mobileAddUrl } from '@infra/ui/qr/mobileLink.ts'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import { announceLive } from '@rn/a11y/a11y'

/**
 * "Open on mobile" (@App(mobileQr)): the QR that adds this UI — at the screen on view — to the
 * Mateu mobile app (https://mateu.io/add?u=…&r=…, the web renderer's link), with the link to copy.
 * On a phone it is a plain "Open in the Mateu app" link. A chunk of its own: loaded on the first click.
 */
export default function MobileQrDialog({ appTitle, baseUrl, onClose }: { appTitle: string; baseUrl: string; onClose: () => void }) {
  const url = mobileAddUrl(window.location.origin, baseUrl, currentRoute(window.location.pathname, window.location.search, baseUrl))
  const phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const [copied, setCopied] = useState(false)
  const copy = () => void navigator.clipboard?.writeText(url).then(() => { setCopied(true); announceLive(chromeText('linkCopied'), false) })
  const app = appTitle || 'Mateu' // i18n-ok: the product name
  return (
    <Dialog title={chromeTextf(phone ? 'mobileQrPhoneTitle' : 'mobileQrTitle', { app })} onClose={onClose} width="medium">
      {phone ? (
        <Stack gap="normal">
          <Text as="p">{chromeText('mobileQrOnPhone')}</Text>
          <Button as="a" href={url} variant="primary">{chromeText('openInMateuApp')}</Button>
        </Stack>
      ) : (
        <Stack gap="normal" align="center">
          <img className="mateu-mobile-qr" src={qrDataUri(url)} alt={chromeTextf('mobileQrAlt', { app })} width={220} height={220} />
          <Text as="p" className="mateu-header-muted">{chromeText('mobileQrHint')}</Text>
          <FormControl style={{ width: '100%' }}>
            <FormControl.Label>{chromeText('mobileQrUrl')}</FormControl.Label>
            <Stack direction="horizontal" gap="condensed" style={{ width: '100%' }}>
              <TextInput value={url} readOnly block onFocus={(e) => e.target.select()} />
              <Button leadingVisual={CopyIcon} onClick={copy}>{copied ? chromeText('linkCopied') : chromeText('copyLink')}</Button>
            </Stack>
          </FormControl>
        </Stack>
      )}
    </Dialog>
  )
}
