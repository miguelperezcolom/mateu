import React, { useEffect, useState } from 'react'
import { Button, Heading, Link, Text } from '@kit'
import { StarFillIcon, StarIcon } from '@kit/icons'
import { Markdown } from '@mr/render/Markdown'
import type { CatalogueProps } from '../types'
import { list, MateuAvatar, safeHref, str, useRun, useText, WireIcon } from './shared'
import { tx } from '@mr/i18n/texts'

/** FeatureGrid: a grid of feature cards (icon, title, text); a card with an action is a button. */
export function FeatureGrid({ metadata, state, data }: CatalogueProps) {
  const text = useText(state, data)
  const run = useRun()
  const columns = Number(metadata['columns'] ?? 0)
  return (
    <div className="mateu-feature-grid" style={{ gridTemplateColumns: columns > 0 ? `repeat(${columns}, minmax(0, 1fr))` : undefined }}>
      {list(metadata['features']).map((f, i) => {
        const body = (
          <>
            {f['icon'] ? <span className="mateu-feature-grid__icon"><WireIcon token={f['icon']} size={24} /></span> : null}
            <Heading as="h3" className="mateu-feature-grid__title">{text(f['title'])}</Heading>
            {f['description'] ? <Text as="p" className="mateu-muted">{text(f['description'])}</Text> : null}
          </>
        )
        return f['actionId']
          ? <button key={i} type="button" className="mateu-card mateu-card--action" onClick={() => run(f['actionId'])}>{body}</button>
          : <div key={i} className="mateu-card">{body}</div>
      })}
    </div>
  )
}

/** Testimonials: quote cards — the rating as stars, the author with their avatar and role. */
export function Testimonials({ metadata, state, data }: CatalogueProps) {
  const text = useText(state, data)
  return (
    <div className="mateu-feature-grid">
      {list(metadata['items']).map((t, i) => {
        const rating = Math.max(0, Math.min(5, Number(t['rating'] ?? 0) || 0))
        return (
          <figure key={i} className="mateu-card mateu-testimonial">
            {rating > 0 && (
              <div className="mateu-testimonial__stars" role="img" aria-label={`${rating} out of 5`}>
                {Array.from({ length: 5 }, (_, s) => (s < rating ? <StarFillIcon key={s} /> : <StarIcon key={s} />))}
              </div>
            )}
            <blockquote>“{text(t['quote'])}”</blockquote>
            <figcaption>
              <MateuAvatar name={str(t['author'])} image={t['avatar']} size={32} />
              <span>
                <Text as="div" weight="semibold">{text(t['author'])}</Text>
                {t['role'] ? <Text as="div" size="small" className="mateu-muted">{text(t['role'])}</Text> : null}
              </span>
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}

/** Faq: question / answer disclosures (the answer is markdown), the declared ones open. */
export function Faq({ metadata, state, data }: CatalogueProps) {
  const text = useText(state, data)
  return (
    <div className="mateu-faq">
      {list(metadata['items']).map((q, i) => (
        <details key={i} className="mateu-faq__item" open={q['open'] === true}>
          <summary>{text(q['question'])}</summary>
          <div className="mateu-faq__answer"><Markdown source={text(q['answer'])} /></div>
        </details>
      ))}
    </div>
  )
}

const readCookie = (name: string): string | undefined => {
  try {
    return document.cookie.split('; ').find((c) => c.startsWith(name + '='))?.slice(name.length + 1)
  } catch {
    return undefined
  }
}

/**
 * CookieConsent: the floating notice at its declared edge, until dismissed — remembered in the
 * named cookie with the value the web renderer's library writes (`dismiss`), so either renderer
 * honours the other's answer.
 */
export function CookieConsent({ metadata }: CatalogueProps) {
  const name = (str(metadata['cookieName']) || 'mateu-cookieconsent').replace(/[^A-Za-z0-9._-]/g, '_')
  const [dismissed, setDismissed] = useState(true)
  useEffect(() => setDismissed(readCookie(name) === 'dismiss'), [name])
  if (dismissed) return null
  const position = str(metadata['position']) || 'Bottom' // i18n-ok: a wire value
  const link = safeHref(metadata['learnMoreLink'])
  const dismiss = () => {
    try {
      document.cookie = `${name}=dismiss; max-age=${365 * 24 * 3600}; path=/; SameSite=Lax`
    } catch { /* cookies blocked: dismissed for this page only */ }
    setDismissed(true)
  }
  return (
    <div className={`mateu-cookie-consent mateu-cookie-consent--${position.toLowerCase()}`} role="alert">
      <Text as="p">
        {str(metadata['message']) || tx('cookiesMessage')}{' '}
        {link && <Link href={link} target="_blank" rel="noopener noreferrer nofollow">{str(metadata['learnMore']) || tx('learnMore')}</Link>}
      </Text>
      <Button variant="primary" size="small" onClick={dismiss}>{str(metadata['dismiss']) || tx('gotIt')}</Button>
    </div>
  )
}
